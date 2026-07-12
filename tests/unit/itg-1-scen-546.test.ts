import { generateMealPlanWithSLAOverride } from '../../src/logic/it-3';

describe('食事評価データを献立生成ロジックに反映させる機能', () => {
  // SCEN-546: [normal] SLA超過時の代替処理と遅延通知機能 - SLA超過時に遅延ログと通知が正常に記録・送信される
  test('SLA超過時に代替処理が実行され、遅延ログ・通知・履歴が正常に記録される', async () => {
    const userId = 'user-001';
    const familyMemberId = 'family-001';
    const slaThresholdMs = 30000; // 30秒
    const processingDelayMs = 35000; // SLA超過: 35秒

    const request = {
      userId,
      familyMemberId,
      constraints: {
        nutritionTargets: [
          { nutrientId: 'calcium', targetValue: 600, unit: 'mg' },
          { nutrientId: 'iron', targetValue: 8, unit: 'mg' }
        ],
        allergyRestrictions: ['peanut', 'shrimp'],
        cookingTimeLimit: 45,
        budgetLimit: 3000
      },
      slaThresholdMs,
      processingDelayMs,
      userId,
      timestamp: new Date('2024-01-15T19:30:00Z').toISOString()
    };

    const response = await generateMealPlanWithSLAOverride(request);

    // 代替献立が返される
    expect(response.mealPlan).toBeDefined();
    expect(response.mealPlan.dishes).toHaveLength(3);
    expect(response.mealPlan.dishes[0].name).toBe('Salmon with steamed vegetables');
    expect(response.mealPlan.dishes[0].cookingTime).toBe(35);
    expect(response.mealPlan.dishes[0].estimatedCost).toBe(850);

    // SLA超過が記録される
    expect(response.slaStatus).toBeDefined();
    expect(response.slaStatus.isExceeded).toBe(true);
    expect(response.slaStatus.elapsedTimeMs).toBe(35000);
    expect(response.slaStatus.thresholdMs).toBe(30000);
    expect(response.slaStatus.overageMs).toBe(5000);

    // 代替処理の実行確認
    expect(response.fallbackProcessed).toBe(true);
    expect(response.fallbackType).toBe('simplified_nutritional_optimization');

    // 遅延ログが記録されている
    expect(response.delayLog).toBeDefined();
    expect(response.delayLog.logId).toBe('log-20240115-193000-sla-001');
    expect(response.delayLog.userId).toBe('user-001');
    expect(response.delayLog.timestamp).toBe('2024-01-15T19:30:00Z');
    expect(response.delayLog.delayReasonCode).toBe('algorithm_processing_timeout');
    expect(response.delayLog.elapsedTimeMs).toBe(35000);
    expect(response.delayLog.thresholdMs).toBe(30000);
    expect(response.delayLog.severity).toBe('medium');

    // 遅延通知が送信されている
    expect(response.delayNotification).toBeDefined();
    expect(response.delayNotification.notificationId).toBe('notif-20240115-193000-delay-001');
    expect(response.delayNotification.userId).toBe('user-001');
    expect(response.delayNotification.notificationType).toBe('processing_delay_alert');
    expect(response.delayNotification.title).toBe('献立生成が遅延しています');
    expect(response.delayNotification.message).toContain('献立生成処理が予定より遅れています');
    expect(response.delayNotification.delayReason).toBe('アルゴリズム処理がタイムアウトしました');
    expect(response.delayNotification.estimatedCompletionTime).toBe('2024-01-15T19:30:40Z');
    expect(response.delayNotification.status).toBe('sent');
    expect(response.delayNotification.sentTimestamp).toBe('2024-01-15T19:30:05Z');

    // 遅延履歴がデータベースに記録されている
    expect(response.delayHistory).toBeDefined();
    expect(response.delayHistory.historyId).toBe('hist-20240115-193000-delay-001');
    expect(response.delayHistory.userId).toBe('user-001');
    expect(response.delayHistory.mealPlanRequestId).toBe('req-20240115-193000-001');
    expect(response.delayHistory.delayStartTime).toBe('2024-01-15T19:30:00Z');
    expect(response.delayHistory.delayEndTime).toBe('2024-01-15T19:30:05Z');
    expect(response.delayHistory.totalDelayMs).toBe(5000);
    expect(response.delayHistory.delayCategory).toBe('sla_exceeded');
    expect(response.delayHistory.fallbackProcessApplied).toBe(true);
    expect(response.delayHistory.recordedAt).toBe('2024-01-15T19:30:05Z');

    // 最終的に返される代替献立の栄養バランス確認
    expect(response.mealPlan.nutritionalSummary).toBeDefined();
    expect(response.mealPlan.nutritionalSummary.totalCalories).toBe(1850);
    expect(response.mealPlan.nutritionalSummary.calcium).toBe(580);
    expect(response.mealPlan.nutritionalSummary.iron).toBe(7.8);
    expect(response.mealPlan.nutritionalSummary.protein).toBe(95);

    // 栄養基準に対する達成度
    expect(response.mealPlan.nutritionAchievementRate.calcium).toBe(96.67); // 580/600*100
    expect(response.mealPlan.nutritionAchievementRate.iron).toBe(97.5); // 7.8/8*100

    // アレルギー制限が遵守されている
    expect(response.mealPlan.allergyCompliance).toBe(true);
    expect(response.mealPlan.dishes.every(
      dish => !dish.allergens.includes('peanut') && !dish.allergens.includes('shrimp')
    )).toBe(true);

    // 調理時間が制限内
    const totalCookingTime = response.mealPlan.dishes.reduce(
      (sum, dish) => sum + dish.cookingTime,
      0
    );
    expect(totalCookingTime).toBe(105);
    expect(totalCookingTime).toBeLessThanOrEqual(45 * 3); // 1日3食で45分/食

    // 予算が制限内
    const totalCost = response.mealPlan.dishes.reduce(
      (sum, dish) => sum + dish.estimatedCost,
      0
    );
    expect(totalCost).toBe(2450);
    expect(totalCost).toBeLessThanOrEqual(3000);

    // レスポンス全体の構造確認
    expect(response).toHaveProperty('mealPlan');
    expect(response).toHaveProperty('slaStatus');
    expect(response).toHaveProperty('fallbackProcessed');
    expect(response).toHaveProperty('delayLog');
    expect(response).toHaveProperty('delayNotification');
    expect(response).toHaveProperty('delayHistory');
    expect(response).toHaveProperty('metadata');

    // メタデータ確認
    expect(response.metadata).toBeDefined();
    expect(response.metadata.processingTimeMs).toBe(35000);
    expect(response.metadata.alternativeApproach).toBe('true');
    expect(response.metadata.userNotified).toBe(true);
  });
});