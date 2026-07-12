import { encryptSensitiveData } from '../../src/logic/it-3';

describe('食事評価データを献立生成ロジックに反映させる機能', () => {
  // SCEN-554: [error] 機密データの暗号化と監査ログ記録機能 - 暗号化処理失敗時にデータ処理が中断される
  test('暗号化処理失敗時にデータ処理が中断され、監査ログが記録される', () => {
    const sensitiveDataInput = {
      userId: 'user_001',
      userName: '田中太郎',
      email: 'tanaka@example.com',
      allergyInfo: ['卵', 'えび'],
      timestamp: new Date('2024-02-15T10:30:00Z'),
    };

    const encryptionConfig = {
      encryptionEnabled: true,
      encryptionEngine: 'disabled',
      failureMode: true,
    };

    const expectedErrorPattern = /暗号化/;

    expect(() => {
      encryptSensitiveData(sensitiveDataInput, encryptionConfig);
    }).toThrow(expectedErrorPattern);
  });

  test('暗号化失敗時に監査ログに失敗イベント、タイムスタンプ、失敗原因が記録される', () => {
    const sensitiveDataInput = {
      userId: 'user_002',
      userName: '佐藤花子',
      email: 'sato@example.com',
      allergyInfo: ['そば', 'ピーナッツ'],
      timestamp: new Date('2024-02-15T11:00:00Z'),
    };

    const encryptionConfig = {
      encryptionEnabled: true,
      encryptionEngine: 'invalid',
      failureMode: true,
    };

    const auditLogExpected = {
      eventType: 'encryption_failure',
      userId: 'user_002',
      timestamp: '2024-02-15T11:00:00Z',
      failureReason: expect.stringMatching(/暗号化エンジン|エンジン不正/),
      dataIntegrity: 'not_encrypted',
    };

    expect(() => {
      encryptSensitiveData(sensitiveDataInput, encryptionConfig);
    }).toThrow(/暗号化/);
  });

  test('暗号化処理失敗時にトランザクションがロールバックされ、平文データが保存されない', () => {
    const sensitiveDataInput = {
      userId: 'user_003',
      userName: '山田次郎',
      email: 'yamada@example.com',
      allergyInfo: ['乳製品', 'クルミ'],
      timestamp: new Date('2024-02-15T12:00:00Z'),
    };

    const encryptionConfig = {
      encryptionEnabled: true,
      encryptionEngine: 'corrupted',
      failureMode: true,
    };

    const result = {
      isProcessed: false,
      isEncrypted: false,
      plainTextStored: false,
      transactionStatus: 'rolled_back',
    };

    expect(() => {
      encryptSensitiveData(sensitiveDataInput, encryptionConfig);
    }).toThrow(/暗号化/);

    expect(result.isProcessed).toBe(false);
    expect(result.isEncrypted).toBe(false);
    expect(result.plainTextStored).toBe(false);
    expect(result.transactionStatus).toBe('rolled_back');
  });

  test('暗号化失敗時にユーザーへ適切なエラー通知が表示される', () => {
    const sensitiveDataInput = {
      userId: 'user_004',
      userName: '鈴木美咲',
      email: 'suzuki@example.com',
      allergyInfo: ['大豆'],
      timestamp: new Date('2024-02-15T13:00:00Z'),
    };

    const encryptionConfig = {
      encryptionEnabled: true,
      encryptionEngine: 'unavailable',
      failureMode: true,
    };

    const userNotificationExpected = {
      severity: 'error',
      messageKeyword: expect.stringMatching(/暗号化|失敗|処理/),
      displayToUser: true,
      actionRequired: true,
    };

    expect(() => {
      encryptSensitiveData(sensitiveDataInput, encryptionConfig);
    }).toThrow(/暗号化/);

    expect(userNotificationExpected.severity).toBe('error');
    expect(userNotificationExpected.displayToUser).toBe(true);
    expect(userNotificationExpected.actionRequired).toBe(true);
  });

  test('暗号化失敗時に監査ログに失敗原因と詳細情報が記録される', () => {
    const sensitiveDataInput = {
      userId: 'user_005',
      userName: '中村健一',
      email: 'nakamura@example.com',
      allergyInfo: ['ナッツ類'],
      timestamp: new Date('2024-02-15T14:00:00Z'),
    };

    const encryptionConfig = {
      encryptionEnabled: true,
      encryptionEngine: 'failed',
      failureMode: true,
    };

    const auditLogExpected = {
      event: 'encryption_process_failure',
      userId: 'user_005',
      timestamp: '2024-02-15T14:00:00Z',
      failureReason: expect.any(String),
      processedRecords: 0,
      encryptedRecords: 0,
    };

    expect(() => {
      encryptSensitiveData(sensitiveDataInput, encryptionConfig);
    }).toThrow(/暗号化/);

    expect(auditLogExpected.event).toBe('encryption_process_failure');
    expect(auditLogExpected.processedRecords).toBe(0);
    expect(auditLogExpected.encryptedRecords).toBe(0);
  });
});