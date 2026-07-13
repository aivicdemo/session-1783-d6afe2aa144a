import { processMutipleDietaryRestrictions } from '../../src/logic/it-1-br-2-1-1-1';

describe('ユーザーの食事記録と栄養摂取量の推移データを自動集計し、栄養項目別の達成度と改善ギャップを可視化するダッシュボード機能', () => {
  // SCEN-416
  test('複数制限条件同時入力処理機能 - 優先度の定義が欠落している制限条件がある場合、エラーで処理中断または予備優先度ロジックが適用される', () => {
    // ハッピーパス: 優先度が欠落している場合に予備優先度ロジックが自動適用される
    const input_with_missing_priority = {
      userId: 'user_001',
      timestamp: '2024-01-15T10:00:00Z',
      restrictions: [
        {
          restrictionId: 'r_001',
          type: 'allergen',
          value: 'egg',
          priority: 1,
        },
        {
          restrictionId: 'r_002',
          type: 'nutrition_limit',
          value: 'sodium_below_2000mg',
          priority: undefined,
        },
        {
          restrictionId: 'r_003',
          type: 'cooking_time',
          value: 'below_30minutes',
          priority: 3,
        },
      ],
    };

    const result = processMutipleDietaryRestrictions(input_with_missing_priority);

    expect(result).toEqual({
      success: true,
      restrictions_processed: [
        {
          restrictionId: 'r_001',
          type: 'allergen',
          value: 'egg',
          priority: 1,
          applied: true,
        },
        {
          restrictionId: 'r_002',
          type: 'nutrition_limit',
          value: 'sodium_below_2000mg',
          priority: 2,
          applied: true,
        },
        {
          restrictionId: 'r_003',
          type: 'cooking_time',
          value: 'below_30minutes',
          priority: 3,
          applied: true,
        },
      ],
      fallback_priority_applied: true,
      processed_count: 3,
      timestamp: '2024-01-15T10:00:00Z',
    });
  });

  test('複数制限条件同時入力処理機能 - すべての制限条件に優先度が明示的に設定されている場合、すべて正常に適用される', () => {
    const input_with_all_priorities = {
      userId: 'user_002',
      timestamp: '2024-01-16T11:30:00Z',
      restrictions: [
        {
          restrictionId: 'r_101',
          type: 'allergen',
          value: 'peanut',
          priority: 1,
        },
        {
          restrictionId: 'r_102',
          type: 'nutrition_limit',
          value: 'sugar_below_50g',
          priority: 2,
        },
        {
          restrictionId: 'r_103',
          type: 'budget',
          value: 'below_5000yen',
          priority: 3,
        },
      ],
    };

    const result = processMutipleDietaryRestrictions(input_with_all_priorities);

    expect(result).toEqual({
      success: true,
      restrictions_processed: [
        {
          restrictionId: 'r_101',
          type: 'allergen',
          value: 'peanut',
          priority: 1,
          applied: true,
        },
        {
          restrictionId: 'r_102',
          type: 'nutrition_limit',
          value: 'sugar_below_50g',
          priority: 2,
          applied: true,
        },
        {
          restrictionId: 'r_103',
          type: 'budget',
          value: 'below_5000yen',
          priority: 3,
          applied: true,
        },
      ],
      fallback_priority_applied: false,
      processed_count: 3,
      timestamp: '2024-01-16T11:30:00Z',
    });
  });

  test('複数制限条件同時入力処理機能 - 複数の制限条件の優先度が欠落している場合、予備優先度ロジックが連続して適用される', () => {
    const input_with_multiple_missing_priorities = {
      userId: 'user_003',
      timestamp: '2024-01-17T14:00:00Z',
      restrictions: [
        {
          restrictionId: 'r_201',
          type: 'allergen',
          value: 'milk',
          priority: 1,
        },
        {
          restrictionId: 'r_202',
          type: 'nutrition_limit',
          value: 'calcium_above_600mg',
          priority: undefined,
        },
        {
          restrictionId: 'r_203',
          type: 'cooking_time',
          value: 'below_45minutes',
          priority: undefined,
        },
        {
          restrictionId: 'r_204',
          type: 'budget',
          value: 'below_3000yen',
          priority: 4,
        },
      ],
    };

    const result = processMutipleDietaryRestrictions(input_with_multiple_missing_priorities);

    expect(result).toEqual({
      success: true,
      restrictions_processed: [
        {
          restrictionId: 'r_201',
          type: 'allergen',
          value: 'milk',
          priority: 1,
          applied: true,
        },
        {
          restrictionId: 'r_202',
          type: 'nutrition_limit',
          value: 'calcium_above_600mg',
          priority: 2,
          applied: true,
        },
        {
          restrictionId: 'r_203',
          type: 'cooking_time',
          value: 'below_45minutes',
          priority: 3,
          applied: true,
        },
        {
          restrictionId: 'r_204',
          type: 'budget',
          value: 'below_3000yen',
          priority: 4,
          applied: true,
        },
      ],
      fallback_priority_applied: true,
      processed_count: 4,
      timestamp: '2024-01-17T14:00:00Z',
    });
  });

  test('複数制限条件同時入力処理機能 - 制限条件配列が空の場合、成功且つ処理対象ゼロとなる', () => {
    const input_with_empty_restrictions = {
      userId: 'user_004',
      timestamp: '2024-01-18T09:15:00Z',
      restrictions: [],
    };

    const result = processMutipleDietaryRestrictions(input_with_empty_restrictions);

    expect(result).toEqual({
      success: true,
      restrictions_processed: [],
      fallback_priority_applied: false,
      processed_count: 0,
      timestamp: '2024-01-18T09:15:00Z',
    });
  });

  test('複数制限条件同時入力処理機能 - 制限条件の必須フィールド（restrictionId, type, value）が欠落している場合、エラーで処理中断', () => {
    const input_with_missing_required_field = {
      userId: 'user_005',
      timestamp: '2024-01-19T15:45:00Z',
      restrictions: [
        {
          restrictionId: 'r_301',
          type: 'allergen',
          value: 'shellfish',
          priority: 1,
        },
        {
          restrictionId: undefined,
          type: 'nutrition_limit',
          value: 'iron_above_8mg',
          priority: 2,
        },
      ],
    };

    expect(() => {
      processMutipleDietaryRestrictions(input_with_missing_required_field);
    }).toThrow(/restrictionId/);
  });

  test('複数制限条件同時入力処理機能 - userId または timestamp が欠落している場合、エラーで処理中断', () => {
    const input_with_missing_userid = {
      timestamp: '2024-01-20T12:00:00Z',
      restrictions: [
        {
          restrictionId: 'r_401',
          type: 'allergen',
          value: 'soy',
          priority: 1,
        },
      ],
    };

    expect(() => {
      processMutipleDietaryRestrictions(input_with_missing_userid as any);
    }).toThrow(/userId/);
  });

  test('複数制限条件同時入力処理機能 - 優先度が0未満または文字列などの無効な型である場合、エラーで処理中断', () => {
    const input_with_invalid_priority_type = {
      userId: 'user_006',
      timestamp: '2024-01-21T10:30:00Z',
      restrictions: [
        {
          restrictionId: 'r_501',
          type: 'allergen',
          value: 'wheat',
          priority: 'high',
        },
      ],
    };

    expect(() => {
      processMutipleDietaryRestrictions(input_with_invalid_priority_type as any);
    }).toThrow(/priority/);
  });

  test('複数制限条件同時入力処理機能 - 優先度が 0 で明示的に設定されている場合、予備優先度ロジックは不適用で値がそのまま保持される', () => {
    const input_with_explicit_zero_priority = {
      userId: 'user_007',
      timestamp: '2024-01-22T16:20:00Z',
      restrictions: [
        {
          restrictionId: 'r_601',
          type: 'allergen',
          value: 'fish',
          priority: 0,
        },
        {
          restrictionId: 'r_602',
          type: 'budget',
          value: 'below_6000yen',
          priority: 2,
        },
      ],
    };

    const result = processMutipleDietaryRestrictions(input_with_explicit_zero_priority);

    expect(result).toEqual({
      success: true,
      restrictions_processed: [
        {
          restrictionId: 'r_601',
          type: 'allergen',
          value: 'fish',
          priority: 0,
          applied: true,
        },
        {
          restrictionId: 'r_602',
          type: 'budget',
          value: 'below_6000yen',
          priority: 2,
          applied: true,
        },
      ],
      fallback_priority_applied: false,
      processed_count: 2,
      timestamp: '2024-01-22T16:20:00Z',
    });
  });
});