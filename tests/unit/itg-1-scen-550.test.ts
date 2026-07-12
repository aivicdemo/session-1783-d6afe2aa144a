import { encryptUserIdentifier, recordAuditLog, verifyAuditLogIntegrity } from '../../src/logic/it-1-br-4-2-1';

describe('食事制限条件の変更時に過去献立との抵触検出機能', () => {
  // SCEN-550: [normal] 機密データの暗号化と監査ログ記録機能
  test('ユーザー識別情報が暗号化され、監査ログに記録される', () => {
    // Arrange
    const userId = 'user-12345';
    const userEmail = 'testuser@example.com';
    const operationTimestamp = new Date('2024-01-15T11:00:00Z');
    const ipAddress = '192.168.1.100';
    const operationType = 'menu_generation_request';
    const encryptionKey = 'secure-key-2024';

    // Act: ユーザー識別情報を暗号化
    const encryptedUserId = encryptUserIdentifier({
      identifier: userId,
      encryptionKey: encryptionKey,
      identifierType: 'user_id'
    });

    const encryptedEmail = encryptUserIdentifier({
      identifier: userEmail,
      encryptionKey: encryptionKey,
      identifierType: 'email'
    });

    // Act: 監査ログを記録
    const auditLogEntry = recordAuditLog({
      encryptedUserId: encryptedUserId,
      encryptedEmail: encryptedEmail,
      operationType: operationType,
      timestamp: operationTimestamp.toISOString(),
      ipAddress: ipAddress,
      userId: userId
    });

    // Assert: 暗号化されたユーザー識別情報が異なる値
    expect(encryptedUserId).not.toBe(userId);
    expect(encryptedEmail).not.toBe(userEmail);
    expect(encryptedUserId.length).toBeGreaterThan(userId.length);
    expect(encryptedEmail.length).toBeGreaterThan(userEmail.length);

    // Assert: 監査ログが正しく記録されている
    expect(auditLogEntry.timestamp).toBe('2024-01-15T11:00:00Z');
    expect(auditLogEntry.userId).toBe('user-12345');
    expect(auditLogEntry.operationType).toBe('menu_generation_request');
    expect(auditLogEntry.ipAddress).toBe('192.168.1.100');
    expect(auditLogEntry.encryptedUserId).toBe(encryptedUserId);
    expect(auditLogEntry.encryptedEmail).toBe(encryptedEmail);

    // Act: 監査ログの整合性を検証
    const integrityResult = verifyAuditLogIntegrity({
      auditLog: auditLogEntry,
      encryptedUserId: encryptedUserId,
      encryptionKey: encryptionKey
    });

    // Assert: 監査ログと暗号化データの対応関係が正確
    expect(integrityResult.isValid).toBe(true);
    expect(integrityResult.encryptedUserIdMatches).toBe(true);
    expect(integrityResult.logContainsRequiredFields).toBe(true);

    // Assert: 監査ログに必要な全情報が含まれている
    expect(auditLogEntry.timestamp).toBeDefined();
    expect(auditLogEntry.userId).toBeDefined();
    expect(auditLogEntry.operationType).toBeDefined();
    expect(auditLogEntry.ipAddress).toBeDefined();
    expect(auditLogEntry.encryptedUserId).toBeDefined();
    expect(auditLogEntry.encryptedEmail).toBeDefined();

    // Assert: ユーザー識別情報が平文で保存されていない
    expect(auditLogEntry.encryptedUserId).not.toBe(userId);
    expect(auditLogEntry.encryptedEmail).not.toBe(userEmail);
  });
});