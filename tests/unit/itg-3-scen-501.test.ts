import { validateRuleChangeImplementation } from '../../src/logic/it-1-br-6-2-1-1';

describe('ルール変更実装検証機能 - 食事評価データが1件のみ存在する場合', () => {
  // SCEN-501
  test('食事評価データが1件のみ存在する場合、整合性検証が正常に完了する', () => {
    const mealEvaluationData = {
      id: '5dfe4e27-1ef6-4e52-a1ab-8c8b9f7e6d4a',
      userId: 'user-123',
      mealDate: '2024-01-15',
      mealContent: 'グリルチキンとサラダ',
      satisfactionScore: 85,
      completionRate: 95,
      nutritionInfo: {
        calories: 450,
        protein: 35,
        carbohydrates: 40,
        fat: 12,
      },
      createdAt: '2024-01-15T19:30:00Z',
      updatedAt: '2024-01-15T19:30:00Z',
    };

    const ruleChangeInput = {
      seasonalPattern: 'winter',
      discountThreshold: 15,
      salePeriodStart: '2024-01-15',
      salePeriodEnd: '2024-01-31',
      implementationId: 'impl-6-2-1-1-501',
    };

    const result = validateRuleChangeImplementation(mealEvaluationData, ruleChangeInput);

    // 検証ステータスが成功であることを確認
    expect(result.status).toBe('success');

    // エラーが発生していないことを確認
    expect(result.hasError).toBe(false);

    // 検証ログが記録されていることを確認
    expect(result.validationLog).toBeDefined();
    expect(result.validationLog.length).toBeGreaterThan(0);

    // 検証ログに完了メッセージが含まれていることを確認
    expect(result.validationLog).toContain(/検証完了/);

    // 食事評価データが1件のみ処理されたことを確認
    expect(result.processedRecordCount).toBe(1);

    // 栄養情報の整合性が検証されたことを確認
    expect(result.nutritionValidation.isConsistent).toBe(true);

    // システムが安定した状態であることを確認（エラーメッセージがないこと）
    expect(result.systemStatus).toBe('stable');
    expect(result.errorMessage).toBeUndefined();

    // 検証後のシステム状態を確認
    expect(result.postValidationState).toEqual({
      dataIntegrity: 'intact',
      consistencyCheckPassed: true,
      readyForDeployment: true,
    });

    // ルール変更が献立生成ロジックに適用可能な状態であることを確認
    expect(result.canApplyToAlgorithm).toBe(true);
  });
});