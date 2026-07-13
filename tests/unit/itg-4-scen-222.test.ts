import { determineDemandAnalysisTiming } from "../../src/logic/it-1-br-6-2-1";

describe("需要予測精度検証ダッシュボード：分析タイミング判定機能", () => {
  // SCEN-222: [normal] 分析タイミング判定機能 - 毎週月曜日09:00に週次分析タイミングが正しく判定される
  test("SCEN-222: 毎週月曜日09:00に週次分析タイミングが判定される", () => {
    // テストケース1: 月曜日08:59 → 週次分析タイミングが判定されない
    const beforeTargetTime = new Date("2024-01-08T08:59:00Z"); // 月曜日 08:59 (UTC)
    const resultBefore = determineDemandAnalysisTiming(beforeTargetTime);
    expect(resultBefore.isTimingDetected).toBe(false);
    expect(resultBefore.analysisType).toBeNull();

    // テストケース2: 月曜日09:00 → 週次分析タイミングが判定される
    const atTargetTime = new Date("2024-01-08T09:00:00Z"); // 月曜日 09:00 (UTC)
    const resultAt = determineDemandAnalysisTiming(atTargetTime);
    expect(resultAt.isTimingDetected).toBe(true);
    expect(resultAt.analysisType).toBe("weekly");

    // テストケース3: 月曜日09:01 → 週次分析タイミングが継続して判定される
    const afterTargetTime = new Date("2024-01-08T09:01:00Z"); // 月曜日 09:01 (UTC)
    const resultAfter = determineDemandAnalysisTiming(afterTargetTime);
    expect(resultAfter.isTimingDetected).toBe(true);
    expect(resultAfter.analysisType).toBe("weekly");

    // テストケース4-6: 複数週（3週間）にわたって月曜日09:00での判定を検証
    // 第2週: 2024-01-15 (月曜日)
    const week2Monday = new Date("2024-01-15T09:00:00Z");
    const resultWeek2 = determineDemandAnalysisTiming(week2Monday);
    expect(resultWeek2.isTimingDetected).toBe(true);
    expect(resultWeek2.analysisType).toBe("weekly");

    // 第3週: 2024-01-22 (月曜日)
    const week3Monday = new Date("2024-01-22T09:00:00Z");
    const resultWeek3 = determineDemandAnalysisTiming(week3Monday);
    expect(resultWeek3.isTimingDetected).toBe(true);
    expect(resultWeek3.analysisType).toBe("weekly");

    // 第4週: 2024-01-29 (月曜日)
    const week4Monday = new Date("2024-01-29T09:00:00Z");
    const resultWeek4 = determineDemandAnalysisTiming(week4Monday);
    expect(resultWeek4.isTimingDetected).toBe(true);
    expect(resultWeek4.analysisType).toBe("weekly");

    // 一貫性の確認: すべての月曜日09:00での判定結果が同じであることを検証
    expect(resultAt.isTimingDetected).toEqual(resultWeek2.isTimingDetected);
    expect(resultAt.analysisType).toEqual(resultWeek2.analysisType);
    expect(resultWeek2.isTimingDetected).toEqual(resultWeek3.isTimingDetected);
    expect(resultWeek2.analysisType).toEqual(resultWeek3.analysisType);
    expect(resultWeek3.isTimingDetected).toEqual(resultWeek4.isTimingDetected);
    expect(resultWeek3.analysisType).toEqual(resultWeek4.analysisType);
  });
});