import { aggregateRejectionReasonsWeekly } from "../../src/logic/it-7-3-1";

describe("献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能", () => {
  // SCEN-904
  test("日曜日以外の日時に手動で集約を実行しようとした場合、エラーが返される", () => {
    const tuesday = new Date("2024-01-16T09:00:00Z"); // 火曜日
    const userId = "user_001";
    const manualTrigger = true;

    expect(() =>
      aggregateRejectionReasonsWeekly({
        currentDateTime: tuesday,
        userId: userId,
        isManualTrigger: manualTrigger,
      })
    ).toThrow(/日曜日/);
  });
});