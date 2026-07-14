import { calculateNutritionVerificationTiming } from "../../src/logic/it-7-2-1";

describe("栄養基準ロジック検証タイミング確認機能", () => {
  // SCEN-663
  test("前回検証実施日と検証周期から次回検証予定日と対象期間が正確に確定される", () => {
    const lastVerificationDate = new Date("2024-01-15T00:00:00Z");
    const verificationCycleDays = 30;

    const result = calculateNutritionVerificationTiming({
      lastVerificationDate,
      verificationCycleDays,
    });

    const expectedNextVerificationDate = new Date("2024-02-14T00:00:00Z");
    const expectedTargetStartDate = new Date("2024-01-15T00:00:00Z");
    const expectedTargetEndDate = new Date("2024-02-14T00:00:00Z");

    expect(result.nextVerificationDate).toEqual(expectedNextVerificationDate);
    expect(result.targetPeriodStartDate).toEqual(expectedTargetStartDate);
    expect(result.targetPeriodEndDate).toEqual(expectedTargetEndDate);

    expect(result.nextVerificationDate.getTime()).toBe(
      lastVerificationDate.getTime() + verificationCycleDays * 24 * 60 * 60 * 1000
    );

    expect(result.targetPeriodStartDate.getTime()).toBe(
      lastVerificationDate.getTime()
    );

    expect(result.targetPeriodEndDate.getTime()).toBe(
      expectedNextVerificationDate.getTime()
    );

    expect(typeof result.nextVerificationDate).toBe("object");
    expect(result.nextVerificationDate instanceof Date).toBe(true);
    expect(typeof result.targetPeriodStartDate).toBe("object");
    expect(result.targetPeriodStartDate instanceof Date).toBe(true);
    expect(typeof result.targetPeriodEndDate).toBe("object");
    expect(result.targetPeriodEndDate instanceof Date).toBe(true);
  });
});