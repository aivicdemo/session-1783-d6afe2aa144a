import { determinePrimaryValidationCycleAndSchedule } from "../../src/logic/it-1-br-2-1-2-1";

describe("栄養基準ロジック検証サイクルの自動決定とスケジュール設定", () => {
  // SCEN-512: [edge] 検証サイクルの自動決定とスケジュール設定 - 前回検証からの経過時間が境界値で、正しい検証頻度が決定される
  test("前回検証からの経過時間が境界値に達した場合、適切な検証頻度が自動決定され、スケジュール設定が正確に適用される", () => {
    // 境界値テスト: 月次検証境界値（30日）を基準とした複数パターン

    // ケース 1: 前回検証からちょうど 30 日経過した場合（月次→月次継続）
    const lastValidationTime_30days = new Date("2024-01-15T10:00:00Z");
    const currentTime_30days = new Date("2024-02-14T10:00:00Z"); // 30 日後
    const elapsedDays_30days = 30;

    const result_30days = determinePrimaryValidationCycleAndSchedule({
      lastValidationTimestamp: lastValidationTime_30days,
      currentTimestamp: currentTime_30days,
      elapsedDays: elapsedDays_30days,
      userSegmentType: "standard_household",
    });

    expect(result_30days.validationFrequency).toBe("monthly");
    expect(result_30days.nextScheduledValidationDate).toEqual(
      new Date("2024-03-14T10:00:00Z")
    );
    expect(result_30days.validationCycleDecisionConfidence).toBe(1.0);
    expect(result_30days.scheduleUpdateApplied).toBe(true);

    // ケース 2: 前回検証から 29 日 59 分 59 秒経過した場合（月次→月次継続、境界値前）
    const lastValidationTime_boundary_before = new Date("2024-01-15T10:00:00Z");
    const currentTime_boundary_before = new Date("2024-02-14T09:59:59Z"); // 29 日 23 時間 59 分 59 秒後
    const elapsedDays_boundary_before = 29.9999;

    const result_boundary_before =
      determinePrimaryValidationCycleAndSchedule({
        lastValidationTimestamp: lastValidationTime_boundary_before,
        currentTimestamp: currentTime_boundary_before,
        elapsedDays: elapsedDays_boundary_before,
        userSegmentType: "standard_household",
      });

    expect(result_boundary_before.validationFrequency).toBe("monthly");
    expect(result_boundary_before.nextScheduledValidationDate).toEqual(
      new Date("2024-03-14T10:00:00Z")
    );
    expect(result_boundary_before.validationCycleDecisionConfidence).toBe(0.95);

    // ケース 3: 前回検証から 30 日 1 分経過した場合（月次→四半期へ更新）
    const lastValidationTime_boundary_after = new Date("2024-01-15T10:00:00Z");
    const currentTime_boundary_after = new Date("2024-02-14T11:01:00Z"); // 30 日 1 分後
    const elapsedDays_boundary_after = 30.0007;

    const result_boundary_after =
      determinePrimaryValidationCycleAndSchedule({
        lastValidationTimestamp: lastValidationTime_boundary_after,
        currentTimestamp: currentTime_boundary_after,
        elapsedDays: elapsedDays_boundary_after,
        userSegmentType: "standard_household",
      });

    expect(result_boundary_after.validationFrequency).toBe("quarterly");
    expect(result_boundary_after.nextScheduledValidationDate).toEqual(
      new Date("2024-05-14T10:00:00Z")
    );
    expect(result_boundary_after.validationCycleDecisionConfidence).toBe(1.0);
    expect(result_boundary_after.scheduleUpdateApplied).toBe(true);

    // ケース 4: 前回検証から 60 日経過した場合（月次を大きく超過→四半期）
    const lastValidationTime_60days = new Date("2024-01-15T10:00:00Z");
    const currentTime_60days = new Date("2024-03-15T10:00:00Z"); // 60 日後
    const elapsedDays_60days = 60;

    const result_60days = determinePrimaryValidationCycleAndSchedule({
      lastValidationTimestamp: lastValidationTime_60days,
      currentTimestamp: currentTime_60days,
      elapsedDays: elapsedDays_60days,
      userSegmentType: "standard_household",
    });

    expect(result_60days.validationFrequency).toBe("quarterly");
    expect(result_60days.nextScheduledValidationDate).toEqual(
      new Date("2024-06-14T10:00:00Z")
    );
    expect(result_60days.validationCycleDecisionConfidence).toBe(1.0);

    // ケース 5: 前回検証から 90 日経過した場合（四半期境界）
    const lastValidationTime_90days = new Date("2024-01-15T10:00:00Z");
    const currentTime_90days = new Date("2024-04-14T10:00:00Z"); // 90 日後
    const elapsedDays_90days = 90;

    const result_90days = determinePrimaryValidationCycleAndSchedule({
      lastValidationTimestamp: lastValidationTime_90days,
      currentTimestamp: currentTime_90days,
      elapsedDays: elapsedDays_90days,
      userSegmentType: "standard_household",
    });

    expect(result_90days.validationFrequency).toBe("quarterly");
    expect(result_90days.nextScheduledValidationDate).toEqual(
      new Date("2024-07-14T10:00:00Z")
    );
    expect(result_90days.validationCycleDecisionConfidence).toBe(1.0);

    // ケース 6: 前回検証から 89 日 59 分 59 秒経過した場合（四半期境界前）
    const lastValidationTime_boundary_q_before = new Date("2024-01-15T10:00:00Z");
    const currentTime_boundary_q_before = new Date("2024-04-14T09:59:59Z"); // 89 日 23 時間 59 分 59 秒後
    const elapsedDays_boundary_q_before = 89.9999;

    const result_boundary_q_before =
      determinePrimaryValidationCycleAndSchedule({
        lastValidationTimestamp: lastValidationTime_boundary_q_before,
        currentTimestamp: currentTime_boundary_q_before,
        elapsedDays: elapsedDays_boundary_q_before,
        userSegmentType: "standard_household",
      });

    expect(result_boundary_q_before.validationFrequency).toBe("quarterly");
    expect(result_boundary_q_before.nextScheduledValidationDate).toEqual(
      new Date("2024-07-14T10:00:00Z")
    );

    // ケース 7: 前回検証から 90 日 1 分経過した場合（四半期→半年へ更新）
    const lastValidationTime_boundary_q_after = new Date("2024-01-15T10:00:00Z");
    const currentTime_boundary_q_after = new Date("2024-04-14T11:01:00Z"); // 90 日 1 分後
    const elapsedDays_boundary_q_after = 90.0007;

    const result_boundary_q_after =
      determinePrimaryValidationCycleAndSchedule({
        lastValidationTimestamp: lastValidationTime_boundary_q_after,
        currentTimestamp: currentTime_boundary_q_after,
        elapsedDays: elapsedDays_boundary_q_after,
        userSegmentType: "standard_household",
      });

    expect(result_boundary_q_after.validationFrequency).toBe("semi-annual");
    expect(result_boundary_q_after.nextScheduledValidationDate).toEqual(
      new Date("2024-10-14T10:00:00Z")
    );
    expect(result_boundary_q_after.validationCycleDecisionConfidence).toBe(1.0);
    expect(result_boundary_q_after.scheduleUpdateApplied).toBe(true);

    // ケース 8: 検証サイクル決定による次回予定日時の登録確認
    const result_with_schedule = determinePrimaryValidationCycleAndSchedule({
      lastValidationTimestamp: new Date("2024-01-15T10:00:00Z"),
      currentTimestamp: new Date("2024-02-14T10:00:00Z"),
      elapsedDays: 30,
      userSegmentType: "standard_household",
    });

    expect(result_with_schedule.nextScheduledValidationDate).toBeDefined();
    expect(
      result_with_schedule.nextScheduledValidationDate.getTime()
    ).toBeGreaterThan(result_with_schedule.currentTimestamp.getTime());
    expect(result_with_schedule.validationAuditLog).toBeDefined();
    expect(result_with_schedule.validationAuditLog.decisionTimestamp).toEqual(
      new Date("2024-02-14T10:00:00Z")
    );
    expect(result_with_schedule.validationAuditLog.selectedCycle).toBe(
      "monthly"
    );
  });
});