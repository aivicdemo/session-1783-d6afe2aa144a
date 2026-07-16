import {
  analyzeFeatureUsageAndAbandonmentPoints,
} from "../../src/logic/it-1-br-8-2-2-1";

describe("機能別使用頻度・離脱ポイント自動抽出・分析", () => {
  test("SCEN-393: 矛盾した状態遷移を含むログデータを除外し、品質警告を付与する", () => {
    // Arrange: 正常な状態遷移と矛盾した状態遷移が混在するログデータセット
    const mixedLogs = [
      {
        log_id: 1,
        user_id: "user_001",
        feature_name: "献立生成",
        state: "started",
        timestamp: "2024-01-15T09:00:00Z",
      },
      {
        log_id: 2,
        user_id: "user_001",
        feature_name: "献立生成",
        state: "in_progress",
        timestamp: "2024-01-15T09:05:00Z",
      },
      {
        log_id: 3,
        user_id: "user_001",
        feature_name: "献立生成",
        state: "completed",
        timestamp: "2024-01-15T09:10:00Z",
      },
      {
        log_id: 4,
        user_id: "user_001",
        feature_name: "献立生成",
        state: "started",
        timestamp: "2024-01-15T09:15:00Z",
      },
      {
        log_id: 5,
        user_id: "user_002",
        feature_name: "栄養管理",
        state: "started",
        timestamp: "2024-01-15T10:00:00Z",
      },
      {
        log_id: 6,
        user_id: "user_002",
        feature_name: "栄養管理",
        state: "in_progress",
        timestamp: "2024-01-15T10:05:00Z",
      },
      {
        log_id: 7,
        user_id: "user_002",
        feature_name: "栄養管理",
        state: "completed",
        timestamp: "2024-01-15T10:10:00Z",
      },
      {
        log_id: 8,
        user_id: "user_003",
        feature_name: "食費管理",
        state: "started",
        timestamp: "2024-01-15T11:00:00Z",
      },
      {
        log_id: 9,
        user_id: "user_003",
        feature_name: "食費管理",
        state: "abandoned",
        timestamp: "2024-01-15T11:02:00Z",
      },
    ];

    // Act: 分析機能を実行
    const result = analyzeFeatureUsageAndAbandonmentPoints(mixedLogs);

    // Assert: 分析結果の検証

    // 1. 矛盾したログが除外されていることを確認
    expect(result.excluded_record_count).toBe(1);

    // 2. 品質警告が付与されていることを確認
    expect(result.quality_warnings).toBeDefined();
    expect(result.quality_warnings.length).toBeGreaterThan(0);
    expect(result.quality_warnings[0]).toMatch(/矛盾/);

    // 3. 機能別使用頻度が正常なレコードのみで集計されていることを確認
    expect(result.feature_usage_frequency).toBeDefined();
    expect(result.feature_usage_frequency["献立生成"]).toBe(1);
    expect(result.feature_usage_frequency["栄養管理"]).toBe(1);
    expect(result.feature_usage_frequency["食費管理"]).toBe(1);

    // 4. 離脱ポイント集計が正常なレコードのみを含んでいることを確認
    expect(result.abandonment_points).toBeDefined();
    const food_cost_abandonment = result.abandonment_points.find(
      (ap) => ap.feature_name === "食費管理"
    );
    expect(food_cost_abandonment).toBeDefined();
    expect(food_cost_abandonment!.abandonment_count).toBe(1);
    expect(food_cost_abandonment!.abandonment_rate).toBe(1.0);

    // 5. 警告メッセージが除外理由を含んでいることを確認
    const warning_message = result.quality_warnings[0];
    expect(warning_message).toContain("completed");
    expect(warning_message).toContain("started");

    // 6. 正常なレコードが分析に含まれていることを確認
    expect(result.processed_record_count).toBe(8);

    // 7. 総レコード数と処理済みレコード数の整合性を確認
    expect(result.total_record_count).toBe(9);
    expect(result.processed_record_count).toBe(
      result.total_record_count - result.excluded_record_count
    );
  });
});