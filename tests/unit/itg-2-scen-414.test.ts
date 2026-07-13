import { processDietaryRestrictionsWithTimestamp } from "../../src/logic/it-1-br-2-1-1-1";

describe("複数制限条件同時入力処理機能", () => {
  // SCEN-414
  test("同一タイムスタンプで入力された2件以上の制限条件が一意な処理順序で処理される", () => {
    const fixed_timestamp = "2024-01-15T11:00:00.500Z";
    const fixed_timestamp_ms = new Date(fixed_timestamp).getTime();

    const restriction_1 = {
      id: "rest_001",
      type: "calorie_upper_limit",
      value: 2000,
      timestamp_ms: fixed_timestamp_ms,
      user_id: "user_001",
    };

    const restriction_2 = {
      id: "rest_002",
      type: "protein_lower_limit",
      value: 50,
      timestamp_ms: fixed_timestamp_ms,
      user_id: "user_001",
    };

    const restriction_3 = {
      id: "rest_003",
      type: "salt_upper_limit",
      value: 6,
      timestamp_ms: fixed_timestamp_ms,
      user_id: "user_001",
    };

    const input_restrictions = [
      restriction_1,
      restriction_2,
      restriction_3,
    ];

    // 1回目の実行
    const result_1 = processDietaryRestrictionsWithTimestamp(
      input_restrictions
    );
    const processing_order_1 = result_1.processing_order;
    const system_log_1 = result_1.system_log;

    // 期待値: 処理順序は一意に決定されている
    expect(processing_order_1).toHaveLength(3);
    expect(processing_order_1).toEqual(["rest_001", "rest_002", "rest_003"]);

    // システムログに処理順序が記録されている
    expect(system_log_1).toContain("rest_001");
    expect(system_log_1).toContain("rest_002");
    expect(system_log_1).toContain("rest_003");

    // 2回目の実行
    const result_2 = processDietaryRestrictionsWithTimestamp(
      input_restrictions
    );
    const processing_order_2 = result_2.processing_order;

    // 処理順序が一致
    expect(processing_order_2).toEqual(processing_order_1);

    // 3回目の実行
    const result_3 = processDietaryRestrictionsWithTimestamp(
      input_restrictions
    );
    const processing_order_3 = result_3.processing_order;

    // 処理順序が一致
    expect(processing_order_3).toEqual(processing_order_1);

    // すべての実行で処理順序が同一
    expect(processing_order_1).toEqual(processing_order_2);
    expect(processing_order_2).toEqual(processing_order_3);

    // 結果の構造検証
    expect(result_1).toHaveProperty("processing_order");
    expect(result_1).toHaveProperty("system_log");
    expect(result_1).toHaveProperty("status");
    expect(result_1.status).toBe("completed");

    // タイムスタンプが同一であることを確認
    const all_timestamps = input_restrictions.map((r) => r.timestamp_ms);
    const unique_timestamps = new Set(all_timestamps);
    expect(unique_timestamps.size).toBe(1);

    // 処理された制限条件がすべて入力制限条件に含まれている
    for (const processed_id of processing_order_1) {
      expect(input_restrictions.map((r) => r.id)).toContain(processed_id);
    }
  });
});