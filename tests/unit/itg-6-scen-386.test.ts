import { analyzeSegmentPatterns } from '../../src/logic/it-1-br-8-2-1-1';

describe('ユーザーセグメント別利用パターン分析ダッシュボード', () => {
  // SCEN-386
  test('サンプルサイズ3未満のセグメントについて統計的検定を実施せず、追加調査対象として標識する', () => {
    const segmentDataList = [
      {
        segmentId: 'SEG_001',
        segmentName: '20代一人暮らし',
        sampleSize: 1,
        mealGenerationSuccessRate: 0.85,
        cookingTimeReductionAchievementRate: 0.72,
        userSatisfactionScore: 4.2,
      },
      {
        segmentId: 'SEG_002',
        segmentName: '30代共働き家族',
        sampleSize: 2,
        mealGenerationSuccessRate: 0.88,
        cookingTimeReductionAchievementRate: 0.75,
        userSatisfactionScore: 4.5,
      },
      {
        segmentId: 'SEG_003',
        segmentName: '40代専業主夫',
        sampleSize: 5,
        mealGenerationSuccessRate: 0.92,
        cookingTimeReductionAchievementRate: 0.82,
        userSatisfactionScore: 4.8,
      },
      {
        segmentId: 'SEG_004',
        segmentName: '50代高齢夫婦',
        sampleSize: 12,
        mealGenerationSuccessRate: 0.79,
        cookingTimeReductionAchievementRate: 0.68,
        userSatisfactionScore: 4.1,
      },
    ];

    const result = analyzeSegmentPatterns(segmentDataList);

    // サンプルサイズ1のセグメント（SEG_001）の検証
    const seg001 = result.find((r: { segmentId: string }) => r.segmentId === 'SEG_001');
    expect(seg001).toBeDefined();
    expect(seg001.sampleSize).toBe(1);
    expect(seg001.statisticalTestExecuted).toBe(false);
    expect(seg001.requiresAdditionalInvestigation).toBe(true);
    expect(seg001.investigationLabel).toBe('追加調査対象');
    expect(seg001.warningIconVisible).toBe(true);
    expect(seg001.backgroundHighlightColor).toBe('warning');
    expect(seg001.statisticalTestResultVisible).toBe(false);

    // サンプルサイズ2のセグメント（SEG_002）の検証
    const seg002 = result.find((r: { segmentId: string }) => r.segmentId === 'SEG_002');
    expect(seg002).toBeDefined();
    expect(seg002.sampleSize).toBe(2);
    expect(seg002.statisticalTestExecuted).toBe(false);
    expect(seg002.requiresAdditionalInvestigation).toBe(true);
    expect(seg002.investigationLabel).toBe('追加調査対象');
    expect(seg002.warningIconVisible).toBe(true);
    expect(seg002.backgroundHighlightColor).toBe('warning');
    expect(seg002.statisticalTestResultVisible).toBe(false);

    // サンプルサイズ5のセグメント（SEG_003）の検証（統計的検定が実行されるべき）
    const seg003 = result.find((r: { segmentId: string }) => r.segmentId === 'SEG_003');
    expect(seg003).toBeDefined();
    expect(seg003.sampleSize).toBe(5);
    expect(seg003.statisticalTestExecuted).toBe(true);
    expect(seg003.requiresAdditionalInvestigation).toBe(false);
    expect(seg003.investigationLabel).toBeNull();
    expect(seg003.warningIconVisible).toBe(false);
    expect(seg003.backgroundHighlightColor).toBeNull();
    expect(seg003.statisticalTestResultVisible).toBe(true);

    // サンプルサイズ12のセグメント（SEG_004）の検証（統計的検定が実行されるべき）
    const seg004 = result.find((r: { segmentId: string }) => r.segmentId === 'SEG_004');
    expect(seg004).toBeDefined();
    expect(seg004.sampleSize).toBe(12);
    expect(seg004.statisticalTestExecuted).toBe(true);
    expect(seg004.requiresAdditionalInvestigation).toBe(false);
    expect(seg004.investigationLabel).toBeNull();
    expect(seg004.warningIconVisible).toBe(false);
    expect(seg004.backgroundHighlightColor).toBeNull();
    expect(seg004.statisticalTestResultVisible).toBe(true);

    // 結果配列が正確に4つのセグメント分析結果を含むことを確認
    expect(result.length).toBe(4);

    // サンプルサイズ3未満のセグメント数を確認
    const underMinimumSampleSize = result.filter(
      (r: { sampleSize: number; requiresAdditionalInvestigation: boolean }) =>
        r.sampleSize < 3 && r.requiresAdditionalInvestigation === true
    );
    expect(underMinimumSampleSize.length).toBe(2);

    // サンプルサイズ3以上のセグメント数を確認
    const overMinimumSampleSize = result.filter(
      (r: { sampleSize: number; statisticalTestExecuted: boolean }) =>
        r.sampleSize >= 3 && r.statisticalTestExecuted === true
    );
    expect(overMinimumSampleSize.length).toBe(2);
  });
});