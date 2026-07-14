import { aggregateFailurePatternsToPropsal } from "../../src/logic/it-7-2-1";

describe("献立生成アルゴリズムの成功・失敗パターン分析と改善提案", () => {
  // SCEN-911: [edge] 失敗パターンから改善提案への分類と紐付け - 複数の失敗パターンが1つの改善提案に紐付けられる場合、全ての根拠データが集約されて表示される
  test("複数の失敗パターンが1つの改善提案に紐付けられた場合、全ての根拠データが適切に集約されて表示される", () => {
    // テストデータ: 3つの異なる失敗パターン
    const failurePattern1 = {
      failure_pattern_id: "FP001",
      pattern_type: "nutritional_imbalance",
      occurrence_count: 12,
      occurrence_date: "2024-01-15",
      error_code: "ERR_NUT_001",
      impact_level: 8,
      user_id: "USR_001",
      description: "栄養バランス不適切: カルシウム不足",
    };

    const failurePattern2 = {
      failure_pattern_id: "FP002",
      pattern_type: "family_preference_mismatch",
      occurrence_count: 8,
      occurrence_date: "2024-01-16",
      error_code: "ERR_PREF_001",
      impact_level: 6,
      user_id: "USR_002",
      description: "家族好み未反映: 子どもが嫌いな野菜を提案",
    };

    const failurePattern3 = {
      failure_pattern_id: "FP003",
      pattern_type: "cooking_time_exceeded",
      occurrence_count: 15,
      occurrence_date: "2024-01-17",
      error_code: "ERR_TIME_001",
      impact_level: 7,
      user_id: "USR_003",
      description: "調理時間超過: 目標30分のところ45分かかる料理を提案",
    };

    const improvement_proposal_id = "PROP_001";

    // 改善提案に複数の失敗パターンを紐付け
    const input = {
      improvement_proposal_id: improvement_proposal_id,
      failure_patterns: [failurePattern1, failurePattern2, failurePattern3],
      proposal_title: "献立生成アルゴリズムの栄養バランス・嗜好・調理時間ロジック統合改善",
      proposal_priority: 1,
    };

    // 実行
    const result = aggregateFailurePatternsToPropsal(input);

    // 期待結果の検証
    // 1. 集約されたデータが存在すること
    expect(result).toBeDefined();
    expect(result.improvement_proposal_id).toBe(improvement_proposal_id);

    // 2. 全ての失敗パターンが集約されていること
    expect(result.aggregated_failure_patterns).toHaveLength(3);

    // 3. 各失敗パターンの根拠データが正しく集約されていること
    expect(result.aggregated_failure_patterns[0]).toEqual({
      failure_pattern_id: "FP001",
      pattern_type: "nutritional_imbalance",
      occurrence_count: 12,
      occurrence_date: "2024-01-15",
      error_code: "ERR_NUT_001",
      impact_level: 8,
      user_id: "USR_001",
      description: "栄養バランス不適切: カルシウム不足",
    });

    expect(result.aggregated_failure_patterns[1]).toEqual({
      failure_pattern_id: "FP002",
      pattern_type: "family_preference_mismatch",
      occurrence_count: 8,
      occurrence_date: "2024-01-16",
      error_code: "ERR_PREF_001",
      impact_level: 6,
      user_id: "USR_002",
      description: "家族好み未反映: 子どもが嫌いな野菜を提案",
    });

    expect(result.aggregated_failure_patterns[2]).toEqual({
      failure_pattern_id: "FP003",
      pattern_type: "cooking_time_exceeded",
      occurrence_count: 15,
      occurrence_date: "2024-01-17",
      error_code: "ERR_TIME_001",
      impact_level: 7,
      user_id: "USR_003",
      description: "調理時間超過: 目標30分のところ45分かかる料理を提案",
    });

    // 4. 集約統計: 全失敗パターンの発生回数の合計
    const total_occurrences = 12 + 8 + 15; // = 35
    expect(result.total_occurrences).toBe(total_occurrences);

    // 5. 集約統計: 平均影響度
    const average_impact_level = (8 + 6 + 7) / 3; // = 7
    expect(result.average_impact_level).toBe(average_impact_level);

    // 6. 影響度が高い順にソートされていること
    expect(result.aggregated_failure_patterns[0].impact_level).toBe(8);
    expect(result.aggregated_failure_patterns[1].impact_level).toBe(7);
    expect(result.aggregated_failure_patterns[2].impact_level).toBe(6);

    // 7. データの重複がないことを検証 (失敗パターンIDの一意性)
    const unique_failure_ids = new Set(
      result.aggregated_failure_patterns.map((fp) => fp.failure_pattern_id)
    );
    expect(unique_failure_ids.size).toBe(3);

    // 8. 出所の失敗パターンが識別可能なこと
    result.aggregated_failure_patterns.forEach((pattern, index) => {
      expect(pattern.failure_pattern_id).toBeDefined();
      expect(pattern.pattern_type).toBeDefined();
      expect(pattern.error_code).toBeDefined();
    });

    // 9. 提案の優先度が正しく維持されていること
    expect(result.proposal_priority).toBe(1);

    // 10. 提案タイトルが正しく保持されていること
    expect(result.proposal_title).toBe(
      "献立生成アルゴリズムの栄養バランス・嗜好・調理時間ロジック統合改善"
    );

    // 11. タイムスタンプが記録されていること
    expect(result.aggregation_timestamp).toBeDefined();
    expect(typeof result.aggregation_timestamp).toBe("string");

    // 12. 集約された最新の発生日時が記録されていること
    const dates = result.aggregated_failure_patterns.map((fp) =>
      new Date(fp.occurrence_date)
    );
    const latest_date = new Date(
      Math.max(...dates.map((d) => d.getTime()))
    ).toISOString();
    expect(result.latest_occurrence_date).toBe(latest_date.split("T")[0]);
  });
});