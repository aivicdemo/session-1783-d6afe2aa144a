import { determineConferenceStatusWithAbsentees } from "../../src/logic/it-1-br-2-1-1-1";

describe("ユーザー食事記録と栄養摂取量の推移分析・栄養基準ロジック検証", () => {
  test("SCEN-588: 必須参加者が全員不在かつ代理者が指定されていない場合に会議延期判定が下される", () => {
    // Arrange: テスト用の定期会議スケジュール・参加者を準備
    const conferenceId = "conf_20240115_001";
    const conferenceName = "月次アルゴリズム改善レビュー会議";
    const scheduledDateTime = new Date("2024-01-15T09:00:00Z");

    const requiredAttendees = [
      {
        attendeeId: "user_pm_001",
        role: "プロダクトマネージャー",
        attendanceStatus: "不在",
        delegateId: null,
      },
      {
        attendeeId: "user_dev_001",
        role: "アプリ開発リーダー",
        attendanceStatus: "不在",
        delegateId: null,
      },
      {
        attendeeId: "user_nutritionist_001",
        role: "栄養士",
        attendanceStatus: "不在",
        delegateId: null,
      },
    ];

    const conferenceInput = {
      conferenceId,
      conferenceName,
      scheduledDateTime,
      requiredAttendees,
      minRequiredAttendeeCount: 3,
    };

    // Act: 会議延期判定処理を実行
    const result = determineConferenceStatusWithAbsentees(conferenceInput);

    // Assert: 期待される結果を検証
    // 1. 会議ステータスが『延期』に変更されることを確認
    expect(result.conferenceStatus).toBe("延期");

    // 2. 延期理由が正確に記録されることを確認
    expect(result.postponeReason).toBe(
      "必須参加者の全員不在及び代理者未指定"
    );

    // 3. 延期判定のトリガー条件を確認
    expect(result.allRequiredAbsent).toBe(true);
    expect(result.noDelegate).toBe(true);

    // 4. 出席予定者数が 0 であることを確認
    expect(result.confirmedAttendeeCount).toBe(0);

    // 5. タイムスタンプが記録されていることを確認
    expect(result.postponementTimestamp).toBeDefined();
    expect(typeof result.postponementTimestamp).toBe("string");

    // 6. 会議 ID が保持されていることを確認
    expect(result.conferenceId).toBe(conferenceId);

    // 7. 必須参加者全員のステータスが「不在」で代理者なしであることを確認
    const attendeeCheckResults = result.attendeeValidation;
    expect(attendeeCheckResults).toHaveLength(3);
    expect(
      attendeeCheckResults.every(
        (a) =>
          a.attendanceStatus === "不在" &&
          a.delegateId === null &&
          a.delegatePresent === false
      )
    ).toBe(true);

    // 8. 会議状況判定フラグが正確であることを確認
    expect(result.canProceedWithConference).toBe(false);
    expect(result.requiresRescheduling).toBe(true);

    // 9. 必須参加者数と実出席者数の差を確認
    expect(result.totalRequiredAttendees).toBe(3);
    expect(result.absentRequiredAttendees).toBe(3);
    expect(result.availableDelegates).toBe(0);
  });
});