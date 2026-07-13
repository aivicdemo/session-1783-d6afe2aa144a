import { confirmMeetingParticipants } from "../../src/logic/it-1-br-2-1-2-1";

describe("Algorithm Improvement Review Meeting Participant Confirmation", () => {
  // SCEN-570: [normal] アルゴリズム改善レビュー会議参加者確認・代理割り当て機能 - 定期開催日時に到達した際、全参加者の出席確認が完了し参加者リストが確定される
  test("should confirm all meeting participants and finalize participant list when scheduled meeting time is reached", () => {
    const scheduled_meeting_time = new Date("2024-06-10T09:00:00Z");
    const current_time_before_meeting = new Date("2024-06-10T08:30:00Z");
    const current_time_at_meeting = new Date("2024-06-10T09:00:00Z");

    const meeting_id = "meeting_20240610_001";
    const participants = [
      {
        participant_id: "nutritionist_001",
        name: "田中栄養士",
        role: "nutritionist",
        attendance_status: "confirmed",
        is_proxy: false,
      },
      {
        participant_id: "dev_lead_001",
        name: "佐藤開発リード",
        role: "dev_lead",
        attendance_status: "confirmed",
        is_proxy: false,
      },
      {
        participant_id: "pm_001",
        name: "鈴木PM",
        role: "product_manager",
        attendance_status: "confirmed",
        is_proxy: false,
      },
    ];

    const input = {
      meeting_id: meeting_id,
      scheduled_meeting_time: scheduled_meeting_time,
      current_time: current_time_at_meeting,
      participants: participants,
    };

    const result = confirmMeetingParticipants(input);

    expect(result.meeting_id).toBe(meeting_id);
    expect(result.is_finalized).toBe(true);
    expect(result.finalization_time).toEqual(current_time_at_meeting);
    expect(result.total_participants).toBe(3);
    expect(result.confirmed_participants).toBe(3);
    expect(result.absent_participants).toBe(0);
    expect(result.participants.length).toBe(3);
    expect(
      result.participants.every((p) => p.attendance_status === "confirmed")
    ).toBe(true);
    expect(
      result.participants.every(
        (p) => p.final_status === "attending" || p.final_status === "proxy"
      )
    ).toBe(true);
  });
});