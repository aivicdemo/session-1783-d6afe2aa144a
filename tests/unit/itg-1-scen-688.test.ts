import { calculateCookingTimeReduction } from '../../src/logic/it-1-br-1783670064270-1-1-1';

describe('Cooking Time Reduction Calculation by Segment', () => {
  // SCEN-688
  test('should calculate negative cooking time reduction when actual exceeds target', () => {
    const targetCookingTimeMinutes = 30;
    const actualCookingTimeMinutes = 45;
    const segmentId = 'segment-001';

    const result = calculateCookingTimeReduction({
      targetCookingTimeMinutes,
      actualCookingTimeMinutes,
      segmentId,
    });

    // 期待値計算: 
    // 短縮時間（分） = 目標時間 - 実績時間 = 30 - 45 = -15
    // 短縮効果（%） = (短縮時間 / 目標時間) * 100 = (-15 / 30) * 100 = -50
    expect(result.reductionMinutes).toBe(-15);
    expect(result.reductionPercentage).toBe(-50);
    expect(result.segmentId).toBe('segment-001');
    expect(result.isNegativeReduction).toBe(true);
    expect(result.displayValue).toBe('-15分 (-50%)');
  });
});