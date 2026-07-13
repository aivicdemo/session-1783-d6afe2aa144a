import { calculateDemandForecastDeviation } from "../../src/logic/it-1-br-2-1-1-1";

describe("需要予測精度の乖離分析と自動改善提案生成", () => {
  // SCEN-369
  test("乖離度がゼロの完全一致ケースが正しく処理される", () => {
    // 予測値と実績値が完全に一致するテストデータ
    const forecastData = {
      forecastId: "forecast_20240115_001",
      forecastDate: new Date("2024-01-15T00:00:00Z"),
      items: [
        { itemId: "item_001", forecastQuantity: 100 },
        { itemId: "item_002", forecastQuantity: 50 },
        { itemId: "item_003", forecastQuantity: 75 },
      ],
    };

    const actualData = {
      actualId: "actual_20240115_001",
      actualDate: new Date("2024-01-15T00:00:00Z"),
      items: [
        { itemId: "item_001", actualQuantity: 100 },
        { itemId: "item_002", actualQuantity: 50 },
        { itemId: "item_003", actualQuantity: 75 },
      ],
    };

    // 乖離分析を実行
    const result = calculateDemandForecastDeviation(forecastData, actualData);

    // 乖離度がゼロ（完全一致）であることを検証
    expect(result.deviationRate).toBe(0);
    expect(result.deviationPercentage).toBe("0%");

    // 各項目の乖離度がすべてゼロであることを検証
    expect(result.itemDeviations).toEqual([
      { itemId: "item_001", deviationQuantity: 0, deviationPercentage: 0 },
      { itemId: "item_002", deviationQuantity: 0, deviationPercentage: 0 },
      { itemId: "item_003", deviationQuantity: 0, deviationPercentage: 0 },
    ]);

    // 自動改善提案が生成されないことを検証
    expect(result.improvementProposals).toEqual([]);
    expect(result.hasImprovementProposal).toBe(false);

    // 完全一致を示すメッセージが含まれることを検証
    expect(result.statusMessage).toBe("予測精度：完全一致");

    // 正常処理フラグがtrueであることを検証
    expect(result.isSuccessful).toBe(true);

    // エラーフラグがfalseであることを検証
    expect(result.hasError).toBe(false);

    // エラーメッセージが空であることを検証
    expect(result.errorMessage).toBe("");

    // ダッシュボード表示用のメタデータが正しく設定されていることを検証
    expect(result.dashboardMetadata).toEqual({
      displayAccuracy: "100%",
      riskLevel: "低",
      recommendedAction: "現状維持",
      nextReviewDate: expect.any(String),
    });

    // 結果データ構造が期待される形式であることを検証
    expect(result).toHaveProperty("deviationRate");
    expect(result).toHaveProperty("deviationPercentage");
    expect(result).toHaveProperty("itemDeviations");
    expect(result).toHaveProperty("improvementProposals");
    expect(result).toHaveProperty("statusMessage");
    expect(result).toHaveProperty("isSuccessful");
    expect(result).toHaveProperty("hasError");
    expect(result).toHaveProperty("dashboardMetadata");

    // ログ記録の確認（エラーや警告がないことを示す）
    expect(result.logLevel).toBe("INFO");
    expect(result.logMessage).toMatch(/完全一致|perfect match/i);
  });
});