import { calculateDemandPredictionAccuracy } from '../../src/logic/it-7-2-1';

describe('需要予測精度検証ダッシュボード - 精度率・乖離度・カテゴリ別誤差計算', () => {
  // SCEN-783: [normal] 需要予測精度計算機能 - 予測値と実績値から精度率・乖離度・カテゴリ別誤差を正確に計算する
  test('should calculate demand prediction accuracy metrics accurately with multiple product categories', () => {
    // テストデータ: 複数カテゴリ（製品A、製品B、製品C）の予測値と実績値
    const predictionDatasets = [
      {
        categoryId: 'product_a',
        categoryName: '製品A',
        predictedValue: 100,
        actualValue: 95,
      },
      {
        categoryId: 'product_b',
        categoryName: '製品B',
        predictedValue: 200,
        actualValue: 210,
      },
      {
        categoryId: 'product_c',
        categoryName: '製品C',
        predictedValue: 150,
        actualValue: 145,
      },
    ];

    // 追加の予測値・実績値パターン
    const additionalDatasets = [
      {
        categoryId: 'product_a',
        categoryName: '製品A',
        predictedValue: 110,
        actualValue: 108,
      },
      {
        categoryId: 'product_b',
        categoryName: '製品B',
        predictedValue: 220,
        actualValue: 225,
      },
      {
        categoryId: 'product_c',
        categoryName: '製品C',
        predictedValue: 160,
        actualValue: 155,
      },
    ];

    const allDatasets = [...predictionDatasets, ...additionalDatasets];

    // 関数実行
    const result = calculateDemandPredictionAccuracy(allDatasets);

    // 精度率計算の検証
    // 精度率 = (1 - (平均絶対誤差 / 平均実績値)) * 100
    // 誤差: |100-95|=5, |200-210|=10, |150-145|=5, |110-108|=2, |220-225|=5, |160-155|=5
    // 平均絶対誤差 = (5+10+5+2+5+5)/6 = 32/6 ≈ 5.333
    // 平均実績値 = (95+210+145+108+225+155)/6 = 938/6 ≈ 156.333
    // 精度率 = (1 - 5.333/156.333) * 100 ≈ 96.59%
    expect(result.accuracyRate).toBeCloseTo(96.59, 1);

    // 乖離度計算の検証
    // 乖離度 = (Σ|予測値 - 実績値| / Σ実績値) * 100
    // 乖離度 = (32 / 938) * 100 ≈ 3.41%
    expect(result.deviationRate).toBeCloseTo(3.41, 1);

    // カテゴリ別誤差検証
    expect(result.categoryErrors).toBeDefined();
    expect(result.categoryErrors).toHaveLength(3);

    // 製品A: (|100-95| + |110-108|) / (95 + 108) = (5 + 2) / 203 ≈ 3.45%
    const productAError = result.categoryErrors.find(
      (err) => err.categoryId === 'product_a'
    );
    expect(productAError).toBeDefined();
    expect(productAError?.categoryName).toBe('製品A');
    expect(productAError?.errorRate).toBeCloseTo(3.45, 1);
    expect(productAError?.totalAbsoluteError).toBe(7);
    expect(productAError?.totalActualValue).toBe(203);
    expect(productAError?.dataPointCount).toBe(2);

    // 製品B: (|200-210| + |220-225|) / (210 + 225) = (10 + 5) / 435 ≈ 3.45%
    const productBError = result.categoryErrors.find(
      (err) => err.categoryId === 'product_b'
    );
    expect(productBError).toBeDefined();
    expect(productBError?.categoryName).toBe('製品B');
    expect(productBError?.errorRate).toBeCloseTo(3.45, 1);
    expect(productBError?.totalAbsoluteError).toBe(15);
    expect(productBError?.totalActualValue).toBe(435);
    expect(productBError?.dataPointCount).toBe(2);

    // 製品C: (|150-145| + |160-155|) / (145 + 155) = (5 + 5) / 300 ≈ 3.33%
    const productCError = result.categoryErrors.find(
      (err) => err.categoryId === 'product_c'
    );
    expect(productCError).toBeDefined();
    expect(productCError?.categoryName).toBe('製品C');
    expect(productCError?.errorRate).toBeCloseTo(3.33, 1);
    expect(productCError?.totalAbsoluteError).toBe(10);
    expect(productCError?.totalActualValue).toBe(300);
    expect(productCError?.dataPointCount).toBe(2);

    // 全体メトリクスの検証
    expect(result.totalDataPoints).toBe(6);
    expect(result.totalAbsoluteError).toBe(32);
    expect(result.totalActualValue).toBe(938);

    // 集計結果の整合性確認
    // すべてのカテゴリの絶対誤差合計 = 全体の絶対誤差
    const sumCategoryErrors = result.categoryErrors.reduce(
      (sum, cat) => sum + cat.totalAbsoluteError,
      0
    );
    expect(sumCategoryErrors).toBe(result.totalAbsoluteError);

    // すべてのカテゴリの実績値合計 = 全体の実績値
    const sumCategoryActuals = result.categoryErrors.reduce(
      (sum, cat) => sum + cat.totalActualValue,
      0
    );
    expect(sumCategoryActuals).toBe(result.totalActualValue);

    // ダッシュボード表示用フォーマット検証
    expect(result.dashboardDisplay).toBeDefined();
    expect(result.dashboardDisplay.accuracyPercentage).toBeCloseTo(96.59, 1);
    expect(result.dashboardDisplay.deviationPercentage).toBeCloseTo(3.41, 1);
    expect(result.dashboardDisplay.categoryBreakdown).toHaveLength(3);
    expect(result.dashboardDisplay.categoryBreakdown[0].categoryName).toBe(
      '製品A'
    );
    expect(result.dashboardDisplay.categoryBreakdown[0].errorPercentage).toBeCloseTo(
      3.45,
      1
    );

    // エクスポート用データ検証（CSV形式）
    expect(result.exportData).toBeDefined();
    expect(result.exportData.csvHeaders).toEqual([
      'カテゴリID',
      'カテゴリ名',
      'データ件数',
      '絶対誤差合計',
      '実績値合計',
      '誤差率（%）',
    ]);
    expect(result.exportData.csvRows).toHaveLength(3);
    expect(result.exportData.csvRows[0]).toEqual([
      'product_a',
      '製品A',
      '2',
      '7',
      '203',
      '3.45',
    ]);
    expect(result.exportData.csvRows[1]).toEqual([
      'product_b',
      '製品B',
      '2',
      '15',
      '435',
      '3.45',
    ]);
    expect(result.exportData.csvRows[2]).toEqual([
      'product_c',
      '製品C',
      '2',
      '10',
      '300',
      '3.33',
    ]);

    // 全体サマリー行
    expect(result.exportData.summaryRow).toEqual([
      '全体',
      '',
      '6',
      '32',
      '938',
      '3.41',
    ]);

    // 結果完全性の検証
    expect(result).toHaveProperty('accuracyRate');
    expect(result).toHaveProperty('deviationRate');
    expect(result).toHaveProperty('categoryErrors');
    expect(result).toHaveProperty('totalDataPoints');
    expect(result).toHaveProperty('totalAbsoluteError');
    expect(result).toHaveProperty('totalActualValue');
    expect(result).toHaveProperty('dashboardDisplay');
    expect(result).toHaveProperty('exportData');

    // 数値範囲の妥当性
    expect(result.accuracyRate).toBeGreaterThanOrEqual(0);
    expect(result.accuracyRate).toBeLessThanOrEqual(100);
    expect(result.deviationRate).toBeGreaterThanOrEqual(0);
    expect(result.deviationRate).toBeLessThanOrEqual(100);

    for (const categoryError of result.categoryErrors) {
      expect(categoryError.errorRate).toBeGreaterThanOrEqual(0);
      expect(categoryError.errorRate).toBeLessThanOrEqual(100);
      expect(categoryError.dataPointCount).toBeGreaterThan(0);
      expect(categoryError.totalAbsoluteError).toBeGreaterThanOrEqual(0);
      expect(categoryError.totalActualValue).toBeGreaterThan(0);
    }
  });
});