import { validateMealEvaluationInputDeadline } from "../../src/logic/it-1-br-1783670064270-1-1-1";

describe("食事評価入力期限管理機能", () => {
  // SCEN-453: [edge] 食事評価入力期限管理機能 - 入力期限が0時間の場合でも正常に判定される
  test("入力期限が0時間の場合、期限切れ判定が正常に動作する", () => {
    const deadline_hours = 0;
    const meal_completion_time = new Date("2024-01-15T18:00:00Z");
    const current_time = new Date("2024-01-15T18:00:00Z");

    const result = validateMealEvaluationInputDeadline({
      deadline_hours,
      meal_completion_time,
      current_time,
    });

    expect(result).toEqual({
      is_expired: true,
      deadline_timestamp: new Date("2024-01-15T18:00:00Z"),
      is_valid_config: true,
      status: "expired",
    });
  });

  test("入力期限が0時間で、現在時刻が期限時刻より1秒後の場合、期限切れと判定される", () => {
    const deadline_hours = 0;
    const meal_completion_time = new Date("2024-01-15T18:00:00Z");
    const current_time = new Date("2024-01-15T18:00:01Z");

    const result = validateMealEvaluationInputDeadline({
      deadline_hours,
      meal_completion_time,
      current_time,
    });

    expect(result).toEqual({
      is_expired: true,
      deadline_timestamp: new Date("2024-01-15T18:00:00Z"),
      is_valid_config: true,
      status: "expired",
    });
  });

  test("入力期限が0時間で、現在時刻が期限時刻より1秒前の場合、期限内と判定される", () => {
    const deadline_hours = 0;
    const meal_completion_time = new Date("2024-01-15T18:00:00Z");
    const current_time = new Date("2024-01-15T17:59:59Z");

    const result = validateMealEvaluationInputDeadline({
      deadline_hours,
      meal_completion_time,
      current_time,
    });

    expect(result).toEqual({
      is_expired: false,
      deadline_timestamp: new Date("2024-01-15T18:00:00Z"),
      is_valid_config: true,
      status: "valid",
    });
  });

  test("入力期限が負の値の場合、設定値エラーを返す", () => {
    const deadline_hours = -1;
    const meal_completion_time = new Date("2024-01-15T18:00:00Z");
    const current_time = new Date("2024-01-15T18:00:00Z");

    expect(() =>
      validateMealEvaluationInputDeadline({
        deadline_hours,
        meal_completion_time,
        current_time,
      })
    ).toThrow(/期限/);
  });

  test("入力期限が24時間の場合、24時間後が期限として計算される", () => {
    const deadline_hours = 24;
    const meal_completion_time = new Date("2024-01-15T18:00:00Z");
    const current_time = new Date("2024-01-16T18:00:00Z");

    const result = validateMealEvaluationInputDeadline({
      deadline_hours,
      meal_completion_time,
      current_time,
    });

    expect(result).toEqual({
      is_expired: true,
      deadline_timestamp: new Date("2024-01-16T18:00:00Z"),
      is_valid_config: true,
      status: "expired",
    });
  });

  test("入力期限が24時間の場合、23時間59分59秒時点では期限内と判定される", () => {
    const deadline_hours = 24;
    const meal_completion_time = new Date("2024-01-15T18:00:00Z");
    const current_time = new Date("2024-01-16T17:59:59Z");

    const result = validateMealEvaluationInputDeadline({
      deadline_hours,
      meal_completion_time,
      current_time,
    });

    expect(result).toEqual({
      is_expired: false,
      deadline_timestamp: new Date("2024-01-16T18:00:00Z"),
      is_valid_config: true,
      status: "valid",
    });
  });

  test("meal_completion_timeがnullの場合、バリデーションエラーを返す", () => {
    const deadline_hours = 0;
    const meal_completion_time = null;
    const current_time = new Date("2024-01-15T18:00:00Z");

    expect(() =>
      validateMealEvaluationInputDeadline({
        deadline_hours,
        meal_completion_time: meal_completion_time as any,
        current_time,
      })
    ).toThrow(/完了時刻/);
  });

  test("current_timeがnullの場合、バリデーションエラーを返す", () => {
    const deadline_hours = 0;
    const meal_completion_time = new Date("2024-01-15T18:00:00Z");
    const current_time = null;

    expect(() =>
      validateMealEvaluationInputDeadline({
        deadline_hours,
        meal_completion_time,
        current_time: current_time as any,
      })
    ).toThrow(/現在時刻/);
  });

  test("入力期限が0時間で、複数の食事評価に対して並行判定が可能である", () => {
    const deadline_hours = 0;

    const result1 = validateMealEvaluationInputDeadline({
      deadline_hours,
      meal_completion_time: new Date("2024-01-15T18:00:00Z"),
      current_time: new Date("2024-01-15T18:00:00Z"),
    });

    const result2 = validateMealEvaluationInputDeadline({
      deadline_hours,
      meal_completion_time: new Date("2024-01-15T19:00:00Z"),
      current_time: new Date("2024-01-15T19:00:00Z"),
    });

    expect(result1.is_expired).toBe(true);
    expect(result2.is_expired).toBe(true);
    expect(result1.status).toBe("expired");
    expect(result2.status).toBe("expired");
  });
});