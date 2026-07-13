import { describe, test, expect } from '@jest/globals';
import { analyzeOverbudgetFactorsByCategory } from '../../src/logic/it-1-br-2-1-1-1';

describe('食費超過要因分析機能 - 複数カテゴリの単価変動と寄与度計算', () => {
  // SCEN-434
  test('複数カテゴリにおける単価変動が正確に抽出され、寄与度が計算される', () => {
    // 前提：分析対象期間における複数カテゴリの購入実績データが蓄積されている状態
    const previousMonthData = [
      {
        categoryId: 'CAT_001',
        categoryName: '野菜',
        unitPrice: 100,
        quantity: 50,
      },
      {
        categoryId: 'CAT_002',
        categoryName: '肉類',
        unitPrice: 800,
        quantity: 20,
      },
      {
        categoryId: 'CAT_003',
        categoryName: '乳製品',
        unitPrice: 200,
        quantity: 30,
      },
      {
        categoryId: 'CAT_004',
        categoryName: '穀類',
        unitPrice: 150,
        quantity: 40,
      },
    ];

    const currentMonthData = [
      {
        categoryId: 'CAT_001',
        categoryName: '野菜',
        unitPrice: 120,
        quantity: 50,
      },
      {
        categoryId: 'CAT_002',
        categoryName: '肉類',
        unitPrice: 900,
        quantity: 20,
      },
      {
        categoryId: 'CAT_003',
        categoryName: '乳製品',
        unitPrice: 200,
        quantity: 30,
      },
      {
        categoryId: 'CAT_004',
        categoryName: '穀類',
        unitPrice: 180,
        quantity: 40,
      },
    ];

    // 前月の総食費：(100*50) + (800*20) + (200*30) + (150*40) = 5000 + 16000 + 6000 + 6000 = 33000
    const previousMonthTotal = 33000;

    // 当月の総食費：(120*50) + (900*20) + (200*30) + (180*40) = 6000 + 18000 + 6000 + 7200 = 37200
    const currentMonthTotal = 37200;

    // 超過額：37200 - 33000 = 4200
    const overbudgetAmount = 4200;

    const analysisInput = {
      previousMonthData: previousMonthData,
      currentMonthData: currentMonthData,
      overbudgetAmount: overbudgetAmount,
    };

    // 実行：食費超過要因分析機能を呼び出す
    const result = analyzeOverbudgetFactorsByCategory(analysisInput);

    // 検証1：各カテゴリの単価変動率が正確に計算される
    // 野菜：(120-100)/100*100 = 20%
    // 肉類：(900-800)/800*100 = 12.5%
    // 乳製品：(200-200)/200*100 = 0%
    // 穀類：(180-150)/150*100 = 20%
    expect(result.categories[0].unitPriceChangeRate).toBe(20);
    expect(result.categories[1].unitPriceChangeRate).toBe(12.5);
    expect(result.categories[2].unitPriceChangeRate).toBe(0);
    expect(result.categories[3].unitPriceChangeRate).toBe(20);

    // 検証2：各カテゴリの寄与度が正確に計算される
    // 野菜の寄与度：(20 * 50 / 4200) * 100 = 23.81%
    // 肉類の寄与度：(12.5 * 20 / 4200) * 100 = 59.52%
    // 乳製品の寄与度：(0 * 30 / 4200) * 100 = 0%
    // 穀類の寄与度：(20 * 40 / 4200) * 100 = 19.05%
    // ただし、寄与度 = 単価変動率 × 購入数量 × 100 / 総超過額
    // 野菜：20 * 50 / 4200 * 100 = 1000 / 4200 * 100 ≈ 23.81%
    // 肉類：12.5 * 20 / 4200 * 100 = 250 / 4200 * 100 ≈ 5.95%
    // 乳製品：0 * 30 / 4200 * 100 = 0%
    // 穀類：20 * 40 / 4200 * 100 = 800 / 4200 * 100 ≈ 19.05%
    // 合計：23.81 + 5.95 + 0 + 19.05 = 48.81%
    // 実際の超過額寄与は単価変動による増分：
    // 野菜増分：(120-100)*50 = 1000
    // 肉類増分：(900-800)*20 = 2000
    // 乳製品増分：(200-200)*30 = 0
    // 穀類増分：(180-150)*40 = 1200
    // 合計増分：4200
    // 寄与度：野菜 1000/4200*100 = 23.81%, 肉類 2000/4200*100 = 47.62%, 乳製品 0%, 穀類 1200/4200*100 = 28.57%
    expect(result.categories[0].contributionRate).toBeCloseTo(23.81, 1);
    expect(result.categories[1].contributionRate).toBeCloseTo(47.62, 1);
    expect(result.categories[2].contributionRate).toBeCloseTo(0, 1);
    expect(result.categories[3].contributionRate).toBeCloseTo(28.57, 1);

    // 検証3：寄与度がパーセンテージで降順にソートされている
    expect(result.categories[0].categoryName).toBe('肉類');
    expect(result.categories[1].categoryName).toBe('穀類');
    expect(result.categories[2].categoryName).toBe('野菜');
    expect(result.categories[3].categoryName).toBe('乳製品');

    // 検証4：各カテゴリの寄与度の合計が100%（または超過額相当）になっている
    const totalContributionRate = result.categories.reduce(
      (sum, cat) => sum + cat.contributionRate,
      0
    );
    expect(totalContributionRate).toBeCloseTo(100, 0);

    // 検証5：結果オブジェクトが正確な構造を持つ
    expect(result).toHaveProperty('categories');
    expect(result).toHaveProperty('totalOverbudgetAmount');
    expect(result.totalOverbudgetAmount).toBe(4200);

    // 検証6：各カテゴリのデータ構造が完全である
    result.categories.forEach((category) => {
      expect(category).toHaveProperty('categoryId');
      expect(category).toHaveProperty('categoryName');
      expect(category).toHaveProperty('unitPriceChangeRate');
      expect(category).toHaveProperty('quantity');
      expect(category).toHaveProperty('contributionRate');
      expect(typeof category.categoryId).toBe('string');
      expect(typeof category.categoryName).toBe('string');
      expect(typeof category.unitPriceChangeRate).toBe('number');
      expect(typeof category.quantity).toBe('number');
      expect(typeof category.contributionRate).toBe('number');
    });

    // 検証7：エクスポート機能が結果を含む
    expect(result).toHaveProperty('exportData');
    expect(result.exportData).toHaveProperty('csv');
    expect(result.exportData).toHaveProperty('pdf');
    expect(typeof result.exportData.csv).toBe('string');
    expect(typeof result.exportData.pdf).toBe('string');
  });
});