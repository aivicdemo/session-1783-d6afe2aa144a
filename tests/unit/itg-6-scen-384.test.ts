import { analyzeSegmentUtilizationPattern } from '../../src/logic/it-1-br-8-2-1-1';

describe('ユーザーセグメント別の利用パターン分析ダッシュボード', () => {
  // SCEN-384
  test('セグメントAの調理時間短縮度がp値0.08で統計的有意性を満たさない場合、当該セグメント結果に低信頼度フラグを付与する', () => {
    const segmentAnalysisInput = {
      segmentId: 'SEG-A-001',
      segmentName: 'Segment A',
      targetCookingTime: 30,
      actualCookingTime: 29.4,
      sampleSize: 45,
      standardDeviation: 2.5,
      significanceLevel: 0.05,
      observedPValue: 0.08,
      mealGenerationSuccessRate: 0.87,
      userSatisfactionScore: 7.8,
    };

    const result = analyzeSegmentUtilizationPattern(segmentAnalysisInput);

    expect(result.segmentId).toBe('SEG-A-001');
    expect(result.segmentName).toBe('Segment A');
    expect(result.cookingTimeReductionDegree).toBe(0.6);
    expect(result.pValue).toBe(0.08);
    expect(result.isStatisticallySignificant).toBe(false);
    expect(result.confidenceFlag).toBe('LOW');
    expect(result.displayStyle).toEqual({
      backgroundColor: '#fff3cd',
      borderColor: '#ffc107',
      iconType: 'warning',
    });
    expect(result.labelText).toBe('信頼度：低');
    expect(result.explanatoryText).toBe(
      'このセグメントの結果はp値が0.08であり、有意水準0.05を満たしていません。追加のサンプル収集またはさらなる分析が必要です。',
    );
    expect(result.mealGenerationSuccessRate).toBe(0.87);
    expect(result.userSatisfactionScore).toBe(7.8);
    expect(Array.isArray(result.additionalInfo)).toBe(true);
    expect(result.additionalInfo.length).toBeGreaterThan(0);
  });
});