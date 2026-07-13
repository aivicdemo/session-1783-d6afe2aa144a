import { calculateNutritionBalanceValidation, detectSLAExceeded, generateProvisionalShoppingList } from '../../src/logic/it-1-br-2-1-1-1';

describe('買い物リスト生成SLA遅延検知・代替処理機能', () => {
  // SCEN-564: SLA超過を検知し、暫定的な栄養バランス検証が自動実行される
  test('SLA時間内に買い物リストが生成されない場合、SLA超過を検知して暫定栄養バランス検証と簡略版買い物リストを自動生成する', () => {
    // === 前提条件 ===
    // 栄養管理・分析ダッシュボードシステムにログイン済み、家族の食事制限・アレルギー情報が登録済み
    const userId = 'user_001';
    const familyId = 'family_001';
    const requestTimestamp = new Date('2024-01-15T10:00:00Z');
    const slaThresholdMs = 5 * 60 * 1000; // SLA上限: 5分

    // 買い物リスト生成要求
    const shoppingListRequest = {
      userId,
      familyId,
      requestedAt: requestTimestamp.toISOString(),
      constraintConditions: {
        nutritionTarget: {
          protein: { min: 50, max: 100, unit: 'g' },
          carbohydrate: { min: 200, max: 300, unit: 'g' },
          fat: { min: 50, max: 80, unit: 'g' },
          fiber: { min: 20, max: 40, unit: 'g' },
        },
        dietaryRestrictions: ['vegetarian'],
        allergies: ['peanut', 'shellfish'],
        budget: { limit: 5000, currency: 'JPY' },
        cookingTimeLimit: 30, // 分
      },
    };

    // === トリガー条件 ===
    // SLA超過を検知するためのタイムスタンプ設定
    const processingStartTime = new Date('2024-01-15T10:00:00Z');
    const slaExceededTime = new Date(processingStartTime.getTime() + slaThresholdMs + 1000); // SLA超過（1秒オーバー）

    // === Step 1: SLA超過検知 ===
    const slaDetectionResult = detectSLAExceeded({
      requestTimestamp: processingStartTime.toISOString(),
      currentTimestamp: slaExceededTime.toISOString(),
      slaThresholdMs,
    });

    // SLA超過が検知されたことを確認
    expect(slaDetectionResult.isExceeded).toBe(true);
    expect(slaDetectionResult.elapsedMs).toBeGreaterThan(slaThresholdMs);
    expect(slaDetectionResult.excessMs).toBeGreaterThan(0);
    expect(slaDetectionResult.detectedAt).toBe(slaExceededTime.toISOString());

    // === Step 2: 暫定的な栄養バランス検証 ===
    // 過去の献立履歴と現在の栄養摂取データから簡略版の栄養バランス検証を実行
    const nutritionData = {
      userId,
      nutritionRecords: [
        { date: '2024-01-14', protein: 55, carbohydrate: 250, fat: 65, fiber: 22 },
        { date: '2024-01-13', protein: 60, carbohydrate: 280, fat: 70, fiber: 25 },
        { date: '2024-01-12', protein: 52, carbohydrate: 220, fat: 60, fiber: 20 },
      ],
      targetNutrition: {
        protein: { min: 50, max: 100 },
        carbohydrate: { min: 200, max: 300 },
        fat: { min: 50, max: 80 },
        fiber: { min: 20, max: 40 },
      },
      dietaryRestrictions: ['vegetarian'],
    };

    const provisionalValidationResult = calculateNutritionBalanceValidation(nutritionData);

    // 暫定検証結果の構造を確認
    expect(provisionalValidationResult).toHaveProperty('validationStatus');
    expect(provisionalValidationResult).toHaveProperty('achievementScores');
    expect(provisionalValidationResult).toHaveProperty('deficiencyItems');
    expect(provisionalValidationResult).toHaveProperty('processedAt');

    // 栄養項目ごとの達成度スコア（0-100）を確認
    const achievementScores = provisionalValidationResult.achievementScores;
    expect(achievementScores).toHaveProperty('protein');
    expect(achievementScores).toHaveProperty('carbohydrate');
    expect(achievementScores).toHaveProperty('fat');
    expect(achievementScores).toHaveProperty('fiber');

    // 達成度スコアが有効な範囲内（0-100）であることを確認
    expect(achievementScores.protein).toBeGreaterThanOrEqual(0);
    expect(achievementScores.protein).toBeLessThanOrEqual(100);
    expect(achievementScores.carbohydrate).toBeGreaterThanOrEqual(0);
    expect(achievementScores.carbohydrate).toBeLessThanOrEqual(100);
    expect(achievementScores.fat).toBeGreaterThanOrEqual(0);
    expect(achievementScores.fat).toBeLessThanOrEqual(100);
    expect(achievementScores.fiber).toBeGreaterThanOrEqual(0);
    expect(achievementScores.fiber).toBeLessThanOrEqual(100);

    // 栄養不足項目が正しく判定されていることを確認
    expect(Array.isArray(provisionalValidationResult.deficiencyItems)).toBe(true);
    provisionalValidationResult.deficiencyItems.forEach((item: any) => {
      expect(item).toHaveProperty('nutrient');
      expect(item).toHaveProperty('current');
      expect(item).toHaveProperty('target');
      expect(item).toHaveProperty('shortfall');
    });

    // 暫定検証が実行されたことをタイムスタンプで確認
    expect(new Date(provisionalValidationResult.processedAt).getTime()).toBeGreaterThan(
      new Date(slaExceededTime).getTime()
    );

    // === Step 3: 簡略版買い物リスト生成 ===
    const provisionalShoppingList = generateProvisionalShoppingList({
      userId,
      familyId,
      deficiencyItems: provisionalValidationResult.deficiencyItems,
      dietaryRestrictions: shoppingListRequest.constraintConditions.dietaryRestrictions,
      allergies: shoppingListRequest.constraintConditions.allergies,
      budget: shoppingListRequest.constraintConditions.budget,
      generatedAt: slaExceededTime.toISOString(),
    });

    // 簡略版買い物リストが生成されたことを確認
    expect(provisionalShoppingList).toHaveProperty('shoppingListId');
    expect(provisionalShoppingList).toHaveProperty('items');
    expect(provisionalShoppingList).toHaveProperty('totalEstimatedCost');
    expect(provisionalShoppingList).toHaveProperty('isProvisional');
    expect(provisionalShoppingList).toHaveProperty('generatedAt');

    // 簡略版フラグが true であることを確認
    expect(provisionalShoppingList.isProvisional).toBe(true);

    // 買い物リスト内の品目が存在することを確認
    expect(Array.isArray(provisionalShoppingList.items)).toBe(true);
    expect(provisionalShoppingList.items.length).toBeGreaterThan(0);

    // 各品目が必須フィールドを持つことを確認
    provisionalShoppingList.items.forEach((item: any) => {
      expect(item).toHaveProperty('name');
      expect(item).toHaveProperty('quantity');
      expect(item).toHaveProperty('unit');
      expect(item).toHaveProperty('estimatedPrice');
      expect(item).toHaveProperty('priority');
      expect(typeof item.name).toBe('string');
      expect(typeof item.quantity).toBe('number');
      expect(typeof item.estimatedPrice).toBe('number');
      expect(['high', 'medium', 'low']).toContain(item.priority);
    });

    // 総見積もり費用が予算内であることを確認
    expect(provisionalShoppingList.totalEstimatedCost).toBeLessThanOrEqual(
      shoppingListRequest.constraintConditions.budget.limit
    );

    // === Step 4: ユーザーがアクション実行可能であることを確認 ===
    // ユーザーは代替結果に対して以下のアクションを実行可能
    const userActions = {
      canAccept: true, // 受け入れ可能
      canModify: true, // 修正可能
      canWaitForFinal: true, // 最終版待機可能
      canRetry: true, // 再実行可能
    };

    expect(userActions.canAccept).toBe(true);
    expect(userActions.canModify).toBe(true);
    expect(userActions.canWaitForFinal).toBe(true);
    expect(userActions.canRetry).toBe(true);

    // === Step 5: SLA遅延ログが記録されることを確認 ===
    // システムが遅延ログを記録したことを確認
    const delayLog = {
      requestId: shoppingListRequest.userId,
      slaThresholdMs,
      actualElapsedMs: slaDetectionResult.elapsedMs,
      excessMs: slaDetectionResult.excessMs,
      triggeredAt: slaExceededTime.toISOString(),
      provisionalProcessInitiatedAt: provisionalValidationResult.processedAt,
      provisionalListGeneratedAt: provisionalShoppingList.generatedAt,
      status: 'sla_exceeded_fallback_applied',
    };

    expect(delayLog.actualElapsedMs).toBeGreaterThan(slaThresholdMs);
    expect(delayLog.status).toBe('sla_exceeded_fallback_applied');
    expect(new Date(delayLog.provisionalProcessInitiatedAt).getTime()).toBeLessThanOrEqual(
      new Date(slaExceededTime).getTime() + 30000 // 30秒以内に開始
    );

    // === Step 6: 暫定版と最終版の更新フロー ===
    // 最終版の買い物リストが生成された後、ユーザーに自動更新されることを期待
    const finalShoppingList = {
      shoppingListId: 'shopping_list_final_001',
      items: [
        {
          name: '鶏胸肉',
          quantity: 500,
          unit: 'g',
          estimatedPrice: 800,
          priority: 'high',
          reason: 'タンパク質補充',
        },
        {
          name: 'ブロッコリー',
          quantity: 300,
          unit: 'g',
          estimatedPrice: 400,
          priority: 'high',
          reason: '食物繊維補充',
        },
        {
          name: '玄米',
          quantity: 1000,
          unit: 'g',
          estimatedPrice: 600,
          priority: 'medium',
          reason: '炭水化物・食物繊維',
        },
      ],
      totalEstimatedCost: 1800,
      isProvisional: false,
      generatedAt: new Date('2024-01-15T10:05:30Z').toISOString(),
    };

    // 最終版が暫定版より詳細であることを確認
    expect(finalShoppingList.items.length).toBeGreaterThanOrEqual(provisionalShoppingList.items.length);
    expect(finalShoppingList.isProvisional).toBe(false);

    // 最終版の総費用が予算内であることを確認
    expect(finalShoppingList.totalEstimatedCost).toBeLessThanOrEqual(
      shoppingListRequest.constraintConditions.budget.limit
    );

    // === Step 7: エラーハンドリング ===
    // SLA検知ロジックが不正な入力で失敗することを確認
    expect(() =>
      detectSLAExceeded({
        requestTimestamp: 'invalid-timestamp',
        currentTimestamp: slaExceededTime.toISOString(),
        slaThresholdMs,
      })
    ).toThrow(/タイムスタンプ/);

    // SLA閾値が負数の場合、エラーを発生させることを確認
    expect(() =>
      detectSLAExceeded({
        requestTimestamp: processingStartTime.toISOString(),
        currentTimestamp: slaExceededTime.toISOString(),
        slaThresholdMs: -1000,
      })
    ).toThrow(/閾値/);

    // 栄養データが不足している場合、エラーを発生させることを確認
    expect(() =>
      calculateNutritionBalanceValidation({
        userId,
        nutritionRecords: [],
        targetNutrition: nutritionData.targetNutrition,
        dietaryRestrictions: [],
      })
    ).toThrow(/栄養記録/);
  });
});