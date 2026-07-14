import { classifyMenuRejectionReason } from '../../src/logic/it-7-3-1';

describe('失敗パターン自動カテゴリ分類機能', () => {
  // SCEN-770
  test('却下・修正理由が null または空文字列の場合、分類がスキップされエラーが記録される', () => {
    // ========== 初期化 ==========
    const testData = [
      {
        reasonId: 'reason_001',
        text: '栄養バランスが悪い',
        timestamp: '2024-01-15T10:00:00Z',
      },
      {
        reasonId: 'reason_002',
        text: null,
        timestamp: '2024-01-15T10:05:00Z',
      },
      {
        reasonId: 'reason_003',
        text: '',
        timestamp: '2024-01-15T10:10:00Z',
      },
      {
        reasonId: 'reason_004',
        text: '調理時間が長すぎる',
        timestamp: '2024-01-15T10:15:00Z',
      },
    ];

    // ========== 分類処理を実行 ==========
    const result = classifyMenuRejectionReason({
      reasons: testData,
      categories: [
        'nutrition',
        'budget',
        'preference',
        'cookingTime',
        'ingredients',
      ],
    });

    // ========== null の場合の検証 ==========
    const nullErrorRecord = result.errorLogs.find(
      (log) => log.reasonId === 'reason_002'
    );
    expect(nullErrorRecord).toBeDefined();
    expect(nullErrorRecord?.reasonId).toBe('reason_002');
    expect(nullErrorRecord?.errorCode).toBe('EMPTY_REASON_TEXT');
    expect(nullErrorRecord?.errorMessage).toMatch(/理由テキスト/);
    expect(nullErrorRecord?.timestamp).toBe('2024-01-15T10:05:00Z');
    expect(nullErrorRecord?.skipped).toBe(true);

    // ========== 空文字列の場合の検証 ==========
    const emptyErrorRecord = result.errorLogs.find(
      (log) => log.reasonId === 'reason_003'
    );
    expect(emptyErrorRecord).toBeDefined();
    expect(emptyErrorRecord?.reasonId).toBe('reason_003');
    expect(emptyErrorRecord?.errorCode).toBe('EMPTY_REASON_TEXT');
    expect(emptyErrorRecord?.errorMessage).toMatch(/理由テキスト/);
    expect(emptyErrorRecord?.timestamp).toBe('2024-01-15T10:10:00Z');
    expect(emptyErrorRecord?.skipped).toBe(true);

    // ========== スキップ件数の検証 ==========
    expect(result.skippedCount).toBe(2);

    // ========== 正常データの分類が処理されたことを確認 ==========
    const successfulClassifications = result.classifications.filter(
      (c) => c.reasonId === 'reason_001' || c.reasonId === 'reason_004'
    );
    expect(successfulClassifications.length).toBe(2);
    expect(successfulClassifications[0].reasonId).toBe('reason_001');
    expect(successfulClassifications[0].category).toBe('nutrition');
    expect(successfulClassifications[0].confidence).toBeGreaterThan(0.5);
    expect(successfulClassifications[1].reasonId).toBe('reason_004');
    expect(successfulClassifications[1].category).toBe('cookingTime');
    expect(successfulClassifications[1].confidence).toBeGreaterThan(0.5);

    // ========== エラーレコード内の必須フィールド確認 ==========
    expect(result.errorLogs.length).toBe(2);
    result.errorLogs.forEach((log) => {
      expect(log.reasonId).toBeDefined();
      expect(log.errorCode).toBeDefined();
      expect(log.errorMessage).toBeDefined();
      expect(log.timestamp).toBeDefined();
      expect(log.skipped).toBe(true);
    });

    // ========== システムの継続処理確認 ==========
    expect(result.totalProcessed).toBe(4);
    expect(result.successCount).toBe(2);
    expect(result.errorCount).toBe(2);
    expect(result.successCount + result.errorCount).toBe(result.totalProcessed);
  });
});