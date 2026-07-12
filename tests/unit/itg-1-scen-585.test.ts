import { confirmWeeklyReviewParticipants } from "../../src/logic/it-1-1-1";

describe("週次アルゴリズム改善レビュー会議参加者確認", () => {
  test("SCEN-585: 定期開催日時に到達すると参加者確認と代理割り当てが完了し参加者リストが確定される", () => {
    const scheduleDateTime = new Date("2024-01-15T09:00:00Z");
    const currentDateTime = new Date("2024-01-15T09:00:00Z");

    const primaryParticipants = [
      {
        user_id: "user_001",
        participant_name: "田中太郎",
        participant_role: "PM",
        email: "tanaka@example.com",
        attendance_status: "attended",
        confirmed_at: new Date("2024-01-15T08:30:00Z"),
      },
      {
        user_id: "user_002",
        participant_name: "佐藤次郎",
        participant_role: "開発リード",
        email: "sato@example.com",
        attendance_status: "absent",
        confirmed_at: new Date("2024-01-15T08:45:00Z"),
      },
      {
        user_id: "user_003",
        participant_name: "鈴木三郎",
        participant_role: "栄養士",
        email: "suzuki@example.com",
        attendance_status: "attended",
        confirmed_at: new Date("2024-01-15T08:20:00Z"),
      },
      {
        user_id: "user_004",
        participant_name: "伊藤四郎",
        participant_role: "QA",
        email: "ito@example.com",
        attendance_status: "unanswered",
        confirmed_at: null,
      },
    ];

    const substitutes = [
      {
        absent_user_id: "user_002",
        substitute_user_id: "user_005",
        substitute_name: "高橋五郎",
        substitute_role: "開発リード（代理）",
        substitute_email: "takahashi@example.com",
        assignment_reason: "欠席通知により自動割り当て",
        assigned_at: new Date("2024-01-15T09:00:00Z"),
      },
      {
        absent_user_id: "user_004",
        substitute_user_id: "user_006",
        substitute_name: "渡辺六郎",
        substitute_role: "QA（代理）",
        substitute_email: "watanabe@example.com",
        assignment_reason: "未回答により自動割り当て",
        assigned_at: new Date("2024-01-15T09:00:00Z"),
      },
    ];

    const result = confirmWeeklyReviewParticipants({
      schedule_datetime: scheduleDateTime,
      current_datetime: currentDateTime,
      primary_participants: primaryParticipants,
      substitutes,
    });

    expect(result.confirmation_executed).toBe(true);
    expect(result.confirmation_timestamp).toEqual(
      new Date("2024-01-15T09:00:00Z")
    );

    expect(result.attendance_summary.total_participants).toBe(4);
    expect(result.attendance_summary.attended_count).toBe(2);
    expect(result.attendance_summary.absent_count).toBe(1);
    expect(result.attendance_summary.unanswered_count).toBe(1);

    expect(result.absent_participants).toHaveLength(2);
    expect(result.absent_participants[0]).toEqual({
      user_id: "user_002",
      participant_name: "佐藤次郎",
      participant_role: "開発リード",
      absence_reason: "欠席通知",
    });
    expect(result.absent_participants[1]).toEqual({
      user_id: "user_004",
      participant_name: "伊藤四郎",
      participant_role: "QA",
      absence_reason: "未回答",
    });

    expect(result.substitute_assignments).toHaveLength(2);
    expect(result.substitute_assignments[0]).toEqual({
      absent_user_id: "user_002",
      substitute_user_id: "user_005",
      substitute_name: "高橋五郎",
      substitute_role: "開発リード（代理）",
      assignment_status: "confirmed",
    });
    expect(result.substitute_assignments[1]).toEqual({
      absent_user_id: "user_004",
      substitute_user_id: "user_006",
      substitute_name: "渡辺六郎",
      substitute_role: "QA（代理）",
      assignment_status: "confirmed",
    });

    const finalParticipantList = result.final_participant_list;
    expect(finalParticipantList).toHaveLength(4);

    expect(finalParticipantList[0]).toEqual({
      participant_id: "user_001",
      participant_name: "田中太郎",
      participant_role: "PM",
      email: "tanaka@example.com",
      attendance_type: "primary",
      is_attending: true,
    });

    expect(finalParticipantList[1]).toEqual({
      participant_id: "user_005",
      participant_name: "高橋五郎",
      participant_role: "開発リード（代理）",
      email: "takahashi@example.com",
      attendance_type: "substitute",
      is_attending: true,
    });

    expect(finalParticipantList[2]).toEqual({
      participant_id: "user_003",
      participant_name: "鈴木三郎",
      participant_role: "栄養士",
      email: "suzuki@example.com",
      attendance_type: "primary",
      is_attending: true,
    });

    expect(finalParticipantList[3]).toEqual({
      participant_id: "user_006",
      participant_name: "渡辺六郎",
      participant_role: "QA（代理）",
      email: "watanabe@example.com",
      attendance_type: "substitute",
      is_attending: true,
    });

    expect(result.finalization_status).toBe("confirmed");
    expect(result.finalized_at).toEqual(new Date("2024-01-15T09:00:00Z"));
    expect(result.database_saved).toBe(true);
    expect(result.saved_record_id).toBeTruthy();
    expect(typeof result.saved_record_id).toBe("string");
  });
});