import { detectDataInconsistencies } from '../../src/logic/it-8-1-2-1';

describe('献立生成フロー内の制約条件入力パターンと離脱ポイント自動抽出', () => {
  // SCEN-334
  test('should detect all inconsistencies when multiple contradictions exist between interview records and log data', () => {
    const interview_record = {
      user_id: 'user_001',
      interview_date: '2024-01-15T10:00:00Z',
      cooking_time_preference_minutes: 30,
      budget_constraint_yen_per_month: 50000,
      family_size: 4,
      allergy_items: ['eggs', 'milk'],
      dietary_restrictions: ['vegetarian'],
      preferred_cuisine: 'Japanese',
      statement: 'I can cook in 30 minutes and want to keep budget under 50k yen'
    };

    const log_data = {
      user_id: 'user_001',
      period_start: '2024-01-08T00:00:00Z',
      period_end: '2024-01-14T23:59:59Z',
      actual_cooking_time_minutes: 60,
      actual_budget_yen_total: 65000,
      family_members_count: 5,
      ingredients_used: ['eggs', 'chicken', 'milk'],
      meal_categories: ['non_vegetarian'],
      cuisine_type: 'Italian',
      generated_menu_count: 3,
      accepted_menu_count: 1,
      rejected_reason_list: ['予算超過', '調理時間超過', '食材制限違反']
    };

    const result = detectDataInconsistencies({
      interview_record,
      log_data
    });

    // 期待: 複数の矛盾が検出される
    // 矛盾点:
    // 1. cooking_time_preference_minutes (30) vs actual_cooking_time_minutes (60) - 差分: 30分
    // 2. budget_constraint_yen_per_month (50000) vs actual_budget_yen_total (65000) - 差分: 15000円
    // 3. family_size (4) vs family_members_count (5) - 差分: 1人
    // 4. allergy_items (eggs, milk) vs ingredients_used (eggs, chicken, milk) - chicken は言及なし
    // 5. dietary_restrictions (vegetarian) vs meal_categories (non_vegetarian) - 直接矛盾
    // 6. preferred_cuisine (Japanese) vs cuisine_type (Italian) - 直接矛盾

    expect(Array.isArray(result.inconsistencies)).toBe(true);
    expect(result.inconsistencies.length).toBe(6);

    // 矛盾1: 調理時間差異
    const cooking_time_inconsistency = result.inconsistencies.find(
      (inc: any) => inc.inconsistency_category === 'cooking_time_mismatch'
    );
    expect(cooking_time_inconsistency).toBeDefined();
    expect(cooking_time_inconsistency.location).toBe('cooking_time_preference_minutes');
    expect(cooking_time_inconsistency.interview_value).toBe(30);
    expect(cooking_time_inconsistency.log_value).toBe(60);
    expect(cooking_time_inconsistency.variance).toBe(30);
    expect(cooking_time_inconsistency.severity_level).toBe('high');

    // 矛盾2: 予算差異
    const budget_inconsistency = result.inconsistencies.find(
      (inc: any) => inc.inconsistency_category === 'budget_mismatch'
    );
    expect(budget_inconsistency).toBeDefined();
    expect(budget_inconsistency.location).toBe('budget_constraint_yen_per_month');
    expect(budget_inconsistency.interview_value).toBe(50000);
    expect(budget_inconsistency.log_value).toBe(65000);
    expect(budget_inconsistency.variance).toBe(15000);
    expect(budget_inconsistency.severity_level).toBe('high');

    // 矛盾3: 家族人数差異
    const family_size_inconsistency = result.inconsistencies.find(
      (inc: any) => inc.inconsistency_category === 'family_size_mismatch'
    );
    expect(family_size_inconsistency).toBeDefined();
    expect(family_size_inconsistency.location).toBe('family_size');
    expect(family_size_inconsistency.interview_value).toBe(4);
    expect(family_size_inconsistency.log_value).toBe(5);
    expect(family_size_inconsistency.variance).toBe(1);
    expect(family_size_inconsistency.severity_level).toBe('medium');

    // 矛盾4: アレルギー食材の使用
    const allergy_inconsistency = result.inconsistencies.find(
      (inc: any) => inc.inconsistency_category === 'undeclared_ingredient_used'
    );
    expect(allergy_inconsistency).toBeDefined();
    expect(allergy_inconsistency.location).toBe('allergy_items');
    expect(allergy_inconsistency.detail).toBe('chicken is used but not mentioned in allergy/preference');
    expect(allergy_inconsistency.severity_level).toBe('high');

    // 矛盾5: 食事制限と実績の矛盾
    const dietary_inconsistency = result.inconsistencies.find(
      (inc: any) => inc.inconsistency_category === 'dietary_restriction_mismatch'
    );
    expect(dietary_inconsistency).toBeDefined();
    expect(dietary_inconsistency.location).toBe('dietary_restrictions');
    expect(dietary_inconsistency.interview_value).toBe('vegetarian');
    expect(dietary_inconsistency.log_value).toBe('non_vegetarian');
    expect(dietary_inconsistency.severity_level).toBe('high');

    // 矛盾6: 料理タイプの不一致
    const cuisine_inconsistency = result.inconsistencies.find(
      (inc: any) => inc.inconsistency_category === 'cuisine_preference_mismatch'
    );
    expect(cuisine_inconsistency).toBeDefined();
    expect(cuisine_inconsistency.location).toBe('preferred_cuisine');
    expect(cuisine_inconsistency.interview_value).toBe('Japanese');
    expect(cuisine_inconsistency.log_value).toBe('Italian');
    expect(cuisine_inconsistency.severity_level).toBe('medium');

    // 矛盾リストがソートされているか確認（優先度順）
    const severity_order = result.inconsistencies.map((inc: any) => inc.severity_level);
    const high_count = severity_order.filter((s: string) => s === 'high').length;
    const medium_count = severity_order.filter((s: string) => s === 'medium').length;
    expect(high_count).toBe(4);
    expect(medium_count).toBe(2);

    // ソート確認: 'high' が前に来る
    const first_high_index = severity_order.findIndex((s: string) => s === 'high');
    const first_medium_index = severity_order.findIndex((s: string) => s === 'medium');
    expect(first_high_index).toBeLessThan(first_medium_index);

    // 各矛盾に必須フィールドが含まれているか確認
    result.inconsistencies.forEach((inc: any) => {
      expect(inc).toHaveProperty('inconsistency_id');
      expect(inc).toHaveProperty('inconsistency_category');
      expect(inc).toHaveProperty('location');
      expect(inc).toHaveProperty('severity_level');
      expect(inc).toHaveProperty('detected_timestamp');
      expect(typeof inc.inconsistency_id).toBe('string');
      expect(typeof inc.detected_timestamp).toBe('string');
    });

    // 結果メタデータの確認
    expect(result).toHaveProperty('total_inconsistencies_count');
    expect(result.total_inconsistencies_count).toBe(6);
    expect(result).toHaveProperty('analysis_timestamp');
    expect(result).toHaveProperty('data_reliability_score');
    expect(typeof result.data_reliability_score).toBe('number');
    expect(result.data_reliability_score).toBeGreaterThanOrEqual(0);
    expect(result.data_reliability_score).toBeLessThanOrEqual(100);

    // 信頼度スコアが矛盾の重大度に基づいて低下していることを確認
    // 高重大度の矛盾が4件あるため、信頼度は低くなるはず
    expect(result.data_reliability_score).toBeLessThan(50);
  });
});