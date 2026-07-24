import { evaluateTechnicalFeasibility } from "../../src/logic/it-7-2-1";

describe("献立生成アルゴリズム改善提案の技術実現性評価", () => {
  // SCEN-723: [normal] 技術実現性評価機能 - 複数の改善提案について、提案ごとに異なる技術実現性評価結果が記録される
  test("複数の改善提案それぞれに異なる技術実現性評価結果が正確に記録される", () => {
    const proposals = [
      {
        proposal_id: "PROP-001",
        title: "栄養バランス最適化ロジック改善",
        description: "タンパク質配分アルゴリズムの精度向上",
        business_value_score: 85,
        technical_difficulty_score: 65,
        user_impact_score: 78,
        estimated_implementation_days: 12,
      },
      {
        proposal_id: "PROP-002",
        title: "調理時間推定精度向上",
        description: "料理別調理時間データベース拡張",
        business_value_score: 72,
        technical_difficulty_score: 45,
        user_impact_score: 88,
        estimated_implementation_days: 8,
      },
      {
        proposal_id: "PROP-003",
        title: "家族好みマッチングエンジン強化",
        description: "嗜好学習アルゴリズムの深層学習化",
        business_value_score: 92,
        technical_difficulty_score: 88,
        user_impact_score: 82,
        estimated_implementation_days: 20,
      },
      {
        proposal_id: "PROP-004",
        title: "食材在庫最適化ロジック",
        description: "冷蔵庫在庫データとの自動連携",
        business_value_score: 68,
        technical_difficulty_score: 52,
        user_impact_score: 75,
        estimated_implementation_days: 10,
      },
    ];

    const evaluationResults = proposals.map((proposal) => {
      let feasibility_classification: "実装可能" | "条件付き実装" | "実装不可";
      let feasibility_score: number;
      let reasoning: string;
      let dependencies: string[];

      if (proposal.technical_difficulty_score > 80) {
        feasibility_classification = "条件付き実装";
        feasibility_score = 62;
        reasoning =
          "複雑な実装が必要だが、段階的実装と既存アルゴリズムとの依存関係管理により対応可能";
        dependencies = [
          "既存献立生成ロジックのリファクタリング",
          "学習データセット拡張",
        ];
      } else if (proposal.technical_difficulty_score > 60) {
        feasibility_classification = "条件付き実装";
        feasibility_score = 75;
        reasoning =
          "中程度の技術難度。既存フレームワーク活用で実装可能だが、テスト期間の確保が必要";
        dependencies = ["既存API拡張"];
      } else {
        feasibility_classification = "実装可能";
        feasibility_score = 88;
        reasoning =
          "低技術難度。既存実装パターンの応用で実装可能。リスク最小";
        dependencies = [];
      }

      return {
        proposal_id: proposal.proposal_id,
        title: proposal.title,
        feasibility_classification: feasibility_classification,
        feasibility_score: feasibility_score,
        reasoning: reasoning,
        dependencies: dependencies,
        evaluated_at: "2024-01-15T14:30:00Z",
        evaluated_by: "TECH-LEAD-001",
      };
    });

    const result = evaluateTechnicalFeasibility(proposals);

    expect(result).toEqual(evaluationResults);

    expect(result).toHaveLength(4);

    expect(result[0]).toEqual({
      proposal_id: "PROP-001",
      title: "栄養バランス最適化ロジック改善",
      feasibility_classification: "条件付き実装",
      feasibility_score: 62,
      reasoning:
        "複雑な実装が必要だが、段階的実装と既存アルゴリズムとの依存関係管理により対応可能",
      dependencies: [
        "既存献立生成ロジックのリファクタリング",
        "学習データセット拡張",
      ],
      evaluated_at: "2024-01-15T14:30:00Z",
      evaluated_by: "TECH-LEAD-001",
    });

    expect(result[1]).toEqual({
      proposal_id: "PROP-002",
      title: "調理時間推定精度向上",
      feasibility_classification: "条件付き実装",
      feasibility_score: 75,
      reasoning:
        "中程度の技術難度。既存フレームワーク活用で実装可能だが、テスト期間の確保が必要",
      dependencies: ["既存API拡張"],
      evaluated_at: "2024-01-15T14:30:00Z",
      evaluated_by: "TECH-LEAD-001",
    });

    expect(result[2]).toEqual({
      proposal_id: "PROP-003",
      title: "家族好みマッチングエンジン強化",
      feasibility_classification: "条件付き実装",
      feasibility_score: 62,
      reasoning:
        "複雑な実装が必要だが、段階的実装と既存アルゴリズムとの依存関係管理により対応可能",
      dependencies: [
        "既存献立生成ロジックのリファクタリング",
        "学習データセット拡張",
      ],
      evaluated_at: "2024-01-15T14:30:00Z",
      evaluated_by: "TECH-LEAD-001",
    });

    expect(result[3]).toEqual({
      proposal_id: "PROP-004",
      title: "食材在庫最適化ロジック",
      feasibility_classification: "実装可能",
      feasibility_score: 88,
      reasoning: "低技術難度。既存実装パターンの応用で実装可能。リスク最小",
      dependencies: [],
      evaluated_at: "2024-01-15T14:30:00Z",
      evaluated_by: "TECH-LEAD-001",
    });

    const proposalIdMap = new Map<any, any>(result.map((r) => [r.proposal_id, r]));
    expect(proposalIdMap.get("PROP-001")?.feasibility_score).toBe(62);
    expect(proposalIdMap.get("PROP-002")?.feasibility_score).toBe(75);
    expect(proposalIdMap.get("PROP-003")?.feasibility_score).toBe(62);
    expect(proposalIdMap.get("PROP-004")?.feasibility_score).toBe(88);

    expect(proposalIdMap.get("PROP-001")?.feasibility_classification).toBe(
      "条件付き実装"
    );
    expect(proposalIdMap.get("PROP-002")?.feasibility_classification).toBe(
      "条件付き実装"
    );
    expect(proposalIdMap.get("PROP-003")?.feasibility_classification).toBe(
      "条件付き実装"
    );
    expect(proposalIdMap.get("PROP-004")?.feasibility_classification).toBe(
      "実装可能"
    );

    result.forEach((evaluation) => {
      const original_proposal = proposals.find(
        (p) => p.proposal_id === evaluation.proposal_id
      );
      expect(original_proposal).toBeDefined();
      expect(evaluation.proposal_id).toBe(original_proposal?.proposal_id);
    });

    const feasibility_scores = result.map((r) => r.feasibility_score);
    const unique_scores = new Set<any>(feasibility_scores);
    expect(unique_scores.size).toBeGreaterThan(1);

    const feasibility_classifications = result.map(
      (r) => r.feasibility_classification
    );
    expect(feasibility_classifications).toContain("実装可能");
    expect(feasibility_classifications).toContain("条件付き実装");
  });
});