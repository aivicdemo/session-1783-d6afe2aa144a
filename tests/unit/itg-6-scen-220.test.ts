import {
  evaluateTechnicalFeasibility,
} from "../../src/logic/it-8-1-1-1";

describe("技術実現性検証・分類機能", () => {
  // SCEN-220: [normal] 技術実現性の判定結果が判定ロジックに基づいて正確に記録される
  test("should evaluate and record technical feasibility assessment accurately", () => {
    // テストデータ: 3パターンの実現可能性（高/中/低）
    const high_feasibility_proposal = {
      proposal_id: "PROP-001",
      title: "調理時間短縮 - 条件付き自動調整",
      description: "ユーザー入力の調理時間上限値を自動検出し、献立生成時にフィルタリング",
      affected_user_segment: "専業主夫層",
      estimated_implementation_days: 5,
      required_skills: ["TypeScript", "Database"],
      external_dependencies: 0,
      compatibility_risk: "low",
    };

    const medium_feasibility_proposal = {
      proposal_id: "PROP-002",
      title: "食材制限複合条件の管理",
      description:
        "複数の食材制限を組み合わせた献立生成ロジック改善",
      affected_user_segment: "ファミリー層",
      estimated_implementation_days: 12,
      required_skills: ["TypeScript", "Database", "Algorithm"],
      external_dependencies: 1,
      compatibility_risk: "medium",
    };

    const low_feasibility_proposal = {
      proposal_id: "PROP-003",
      title: "外部API連携による栄養価自動取得",
      description: "複数の外部栄養DBサービスとのAPI統合",
      affected_user_segment: "全ユーザー",
      estimated_implementation_days: 25,
      required_skills: ["TypeScript", "Database", "API", "DevOps"],
      external_dependencies: 3,
      compatibility_risk: "high",
    };

    // 高実現可能性データの判定
    const high_result = evaluateTechnicalFeasibility(
      high_feasibility_proposal
    );
    expect(high_result).toEqual({
      proposal_id: "PROP-001",
      feasibility_level: "implementable",
      feasibility_score: 85,
      reasoning:
        "実装期間5日以内、必要技能数2、外部依存0、リスク低 → 直ちに実装可能",
      classification_category: "quick_win",
      estimated_days: 5,
      risk_level: "low",
      evaluated_at: expect.any(String),
      version: 1,
    });

    // 中実現可能性データの判定
    const medium_result = evaluateTechnicalFeasibility(
      medium_feasibility_proposal
    );
    expect(medium_result).toEqual({
      proposal_id: "PROP-002",
      feasibility_level: "conditionally_implementable",
      feasibility_score: 62,
      reasoning:
        "実装期間12日、必要技能数3、外部依存1、リスク中程度 → 条件付き実装可能（依存解決必要）",
      classification_category: "conditional_implementation",
      estimated_days: 12,
      risk_level: "medium",
      evaluated_at: expect.any(String),
      version: 1,
    });

    // 低実現可能性データの判定
    const low_result = evaluateTechnicalFeasibility(
      low_feasibility_proposal
    );
    expect(low_result).toEqual({
      proposal_id: "PROP-003",
      feasibility_level: "not_implementable",
      feasibility_score: 35,
      reasoning:
        "実装期間25日以上、必要技能数4、外部依存3、リスク高 → 実装不可（リスク・リソース制約超過）",
      classification_category: "not_feasible",
      estimated_days: 25,
      risk_level: "high",
      evaluated_at: expect.any(String),
      version: 1,
    });

    // タイムスタンプが ISO 8601 形式であることを検証
    expect(high_result.evaluated_at).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
    );
    expect(medium_result.evaluated_at).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
    );
    expect(low_result.evaluated_at).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
    );

    // 各判定結果が異なること（過去結果が上書きされない）を検証
    expect(high_result.proposal_id).not.toBe(
      medium_result.proposal_id
    );
    expect(medium_result.proposal_id).not.toBe(
      low_result.proposal_id
    );

    // スコアが正序に並ぶこと（実現可能性の順序）を検証
    expect(high_result.feasibility_score).toBeGreaterThan(
      medium_result.feasibility_score
    );
    expect(medium_result.feasibility_score).toBeGreaterThan(
      low_result.feasibility_score
    );

    // 分類カテゴリが正確に付与されていること
    expect(high_result.classification_category).toBe("quick_win");
    expect(medium_result.classification_category).toBe(
      "conditional_implementation"
    );
    expect(low_result.classification_category).toBe("not_feasible");

    // 2回目の実行で同じプロポーザルを判定（過去結果保持確認）
    const high_result_second_run = evaluateTechnicalFeasibility(
      high_feasibility_proposal
    );
    expect(high_result_second_run.proposal_id).toBe(
      high_result.proposal_id
    );
    expect(high_result_second_run.feasibility_score).toBe(
      high_result.feasibility_score
    );
    // タイムスタンプは異なる可能性があるが、判定結果本体は一致
    expect(high_result_second_run.feasibility_level).toBe(
      high_result.feasibility_level
    );
    expect(high_result_second_run.classification_category).toBe(
      high_result.classification_category
    );
  });
});