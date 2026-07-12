import { recordAuditLog, verifyAuditLogIntegrity, getAuditLogHistory } from "../../src/logic/it-3";

describe("食事評価データを献立生成ロジックに反映させる機能", () => {
  // SCEN-555: [normal] 機密データの暗号化と監査ログ記録機能
  test("監査ログへのアクセス・変更・削除試行がすべて記録される", async () => {
    // テストアプリケーション起動時の初期状態
    const adminUserId = "admin-001";
    const regularUserId = "user-001";
    const auditLogTableId = "audit_log_main";

    const timestampRead = new Date("2024-01-15T10:00:00Z").toISOString();
    const timestampModifyAttempt = new Date("2024-01-15T10:15:00Z").toISOString();
    const timestampDeleteAttempt = new Date("2024-01-15T10:30:00Z").toISOString();

    // 監査ログが有効であることを確認
    const auditLogStatus = await recordAuditLog({
      userId: adminUserId,
      operationType: "READ",
      targetTable: auditLogTableId,
      timestamp: timestampRead,
      operationStatus: "SUCCESS",
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0",
    });
    expect(auditLogStatus.isAuditEnabled).toBe(true);
    expect(auditLogStatus.logId).toBeDefined();

    // 監査ログ読取りアクセス試行がログに記録されることを確認
    const readAccessLog = await recordAuditLog({
      userId: adminUserId,
      operationType: "READ",
      targetTable: auditLogTableId,
      timestamp: timestampRead,
      operationStatus: "SUCCESS",
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0",
    });
    expect(readAccessLog.operationType).toBe("READ");
    expect(readAccessLog.timestamp).toBe(timestampRead);
    expect(readAccessLog.operationStatus).toBe("SUCCESS");
    expect(readAccessLog.userId).toBe(adminUserId);

    // 監査ログの変更試行がログに記録されることを確認
    const modifyAttemptLog = await recordAuditLog({
      userId: adminUserId,
      operationType: "UPDATE",
      targetTable: auditLogTableId,
      timestamp: timestampModifyAttempt,
      operationStatus: "DENIED",
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0",
      reason: "Permission denied for audit log modification",
    });
    expect(modifyAttemptLog.operationType).toBe("UPDATE");
    expect(modifyAttemptLog.timestamp).toBe(timestampModifyAttempt);
    expect(modifyAttemptLog.operationStatus).toBe("DENIED");
    expect(modifyAttemptLog.reason).toBe("Permission denied for audit log modification");

    // 監査ログの削除試行がログに記録されることを確認
    const deleteAttemptLog = await recordAuditLog({
      userId: adminUserId,
      operationType: "DELETE",
      targetTable: auditLogTableId,
      timestamp: timestampDeleteAttempt,
      operationStatus: "DENIED",
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0",
      reason: "Permission denied for audit log deletion",
    });
    expect(deleteAttemptLog.operationType).toBe("DELETE");
    expect(deleteAttemptLog.timestamp).toBe(timestampDeleteAttempt);
    expect(deleteAttemptLog.operationStatus).toBe("DENIED");

    // 記録されたすべてのアクセス・変更・削除試行のログエントリを検証
    const auditHistory = await getAuditLogHistory({
      targetTable: auditLogTableId,
      startDate: new Date("2024-01-15T09:00:00Z"),
      endDate: new Date("2024-01-15T11:00:00Z"),
    });

    expect(auditHistory.logs.length).toBeGreaterThanOrEqual(3);

    // 各ログエントリにタイムスタンプ、実行ユーザー、操作内容、結果ステータスが含まれていることを確認
    auditHistory.logs.forEach((log) => {
      expect(log.timestamp).toBeDefined();
      expect(log.userId).toBeDefined();
      expect(log.operationType).toBeDefined();
      expect(log.operationStatus).toBeDefined();
      expect(typeof log.timestamp).toBe("string");
      expect(typeof log.userId).toBe("string");
      expect(typeof log.operationType).toBe("string");
      expect(typeof log.operationStatus).toBe("string");
    });

    // ログの改ざん検出機能が機能していることを確認
    const integrityCheck = await verifyAuditLogIntegrity({
      logIds: [readAccessLog.logId, modifyAttemptLog.logId, deleteAttemptLog.logId],
    });
    expect(integrityCheck.isIntact).toBe(true);
    expect(integrityCheck.tamperedLogCount).toBe(0);
    expect(integrityCheck.verificationTimestamp).toBeDefined();

    // 管理者以外のユーザーアカウントで同様のアクセス・変更・削除試行を実行
    const regularUserReadLog = await recordAuditLog({
      userId: regularUserId,
      operationType: "READ",
      targetTable: auditLogTableId,
      timestamp: new Date("2024-01-15T10:45:00Z").toISOString(),
      operationStatus: "DENIED",
      ipAddress: "192.168.1.101",
      userAgent: "Mozilla/5.0",
      reason: "Non-admin user cannot access audit logs",
    });
    expect(regularUserReadLog.userId).toBe(regularUserId);
    expect(regularUserReadLog.operationStatus).toBe("DENIED");
    expect(regularUserReadLog.reason).toBe("Non-admin user cannot access audit logs");

    // 一般ユーザーの修正試行も記録されることを確認
    const regularUserModifyLog = await recordAuditLog({
      userId: regularUserId,
      operationType: "UPDATE",
      targetTable: auditLogTableId,
      timestamp: new Date("2024-01-15T11:00:00Z").toISOString(),
      operationStatus: "DENIED",
      ipAddress: "192.168.1.101",
      userAgent: "Mozilla/5.0",
      reason: "Non-admin user cannot modify audit logs",
    });
    expect(regularUserModifyLog.operationStatus).toBe("DENIED");

    // 最終的なログ履歴検証 - すべての操作が記録されていることを確認
    const finalAuditHistory = await getAuditLogHistory({
      targetTable: auditLogTableId,
      startDate: new Date("2024-01-15T09:00:00Z"),
      endDate: new Date("2024-01-15T11:30:00Z"),
    });

    const adminLogs = finalAuditHistory.logs.filter((log) => log.userId === adminUserId);
    const regularUserLogs = finalAuditHistory.logs.filter((log) => log.userId === regularUserId);

    expect(adminLogs.length).toBeGreaterThanOrEqual(3);
    expect(regularUserLogs.length).toBeGreaterThanOrEqual(2);

    // すべてのログが完全性を備えていることを確認
    const allLogIds = finalAuditHistory.logs.map((log) => log.logId);
    const integrityCheckFinal = await verifyAuditLogIntegrity({
      logIds: allLogIds,
    });
    expect(integrityCheckFinal.isIntact).toBe(true);
    expect(integrityCheckFinal.tamperedLogCount).toBe(0);

    // ログの順序が時系列順であることを確認
    for (let i = 1; i < finalAuditHistory.logs.length; i++) {
      const prevTimestamp = new Date(finalAuditHistory.logs[i - 1].timestamp).getTime();
      const currTimestamp = new Date(finalAuditHistory.logs[i].timestamp).getTime();
      expect(currTimestamp).toBeGreaterThanOrEqual(prevTimestamp);
    }
  });
});