import { prepareQuarterlyCouncilMeeting } from "../../src/logic/it-7-2-1";

describe("献立生成アルゴリズムの成功・失敗パターン分析と改善提案 - 四半期協議会事前準備", () => {
  // SCEN-841: [error] 四半期協議会事前準備 - 参加者情報が未登録の状態で協議会開催日が到来した場合、準備完了エラーが発生して通知される
  test("参加者情報未登録で協議会開催日が到来した場合、エラー通知が発生し準備状態が未完了のままになること", () => {
    const councilMeetingDate = new Date("2024-01-15T09:00:00Z");
    const currentDateTime = new Date("2024-01-15T08:30:00Z");
    const participants = [];
    const preparationStatus = "incomplete";

    const result = prepareQuarterlyCouncilMeeting({
      councilMeetingDate,
      currentDateTime,
      participants,
      preparationStatus,
    });

    expect(result.success).toBe(false);
    expect(result.errorMessage).toMatch(/参加者情報/);
    expect(result.notificationSent).toBe(true);
    expect(result.notificationType).toBe("error");
    expect(result.finalPreparationStatus).toBe("incomplete");
  });
});