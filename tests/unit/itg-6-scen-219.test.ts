import { evaluateTechnicalFeasibility } from "../../src/logic/it-8-1-1-1";

describe("ユーザーペイン分析・差別化軸検証システム - 技術実現性検証・分類機能", () => {
  // SCEN-219
  test("提案ごとに技術実現性が適切に評価され、実装可能・条件付き実装・実装不可のいずれかに分類される", () => {
    // 提案1: 実装可能（技術的課題がなく、現在のリソースで実装可能）
    const proposal_implementable = {
      proposalId: "PROP-001",
      proposalTitle: "調理時間短縮アルゴリズムの改善",
      technicalChallenges: [],
      resourceRequirements: {
        developmentHours: 80,
        availableDeveloperHours: 120,
      },
      dependencies: [],
      estimatedComplexity: 2,
      currentCapacity: 0.6,
    };

    // 提案2: 条件付き実装（特定の条件やリソース確保により実装可能）
    const proposal_conditional = {
      proposalId: "PROP-002",
      proposalTitle: "AI 予測モデルの組み込み",
      technicalChallenges: [
        "機械学習フレームワークの統合に技術検証が必要",
      ],
      resourceRequirements: {
        developmentHours: 200,
        availableDeveloperHours: 120,
      },
      dependencies: ["外部 API ライブラリの選定確定"],
      estimatedComplexity: 4,
      currentCapacity: 0.6,
    };

    // 提案3: 実装不可（技術的な制約や実現不可能な要件により実装困難）
    const proposal_not_implementable = {
      proposalId: "PROP-003",
      proposalTitle: "リアルタイム音声認識による食材入力",
      technicalChallenges: [
        "多言語対応の精度が市場水準未満",
        "既存 UI フレームワークでの実装が困難",
        "ライセンス制約により採用不可能なライブラリが必須",
      ],
      resourceRequirements: {
        developmentHours: 500,
        availableDeveloperHours: 120,
      },
      dependencies: [
        "完全な再構築が必須",
        "外部ベンダーとの長期契約（現在交渉中）",
      ],
      estimatedComplexity: 5,
      currentCapacity: 0.6,
    };

    // 技術実現性検証を実行
    const result_implementable = evaluateTechnicalFeasibility(
      proposal_implementable
    );
    const result_conditional = evaluateTechnicalFeasibility(
      proposal_conditional
    );
    const result_not_implementable = evaluateTechnicalFeasibility(
      proposal_not_implementable
    );

    // 提案1の検証: 実装可能に分類される
    expect(result_implementable).toEqual({
      proposalId: "PROP-001",
      feasibilityClassification: "IMPLEMENTABLE",
      feasibilityScore: 95,
      technicalIssuesDetected: 0,
      resourceConstraintsFeasible: true,
      dependenciesResolvable: true,
      complexityLevel: 2,
      estimatedImplementationEffort: 80,
      capacityUtilization: 0.67,
      evaluationReasoning: {
        technicalChallengesCount: 0,
        resourceGapHours: -40,
        criticalDependencies: 0,
        feasibilityFactors: [
          "技術的課題なし",
          "リソースに余裕あり",
          "依存関係なし",
        ],
      },
      evaluationTimestamp: expect.any(String),
    });

    // 提案2の検証: 条件付き実装に分類される
    expect(result_conditional).toEqual({
      proposalId: "PROP-002",
      feasibilityClassification: "CONDITIONAL",
      feasibilityScore: 65,
      technicalIssuesDetected: 1,
      resourceConstraintsFeasible: false,
      dependenciesResolvable: true,
      complexityLevel: 4,
      estimatedImplementationEffort: 200,
      capacityUtilization: 1.67,
      evaluationReasoning: {
        technicalChallengesCount: 1,
        resourceGapHours: 80,
        criticalDependencies: 1,
        feasibilityFactors: [
          "技術検証が必要",
          "リソース追加確保が必須",
          "依存関係は解決可能",
        ],
        conditionalRequirements: [
          "追加エンジニアリソース確保（80 時間相当）",
          "機械学習フレームワークの技術検証完了",
          "外部 API ライブラリの最終選定",
        ],
      },
      evaluationTimestamp: expect.any(String),
    });

    // 提案3の検証: 実装不可に分類される
    expect(result_not_implementable).toEqual({
      proposalId: "PROP-003",
      feasibilityClassification: "NOT_IMPLEMENTABLE",
      feasibilityScore: 15,
      technicalIssuesDetected: 3,
      resourceConstraintsFeasible: false,
      dependenciesResolvable: false,
      complexityLevel: 5,
      estimatedImplementationEffort: 500,
      capacityUtilization: 4.17,
      evaluationReasoning: {
        technicalChallengesCount: 3,
        resourceGapHours: 380,
        criticalDependencies: 2,
        feasibilityFactors: [
          "技術的制約が複数存在",
          "既存フレームワークでの実装が困難",
          "ライセンス制約により採用不可能なライブラリが必須",
        ],
        blockingFactors: [
          "多言語対応精度が市場水準未満",
          "UI フレームワーク再構築が必須",
          "ライセンス制約による外部ライブラリ採用不可",
          "外部ベンダー契約が完了していない",
        ],
      },
      evaluationTimestamp: expect.any(String),
    });

    // 複数提案の分類結果を一覧表示・比較
    const proposals = [
      proposal_implementable,
      proposal_conditional,
      proposal_not_implementable,
    ];
    const evaluationResults = proposals.map((proposal) =>
      evaluateTechnicalFeasibility(proposal)
    );

    // 分類カウント検証
    const implementableCount = evaluationResults.filter(
      (r) => r.feasibilityClassification === "IMPLEMENTABLE"
    ).length;
    const conditionalCount = evaluationResults.filter(
      (r) => r.feasibilityClassification === "CONDITIONAL"
    ).length;
    const notImplementableCount = evaluationResults.filter(
      (r) => r.feasibilityClassification === "NOT_IMPLEMENTABLE"
    ).length;

    expect(implementableCount).toBe(1);
    expect(conditionalCount).toBe(1);
    expect(notImplementableCount).toBe(1);

    // 各分類の根拠が明示されていることを検証
    evaluationResults.forEach((result) => {
      expect(result.evaluationReasoning).toBeDefined();
      expect(result.evaluationReasoning.technicalChallengesCount).toBeGreaterThanOrEqual(
        0
      );
      expect(result.evaluationReasoning.resourceGapHours).toBeDefined();
      expect(result.evaluationReasoning.criticalDependencies).toBeGreaterThanOrEqual(
        0
      );
      expect(Array.isArray(result.evaluationReasoning.feasibilityFactors)).toBe(
        true
      );
      expect(result.evaluationReasoning.feasibilityFactors.length).toBeGreaterThan(
        0
      );
    });

    // 分類根拠のカテゴリ検証（条件付きの場合）
    const conditionalResult = evaluationResults.find(
      (r) => r.feasibilityClassification === "CONDITIONAL"
    );
    if (conditionalResult) {
      expect(conditionalResult.evaluationReasoning.conditionalRequirements).toBeDefined();
      expect(
        Array.isArray(
          conditionalResult.evaluationReasoning.conditionalRequirements
        )
      ).toBe(true);
    }

    // 分類根拠のカテゴリ検証（実装不可の場合）
    const notImplementableResult = evaluationResults.find(
      (r) => r.feasibilityClassification === "NOT_IMPLEMENTABLE"
    );
    if (notImplementableResult) {
      expect(notImplementableResult.evaluationReasoning.blockingFactors).toBeDefined();
      expect(
        Array.isArray(notImplementableResult.evaluationReasoning.blockingFactors)
      ).toBe(true);
      expect(
        notImplementableResult.evaluationReasoning.blockingFactors.length
      ).toBeGreaterThan(0);
    }

    // スコアの妥当性検証（降順）
    expect(result_implementable.feasibilityScore).toBeGreaterThan(
      result_conditional.feasibilityScore
    );
    expect(result_conditional.feasibilityScore).toBeGreaterThan(
      result_not_implementable.feasibilityScore
    );

    // タイムスタンプが ISO 形式であることを検証
    evaluationResults.forEach((result) => {
      const timestamp = new Date(result.evaluationTimestamp);
      expect(timestamp.getTime()).toBeGreaterThan(0);
    });
  });
});