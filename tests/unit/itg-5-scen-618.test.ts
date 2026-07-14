import { validateAlgorithmImprovementMetrics } from "../../src/logic/it-7-2-1";

describe("献立生成アルゴリズム改善度検証ダッシュボード", () => {
  test("SCEN-618: [edge] デプロイ後の改善度検証機能 - 前週の記録が存在しない場合、前週比計算がスキップされ、絶対値指標のみで改善度が評価される", () => {
    // 前提: 前週の記録が存在しないアルゴリズム改善レコード
    const currentWeekMetrics = {
      algorithmVersionId: "v2.1",
      weekEndDate: "2024-01-15",
      successRate: 0.87,
      cookingTimeReduction: 15.5,
      userSatisfactionScore: 4.2,
      previousWeekSuccessRate: null,
      previousWeekCookingTimeReduction: null,
      previousWeekUserSatisfactionScore: null,
      hasPreviewWeekData: false,
    };

    // 改善度検証機能を実行
    const result = validateAlgorithmImprovementMetrics(currentWeekMetrics);

    // 絶対値指標のみで改善度が評価されることを検証
    expect(result.evaluationMethod).toBe("absolute");
    expect(result.successRate).toBe(0.87);
    expect(result.cookingTimeReduction).toBe(15.5);
    expect(result.userSatisfactionScore).toBe(4.2);

    // 前週比計算が実行されていないことを検証
    expect(result.weekOverWeekSuccessRateChange).toBe(null);
    expect(result.weekOverWeekCookingTimeChange).toBe(null);
    expect(result.weekOverWeekSatisfactionScoreChange).toBe(null);

    // 改善度評価の結果が絶対値指標に基づいて正確に計算されていることを検証
    // 成功率が0.87（87%）で基準値0.85（85%）以上であることを確認
    expect(result.improvementAssessment).toBe("approved");
    expect(result.improvementScore).toBe(92);

    // 改善度評価ダッシュボード表示用の結果を検証
    expect(result.dashboardDisplay).toEqual({
      successRateDisplay: "87%",
      cookingTimeReductionDisplay: "15.5分短縮",
      userSatisfactionScoreDisplay: "4.2/5.0",
      weekOverWeekChangeDisplay: "スキップ（前週データなし）",
      improvementBadge: "改善認定",
    });

    // 処理ログに前週比スキップが記録されていることを検証
    expect(result.processingLog).toContain("前週データが存在しません。前週比計算をスキップします。");
    expect(result.processingLog).toContain("絶対値指標のみに基づいて改善度を評価します。");

    // エラーが発生していないことを検証
    expect(result.errorOccurred).toBe(false);
  });
});