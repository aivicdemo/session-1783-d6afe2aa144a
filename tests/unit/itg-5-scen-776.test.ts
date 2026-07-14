import { classifyAndAggregateRejectionReasons } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-776: [normal] 機密データ暗号化・監査ログ記録機能 - 機密データのアクセス・変更・削除操作がすべて監査ログに記録される
  test('should classify rejection reasons and generate audit logs with encryption', () => {
    const rejectionReasons = [
      {
        id: 'rejection_001',
        userId: 'user_001',
        reason: 'タンパク質が足りない、もっと肉を入れてほしい',
        timestamp: new Date('2024-01-15T10:30:00Z'),
        operation: 'CREATE' as const,
      },
      {
        id: 'rejection_002',
        userId: 'user_002',
        reason: '調理時間が45分を超えているので短くしてください',
        timestamp: new Date('2024-01-15T11:00:00Z'),
        operation: 'UPDATE' as const,
      },
      {
        id: 'rejection_003',
        userId: 'user_001',
        reason: '子どもが卵アレルギーなのに卵が含まれています',
        timestamp: new Date('2024-01-15T11:30:00Z'),
        operation: 'CREATE' as const,
      },
      {
        id: 'rejection_004',
        userId: 'user_003',
        reason: '予算が5000円を超えているので削減してください',
        timestamp: new Date('2024-01-15T12:00:00Z'),
        operation: 'DELETE' as const,
      },
    ];

    const result = classifyAndAggregateRejectionReasons(rejectionReasons);

    // アクセス操作の監査ログ検証
    expect(result.auditLogs).toBeDefined();
    expect(result.auditLogs.length).toBe(4);

    // 監査ログの第1エントリ（CREATE操作）
    expect(result.auditLogs[0]).toEqual({
      logId: expect.any(String),
      userId: 'user_001',
      operationType: 'CREATE',
      targetRecordId: 'rejection_001',
      timestamp: new Date('2024-01-15T10:30:00Z'),
      previousValue: null,
      newValue: {
        reason: 'タンパク質が足りない、もっと肉を入れてほしい',
        category: 'nutrition',
      },
      isEncrypted: true,
      encryptionMethod: 'AES-256-GCM',
      signature: expect.any(String),
    });

    // 監査ログの第2エントリ（UPDATE操作）
    expect(result.auditLogs[1]).toEqual({
      logId: expect.any(String),
      userId: 'user_002',
      operationType: 'UPDATE',
      targetRecordId: 'rejection_002',
      timestamp: new Date('2024-01-15T11:00:00Z'),
      previousValue: null,
      newValue: {
        reason: '調理時間が45分を超えているので短くしてください',
        category: 'cooking_time',
      },
      isEncrypted: true,
      encryptionMethod: 'AES-256-GCM',
      signature: expect.any(String),
    });

    // 監査ログの第3エントリ（CREATE操作、食材制限関連）
    expect(result.auditLogs[2]).toEqual({
      logId: expect.any(String),
      userId: 'user_001',
      operationType: 'CREATE',
      targetRecordId: 'rejection_003',
      timestamp: new Date('2024-01-15T11:30:00Z'),
      previousValue: null,
      newValue: {
        reason: '子どもが卵アレルギーなのに卵が含まれています',
        category: 'food_restriction',
      },
      isEncrypted: true,
      encryptionMethod: 'AES-256-GCM',
      signature: expect.any(String),
    });

    // 監査ログの第4エントリ（DELETE操作）
    expect(result.auditLogs[3]).toEqual({
      logId: expect.any(String),
      userId: 'user_003',
      operationType: 'DELETE',
      targetRecordId: 'rejection_004',
      timestamp: new Date('2024-01-15T12:00:00Z'),
      previousValue: {
        reason: '予算が5000円を超えているので削減してください',
        category: 'budget',
      },
      newValue: null,
      isEncrypted: true,
      encryptionMethod: 'AES-256-GCM',
      signature: expect.any(String),
    });

    // カテゴリ分類結果の検証
    expect(result.classification).toBeDefined();
    expect(result.classification).toEqual({
      nutrition: {
        count: 1,
        percentage: 25,
        entries: [
          {
            id: 'rejection_001',
            reason: 'タンパク質が足りない、もっと肉を入れてほしい',
            userId: 'user_001',
          },
        ],
      },
      cooking_time: {
        count: 1,
        percentage: 25,
        entries: [
          {
            id: 'rejection_002',
            reason: '調理時間が45分を超えているので短くしてください',
            userId: 'user_002',
          },
        ],
      },
      food_restriction: {
        count: 1,
        percentage: 25,
        entries: [
          {
            id: 'rejection_003',
            reason: '子どもが卵アレルギーなのに卵が含まれています',
            userId: 'user_001',
          },
        ],
      },
      budget: {
        count: 1,
        percentage: 25,
        entries: [
          {
            id: 'rejection_004',
            reason: '予算が5000円を超えているので削減してください',
            userId: 'user_003',
          },
        ],
      },
    });

    // 失敗パターン集計結果の検証
    expect(result.failurePatterns).toBeDefined();
    expect(result.failurePatterns.totalCount).toBe(4);
    expect(result.failurePatterns.topCategory).toBe('nutrition');
    expect(result.failurePatterns.topCategoryCount).toBe(1);

    // 監査ログの完全性検証：すべてのログエントリがタイムスタンプ順に並んでいることを確認
    for (let i = 0; i < result.auditLogs.length - 1; i++) {
      expect(result.auditLogs[i].timestamp.getTime()).toBeLessThanOrEqual(
        result.auditLogs[i + 1].timestamp.getTime()
      );
    }

    // 監査ログの署名検証：各ログエントリに署名が存在することを確認
    result.auditLogs.forEach((log) => {
      expect(log.signature).toBeDefined();
      expect(log.signature.length).toBeGreaterThan(0);
    });

    // 暗号化状態の検証：すべてのログが暗号化されていることを確認
    result.auditLogs.forEach((log) => {
      expect(log.isEncrypted).toBe(true);
      expect(log.encryptionMethod).toBe('AES-256-GCM');
    });

    // DELETE操作の検証：削除前のデータが復旧可能な形式で記録されていることを確認
    const deleteLog = result.auditLogs[3];
    expect(deleteLog.previousValue).not.toBeNull();
    expect(deleteLog.previousValue.reason).toBe(
      '予算が5000円を超えているので削減してください'
    );
    expect(deleteLog.previousValue.category).toBe('budget');
    expect(deleteLog.newValue).toBeNull();

    // 異なるユーザーのアクセスが独立したログエントリとして記録されていることを確認
    const user001Logs = result.auditLogs.filter((log) => log.userId === 'user_001');
    const user002Logs = result.auditLogs.filter((log) => log.userId === 'user_002');
    const user003Logs = result.auditLogs.filter((log) => log.userId === 'user_003');

    expect(user001Logs.length).toBe(2);
    expect(user002Logs.length).toBe(1);
    expect(user003Logs.length).toBe(1);

    // 各ユーザーのログエントリがすべて異なるlogIdを持つことを確認
    const allLogIds = result.auditLogs.map((log) => log.logId);
    const uniqueLogIds = new Set(allLogIds);
    expect(uniqueLogIds.size).toBe(result.auditLogs.length);
  });
});