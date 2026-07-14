import { evaluateAlgorithmImprovement } from '../../src/logic/it-7-2-1';

describe('献立生成アルゴリズム改善効果判定ダッシュボード', () => {
  // SCEN-878: [edge] 献立生成成功率の改善効果判定 - 改善後の成功率が最小閾値と同値の場合に改善達成と判定される
  test('改善後の成功率が最小閾値と同値の場合、改善達成と判定される', () => {
    // Arrange
    const beforeSuccessRate = 0.70;
    const afterSuccessRate = 0.75;
    const minimumThreshold = 0.75;

    // Act
    const result = evaluateAlgorithmImprovement({
      beforeSuccessRate,
      afterSuccessRate,
      minimumThreshold,
    });

    // Assert
    expect(result.isImproved).toBe(true);
    expect(result.successRateImprovement).toBe(0.05);
    expect(result.meetsMinimumThreshold).toBe(true);
    expect(result.evaluationMessage).toBe('改善達成');
  });
});