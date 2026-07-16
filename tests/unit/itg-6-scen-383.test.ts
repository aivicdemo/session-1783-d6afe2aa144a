import { analyzeSegmentPatterns } from '../../src/logic/it-1-br-8-2-1-1';

describe('ユーザーセグメント別の利用パターン分析ダッシュボード', () => {
  // SCEN-383
  test('複数セグメントの献立生成成功率を比較時、全セグメントが統計的有意水準（p < 0.05）を満たす場合に全結果を有効として返す', async () => {
    const segmentAgeData = {
      segmentId: 'seg_age_30s',
      segmentName: 'age_30s',
      successCount: 85,
      totalAttempts: 100,
      successRate: 0.85,
      pValue: 0.0234
    };

    const segmentFamilyData = {
      segmentId: 'seg_family_4person',
      segmentName: 'family_4person',
      successCount: 72,
      totalAttempts: 90,
      successRate: 0.8,
      pValue: 0.0412
    };

    const segmentRestrictionData = {
      segmentId: 'seg_restriction_yes',
      segmentName: 'restriction_yes',
      successCount: 64,
      totalAttempts: 85,
      successRate: 0.7529,
      pValue: 0.0189
    };

    const requestPayload = {
      segments: [segmentAgeData, segmentFamilyData, segmentRestrictionData],
      comparisonMetric: 'successRate',
      significanceThreshold: 0.05
    };

    const response = await analyzeSegmentPatterns(requestPayload);

    expect(response.statusCode).toBe(200);
    expect(response.resultStatus).toBe('VALID');
    expect(response.segments).toHaveLength(3);

    expect(response.segments[0]).toEqual({
      segmentId: 'seg_age_30s',
      segmentName: 'age_30s',
      successCount: 85,
      totalAttempts: 100,
      successRate: 0.85,
      pValue: 0.0234,
      isSignificant: true
    });

    expect(response.segments[1]).toEqual({
      segmentId: 'seg_family_4person',
      segmentName: 'family_4person',
      successCount: 72,
      totalAttempts: 90,
      successRate: 0.8,
      pValue: 0.0412,
      isSignificant: true
    });

    expect(response.segments[2]).toEqual({
      segmentId: 'seg_restriction_yes',
      segmentName: 'restriction_yes',
      successCount: 64,
      totalAttempts: 85,
      successRate: 0.7529,
      pValue: 0.0189,
      isSignificant: true
    });

    expect(response.allSegmentsSignificant).toBe(true);
    expect(response.pValues).toEqual([0.0234, 0.0412, 0.0189]);
    expect(response.pValues.every((p: number) => p < 0.05)).toBe(true);
    expect(response.analysisValid).toBe(true);
  });
});