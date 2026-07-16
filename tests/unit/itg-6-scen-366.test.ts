import { calculateCookingTimeAchievementRate } from '../../src/logic/it-8-1-2-1';

describe('調理時間短縮実現度比較・可視化機能', () => {
  // SCEN-366: [edge] 目標調理時間と実績調理時間が同一のとき、達成度が100%と正確に計算される
  test('目標調理時間30分と実績調理時間30分が同一のとき、達成度が正確に100%として計算される', () => {
    // Arrange
    const targetCookingTimeMinutes = 30;
    const actualCookingTimeMinutes = 30;

    // Act
    const result = calculateCookingTimeAchievementRate({
      targetCookingTimeMinutes,
      actualCookingTimeMinutes,
    });

    // Assert
    expect(result.achievementRatePercent).toBe(100);
    expect(result.achievementRateDisplay).toBe('100%');
    expect(result.visualizationState).toBe('full');
    expect(result.gaugePercentage).toBe(100);
    expect(result.isAchieved).toBe(true);
  });
});