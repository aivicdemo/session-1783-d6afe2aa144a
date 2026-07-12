import { analyzeTimingJudgment } from "../../src/logic/it-2";

describe("家族成員の食事評価データの蓄積・管理機能", () => {
  // SCEN-524: [edge] 分析タイミング判定機能 - 月曜日08:59では分析タイミング判定が実行されない
  test("月曜日08:59に分析タイミング判定を実行すると分析処理が実行されず、スキップログが記録される", () => {
    const mockCurrentTime = new Date("2024-01-08T08:59:00Z"); // 月曜日 08:59
    const mockSystemTime = mockCurrentTime.getTime();

    const result = analyzeTimingJudgment({
      currentTimeMs: mockSystemTime,
      analysisScheduleHour: 9,
      analysisScheduleMinute: 0,
      analysisScheduleDayOfWeek: 1, // Monday
    });

    expect(result.shouldExecuteAnalysis).toBe(false);
    expect(result.skipReason).toBe("分析タイミング未到達");
    expect(result.analysisExecuted).toBe(false);
    expect(result.logEntry).toEqual({
      timestamp: "2024-01-08T08:59:00Z",
      event: "分析スキップ",
      reason: "分析タイミング未到達",
      scheduledTime: "2024-01-08T09:00:00Z",
    });
  });
});