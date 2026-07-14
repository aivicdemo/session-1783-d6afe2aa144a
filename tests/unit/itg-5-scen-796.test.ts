import { correlateExternalFactorsWithDemand } from "../../src/logic/it-7-2-1";

describe("外部要因相関分析機能", () => {
  // SCEN-796: [error] 外部要因相関分析機能 - 実績データが存在しない場合、相関分析が実行されず例外フラグが立つ
  test("実績データが存在しない場合、相関分析が実行されず例外フラグが立つ", () => {
    const correlationInput = {
      externalFactors: [
        {
          factorId: "weather_001",
          factorType: "weather",
          factorValue: 25.5,
          recordDate: "2024-01-15",
        },
        {
          factorId: "event_001",
          factorType: "event",
          factorValue: 1,
          recordDate: "2024-01-15",
        },
      ],
      actualDemandData: [],
      correlationThreshold: 0.3,
    };

    const result = correlateExternalFactorsWithDemand(correlationInput);

    expect(result.isExceptionFlagged).toBe(true);
    expect(result.correlationAnalysisExecuted).toBe(false);
    expect(result.errorMessage).toMatch(/実績データが存在しません/);
    expect(result.correlationResults).toEqual([]);
    expect(result.logEntry).toMatch(/実績需要データなし|No actual demand data/i);
  });
});