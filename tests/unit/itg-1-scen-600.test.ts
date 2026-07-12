import { validateMeetingParticipants } from "../../src/logic/it-1-1-1";

describe("会議参加者出席確認・代理者指定機能", () => {
  // SCEN-600: [edge] 会議参加者出席確認・代理者指定機能 - 参加予定者の一部が不在でも代理者指定が可能な場合、会議開催判定が下される
  test("参加予定者5名のうち3名出席、2名不在で、不在者1名に代理者を指定した場合、会議開催判定が『開催可能』となること", () => {
    const meeting_id = "MTG-2025-01-15-001";
    const scheduled_participants = [
      {
        participant_id: "P001",
        participant_name: "太郎",
        attendance_status: "attended",
        substitute_id: null,
      },
      {
        participant_id: "P002",
        participant_name: "花子",
        attendance_status: "attended",
        substitute_id: null,
      },
      {
        participant_id: "P003",
        participant_name: "次郎",
        attendance_status: "attended",
        substitute_id: null,
      },
      {
        participant_id: "P004",
        participant_name: "美咲",
        attendance_status: "absent",
        substitute_id: "S001",
      },
      {
        participant_id: "P005",
        participant_name: "健一",
        attendance_status: "absent",
        substitute_id: null,
      },
    ];

    const result = validateMeetingParticipants({
      meeting_id,
      scheduled_participants,
      minimum_required_participants: 3,
    });

    expect(result.actual_attendees_count).toBe(3);
    expect(result.effective_attendees_count).toBe(4);
    expect(result.meeting_status).toBe("can_proceed");
    expect(result.is_valid).toBe(true);
    expect(result.absent_without_substitute).toEqual([
      {
        participant_id: "P005",
        participant_name: "健一",
      },
    ]);
  });
});