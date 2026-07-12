import { encryptAndLogSensitiveData } from '../../src/logic/it-3';

describe('食事評価データを献立生成ロジックに反映させる機能', () => {
  // SCEN-553: [normal] 機密データの暗号化と監査ログ記録機能 - 複数システム間の機密データ転送時に暗号化と検証が行われる
  test('機密データが暗号化され、監査ログに詳細が記録されること', async () => {
    const encryptionKey = 'test-encryption-key-32-char-long';
    const sensitiveData = {
      userId: 'user-12345',
      familyMemberId: 'member-67890',
      allergyInfo: ['卵', 'えび'],
      dietaryRestriction: '塩分制限',
      mealEvaluation: {
        satisfactionScore: 4,
        completionRate: 95,
        userRequest: 'もっと和食が増えると嬉しい'
      },
      nutritionData: {
        calories: 2100,
        protein: 75,
        fat: 60,
        carbohydrates: 280
      }
    };

    const targetSystem = 'external-nutrition-partner-system';
    const transferTimestamp = new Date('2024-01-15T14:30:00Z');
    const senderId = 'admin-user-001';
    const recipientId = 'partner-system-001';

    const result = await encryptAndLogSensitiveData({
      encryptionKey,
      sensitiveData,
      targetSystem,
      transferTimestamp,
      senderId,
      recipientId
    });

    // 暗号化されたデータが存在すること
    expect(result.encryptedData).toBeDefined();
    expect(typeof result.encryptedData).toBe('string');
    expect(result.encryptedData.length).toBeGreaterThan(0);

    // 暗号化されたデータが元のデータと異なること
    expect(result.encryptedData).not.toEqual(JSON.stringify(sensitiveData));

    // 暗号化初期化ベクトル（IV）が生成されていること
    expect(result.encryptionIv).toBeDefined();
    expect(typeof result.encryptionIv).toBe('string');
    expect(result.encryptionIv.length).toBeGreaterThan(0);

    // データ整合性ハッシュ値が計算されていること
    expect(result.dataHashValue).toBeDefined();
    expect(typeof result.dataHashValue).toBe('string');
    expect(result.dataHashValue.length).toBeGreaterThan(0);

    // 監査ログエントリが記録されていること
    expect(result.auditLogEntry).toBeDefined();
    expect(result.auditLogEntry.timestamp).toEqual(transferTimestamp);
    expect(result.auditLogEntry.senderUserId).toBe(senderId);
    expect(result.auditLogEntry.recipientSystemId).toBe(recipientId);
    expect(result.auditLogEntry.targetSystem).toBe(targetSystem);
    expect(result.auditLogEntry.dataHashValue).toBe(result.dataHashValue);

    // 監査ログにデジタル署名が付与されていること
    expect(result.auditLogEntry.digitalSignature).toBeDefined();
    expect(typeof result.auditLogEntry.digitalSignature).toBe('string');
    expect(result.auditLogEntry.digitalSignature.length).toBeGreaterThan(0);

    // 復号化テスト：暗号化キーで復号化できること
    const decryptedData = result.decryptedDataForVerification;
    expect(decryptedData).toEqual(sensitiveData);

    // 復号化後のハッシュ値が一致すること
    expect(result.decryptedDataHashValue).toBe(result.dataHashValue);

    // 転送メタデータが正確に記録されていること
    expect(result.transferMetadata).toBeDefined();
    expect(result.transferMetadata.encryptionAlgorithm).toBe('AES-256-GCM');
    expect(result.transferMetadata.hashAlgorithm).toBe('SHA-256');
    expect(result.transferMetadata.transferId).toBeDefined();
    expect(typeof result.transferMetadata.transferId).toBe('string');

    // 複数回の転送でそれぞれ異なるtransferIdが生成されること
    const secondResult = await encryptAndLogSensitiveData({
      encryptionKey,
      sensitiveData,
      targetSystem,
      transferTimestamp: new Date('2024-01-15T14:35:00Z'),
      senderId,
      recipientId
    });

    expect(secondResult.transferMetadata.transferId).not.toBe(result.transferMetadata.transferId);
    expect(secondResult.auditLogEntry.timestamp).not.toEqual(result.auditLogEntry.timestamp);
    expect(secondResult.auditLogEntry.digitalSignature).not.toBe(result.auditLogEntry.digitalSignature);

    // 監査ログの改ざん検出テスト：署名検証が成功すること
    expect(result.auditLogEntry.signatureVerified).toBe(true);

    // 監査ログエントリが配列形式で蓄積されていること
    expect(result.allAuditLogEntries).toBeDefined();
    expect(Array.isArray(result.allAuditLogEntries)).toBe(true);
    expect(result.allAuditLogEntries.length).toBeGreaterThanOrEqual(2);

    // すべての監査ログエントリが異なるtransferIdを持つこと
    const transferIds = result.allAuditLogEntries.map((entry: any) => entry.transferId);
    const uniqueTransferIds = new Set(transferIds);
    expect(uniqueTransferIds.size).toBe(transferIds.length);
  });
});