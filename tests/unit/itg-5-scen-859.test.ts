import { calculateSignificanceOfImprovement } from '../../src/logic/it-7-2-1';

describe('献立生成アルゴリズム改善前後の効果差定量比較', () => {
  // SCEN-859: [edge] 効果差定量比較機能 - 改善前後の指標が同一値の場合に有意性が0として検出される
  test('改善前後の指標が同一値の場合、有意性が0で検出される', () => {
    // Arrange
    const beforeMetricValue = 10.5;
    const afterMetricValue = 10.5;

    // Act
    const result = calculateSignificanceOfImprovement({
      beforeValue: beforeMetricValue,
      afterValue: afterMetricValue,
    });

    // Assert
    expect(result.significanceScore).toBe(0);
    expect(result.improvementDifference).toBe(0);
    expect(result.isStatisticallySignificant).toBe(false);
  });
});