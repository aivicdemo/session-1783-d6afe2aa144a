import { aggregateSegmentSuccessRate } from '../../src/logic/it-7-2-1';

describe('献立生成の成功率・調理時間短縮度・ユーザー満足度スコアなどの行動指標を週次で自動集計し、アルゴリズム改善前後の効果差を定量比較するダッシュボード機能', () => {
  // SCEN-928
  test('セグメント別献立生成成功率集計機能 - 特定セグメントにおいて生成試行データが0件の場合に成功率がnullまたは0として扱われる', () => {
    const segmentATrialAttempts = [];
    const segmentBTrialAttempts = [
      { segmentId: 'segment-b', generatedSuccessfully: true },
      { segmentId: 'segment-b', generatedSuccessfully: true },
      { segmentId: 'segment-b', generatedSuccessfully: false }
    ];

    const result = aggregateSegmentSuccessRate([
      {
        segmentId: 'segment-a',
        trialAttempts: segmentATrialAttempts
      },
      {
        segmentId: 'segment-b',
        trialAttempts: segmentBTrialAttempts
      }
    ]);

    expect(result).toEqual({
      segments: [
        {
          segmentId: 'segment-a',
          successRate: 0,
          totalAttempts: 0,
          successCount: 0
        },
        {
          segmentId: 'segment-b',
          successRate: 66.67,
          totalAttempts: 3,
          successCount: 2
        }
      ]
    });

    const segmentAResult = result.segments.find((s) => s.segmentId === 'segment-a');
    expect(segmentAResult).toBeDefined();
    expect(segmentAResult?.successRate).toBe(0);
    expect(segmentAResult?.totalAttempts).toBe(0);
    expect(segmentAResult?.successCount).toBe(0);

    const segmentBResult = result.segments.find((s) => s.segmentId === 'segment-b');
    expect(segmentBResult).toBeDefined();
    expect(segmentBResult?.successRate).toBeCloseTo(66.67, 1);
    expect(segmentBResult?.totalAttempts).toBe(3);
    expect(segmentBResult?.successCount).toBe(2);

    expect(result.segments.length).toBe(2);
  });
});