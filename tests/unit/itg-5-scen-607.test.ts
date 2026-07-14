import { aggregateMonthlyCostData } from '../../src/logic/it-7-2-1';

describe('献立生成アルゴリズムの週次集計・改善効果比較ダッシュボード', () => {
  // SCEN-607
  test('月末日に到達した際、月次食費実績額・予算比削減率・食材別コスト分析・満足度スコアが正しく自動集計される', () => {
    // 前提: 月初日から月末日までの食費データが登録済み
    const monthly_budget_yen = 50000;
    const current_month_start = new Date('2024-01-01');
    const current_month_end = new Date('2024-01-31');

    const purchase_records = [
      {
        purchase_id: 'p001',
        purchase_date: '2024-01-05',
        amount_yen: 3500,
        food_category: '野菜',
        satisfaction_score: 4.5,
      },
      {
        purchase_id: 'p002',
        purchase_date: '2024-01-10',
        amount_yen: 2800,
        food_category: '肉類',
        satisfaction_score: 4.2,
      },
      {
        purchase_id: 'p003',
        purchase_date: '2024-01-15',
        amount_yen: 4200,
        food_category: '野菜',
        satisfaction_score: 4.8,
      },
      {
        purchase_id: 'p004',
        purchase_date: '2024-01-20',
        amount_yen: 3900,
        food_category: '穀類',
        satisfaction_score: 4.0,
      },
      {
        purchase_id: 'p005',
        purchase_date: '2024-01-25',
        amount_yen: 5600,
        food_category: '肉類',
        satisfaction_score: 4.6,
      },
      {
        purchase_id: 'p006',
        purchase_date: '2024-01-31',
        amount_yen: 2100,
        food_category: '穀類',
        satisfaction_score: 3.9,
      },
    ];

    // 月末日（2024年1月31日）の自動集計処理をトリガー
    const result = aggregateMonthlyCostData({
      budget_yen: monthly_budget_yen,
      period_start: current_month_start.toISOString(),
      period_end: current_month_end.toISOString(),
      purchases: purchase_records,
    });

    // 期待値計算
    // 実績額の合計: 3500 + 2800 + 4200 + 3900 + 5600 + 2100 = 22100 円
    const expected_total_cost = 22100;
    expect(result.total_cost_yen).toBe(expected_total_cost);

    // 予算比削減率: (予算 - 実績) / 予算 * 100 = (50000 - 22100) / 50000 * 100 = 55.8%
    const expected_budget_reduction_rate = 55.8;
    expect(result.budget_reduction_rate_percent).toBeCloseTo(
      expected_budget_reduction_rate,
      1
    );

    // 食材別コスト分析
    // 野菜: 3500 + 4200 = 7700 円 (34.8%)
    // 肉類: 2800 + 5600 = 8400 円 (37.9%)
    // 穀類: 3900 + 2100 = 6000 円 (27.1%)
    const expected_category_breakdown = {
      野菜: {
        total_yen: 7700,
        percentage: parseFloat((7700 / 22100 * 100).toFixed(1)),
      },
      肉類: {
        total_yen: 8400,
        percentage: parseFloat((8400 / 22100 * 100).toFixed(1)),
      },
      穀類: {
        total_yen: 6000,
        percentage: parseFloat((6000 / 22100 * 100).toFixed(1)),
      },
    };

    expect(result.category_breakdown).toEqual(expected_category_breakdown);

    // 満足度スコアの平均値: (4.5 + 4.2 + 4.8 + 4.0 + 4.6 + 3.9) / 6 = 26.0 / 6 = 4.33
    const expected_avg_satisfaction = parseFloat((26.0 / 6).toFixed(2));
    expect(result.average_satisfaction_score).toBeCloseTo(
      expected_avg_satisfaction,
      2
    );

    // 食材別満足度分布
    // 野菜: (4.5 + 4.8) / 2 = 4.65
    // 肉類: (4.2 + 4.6) / 2 = 4.4
    // 穀類: (4.0 + 3.9) / 2 = 3.95
    const expected_category_satisfaction = {
      野菜: parseFloat(((4.5 + 4.8) / 2).toFixed(2)),
      肉類: parseFloat(((4.2 + 4.6) / 2).toFixed(2)),
      穀類: parseFloat(((4.0 + 3.9) / 2).toFixed(2)),
    };

    expect(result.category_satisfaction_distribution).toEqual(
      expected_category_satisfaction
    );

    // 次月の優先条件提案の存在を確認
    expect(result.next_month_recommendations).toBeDefined();
    expect(Array.isArray(result.next_month_recommendations)).toBe(true);
    expect(result.next_month_recommendations.length).toBeGreaterThan(0);

    // 次月の優先条件提案は満足度スコアと予算削減率に基づいて生成される
    // 例: 高満足度・低コストの食材（野菜：4.65点）を次月優先
    const high_satisfaction_category = result.next_month_recommendations.find(
      (rec: any) => rec.priority === 'high'
    );
    expect(high_satisfaction_category).toBeDefined();
    expect(high_satisfaction_category?.food_category).toBe('野菜');

    // 予算超過は検出されず、削減率は正の値
    expect(result.budget_reduction_rate_percent).toBeGreaterThan(0);

    // 集計結果にはタイムスタンプが含まれる
    expect(result.aggregation_timestamp).toBeDefined();
    expect(new Date(result.aggregation_timestamp)).toEqual(current_month_end);
  });
});