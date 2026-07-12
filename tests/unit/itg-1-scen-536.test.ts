import { evaluateMealPlanTrend } from "../../src/logic/it-3";

describe("食事評価データを献立生成ロジックに反映させる機能", () => {
  // SCEN-536: [normal] 購買傾向承認判定機能 - 季節変動・曜日別購買傾向データが却下される場合、反映は行われない
  test("季節変動・曜日別購買傾向データが却下された場合、前回の承認済み購買傾向データが献立生成に使用される", () => {
    // テストデータ: 前回の承認済み購買傾向データ
    const previousApprovedTrend = {
      trendId: "trend_001",
      seasonalPattern: {
        spring: { vegetable: 0.35, fruit: 0.25, protein: 0.4 },
        summer: { vegetable: 0.4, fruit: 0.3, protein: 0.3 },
      },
      weekdayPattern: {
        monday: 1.0,
        wednesday: 0.9,
        friday: 1.1,
      },
      approvalStatus: "approved",
      appliedDate: "2024-01-15T00:00:00Z",
    };

    // テストデータ: 新規の購買傾向データ（却下対象）
    const newTrendSubmission = {
      trendId: "trend_002",
      seasonalPattern: {
        spring: { vegetable: 0.5, fruit: 0.2, protein: 0.3 },
        summer: { vegetable: 0.45, fruit: 0.25, protein: 0.3 },
      },
      weekdayPattern: {
        monday: 0.8,
        wednesday: 0.85,
        friday: 1.2,
      },
      submittedDate: "2024-02-01T10:00:00Z",
      submittedBy: "pm_user_001",
      approvalStatus: "pending",
    };

    // 承認判定ロジックを実行: 却下判定
    const evaluationResult = evaluateMealPlanTrend({
      newTrend: newTrendSubmission,
      previousApprovedTrend: previousApprovedTrend,
      evaluationCriteria: {
        maxSeasonalDeviation: 0.15,
        maxWeekdayDeviation: 0.12,
        requiresApproval: true,
      },
      approvalDecision: "rejected",
      rejectionReason: "季節変動の幅が大きすぎます",
    });

    // 却下判定後の状態を検証
    expect(evaluationResult.approvalStatus).toBe("rejected");
    expect(evaluationResult.trendIdToApply).toBe("trend_001");
    expect(evaluationResult.isRejected).toBe(true);
    expect(evaluationResult.rejectionReason).toBe("季節変動の幅が大きすぎます");

    // 献立生成に使用される購買傾向データが前回の承認済みデータであることを確認
    expect(evaluationResult.activeTrendForMealGeneration).toEqual(
      previousApprovedTrend
    );
    expect(evaluationResult.activeTrendForMealGeneration.trendId).toBe(
      "trend_001"
    );
    expect(evaluationResult.activeTrendForMealGeneration.approvalStatus).toBe(
      "approved"
    );

    // 却下されたデータが献立生成に反映されていないことをアサート
    expect(evaluationResult.activeTrendForMealGeneration.seasonalPattern.spring.vegetable).toBe(0.35);
    expect(evaluationResult.activeTrendForMealGeneration.seasonalPattern.spring.vegetable).not.toBe(0.5);
    expect(evaluationResult.activeTrendForMealGeneration.weekdayPattern.monday).toBe(1.0);
    expect(evaluationResult.activeTrendForMealGeneration.weekdayPattern.monday).not.toBe(0.8);

    // ユーザーへの却下通知が返されることを確認
    expect(evaluationResult.notificationSent).toBe(true);
    expect(evaluationResult.notificationType).toBe("rejection");
    expect(evaluationResult.notificationMessage).toContain("却下");

    // 却下されたデータが提案候補から除外されていることを確認
    expect(evaluationResult.rejectedTrendExcluded).toBe(true);
    expect(evaluationResult.excludedTrendId).toBe("trend_002");
  });
});