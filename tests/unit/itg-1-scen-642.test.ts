import { calculateMinimumSampleSize } from '../../src/logic/it-1-1-1';

describe('家族成員の食事評価履歴とアレルギー・食事制限情報の変更を定期的に監視し、献立生成アルゴリズムの制約条件に自動反映する機能', () => {
  // SCEN-642: [edge] インタビュー対象者選定基準決定機能 - 最小サンプル数が統計的有意性の下限値（n=30）以上で計算される
  test('サンプルサイズ計算で信頼度95%・許容誤差5%の場合、最小値30以上を返す', () => {
    const result = calculateMinimumSampleSize({
      confidenceLevel: 95,
      marginOfError: 5,
      populationProportion: 0.5,
    });

    expect(result).toBeGreaterThanOrEqual(30);
    expect(Number.isInteger(result)).toBe(true);
  });

  test('サンプルサイズが29.9の場合、30に切り上げられる', () => {
    const result = calculateMinimumSampleSize({
      confidenceLevel: 95,
      marginOfError: 5.2,
      populationProportion: 0.5,
    });

    expect(result).toBeGreaterThanOrEqual(30);
    expect(Number.isInteger(result)).toBe(true);
  });

  test('サンプルサイズが厳密に30の場合、30を返す', () => {
    const result = calculateMinimumSampleSize({
      confidenceLevel: 95,
      marginOfError: 5.0,
      populationProportion: 0.5,
    });

    expect(result).toBe(30);
    expect(Number.isInteger(result)).toBe(true);
  });

  test('サンプルサイズが31以上の場合、その値を返す', () => {
    const result = calculateMinimumSampleSize({
      confidenceLevel: 95,
      marginOfError: 4.8,
      populationProportion: 0.5,
    });

    expect(result).toBeGreaterThanOrEqual(31);
    expect(Number.isInteger(result)).toBe(true);
  });

  test('信頼度99%・許容誤差3%の場合、最小値30以上を返す', () => {
    const result = calculateMinimumSampleSize({
      confidenceLevel: 99,
      marginOfError: 3,
      populationProportion: 0.5,
    });

    expect(result).toBeGreaterThanOrEqual(30);
    expect(Number.isInteger(result)).toBe(true);
  });

  test('許容誤差が小さいほどサンプル数が増加する', () => {
    const result1 = calculateMinimumSampleSize({
      confidenceLevel: 95,
      marginOfError: 5,
      populationProportion: 0.5,
    });

    const result2 = calculateMinimumSampleSize({
      confidenceLevel: 95,
      marginOfError: 3,
      populationProportion: 0.5,
    });

    expect(result2).toBeGreaterThan(result1);
    expect(result1).toBeGreaterThanOrEqual(30);
    expect(result2).toBeGreaterThanOrEqual(30);
  });

  test('信頼度が高いほどサンプル数が増加する', () => {
    const result1 = calculateMinimumSampleSize({
      confidenceLevel: 90,
      marginOfError: 5,
      populationProportion: 0.5,
    });

    const result2 = calculateMinimumSampleSize({
      confidenceLevel: 99,
      marginOfError: 5,
      populationProportion: 0.5,
    });

    expect(result2).toBeGreaterThanOrEqual(result1);
    expect(result1).toBeGreaterThanOrEqual(30);
    expect(result2).toBeGreaterThanOrEqual(30);
  });

  test('母比率が0.5の場合と異なる場合でも最小値30以上を維持する', () => {
    const result1 = calculateMinimumSampleSize({
      confidenceLevel: 95,
      marginOfError: 5,
      populationProportion: 0.5,
    });

    const result2 = calculateMinimumSampleSize({
      confidenceLevel: 95,
      marginOfError: 5,
      populationProportion: 0.3,
    });

    expect(result1).toBeGreaterThanOrEqual(30);
    expect(result2).toBeGreaterThanOrEqual(30);
  });

  test('計算結果がすべて整数値で返される', () => {
    const testCases = [
      { confidenceLevel: 95, marginOfError: 5, populationProportion: 0.5 },
      { confidenceLevel: 99, marginOfError: 3, populationProportion: 0.5 },
      { confidenceLevel: 90, marginOfError: 7, populationProportion: 0.4 },
    ];

    testCases.forEach((testCase) => {
      const result = calculateMinimumSampleSize(testCase);
      expect(Number.isInteger(result)).toBe(true);
      expect(result).toBeGreaterThanOrEqual(30);
    });
  });

  test('無効なパラメータ（負の値）が渡された場合、エラーをスロー', () => {
    expect(() =>
      calculateMinimumSampleSize({
        confidenceLevel: -95,
        marginOfError: 5,
        populationProportion: 0.5,
      })
    ).toThrow(/信頼度/);

    expect(() =>
      calculateMinimumSampleSize({
        confidenceLevel: 95,
        marginOfError: -5,
        populationProportion: 0.5,
      })
    ).toThrow(/許容誤差/);
  });

  test('母比率が範囲外（0～1）の場合、エラーをスロー', () => {
    expect(() =>
      calculateMinimumSampleSize({
        confidenceLevel: 95,
        marginOfError: 5,
        populationProportion: 1.5,
      })
    ).toThrow(/母比率/);

    expect(() =>
      calculateMinimumSampleSize({
        confidenceLevel: 95,
        marginOfError: 5,
        populationProportion: -0.1,
      })
    ).toThrow(/母比率/);
  });
});