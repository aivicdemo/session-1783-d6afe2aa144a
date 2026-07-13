import { generateMealPlanOnSchedule } from "../../src/logic/it-1-br-2-1-1-1";

describe("ユーザー食事記録と栄養摂取量の推移データ自動集計・ダッシュボード", () => {
  // SCEN-313
  test("日曜夜の定期スケジュール時刻に献立生成要求が自動発火され、制約条件が読み込まれて処理キューに登録される", () => {
    const userId = "user_001";
    const familyMembers = [
      {
        familyMemberId: "member_001",
        name: "子ども1",
        age: 8,
        allergies: ["egg"],
        dietaryRestrictions: ["low_sugar"],
      },
      {
        familyMemberId: "member_002",
        name: "子ども2",
        age: 12,
        allergies: ["peanut"],
        dietaryRestrictions: [],
      },
    ];
    const budget = 5000;
    const cookingTimeLimit = 45;
    const scheduleTime = "21:00";
    const scheduleDayOfWeek = 0; // 日曜日

    const result = generateMealPlanOnSchedule({
      userId,
      familyMembers,
      budget,
      cookingTimeLimit,
      scheduleTime,
      scheduleDayOfWeek,
    });

    // 献立生成要求が発火されたことを確認
    expect(result.requestTriggered).toBe(true);

    // 要求ID が生成されている
    expect(result.requestId).toBeDefined();
    expect(typeof result.requestId).toBe("string");
    expect(result.requestId.length).toBeGreaterThan(0);

    // 読み込まれた制約条件が正しいことを確認
    expect(result.constraintsLoaded).toBe(true);
    expect(result.constraints).toEqual({
      userId,
      familyMembers,
      budget,
      cookingTimeLimit,
    });

    // 処理キューに登録されていることを確認
    expect(result.queueStatus).toBe("enqueued");

    // システムログにイベントが記録されていることを確認
    expect(result.eventLogged).toBe(true);
    expect(result.logEntry).toBeDefined();
    expect(result.logEntry.eventType).toBe("MEAL_PLAN_REQUEST_TRIGGERED");
    expect(result.logEntry.timestamp).toBeDefined();
    expect(result.logEntry.userId).toBe(userId);

    // スケジュール実行時刻の情報が記録されていることを確認
    expect(result.scheduledExecutionTime).toBe(scheduleTime);
    expect(result.scheduledDayOfWeek).toBe(scheduleDayOfWeek);
  });
});