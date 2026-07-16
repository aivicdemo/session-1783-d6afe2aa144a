import { unifyAndDeduplicateImprovementIssues } from "../../src/logic/it-8-1-1-1";

describe("改善課題リスト統合・重複排除機能", () => {
  // SCEN-207
  test("重複する改善課題が排除され、関連課題が統合された一意なリストが生成される", () => {
    // ===== 準備フェーズ: テストデータセット構築 =====
    // 複数のペイン分析結果から重複を含む改善課題データセット
    const input_improvement_issues = [
      {
        issue_id: "ISS-001",
        issue_title: "栄養バランス改善",
        category: "nutrition",
        priority_score: 8.5,
        affected_segment: "working_parent",
        related_issues: ["ISS-002"],
        issue_description: "献立の栄養バランスロジック修正",
      },
      {
        issue_id: "ISS-002",
        issue_title: "栄養基準の最適化",
        category: "nutrition",
        priority_score: 8.3,
        affected_segment: "working_parent",
        related_issues: ["ISS-001"],
        issue_description: "栄養基準パラメータ調整",
      },
      {
        issue_id: "ISS-001", // 完全重複
        issue_title: "栄養バランス改善",
        category: "nutrition",
        priority_score: 8.5,
        affected_segment: "working_parent",
        related_issues: ["ISS-002"],
        issue_description: "献立の栄養バランスロジック修正",
      },
      {
        issue_id: "ISS-003",
        issue_title: "調理時間短縮",
        category: "cooking_time",
        priority_score: 7.2,
        affected_segment: "stay_at_home_dad",
        related_issues: [],
        issue_description: "調理時間見積ロジック改善",
      },
      {
        issue_id: "ISS-004",
        issue_title: "調理時間制約対応",
        category: "cooking_time",
        priority_score: 7.0,
        affected_segment: "stay_at_home_dad",
        related_issues: ["ISS-003"],
        issue_description: "調理時間制約パラメータ調整",
      },
      {
        issue_id: "ISS-005",
        issue_title: "予算制約ロジック",
        category: "budget",
        priority_score: 6.8,
        affected_segment: "budget_conscious",
        related_issues: [],
        issue_description: "食費予算制約チェック機能",
      },
      {
        issue_id: "ISS-003", // 重複キー: ISS-003
        issue_title: "調理時間短縮",
        category: "cooking_time",
        priority_score: 7.2,
        affected_segment: "stay_at_home_dad",
        related_issues: [],
        issue_description: "調理時間見積ロジック改善",
      },
    ];

    // ===== 実行フェーズ: 統合関数呼び出し =====
    const result = unifyAndDeduplicateImprovementIssues(
      input_improvement_issues
    );

    // ===== 検証フェーズ =====

    // 1. 重複課題が排除されていることを確認
    // 入力: 7件（重複2件含む） → 出力: 5件（一意）
    expect(result.unified_issues.length).toBe(5);

    // 2. 結果に含まれる issue_id が一意であることを検証
    const result_issue_ids = result.unified_issues.map((issue) => issue.issue_id);
    const unique_ids = new Set(result_issue_ids);
    expect(unique_ids.size).toBe(5);

    // 3. 重複課題（ISS-001, ISS-003）が1件のみ保持されていることを確認
    const iss_001_count = result_issue_ids.filter(
      (id) => id === "ISS-001"
    ).length;
    const iss_003_count = result_issue_ids.filter(
      (id) => id === "ISS-003"
    ).length;
    expect(iss_001_count).toBe(1);
    expect(iss_003_count).toBe(1);

    // 4. 関連課題が統合されているか確認（ISS-001とISS-002の統合グループ）
    const unified_iss_001 = result.unified_issues.find(
      (issue) => issue.issue_id === "ISS-001"
    );
    expect(unified_iss_001).toBeDefined();
    expect(unified_iss_001!.related_issues).toContain("ISS-002");

    // 5. 統合時に課題属性が保持されていることを確認
    expect(unified_iss_001!.category).toBe("nutrition");
    expect(unified_iss_001!.priority_score).toBe(8.5);
    expect(unified_iss_001!.affected_segment).toBe("working_parent");
    expect(unified_iss_001!.issue_title).toBe("栄養バランス改善");

    // 6. 関連課題グループが正しく統合されているか（ISS-003とISS-004）
    const unified_iss_003 = result.unified_issues.find(
      (issue) => issue.issue_id === "ISS-003"
    );
    expect(unified_iss_003).toBeDefined();
    expect(unified_iss_003!.related_issues).toContain("ISS-004");
    expect(unified_iss_003!.category).toBe("cooking_time");

    // 7. カテゴリ別に統合ルールが適用されていることを確認
    const nutrition_issues = result.unified_issues.filter(
      (issue) => issue.category === "nutrition"
    );
    const cooking_time_issues = result.unified_issues.filter(
      (issue) => issue.category === "cooking_time"
    );
    const budget_issues = result.unified_issues.filter(
      (issue) => issue.category === "budget"
    );

    expect(nutrition_issues.length).toBe(2); // ISS-001, ISS-002 (関連統合)
    expect(cooking_time_issues.length).toBe(2); // ISS-003, ISS-004 (関連統合)
    expect(budget_issues.length).toBe(1); // ISS-005 (単独)

    // 8. 優先度スコアが保持されていることを確認
    const all_have_priority = result.unified_issues.every(
      (issue) => typeof issue.priority_score === "number" && issue.priority_score > 0
    );
    expect(all_have_priority).toBe(true);

    // 9. 結果メタデータの検証
    expect(result.total_input_count).toBe(7);
    expect(result.total_deduplicated_count).toBe(5);
    expect(result.duplicates_removed_count).toBe(2);
    expect(result.unified_groups_count).toBe(4); // 4つの統合グループ

    // 10. 各グループの関連性スコアが計算されていることを確認
    expect(result.unified_issues[0]).toHaveProperty("group_cohesion_score");
    const group_cohesion_valid = result.unified_issues.every(
      (issue) =>
        typeof issue.group_cohesion_score === "number" &&
        issue.group_cohesion_score >= 0 &&
        issue.group_cohesion_score <= 100
    );
    expect(group_cohesion_valid).toBe(true);

    // 11. 統合前後での課題総数の変化を検証
    expect(result.deduplication_rate).toBe((2 / 7) * 100); // 28.57%
    const expected_dedup_rate = Math.round((2 / 7) * 10000) / 100; // 28.57
    expect(
      Math.round(result.deduplication_rate * 100) / 100
    ).toBeCloseTo(expected_dedup_rate, 1);

    // 12. 統合完了フラグが立っていることを確認
    expect(result.unification_completed).toBe(true);

    // 13. 結果が正規化されていることを確認（sortされているなど）
    const ids_are_ordered = result.unified_issues
      .map((issue) => issue.issue_id)
      .every((id, index, arr) => {
        if (index === 0) return true;
        return id >= arr[index - 1];
      });
    expect(ids_are_ordered).toBe(true);

    // 14. 各統合課題に対して、元の課題の影響範囲が正しく統合されているか
    const iss_001_affected = unified_iss_001!.affected_segment;
    const iss_002 = result.unified_issues.find(
      (issue) => issue.issue_id === "ISS-002"
    );
    // 同じセグメント影響を持つ関連課題が統合されているため、affected_segment が一致
    expect(iss_002!.affected_segment).toBe(iss_001_affected);

    // 15. 統合リストに重複・矛盾がないことを最終確認
    const final_check = result.unified_issues.every((issue, index) => {
      return (
        result.unified_issues.findIndex((i) => i.issue_id === issue.issue_id) ===
        index
      );
    });
    expect(final_check).toBe(true);
  });
});