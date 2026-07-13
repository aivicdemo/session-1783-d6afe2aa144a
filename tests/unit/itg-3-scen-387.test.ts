import { classifyPainFactors } from '../../src/logic/it-1';

describe('月次食費実績の超過要因分析機能', () => {
  // SCEN-387: [normal] ペイン要因自動分類機能 - 離脱ポイントと入力制約条件パターンからペイン要因が正しく分類される
  test('SCEN-387: 複数の離脱ポイントと入力制約条件パターンの組み合わせから、ペイン要因が正しく自動分類される', () => {
    // テストデータ準備: 離脱ポイント + 入力制約条件パターンの組み合わせ

    // パターン1: 予算超過時 + 必須項目未入力
    const pattern1_input = {
      exit_point: 'budget_exceeded',
      constraint_pattern: 'mandatory_field_missing',
      user_id: 'user_001',
      family_id: 'family_001',
      timestamp: new Date('2024-01-15T10:30:00Z'),
      input_value: '',
      field_name: 'monthly_budget',
    };

    const pattern1_result = classifyPainFactors(pattern1_input);
    expect(pattern1_result).toEqual({
      exit_point: 'budget_exceeded',
      constraint_pattern: 'mandatory_field_missing',
      pain_factor_category: 'input_incomplete',
      priority: 1,
      classification_timestamp: expect.any(Date),
    });

    // パターン2: 入力フォーム途中 + データ型不正
    const pattern2_input = {
      exit_point: 'form_midway',
      constraint_pattern: 'invalid_data_type',
      user_id: 'user_002',
      family_id: 'family_002',
      timestamp: new Date('2024-01-15T11:00:00Z'),
      input_value: 'not_a_number',
      field_name: 'meal_count',
    };

    const pattern2_result = classifyPainFactors(pattern2_input);
    expect(pattern2_result).toEqual({
      exit_point: 'form_midway',
      constraint_pattern: 'invalid_data_type',
      pain_factor_category: 'data_validation_error',
      priority: 2,
      classification_timestamp: expect.any(Date),
    });

    // パターン3: 決済エラー + 上限値超過
    const pattern3_input = {
      exit_point: 'payment_error',
      constraint_pattern: 'limit_exceeded',
      user_id: 'user_003',
      family_id: 'family_003',
      timestamp: new Date('2024-01-15T11:30:00Z'),
      input_value: 500000,
      field_name: 'monthly_food_budget',
    };

    const pattern3_result = classifyPainFactors(pattern3_input);
    expect(pattern3_result).toEqual({
      exit_point: 'payment_error',
      constraint_pattern: 'limit_exceeded',
      pain_factor_category: 'budget_constraint_violation',
      priority: 3,
      classification_timestamp: expect.any(Date),
    });

    // パターン4: 献立提案却下 + 複数制約競合
    const pattern4_input = {
      exit_point: 'menu_rejection',
      constraint_pattern: 'multiple_constraint_conflict',
      user_id: 'user_004',
      family_id: 'family_004',
      timestamp: new Date('2024-01-15T12:00:00Z'),
      input_value: null,
      field_name: 'meal_plan',
    };

    const pattern4_result = classifyPainFactors(pattern4_input);
    expect(pattern4_result).toEqual({
      exit_point: 'menu_rejection',
      constraint_pattern: 'multiple_constraint_conflict',
      pain_factor_category: 'conflicting_constraints',
      priority: 2,
      classification_timestamp: expect.any(Date),
    });

    // パターン5: アレルギー確認エラー + 必須項目未入力
    const pattern5_input = {
      exit_point: 'allergy_verification_error',
      constraint_pattern: 'mandatory_field_missing',
      user_id: 'user_005',
      family_id: 'family_005',
      timestamp: new Date('2024-01-15T12:30:00Z'),
      input_value: '',
      field_name: 'allergy_items',
    };

    const pattern5_result = classifyPainFactors(pattern5_input);
    expect(pattern5_result).toEqual({
      exit_point: 'allergy_verification_error',
      constraint_pattern: 'mandatory_field_missing',
      pain_factor_category: 'input_incomplete',
      priority: 1,
      classification_timestamp: expect.any(Date),
    });

    // 分類ログの整合性検証: すべての分類結果がカテゴリに適切に割り当てられているか
    const all_results = [
      pattern1_result,
      pattern2_result,
      pattern3_result,
      pattern4_result,
      pattern5_result,
    ];

    // すべての結果が有効なペイン要因カテゴリを保持していることを確認
    const valid_categories = [
      'input_incomplete',
      'data_validation_error',
      'budget_constraint_violation',
      'conflicting_constraints',
      'system_error',
    ];

    all_results.forEach((result) => {
      expect(valid_categories).toContain(result.pain_factor_category);
    });

    // 優先度スコア（0-3）が正しく割り当てられているか
    all_results.forEach((result) => {
      expect(result.priority).toBeGreaterThanOrEqual(1);
      expect(result.priority).toBeLessThanOrEqual(3);
    });

    // 各分類結果の離脱ポイントが入力と一致しているか
    expect(pattern1_result.exit_point).toBe('budget_exceeded');
    expect(pattern2_result.exit_point).toBe('form_midway');
    expect(pattern3_result.exit_point).toBe('payment_error');
    expect(pattern4_result.exit_point).toBe('menu_rejection');
    expect(pattern5_result.exit_point).toBe('allergy_verification_error');

    // 各分類結果の制約条件パターンが入力と一致しているか
    expect(pattern1_result.constraint_pattern).toBe('mandatory_field_missing');
    expect(pattern2_result.constraint_pattern).toBe('invalid_data_type');
    expect(pattern3_result.constraint_pattern).toBe('limit_exceeded');
    expect(pattern4_result.constraint_pattern).toBe('multiple_constraint_conflict');
    expect(pattern5_result.constraint_pattern).toBe('mandatory_field_missing');

    // 分類タイムスタンプがテスト実行時刻より前後しないこと
    const now = new Date();
    all_results.forEach((result) => {
      expect(result.classification_timestamp.getTime()).toBeLessThanOrEqual(now.getTime() + 5000);
      expect(result.classification_timestamp.getTime()).toBeGreaterThan(
        new Date('2024-01-15T00:00:00Z').getTime(),
      );
    });
  });
});