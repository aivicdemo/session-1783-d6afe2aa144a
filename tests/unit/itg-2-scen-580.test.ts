import { classifyMenuFailurePattern } from "../../src/logic/it-1-br-2-1-1-1";

describe("献立失敗パターン分類・優先度判定", () => {
  // SCEN-580
  test("複数の失敗要因を持つパターンが最大影響度のカテゴリに分類される", () => {
    const failureFactors = [
      {
        category: "栄養バランス不足",
        impact_score: 85,
      },
      {
        category: "コスト超過",
        impact_score: 60,
      },
      {
        category: "調理時間超過",
        impact_score: 70,
      },
    ];

    const result = classifyMenuFailurePattern({
      failure_factors: failureFactors,
      pattern_id: "pattern_001",
      timestamp: new Date("2024-02-15T10:30:00Z"),
    });

    // 最大影響度スコア（85点）を持つカテゴリに分類される
    expect(result.primary_category).toBe("栄養バランス不足");

    // 優先度が最優先度（1）として判定される
    expect(result.priority_rank).toBe(1);

    // 影響度スコアが正確に記録される
    expect(result.max_impact_score).toBe(85);

    // パターンID が正確に記録される
    expect(result.pattern_id).toBe("pattern_001");

    // 分類結果の詳細データが含まれる
    expect(result.all_factors).toEqual([
      {
        category: "栄養バランス不足",
        impact_score: 85,
      },
      {
        category: "調理時間超過",
        impact_score: 70,
      },
      {
        category: "コスト超過",
        impact_score: 60,
      },
    ]);

    // タイムスタンプが記録される
    expect(result.classified_at).toEqual(new Date("2024-02-15T10:30:00Z"));
  });
});