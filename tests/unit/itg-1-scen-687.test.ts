import { calculateCookingTimeAchievementDegree } from '../../src/logic/it-3';

describe('食事評価データを献立生成ロジックに反映させる機能', () => {
  // SCEN-687
  test('[edge] 調理時間短縮実現度セグメント別比較機能 - 実績調理時間が目標調理時間と同一の場合、達成度が100%と正確に表示される', () => {
    const targetCookingTimeMinutes = 30;
    const actualCookingTimeMinutes = 30;
    const segmentId = 'segment_001';
    const segmentName = 'househusband_30s_family_of_4';

    const result = calculateCookingTimeAchievementDegree({
      segmentId,
      segmentName,
      targetCookingTimeMinutes,
      actualCookingTimeMinutes,
    });

    expect(result).toEqual({
      segmentId: 'segment_001',
      segmentName: 'househusband_30s_family_of_4',
      targetCookingTimeMinutes: 30,
      actualCookingTimeMinutes: 30,
      achievementDegreePercentage: 100,
      timeDifferenceMinutes: 0,
      status: 'achieved',
    });

    expect(result.achievementDegreePercentage).toBe(100);
    expect(result.timeDifferenceMinutes).toBe(0);
    expect(result.status).toBe('achieved');
  });
});