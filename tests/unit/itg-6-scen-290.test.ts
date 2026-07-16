import { classifyImprovementProposals } from "../../src/logic/it-8-1-1-1";

describe("改善提案分類機能 - 重複排除と失敗パターン集約", () => {
  // SCEN-290
  test("複数の失敗パターンが同一改善提案に紐付く場合に重複が排除され失敗パターンが集約される", () => {
    const input_failure_patterns = [
      {
        failure_pattern_id: "fp_001",
        failure_reason_category: "nutrition_imbalance",
        failure_reason_text: "栄養バランスが不適切",
        improvement_proposal_id: "ip_100",
        frequency: 8,
        severity_score: 85,
      },
      {
        failure_pattern_id: "fp_002",
        failure_reason_category: "family_preference_mismatch",
        failure_reason_text: "家族の好みが反映されていない",
        improvement_proposal_id: "ip_100",
        frequency: 5,
        severity_score: 72,
      },
      {
        failure_pattern_id: "fp_003",
        failure_reason_category: "cooking_time_excess",
        failure_reason_text: "調理時間が超過している",
        improvement_proposal_id: "ip_100",
        frequency: 3,
        severity_score: 65,
      },
      {
        failure_pattern_id: "fp_004",
        failure_reason_category: "ingredient_restriction_missed",
        failure_reason_text: "食材制限が漏れている",
        improvement_proposal_id: "ip_101",
        frequency: 6,
        severity_score: 78,
      },
      {
        failure_pattern_id: "fp_005",
        failure_reason_category: "nutrition_imbalance",
        failure_reason_text: "栄養バランスが不適切（別件）",
        improvement_proposal_id: "ip_101",
        frequency: 4,
        severity_score: 70,
      },
    ];

    const result = classifyImprovementProposals(input_failure_patterns);

    // 改善提案の重複が排除されていることを検証
    const proposal_ids = result.map((proposal) => proposal.improvement_proposal_id);
    const unique_proposal_ids = new Set(proposal_ids);
    expect(unique_proposal_ids.size).toBe(2);
    expect(proposal_ids.length).toBe(2);

    // improvement_proposal_id = "ip_100" の検証
    const proposal_ip_100 = result.find(
      (p) => p.improvement_proposal_id === "ip_100"
    );
    expect(proposal_ip_100).toBeDefined();
    expect(proposal_ip_100?.improvement_proposal_id).toBe("ip_100");

    // ip_100 に紐付く失敗パターンが3件すべて集約されていることを検証
    expect(proposal_ip_100?.failure_patterns.length).toBe(3);
    const failure_pattern_ids_ip_100 = proposal_ip_100?.failure_patterns.map(
      (fp) => fp.failure_pattern_id
    );
    expect(failure_pattern_ids_ip_100).toContain("fp_001");
    expect(failure_pattern_ids_ip_100).toContain("fp_002");
    expect(failure_pattern_ids_ip_100).toContain("fp_003");

    // ip_100 の集計値を検証（frequency と severity_score が合計される）
    expect(proposal_ip_100?.aggregated_frequency).toBe(16); // 8 + 5 + 3
    expect(proposal_ip_100?.max_severity_score).toBe(85); // max(85, 72, 65)

    // improvement_proposal_id = "ip_101" の検証
    const proposal_ip_101 = result.find(
      (p) => p.improvement_proposal_id === "ip_101"
    );
    expect(proposal_ip_101).toBeDefined();
    expect(proposal_ip_101?.improvement_proposal_id).toBe("ip_101");

    // ip_101 に紐付く失敗パターンが2件すべて集約されていることを検証
    expect(proposal_ip_101?.failure_patterns.length).toBe(2);
    const failure_pattern_ids_ip_101 = proposal_ip_101?.failure_patterns.map(
      (fp) => fp.failure_pattern_id
    );
    expect(failure_pattern_ids_ip_101).toContain("fp_004");
    expect(failure_pattern_ids_ip_101).toContain("fp_005");

    // ip_101 の集計値を検証
    expect(proposal_ip_101?.aggregated_frequency).toBe(10); // 6 + 4
    expect(proposal_ip_101?.max_severity_score).toBe(78); // max(78, 70)

    // 各提案に含まれるすべての失敗パターンの詳細情報が保持されていることを検証
    const all_failure_patterns_in_result = result.flatMap(
      (p) => p.failure_patterns
    );
    expect(all_failure_patterns_in_result.length).toBe(5);

    // 元のテストデータに含まれるすべての失敗パターンが結果に含まれていることを検証
    input_failure_patterns.forEach((input_fp) => {
      const found_in_result = all_failure_patterns_in_result.find(
        (result_fp) => result_fp.failure_pattern_id === input_fp.failure_pattern_id
      );
      expect(found_in_result).toBeDefined();
      expect(found_in_result?.failure_reason_category).toBe(
        input_fp.failure_reason_category
      );
      expect(found_in_result?.frequency).toBe(input_fp.frequency);
      expect(found_in_result?.severity_score).toBe(input_fp.severity_score);
    });
  });
});