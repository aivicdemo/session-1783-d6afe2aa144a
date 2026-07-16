import { evaluateNutritionImprovementProposal } from "../../src/logic/it-8-1-1-1";

describe("ユーザーインタビュー記録と利用ログから食材制限・調理時間制限・予算制約の発生頻度と影響度を自動抽出・分類し、優先度マトリクスを生成・可視化する機能", () => {
  // SCEN-248: [normal] 栄養士による失敗パターン根本原因評価・承認 - 栄養士が失敗パターン分析結果と過去献立履歴から栄養基準ロジック改善案を評価し、承認可否と改善優先度が記録される
  test("栄養士が失敗パターン分析結果と過去献立履歴から栄養基準ロジック改善案を評価し、承認可否と改善優先度が記録される", () => {
    const nutritionistId = "nutritionist_001";
    const improvementProposalId = "proposal_2024_001";
    const failurePatternAnalysisId = "analysis_week_01";
    const mealHistoryDataId = "history_jan_2024";

    const evaluationInput = {
      nutritionistId: nutritionistId,
      improvementProposalId: improvementProposalId,
      failurePatternAnalysisId: failurePatternAnalysisId,
      mealHistoryDataId: mealHistoryDataId,
      evaluationComment:
        "栄養バランス計算アルゴリズムの改善により、カルシウム摂取不足が20%改善される見込み。実装難度は中程度で、優先度は高い。",
      approvalStatus: "approved",
      priorityLevel: 2,
      evaluationTimestamp: new Date("2024-01-15T10:30:00Z"),
    };

    const result = evaluateNutritionImprovementProposal(evaluationInput);

    expect(result).toBeDefined();
    expect(result.evaluationId).toBeDefined();
    expect(result.evaluationId).toMatch(/^eval_/);

    expect(result.nutritionistId).toBe(nutritionistId);
    expect(result.improvementProposalId).toBe(improvementProposalId);
    expect(result.failurePatternAnalysisId).toBe(failurePatternAnalysisId);
    expect(result.mealHistoryDataId).toBe(mealHistoryDataId);

    expect(result.approvalStatus).toBe("approved");
    expect(result.priorityLevel).toBe(2);
    expect(result.priorityLevel).toBeGreaterThanOrEqual(1);
    expect(result.priorityLevel).toBeLessThanOrEqual(5);

    expect(result.evaluationComment).toBe(evaluationInput.evaluationComment);

    expect(result.evaluationTimestamp).toEqual(
      new Date("2024-01-15T10:30:00Z")
    );

    expect(result.recordedAt).toBeDefined();
    expect(result.recordedAt).toEqual(new Date("2024-01-15T10:30:00Z"));

    expect(result.evaluatorRole).toBe("nutritionist");

    expect(result.isRecorded).toBe(true);

    expect(result.canBeReferencedByFollowingProcess).toBe(true);
  });

  // エラーテスト: nutritionistId が空の場合
  test("nutritionistId が空の場合は栄養士ID不正エラーが発生する", () => {
    const evaluationInput = {
      nutritionistId: "",
      improvementProposalId: "proposal_2024_001",
      failurePatternAnalysisId: "analysis_week_01",
      mealHistoryDataId: "history_jan_2024",
      evaluationComment: "テストコメント",
      approvalStatus: "approved",
      priorityLevel: 2,
      evaluationTimestamp: new Date("2024-01-15T10:30:00Z"),
    };

    expect(() =>
      evaluateNutritionImprovementProposal(evaluationInput)
    ).toThrow(/栄養士ID/);
  });

  // エラーテスト: improvementProposalId が空の場合
  test("improvementProposalId が空の場合は改善提案ID不正エラーが発生する", () => {
    const evaluationInput = {
      nutritionistId: "nutritionist_001",
      improvementProposalId: "",
      failurePatternAnalysisId: "analysis_week_01",
      mealHistoryDataId: "history_jan_2024",
      evaluationComment: "テストコメント",
      approvalStatus: "approved",
      priorityLevel: 2,
      evaluationTimestamp: new Date("2024-01-15T10:30:00Z"),
    };

    expect(() =>
      evaluateNutritionImprovementProposal(evaluationInput)
    ).toThrow(/改善提案ID/);
  });

  // エラーテスト: priorityLevel が範囲外の場合
  test("priorityLevel が1～5の範囲外の場合は優先度範囲エラーが発生する", () => {
    const evaluationInput = {
      nutritionistId: "nutritionist_001",
      improvementProposalId: "proposal_2024_001",
      failurePatternAnalysisId: "analysis_week_01",
      mealHistoryDataId: "history_jan_2024",
      evaluationComment: "テストコメント",
      approvalStatus: "approved",
      priorityLevel: 6,
      evaluationTimestamp: new Date("2024-01-15T10:30:00Z"),
    };

    expect(() =>
      evaluateNutritionImprovementProposal(evaluationInput)
    ).toThrow(/優先度/);
  });

  // エラーテスト: approvalStatus が無効な値の場合
  test("approvalStatus が approved/rejected のいずれでもない場合は承認状態エラーが発生する", () => {
    const evaluationInput = {
      nutritionistId: "nutritionist_001",
      improvementProposalId: "proposal_2024_001",
      failurePatternAnalysisId: "analysis_week_01",
      mealHistoryDataId: "history_jan_2024",
      evaluationComment: "テストコメント",
      approvalStatus: "invalid_status",
      priorityLevel: 2,
      evaluationTimestamp: new Date("2024-01-15T10:30:00Z"),
    };

    expect(() =>
      evaluateNutritionImprovementProposal(evaluationInput)
    ).toThrow(/承認状態/);
  });

  // エラーテスト: evaluationComment が空の場合
  test("evaluationComment が空の場合はコメント必須エラーが発生する", () => {
    const evaluationInput = {
      nutritionistId: "nutritionist_001",
      improvementProposalId: "proposal_2024_001",
      failurePatternAnalysisId: "analysis_week_01",
      mealHistoryDataId: "history_jan_2024",
      evaluationComment: "",
      approvalStatus: "approved",
      priorityLevel: 2,
      evaluationTimestamp: new Date("2024-01-15T10:30:00Z"),
    };

    expect(() =>
      evaluateNutritionImprovementProposal(evaluationInput)
    ).toThrow(/評価コメント/);
  });

  // 境界値テスト: priorityLevel = 1
  test("priorityLevel = 1 の場合、正常に記録される", () => {
    const evaluationInput = {
      nutritionistId: "nutritionist_001",
      improvementProposalId: "proposal_2024_001",
      failurePatternAnalysisId: "analysis_week_01",
      mealHistoryDataId: "history_jan_2024",
      evaluationComment: "最優先で実装すべき改善案",
      approvalStatus: "approved",
      priorityLevel: 1,
      evaluationTimestamp: new Date("2024-01-15T10:30:00Z"),
    };

    const result = evaluateNutritionImprovementProposal(evaluationInput);

    expect(result.priorityLevel).toBe(1);
    expect(result.isRecorded).toBe(true);
  });

  // 境界値テスト: priorityLevel = 5
  test("priorityLevel = 5 の場合、正常に記録される", () => {
    const evaluationInput = {
      nutritionistId: "nutritionist_001",
      improvementProposalId: "proposal_2024_001",
      failurePatternAnalysisId: "analysis_week_01",
      mealHistoryDataId: "history_jan_2024",
      evaluationComment: "低優先度の改善案",
      approvalStatus: "approved",
      priorityLevel: 5,
      evaluationTimestamp: new Date("2024-01-15T10:30:00Z"),
    };

    const result = evaluateNutritionImprovementProposal(evaluationInput);

    expect(result.priorityLevel).toBe(5);
    expect(result.isRecorded).toBe(true);
  });

  // 正常系テスト: 却下ステータスの場合
  test("改善案が却下される場合、承認可否が正確に記録される", () => {
    const evaluationInput = {
      nutritionistId: "nutritionist_001",
      improvementProposalId: "proposal_2024_002",
      failurePatternAnalysisId: "analysis_week_02",
      mealHistoryDataId: "history_feb_2024",
      evaluationComment:
        "この改善案は技術的実現性に課題があり、現状では実装困難と判断する。",
      approvalStatus: "rejected",
      priorityLevel: 4,
      evaluationTimestamp: new Date("2024-01-16T14:45:00Z"),
    };

    const result = evaluateNutritionImprovementProposal(evaluationInput);

    expect(result.approvalStatus).toBe("rejected");
    expect(result.priorityLevel).toBe(4);
    expect(result.isRecorded).toBe(true);
    expect(result.evaluatorRole).toBe("nutritionist");
  });

  // 正常系テスト: 複数提案の評価記録が独立している
  test("異なる複数の改善提案に対する評価が独立して記録される", () => {
    const evaluationInput1 = {
      nutritionistId: "nutritionist_001",
      improvementProposalId: "proposal_A",
      failurePatternAnalysisId: "analysis_A",
      mealHistoryDataId: "history_A",
      evaluationComment: "改善提案A: 承認推奨",
      approvalStatus: "approved",
      priorityLevel: 1,
      evaluationTimestamp: new Date("2024-01-15T10:00:00Z"),
    };

    const evaluationInput2 = {
      nutritionistId: "nutritionist_001",
      improvementProposalId: "proposal_B",
      failurePatternAnalysisId: "analysis_B",
      mealHistoryDataId: "history_B",
      evaluationComment: "改善提案B: 却下推奨",
      approvalStatus: "rejected",
      priorityLevel: 5,
      evaluationTimestamp: new Date("2024-01-15T11:00:00Z"),
    };

    const result1 = evaluateNutritionImprovementProposal(evaluationInput1);
    const result2 = evaluateNutritionImprovementProposal(evaluationInput2);

    expect(result1.improvementProposalId).toBe("proposal_A");
    expect(result1.approvalStatus).toBe("approved");
    expect(result1.priorityLevel).toBe(1);

    expect(result2.improvementProposalId).toBe("proposal_B");
    expect(result2.approvalStatus).toBe("rejected");
    expect(result2.priorityLevel).toBe(5);

    expect(result1.evaluationId).not.toBe(result2.evaluationId);
  });
});