import {
  validateDataQuality,
  DataQualityValidationInput,
  DataQualityValidationResult,
  ValidationRecord,
} from "../../src/logic/it-1-br-8-2-2-1";

describe("機能別使用頻度・離脱ポイント分析 - データ品質検証", () => {
  // SCEN-274
  test("欠損値・異常値が検出されたレコードが分析対象から除外される", () => {
    // テストデータセットを準備（正常レコード10件、欠損値3件、異常値2件）
    const validRecords: ValidationRecord[] = [
      {
        record_id: "valid_001",
        user_id: "user_001",
        feature_name: "献立生成",
        usage_count: 15,
        session_duration_minutes: 45,
        timestamp: "2024-01-15T10:30:00Z",
      },
      {
        record_id: "valid_002",
        user_id: "user_002",
        feature_name: "栄養分析",
        usage_count: 8,
        session_duration_minutes: 30,
        timestamp: "2024-01-15T11:00:00Z",
      },
      {
        record_id: "valid_003",
        user_id: "user_003",
        feature_name: "買い物リスト",
        usage_count: 12,
        session_duration_minutes: 25,
        timestamp: "2024-01-15T11:30:00Z",
      },
      {
        record_id: "valid_004",
        user_id: "user_004",
        feature_name: "献立生成",
        usage_count: 20,
        session_duration_minutes: 50,
        timestamp: "2024-01-15T12:00:00Z",
      },
      {
        record_id: "valid_005",
        user_id: "user_005",
        feature_name: "栄養分析",
        usage_count: 5,
        session_duration_minutes: 15,
        timestamp: "2024-01-15T12:30:00Z",
      },
      {
        record_id: "valid_006",
        user_id: "user_006",
        feature_name: "買い物リスト",
        usage_count: 18,
        session_duration_minutes: 40,
        timestamp: "2024-01-15T13:00:00Z",
      },
      {
        record_id: "valid_007",
        user_id: "user_007",
        feature_name: "献立生成",
        usage_count: 10,
        session_duration_minutes: 35,
        timestamp: "2024-01-15T13:30:00Z",
      },
      {
        record_id: "valid_008",
        user_id: "user_008",
        feature_name: "栄養分析",
        usage_count: 7,
        session_duration_minutes: 20,
        timestamp: "2024-01-15T14:00:00Z",
      },
      {
        record_id: "valid_009",
        user_id: "user_009",
        feature_name: "買い物リスト",
        usage_count: 14,
        session_duration_minutes: 38,
        timestamp: "2024-01-15T14:30:00Z",
      },
      {
        record_id: "valid_010",
        user_id: "user_010",
        feature_name: "献立生成",
        usage_count: 9,
        session_duration_minutes: 28,
        timestamp: "2024-01-15T15:00:00Z",
      },
    ];

    const recordsWithMissingValues: ValidationRecord[] = [
      {
        record_id: "missing_001",
        user_id: "user_011",
        feature_name: "献立生成",
        usage_count: null as any, // 欠損値
        session_duration_minutes: 40,
        timestamp: "2024-01-15T15:30:00Z",
      },
      {
        record_id: "missing_002",
        user_id: "user_012",
        feature_name: undefined as any, // 欠損値
        usage_count: 6,
        session_duration_minutes: 18,
        timestamp: "2024-01-15T16:00:00Z",
      },
      {
        record_id: "missing_003",
        user_id: "user_013",
        feature_name: "栄養分析",
        usage_count: 11,
        session_duration_minutes: 22,
        timestamp: undefined as any, // 欠損値
      },
    ];

    const recordsWithAnomalousValues: ValidationRecord[] = [
      {
        record_id: "anomaly_001",
        user_id: "user_014",
        feature_name: "献立生成",
        usage_count: -5, // 異常値：負数
        session_duration_minutes: 45,
        timestamp: "2024-01-15T16:30:00Z",
      },
      {
        record_id: "anomaly_002",
        user_id: "user_015",
        feature_name: "買い物リスト",
        usage_count: 999999, // 異常値：超過
        session_duration_minutes: -10, // 異常値：負数
        timestamp: "2024-01-15T17:00:00Z",
      },
    ];

    const allRecords: ValidationRecord[] = [
      ...validRecords,
      ...recordsWithMissingValues,
      ...recordsWithAnomalousValues,
    ];

    // データ品質検証機能を初期化し、入力パラメータを構築
    const input: DataQualityValidationInput = {
      records: allRecords,
      validation_rules: {
        allow_null_fields: [],
        numeric_field_ranges: {
          usage_count: { min: 0, max: 100000 },
          session_duration_minutes: { min: 0, max: 10000 },
        },
        required_fields: ["record_id", "user_id", "feature_name", "usage_count", "session_duration_minutes", "timestamp"],
      },
    };

    // データ品質検証処理を実行
    const result: DataQualityValidationResult = validateDataQuality(input);

    // 分析対象レコードリストを取得
    const validatedRecords = result.valid_records;
    const excludedRecords = result.excluded_records;

    // 分析対象レコード数が10件であることをアサート
    expect(validatedRecords.length).toBe(10);

    // 除外レコード数が5件（欠損値3件＋異常値2件）であることをアサート
    expect(excludedRecords.length).toBe(5);

    // 除外されたレコードのリストと除外理由を確認
    const excludedRecordIds = excludedRecords.map((r) => r.record_id).sort();
    const expectedExcludedIds = ["missing_001", "missing_002", "missing_003", "anomaly_001", "anomaly_002"].sort();
    expect(excludedRecordIds).toEqual(expectedExcludedIds);

    // 除外されたレコードに欠損値またはデータ型不正が記録されていることを確認
    const missingValueRecords = excludedRecords.filter((r) => r.exclusion_reason === "欠損値");
    const anomalousValueRecords = excludedRecords.filter((r) => r.exclusion_reason === "異常値");

    expect(missingValueRecords.length).toBe(3);
    expect(anomalousValueRecords.length).toBe(2);

    // 各除外レコードの除外理由が適切に設定されていることを確認
    excludedRecords.forEach((record) => {
      expect(["欠損値", "異常値"]).toContain(record.exclusion_reason);
      expect(record.excluded_at).toBeDefined();
      expect(typeof record.excluded_at).toBe("string");
    });

    // 検証結果の統計情報をアサート
    expect(result.total_records_processed).toBe(15);
    expect(result.valid_records_count).toBe(10);
    expect(result.excluded_records_count).toBe(5);
    expect(result.validation_passed).toBe(true);
    expect(result.data_quality_score).toBe(66.67); // 10/15 * 100 ≈ 66.67
  });
});