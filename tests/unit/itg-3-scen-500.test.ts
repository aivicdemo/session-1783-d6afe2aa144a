import { validateRuleChangeWithNutrition } from '../../src/logic/it-1-br-6-2-1-1';

describe('食材流通業者・スーパーの在庫・価格データ連携インターフェース', () => {
  // SCEN-500
  test('ルール変更実装検証機能 - 栄養基準値が0の場合、適切に処理される', () => {
    const ruleChangeInput = {
      ruleId: 'rule_20240315_001',
      seasonPattern: 'spring_2024',
      discountThreshold: 15,
      salePeriodStart: '2024-03-01',
      salePeriodEnd: '2024-03-31',
      nutrientType: 'protein',
      nutrientBaselineValue: 0,
      timestamp: '2024-03-15T10:30:00Z',
    };

    const result = validateRuleChangeWithNutrition(ruleChangeInput);

    // 基本: 検証処理が完了し、エラーが発生しないこと
    expect(result).toBeDefined();
    expect(result.isValid).toBe(true);

    // ゼロ値処理: 栄養基準値が0の場合、NaN値が生成されないこと
    expect(Number.isNaN(result.normalizedBaselineValue)).toBe(false);
    expect(result.normalizedBaselineValue).toBe(0);

    // 除算エラー防止: 栄養基準値がゼロでも計算処理が正常に完了すること
    expect(result.divisionErrorDetected).toBe(false);

    // ルール変更内容が正しく保存される状態であること
    expect(result.ruleApplied).toBe(true);
    expect(result.appliedRuleId).toBe('rule_20240315_001');
    expect(result.appliedNutrientType).toBe('protein');
    expect(result.appliedBaselineValue).toBe(0);

    // 警告メッセージの有無: 栄養基準値がゼロの場合、警告が記録されること
    expect(result.warnings).toBeDefined();
    expect(Array.isArray(result.warnings)).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toMatch(/基準値/);

    // データベース保存状態: 変更内容が正しく記録される準備状態にあること
    expect(result.persistenceReady).toBe(true);
    expect(result.storagePayload).toEqual({
      ruleId: 'rule_20240315_001',
      seasonPattern: 'spring_2024',
      discountThreshold: 15,
      salePeriodStart: '2024-03-01',
      salePeriodEnd: '2024-03-31',
      nutrientType: 'protein',
      nutrientBaselineValue: 0,
      appliedTimestamp: '2024-03-15T10:30:00Z',
      validationTimestamp: result.storagePayload.validationTimestamp,
    });

    // ログ出力状態: 変更検証の履歴がログに記録されること
    expect(result.auditLog).toBeDefined();
    expect(result.auditLog.action).toBe('VALIDATE_RULE_CHANGE');
    expect(result.auditLog.status).toBe('SUCCESS');
    expect(result.auditLog.nutritionValidationResult).toEqual({
      nutrientType: 'protein',
      baselineValue: 0,
      isZeroValue: true,
      divisionRiskDetected: false,
    });
  });
});