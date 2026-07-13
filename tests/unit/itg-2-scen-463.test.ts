import { instructDataCollection } from "../../src/logic/it-1-br-2-1-1-1";

describe("ユーザーの食事記録と栄養摂取量の推移データを自動集計し、栄養項目別の達成度と改善ギャップを可視化するダッシュボード機能", () => {
  test("SCEN-463: [error] データ収集指示機能 - 最小サンプル数が収集可能なサンプル数未満の場合にエラーが発生する", () => {
    const minimum_sample_count = 100;
    const available_sample_count = 50;
    const collection_period = "2024-01-01T00:00:00Z";

    expect(() =>
      instructDataCollection({
        minimum_sample_count,
        available_sample_count,
        collection_period,
      })
    ).toThrow(/最小サンプル数/);
  });
});