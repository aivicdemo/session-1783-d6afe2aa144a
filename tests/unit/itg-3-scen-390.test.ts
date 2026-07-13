import { aggregateMonthlyCostReduction } from '../../src/logic/it-1-br-3-2-1';

describe('月次食費削減効果集計機能', () => {
  // SCEN-390
  test('購入記録から月次食費実績・予算比削減率・食材別コスト・満足度スコアが自動集計される', () => {
    // テストデータ: 2024年1月の複数購入記録
    const purchase_records = [
      {
        purchase_id: 'P001',
        purchase_date: '2024-01-05T10:30:00Z',
        food_category: '野菜',
        unit_price: 150,
        quantity: 2,
        total_amount: 300,
        satisfaction_score: 85,
      },
      {
        purchase_id: 'P002',
        purchase_date: '2024-01-10T14:15:00Z',
        food_category: '肉類',
        unit_price: 800,
        quantity: 1,
        total_amount: 800,
        satisfaction_score: 90,
      },
      {
        purchase_id: 'P003',
        purchase_date: '2024-01-15T09:00:00Z',
        food_category: '野菜',
        unit_price: 200,
        quantity: 1,
        total_amount: 200,
        satisfaction_score: 75,
      },
      {
        purchase_id: 'P004',
        purchase_date: '2024-01-20T16:45:00Z',
        food_category: '乳製品',
        unit_price: 400,
        quantity: 2,
        total_amount: 800,
        satisfaction_score: 88,
      },
    ];

    // テストデータ: 月次食費予算
    const monthly_budget = 3000;

    // 関数実行
    const result = aggregateMonthlyCostReduction({
      purchase_records,
      monthly_budget,
      target_month: '2024-01',
    });

    // (1) 月次食費実績が購入記録の合計金額と一致することを確認
    const expected_total_amount = 300 + 800 + 200 + 800; // 2100
    expect(result.monthly_expense_total).toBe(expected_total_amount);

    // (2) 予算比削減率が（予算 - 実績）/ 予算 × 100で正しく算出されていることを確認
    const expected_budget_reduction_rate = ((3000 - 2100) / 3000) * 100; // 30
    expect(result.budget_reduction_rate).toBe(expected_budget_reduction_rate);

    // (3) 食材別コストがカテゴリ毎に正確に集計されていることを確認
    const expected_cost_by_category = {
      野菜: 500,
      肉類: 800,
      乳製品: 800,
    };
    expect(result.cost_by_category).toEqual(expected_cost_by_category);

    // (4) 満足度スコアが登録記録から適切に平均化されることを確認
    const expected_satisfaction_score_avg = (85 + 90 + 75 + 88) / 4; // 84.5
    expect(result.average_satisfaction_score).toBe(expected_satisfaction_score_avg);

    // (5) 対象月の指定が正確に機能することを確認
    expect(result.aggregation_month).toBe('2024-01');

    // (6) 複数ヶ月のデータが存在する場合、指定された月次データのみが集計対象となることを確認
    const multi_month_records = [
      ...purchase_records,
      {
        purchase_id: 'P005',
        purchase_date: '2024-02-05T10:30:00Z',
        food_category: '野菜',
        unit_price: 150,
        quantity: 3,
        total_amount: 450,
        satisfaction_score: 80,
      },
    ];

    const result_filtered = aggregateMonthlyCostReduction({
      purchase_records: multi_month_records,
      monthly_budget: 3000,
      target_month: '2024-01',
    });

    // 2月のデータは含まれないことを確認
    expect(result_filtered.monthly_expense_total).toBe(expected_total_amount);
    expect(result_filtered.average_satisfaction_score).toBe(expected_satisfaction_score_avg);

    // (7) 購入記録がない月について、集計結果が適切に処理される（ゼロまたはデフォルト値）ことを確認
    const empty_month_result = aggregateMonthlyCostReduction({
      purchase_records: [],
      monthly_budget: 3000,
      target_month: '2024-03',
    });

    expect(empty_month_result.monthly_expense_total).toBe(0);
    expect(empty_month_result.budget_reduction_rate).toBe(100); // (3000 - 0) / 3000 * 100
    expect(empty_month_result.cost_by_category).toEqual({});
    expect(empty_month_result.average_satisfaction_score).toBe(0);
    expect(empty_month_result.aggregation_month).toBe('2024-03');
  });
});