import { encryptConfidentialDataWithAuditLog } from "../../src/logic/it-1-br-2-1-1-1";

describe("機密データ暗号化・監査ログ管理機能", () => {
  // SCEN-569: [edge] 空の機密データセットが渡された場合の暗号化スキップと監査ログ記録
  test("空のデータセットを暗号化処理に渡した場合、暗号化がスキップされ監査ログが記録される", () => {
    // 境界値: null データセット
    const result_null = encryptConfidentialDataWithAuditLog({
      confidentialData: null,
      userId: "user-001",
      actionType: "nutrition_dashboard_access",
      timestamp: new Date("2024-01-15T10:30:00Z"),
    });

    expect(result_null.encryptionSkipped).toBe(true);
    expect(result_null.encryptedData).toBeNull();
    expect(result_null.auditLogEntries).toContainEqual(
      expect.objectContaining({
        eventType: "empty_dataset_processing",
        status: "skipped",
        userId: "user-001",
      })
    );
    expect(result_null.systemError).toBeNull();
    expect(result_null.processingStatus).toBe("skipped");

    // 境界値: undefined データセット
    const result_undefined = encryptConfidentialDataWithAuditLog({
      confidentialData: undefined,
      userId: "user-002",
      actionType: "nutrition_dashboard_access",
      timestamp: new Date("2024-01-15T10:35:00Z"),
    });

    expect(result_undefined.encryptionSkipped).toBe(true);
    expect(result_undefined.encryptedData).toBeUndefined();
    expect(result_undefined.auditLogEntries).toContainEqual(
      expect.objectContaining({
        eventType: "empty_dataset_processing",
        status: "skipped",
        userId: "user-002",
      })
    );
    expect(result_undefined.systemError).toBeNull();
    expect(result_undefined.processingStatus).toBe("skipped");

    // 境界値: 空配列
    const result_empty_array = encryptConfidentialDataWithAuditLog({
      confidentialData: [],
      userId: "user-003",
      actionType: "nutrition_dashboard_access",
      timestamp: new Date("2024-01-15T10:40:00Z"),
    });

    expect(result_empty_array.encryptionSkipped).toBe(true);
    expect(result_empty_array.encryptedData).toEqual([]);
    expect(result_empty_array.auditLogEntries).toContainEqual(
      expect.objectContaining({
        eventType: "empty_dataset_processing",
        status: "skipped",
        userId: "user-003",
      })
    );
    expect(result_empty_array.systemError).toBeNull();
    expect(result_empty_array.processingStatus).toBe("skipped");

    // 成功パス: 正常な機密データセット（暗号化が実行される）
    const valid_confidential_data = [
      {
        userId: "user-004",
        nutritionIntake: "カルシウム摂取量: 800mg",
        purchaseHistory: "2024-01-10 - 牛乳購入",
      },
    ];

    const result_valid = encryptConfidentialDataWithAuditLog({
      confidentialData: valid_confidential_data,
      userId: "user-004",
      actionType: "nutrition_dashboard_access",
      timestamp: new Date("2024-01-15T10:45:00Z"),
    });

    expect(result_valid.encryptionSkipped).toBe(false);
    expect(result_valid.encryptedData).toBeDefined();
    expect(result_valid.encryptedData).not.toEqual(valid_confidential_data);
    expect(result_valid.auditLogEntries.length).toBeGreaterThanOrEqual(2);
    expect(result_valid.auditLogEntries).toContainEqual(
      expect.objectContaining({
        eventType: "encryption_executed",
        status: "success",
        userId: "user-004",
      })
    );
    expect(result_valid.auditLogEntries).toContainEqual(
      expect.objectContaining({
        eventType: "audit_log_recorded",
        status: "success",
        userId: "user-004",
      })
    );
    expect(result_valid.systemError).toBeNull();
    expect(result_valid.processingStatus).toBe("success");

    // 監査ログの記録が適切に残されているか検証
    expect(result_null.auditLogEntries).toContainEqual(
      expect.objectContaining({
        actionType: "nutrition_dashboard_access",
        timestamp: expect.any(Date),
      })
    );

    // タイムスタンプの検証
    result_null.auditLogEntries.forEach((entry) => {
      expect(entry.timestamp).toEqual(new Date("2024-01-15T10:30:00Z"));
    });

    // 処理エラーが発生していないことを確認
    expect(result_null.systemError).toBeNull();
    expect(result_undefined.systemError).toBeNull();
    expect(result_empty_array.systemError).toBeNull();
    expect(result_valid.systemError).toBeNull();
  });
});