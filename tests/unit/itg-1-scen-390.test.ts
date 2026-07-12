import { normalizeCorrelationCoefficient } from '../../src/logic/it-3';

describe('需要予測精度検証機能 - 相関係数正規化', () => {
  // SCEN-390
  test('相関係数が-1.0から1.0の範囲内に正規化される', () => {
    // 【ハッピーパス】正常な相関係数値
    expect(normalizeCorrelationCoefficient(0.5)).toBe(0.5);
    expect(normalizeCorrelationCoefficient(-0.5)).toBe(-0.5);
    expect(normalizeCorrelationCoefficient(0)).toBe(0);
    expect(normalizeCorrelationCoefficient(1.0)).toBe(1.0);
    expect(normalizeCorrelationCoefficient(-1.0)).toBe(-1.0);

    // 【エッジケース】-1.0未満の値を正規化
    expect(normalizeCorrelationCoefficient(-1.5)).toBe(-1.0);
    expect(normalizeCorrelationCoefficient(-2.0)).toBe(-1.0);
    expect(normalizeCorrelationCoefficient(-100.5)).toBe(-1.0);

    // 【エッジケース】1.0を超える値を正規化
    expect(normalizeCorrelationCoefficient(1.5)).toBe(1.0);
    expect(normalizeCorrelationCoefficient(2.0)).toBe(1.0);
    expect(normalizeCorrelationCoefficient(100.5)).toBe(1.0);

    // 【複数回計算の一貫性検証】
    const testValues = [
      -2.5,
      -1.1,
      -0.99,
      0.0,
      0.5,
      0.99,
      1.1,
      2.5,
      150.0,
      -150.0,
    ];

    testValues.forEach((value) => {
      const result = normalizeCorrelationCoefficient(value);
      expect(result).toBeGreaterThanOrEqual(-1.0);
      expect(result).toBeLessThanOrEqual(1.0);
      expect(typeof result).toBe('number');
    });

    // 【数学的妥当性】境界値での正確性
    const boundaryResults = {
      exactNegativeOne: normalizeCorrelationCoefficient(-1.0),
      exactPositiveOne: normalizeCorrelationCoefficient(1.0),
      justBelowNegativeOne: normalizeCorrelationCoefficient(-1.0001),
      justAbovePositiveOne: normalizeCorrelationCoefficient(1.0001),
    };

    expect(boundaryResults.exactNegativeOne).toBe(-1.0);
    expect(boundaryResults.exactPositiveOne).toBe(1.0);
    expect(boundaryResults.justBelowNegativeOne).toBe(-1.0);
    expect(boundaryResults.justAbovePositiveOne).toBe(1.0);

    // 【単調性検証】正規化前後で順序関係が保持される
    const monotonyTestValues = [-0.8, -0.4, 0.0, 0.4, 0.8];
    const normalizedMonotonyValues = monotonyTestValues.map((v) =>
      normalizeCorrelationCoefficient(v)
    );
    for (let i = 0; i < normalizedMonotonyValues.length - 1; i++) {
      expect(normalizedMonotonyValues[i]).toBeLessThanOrEqual(
        normalizedMonotonyValues[i + 1]
      );
    }
  });
});