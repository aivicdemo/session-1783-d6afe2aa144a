import {
  classifyTechnicalFeasibility,
} from "../../src/logic/it-8-1-1-1";

describe("技術実現性検証・分類機能", () => {
  test("SCEN-221: 複数の技術的制約条件がある場合、条件付き実装の判定が正確に実行される", () => {
    // 制約条件1: APIレスポンスタイム制限（500ms以下）
    // 制約条件2: メモリ使用量制限（512MB以下）
    // 制約条件3: 対応ブラウザ制限（Chrome/Firefoxのみ）

    // ハッピーパス: 全ての制約条件を満たす場合
    const feasibilityData_implementable = {
      proposal_id: "PROP-001",
      proposal_title: "食材制限の自動分類機能",
      technical_constraints: [
        {
          constraint_id: "TECH-001",
          constraint_name: "APIレスポンスタイム制限",
          required_value: 500,
          actual_value: 300,
          unit: "ms",
          severity: "high",
        },
        {
          constraint_id: "TECH-002",
          constraint_name: "メモリ使用量制限",
          required_value: 512,
          actual_value: 400,
          unit: "MB",
          severity: "high",
        },
        {
          constraint_id: "TECH-003",
          constraint_name: "対応ブラウザ制限",
          required_value: ["Chrome", "Firefox"],
          actual_value: ["Chrome", "Firefox"],
          unit: "browser",
          severity: "medium",
        },
      ],
    };

    const result_implementable = classifyTechnicalFeasibility(
      feasibilityData_implementable
    );

    expect(result_implementable.proposal_id).toBe("PROP-001");
    expect(result_implementable.feasibility_classification).toBe(
      "実装可能"
    );
    expect(result_implementable.constraint_evaluations).toHaveLength(3);
    expect(result_implementable.constraint_evaluations[0].evaluation_result).toBe(
      "実装可能"
    );
    expect(result_implementable.constraint_evaluations[1].evaluation_result).toBe(
      "実装可能"
    );
    expect(result_implementable.constraint_evaluations[2].evaluation_result).toBe(
      "実装可能"
    );
    expect(result_implementable.overall_feasibility_score).toBe(100);
    expect(result_implementable.reasoning).toContain("全ての制約条件");

    // エッジケース: 1つの制約条件で条件付き実装になる場合
    const feasibilityData_conditional = {
      proposal_id: "PROP-002",
      proposal_title: "調理時間短縮の提案",
      technical_constraints: [
        {
          constraint_id: "TECH-001",
          constraint_name: "APIレスポンスタイム制限",
          required_value: 500,
          actual_value: 480,
          unit: "ms",
          severity: "high",
        },
        {
          constraint_id: "TECH-002",
          constraint_name: "メモリ使用量制限",
          required_value: 512,
          actual_value: 550,
          unit: "MB",
          severity: "high",
        },
        {
          constraint_id: "TECH-003",
          constraint_name: "対応ブラウザ制限",
          required_value: ["Chrome", "Firefox"],
          actual_value: ["Chrome", "Firefox", "Safari"],
          unit: "browser",
          severity: "medium",
        },
      ],
    };

    const result_conditional = classifyTechnicalFeasibility(
      feasibilityData_conditional
    );

    expect(result_conditional.proposal_id).toBe("PROP-002");
    expect(result_conditional.feasibility_classification).toBe(
      "条件付き実装"
    );
    expect(result_conditional.constraint_evaluations).toHaveLength(3);
    expect(result_conditional.constraint_evaluations[1].evaluation_result).toBe(
      "条件付き実装"
    );
    expect(result_conditional.overall_feasibility_score).toBeGreaterThanOrEqual(50);
    expect(result_conditional.overall_feasibility_score).toBeLessThanOrEqual(99);
    expect(result_conditional.reasoning).toContain("メモリ使用量");

    // エッジケース: 複数の制約条件が実装不可になる場合、最も制限的な判定が優先される
    const feasibilityData_infeasible = {
      proposal_id: "PROP-003",
      proposal_title: "予算制約の最適化機能",
      technical_constraints: [
        {
          constraint_id: "TECH-001",
          constraint_name: "APIレスポンスタイム制限",
          required_value: 500,
          actual_value: 800,
          unit: "ms",
          severity: "high",
        },
        {
          constraint_id: "TECH-002",
          constraint_name: "メモリ使用量制限",
          required_value: 512,
          actual_value: 1024,
          unit: "MB",
          severity: "high",
        },
        {
          constraint_id: "TECH-003",
          constraint_name: "対応ブラウザ制限",
          required_value: ["Chrome", "Firefox"],
          actual_value: ["IE", "Edge"],
          unit: "browser",
          severity: "medium",
        },
      ],
    };

    const result_infeasible = classifyTechnicalFeasibility(
      feasibilityData_infeasible
    );

    expect(result_infeasible.proposal_id).toBe("PROP-003");
    expect(result_infeasible.feasibility_classification).toBe(
      "実装不可"
    );
    expect(result_infeasible.constraint_evaluations).toHaveLength(3);
    expect(result_infeasible.constraint_evaluations[0].evaluation_result).toBe(
      "実装不可"
    );
    expect(result_infeasible.constraint_evaluations[1].evaluation_result).toBe(
      "実装不可"
    );
    expect(result_infeasible.constraint_evaluations[2].evaluation_result).toBe(
      "実装不可"
    );
    expect(result_infeasible.overall_feasibility_score).toBe(0);
    expect(result_infeasible.reasoning).toContain("APIレスポンスタイム");
    expect(result_infeasible.reasoning).toContain("メモリ使用量");

    // エッジケース: 制約条件が矛盾する場合の処理
    const feasibilityData_contradictory = {
      proposal_id: "PROP-004",
      proposal_title: "矛盾する制約条件テスト",
      technical_constraints: [
        {
          constraint_id: "TECH-004",
          constraint_name: "最小レスポンスタイム制限",
          required_value: 100,
          actual_value: 50,
          unit: "ms",
          severity: "high",
        },
        {
          constraint_id: "TECH-005",
          constraint_name: "最大レスポンスタイム制限",
          required_value: 300,
          actual_value: 350,
          unit: "ms",
          severity: "high",
        },
      ],
    };

    const result_contradictory = classifyTechnicalFeasibility(
      feasibilityData_contradictory
    );

    expect(result_contradictory.proposal_id).toBe("PROP-004");
    // 矛盾する制約条件は予測可能に処理される（最も制限的な判定を優先）
    expect(["実装可能", "条件付き実装", "実装不可"]).toContain(
      result_contradictory.feasibility_classification
    );
    expect(result_contradictory.constraint_evaluations).toHaveLength(2);
    expect(result_contradictory.contradiction_detected).toBe(true);
    expect(result_contradictory.reasoning).toContain("矛盾");

    // 判定根拠が記録されているか確認
    expect(result_implementable).toHaveProperty("reasoning");
    expect(result_implementable.reasoning).toBeTruthy();
    expect(typeof result_implementable.reasoning).toBe("string");
    expect(result_implementable.reasoning.length).toBeGreaterThan(0);

    // 条件付き実装の場合、どの制約条件が理由かが明確に記録されているか
    expect(result_conditional.constraint_evaluations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          constraint_id: expect.any(String),
          constraint_name: expect.any(String),
          evaluation_result: expect.any(String),
          reason: expect.any(String),
        }),
      ])
    );

    // 複数条件の組み合わせにおいて、最も制限的な判定が優先されているか
    expect(result_infeasible.feasibility_classification).toBe(
      "実装不可"
    );
    const infeasible_count = result_infeasible.constraint_evaluations.filter(
      (c: any) => c.evaluation_result === "実装不可"
    ).length;
    expect(infeasible_count).toBeGreaterThan(0);
  });
});