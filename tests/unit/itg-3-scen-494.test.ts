import { generateQuarterlyConferencePreparation } from "../../src/logic/it-1-br-6-2-1-1";

describe("食材流通業者・スーパーの在庫・価格データ連携インターフェース", () => {
  // SCEN-494
  test("協議会参加者が登録されていない場合、準備自動生成がエラーで停止する", () => {
    const conferenceId = "Q1_2024_CONFERENCE";
    const participantList: string[] = [];
    const seasonalPatterns = [
      { name: "春野菜", period: "Mar-May", priority: 1 },
    ];
    const discountThresholds = [
      { category: "野菜", threshold: 20, priority: 2 },
    ];
    const promotionPeriods = [
      { name: "春セール", startDate: "2024-03-01", endDate: "2024-05-31" },
    ];

    expect(() =>
      generateQuarterlyConferencePreparation({
        conferenceId,
        participantList,
        seasonalPatterns,
        discountThresholds,
        promotionPeriods,
      })
    ).toThrow(/協議会参加者/);
  });
});