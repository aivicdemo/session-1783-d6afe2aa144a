import { describe, test, expect } from "@jest/globals";
import { confirmAlgorithmReviewMeetingAttendees } from "../../src/logic/it-1-br-2-1-1-1";

describe("ユーザーの食事記録と栄養摂取量の推移データを自動集計し、栄養項目別の達成度と改善ギャップを可視化するダッシュボード機能", () => {
  // SCEN-586: [error] 定期会議開催予定者確認・代理指定 - 参加予定者情報が存在しない場合にエラーが返される
  test("参加予定者情報が存在しない場合、エラーメッセージと適切なステータスコードが返される", () => {
    const nonexistentMeetingId = "meeting_999";
    const nonexistentScheduleId = "schedule_999";

    expect(() =>
      confirmAlgorithmReviewMeetingAttendees({
        meeting_id: nonexistentMeetingId,
        schedule_id: nonexistentScheduleId,
      })
    ).toThrow(/参加予定者/);
  });
});