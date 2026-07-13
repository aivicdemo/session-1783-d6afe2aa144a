import { validateMenuConfirmation } from '../../src/logic/it-1-br-2-1-1-1';

describe('献立確定時の全制約条件検証・確定可否判定機能', () => {
  // SCEN-331
  test('定期タイミング自動確定時にも全制約条件の検証が実行される', () => {
    // 前提: 献立にすべての制約条件を満たす食材が設定されている状態
    const menu_id = 'menu_001';
    const scheduled_confirm_time = new Date('2024-01-15T23:59:00Z');
    const is_auto_confirm = true;

    // 制約条件を満たす献立データ
    const valid_menu_data = {
      menu_id,
      status: 'pending_confirmation',
      scheduled_confirm_time,
      is_auto_confirm,
      items: [
        {
          item_id: 'item_001',
          ingredient_name: '鶏むね肉',
          quantity: 200,
          unit: 'g',
          calories: 330,
          protein: 65.5,
          carbs: 0,
          fat: 3.6,
        },
        {
          item_id: 'item_002',
          ingredient_name: 'ブロッコリー',
          quantity: 150,
          unit: 'g',
          calories: 54,
          protein: 5.4,
          carbs: 10.6,
          fat: 0.6,
        },
        {
          item_id: 'item_003',
          ingredient_name: '玄米',
          quantity: 150,
          unit: 'g',
          calories: 198,
          protein: 4.99,
          carbs: 42.3,
          fat: 1.04,
        },
      ],
      family_allergies: ['えび', 'かに'],
      family_dietary_restrictions: [
        { restriction_type: 'low_sodium', max_sodium_mg: 2000 },
      ],
      budget_limit_jpy: 1500,
      cooking_time_limit_minutes: 45,
      inventory_status: {
        item_001: { available: true, quantity: 500 },
        item_002: { available: true, quantity: 300 },
        item_003: { available: true, quantity: 1000 },
      },
    };

    // ハッピーパス: すべての制約条件を満たす献立の自動確定
    const result_valid = validateMenuConfirmation(valid_menu_data);

    expect(result_valid.is_valid).toBe(true);
    expect(result_valid.confirmation_status).toBe('confirmed');
    expect(result_valid.status_after_confirm).toBe('confirmed');
    expect(result_valid.constraint_violations).toEqual([]);
    expect(result_valid.confirmation_method).toBe('auto_scheduled');

    // 栄養制約チェック
    const total_calories = 330 + 54 + 198;
    const total_protein = 65.5 + 5.4 + 4.99;
    const total_carbs = 0 + 10.6 + 42.3;
    const total_fat = 3.6 + 0.6 + 1.04;

    expect(result_valid.nutrition_summary).toEqual({
      total_calories: total_calories,
      total_protein: total_protein,
      total_carbs: total_carbs,
      total_fat: total_fat,
    });

    // 予算制約チェック
    const estimated_cost_jpy = 450; // 仮定: 鶏むね肉200g=300円、ブロッコリー150g=100円、玄米150g=50円
    expect(result_valid.budget_check).toEqual({
      estimated_cost_jpy: estimated_cost_jpy,
      budget_limit_jpy: 1500,
      is_within_budget: true,
    });

    // 調理時間制約チェック
    const estimated_cooking_time_minutes = 35;
    expect(result_valid.cooking_time_check).toEqual({
      estimated_cooking_time_minutes: estimated_cooking_time_minutes,
      cooking_time_limit_minutes: 45,
      is_within_time: true,
    });

    // アレルギー制約チェック
    expect(result_valid.allergy_check).toEqual({
      family_allergies: ['えび', 'かに'],
      items_with_allergens: [],
      has_allergen_conflict: false,
    });

    // 食事制限制約チェック
    expect(result_valid.dietary_restriction_check).toEqual({
      restrictions_to_check: [
        { restriction_type: 'low_sodium', max_sodium_mg: 2000 },
      ],
      violations: [],
      is_compliant: true,
    });

    // 在庫制約チェック
    expect(result_valid.inventory_check).toEqual({
      all_items_available: true,
      unavailable_items: [],
    });

    // 確定ログの記録確認
    expect(result_valid.confirmation_log).toEqual(
      expect.objectContaining({
        menu_id: 'menu_001',
        confirmed_at: expect.any(String),
        confirmation_method: 'auto_scheduled',
        scheduled_confirm_time: scheduled_confirm_time.toISOString(),
        user_id: expect.any(String),
      })
    );

    // エラーケース1: 制約条件違反（栄養バランス不足）
    const invalid_menu_nutrition = {
      ...valid_menu_data,
      status: 'pending_confirmation',
      items: [
        {
          item_id: 'item_001',
          ingredient_name: '鶏むね肉',
          quantity: 50,
          unit: 'g',
          calories: 82.5,
          protein: 16.375,
          carbs: 0,
          fat: 0.9,
        },
      ],
      family_dietary_restrictions: [
        {
          restriction_type: 'minimum_protein_g',
          minimum_protein_g: 40,
        },
      ],
    };

    const result_nutrition_violation = validateMenuConfirmation(
      invalid_menu_nutrition
    );

    expect(result_nutrition_violation.is_valid).toBe(false);
    expect(result_nutrition_violation.confirmation_status).toBe(
      'rejected_constraint_violation'
    );
    expect(result_nutrition_violation.status_after_confirm).toBe(
      'pending_confirmation'
    );
    expect(result_nutrition_violation.constraint_violations).toContainEqual(
      expect.objectContaining({
        violation_type: 'dietary_restriction_violation',
        constraint_name: 'minimum_protein_g',
        required_value: 40,
        actual_value: 16.375,
        severity: 'high',
      })
    );

    // エラーケース2: 制約条件違反（予算超過）
    const invalid_menu_budget = {
      ...valid_menu_data,
      status: 'pending_confirmation',
      budget_limit_jpy: 300,
      items: valid_menu_data.items,
    };

    const result_budget_violation = validateMenuConfirmation(
      invalid_menu_budget
    );

    expect(result_budget_violation.is_valid).toBe(false);
    expect(result_budget_violation.confirmation_status).toBe(
      'rejected_constraint_violation'
    );
    expect(result_budget_violation.constraint_violations).toContainEqual(
      expect.objectContaining({
        violation_type: 'budget_constraint_violation',
        constraint_name: 'budget_limit_jpy',
        required_value: 300,
        actual_value: expect.any(Number),
        severity: 'high',
      })
    );

    // エラーケース3: 制約条件違反（調理時間超過）
    const invalid_menu_cooking_time = {
      ...valid_menu_data,
      status: 'pending_confirmation',
      cooking_time_limit_minutes: 20,
      items: valid_menu_data.items,
    };

    const result_cooking_time_violation = validateMenuConfirmation(
      invalid_menu_cooking_time
    );

    expect(result_cooking_time_violation.is_valid).toBe(false);
    expect(result_cooking_time_violation.confirmation_status).toBe(
      'rejected_constraint_violation'
    );
    expect(result_cooking_time_violation.constraint_violations).toContainEqual(
      expect.objectContaining({
        violation_type: 'cooking_time_constraint_violation',
        constraint_name: 'cooking_time_limit_minutes',
        required_value: 20,
        actual_value: expect.any(Number),
        severity: 'high',
      })
    );

    // エラーケース4: 制約条件違反（アレルギー食材含有）
    const invalid_menu_allergen = {
      ...valid_menu_data,
      status: 'pending_confirmation',
      family_allergies: ['鶏', 'えび'],
      items: [
        {
          item_id: 'item_004',
          ingredient_name: '鶏むね肉',
          quantity: 200,
          unit: 'g',
          calories: 330,
          protein: 65.5,
          carbs: 0,
          fat: 3.6,
          allergens: ['鶏'],
        },
      ],
    };

    const result_allergen_violation = validateMenuConfirmation(
      invalid_menu_allergen
    );

    expect(result_allergen_violation.is_valid).toBe(false);
    expect(result_allergen_violation.confirmation_status).toBe(
      'rejected_constraint_violation'
    );
    expect(result_allergen_violation.constraint_violations).toContainEqual(
      expect.objectContaining({
        violation_type: 'allergen_constraint_violation',
        constraint_name: 'family_allergies',
        conflicting_allergens: ['鶏'],
        severity: 'critical',
      })
    );

    // エラーケース5: 制約条件違反（在庫不足）
    const invalid_menu_inventory = {
      ...valid_menu_data,
      status: 'pending_confirmation',
      inventory_status: {
        item_001: { available: false, quantity: 0 },
        item_002: { available: true, quantity: 300 },
        item_003: { available: true, quantity: 1000 },
      },
    };

    const result_inventory_violation = validateMenuConfirmation(
      invalid_menu_inventory
    );

    expect(result_inventory_violation.is_valid).toBe(false);
    expect(result_inventory_violation.confirmation_status).toBe(
      'rejected_constraint_violation'
    );
    expect(result_inventory_violation.constraint_violations).toContainEqual(
      expect.objectContaining({
        violation_type: 'inventory_constraint_violation',
        constraint_name: 'inventory_status',
        unavailable_items: ['item_001'],
        severity: 'high',
      })
    );

    // エラーケース6: 複数制約条件違反
    const invalid_menu_multiple = {
      ...valid_menu_data,
      status: 'pending_confirmation',
      budget_limit_jpy: 100,
      cooking_time_limit_minutes: 10,
      family_allergies: ['ブロッコリー'],
    };

    const result_multiple_violations = validateMenuConfirmation(
      invalid_menu_multiple
    );

    expect(result_multiple_violations.is_valid).toBe(false);
    expect(result_multiple_violations.confirmation_status).toBe(
      'rejected_constraint_violation'
    );
    expect(result_multiple_violations.constraint_violations.length).toBeGreaterThan(
      1
    );
    expect(result_multiple_violations.constraint_violations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          violation_type: expect.stringMatching(
            /budget_constraint_violation|cooking_time_constraint_violation|allergen_constraint_violation/
          ),
        }),
      ])
    );

    // エラーケース7: 手動確定と自動確定が同じ検証ルール適用
    const result_manual_confirm_same_logic = validateMenuConfirmation({
      ...valid_menu_data,
      is_auto_confirm: false,
      confirmation_method: 'manual',
    });

    expect(result_manual_confirm_same_logic.is_valid).toBe(true);
    expect(result_manual_confirm_same_logic.confirmation_status).toBe(
      'confirmed'
    );
    expect(result_manual_confirm_same_logic.constraint_violations).toEqual([]);

    // エラーケース8: 同じ検証ルール適用の確認（手動でも自動でも違反は違反）
    const result_manual_invalid_same_rule = validateMenuConfirmation({
      ...invalid_menu_budget,
      is_auto_confirm: false,
      confirmation_method: 'manual',
    });

    expect(result_manual_invalid_same_rule.is_valid).toBe(false);
    expect(result_manual_invalid_same_rule.confirmation_status).toBe(
      'rejected_constraint_violation'
    );

    // エラー: 必須フィールド不足時の例外処理
    expect(() => {
      validateMenuConfirmation({
        menu_id: 'test',
        status: 'pending_confirmation',
        // scheduled_confirm_time が未設定 - エラーあるべき場合のみ
      } as any);
    }).toThrow(/献立ID/);

    // エラー: ステータスが不正な場合
    expect(() => {
      validateMenuConfirmation({
        menu_id: 'menu_002',
        status: 'invalid_status',
        scheduled_confirm_time: new Date('2024-01-15T23:59:00Z'),
        is_auto_confirm: true,
        items: [],
        family_allergies: [],
        family_dietary_restrictions: [],
        budget_limit_jpy: 1500,
        cooking_time_limit_minutes: 45,
        inventory_status: {},
      } as any);
    }).toThrow(/ステータス/);
  });
});