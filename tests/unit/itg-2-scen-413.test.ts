import { processMultipleRestrictionConditions } from '../../src/logic/it-1-br-2-1-1-1';

describe('ユーザーの食事記録と栄養摂取量の推移データを自動集計し、栄養項目別の達成度と改善ギャップを可視化するダッシュボード機能', () => {
  // SCEN-413
  test('複数の食事制限条件（アレルギー、栄養制限、調理時間制限）を同時入力した場合、優先度順に処理される', () => {
    // 入力データ: 複数の制限条件を同時に送信
    const restrictionInput = {
      userId: 'user_001',
      timestamp: new Date('2024-01-15T14:30:00Z'),
      restrictions: [
        {
          type: 'allergen',
          conditions: ['egg', 'dairy'],
          priority: 1
        },
        {
          type: 'nutrition',
          conditions: ['low_sodium', 'low_carb'],
          priority: 2
        },
        {
          type: 'cookingTime',
          conditions: ['within_30min'],
          priority: 3
        }
      ]
    };

    // メニュー候補データ（テスト用）
    const menuCandidates = [
      {
        id: 'menu_001',
        name: 'vegetable_salad',
        allergens: [],
        nutrition: { sodium: 300, carbs: 15 },
        cookingTime: 10
      },
      {
        id: 'menu_002',
        name: 'egg_pasta',
        allergens: ['egg'],
        nutrition: { sodium: 400, carbs: 50 },
        cookingTime: 25
      },
      {
        id: 'menu_003',
        name: 'cheese_omelette',
        allergens: ['egg', 'dairy'],
        nutrition: { sodium: 500, carbs: 20 },
        cookingTime: 20
      },
      {
        id: 'menu_004',
        name: 'grilled_fish',
        allergens: [],
        nutrition: { sodium: 250, carbs: 5 },
        cookingTime: 30
      },
      {
        id: 'menu_005',
        name: 'rice_bowl_high_sugar',
        allergens: [],
        nutrition: { sodium: 600, carbs: 80 },
        cookingTime: 15
      }
    ];

    // 関数実行
    const result = processMultipleRestrictionConditions(restrictionInput, menuCandidates);

    // 期待値: 複数制限条件が優先度順に処理されて、全条件を満たすメニューのみが抽出される
    // 優先度: アレルギー（優先度1） > 栄養制限（優先度2） > 調理時間制限（優先度3）
    
    // アレルギーフィルタ（egg, dairy を除外）：menu_001, menu_004, menu_005 が候補
    // 栄養制限フィルタ（低塩分≤350, 低炭水化物≤40）：menu_001, menu_004 が候補
    // 調理時間制限フィルタ（30分以内）：menu_001, menu_004 が候補
    // 最終結果：menu_001, menu_004 が合致

    expect(result).toEqual({
      userId: 'user_001',
      processedAt: new Date('2024-01-15T14:30:00Z'),
      restrictionCount: 3,
      priorityOrder: [
        { type: 'allergen', priority: 1 },
        { type: 'nutrition', priority: 2 },
        { type: 'cookingTime', priority: 3 }
      ],
      filteredMenus: [
        {
          id: 'menu_001',
          name: 'vegetable_salad',
          allergens: [],
          nutrition: { sodium: 300, carbs: 15 },
          cookingTime: 10,
          meetsAllConditions: true
        },
        {
          id: 'menu_004',
          name: 'grilled_fish',
          allergens: [],
          nutrition: { sodium: 250, carbs: 5 },
          cookingTime: 30,
          meetsAllConditions: true
        }
      ],
      exclusionReasons: [
        { menuId: 'menu_002', reason: 'allergen_match', matchedAllergens: ['egg'] },
        { menuId: 'menu_003', reason: 'allergen_match', matchedAllergens: ['egg', 'dairy'] },
        { menuId: 'menu_005', reason: 'nutrition_violation', violatedNutrients: ['sodium', 'carbs'] }
      ],
      totalMenusEvaluated: 5,
      totalMenusFiltered: 2,
      filteringSuccessRate: 0.4
    });

    // 追加検証: 優先度順処理の確認
    expect(result.priorityOrder[0].type).toBe('allergen');
    expect(result.priorityOrder[0].priority).toBe(1);
    expect(result.priorityOrder[1].type).toBe('nutrition');
    expect(result.priorityOrder[1].priority).toBe(2);
    expect(result.priorityOrder[2].type).toBe('cookingTime');
    expect(result.priorityOrder[2].priority).toBe(3);

    // 追加検証: フィルタリング結果が全条件を満たすことを確認
    result.filteredMenus.forEach(menu => {
      expect(menu.meetsAllConditions).toBe(true);
      // アレルギー条件チェック
      expect(menu.allergens).not.toContain('egg');
      expect(menu.allergens).not.toContain('dairy');
      // 栄養制限チェック
      expect(menu.nutrition.sodium).toBeLessThanOrEqual(350);
      expect(menu.nutrition.carbs).toBeLessThanOrEqual(40);
      // 調理時間チェック
      expect(menu.cookingTime).toBeLessThanOrEqual(30);
    });

    // 追加検証: 除外されたメニューの理由が正確に記録されていることを確認
    expect(result.exclusionReasons.length).toBe(3);
    expect(result.exclusionReasons).toContainEqual({
      menuId: 'menu_002',
      reason: 'allergen_match',
      matchedAllergens: ['egg']
    });
    expect(result.exclusionReasons).toContainEqual({
      menuId: 'menu_003',
      reason: 'allergen_match',
      matchedAllergens: ['egg', 'dairy']
    });
    expect(result.exclusionReasons).toContainEqual({
      menuId: 'menu_005',
      reason: 'nutrition_violation',
      violatedNutrients: ['sodium', 'carbs']
    });

    // 追加検証: 統計情報が正確に計算されていることを確認
    expect(result.totalMenusEvaluated).toBe(5);
    expect(result.totalMenusFiltered).toBe(2);
    expect(result.filteringSuccessRate).toBe(0.4);
  });
});