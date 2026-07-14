import { aggregateWeeklyMetrics } from "../../src/logic/it-7-2-1";

describe("週次行動指標自動集計とアルゴリズム改善効果比較", () => {
  // SCEN-596: [error] セグメント別効果分析機能 - 対象セグメントにユーザーデータが存在しない場合、空集合を適切にハンドリングして分析結果を生成できる
  test("should handle empty segment data without error and return analysis result with default values", () => {
    // セットアップ: 対象セグメント（年代別：20-30代、家族構成：4人以上）を指定し、該当ユーザーデータが存在しない状態
    const emptySegmentInput = {
      segmentId: "segment_age_20s_family_4plus",
      segmentName: "20-30代・家族4人以上",
      userId: [],
      analysisWeekStart: new Date("2024-01-15T00:00:00Z"),
      analysisWeekEnd: new Date("2024-01-21T23:59:59Z"),
      algorithmVersionBefore: "v1.0",
      algorithmVersionAfter: "v1.1",
    };

    // 実行: セグメント別効果分析機能を実行し、空集合を含むデータセットで処理
    const result = aggregateWeeklyMetrics(emptySegmentInput);

    // 検証1: エラーが発生しないことを確認（エラーオブジェクトではなく、正常な分析結果を返す）
    expect(result).toBeDefined();
    expect(result).not.toHaveProperty("errorCode");

    // 検証2: デフォルト値または「データなし」を示す分析結果を返す
    expect(result.segmentId).toBe("segment_age_20s_family_4plus");
    expect(result.segmentName).toBe("20-30代・家族4人以上");
    expect(result.dataAvailable).toBe(false);
    expect(result.userCount).toBe(0);

    // 検証3: 空集合ハンドリング時の指標値がデフォルト値で返される
    expect(result.metrics).toEqual({
      successRateImprovement: 0,
      successRateBefore: 0,
      successRateAfter: 0,
      cookingTimeReductionImprovement: 0,
      cookingTimeMinutesBefore: 0,
      cookingTimeMinutesAfter: 0,
      satisfactionScoreImprovement: 0,
      satisfactionScoreBefore: 0,
      satisfactionScoreAfter: 0,
      rejectionRateBefore: 0,
      rejectionRateAfter: 0,
    });

    // 検証4: ユーザーに対して分かりやすいメッセージが返される
    expect(result.message).toBe("このセグメントにはデータがありません");

    // 検証5: ログレベルが警告に設定されていることを確認
    expect(result.logLevel).toBe("warning");

    // 検証6: ダッシュボード表示用のフラグが正常に設定される（正常に表示される状態を維持）
    expect(result.dashboardDisplayReady).toBe(true);

    // 検証7: 分析対象週の期間が正しく記録される
    expect(result.analysisWeekStart).toBe("2024-01-15T00:00:00Z");
    expect(result.analysisWeekEnd).toBe("2024-01-21T23:59:59Z");

    // 検証8: 比較対象のアルゴリズムバージョンが記録される
    expect(result.algorithmVersionBefore).toBe("v1.0");
    expect(result.algorithmVersionAfter).toBe("v1.1");

    // 検証9: エラー文字列が含まれないこと（正常なハンドリング）
    expect(result.message).not.toMatch(/エラー/);
    expect(result.message).not.toMatch(/失敗/);
  });
});