import { calculatePredictionAccuracy } from "../../src/logic/it-7-2-1";

describe("献立生成アルゴリズム改善前後の効果検証ダッシュボード", () => {
  test("SCEN-751: 予測値と実績値が完全一致した場合、精度率が100%と算出される", () => {
    // Arrange
    const predicted_values = [95, 87, 92, 88, 90];
    const actual_values = [95, 87, 92, 88, 90];

    // Act
    const accuracy_rate = calculatePredictionAccuracy({
      predicted_values,
      actual_values,
    });

    // Assert
    expect(accuracy_rate).toBe(100);
  });
});