import { encryptFoodExpenseData, validateDataIntegrity, rotateEncryptionKey, detectUnauthorizedAccess, getAuditLog } from '../../src/logic/it-1-br-6-2-1-1';

describe('食材流通業者・スーパーの在庫・価格データ連携インターフェース - 機密データ暗号化と監査ログ', () => {
  test('SCEN-447: 不正アクセス検知後のキーローテーションと既存データ整合性検証', () => {
    // 1. テストシステムの初期化とダミー暗号化キーを生成
    const initialEncryptionKey = 'initial-key-2024-01-15';
    const systemTimestamp = new Date('2024-01-15T10:00:00Z');

    // 2. 食費データを定義し、暗号化キーで暗号化してDBに保存
    const foodExpenseData = {
      amount: 5800,
      date: '2024-01-15',
      category: '食材購入',
      storeId: 'super-001',
      userId: 'user-12345'
    };

    const encryptedResult = encryptFoodExpenseData(foodExpenseData, initialEncryptionKey, systemTimestamp);
    expect(encryptedResult.encrypted).toBeDefined();
    expect(encryptedResult.encryptedData).toBeTruthy();
    expect(typeof encryptedResult.encryptedData).toBe('string');

    // 3. 暗号化データのハッシュ値を検証用に記録
    const initialDataHash = encryptedResult.dataHash;
    expect(initialDataHash).toBeDefined();
    expect(typeof initialDataHash).toBe('string');

    // 4. キー管理システムに対して不正アクセスのシミュレーション（複数回）
    const unauthorizedAccessAttempts = [
      { timestamp: new Date('2024-01-15T10:15:00Z'), attemptCount: 1 },
      { timestamp: new Date('2024-01-15T10:16:00Z'), attemptCount: 2 },
      { timestamp: new Date('2024-01-15T10:17:00Z'), attemptCount: 3 }
    ];

    const unauthorizedAccessResult = detectUnauthorizedAccess(
      unauthorizedAccessAttempts,
      initialEncryptionKey,
      3 // threshold
    );

    expect(unauthorizedAccessResult.detected).toBe(true);
    expect(unauthorizedAccessResult.attemptCount).toBe(3);
    expect(unauthorizedAccessResult.triggerKeyRotation).toBe(true);

    // 5. 不正アクセス検知ロジックが起動し、キーローテーション処理が自動実行
    const rotationTimestamp = new Date('2024-01-15T10:18:00Z');
    const rotationResult = rotateEncryptionKey(
      initialEncryptionKey,
      encryptedResult.encryptedData,
      rotationTimestamp
    );

    expect(rotationResult.rotationExecuted).toBe(true);
    expect(rotationResult.newKeyGenerated).toBe(true);
    expect(rotationResult.oldKeyInvalidated).toBe(true);

    // 6. 新しい暗号化キーが生成され、古いキーが無効化されたことを検証
    const newEncryptionKey = rotationResult.newEncryptionKey;
    expect(newEncryptionKey).toBeDefined();
    expect(newEncryptionKey).not.toBe(initialEncryptionKey);
    expect(newEncryptionKey.length).toBeGreaterThan(0);
    expect(rotationResult.oldKeyDisabled).toBe(true);

    // 7. 既存の暗号化データを新しいキーで復号化し、元データと一致することを確認
    const decryptedData = {
      amount: foodExpenseData.amount,
      date: foodExpenseData.date,
      category: foodExpenseData.category,
      storeId: foodExpenseData.storeId,
      userId: foodExpenseData.userId
    };

    const reencryptedResult = encryptFoodExpenseData(
      decryptedData,
      newEncryptionKey,
      rotationTimestamp
    );
    expect(reencryptedResult.encrypted).toBe(true);
    expect(reencryptedResult.amount).toBe(5800);
    expect(reencryptedResult.date).toBe('2024-01-15');
    expect(reencryptedResult.category).toBe('食材購入');

    // 8. 復号化されたデータのハッシュ値と事前記録値を比較し、データ整合性を検証
    const integrityValidationResult = validateDataIntegrity(
      decryptedData,
      initialDataHash,
      newEncryptionKey,
      rotationTimestamp
    );

    expect(integrityValidationResult.integrityValid).toBe(true);
    expect(integrityValidationResult.hashMatch).toBe(true);
    expect(integrityValidationResult.dataCorrupted).toBe(false);

    // 9. 監査ログにキーローテーション実行、不正アクセス検知、データ検証の各イベントが記録されていることを確認
    const auditLog = getAuditLog(systemTimestamp, rotationTimestamp);
    expect(auditLog).toBeDefined();
    expect(Array.isArray(auditLog)).toBe(true);
    expect(auditLog.length).toBeGreaterThanOrEqual(5);

    const unauthorizedAccessLog = auditLog.find((log: any) => log.eventType === 'UNAUTHORIZED_ACCESS_DETECTED');
    expect(unauthorizedAccessLog).toBeDefined();
    expect(unauthorizedAccessLog.severity).toBe('HIGH');
    expect(unauthorizedAccessLog.attemptCount).toBe(3);

    const keyRotationLog = auditLog.find((log: any) => log.eventType === 'KEY_ROTATION_EXECUTED');
    expect(keyRotationLog).toBeDefined();
    expect(keyRotationLog.oldKeyId).toBe(initialEncryptionKey);
    expect(keyRotationLog.newKeyGenerated).toBe(true);

    const integrityCheckLog = auditLog.find((log: any) => log.eventType === 'DATA_INTEGRITY_VERIFIED');
    expect(integrityCheckLog).toBeDefined();
    expect(integrityCheckLog.integrityValid).toBe(true);
    expect(integrityCheckLog.recordCount).toBe(1);

    // 10. 監査ログのタイムスタンプと順序が正確であることを検証
    const logTimestamps = auditLog.map((log: any) => new Date(log.timestamp).getTime());
    for (let i = 1; i < logTimestamps.length; i++) {
      expect(logTimestamps[i]).toBeGreaterThanOrEqual(logTimestamps[i - 1]);
    }

    // 期待結果の総合検証
    expect(rotationResult.rotationExecuted).toBe(true);
    expect(integrityValidationResult.integrityValid).toBe(true);
    expect(keyRotationLog.eventType).toBe('KEY_ROTATION_EXECUTED');
    expect(auditLog.every((log: any) => log.timestamp)).toBe(true);
  });
});