import { aggregateRefusalReasonsForWeek } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-901
  test('毎週日曜日23:59に過去7日間の却下・修正理由が全件自動集約される', () => {
    // テスト実行日: 2024-01-14 (日曜日) 23:59:00Z
    const aggregationTimestamp = new Date('2024-01-14T23:59:00Z');

    // 過去7日間のレコード (月曜日～日曜日: 2024-01-08～2024-01-14)
    const refusalRecords = [
      {
        id: 1,
        userId: 'user001',
        mealPlanId: 'plan001',
        refusalReason: '栄養バランスが悪い',
        refusalType: 'refusal',
        createdAt: new Date('2024-01-08T10:00:00Z'),
        aggregatedFlag: false,
      },
      {
        id: 2,
        userId: 'user001',
        mealPlanId: 'plan002',
        refusalReason: '栄養バランスが悪い',
        refusalType: 'refusal',
        createdAt: new Date('2024-01-09T14:30:00Z'),
        aggregatedFlag: false,
      },
      {
        id: 3,
        userId: 'user002',
        mealPlanId: 'plan003',
        refusalReason: '調理時間が長すぎる',
        refusalType: 'refusal',
        createdAt: new Date('2024-01-10T08:15:00Z'),
        aggregatedFlag: false,
      },
      {
        id: 4,
        userId: 'user002',
        mealPlanId: 'plan004',
        refusalReason: '家族の好みに合わない',
        refusalType: 'modification',
        createdAt: new Date('2024-01-11T16:45:00Z'),
        aggregatedFlag: false,
      },
      {
        id: 5,
        userId: 'user001',
        mealPlanId: 'plan005',
        refusalReason: '栄養バランスが悪い',
        refusalType: 'refusal',
        createdAt: new Date('2024-01-12T09:20:00Z'),
        aggregatedFlag: false,
      },
      {
        id: 6,
        userId: 'user003',
        mealPlanId: 'plan006',
        refusalReason: '食材在庫がない',
        refusalType: 'refusal',
        createdAt: new Date('2024-01-13T11:00:00Z'),
        aggregatedFlag: false,
      },
      {
        id: 7,
        userId: 'user002',
        mealPlanId: 'plan007',
        refusalReason: '予算を超えている',
        refusalType: 'modification',
        createdAt: new Date('2024-01-14T13:30:00Z'),
        aggregatedFlag: false,
      },
    ];

    // 集約対象の週開始日時: 2024-01-08 00:00:00Z (月曜日)
    const weekStartDate = new Date('2024-01-08T00:00:00Z');
    const weekEndDate = new Date('2024-01-14T23:59:59Z');

    // 関数実行: 自動集約処理
    const aggregationResult = aggregateRefusalReasonsForWeek(
      refusalRecords,
      aggregationTimestamp,
      weekStartDate,
      weekEndDate
    );

    // 期待結果1: 集約データが返却される
    expect(aggregationResult).toBeDefined();
    expect(aggregationResult.weekStartDate).toEqual(weekStartDate);
    expect(aggregationResult.weekEndDate).toEqual(weekEndDate);
    expect(aggregationResult.aggregationExecutedAt).toEqual(aggregationTimestamp);

    // 期待結果2: 理由別の集計が正確に計算される
    // 却下理由の集計
    const refusalSummary = aggregationResult.refusalReasonsSummary;
    expect(refusalSummary).toBeDefined();
    expect(refusalSummary.length).toBe(3); // 栄養バランス, 調理時間, 食材在庫

    const nutritionRefusal = refusalSummary.find(
      (r) => r.reason === '栄養バランスが悪い'
    );
    expect(nutritionRefusal).toBeDefined();
    expect(nutritionRefusal?.count).toBe(3); // レコードID: 1, 2, 5

    const cookingTimeRefusal = refusalSummary.find(
      (r) => r.reason === '調理時間が長すぎる'
    );
    expect(cookingTimeRefusal).toBeDefined();
    expect(cookingTimeRefusal?.count).toBe(1); // レコードID: 3

    const inventoryRefusal = refusalSummary.find(
      (r) => r.reason === '食材在庫がない'
    );
    expect(inventoryRefusal).toBeDefined();
    expect(inventoryRefusal?.count).toBe(1); // レコードID: 6

    // 修正理由の集計
    const modificationSummary = aggregationResult.modificationReasonsSummary;
    expect(modificationSummary).toBeDefined();
    expect(modificationSummary.length).toBe(2); // 家族の好み, 予算超過

    const preferencesModification = modificationSummary.find(
      (m) => m.reason === '家族の好みに合わない'
    );
    expect(preferencesModification).toBeDefined();
    expect(preferencesModification?.count).toBe(1); // レコードID: 4

    const budgetModification = modificationSummary.find(
      (m) => m.reason === '予算を超えている'
    );
    expect(budgetModification).toBeDefined();
    expect(budgetModification?.count).toBe(1); // レコードID: 7

    // 期待結果3: 集計対象レコードの総件数が正確に計算される
    expect(aggregationResult.totalRefusalCount).toBe(5); // 却下: 3 + 1 + 1
    expect(aggregationResult.totalModificationCount).toBe(2); // 修正: 1 + 1
    expect(aggregationResult.totalRecordCount).toBe(7); // 全体: 5 + 2

    // 期待結果4: 集約済みフラグが設定される
    expect(aggregationResult.aggregatedRecordIds).toEqual([1, 2, 3, 4, 5, 6, 7]);

    // 期待結果5: 重複実行がないことを検証
    // 既に集約済みのレコードを含めて再実行した場合の検証
    const alreadyAggregatedRecords = [
      {
        id: 1,
        userId: 'user001',
        mealPlanId: 'plan001',
        refusalReason: '栄養バランスが悪い',
        refusalType: 'refusal',
        createdAt: new Date('2024-01-08T10:00:00Z'),
        aggregatedFlag: true, // 既に集約済み
      },
      {
        id: 8,
        userId: 'user001',
        mealPlanId: 'plan008',
        refusalReason: '栄養バランスが悪い',
        refusalType: 'refusal',
        createdAt: new Date('2024-01-14T22:00:00Z'),
        aggregatedFlag: false,
      },
    ];

    const secondAggregationResult = aggregateRefusalReasonsForWeek(
      alreadyAggregatedRecords,
      aggregationTimestamp,
      weekStartDate,
      weekEndDate
    );

    // 既に集約済みのレコード(ID:1)は集計から除外される
    expect(secondAggregationResult.totalRefusalCount).toBe(1); // ID:8 のみ
    expect(secondAggregationResult.aggregatedRecordIds).toEqual([8]);
    expect(secondAggregationResult.duplicateCheckPassed).toBe(true);
  });
});