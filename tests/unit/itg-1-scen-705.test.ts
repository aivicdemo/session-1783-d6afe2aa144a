import { validateStatisticalSignificance } from '../../src/logic/it-3';

describe('食事評価データを献立生成ロジックに反映させる機能', () => {
  // SCEN-705: [edge] 統計的有意性判定機能 - 信頼度がちょうど境界値（p=0.05）の場合に正しく有効判定される
  test('should correctly judge as statistically significant when p-value equals exactly 0.05 (boundary condition)', () => {
    const statisticalData = {
      sampleSize: 100,
      meanValue: 4.2,
      standardDeviation: 0.8,
      pValue: 0.05,
      significanceLevel: 0.05,
    };

    const result = validateStatisticalSignificance(statisticalData);

    expect(result).toEqual({
      isSignificant: true,
      confidenceLevel: 95,
      pValue: 0.05,
      status: '有効',
      message: '統計的に有意です。信頼度95%で判定結果が確定しました。',
    });

    expect(result.isSignificant).toBe(true);
    expect(result.confidenceLevel).toBe(95);
    expect(result.pValue).toBe(0.05);
    expect(result.status).toBe('有効');
    expect(typeof result.message).toBe('string');
    expect(result.message).toContain('有意');
  });

  test('should reject when p-value is missing from input', () => {
    const invalidData = {
      sampleSize: 100,
      meanValue: 4.2,
      standardDeviation: 0.8,
      significanceLevel: 0.05,
    };

    expect(() => validateStatisticalSignificance(invalidData as any)).toThrow(/p値/);
  });

  test('should reject when significance level is invalid', () => {
    const invalidData = {
      sampleSize: 100,
      meanValue: 4.2,
      standardDeviation: 0.8,
      pValue: 0.05,
      significanceLevel: 1.5,
    };

    expect(() => validateStatisticalSignificance(invalidData)).toThrow(/有意水準/);
  });

  test('should reject when sample size is too small', () => {
    const invalidData = {
      sampleSize: 5,
      meanValue: 4.2,
      standardDeviation: 0.8,
      pValue: 0.05,
      significanceLevel: 0.05,
    };

    expect(() => validateStatisticalSignificance(invalidData)).toThrow(/標本数/);
  });
});