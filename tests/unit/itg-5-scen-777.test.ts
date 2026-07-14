import { validateAndEncryptSensitiveData } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-777: [error] 機密データ暗号化・監査ログ記録機能 - 暗号化されていない機密データが検出された場合にエラーを発生させ処理を中止する
  test('暗号化されていない機密データが検出された場合にエラーを発生させる', () => {
    const unencryptedDataset = {
      user_id: 'user_12345',
      api_key: 'sk-1234567890abcdef',
      password: 'plaintext_password_secret',
      nutrition_data: {
        calories: 2500,
        protein: 75,
      },
      family_members: [
        {
          member_id: 'member_001',
          name: 'Alice',
          allergies: ['peanut', 'shellfish'],
        },
      ],
      encrypted: false,
      timestamp: '2024-01-15T11:00:00Z',
    };

    const auditLogStore: any[] = [];

    const mockAuditLog = (event: {
      event_type: string;
      error_code: string;
      error_message: string;
      detected_timestamp: string;
      user_id: string;
      details: string;
    }) => {
      auditLogStore.push(event);
    };

    expect(() =>
      validateAndEncryptSensitiveData(unencryptedDataset, mockAuditLog)
    ).toThrow(/UnencryptedDataDetected/);

    expect(auditLogStore.length).toBe(1);

    const auditRecord = auditLogStore[0];
    expect(auditRecord.event_type).toBe('SECURITY_ERROR');
    expect(auditRecord.error_code).toBe('UnencryptedDataDetected');
    expect(auditRecord.error_message).toMatch(/機密データ/);
    expect(auditRecord.detected_timestamp).toBe('2024-01-15T11:00:00Z');
    expect(auditRecord.user_id).toBe('user_12345');
    expect(auditRecord.details).toMatch(/api_key|password/);
  });
});