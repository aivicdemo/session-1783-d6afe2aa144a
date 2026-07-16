import { assignImprovementProposalPriority } from "../../src/logic/it-1-br-8-2-1-1";

describe("改善提案優先度付与機能 - 数値範囲外エラーハンドリング", () => {
  test("SCEN-268: 影響度が数値範囲外（負の値）の場合、バリデーションエラーを返す", () => {
    const proposal_with_negative_impact = {
      proposal_id: "PROP-001",
      title: "栄養基準ロジック改善",
      impact_degree: -5,
      implementation_difficulty: 50,
    };

    expect(() =>
      assignImprovementProposalPriority(proposal_with_negative_impact)
    ).toThrow(/影響度/);
  });

  test("SCEN-268: 影響度が数値範囲外（上限超過）の場合、バリデーションエラーを返す", () => {
    const proposal_with_excessive_impact = {
      proposal_id: "PROP-002",
      title: "献立生成アルゴリズム改善",
      impact_degree: 150,
      implementation_difficulty: 40,
    };

    expect(() =>
      assignImprovementProposalPriority(proposal_with_excessive_impact)
    ).toThrow(/影響度/);
  });

  test("SCEN-268: 実装難度が数値範囲外（負の値）の場合、バリデーションエラーを返す", () => {
    const proposal_with_negative_difficulty = {
      proposal_id: "PROP-003",
      title: "食事制限対応強化",
      impact_degree: 60,
      implementation_difficulty: -10,
    };

    expect(() =>
      assignImprovementProposalPriority(proposal_with_negative_difficulty)
    ).toThrow(/実装難度/);
  });

  test("SCEN-268: 実装難度が数値範囲外（上限超過）の場合、バリデーションエラーを返す", () => {
    const proposal_with_excessive_difficulty = {
      proposal_id: "PROP-004",
      title: "アレルギー管理機能拡張",
      impact_degree: 75,
      implementation_difficulty: 120,
    };

    expect(() =>
      assignImprovementProposalPriority(proposal_with_excessive_difficulty)
    ).toThrow(/実装難度/);
  });

  test("SCEN-268: 影響度と実装難度の両方が数値範囲外の場合、バリデーションエラーを返す", () => {
    const proposal_with_both_out_of_range = {
      proposal_id: "PROP-005",
      title: "栄養目標管理改善",
      impact_degree: -20,
      implementation_difficulty: 150,
    };

    expect(() =>
      assignImprovementProposalPriority(proposal_with_both_out_of_range)
    ).toThrow(/影響度|実装難度/);
  });

  test("SCEN-268: 影響度と実装難度が有効範囲内（0～100）の場合、優先度が正常に付与される", () => {
    const valid_proposal = {
      proposal_id: "PROP-006",
      title: "献立提案改善",
      impact_degree: 70,
      implementation_difficulty: 45,
    };

    const result = assignImprovementProposalPriority(valid_proposal);

    expect(result).toHaveProperty("proposal_id", "PROP-006");
    expect(result).toHaveProperty("priority_score");
    expect(typeof result.priority_score).toBe("number");
    expect(result.priority_score).toBeGreaterThanOrEqual(0);
    expect(result.priority_score).toBeLessThanOrEqual(100);
  });

  test("SCEN-268: 影響度が下限境界値（0）の場合、正常に処理される", () => {
    const proposal_at_min_boundary = {
      proposal_id: "PROP-007",
      title: "最小影響度提案",
      impact_degree: 0,
      implementation_difficulty: 50,
    };

    const result = assignImprovementProposalPriority(
      proposal_at_min_boundary
    );

    expect(result).toHaveProperty("priority_score");
    expect(typeof result.priority_score).toBe("number");
  });

  test("SCEN-268: 影響度が上限境界値（100）の場合、正常に処理される", () => {
    const proposal_at_max_boundary = {
      proposal_id: "PROP-008",
      title: "最大影響度提案",
      impact_degree: 100,
      implementation_difficulty: 50,
    };

    const result = assignImprovementProposalPriority(proposal_at_max_boundary);

    expect(result).toHaveProperty("priority_score");
    expect(typeof result.priority_score).toBe("number");
  });

  test("SCEN-268: 実装難度が下限境界値（0）の場合、正常に処理される", () => {
    const proposal_min_difficulty = {
      proposal_id: "PROP-009",
      title: "低実装難度提案",
      impact_degree: 60,
      implementation_difficulty: 0,
    };

    const result = assignImprovementProposalPriority(proposal_min_difficulty);

    expect(result).toHaveProperty("priority_score");
    expect(typeof result.priority_score).toBe("number");
  });

  test("SCEN-268: 実装難度が上限境界値（100）の場合、正常に処理される", () => {
    const proposal_max_difficulty = {
      proposal_id: "PROP-010",
      title: "高実装難度提案",
      impact_degree: 60,
      implementation_difficulty: 100,
    };

    const result = assignImprovementProposalPriority(proposal_max_difficulty);

    expect(result).toHaveProperty("priority_score");
    expect(typeof result.priority_score).toBe("number");
  });
});