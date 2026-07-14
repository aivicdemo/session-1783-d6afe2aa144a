import { describe, test, expect } from '@jest/globals';
import { analyzeMonthlyFoodCostExcess } from '../../src/logic/it-7-2-1';

describe('月次食費超過要因分析 - 購入単価変動データ欠落時の部分的分解', () => {
  // SCEN-570
  test('購入単価変動データが欠落している場合、部分的な分解結果が返却される', () => {
    const inputDataset = {
      month: '2024-01',
      budget_limit: 50000,
      actual_total: 56000,
      food_composition: [
        {
          category: '野菜',
          planned_quantity: 10,
          actual_quantity: 12,
          unit_price: 150,
        },
        {
          category: '肉類',
          planned_quantity: 5,
          actual_quantity: 5,
          // unit_price は欠落
        },
        {
          category: '調味料',
          planned_quantity: 3,
          actual_quantity: 3,
          unit_price: 500,
        },
      ],
    };

    const result = analyzeMonthlyFoodCostExcess(inputDataset);

    // 戻り値は部分的な分解結果を含むオブジェクト
    expect(result).toBeDefined();
    expect(result).toHaveProperty('is_partial', true);
    expect(result).toHaveProperty('analyzed_items');
    expect(result).toHaveProperty('missing_data_info');

    // 分析対象となった項目は 2 件（野菜、調味料）
    expect(result.analyzed_items).toHaveLength(2);
    expect(result.analyzed_items[0]).toEqual({
      category: '野菜',
      planned_cost: 1500,
      actual_cost: 1800,
      excess_amount: 300,
    });
    expect(result.analyzed_items[1]).toEqual({
      category: '調味料',
      planned_cost: 1500,
      actual_cost: 1500,
      excess_amount: 0,
    });

    // 欠落したデータの情報が明示される
    expect(result.missing_data_info).toHaveLength(1);
    expect(result.missing_data_info[0]).toEqual({
      category: '肉類',
      reason: 'unit_price',
    });

    // 部分的な分解結果であることが明示される
    expect(result.is_partial).toBe(true);
    expect(result.total_analyzed_excess).toBe(300);
    expect(result.decomposition_coverage_percent).toBe(66.67);
  });
});