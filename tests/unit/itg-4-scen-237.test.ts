import { generateDemandPatternQuantificationReport } from '../../src/logic/it-2-br-6-3-2';

describe('需要パターン定量化レポート生成機能 - 食材カテゴリ単一件の場合', () => {
  // SCEN-237
  test('食材カテゴリが1件のみの場合、カテゴリ別傾向が正しく集計される', () => {
    // Setup: 単一カテゴリ用テストデータ
    const singleCategoryId = 'CAT-001';
    const categoryName = '野菜';
    
    // 過去3ヶ月間（90日間）の需要データを複数件作成
    const demandDataset = [
      {
        date: '2024-10-01',
        categoryId: singleCategoryId,
        demandQuantity: 150,
        actualQuantity: 148,
        variance: 2,
      },
      {
        date: '2024-10-08',
        categoryId: singleCategoryId,
        demandQuantity: 160,
        actualQuantity: 162,
        variance: -2,
      },
      {
        date: '2024-10-15',
        categoryId: singleCategoryId,
        demandQuantity: 155,
        actualQuantity: 154,
        variance: 1,
      },
      {
        date: '2024-10-22',
        categoryId: singleCategoryId,
        demandQuantity: 165,
        actualQuantity: 167,
        variance: -2,
      },
      {
        date: '2024-10-29',
        categoryId: singleCategoryId,
        demandQuantity: 158,
        actualQuantity: 156,
        variance: 2,
      },
      {
        date: '2024-11-05',
        categoryId: singleCategoryId,
        demandQuantity: 170,
        actualQuantity: 171,
        variance: -1,
      },
      {
        date: '2024-11-12',
        categoryId: singleCategoryId,
        demandQuantity: 162,
        actualQuantity: 161,
        variance: 1,
      },
      {
        date: '2024-11-19',
        categoryId: singleCategoryId,
        demandQuantity: 168,
        actualQuantity: 169,
        variance: -1,
      },
      {
        date: '2024-11-26',
        categoryId: singleCategoryId,
        demandQuantity: 175,
        actualQuantity: 174,
        variance: 1,
      },
      {
        date: '2024-12-03',
        categoryId: singleCategoryId,
        demandQuantity: 180,
        actualQuantity: 182,
        variance: -2,
      },
      {
        date: '2024-12-10',
        categoryId: singleCategoryId,
        demandQuantity: 185,
        actualQuantity: 184,
        variance: 1,
      },
      {
        date: '2024-12-17',
        categoryId: singleCategoryId,
        demandQuantity: 190,
        actualQuantity: 191,
        variance: -1,
      },
    ];

    const reportParams = {
      periodStartDate: '2024-10-01',
      periodEndDate: '2024-12-31',
      demandData: demandDataset,
      categoryMaster: [
        {
          categoryId: singleCategoryId,
          categoryName: categoryName,
        },
      ],
    };

    // Execute: レポート生成実行
    const report = generateDemandPatternQuantificationReport(reportParams);

    // Verify: 基本情報の検証
    expect(report).toBeDefined();
    expect(report.reportTitle).toBe('需要パターン定量化レポート');
    expect(report.reportPeriodStart).toBe('2024-10-01');
    expect(report.reportPeriodEnd).toBe('2024-12-31');
    expect(report.totalDataPoints).toBe(12);

    // Verify: カテゴリ別傾向セクションの存在確認
    expect(report.categoryTrends).toBeDefined();
    expect(Array.isArray(report.categoryTrends)).toBe(true);
    expect(report.categoryTrends.length).toBe(1);

    // Verify: 単一カテゴリの統計情報が正確に計算されていることを確認
    const categoryTrend = report.categoryTrends[0];
    expect(categoryTrend.categoryId).toBe(singleCategoryId);
    expect(categoryTrend.categoryName).toBe(categoryName);

    // 平均需要量の計算: (150+160+155+165+158+170+162+168+175+180+185+190) / 12
    const expectedAverageDemand = 1978 / 12; // = 164.833...
    expect(categoryTrend.averageDemandQuantity).toBeCloseTo(164.83, 2);

    // 最大値・最小値の検証
    expect(categoryTrend.maxDemandQuantity).toBe(190);
    expect(categoryTrend.minDemandQuantity).toBe(150);

    // 標準偏差の計算検証
    // 分散を計算: Σ(x - mean)² / n
    const mean = 164.833;
    const squaredDiffs = demandDataset.reduce(
      (sum, data) => sum + Math.pow(data.demandQuantity - mean, 2),
      0
    );
    const variance_calculated = squaredDiffs / 12;
    const stdDev_expected = Math.sqrt(variance_calculated);
    expect(categoryTrend.standardDeviation).toBeCloseTo(stdDev_expected, 2);

    // 変動係数の検証: (stdDev / mean) * 100
    const expectedCoefficientOfVariation = (stdDev_expected / mean) * 100;
    expect(categoryTrend.coefficientOfVariation).toBeCloseTo(expectedCoefficientOfVariation, 2);

    // ピークシーズンの検証（最高需要が出現した日付）
    expect(categoryTrend.peakSeasonDate).toBe('2024-12-17');
    expect(categoryTrend.peakDemandQuantity).toBe(190);

    // 低シーズンの検証（最低需要が出現した日付）
    expect(categoryTrend.lowSeasonDate).toBe('2024-10-01');
    expect(categoryTrend.lowDemandQuantity).toBe(150);

    // 実績値との乖離度の検証
    const allVariances = demandDataset.map(d => Math.abs(d.variance));
    const averageVariance = allVariances.reduce((a, b) => a + b, 0) / allVariances.length;
    expect(categoryTrend.averageDeviationFromActual).toBeCloseTo(averageVariance, 2);

    // Verify: 重複データが存在しないこと
    const categoryIdSet = new Set(report.categoryTrends.map(ct => ct.categoryId));
    expect(categoryIdSet.size).toBe(1);
    expect(categoryIdSet.has(singleCategoryId)).toBe(true);

    // Verify: 集計期間の情報が正しく記載されていること
    expect(report.aggregationPeriod).toBe(3); // 3ヶ月間
    expect(report.sampleCount).toBe(12);

    // Verify: 統計情報の整合性
    expect(report.statisticsValidated).toBe(true);
    expect(report.reportFormat).toBe('quantification');
    expect(report.dataQualityStatus).toBe('valid');

    // Verify: 単一カテゴリの需要パターンが完全に反映されていること
    expect(report.categoryTrends[0].dataPoints).toBe(12);
    expect(report.categoryTrends[0].completenessRatio).toBeCloseTo(1.0, 2);

    // 時系列トレンド情報の検証（初期値 < 終期値の上昇傾向）
    const firstDemand = demandDataset[0].demandQuantity; // 150
    const lastDemand = demandDataset[demandDataset.length - 1].demandQuantity; // 190
    expect(lastDemand).toBeGreaterThan(firstDemand);
    expect(categoryTrend.trendDirection).toBe('upward');

    // 信頼度スコアの検証（完全なデータセットなので100%に近い値）
    expect(categoryTrend.confidenceScore).toBeGreaterThanOrEqual(95);
  });
});