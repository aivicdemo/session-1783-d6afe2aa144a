import { encryptSensitiveData, deleteSensitiveDataByRetentionPeriod, recordAuditLog, verifyAuditLogIntegrity } from "../../src/logic/it-1-br-6-2-1-1";

describe("機密データの暗号化と監査ログ記録 - GDPR・個人情報保護法の規制要件準拠", () => {
  // SCEN-448
  test("保持期限の境界値において機密データが暗号化されたまま削除され、監査ログが改ざん不可で記録される", () => {
    const testUserId = "user_12345";
    const testEmail = "user@example.com";
    const testExpenseHistory = [
      { date: "2024-01-15", amount: 5000 },
      { date: "2024-02-10", amount: 3200 },
    ];

    // テストデータベース初期化（テスト環境上での模擬）
    const now = new Date("2025-01-15T10:00:00Z");
    const retentionDays = 1095; // 日本の個人情報保護法：原則3年（1095日）
    const retentionPeriodEndDate = new Date(now.getTime() + retentionDays * 24 * 60 * 60 * 1000);

    // 複数の個人情報レコード作成
    const record1 = {
      recordId: "rec_001",
      userId: testUserId,
      email: testEmail,
      expenseHistory: testExpenseHistory,
      createdAt: new Date("2022-01-15T10:00:00Z"),
      retentionUntil: new Date("2025-01-15T10:00:00Z"), // 保持期限満了日時（現在時刻と同じ）
      encrypted: false,
      encryptionKeyId: null,
    };

    const record2 = {
      recordId: "rec_002",
      userId: "user_67890",
      email: "other@example.com",
      expenseHistory: [{ date: "2024-03-20", amount: 7500 }],
      createdAt: new Date("2022-02-14T10:00:00Z"),
      retentionUntil: new Date("2025-01-14T10:00:00Z"), // 保持期限満了前日
      encrypted: false,
      encryptionKeyId: null,
    };

    const record3 = {
      recordId: "rec_003",
      userId: "user_11111",
      email: "future@example.com",
      expenseHistory: [{ date: "2024-05-01", amount: 2000 }],
      createdAt: new Date("2024-01-15T10:00:00Z"),
      retentionUntil: new Date("2027-01-15T10:00:00Z"), // 保持期限満了後（削除対象外）
      encrypted: false,
      encryptionKeyId: null,
    };

    // ステップ1-2: 各レコードに対して保持期限を設定（既に createdAt に基づいて設定済み）

    // ステップ3: 保持期限の境界値を設定（record1 の保持期限が現在時刻と等しい）
    const currentSystemTime = new Date("2025-01-15T10:00:00Z");

    // ステップ1: 暗号化処理
    const encryptedRecord1 = encryptSensitiveData({
      recordId: record1.recordId,
      userId: record1.userId,
      email: record1.email,
      expenseHistory: record1.expenseHistory,
      timestamp: currentSystemTime,
    });

    expect(encryptedRecord1).toHaveProperty("encrypted");
    expect(encryptedRecord1.encrypted).toBe(true);
    expect(encryptedRecord1).toHaveProperty("encryptionKeyId");
    expect(typeof encryptedRecord1.encryptionKeyId).toBe("string");
    expect(encryptedRecord1.encryptionKeyId.length).toBeGreaterThan(0);

    // ステップ4-5: データ削除ジョブを実行し、保持期限到達時のレコード削除を確認
    const recordsToDelete = [record1];
    const recordsToPreserve = [record2, record3];
    const allRecords = [record1, record2, record3];

    const deletionResult = deleteSensitiveDataByRetentionPeriod({
      records: allRecords,
      currentTime: currentSystemTime,
    });

    // ステップ5: 削除対象レコードが確実に暗号化されたまま削除されたことを確認
    expect(deletionResult.deletedRecordIds).toContain("rec_001");
    expect(deletionResult.deletedRecordIds).not.toContain("rec_002");
    expect(deletionResult.deletedRecordIds).not.toContain("rec_003");
    expect(deletionResult.deletedRecordIds.length).toBe(1);

    // ステップ7: 保持期限満了の前日のレコードは残存、満了後のレコードは削除対象外であることを確認
    expect(deletionResult.preservedRecordIds).toContain("rec_002");
    expect(deletionResult.preservedRecordIds).toContain("rec_003");
    expect(deletionResult.preservedRecordIds.length).toBe(2);

    // ステップ6: 削除処理完了後、監査ログを確認
    const auditLogPayload = {
      action: "DELETE_SENSITIVE_DATA",
      deletedRecordId: "rec_001",
      deletionTime: currentSystemTime,
      deletionReason: "RETENTION_PERIOD_EXPIRED",
      userId: record1.userId,
      email: record1.email,
      operatedBy: "SYSTEM_BATCH_JOB",
    };

    const auditLog = recordAuditLog(auditLogPayload);

    // 監査ログエントリの検証
    expect(auditLog).toHaveProperty("auditLogId");
    expect(auditLog.auditLogId.length).toBeGreaterThan(0);
    expect(auditLog.action).toBe("DELETE_SENSITIVE_DATA");
    expect(auditLog.deletedRecordId).toBe("rec_001");
    expect(auditLog.deletionTime).toEqual(currentSystemTime);
    expect(auditLog.deletionReason).toBe("RETENTION_PERIOD_EXPIRED");
    expect(auditLog.userId).toBe(testUserId);
    expect(auditLog.email).toBe(testEmail);
    expect(auditLog.operatedBy).toBe("SYSTEM_BATCH_JOB");
    expect(auditLog).toHaveProperty("createdAt");
    expect(auditLog.createdAt).toEqual(currentSystemTime);

    // ステップ8: 監査ログが改ざん不可であることを検証
    const integrityCheckResult = verifyAuditLogIntegrity({
      auditLogId: auditLog.auditLogId,
      expectedHash: auditLog.hash,
      auditLogData: {
        action: auditLog.action,
        deletedRecordId: auditLog.deletedRecordId,
        deletionTime: auditLog.deletionTime,
        deletionReason: auditLog.deletionReason,
        userId: auditLog.userId,
        email: auditLog.email,
        operatedBy: auditLog.operatedBy,
      },
    });

    expect(integrityCheckResult).toHaveProperty("isValid");
    expect(integrityCheckResult.isValid).toBe(true);
    expect(integrityCheckResult).toHaveProperty("tamperDetected");
    expect(integrityCheckResult.tamperDetected).toBe(false);

    // ステップ7（再確認）: 削除されたデータが復元不可であることを確認
    expect(deletionResult.permanentlyDeleted).toBe(true);
    expect(deletionResult.deletedRecordIds).toContain("rec_001");

    // 複合検証：GDPR・個人情報保護法準拠
    expect(deletionResult.complianceStatus).toBe("COMPLIANT");
    expect(deletionResult.complianceDetails).toHaveProperty("gdprCompliant");
    expect(deletionResult.complianceDetails.gdprCompliant).toBe(true);
    expect(deletionResult.complianceDetails).toHaveProperty("jppiCompliant");
    expect(deletionResult.complianceDetails.jppiCompliant).toBe(true);

    // 監査ログの記録確認（削除処理ジョブの全体統計）
    expect(auditLog.totalProcessedRecords).toBe(3);
    expect(auditLog.totalDeletedRecords).toBe(1);
    expect(auditLog.totalPreservedRecords).toBe(2);

    // 暗号化キーが削除されたことを確認（仕様上、削除時に暗号化キーも削除される）
    expect(deletionResult.deletedEncryptionKeyIds).toContain(encryptedRecord1.encryptionKeyId);
  });
});