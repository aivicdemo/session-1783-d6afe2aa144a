import { determineAnalysisTiming } from "../../src/logic/it-1-br-2-1-2-1";

describe("栄養士改善提案の優先度付けと開発チーム通知 - 分析タイミング判定", () => {
  // SCEN-545
  test("毎週月曜日 09:00 に到達したとき週次分析タイミングが正確に1回判定される", () => {
    // Setup: テスト用の固定タイムスタンプを使用
    // 2024-01-15 は月曜日
    const mondayBefore0900 = new Date("2024-01-15T08:59:00Z");
    const mondayAt0900 = new Date("2024-01-15T09:00:00Z");
    const mondayAfter0901 = new Date("2024-01-15T09:01:00Z");

    // テスト1: 月曜日 08:59 では週次分析タイミングが判定されない
    const resultBefore0900 = determineAnalysisTiming({
      currentTime: mondayBefore0900,
      analysisType: "weekly",
      lastExecutedTime: new Date("2024-01-08T09:00:00Z"), // 前週の月曜日 09:00
    });
    expect(resultBefore0900.isTimingReached).toBe(false);
    expect(resultBefore0900.analysisType).toBe("weekly");
    expect(resultBefore0900.shouldStartAnalysis).toBe(false);

    // テスト2: 月曜日 09:00 では週次分析タイミングが判定される
    const resultAt0900 = determineAnalysisTiming({
      currentTime: mondayAt0900,
      analysisType: "weekly",
      lastExecutedTime: new Date("2024-01-08T09:00:00Z"),
    });
    expect(resultAt0900.isTimingReached).toBe(true);
    expect(resultAt0900.analysisType).toBe("weekly");
    expect(resultAt0900.shouldStartAnalysis).toBe(true);
    expect(resultAt0900.nextScheduledTime).toEqual(new Date("2024-01-22T09:00:00Z")); // 次週の月曜日 09:00

    // テスト3: 月曜日 09:01 では重複判定されない（lastExecutedTime が更新されている場合）
    const resultAfter0901 = determineAnalysisTiming({
      currentTime: mondayAfter0901,
      analysisType: "weekly",
      lastExecutedTime: mondayAt0900, // 09:00 で既に実行済み
    });
    expect(resultAfter0901.isTimingReached).toBe(false);
    expect(resultAfter0901.shouldStartAnalysis).toBe(false);

    // テスト4: 分析ログ・コールバック検証
    const analysisLog = determineAnalysisTiming({
      currentTime: mondayAt0900,
      analysisType: "weekly",
      lastExecutedTime: new Date("2024-01-08T09:00:00Z"),
    });
    expect(analysisLog.logEntry).toBeDefined();
    expect(analysisLog.logEntry?.timestamp).toEqual(mondayAt0900);
    expect(analysisLog.logEntry?.eventType).toBe("weekly_analysis_triggered");
    expect(analysisLog.logEntry?.status).toBe("started");

    // テスト5: 月曜日以外の日は判定されない（整合性確認）
    const tuesdayAt0900 = new Date("2024-01-16T09:00:00Z"); // 火曜日
    const resultTuesday = determineAnalysisTiming({
      currentTime: tuesdayAt0900,
      analysisType: "weekly",
      lastExecutedTime: new Date("2024-01-08T09:00:00Z"),
    });
    expect(resultTuesday.isTimingReached).toBe(false);
    expect(resultTuesday.shouldStartAnalysis).toBe(false);

    // テスト6: 前回実行からの経過時間が7日以上の場合を検証
    const mondayNextWeek = new Date("2024-01-22T09:00:00Z");
    const resultNextWeek = determineAnalysisTiming({
      currentTime: mondayNextWeek,
      analysisType: "weekly",
      lastExecutedTime: new Date("2024-01-15T09:00:00Z"), // 1週間前
    });
    expect(resultNextWeek.isTimingReached).toBe(true);
    expect(resultNextWeek.shouldStartAnalysis).toBe(true);
    expect(resultNextWeek.daysSinceLastExecution).toBe(7);
  });
});