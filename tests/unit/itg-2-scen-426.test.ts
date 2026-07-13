import { aggregateMonthlyCostByCategory } from '../../src/logic/it-1-br-2-1-1-1';

describe('月次食費実績集計ダッシュボード機能', () => {
  test('SCEN-426: 複数の食材カテゴリにおける支出が正確に集計される', () => {
    // テストデータ: 複数食材カテゴリの月次支出レコード
    const monthlyExpenseRecords = [
      // 野菜カテゴリ
      { category: '野菜', amount: 1500, date: '2024-01-05', quantity: 3 },
      { category: '野菜', amount: 800, date: '2024-01-12', quantity: 2 },
      { category: '野菜', amount: 1200, date: '2024-01-20', quantity: 2 },
      // 肉カテゴリ
      { category: '肉', amount: 3200, date: '2024-01-07', quantity: 1 },
      { category: '肉', amount: 2800, date: '2024-01-14', quantity: 1 },
      { category: '肉', amount: 2500, date: '2024-01-25', quantity: 1 },
      // 魚カテゴリ
      { category: '魚', amount: 2100, date: '2024-01-08', quantity: 1 },
      { category: '魚', amount: 1800, date: '2024-01-18', quantity: 1 },
      // 穀類カテゴリ
      { category: '穀類', amount: 600, date: '2024-01-03', quantity: 2 },
      { category: '穀類', amount: 650, date: '2024-01-22', quantity: 2 },
      // 乳製品カテゴリ
      { category: '乳製品', amount: 900, date: '2024-01-06', quantity: 3 },
      { category: '乳製品', amount: 950, date: '2024-01-19', quantity: 3 },
    ];

    const monthYear = '2024-01';
    const budget = 20000;

    // 関数実行
    const result = aggregateMonthlyCostByCategory(monthlyExpenseRecords, monthYear, budget);

    // カテゴリ別支出合計の検証
    // 野菜: 1500 + 800 + 1200 = 3500
    expect(result.categoryTotals['野菜']).toBe(3500);
    // 肉: 3200 + 2800 + 2500 = 8500
    expect(result.categoryTotals['肉']).toBe(8500);
    // 魚: 2100 + 1800 = 3900
    expect(result.categoryTotals['魚']).toBe(3900);
    // 穀類: 600 + 650 = 1250
    expect(result.categoryTotals['穀類']).toBe(1250);
    // 乳製品: 900 + 950 = 1850
    expect(result.categoryTotals['乳製品']).toBe(1850);

    // 全カテゴリ合計金額の検証
    // 3500 + 8500 + 3900 + 1250 + 1850 = 19000
    expect(result.totalAmount).toBe(19000);

    // 予算比削減率の検証
    // (20000 - 19000) / 20000 * 100 = 5%
    expect(result.budgetReductionRate).toBe(5);

    // カテゴリ別構成比率の検証
    // 野菜: 3500 / 19000 * 100 = 18.42%
    expect(result.categoryRatios['野菜']).toBeCloseTo(18.42, 1);
    // 肉: 8500 / 19000 * 100 = 44.74%
    expect(result.categoryRatios['肉']).toBeCloseTo(44.74, 1);
    // 魚: 3900 / 19000 * 100 = 20.53%
    expect(result.categoryRatios['魚']).toBeCloseTo(20.53, 1);
    // 穀類: 1250 / 19000 * 100 = 6.58%
    expect(result.categoryRatios['穀類']).toBeCloseTo(6.58, 1);
    // 乳製品: 1850 / 19000 * 100 = 9.74%
    expect(result.categoryRatios['乳製品']).toBeCloseTo(9.74, 1);

    // 推移グラフデータの検証
    // 日付順にソートされた推移データが生成されていることを確認
    expect(result.transitionData).toHaveLength(12);
    expect(result.transitionData[0].date).toBe('2024-01-03');
    expect(result.transitionData[0].category).toBe('穀類');
    expect(result.transitionData[0].amount).toBe(600);

    // 推移データの日付が昇順であることを確認
    for (let i = 1; i < result.transitionData.length; i++) {
      const currentDate = new Date(result.transitionData[i].date);
      const previousDate = new Date(result.transitionData[i - 1].date);
      expect(currentDate.getTime()).toBeGreaterThanOrEqual(previousDate.getTime());
    }

    // カテゴリ別の支出推移が正確であることを確認
    const vegetableTransitions = result.transitionData.filter(
      (record) => record.category === '野菜'
    );
    expect(vegetableTransitions).toHaveLength(3);
    expect(vegetableTransitions[0].amount).toBe(1500);
    expect(vegetableTransitions[1].amount).toBe(800);
    expect(vegetableTransitions[2].amount).toBe(1200);

    // 全体の構造検証
    expect(result).toHaveProperty('categoryTotals');
    expect(result).toHaveProperty('totalAmount');
    expect(result).toHaveProperty('budgetReductionRate');
    expect(result).toHaveProperty('categoryRatios');
    expect(result).toHaveProperty('transitionData');
    expect(result).toHaveProperty('monthYear');
    expect(result.monthYear).toBe(monthYear);
  });
});