import { classifyRejectionReasonAndAggregate } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計', () => {
  // SCEN-942
  test('理由文がNullまたは空文字列の場合、分類処理を適切にスキップまたはエラーをスロー', () => {
    const rejectionReasonsWithNull = [
      { id: 1, reasonText: null as any, timestamp: '2024-01-15T10:00:00Z', userId: 'user-001' },
      { id: 2, reasonText: '栄養バランスが悪い', timestamp: '2024-01-15T10:05:00Z', userId: 'user-001' },
      { id: 3, reasonText: '', timestamp: '2024-01-15T10:10:00Z', userId: 'user-002' },
      { id: 4, reasonText: '調理時間が長すぎる', timestamp: '2024-01-15T10:15:00Z', userId: 'user-002' },
    ];

    const result = classifyRejectionReasonAndAggregate(rejectionReasonsWithNull);

    // null/空文字列のケースはskippedまたはunclassifiedカテゴリでカウント
    expect(result.classifiedReasons.length).toBe(4);
    
    // nullの理由は skipped または unclassified として記録
    const nullReason = result.classifiedReasons[0];
    expect(nullReason.id).toBe(1);
    expect(['skipped', 'unclassified']).toContain(nullReason.category);
    expect(nullReason.status).toBe('skipped');

    // 正常な理由は指定カテゴリに分類
    const validReason1 = result.classifiedReasons[1];
    expect(validReason1.id).toBe(2);
    expect(validReason1.reasonText).toBe('栄養バランスが悪い');
    expect(validReason1.category).toBe('nutrition');
    expect(validReason1.status).toBe('classified');

    // 空文字列の理由も skipped または unclassified として記録
    const emptyReason = result.classifiedReasons[2];
    expect(emptyReason.id).toBe(3);
    expect(['skipped', 'unclassified']).toContain(emptyReason.category);
    expect(emptyReason.status).toBe('skipped');

    // 正常な理由は指定カテゴリに分類
    const validReason2 = result.classifiedReasons[3];
    expect(validReason2.id).toBe(4);
    expect(validReason2.reasonText).toBe('調理時間が長すぎる');
    expect(validReason2.category).toBe('cookingTime');
    expect(validReason2.status).toBe('classified');

    // 集計結果の検証
    expect(result.aggregationSummary.totalCount).toBe(4);
    expect(result.aggregationSummary.classifiedCount).toBe(2);
    expect(result.aggregationSummary.skippedCount).toBe(2);
    expect(result.aggregationSummary.categoryDistribution.nutrition).toBe(1);
    expect(result.aggregationSummary.categoryDistribution.cookingTime).toBe(1);
    expect(result.aggregationSummary.categoryDistribution.unclassified).toBe(2);

    // ダッシュボード用出力
    expect(result.dashboardData.invalidInputCount).toBe(2);
    expect(result.dashboardData.validClassificationCount).toBe(2);
    expect(result.dashboardData.displayCategories.length).toBe(2);
    expect(result.dashboardData.displayCategories.some(cat => cat.category === 'nutrition' && cat.count === 1)).toBe(true);
    expect(result.dashboardData.displayCategories.some(cat => cat.category === 'cookingTime' && cat.count === 1)).toBe(true);

    // システムログの検証
    expect(result.systemLog.length).toBeGreaterThanOrEqual(2);
    const nullLog = result.systemLog.find(log => log.reasonId === 1);
    expect(nullLog).toBeDefined();
    expect(nullLog?.logLevel).toBe('warning');
    expect(nullLog?.message).toMatch(/null|空|empty|invalid/i);

    const emptyLog = result.systemLog.find(log => log.reasonId === 3);
    expect(emptyLog).toBeDefined();
    expect(emptyLog?.logLevel).toBe('warning');
    expect(emptyLog?.message).toMatch(/null|空|empty|invalid/i);
  });

  test('理由文がnullの場合はエラーをスロー', () => {
    const nullReason = null as any;
    expect(() => classifyRejectionReasonAndAggregate([
      { id: 1, reasonText: nullReason, timestamp: '2024-01-15T10:00:00Z', userId: 'user-001' }
    ])).toThrow(/理由文|null|入力値/);
  });

  test('理由文が空文字列のみの場合、集計結果は正しくカウント', () => {
    const emptyReasons = [
      { id: 1, reasonText: '', timestamp: '2024-01-15T10:00:00Z', userId: 'user-001' },
      { id: 2, reasonText: '', timestamp: '2024-01-15T10:05:00Z', userId: 'user-001' },
    ];

    const result = classifyRejectionReasonAndAggregate(emptyReasons);

    expect(result.aggregationSummary.totalCount).toBe(2);
    expect(result.aggregationSummary.skippedCount).toBe(2);
    expect(result.aggregationSummary.classifiedCount).toBe(0);
    expect(result.dashboardData.invalidInputCount).toBe(2);
    expect(result.dashboardData.validClassificationCount).toBe(0);
  });
});