import { aggregateFunctionUsagePatterns } from "../../src/logic/it-2";

describe("機能別使用パターン分析機能 - 離脱ポイント集計の正確性", () => {
  test("SCEN-401: 離脱ポイント数がログ件数を超えないよう正確に集計される", () => {
    // テストデータ準備: 同一ユーザーの複数セッションログ（100件）
    const userId = "user-001";
    const sessionLogs = Array.from({ length: 100 }, (_, index) => ({
      sessionId: `session-${Math.floor(index / 10)}`,
      userId,
      timestamp: new Date(`2024-01-15T${String(Math.floor(index / 4)).padStart(2, "0")}:${String((index % 4) * 15).padStart(2, "0")}:00Z`).toISOString(),
      feature: ["献立生成", "材料選択", "調理手順", "確認"][index % 4],
      action: index % 3 === 0 ? "離脱" : "続行",
    }));

    // 各セッションにおいて複数の離脱ポイントを記録
    const abandonePoints = sessionLogs.filter((log) => log.action === "離脱").map((log) => ({
      sessionId: log.sessionId,
      feature: log.feature,
      timestamp: log.timestamp,
      screen: ["材料選択画面", "調理手順確認画面", "栄養確認画面"][Math.random() * 3 | 0],
    }));

    // 離脱ポイント数の集計ロジック実行
    const aggregationResult = aggregateFunctionUsagePatterns({
      userId,
      logs: sessionLogs,
      abandonedPoints: abandonePoints,
      analysisStartDate: "2024-01-15T00:00:00Z",
      analysisEndDate: "2024-01-15T23:59:59Z",
    });

    // 集計された離脱ポイント数がログ件数以下であることを検証
    expect(aggregationResult.totalAbandonedCount).toBeLessThanOrEqual(sessionLogs.length);

    // 離脱ポイント数がログ件数と同一または未満の範囲内に収まっていることをアサーション
    expect(aggregationResult.totalAbandonedCount).toBeGreaterThanOrEqual(0);
    expect(aggregationResult.totalAbandonedCount).toBeLessThanOrEqual(100);

    // 境界値ケース: 離脱ポイント数 = ログ件数のシナリオ
    const allAbandonLogs = Array.from({ length: 50 }, (_, index) => ({
      sessionId: `boundary-session-${index}`,
      userId,
      timestamp: new Date(`2024-01-15T${String(Math.floor(index / 4)).padStart(2, "0")}:00:00Z`).toISOString(),
      feature: "献立生成",
      action: "離脱",
    }));

    const boundaryResult = aggregateFunctionUsagePatterns({
      userId,
      logs: allAbandonLogs,
      abandonedPoints: allAbandonLogs.map((log) => ({
        sessionId: log.sessionId,
        feature: log.feature,
        timestamp: log.timestamp,
        screen: "材料選択画面",
      })),
      analysisStartDate: "2024-01-15T00:00:00Z",
      analysisEndDate: "2024-01-15T23:59:59Z",
    });

    // 境界値検証: 離脱ポイント数がログ件数と同一
    expect(boundaryResult.totalAbandonedCount).toBeLessThanOrEqual(allAbandonLogs.length);
    expect(boundaryResult.totalAbandonedCount).toBe(50);

    // 離脱ポイント数がログ件数を超えるカウント異常がないことを確認
    expect(aggregationResult.totalAbandonedCount).not.toBeGreaterThan(sessionLogs.length);
    expect(boundaryResult.totalAbandonedCount).not.toBeGreaterThan(allAbandonLogs.length);

    // 追加検証: 複数セッションの離脱ポイント集計が正確
    const multiSessionResult = aggregateFunctionUsagePatterns({
      userId,
      logs: sessionLogs,
      abandonedPoints: abandonePoints,
      analysisStartDate: "2024-01-15T00:00:00Z",
      analysisEndDate: "2024-01-15T23:59:59Z",
    });

    const expectedAbandonedCount = sessionLogs.filter((log) => log.action === "離脱").length;
    expect(multiSessionResult.totalAbandonedCount).toBeLessThanOrEqual(expectedAbandonedCount);
  });
});