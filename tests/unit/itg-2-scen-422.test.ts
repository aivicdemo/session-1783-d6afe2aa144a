import { determinateAlgorithmRolloutNext } from "../../src/logic/it-1-br-2-1-2-1";

describe("段階的アルゴリズムロールアウト制御機能", () => {
  // SCEN-422
  test("検証期間終了後に自動的にロールアウト判定処理が実施され、判定基準に基づいて次段階へのロールアウト判定結果が正しく決定される", () => {
    // 【前提条件】
    // - 栄養管理・分析ダッシュボードシステムにログイン済み
    // - 段階的アルゴリズムロールアウト制御機能の管理画面にアクセス可能
    // - 現在のロールアウト段階と検証期間の終了日時が確認可能
    // - ロールアウト判定処理を実行またはトリガーする準備ができている

    // 【入力データ準備】
    // 現在時刻: 2024-02-15T10:00:00Z (検証期間終了後)
    const currentTimestamp = new Date("2024-02-15T10:00:00Z");

    // ロールアウト管理データ
    const rolloutStageData = {
      stage: 1, // 現在のロールアウト段階: 1 (初期段階, 全体の10%)
      verificationStartDate: "2024-02-01T09:00:00Z",
      verificationEndDate: "2024-02-15T09:00:00Z", // 検証期間終了: 2024-02-15 09:00
      targetUserCount: 100, // 段階1のターゲットユーザー数
      successRateThreshold: 0.85, // 次段階ロールアウト判定基準: 成功率85%以上
      userSatisfactionScoreThreshold: 75, // 満足度スコア75以上
      algorithmVersionId: "v2.1.0",
    };

    // 検証期間中のパフォーマンスデータ
    const performanceMetrics = {
      mealGenerationSuccessCount: 86, // 成功: 86件
      totalMealGenerationCount: 100, // 総試行: 100件
      averageUserSatisfactionScore: 78.5, // 平均満足度スコア: 78.5
      cuisineTimeReductionRate: 0.22, // 調理時間短縮度: 22%
      recordedMetricsTimestamp: "2024-02-15T10:00:00Z",
    };

    // 【実行】
    // ロールアウト判定処理を実行
    const rolloutDecisionResult = determinateAlgorithmRolloutNext({
      currentTimestamp,
      rolloutStageData,
      performanceMetrics,
    });

    // 【検証1】判定が実行されたこと
    expect(rolloutDecisionResult).toBeDefined();

    // 【検証2】判定が成功して次段階へのロールアウトが承認されたか確認
    // - 成功率: 86/100 = 0.86 >= 0.85 ✅ 合格
    // - 満足度スコア: 78.5 >= 75 ✅ 合格
    // → 判定結果: 次段階へロールアウト可能
    expect(rolloutDecisionResult.rolloutDecision).toBe("approved"); // 次段階へロールアウト承認

    // 【検証3】判定基準ごとの詳細結果が記録されているか
    expect(rolloutDecisionResult.successRateActual).toBe(0.86);
    expect(rolloutDecisionResult.successRateMeetsThreshold).toBe(true);
    expect(rolloutDecisionResult.userSatisfactionScoreActual).toBe(78.5);
    expect(rolloutDecisionResult.userSatisfactionScoreMeetsThreshold).toBe(true);

    // 【検証4】次段階情報が正しく計算・提示されているか
    // 次段階: 段계 2 (全体の30%)
    expect(rolloutDecisionResult.nextStage).toBe(2);
    expect(rolloutDecisionResult.nextStageTargetUserPercentage).toBe(0.3);

    // 【検証5】判定実行日時がシステムログに記録されているか
    expect(rolloutDecisionResult.decisionExecutedAt).toBe(
      "2024-02-15T10:00:00Z"
    );

    // 【検証6】判定ロジックの説明テキストが記録されているか
    expect(rolloutDecisionResult.decisionReason).toBeDefined();
    expect(
      rolloutDecisionResult.decisionReason.includes("成功率")
    ).toBeTruthy();
    expect(
      rolloutDecisionResult.decisionReason.includes("満足度")
    ).toBeTruthy();

    // 【検証7】ロールアウト状態がhistoryに記録されているか
    expect(rolloutDecisionResult.rolloutHistory).toBeDefined();
    expect(rolloutDecisionResult.rolloutHistory.length).toBeGreaterThan(0);
    const latestHistoryEntry =
      rolloutDecisionResult.rolloutHistory[
        rolloutDecisionResult.rolloutHistory.length - 1
      ];
    expect(latestHistoryEntry.stage).toBe(1); // 前の段階
    expect(latestHistoryEntry.decision).toBe("approved"); // 承認判定
    expect(latestHistoryEntry.nextStage).toBe(2); // 次段階
    expect(latestHistoryEntry.recordedAt).toBe("2024-02-15T10:00:00Z");
  });

  // 境界値テスト: 成功率が閾値ちょうど、満足度スコアが不足の場合
  test("成功率は合格だが満足度スコアが閾値未満の場合、ロールアウト判定は保留される", () => {
    const currentTimestamp = new Date("2024-03-01T10:00:00Z");

    const rolloutStageData = {
      stage: 1,
      verificationStartDate: "2024-02-15T09:00:00Z",
      verificationEndDate: "2024-03-01T09:00:00Z",
      targetUserCount: 100,
      successRateThreshold: 0.85,
      userSatisfactionScoreThreshold: 75,
      algorithmVersionId: "v2.1.0",
    };

    const performanceMetrics = {
      mealGenerationSuccessCount: 85, // 成功率: 85/100 = 0.85 (ちょうど合格)
      totalMealGenerationCount: 100,
      averageUserSatisfactionScore: 72.0, // 満足度: 72.0 < 75 (不合格)
      cuisineTimeReductionRate: 0.15,
      recordedMetricsTimestamp: "2024-03-01T10:00:00Z",
    };

    const rolloutDecisionResult = determinateAlgorithmRolloutNext({
      currentTimestamp,
      rolloutStageData,
      performanceMetrics,
    });

    // 判定: 保留 (1つ以上の基準が不合格)
    expect(rolloutDecisionResult.rolloutDecision).toBe("hold");
    expect(rolloutDecisionResult.successRateActual).toBe(0.85);
    expect(rolloutDecisionResult.successRateMeetsThreshold).toBe(true);
    expect(rolloutDecisionResult.userSatisfactionScoreActual).toBe(72.0);
    expect(rolloutDecisionResult.userSatisfactionScoreMeetsThreshold).toBe(
      false
    );
    expect(rolloutDecisionResult.decisionExecutedAt).toBe(
      "2024-03-01T10:00:00Z"
    );
  });

  // 境界値テスト: 両基準が不合格の場合
  test("成功率と満足度スコアの両方が閾値未満の場合、ロールアウト判定は却下される", () => {
    const currentTimestamp = new Date("2024-03-15T10:00:00Z");

    const rolloutStageData = {
      stage: 1,
      verificationStartDate: "2024-03-01T09:00:00Z",
      verificationEndDate: "2024-03-15T09:00:00Z",
      targetUserCount: 100,
      successRateThreshold: 0.85,
      userSatisfactionScoreThreshold: 75,
      algorithmVersionId: "v2.1.0",
    };

    const performanceMetrics = {
      mealGenerationSuccessCount: 80, // 成功率: 80/100 = 0.80 < 0.85 (不合格)
      totalMealGenerationCount: 100,
      averageUserSatisfactionScore: 70.5, // 満足度: 70.5 < 75 (不合格)
      cuisineTimeReductionRate: 0.10,
      recordedMetricsTimestamp: "2024-03-15T10:00:00Z",
    };

    const rolloutDecisionResult = determinateAlgorithmRolloutNext({
      currentTimestamp,
      rolloutStageData,
      performanceMetrics,
    });

    // 判定: 却下 (両基準が不合格)
    expect(rolloutDecisionResult.rolloutDecision).toBe("rejected");
    expect(rolloutDecisionResult.successRateMeetsThreshold).toBe(false);
    expect(rolloutDecisionResult.userSatisfactionScoreMeetsThreshold).toBe(
      false
    );
  });

  // エラーテスト: 検証期間がまだ終了していない場合
  test("検証期間が終了していない場合、ロールアウト判定は実行されずエラーが発生する", () => {
    const currentTimestamp = new Date("2024-02-14T10:00:00Z"); // 検証期間終了前

    const rolloutStageData = {
      stage: 1,
      verificationStartDate: "2024-02-01T09:00:00Z",
      verificationEndDate: "2024-02-15T09:00:00Z", // まだ終了していない
      targetUserCount: 100,
      successRateThreshold: 0.85,
      userSatisfactionScoreThreshold: 75,
      algorithmVersionId: "v2.1.0",
    };

    const performanceMetrics = {
      mealGenerationSuccessCount: 86,
      totalMealGenerationCount: 100,
      averageUserSatisfactionScore: 78.5,
      cuisineTimeReductionRate: 0.22,
      recordedMetricsTimestamp: "2024-02-14T10:00:00Z",
    };

    expect(() => {
      determinateAlgorithmRolloutNext({
        currentTimestamp,
        rolloutStageData,
        performanceMetrics,
      });
    }).toThrow(/検証期間/);
  });

  // エラーテスト: パフォーマンスメトリクスが不完全
  test("パフォーマンスメトリクスが不完全な場合、判定処理はエラーを発生させる", () => {
    const currentTimestamp = new Date("2024-02-15T10:00:00Z");

    const rolloutStageData = {
      stage: 1,
      verificationStartDate: "2024-02-01T09:00:00Z",
      verificationEndDate: "2024-02-15T09:00:00Z",
      targetUserCount: 100,
      successRateThreshold: 0.85,
      userSatisfactionScoreThreshold: 75,
      algorithmVersionId: "v2.1.0",
    };

    const performanceMetrics = {
      mealGenerationSuccessCount: 86,
      totalMealGenerationCount: 0, // 不正: 0件
      averageUserSatisfactionScore: 78.5,
      cuisineTimeReductionRate: 0.22,
      recordedMetricsTimestamp: "2024-02-15T10:00:00Z",
    };

    expect(() => {
      determinateAlgorithmRolloutNext({
        currentTimestamp,
        rolloutStageData,
        performanceMetrics,
      });
    }).toThrow(/メトリクス/);
  });
});