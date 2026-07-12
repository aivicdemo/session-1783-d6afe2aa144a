import { calculateCorrelationCoefficient } from "../../src/logic/it-3";

describe("食事評価データを献立生成ロジックに反映させる機能", () => {
  test("SCEN-389: 需要予測精度検証機能 - 相関係数計算時に外部データが不足している場合、代替処理が実行される", () => {
    const mockLogger = {
      warnings: [] as string[],
    };

    const externalDataWithMissing = {
      weatherData: null,
      eventData: undefined,
      competitorData: [],
      cachedPastData: [
        { date: "2024-01-01", correlationCoefficient: 0.65 },
        { date: "2024-01-08", correlationCoefficient: 0.72 },
      ],
    };

    const demandHistory = [
      { date: "2024-01-15", actualDemand: 150, predictedDemand: 145 },
      { date: "2024-01-22", actualDemand: 180, predictedDemand: 175 },
      { date: "2024-01-29", actualDemand: 165, predictedDemand: 170 },
    ];

    const result = calculateCorrelationCoefficient(
      demandHistory,
      externalDataWithMissing,
      mockLogger
    );

    expect(result).toBeDefined();
    expect(typeof result.correlationValue).toBe("number");
    expect(result.correlationValue).toBe(0.685);
    expect(result.usedFallback).toBe(true);
    expect(result.fallbackReason).toBe("外部データが不足しているため、キャッシュされた過去データから平均値を算出");

    expect(mockLogger.warnings.length).toBeGreaterThan(0);
    expect(mockLogger.warnings[0]).toMatch(/天気データ|イベント情報|外部データソース/);

    expect(result.error).toBeUndefined();
  });
});