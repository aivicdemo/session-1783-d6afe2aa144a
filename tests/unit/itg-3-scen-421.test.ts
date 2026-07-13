import { analyzeMonthlyCostOptimization } from '../../src/logic/it-1-br-3-2-1';

describe('月次食費最適化分析機能', () => {
  // SCEN-421
  test('月次食費が予算以下の場合、適正と判定され削減目標が未生成される', () => {
    const user_id = 'user-001';
    const month = '2024-01';
    const monthly_budget = 50000;
    const total_food_cost = 45000;
    const cost_details = [
      {
        category: '野菜',
        amount: 15000,
        item_count: 25
      },
      {
        category: '肉・魚',
        amount: 20000,
        item_count: 15
      },
      {
        category: '乳製品・卵',
        amount: 10000,
        item_count: 12
      }
    ];

    const result = analyzeMonthlyCostOptimization({
      user_id,
      month,
      monthly_budget,
      total_food_cost,
      cost_details
    });

    expect(result.judgment_status).toBe('適正');
    expect(result.is_within_budget).toBe(true);
    expect(result.budget_remaining).toBe(5000);
    expect(result.reduction_targets_generated).toBe(false);
    expect(result.reduction_targets).toEqual([]);
    expect(result.message).toMatch(/予算内/);
    expect(result.cost_analysis).toEqual({
      category: '野菜',
      amount: 15000,
      percentage: 33.33,
      item_count: 25
    });
    expect(result.cost_analysis_all).toHaveLength(3);
    expect(result.cost_analysis_all[0]).toEqual({
      category: '野菜',
      amount: 15000,
      percentage: 33.33,
      item_count: 25
    });
    expect(result.cost_analysis_all[1]).toEqual({
      category: '肉・魚',
      amount: 20000,
      percentage: 44.44,
      item_count: 15
    });
    expect(result.cost_analysis_all[2]).toEqual({
      category: '乳製品・卵',
      amount: 10000,
      percentage: 22.23,
      item_count: 12
    });
    expect(result.analysis_date).toBe('2024-01-31');
    expect(result.next_action).toBe('none');
  });
});