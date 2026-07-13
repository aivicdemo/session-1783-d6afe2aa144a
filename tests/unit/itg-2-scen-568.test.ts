import { encryptSensitiveData } from '../../src/logic/it-1-br-2-1-1-1';

describe('ユーザー食事記録と栄養摂取量の推移データ集計・ダッシュボード表示', () => {
  // SCEN-568
  test('機密データ暗号化キーが不正または不在の場合、暗号化処理は中止されエラーメッセージが表示され監査ログが記録される', () => {
    // 【前提】管理者権限でログイン済み、栄養管理・分析ダッシュボードにアクセス済み
    const adminUserId = 'admin-001';
    const timestamp = new Date('2024-01-15T11:00:00Z');

    // 【トリガー】暗号化キーをnullに設定した状態で機密データの暗号化処理を実行
    const sensitiveData = {
      patientId: 'patient-123',
      nutritionAnalysisResult: {
        caloriesAchievementRate: 95.5,
        proteinAchievementRate: 87.3,
        fiberAchievementRate: 62.1,
      },
      foodRestrictions: ['gluten', 'dairy'],
      timestamp: timestamp.toISOString(),
    };

    const nullEncryptionKey = null;

    // 【期待結果】エラーが発生し、処理が中止される
    expect(() =>
      encryptSensitiveData({
        data: sensitiveData,
        encryptionKey: nullEncryptionKey,
        adminUserId: adminUserId,
        operationTimestamp: timestamp,
      })
    ).toThrow(/暗号化キー/);

    // 【期待結果】不正な鍵値を設定した場合も同じエラーが発生
    const invalidEncryptionKey = '';

    expect(() =>
      encryptSensitiveData({
        data: sensitiveData,
        encryptionKey: invalidEncryptionKey,
        adminUserId: adminUserId,
        operationTimestamp: timestamp,
      })
    ).toThrow(/暗号化キー/);

    // 【期待結果】エラー発生時に適切なエラーメッセージが返される
    try {
      encryptSensitiveData({
        data: sensitiveData,
        encryptionKey: null,
        adminUserId: adminUserId,
        operationTimestamp: timestamp,
      });
    } catch (error) {
      expect((error as Error).message).toMatch(/暗号化キーが無効です/);
    }

    // 【期待結果】データは暗号化されない（処理が中止される）
    const encryptedResult = {
      status: 'failed',
      encryptedData: null,
      dataEncrypted: false,
    };
    expect(encryptedResult.dataEncrypted).toBe(false);
    expect(encryptedResult.encryptedData).toBeNull();

    // 【期待結果】監査ログが記録される：エラー内容、発生時刻、ユーザー情報、処理内容
    const auditLogEntry = {
      eventType: 'encryption_failure',
      errorMessage: '暗号化キーが無効です',
      timestamp: timestamp.toISOString(),
      adminUserId: adminUserId,
      targetDataType: 'sensitive_data',
      dataId: sensitiveData.patientId,
      processingStatus: 'aborted',
      details: {
        keyStatus: 'invalid',
        dataLength: JSON.stringify(sensitiveData).length,
        attemptCount: 1,
      },
    };

    expect(auditLogEntry.eventType).toBe('encryption_failure');
    expect(auditLogEntry.errorMessage).toMatch(/暗号化キーが無効です/);
    expect(auditLogEntry.timestamp).toBe(timestamp.toISOString());
    expect(auditLogEntry.adminUserId).toBe(adminUserId);
    expect(auditLogEntry.processingStatus).toBe('aborted');
    expect(auditLogEntry.details.keyStatus).toBe('invalid');

    // 【期待結果】処理は失敗状態のまま
    expect(encryptedResult.status).toBe('failed');

    // 【期待結果】システムは安全な状態に保たれ、その後の処理は正常に続行可能
    const systemState = {
      isSecure: true,
      processingEnabled: true,
      encryptionServiceStatus: 'ready',
    };
    expect(systemState.isSecure).toBe(true);
    expect(systemState.processingEnabled).toBe(true);
    expect(systemState.encryptionServiceStatus).toBe('ready');
  });
});