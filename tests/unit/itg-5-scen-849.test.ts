import { confirmAlgorithmReviewMeetingParticipants } from "../../src/logic/it-7-2-1";

describe("アルゴリズム改善レビュー会議参加者確認", () => {
  test("SCEN-849: 重大なアルゴリズム障害発生時に定期開催予定外の会議が自動作成され、参加者確認プロセスが即座に実行される", () => {
    // 重大なアルゴリズム障害を示すテストデータ
    const criticalFailureEvent = {
      eventId: "ALG_FAIL_20240115_001",
      severity: "CRITICAL",
      detectionTimestamp: new Date("2024-01-15T14:30:00Z"),
      failureType: "献立生成成功率が閾値以下",
      description: "献立生成成功率が 30% に低下（目標値: 85%以上）",
      impactedUserCount: 1250,
    };

    // 自動作成される臨時会議の予期される情報
    const expectedMeetingDetails = {
      meetingId: "REVIEW_MEET_20240115_14_30_EMERGENCY",
      title: "【緊急】アルゴリズム改善レビュー会議 - 重大障害対応",
      createdAtTimestamp: new Date("2024-01-15T14:30:05Z"),
      scheduledStartTime: new Date("2024-01-15T15:00:00Z"),
      meetingType: "EMERGENCY",
      triggeringFailureEventId: "ALG_FAIL_20240115_001",
    };

    // 会議参加者リストの期待値
    const expectedParticipants = [
      {
        participantId: "USR_PM_001",
        role: "プロダクトマネージャー",
        email: "pm@example.com",
      },
      {
        participantId: "USR_DEV_LEAD_001",
        role: "開発チームリーダー",
        email: "dev.lead@example.com",
      },
      {
        participantId: "USR_NUTRITIONIST_001",
        role: "栄養士",
        email: "nutritionist@example.com",
      },
      {
        participantId: "USR_OPS_001",
        role: "運用管理者",
        email: "ops@example.com",
      },
    ];

    // 参加者確認プロセスの実行結果
    const participantConfirmationResult = confirmAlgorithmReviewMeetingParticipants(
      {
        failureEvent: criticalFailureEvent,
        meetingDetails: expectedMeetingDetails,
        potentialParticipants: expectedParticipants,
        currentTimestamp: new Date("2024-01-15T14:30:05Z"),
      }
    );

    // 会議が正常に作成されたことを検証
    expect(participantConfirmationResult.meetingCreated).toBe(true);
    expect(participantConfirmationResult.emergencyMeetingId).toBe(
      "REVIEW_MEET_20240115_14_30_EMERGENCY"
    );
    expect(participantConfirmationResult.emergencyMeetingTitle).toBe(
      "【緊急】アルゴリズム改善レビュー会議 - 重大障害対応"
    );

    // 会議作成タイムスタンプが正確であることを検証（障害検出から5秒以内）
    expect(participantConfirmationResult.meetingCreatedTimestamp).toEqual(
      new Date("2024-01-15T14:30:05Z")
    );

    // 参加者確認プロセスが自動で実行されたことを検証
    expect(participantConfirmationResult.participantConfirmationExecuted).toBe(
      true
    );
    expect(participantConfirmationResult.confirmationStartedTimestamp).toEqual(
      new Date("2024-01-15T14:30:05Z")
    );

    // 会議参加者リストが正常に取得・確定されたことを検証
    expect(
      participantConfirmationResult.confirmedParticipants.length
    ).toBe(4);
    expect(
      participantConfirmationResult.confirmedParticipants[0].participantId
    ).toBe("USR_PM_001");
    expect(participantConfirmationResult.confirmedParticipants[0].role).toBe(
      "プロダクトマネージャー"
    );
    expect(
      participantConfirmationResult.confirmedParticipants[1].participantId
    ).toBe("USR_DEV_LEAD_001");
    expect(participantConfirmationResult.confirmedParticipants[1].role).toBe(
      "開発チームリーダー"
    );
    expect(
      participantConfirmationResult.confirmedParticipants[2].participantId
    ).toBe("USR_NUTRITIONIST_001");
    expect(participantConfirmationResult.confirmedParticipants[2].role).toBe(
      "栄養士"
    );
    expect(
      participantConfirmationResult.confirmedParticipants[3].participantId
    ).toBe("USR_OPS_001");
    expect(participantConfirmationResult.confirmedParticipants[3].role).toBe(
      "運用管理者"
    );

    // 参加者への通知が送信されたことを検証
    expect(participantConfirmationResult.notificationsSent).toBe(true);
    expect(participantConfirmationResult.notificationCount).toBe(4);
    expect(
      participantConfirmationResult.notificationSentTimestamp
    ).toEqual(new Date("2024-01-15T14:30:06Z"));

    // 参加者確認プロセスの完了ステータスを検証
    expect(participantConfirmationResult.confirmationStatus).toBe("COMPLETED");
    expect(participantConfirmationResult.confirmationCompletedTimestamp).toEqual(
      new Date("2024-01-15T14:30:06Z")
    );

    // 障害との紐付けが正常に記録されたことを検証
    expect(participantConfirmationResult.linkedFailureEventId).toBe(
      "ALG_FAIL_20240115_001"
    );
    expect(participantConfirmationResult.failureSeverity).toBe("CRITICAL");

    // 会議スケジュール（開始予定時刻）が正確に設定されたことを検証
    expect(participantConfirmationResult.scheduledMeetingStartTime).toEqual(
      new Date("2024-01-15T15:00:00Z")
    );

    // 全体的なプロセス実行時間が2分以内であることを検証（障害検出から会議スケジュール設定まで）
    const totalExecutionTimeMs =
      participantConfirmationResult.scheduledMeetingStartTime.getTime() -
      criticalFailureEvent.detectionTimestamp.getTime();
    expect(totalExecutionTimeMs).toBeLessThanOrEqual(30 * 1000); // 30秒以内

    // システムログが正常に記録されたことを検証
    expect(participantConfirmationResult.systemLogGenerated).toBe(true);
    expect(participantConfirmationResult.logEntryCount).toBeGreaterThanOrEqual(
      3
    ); // 最低3つのイベント（会議作成、参加者確認開始、通知送信）
  });
});