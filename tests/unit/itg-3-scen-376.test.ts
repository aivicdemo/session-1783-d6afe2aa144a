import { identifyForecastAccuracyDeclineFactor } from "../../src/logic/it-1-br-3-2-1";

describe("Purchase Records and Monthly Food Expense Reduction Analysis", () => {
  // SCEN-376: [edge] 外部データ相関分析による予測精度低下要因特定機能 - 相関係数が+1.0または-1.0の完全相関の境界値で要因が正しく特定される
  test("should correctly identify forecast accuracy decline factor at perfect positive and negative correlation boundaries", () => {
    // Setup: 相関係数 +1.0（完全正相関）のテストデータ
    const positiveCorrelationScenario = {
      externalFactorName: "temperature",
      correlationCoefficient: 1.0,
      forecastValues: [100, 110, 120, 130, 140],
      actualValues: [100, 110, 120, 130, 140],
      externalDataValues: [15, 20, 25, 30, 35],
      analysisDate: "2024-01-31T23:59:59Z",
    };

    // Execute: 相関係数 +1.0 で分析実行
    const posResult = identifyForecastAccuracyDeclineFactor(
      positiveCorrelationScenario
    );

    // Assert: 相関係数 +1.0 の場合、『外部要因との強い正相関による過学習』が正しく特定される
    expect(posResult).toEqual({
      declineFactor: "外部要因との強い正相関による過学習",
      correlationCoefficient: 1.0,
      severity: "critical",
      recommendation: "モデルの正則化強化またはデータセット拡張が必要",
      timestamp: "2024-01-31T23:59:59Z",
    });

    // Setup: 相関係数 -1.0（完全負相関）のテストデータ
    const negativeCorrelationScenario = {
      externalFactorName: "rainfall",
      correlationCoefficient: -1.0,
      forecastValues: [100, 90, 80, 70, 60],
      actualValues: [100, 90, 80, 70, 60],
      externalDataValues: [0, 5, 10, 15, 20],
      analysisDate: "2024-01-31T23:59:59Z",
    };

    // Execute: 相関係数 -1.0 で分析実行
    const negResult = identifyForecastAccuracyDeclineFactor(
      negativeCorrelationScenario
    );

    // Assert: 相関係数 -1.0 の場合、『外部要因との強い負相関による過学習』が正しく特定される
    expect(negResult).toEqual({
      declineFactor: "外部要因との強い負相関による過学習",
      correlationCoefficient: -1.0,
      severity: "critical",
      recommendation: "モデルの正則化強化またはデータセット拡張が必要",
      timestamp: "2024-01-31T23:59:59Z",
    });

    // Verify: 両境界値で例外が発生しないことを確認
    expect(posResult).toBeDefined();
    expect(negResult).toBeDefined();

    // Verify: 要因特定結果が正しいJSON形式で返却されることを確認
    expect(typeof posResult.declineFactor).toBe("string");
    expect(typeof posResult.correlationCoefficient).toBe("number");
    expect(typeof posResult.severity).toBe("string");
    expect(typeof posResult.recommendation).toBe("string");
    expect(typeof posResult.timestamp).toBe("string");

    expect(typeof negResult.declineFactor).toBe("string");
    expect(typeof negResult.correlationCoefficient).toBe("number");
    expect(typeof negResult.severity).toBe("string");
    expect(typeof negResult.recommendation).toBe("string");
    expect(typeof negResult.timestamp).toBe("string");

    // Verify: 両境界値での要因特定ロジックが正確に動作
    expect(posResult.declineFactor).toMatch(/正相関/);
    expect(negResult.declineFactor).toMatch(/負相関/);
    expect(posResult.severity).toBe("critical");
    expect(negResult.severity).toBe("critical");
  });
});