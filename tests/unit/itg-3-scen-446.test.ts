import { recordAuditLog, validateAuditLogIntegrity, getAuditLogsByUserId } from '../../src/logic/it-1-br-6-2-1-1';

describe('食材流通業者・スーパーの在庫・価格データ連携インターフェース - 機密データの暗号化と監査ログ記録', () => {
  // SCEN-446
  test('機密データのアクセス・変更・削除操作が監査ログに記録され、操作者・操作内容・タイムスタンプが全て追跡可能である', () => {
    const operatorUserId = 'user_12345';
    const operatorName = 'Taro Yamada';
    const sensitiveDataId = 'secret_data_001';
    const operationTimestamp = new Date('2024-02-15T10:30:00Z');
    const accessTimestamp = new Date('2024-02-15T10:30:05Z');
    const editTimestamp = new Date('2024-02-15T10:35:12Z');
    const deleteTimestamp = new Date('2024-02-15T10:40:30Z');

    // アクセス操作のログ記録
    const accessLog = recordAuditLog({
      operatorId: operatorUserId,
      operatorName: operatorName,
      action: 'ACCESS',
      targetDataId: sensitiveDataId,
      targetDataType: 'CONFIDENTIAL_DATA',
      timestamp: accessTimestamp,
      ipAddress: '192.168.1.100',
      sessionId: 'session_abc123',
      beforeValue: null,
      afterValue: null,
      status: 'SUCCESS',
    });

    expect(accessLog).toEqual(expect.objectContaining({
      operatorId: operatorUserId,
      operatorName: operatorName,
      action: 'ACCESS',
      targetDataId: sensitiveDataId,
      targetDataType: 'CONFIDENTIAL_DATA',
      timestamp: accessTimestamp,
      status: 'SUCCESS',
      logId: expect.any(String),
      encryptedFlag: true,
      immutableFlag: true,
    }));

    // 編集操作のログ記録
    const beforeValueEdit = 'account_****5678';
    const afterValueEdit = 'account_****9012';
    const editLog = recordAuditLog({
      operatorId: operatorUserId,
      operatorName: operatorName,
      action: 'EDIT',
      targetDataId: sensitiveDataId,
      targetDataType: 'CONFIDENTIAL_DATA',
      timestamp: editTimestamp,
      ipAddress: '192.168.1.100',
      sessionId: 'session_abc123',
      beforeValue: beforeValueEdit,
      afterValue: afterValueEdit,
      status: 'SUCCESS',
    });

    expect(editLog).toEqual(expect.objectContaining({
      operatorId: operatorUserId,
      operatorName: operatorName,
      action: 'EDIT',
      targetDataId: sensitiveDataId,
      beforeValue: beforeValueEdit,
      afterValue: afterValueEdit,
      timestamp: editTimestamp,
      status: 'SUCCESS',
      encryptedFlag: true,
      immutableFlag: true,
    }));

    // 削除操作のログ記録
    const deleteLog = recordAuditLog({
      operatorId: operatorUserId,
      operatorName: operatorName,
      action: 'DELETE',
      targetDataId: sensitiveDataId,
      targetDataType: 'CONFIDENTIAL_DATA',
      timestamp: deleteTimestamp,
      ipAddress: '192.168.1.100',
      sessionId: 'session_abc123',
      beforeValue: afterValueEdit,
      afterValue: null,
      status: 'SUCCESS',
    });

    expect(deleteLog).toEqual(expect.objectContaining({
      operatorId: operatorUserId,
      operatorName: operatorName,
      action: 'DELETE',
      targetDataId: sensitiveDataId,
      beforeValue: afterValueEdit,
      afterValue: null,
      timestamp: deleteTimestamp,
      status: 'SUCCESS',
      encryptedFlag: true,
      immutableFlag: true,
    }));

    // 複数ユーザーでの操作 - 別のオペレータ
    const secondOperatorUserId = 'user_67890';
    const secondOperatorName = 'Hanako Sato';
    const secondAccessTimestamp = new Date('2024-02-15T11:15:45Z');

    const secondUserAccessLog = recordAuditLog({
      operatorId: secondOperatorUserId,
      operatorName: secondOperatorName,
      action: 'ACCESS',
      targetDataId: sensitiveDataId,
      targetDataType: 'CONFIDENTIAL_DATA',
      timestamp: secondAccessTimestamp,
      ipAddress: '192.168.1.101',
      sessionId: 'session_def456',
      beforeValue: null,
      afterValue: null,
      status: 'SUCCESS',
    });

    expect(secondUserAccessLog).toEqual(expect.objectContaining({
      operatorId: secondOperatorUserId,
      operatorName: secondOperatorName,
      action: 'ACCESS',
      timestamp: secondAccessTimestamp,
      encryptedFlag: true,
      immutableFlag: true,
    }));

    // ユーザーIDでログを取得
    const auditLogsForUser = getAuditLogsByUserId(operatorUserId);
    expect(auditLogsForUser).toBeInstanceOf(Array);
    expect(auditLogsForUser.length).toBeGreaterThanOrEqual(3);

    const userAccessLog = auditLogsForUser.find(log => log.action === 'ACCESS');
    const userEditLog = auditLogsForUser.find(log => log.action === 'EDIT');
    const userDeleteLog = auditLogsForUser.find(log => log.action === 'DELETE');

    expect(userAccessLog).toBeDefined();
    expect(userEditLog).toBeDefined();
    expect(userDeleteLog).toBeDefined();

    // タイムスタンプの検証
    expect(userAccessLog.timestamp).toEqual(accessTimestamp);
    expect(userEditLog.timestamp).toEqual(editTimestamp);
    expect(userDeleteLog.timestamp).toEqual(deleteTimestamp);

    // 操作者情報の検証
    expect(userAccessLog.operatorId).toBe(operatorUserId);
    expect(userAccessLog.operatorName).toBe(operatorName);
    expect(userEditLog.operatorId).toBe(operatorUserId);
    expect(userDeleteLog.operatorId).toBe(operatorUserId);

    // 監査ログの整合性検証
    const integrityCheckResult = validateAuditLogIntegrity({
      logId: accessLog.logId,
    });

    expect(integrityCheckResult).toEqual(expect.objectContaining({
      isValid: true,
      hasbeenTampered: false,
      checksumVerified: true,
      encryptionVerified: true,
      immutableVerified: true,
      validationTimestamp: expect.any(Date),
    }));

    // 編集ログの完全性も検証
    const editLogIntegrityCheck = validateAuditLogIntegrity({
      logId: editLog.logId,
    });

    expect(editLogIntegrityCheck.isValid).toBe(true);
    expect(editLogIntegrityCheck.hasbeenTampered).toBe(false);

    // 削除ログの完全性も検証
    const deleteLogIntegrityCheck = validateAuditLogIntegrity({
      logId: deleteLog.logId,
    });

    expect(deleteLogIntegrityCheck.isValid).toBe(true);

    // 法務・セキュリティコンプライアンス要件の検証
    expect(accessLog.encryptedFlag).toBe(true);
    expect(editLog.encryptedFlag).toBe(true);
    expect(deleteLog.encryptedFlag).toBe(true);

    expect(accessLog.immutableFlag).toBe(true);
    expect(editLog.immutableFlag).toBe(true);
    expect(deleteLog.immutableFlag).toBe(true);

    // IPアドレスとセッション情報が記録されていることを確認
    expect(accessLog.ipAddress).toBe('192.168.1.100');
    expect(accessLog.sessionId).toBe('session_abc123');
    expect(editLog.ipAddress).toBe('192.168.1.100');
    expect(deleteLog.ipAddress).toBe('192.168.1.100');

    // 監査ログの操作内容が正確に記録されている
    expect(accessLog.action).toBe('ACCESS');
    expect(editLog.action).toBe('EDIT');
    expect(deleteLog.action).toBe('DELETE');

    // 変更前後の値が編集ログに記録されている
    expect(editLog.beforeValue).toBe(beforeValueEdit);
    expect(editLog.afterValue).toBe(afterValueEdit);

    // 削除操作では変更前の値が記録され、変更後は null
    expect(deleteLog.beforeValue).toBe(afterValueEdit);
    expect(deleteLog.afterValue).toBeNull();

    // 全操作が成功ステータスである
    expect(accessLog.status).toBe('SUCCESS');
    expect(editLog.status).toBe('SUCCESS');
    expect(deleteLog.status).toBe('SUCCESS');
  });
});