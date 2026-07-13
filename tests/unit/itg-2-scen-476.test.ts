import { sortImprovementProposalsByPriority } from "../../src/logic/it-1-br-2-1-2-1";

describe("改善提案管理機能 - 優先度による並び替え", () => {
  // SCEN-476
  test("複数の改善提案が優先度順に正しく並び替えられる", () => {
    // 前提: 栄養士が改善提案を複数件入力済み、異なる優先度で登録されている
    const improvementProposals = [
      {
        proposal_id: "P001",
        title: "カルシウム摂取量の基準値引き上げ",
        priority: 2,
        business_value: 8,
        technical_difficulty: 5,
        user_impact: 9,
      },
      {
        proposal_id: "P002",
        title: "タンパク質バランスの改善",
        priority: 1,
        business_value: 9,
        technical_difficulty: 4,
        user_impact: 10,
      },
      {
        proposal_id: "P003",
        title: "ビタミンD吸収性の最適化",
        priority: 3,
        business_value: 7,
        technical_difficulty: 6,
        user_impact: 7,
      },
      {
        proposal_id: "P004",
        title: "食物繊維摂取ターゲット調整",
        priority: 2,
        business_value: 8,
        technical_difficulty: 3,
        user_impact: 8,
      },
    ];

    // 期待結果1: 昇順（優先度低→高）に並び替え
    const ascending_result = sortImprovementProposalsByPriority(
      improvementProposals,
      "asc"
    );

    expect(ascending_result).toHaveLength(4);
    expect(ascending_result[0].proposal_id).toBe("P002");
    expect(ascending_result[0].priority).toBe(1);
    expect(ascending_result[1].proposal_id).toBe("P001");
    expect(ascending_result[1].priority).toBe(2);
    expect(ascending_result[2].proposal_id).toBe("P004");
    expect(ascending_result[2].priority).toBe(2);
    expect(ascending_result[3].proposal_id).toBe("P003");
    expect(ascending_result[3].priority).toBe(3);

    // 期待結果2: 降順（優先度高→低）に並び替え
    const descending_result = sortImprovementProposalsByPriority(
      improvementProposals,
      "desc"
    );

    expect(descending_result).toHaveLength(4);
    expect(descending_result[0].proposal_id).toBe("P003");
    expect(descending_result[0].priority).toBe(3);
    expect(descending_result[1].proposal_id).toBe("P001");
    expect(descending_result[1].priority).toBe(2);
    expect(descending_result[2].proposal_id).toBe("P004");
    expect(descending_result[2].priority).toBe(2);
    expect(descending_result[3].proposal_id).toBe("P002");
    expect(descending_result[3].priority).toBe(1);

    // 期待結果3: 並び替え前後ですべての提案が漏れなく存在する
    const ascending_ids = ascending_result.map((p) => p.proposal_id);
    const descending_ids = descending_result.map((p) => p.proposal_id);
    const original_ids = improvementProposals.map((p) => p.proposal_id);

    expect(ascending_ids.sort()).toEqual(original_ids.sort());
    expect(descending_ids.sort()).toEqual(original_ids.sort());

    // 期待結果4: 同一優先度内でのデータ整合性確認
    const priority_2_proposals_asc = ascending_result.filter(
      (p) => p.priority === 2
    );
    expect(priority_2_proposals_asc).toHaveLength(2);
    expect(priority_2_proposals_asc.map((p) => p.proposal_id)).toContainEqual(
      "P001"
    );
    expect(priority_2_proposals_asc.map((p) => p.proposal_id)).toContainEqual(
      "P004"
    );
  });
});