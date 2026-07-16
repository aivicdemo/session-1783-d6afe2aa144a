import { determineAlgorithmReviewMeetingSchedule } from "../../src/logic/it-1-br-8-2-1-1";

describe("週次・月次アルゴリズム改善レビュー会議開催判定", () => {
  test("SCEN-254: 開催予定時刻が深夜0時00分である場合、正常に判定されスケジュール登録される", () => {
    // Arrange: 深夜0時00分のタイムスタンプを準備
    const midnightTimestamp = new Date("2024-01-15T00:00:00Z");
    const meetingInput = {
      scheduledTime: midnightTimestamp,
      meetingType: "weekly" as const,
      participantCount: 5,
      isEmergency: false,
    };

    // Act: 会議開催判定ロジックを実行
    const result = determineAlgorithmReviewMeetingSchedule(meetingInput);

    // Assert: 開催判定が『開催予定』であることを確認
    expect(result.shouldProceed).toBe(true);
    expect(result.status).toBe("scheduled");

    // Assert: 登録されたスケジュール情報から開催予定時刻が正確に深夜0時00分で記録されていることを検証
    expect(result.registeredSchedule).toBeDefined();
    expect(result.registeredSchedule.scheduledTime).toEqual(midnightTimestamp);
    expect(result.registeredSchedule.hour).toBe(0);
    expect(result.registeredSchedule.minute).toBe(0);

    // Assert: エラーや警告がないこと
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);

    // Assert: 他の時刻との判定結果と比較して、深夜0時00分が特殊なエッジケースとして正しく処理されていることを確認
    const morningTimestamp = new Date("2024-01-15T09:00:00Z");
    const morningMeetingInput = {
      scheduledTime: morningTimestamp,
      meetingType: "weekly" as const,
      participantCount: 5,
      isEmergency: false,
    };
    const morningResult = determineAlgorithmReviewMeetingSchedule(
      morningMeetingInput
    );

    // 深夜0時00分と09:00の両方が開催予定となることを確認（深夜0時00分の処理に問題がないこと）
    expect(result.shouldProceed).toBe(true);
    expect(morningResult.shouldProceed).toBe(true);
    expect(result.status).toBe(morningResult.status);

    // Assert: スケジュール登録情報の完全性を検証
    expect(result.registeredSchedule.meetingId).toBeDefined();
    expect(result.registeredSchedule.meetingId).toMatch(/^meeting_/);
    expect(result.registeredSchedule.createdAt).toBeDefined();
    expect(typeof result.registeredSchedule.createdAt).toBe("string");

    // Assert: 時刻の正確性を再確認（タイムゾーン処理に問題がないこと）
    const scheduledDate = new Date(result.registeredSchedule.scheduledTime);
    expect(scheduledDate.getUTCHours()).toBe(0);
    expect(scheduledDate.getUTCMinutes()).toBe(0);
    expect(scheduledDate.getUTCSeconds()).toBe(0);
  });
});