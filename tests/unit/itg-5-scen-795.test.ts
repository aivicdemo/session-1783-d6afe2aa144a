import { calculateCorrelationWithSignificance } from "../../src/logic/it-7-2-1";

describe("it-7-2-1: 外部要因相関分析機能", () => {
  // SCEN-795
  test("予測値と実績値の乖離から外部要因との相関係数を計算し、統計的有意性を判定する", () => {
    // Arrange: テストデータの準備
    const predictedValues = [100, 120, 110, 130, 125];
    const actualValues = [105, 118, 115, 128, 130];
    const externalFactorData = [2.5, 3.1, 2.8, 3.5, 3.2];

    // 予測値と実績値の乖離を計算
    const divergence = predictedValues.map(
      (pred, idx) => Math.abs(pred - actualValues[idx])
    );
    // 期待値: [5, 2, 5, 2, 5]

    // Act: 相関係数と統計的有意性の計算
    const result = calculateCorrelationWithSignificance(
      divergence,
      externalFactorData
    );

    // Assert: 結果の妥当性検証
    // 1. 相関係数が-1から1の範囲内であることを検証
    expect(result.correlationCoefficient).toBeGreaterThanOrEqual(-1);
    expect(result.correlationCoefficient).toBeLessThanOrEqual(1);

    // 2. p値が0以上1以下であることを検証
    expect(result.pValue).toBeGreaterThanOrEqual(0);
    expect(result.pValue).toBeLessThanOrEqual(1);

    // 3. 統計的有意性の判定結果を確認
    // 有意水準α=0.05で検定
    const isSignificant = result.pValue < 0.05;
    expect(result.isStatisticallySignificant).toBe(isSignificant);

    // 4. 相関係数が数値であることを検証
    expect(typeof result.correlationCoefficient).toBe("number");

    // 5. p値が数値であることを検証
    expect(typeof result.pValue).toBe("number");

    // 6. 統計的有意性が真偽値であることを検証
    expect(typeof result.isStatisticallySignificant).toBe("boolean");

    // 7. 結果オブジェクトが期待された構造を持つことを検証
    expect(result).toHaveProperty("correlationCoefficient");
    expect(result).toHaveProperty("pValue");
    expect(result).toHaveProperty("isStatisticallySignificant");

    // 8. 有意な相関が検出された場合、その旨が明示されることを確認
    if (isSignificant) {
      expect(result.isStatisticallySignificant).toBe(true);
    } else {
      expect(result.isStatisticallySignificant).toBe(false);
    }
  });
});