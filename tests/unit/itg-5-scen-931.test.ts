import { analyzeSegmentCookingTimeReduction } from '../../src/logic/it-7-2-1';

describe('献立生成アルゴリズムの成功・失敗パターン分析と改善提案 - セグメント別調理時間短縮実現度分析', () => {
  // SCEN-931
  test('実績調理時間が目標調理時間を上回る場合、達成度パーセンテージが100%を超える値で正しく計算される', () => {
    const targetCookingTimeMinutes = 30;
    const actualCookingTimeMinutes = 45;
    const segmentId = 'segment_busy_parent_001';
    const segmentName = 'Busy Parent Segment';

    const result = analyzeSegmentCookingTimeReduction({
      segmentId,
      segmentName,
      targetCookingTimeMinutes,
      actualCookingTimeMinutes,
    });

    const expectedAchievementPercentage = 150;
    expect(result.achievementPercentage).toBe(expectedAchievementPercentage);
    expect(result.achievementPercentage).toBeGreaterThan(100);
    expect(result.segmentId).toBe(segmentId);
    expect(result.segmentName).toBe(segmentName);
    expect(result.targetCookingTimeMinutes).toBe(targetCookingTimeMinutes);
    expect(result.actualCookingTimeMinutes).toBe(actualCookingTimeMinutes);
    expect(typeof result.achievementPercentage).toBe('number');
  });
});