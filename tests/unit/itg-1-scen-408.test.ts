import { aggregateMonthlyCostData } from '../../src/logic/it-3';

const fetchMock = require('jest-fetch-mock');

describe('食事評価データを献立生成ロジックに反映させる機能', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  // SCEN-408
  test('月次食費集計・提案機能 - 食費実績がNULLまたは無効な値の場合、集計処理でエラーを検出する', async () => {
    const userId = 'user_001';
    const yearMonth = '2024-01';

    // ============================================
    // ケース1: 食費実績データが NULL の場合
    // ============================================
    fetchMock.mockResponseOnce(JSON.stringify({ expense_data: null }), {
      status: 200,
    });

    const nullExpenseResult = aggregateMonthlyCostData({
      user_id: userId,
      year_month: yearMonth,
    });

    expect(nullExpenseResult).toHaveProperty('error');
    expect(nullExpenseResult.error).toMatch(/食費実績/);
    expect(nullExpenseResult).toHaveProperty('suggestion_executed', false);
    expect(nullExpenseResult).toHaveProperty('error_log');
    expect(nullExpenseResult.error_log).toMatch(/NULL|無効/);

    // ============================================
    // ケース2: 食費実績データが負数の場合
    // ============================================
    fetchMock.mockResponseOnce(
      JSON.stringify({
        expense_data: [
          {
            date: '2024-01-05',
            amount: -1500,
            category: '食材',
          },
        ],
      }),
      { status: 200 }
    );

    const negativeExpenseResult = aggregateMonthlyCostData({
      user_id: userId,
      year_month: yearMonth,
    });

    expect(negativeExpenseResult).toHaveProperty('error');
    expect(negativeExpenseResult.error).toMatch(/金額/);
    expect(negativeExpenseResult).toHaveProperty('suggestion_executed', false);

    // ============================================
    // ケース3: 食費実績データが文字列の場合
    // ============================================
    fetchMock.mockResponseOnce(
      JSON.stringify({
        expense_data: 'invalid_string_data',
      }),
      { status: 200 }
    );

    const stringExpenseResult = aggregateMonthlyCostData({
      user_id: userId,
      year_month: yearMonth,
    });

    expect(stringExpenseResult).toHaveProperty('error');
    expect(stringExpenseResult.error).toMatch(/形式/);
    expect(stringExpenseResult).toHaveProperty('suggestion_executed', false);

    // ============================================
    // ケース4: 食費実績データがオブジェクト（不正な構造）の場合
    // ============================================
    fetchMock.mockResponseOnce(
      JSON.stringify({
        expense_data: { invalid: 'structure' },
      }),
      { status: 200 }
    );

    const invalidStructureResult = aggregateMonthlyCostData({
      user_id: userId,
      year_month: yearMonth,
    });

    expect(invalidStructureResult).toHaveProperty('error');
    expect(invalidStructureResult.error).toMatch(/データ構造/);
    expect(invalidStructureResult).toHaveProperty('suggestion_executed', false);

    // ============================================
    // ケース5: 正常なデータの場合（エラーが発生しないことを確認）
    // ============================================
    const validExpenseData = [
      { date: '2024-01-05', amount: 1500, category: '食材' },
      { date: '2024-01-10', amount: 2000, category: '食材' },
      { date: '2024-01-15', amount: 1200, category: '食材' },
    ];

    fetchMock.mockResponseOnce(
      JSON.stringify({
        expense_data: validExpenseData,
        budget_limit: 5000,
      }),
      { status: 200 }
    );

    const validResult = aggregateMonthlyCostData({
      user_id: userId,
      year_month: yearMonth,
    });

    expect(validResult).not.toHaveProperty('error');
    expect(validResult).toHaveProperty('total_amount', 4700);
    expect(validResult).toHaveProperty('budget_limit', 5000);
    expect(validResult).toHaveProperty('excess_amount', 0);
    expect(validResult).toHaveProperty('excess_percentage', 0);
    expect(validResult).toHaveProperty('suggestion_executed', true);
    expect(validResult).toHaveProperty('category_breakdown');
    expect(validResult.category_breakdown).toEqual({
      食材: 4700,
    });

    // ============================================
    // ケース6: 食費実績が予算超過した場合
    // ============================================
    const overBudgetExpenseData = [
      { date: '2024-01-05', amount: 3000, category: '食材' },
      { date: '2024-01-10', amount: 2500, category: '食材' },
    ];

    fetchMock.mockResponseOnce(
      JSON.stringify({
        expense_data: overBudgetExpenseData,
        budget_limit: 5000,
      }),
      { status: 200 }
    );

    const overBudgetResult = aggregateMonthlyCostData({
      user_id: userId,
      year_month: yearMonth,
    });

    expect(overBudgetResult).not.toHaveProperty('error');
    expect(overBudgetResult).toHaveProperty('total_amount', 5500);
    expect(overBudgetResult).toHaveProperty('excess_amount', 500);
    expect(overBudgetResult).toHaveProperty('excess_percentage', 10);
    expect(overBudgetResult).toHaveProperty('suggestion_executed', true);
    expect(overBudgetResult).toHaveProperty('suggestions');
    expect(Array.isArray(overBudgetResult.suggestions)).toBe(true);
  });
});