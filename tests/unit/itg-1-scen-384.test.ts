import { analyzeDeviationByCategory, analyzeDeviationByPeriod, generateImprovementProposals } from '../../src/logic/it-3';

describe('需要予測精度の乖離分析機能', () => {
  // SCEN-384
  test('カテゴリ別・時期別の誤差パターンが可視化され改善提案が自動生成される', () => {
    // ===== 入力データ準備 =====
    // 過去3ヶ月以上の需要予測データと実績データ
    const predictionData = [
      { date: '2024-01-01', category: 'mainDish', predicted: 100 },
      { date: '2024-01-01', category: 'sideDish', predicted: 80 },
      { date: '2024-01-01', category: 'soup', predicted: 60 },
      { date: '2024-01-08', category: 'mainDish', predicted: 110 },
      { date: '2024-01-08', category: 'sideDish', predicted: 75 },
      { date: '2024-01-08', category: 'soup', predicted: 65 },
      { date: '2024-01-15', category: 'mainDish', predicted: 95 },
      { date: '2024-01-15', category: 'sideDish', predicted: 85 },
      { date: '2024-01-15', category: 'soup', predicted: 55 },
      { date: '2024-02-01', category: 'mainDish', predicted: 120 },
      { date: '2024-02-01', category: 'sideDish', predicted: 90 },
      { date: '2024-02-01', category: 'soup', predicted: 70 },
      { date: '2024-02-08', category: 'mainDish', predicted: 105 },
      { date: '2024-02-08', category: 'sideDish', predicted: 78 },
      { date: '2024-02-08', category: 'soup', predicted: 62 },
      { date: '2024-03-01', category: 'mainDish', predicted: 115 },
      { date: '2024-03-01', category: 'sideDish', predicted: 88 },
      { date: '2024-03-01', category: 'soup', predicted: 68 },
      { date: '2024-03-08', category: 'mainDish', predicted: 100 },
      { date: '2024-03-08', category: 'sideDish', predicted: 82 },
      { date: '2024-03-08', category: 'soup', predicted: 58 },
    ];

    const actualData = [
      { date: '2024-01-01', category: 'mainDish', actual: 95 },
      { date: '2024-01-01', category: 'sideDish', actual: 70 },
      { date: '2024-01-01', category: 'soup', actual: 55 },
      { date: '2024-01-08', category: 'mainDish', actual: 125 },
      { date: '2024-01-08', category: 'sideDish', actual: 65 },
      { date: '2024-01-08', category: 'soup', actual: 75 },
      { date: '2024-01-15', category: 'mainDish', actual: 90 },
      { date: '2024-01-15', category: 'sideDish', actual: 80 },
      { date: '2024-01-15', category: 'soup', actual: 50 },
      { date: '2024-02-01', category: 'mainDish', actual: 110 },
      { date: '2024-02-01', category: 'sideDish', actual: 95 },
      { date: '2024-02-01', category: 'soup', actual: 65 },
      { date: '2024-02-08', category: 'mainDish', actual: 115 },
      { date: '2024-02-08', category: 'sideDish', actual: 88 },
      { date: '2024-02-08', category: 'soup', actual: 70 },
      { date: '2024-03-01', category: 'mainDish', actual: 105 },
      { date: '2024-03-01', category: 'sideDish', actual: 92 },
      { date: '2024-03-01', category: 'soup', actual: 72 },
      { date: '2024-03-08', category: 'mainDish', actual: 110 },
      { date: '2024-03-08', category: 'sideDish', actual: 78 },
      { date: '2024-03-08', category: 'soup', actual: 62 },
    ];

    // ===== カテゴリ別分析テスト =====
    // 期待計算値:
    // mainDish: |95-100|/100 = 5%, |125-110|/110 = 13.6%, |90-95|/95 = 5.3%, |110-120|/120 = 8.3%, |115-105|/105 = 9.5%, |105-115|/115 = 8.7%, |110-100|/100 = 10%
    // → mainDish 平均誤差率: (5 + 13.6 + 5.3 + 8.3 + 9.5 + 8.7 + 10) / 7 ≈ 8.6%
    // sideDish: |70-80|/80 = 12.5%, |65-75|/75 = 13.3%, |80-85|/85 = 5.9%, |95-90|/90 = 5.6%, |88-78|/78 = 12.8%, |92-88|/88 = 4.5%, |78-82|/82 = 4.9%
    // → sideDish 平均誤差率: (12.5 + 13.3 + 5.9 + 5.6 + 12.8 + 4.5 + 4.9) / 7 ≈ 8.3%
    // soup: |55-60|/60 = 8.3%, |75-65|/65 = 15.4%, |50-55|/55 = 9.1%, |65-70|/70 = 7.1%, |70-62|/62 = 12.9%, |72-68|/68 = 5.9%, |62-58|/58 = 6.9%
    // → soup 平均誤差率: (8.3 + 15.4 + 9.1 + 7.1 + 12.9 + 5.9 + 6.9) / 7 ≈ 9.2%

    const categoryAnalysisResult = analyzeDeviationByCategory(predictionData, actualData);

    expect(categoryAnalysisResult).toHaveLength(3);
    expect(categoryAnalysisResult[0]).toHaveProperty('category', 'mainDish');
    expect(categoryAnalysisResult[0]).toHaveProperty('deviationRate');
    expect(Math.round(categoryAnalysisResult[0].deviationRate * 10) / 10).toBe(8.6);

    expect(categoryAnalysisResult[1]).toHaveProperty('category', 'sideDish');
    expect(Math.round(categoryAnalysisResult[1].deviationRate * 10) / 10).toBe(8.3);

    expect(categoryAnalysisResult[2]).toHaveProperty('category', 'soup');
    expect(Math.round(categoryAnalysisResult[2].deviationRate * 10) / 10).toBe(9.2);

    // ===== 時期別分析テスト =====
    // 週別分析:
    // 2024-01-01 週: [(95-100 + 70-80 + 55-60) / (100 + 80 + 60)] × 100
    //           = [(-5 - 10 - 5) / 240] × 100 = (-20/240) × 100 = -8.3%
    //           → 誤差率の絶対値: 8.3%
    // 2024-01-08 週: [(125-110 + 65-75 + 75-65) / (110 + 75 + 65)] × 100
    //           = [(15 - 10 + 10) / 250] × 100 = (15/250) × 100 = 6%
    // 2024-01-15 週: [(90-95 + 80-85 + 50-55) / (95 + 85 + 55)] × 100
    //           = [(-5 - 5 - 5) / 235] × 100 = (-15/235) × 100 = -6.4%
    //           → 絶対値: 6.4%
    // 2024-02-01 週: [(110-120 + 95-90 + 65-70) / (120 + 90 + 70)] × 100
    //           = [(-10 + 5 - 5) / 280] × 100 = (-10/280) × 100 = -3.6%
    //           → 絶対値: 3.6%
    // 2024-02-08 週: [(115-105 + 88-78 + 70-62) / (105 + 78 + 62)] × 100
    //           = [(10 + 10 + 8) / 245] × 100 = (28/245) × 100 = 11.4%
    // 2024-03-01 週: [(105-115 + 92-88 + 72-68) / (115 + 88 + 68)] × 100
    //           = [(-10 + 4 + 4) / 271] × 100 = (-2/271) × 100 = -0.7%
    //           → 絶対値: 0.7%
    // 2024-03-08 週: [(110-100 + 78-82 + 62-58) / (100 + 82 + 58)] × 100
    //           = [(10 - 4 + 4) / 240] × 100 = (10/240) × 100 = 4.2%

    const periodAnalysisResult = analyzeDeviationByPeriod(predictionData, actualData);

    expect(periodAnalysisResult).toHaveLength(7);
    expect(periodAnalysisResult[0]).toHaveProperty('period', '2024-W01');
    expect(Math.round(Math.abs(periodAnalysisResult[0].deviationRate) * 10) / 10).toBe(8.3);

    expect(periodAnalysisResult[1]).toHaveProperty('period', '2024-W02');
    expect(Math.round(periodAnalysisResult[1].deviationRate * 10) / 10).toBe(6.0);

    expect(periodAnalysisResult[2]).toHaveProperty('period', '2024-W03');
    expect(Math.round(Math.abs(periodAnalysisResult[2].deviationRate) * 10) / 10).toBe(6.4);

    expect(periodAnalysisResult[3]).toHaveProperty('period', '2024-W05');
    expect(Math.round(Math.abs(periodAnalysisResult[3].deviationRate) * 10) / 10).toBe(3.6);

    expect(periodAnalysisResult[4]).toHaveProperty('period', '2024-W06');
    expect(Math.round(periodAnalysisResult[4].deviationRate * 10) / 10).toBe(11.4);

    expect(periodAnalysisResult[5]).toHaveProperty('period', '2024-W09');
    expect(Math.round(Math.abs(periodAnalysisResult[5].deviationRate) * 10) / 10).toBe(0.7);

    expect(periodAnalysisResult[6]).toHaveProperty('period', '2024-W10');
    expect(Math.round(periodAnalysisResult[6].deviationRate * 10) / 10).toBe(4.2);

    // ===== 改善提案生成テスト =====
    // mainDish の誤差率 8.6% が最大で、2024-02-08 週の 11.4% が最大期間誤差
    // 改善提案構成: 原因分析 + 推奨アクション + 予想改善率
    // 予想改善率: 誤差率が 8.6% → 5% に改善と仮定 = (8.6 - 5) / 8.6 × 100 ≈ 41.9%

    const improvementProposals = generateImprovementProposals(
      categoryAnalysisResult,
      periodAnalysisResult
    );

    expect(improvementProposals).toBeDefined();
    expect(improvementProposals.length).toBeGreaterThan(0);

    const mainDishProposal = improvementProposals.find(
      (p) => p.category === 'mainDish'
    );
    expect(mainDishProposal).toBeDefined();
    expect(mainDishProposal?.hasOwnProperty('causeAnalysis')).toBe(true);
    expect(mainDishProposal?.hasOwnProperty('recommendedAction')).toBe(true);
    expect(mainDishProposal?.hasOwnProperty('expectedImprovementRate')).toBe(
      true
    );

    // 改善提案が具体的であることを確認
    expect(mainDishProposal?.causeAnalysis).toBeTruthy();
    expect(mainDishProposal?.causeAnalysis.length).toBeGreaterThan(0);
    expect(mainDishProposal?.recommendedAction).toBeTruthy();
    expect(mainDishProposal?.recommendedAction.length).toBeGreaterThan(0);
    expect(mainDishProposal?.expectedImprovementRate).toBeGreaterThan(0);

    // 予想改善率が合理的な範囲にあることを確認 (0% < rate < 100%)
    expect(mainDishProposal?.expectedImprovementRate).toBeLessThan(100);

    // soupカテゴリの提案も確認
    const soupProposal = improvementProposals.find((p) => p.category === 'soup');
    expect(soupProposal).toBeDefined();
    expect(soupProposal?.causeAnalysis).toBeTruthy();
    expect(soupProposal?.recommendedAction).toBeTruthy();
    expect(soupProposal?.expectedImprovementRate).toBeGreaterThan(0);

    // 最大誤差期間に対応した提案が含まれていることを確認
    const hasHighDeviationPeriodAction = improvementProposals.some(
      (p) =>
        p.recommendedAction.includes('2024-W06') ||
        p.recommendedAction.includes('2024-02-08') ||
        p.recommendedAction.includes('週')
    );
    expect(hasHighDeviationPeriodAction).toBe(true);
  });
});