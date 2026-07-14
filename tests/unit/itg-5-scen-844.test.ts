import { validateRuleNutritionAlignment } from '../../src/logic/it-7-2-1';

describe('献立生成アルゴリズムの成功率・調理時間短縮度・ユーザー満足度スコアなどの行動指標を週次で自動集計し、アルゴリズム改善前後の効果差を定量比較するダッシュボード機能', () => {
  // SCEN-844: [error] ルール変更時の整合性自動検証 - 新ルールが栄養基準と抵触する場合、検証失敗として開発チームに通知され、実装が前に進まない
  test('新ルールが栄養基準と抵触する場合、整合性自動検証が失敗と判定され、具体的な抵触内容を含むエラーメッセージが表示される', () => {
    const currentNutritionStandards = {
      proteinMinGrams: 50,
      proteinMaxGrams: 150,
      fiberMinGrams: 20,
      fiberMaxGrams: 40,
      sodiumMaxMg: 2300,
    };

    const newRule = {
      ruleId: 'RULE-001',
      ruleType: 'seasonal_ingredient_priority',
      seasonalPattern: 'winter_high_sodium_ingredients',
      includedIngredients: ['salted_fish', 'preserved_vegetables', 'cured_meat'],
      averageSodiumPerServingMg: 3500,
      priority: 95,
      appliedFromDate: '2024-01-15T00:00:00Z',
    };

    const validationResult = validateRuleNutritionAlignment(
      currentNutritionStandards,
      newRule
    );

    expect(validationResult.isValid).toBe(false);
    expect(validationResult.validationStatus).toBe('failed');
    expect(validationResult.conflictDetails).toContain(/sodium/i);
    expect(validationResult.conflictDetails).toContain(/栄養基準/);
    expect(validationResult.errorMessage).toMatch(/抵触/);
    expect(validationResult.notificationGenerated).toBe(true);
    expect(validationResult.notificationRecipient).toBe('development_team');
    expect(validationResult.workflowProgress).toBe('blocked_at_validation');
    expect(validationResult.requiresRuleModification).toBe(true);
    expect(validationResult.conflictConflictingNutrientName).toBe('sodium');
    expect(validationResult.conflictCurrentLimitMg).toBe(2300);
    expect(validationResult.conflictProposedValueMg).toBe(3500);
    expect(validationResult.conflictExceedancePercentage).toBeCloseTo(52.17, 1);
  });
});