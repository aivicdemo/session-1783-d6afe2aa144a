import { validateMonthlyAnalysisCycleDuration } from "../../src/logic/it-1-br-2-1-1-1";

describe("月次分析サイクルの実行スケジューリング検証機能", () => {
  // SCEN-446
  test("分析サイクルが7日を超える場合、超過警告フラグが立てられる", () => {
    // 8日の分析サイクル
    const result_8days = validateMonthlyAnalysisCycleDuration({
      cycleDurationDays: 8,
      analysisStartDate: new Date("2024-01-01T00:00:00Z"),
      analysisEndDate: new Date("2024-01-09T00:00:00Z"),
    });

    expect(result_8days.warningFlag).toBe(true);
    expect(result_8days.exceedsDays).toBe(1);
    expect(result_8days.warningMessage).toMatch(/7日/);

    // 10日の分析サイクル
    const result_10days = validateMonthlyAnalysisCycleDuration({
      cycleDurationDays: 10,
      analysisStartDate: new Date("2024-01-01T00:00:00Z"),
      analysisEndDate: new Date("2024-01-11T00:00:00Z"),
    });

    expect(result_10days.warningFlag).toBe(true);
    expect(result_10days.exceedsDays).toBe(3);
    expect(result_10days.warningMessage).toMatch(/超過/);

    // 14日の分析サイクル
    const result_14days = validateMonthlyAnalysisCycleDuration({
      cycleDurationDays: 14,
      analysisStartDate: new Date("2024-01-01T00:00:00Z"),
      analysisEndDate: new Date("2024-01-15T00:00:00Z"),
    });

    expect(result_14days.warningFlag).toBe(true);
    expect(result_14days.exceedsDays).toBe(7);

    // 7日の分析サイクル（閾値）- 警告なし
    const result_7days = validateMonthlyAnalysisCycleDuration({
      cycleDurationDays: 7,
      analysisStartDate: new Date("2024-01-01T00:00:00Z"),
      analysisEndDate: new Date("2024-01-08T00:00:00Z"),
    });

    expect(result_7days.warningFlag).toBe(false);
    expect(result_7days.exceedsDays).toBe(0);

    // 5日の分析サイクル - 警告なし
    const result_5days = validateMonthlyAnalysisCycleDuration({
      cycleDurationDays: 5,
      analysisStartDate: new Date("2024-01-01T00:00:00Z"),
      analysisEndDate: new Date("2024-01-06T00:00:00Z"),
    });

    expect(result_5days.warningFlag).toBe(false);
    expect(result_5days.exceedsDays).toBe(0);
  });
});