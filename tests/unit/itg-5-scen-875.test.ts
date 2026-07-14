import { determineAttendanceCheckEligibility } from "../../src/logic/it-7-2-1";

describe("週次アルゴリズム改善レビュー会議の出席確認判定", () => {
  // SCEN-875
  test("会議開催予定時刻に到達していない時点では出席確認判定が実行されない", () => {
    const meeting_scheduled_time = new Date("2024-01-15T14:00:00Z");
    const current_system_time = new Date("2024-01-15T13:59:59Z");
    const meeting_id = "meeting_001";
    const participants = [
      { participant_id: "user_001", name: "田中太郎", attendance_status: "未確認" },
      { participant_id: "user_002", name: "佐藤花子", attendance_status: "未確認" },
    ];

    const result = determineAttendanceCheckEligibility({
      meeting_scheduled_time,
      current_system_time,
      meeting_id,
      participants,
    });

    expect(result.should_execute_check).toBe(false);
    expect(result.participants).toEqual([
      { participant_id: "user_001", name: "田中太郎", attendance_status: "未確認" },
      { participant_id: "user_002", name: "佐藤花子", attendance_status: "未確認" },
    ]);
    expect(result.check_skipped_reason).toBe("会議開催予定時刻未到達");
    expect(result.log_entry.event_type).toBe("ATTENDANCE_CHECK_SKIPPED");
    expect(result.log_entry.message).toContain("出席確認判定処理はスキップされました");
    expect(result.log_entry.timestamp).toEqual("2024-01-15T13:59:59Z");
  });
});