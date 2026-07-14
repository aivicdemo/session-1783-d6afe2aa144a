import { aggregateRejectionReasonsWhenThresholdReached } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-902: [normal] 却下修正理由の自動集約処理 - 累積理由データが50件に達した時点で自動集約処理が即座に開始される
  test('should trigger automatic aggregation when accumulated rejection reasons reach 50 items threshold', async () => {
    // 初期化: テスト用の理由データ配列を準備
    const rejectionReasonsForThresholdTest: Array<{
      id: string;
      userId: string;
      mealPlanId: string;
      reason: string;
      category: string;
      timestamp: string;
    }> = [];

    // ステップ1: 累積理由データの現在件数が0件であることを確認
    expect(rejectionReasonsForThresholdTest.length).toBe(0);

    // ステップ2-4: 理由データを1件ずつ追加し、49件に達するまで繰り返す
    for (let i = 1; i <= 49; i++) {
      rejectionReasonsForThresholdTest.push({
        id: `reason-${i}`,
        userId: 'user-001',
        mealPlanId: `meal-plan-${Math.floor((i - 1) / 7) + 1}`,
        reason: `Reason text for rejection number ${i}`,
        category: i % 5 === 1 ? 'nutrition' : i % 5 === 2 ? 'budget' : i % 5 === 3 ? 'preference' : i % 5 === 4 ? 'cooking_time' : 'food_restriction',
        timestamp: new Date(`2024-01-15T${String(9 + Math.floor(i / 6)).padStart(2, '0')}:00:00Z`).toISOString(),
      });
    }

    // ステップ5: 49件目追加後、自動集約処理が開始されていないことを確認
    const resultBefore49 = await aggregateRejectionReasonsWhenThresholdReached({
      accumulatedRejectionReasons: rejectionReasonsForThresholdTest,
      aggregationThreshold: 50,
    });

    expect(resultBefore49.shouldTriggerAggregation).toBe(false);
    expect(resultBefore49.currentCount).toBe(49);
    expect(resultBefore49.aggregationStatus).toBe('pending');

    // ステップ6: 50件目の却下修正理由データを追加
    rejectionReasonsForThresholdTest.push({
      id: 'reason-50',
      userId: 'user-001',
      mealPlanId: 'meal-plan-8',
      reason: 'Reason text for rejection number 50',
      category: 'nutrition',
      timestamp: new Date('2024-01-15T16:00:00Z').toISOString(),
    });

    // ステップ7: 自動集約処理が即座に開始されたことを検証
    const resultAt50 = await aggregateRejectionReasonsWhenThresholdReached({
      accumulatedRejectionReasons: rejectionReasonsForThresholdTest,
      aggregationThreshold: 50,
    });

    expect(resultAt50.shouldTriggerAggregation).toBe(true);
    expect(resultAt50.currentCount).toBe(50);
    expect(resultAt50.aggregationStatus).toBe('executing');

    // ステップ8: 自動集約処理の実行ログに50件のデータが対象として記録されていることを確認
    expect(resultAt50.executionLog).toBeDefined();
    expect(resultAt50.executionLog.targetItemCount).toBe(50);
    expect(resultAt50.executionLog.processedAt).toBeDefined();
    expect(resultAt50.executionLog.triggerReason).toBe('threshold_reached');

    // ステップ9-10: 集約後のデータが正常に統合されていることを確認
    const aggregatedResult = await aggregateRejectionReasonsWhenThresholdReached({
      accumulatedRejectionReasons: rejectionReasonsForThresholdTest,
      aggregationThreshold: 50,
      executeAggregation: true,
    });

    expect(aggregatedResult.aggregationCompleted).toBe(true);
    expect(aggregatedResult.aggregatedData).toBeDefined();
    expect(aggregatedResult.aggregatedData.totalItemsProcessed).toBe(50);
    expect(aggregatedResult.aggregatedData.duplicatesRemoved).toBeGreaterThanOrEqual(0);

    // カテゴリ別集計の統計情報が正常に更新されていることを確認
    expect(aggregatedResult.aggregatedData.categoryStatistics).toBeDefined();
    expect(aggregatedResult.aggregatedData.categoryStatistics.nutrition).toBeGreaterThan(0);
    expect(aggregatedResult.aggregatedData.categoryStatistics.budget).toBeGreaterThan(0);
    expect(aggregatedResult.aggregatedData.categoryStatistics.preference).toBeGreaterThan(0);
    expect(aggregatedResult.aggregatedData.categoryStatistics.cooking_time).toBeGreaterThan(0);
    expect(aggregatedResult.aggregatedData.categoryStatistics.food_restriction).toBeGreaterThan(0);

    // カテゴリ別統計の合計が処理済みアイテム数と一致することを確認
    const totalCategorized =
      aggregatedResult.aggregatedData.categoryStatistics.nutrition +
      aggregatedResult.aggregatedData.categoryStatistics.budget +
      aggregatedResult.aggregatedData.categoryStatistics.preference +
      aggregatedResult.aggregatedData.categoryStatistics.cooking_time +
      aggregatedResult.aggregatedData.categoryStatistics.food_restriction;

    expect(totalCategorized).toBe(50);

    // 集約処理の最終ステータスが完了状態であることを確認
    expect(aggregatedResult.aggregationStatus).toBe('completed');
  });
});