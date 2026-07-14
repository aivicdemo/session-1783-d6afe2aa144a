import { verifyForecastAccuracy } from "../../src/logic/it-7-2-1";

describe("予測精度検証機能 - null値ハンドリング", () => {
  // SCEN-752
  test("予測値または実績値が null の場合、検証がスキップされエラーが記録される", () => {
    // 予測値が null で実績値が正常値のデータセット
    const forecastDataWithNullPrediction = [
      {
        recordId: "REC-001",
        forecastValue: null,
        actualValue: 150,
        category: "VEGETABLE",
      },
      {
        recordId: "REC-002",
        forecastValue: 200,
        actualValue: 210,
        category: "FRUIT",
      },
    ];

    const resultNullPrediction = verifyForecastAccuracy(
      forecastDataWithNullPrediction
    );

    // 予測値が null のレコードは検証がスキップされることを確認
    expect(resultNullPrediction.skippedRecords).toContain("REC-001");
    expect(resultNullPrediction.errorLog).toHaveLength(1);
    expect(resultNullPrediction.errorLog[0]).toMatch(/null値を検出/);
    expect(resultNullPrediction.errorLog[0]).toContain("REC-001");

    // 有効なレコード（REC-002）は検証されることを確認
    expect(resultNullPrediction.verifiedRecords).toContain("REC-002");
    expect(resultNullPrediction.totalProcessed).toBe(2);
    expect(resultNullPrediction.totalSkipped).toBe(1);

    // 実績値が null で予測値が正常値のデータセット
    const forecastDataWithNullActual = [
      {
        recordId: "REC-003",
        forecastValue: 180,
        actualValue: null,
        category: "MEAT",
      },
      {
        recordId: "REC-004",
        forecastValue: 250,
        actualValue: 245,
        category: "DAIRY",
      },
    ];

    const resultNullActual = verifyForecastAccuracy(
      forecastDataWithNullActual
    );

    // 実績値が null のレコードは検証がスキップされることを確認
    expect(resultNullActual.skippedRecords).toContain("REC-003");
    expect(resultNullActual.errorLog).toHaveLength(1);
    expect(resultNullActual.errorLog[0]).toMatch(/null値を検出/);
    expect(resultNullActual.errorLog[0]).toContain("REC-003");

    // 有効なレコード（REC-004）は検証されることを確認
    expect(resultNullActual.verifiedRecords).toContain("REC-004");
    expect(resultNullActual.totalProcessed).toBe(2);
    expect(resultNullActual.totalSkipped).toBe(1);

    // 両方の値が null のデータセット
    const forecastDataWithBothNull = [
      {
        recordId: "REC-005",
        forecastValue: null,
        actualValue: null,
        category: "GRAIN",
      },
      {
        recordId: "REC-006",
        forecastValue: 300,
        actualValue: 310,
        category: "BEVERAGE",
      },
    ];

    const resultBothNull = verifyForecastAccuracy(
      forecastDataWithBothNull
    );

    // 両方が null のレコードは検証がスキップされることを確認
    expect(resultBothNull.skippedRecords).toContain("REC-005");
    expect(resultBothNull.errorLog).toHaveLength(1);
    expect(resultBothNull.errorLog[0]).toMatch(/null値を検出/);
    expect(resultBothNull.errorLog[0]).toContain("REC-005");

    // 有効なレコード（REC-006）は検証されることを確認
    expect(resultBothNull.verifiedRecords).toContain("REC-006");
    expect(resultBothNull.totalProcessed).toBe(2);
    expect(resultBothNull.totalSkipped).toBe(1);

    // 検証処理全体が正常に完了していることを確認
    expect(resultBothNull.processCompleted).toBe(true);
    expect(resultBothNull.errorCount).toBe(1);
  });
});