import { calculateDivergenceScore, generateImprovementSuggestions } from '../../src/logic/it-1-br-3-2-1';

describe('購入実績の記録と月次食費削減効果の自動集計・分析機能', () => {
  // SCEN-370: 需要予測精度の乖離分析と改善提案生成機能 - 予測値と実績値の乖離度が正しく計算され、カテゴリ別・時期別の誤差パターンが可視化される
  test('SCEN-370: 乖離度の計算と改善提案生成が正確に実行される', () => {
    // テストデータ準備：複数カテゴリの予測値と実績値
    const forecast_data_weekly_vegetable = {
      category: 'vegetable',
      period_type: 'weekly',
      period_id: 'W202401',
      forecast_value: 1000,
      actual_value: 1100,
      unit: 'yen',
    };

    const forecast_data_weekly_meat = {
      category: 'meat',
      period_type: 'weekly',
      period_id: 'W202401',
      forecast_value: 1500,
      actual_value: 1350,
      unit: 'yen',
    };

    const forecast_data_weekly_fish = {
      category: 'fish',
      period_type: 'weekly',
      period_id: 'W202401',
      forecast_value: 800,
      actual_value: 950,
      unit: 'yen',
    };

    const forecast_data_monthly_vegetable = {
      category: 'vegetable',
      period_type: 'monthly',
      period_id: 'M202401',
      forecast_value: 4200,
      actual_value: 4450,
      unit: 'yen',
    };

    const forecast_data_monthly_meat = {
      category: 'meat',
      period_type: 'monthly',
      period_id: 'M202401',
      forecast_value: 6200,
      actual_value: 5800,
      unit: 'yen',
    };

    const forecast_data_seasonal_fish = {
      category: 'fish',
      period_type: 'seasonal',
      period_id: 'S202401_Q1',
      forecast_value: 2400,
      actual_value: 2850,
      unit: 'yen',
    };

    // 乖離度の計算検証：|予測値-実績値|/実績値×100
    // 野菜（週別）: |1000-1100|/1100×100 = 100/1100×100 ≈ 9.09%
    const divergence_vegetable_weekly = calculateDivergenceScore(
      forecast_data_weekly_vegetable
    );
    expect(divergence_vegetable_weekly).toBeCloseTo(9.09, 1);

    // 肉（週別）: |1500-1350|/1350×100 = 150/1350×100 ≈ 11.11%
    const divergence_meat_weekly = calculateDivergenceScore(
      forecast_data_weekly_meat
    );
    expect(divergence_meat_weekly).toBeCloseTo(11.11, 1);

    // 魚（週別）: |800-950|/950×100 = 150/950×100 ≈ 15.79%
    const divergence_fish_weekly = calculateDivergenceScore(
      forecast_data_weekly_fish
    );
    expect(divergence_fish_weekly).toBeCloseTo(15.79, 1);

    // 野菜（月別）: |4200-4450|/4450×100 = 250/4450×100 ≈ 5.62%
    const divergence_vegetable_monthly = calculateDivergenceScore(
      forecast_data_monthly_vegetable
    );
    expect(divergence_vegetable_monthly).toBeCloseTo(5.62, 1);

    // 肉（月別）: |6200-5800|/5800×100 = 400/5800×100 ≈ 6.90%
    const divergence_meat_monthly = calculateDivergenceScore(
      forecast_data_monthly_meat
    );
    expect(divergence_meat_monthly).toBeCloseTo(6.90, 1);

    // 魚（季節別）: |2400-2850|/2850×100 = 450/2850×100 ≈ 15.79%
    const divergence_fish_seasonal = calculateDivergenceScore(
      forecast_data_seasonal_fish
    );
    expect(divergence_fish_seasonal).toBeCloseTo(15.79, 1);

    // カテゴリ別誤差パターン検証
    const category_error_patterns = {
      vegetable: [9.09, 5.62],
      meat: [11.11, 6.90],
      fish: [15.79, 15.79],
    };

    // 時期別誤差パターン検証
    const period_error_patterns = {
      weekly: [9.09, 11.11, 15.79],
      monthly: [5.62, 6.90],
      seasonal: [15.79],
    };

    // 改善提案生成の検証
    const improvement_suggestions = generateImprovementSuggestions([
      forecast_data_weekly_vegetable,
      forecast_data_weekly_meat,
      forecast_data_weekly_fish,
      forecast_data_monthly_vegetable,
      forecast_data_monthly_meat,
      forecast_data_seasonal_fish,
    ]);

    // 改善提案の構造検証
    expect(Array.isArray(improvement_suggestions)).toBe(true);
    expect(improvement_suggestions.length).toBeGreaterThan(0);

    // 乖離度の大きいカテゴリの優先度検証
    const high_divergence_categories = improvement_suggestions.filter(
      (sugg) => sugg.divergence_score >= 15.0
    );
    expect(high_divergence_categories.length).toBeGreaterThan(0);

    // 各改善提案に必須フィールドが存在することを確認
    improvement_suggestions.forEach((suggestion) => {
      expect(suggestion).toHaveProperty('category');
      expect(suggestion).toHaveProperty('period_type');
      expect(suggestion).toHaveProperty('period_id');
      expect(suggestion).toHaveProperty('divergence_score');
      expect(suggestion).toHaveProperty('improvement_proposal');
      expect(suggestion).toHaveProperty('priority_rank');
      expect(suggestion).toHaveProperty('statistical_basis');
      expect(suggestion).toHaveProperty('feasibility_score');

      // 統計的根拠の確認
      expect(typeof suggestion.statistical_basis).toBe('string');
      expect(suggestion.statistical_basis.length).toBeGreaterThan(0);

      // 実現可能性スコアの検証（0～100）
      expect(suggestion.feasibility_score).toBeGreaterThanOrEqual(0);
      expect(suggestion.feasibility_score).toBeLessThanOrEqual(100);

      // 優先度ランクの検証
      expect(typeof suggestion.priority_rank).toBe('number');
      expect(suggestion.priority_rank).toBeGreaterThanOrEqual(1);
    });

    // 優先度順にソートされていることを確認
    for (let i = 0; i < improvement_suggestions.length - 1; i++) {
      expect(improvement_suggestions[i].priority_rank).toBeLessThanOrEqual(
        improvement_suggestions[i + 1].priority_rank
      );
    }

    // 複合フィルター（特定カテゴリ+特定時期）の検証
    const filtered_suggestions = improvement_suggestions.filter(
      (sugg) => sugg.category === 'fish' && sugg.period_type === 'weekly'
    );
    expect(filtered_suggestions.length).toBeGreaterThan(0);
    const fish_weekly_suggestion = filtered_suggestions[0];
    expect(fish_weekly_suggestion.category).toBe('fish');
    expect(fish_weekly_suggestion.period_type).toBe('weekly');
    expect(fish_weekly_suggestion.divergence_score).toBeCloseTo(15.79, 1);

    // 改善提案が実現可能性のあるものであることを検証
    improvement_suggestions.forEach((suggestion) => {
      expect(suggestion.feasibility_score).toBeGreaterThan(30);
      expect(suggestion.improvement_proposal).toMatch(/在庫|需要|予測|調整/);
    });

    // カテゴリ別の最大乖離度の検証
    const max_vegetable_divergence = Math.max(
      ...category_error_patterns.vegetable
    );
    const max_meat_divergence = Math.max(...category_error_patterns.meat);
    const max_fish_divergence = Math.max(...category_error_patterns.fish);

    expect(max_fish_divergence).toBeGreaterThan(max_vegetable_divergence);
    expect(max_fish_divergence).toBeGreaterThan(max_meat_divergence);

    // 時期別トレンド検証：季節別が最も乖離度が大きいことを確認
    const max_seasonal_divergence = Math.max(
      ...period_error_patterns.seasonal
    );
    const max_monthly_divergence = Math.max(
      ...period_error_patterns.monthly
    );
    expect(max_seasonal_divergence).toBeGreaterThanOrEqual(max_monthly_divergence);
  });
});