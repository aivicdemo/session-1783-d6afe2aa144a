import { determineForecastImprovementNeeded } from '../../src/logic/it-2-br-6-3-2';

describe('Forecast Improvement Determination Logic', () => {
  // SCEN-231: [normal] 需要予測精度改善判定機能 - 予測値と実績値の乖離が閾値超過の場合、改善実施と優先度が判定される
  test('should determine improvement necessity and priority level when deviation exceeds threshold', () => {
    // Setup: 需要予測・在庫最適化システムにログインしたユーザーのコンテキスト
    const forecast_data_set_id = 'FDS-2024-01-001';
    const product_category = 'vegetable';
    const forecast_period_start = new Date('2024-01-01T00:00:00Z');
    const forecast_period_end = new Date('2024-01-31T23:59:59Z');

    // Step 1: 過去の需要予測データと実績値データを準備する
    const predicted_demand = 1000; // 予測需要量: 1000 単位
    const actual_demand = 850; // 実績需要量: 850 単位
    const deviation_rate = ((predicted_demand - actual_demand) / predicted_demand) * 100; // (1000-850)/1000*100 = 15%

    // Step 2: 予測値と実績値の乖離率を計算し、システムに設定された閾値を超過するデータセットを入力する
    const system_deviation_threshold = 10; // システムに設定された閾値: 10%
    const deviation_exceeds_threshold = deviation_rate > system_deviation_threshold; // 15% > 10% = true

    // Input: 改善判定機能への入力データ
    const improvement_assessment_input = {
      forecast_data_set_id,
      product_category,
      forecast_period_start,
      forecast_period_end,
      predicted_demand,
      actual_demand,
      deviation_threshold_percent: system_deviation_threshold,
    };

    // Step 3: 改善判定機能を実行する
    const result = determineForecastImprovementNeeded(improvement_assessment_input);

    // Step 4: 改善実施の判定結果を確認する
    expect(result.improvement_required).toBe(true);
    expect(result.deviation_rate_percent).toBe(15);

    // Step 5: 改善の優先度レベル（高・中・低など）が自動的に割り当てられているか確認する
    // 乖離率 15% の場合、中程度の乖離 → 優先度 "medium"
    expect(result.priority_level).toBe('medium');

    // Step 6: 複数の乖離パターン（軽微な超過、大幅な超過など）でも同じロジックで判定されることを検証する
    // パターン A: 軽微な超過 (11%)
    const light_excess_input = {
      forecast_data_set_id: 'FDS-2024-02-001',
      product_category: 'fruit',
      forecast_period_start: new Date('2024-02-01T00:00:00Z'),
      forecast_period_end: new Date('2024-02-29T23:59:59Z'),
      predicted_demand: 1000,
      actual_demand: 890, // 11% deviation
      deviation_threshold_percent: 10,
    };
    const light_excess_result = determineForecastImprovementNeeded(light_excess_input);
    expect(light_excess_result.improvement_required).toBe(true);
    expect(light_excess_result.deviation_rate_percent).toBe(11);
    expect(light_excess_result.priority_level).toBe('low');

    // パターン B: 大幅な超過 (35%)
    const major_excess_input = {
      forecast_data_set_id: 'FDS-2024-03-001',
      product_category: 'grain',
      forecast_period_start: new Date('2024-03-01T00:00:00Z'),
      forecast_period_end: new Date('2024-03-31T23:59:59Z'),
      predicted_demand: 1000,
      actual_demand: 650, // 35% deviation
      deviation_threshold_percent: 10,
    };
    const major_excess_result = determineForecastImprovementNeeded(major_excess_input);
    expect(major_excess_result.improvement_required).toBe(true);
    expect(major_excess_result.deviation_rate_percent).toBe(35);
    expect(major_excess_result.priority_level).toBe('high');

    // パターン C: 閾値以下（改善不要）
    const threshold_not_exceeded_input = {
      forecast_data_set_id: 'FDS-2024-04-001',
      product_category: 'dairy',
      forecast_period_start: new Date('2024-04-01T00:00:00Z'),
      forecast_period_end: new Date('2024-04-30T23:59:59Z'),
      predicted_demand: 1000,
      actual_demand: 950, // 5% deviation
      deviation_threshold_percent: 10,
    };
    const threshold_not_exceeded_result = determineForecastImprovementNeeded(
      threshold_not_exceeded_input
    );
    expect(threshold_not_exceeded_result.improvement_required).toBe(false);
    expect(threshold_not_exceeded_result.deviation_rate_percent).toBe(5);
    expect(threshold_not_exceeded_result.priority_level).toBeNull();

    // Step 7: 判定結果がシステムに保存され、後続の改善プロセスに連携されることを確認する
    // 主要な判定結果の整合性確認
    expect(result).toHaveProperty('forecast_data_set_id');
    expect(result).toHaveProperty('improvement_required');
    expect(result).toHaveProperty('deviation_rate_percent');
    expect(result).toHaveProperty('priority_level');
    expect(result).toHaveProperty('assessment_timestamp');
    expect(result.forecast_data_set_id).toBe(forecast_data_set_id);

    // 優先度レベルの値が enum 値の範囲内であることを確認
    const valid_priority_levels = ['high', 'medium', 'low'];
    expect(valid_priority_levels).toContain(result.priority_level);
    expect(valid_priority_levels).toContain(light_excess_result.priority_level);
    expect(valid_priority_levels).toContain(major_excess_result.priority_level);

    // 乖離率が正確に計算されていることを再確認
    expect(result.deviation_rate_percent).toBeCloseTo(15, 2);
    expect(light_excess_result.deviation_rate_percent).toBeCloseTo(11, 2);
    expect(major_excess_result.deviation_rate_percent).toBeCloseTo(35, 2);
    expect(threshold_not_exceeded_result.deviation_rate_percent).toBeCloseTo(5, 2);
  });
});