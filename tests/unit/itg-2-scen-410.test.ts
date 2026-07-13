import { detectDietaryRestrictionConflicts, validateMenuAgainstRestrictions, generateNextWeekMenuWithRestrictions, saveFinalMenu } from '../../src/logic/it-1-br-2-1-1-1';

describe('ユーザーの食事記録と栄養摂取量の推移データを自動集計し、栄養項目別の達成度と改善ギャップを可視化するダッシュボード機能', () => {
  // SCEN-410: [normal] 制限条件抵触検出と献立反映統合機能
  test('SCEN-410: 食事制限条件入力後、抵触パターン検出から次週献立生成への反映まで一連の処理が正常に実行される', () => {
    // ========== 前提条件 ==========
    // 既存献立データ: 過去2週間の献立履歴
    const existingMenus = [
      {
        id: 'menu_001',
        date: '2024-01-08',
        dishes: [
          { dishId: 'dish_egg_001', dishName: '卵焼き', salt_g: 1.2, contains_egg: true },
          { dishId: 'dish_salt_001', dishName: '塩辛い漬物', salt_g: 3.5, contains_egg: false },
        ],
        totalSalt_g: 4.7,
      },
      {
        id: 'menu_002',
        date: '2024-01-15',
        dishes: [
          { dishId: 'dish_safe_001', dishName: 'サラダ', salt_g: 0.8, contains_egg: false },
          { dishId: 'dish_chicken_001', dishName: '鶏胸肉のソテー', salt_g: 1.2, contains_egg: false },
        ],
        totalSalt_g: 2.0,
      },
    ];

    // 新規入力制限条件
    const newRestriction = {
      restrictionId: 'rest_001',
      userId: 'user_001',
      type: 'salt',
      limit_g: 2.0,
      validFrom: '2024-01-22',
      priority: 1,
    };

    const allergyRestriction = {
      restrictionId: 'rest_002',
      userId: 'user_001',
      type: 'allergen',
      allergen: 'egg',
      validFrom: '2024-01-22',
      priority: 1,
    };

    // ========== Step 1: 制限条件抵触パターン検出 ==========
    // 入力パラメータ
    const conflictDetectionParams = {
      existingMenus: existingMenus,
      newRestrictions: [newRestriction, allergyRestriction],
      userId: 'user_001',
    };

    const conflictResult = detectDietaryRestrictionConflicts(conflictDetectionParams);

    // 期待値の検証: 抵触パターン検出
    // menu_001は塩分が4.7g（制限2.0g超過）でかつ卵を含む → 2件抵触
    // menu_002は塩分が2.0g（制限内）で卵なし → 抵触なし
    expect(conflictResult).toEqual({
      userId: 'user_001',
      newRestrictions: [newRestriction, allergyRestriction],
      conflictingMenus: [
        {
          menuId: 'menu_001',
          date: '2024-01-08',
          conflicts: [
            {
              type: 'salt',
              actual_g: 4.7,
              limit_g: 2.0,
              violationAmount_g: 2.7,
              severity: 'high',
              conflictingDishes: ['卵焼き', '塩辛い漬物'],
            },
            {
              type: 'allergen',
              allergen: 'egg',
              severity: 'high',
              conflictingDishes: ['卵焼き'],
            },
          ],
          riskScore: 10,
        },
      ],
      nonConflictingMenus: [
        {
          menuId: 'menu_002',
          date: '2024-01-15',
          totalSalt_g: 2.0,
        },
      ],
      detectionTimestamp: expect.any(String),
    });

    // ========== Step 2: 抵触検出結果の詳細確認 ==========
    const detailReviewParams = {
      userId: 'user_001',
      conflictingMenuId: 'menu_001',
      restrictionId: 'rest_001',
    };

    // この結果をユーザーが確認する想定
    const conflictDetailsForReview = conflictResult.conflictingMenus[0];
    expect(conflictDetailsForReview.riskScore).toBeGreaterThanOrEqual(9);
    expect(conflictDetailsForReview.conflicts.length).toBe(2);
    expect(conflictDetailsForReview.conflicts[0].severity).toBe('high');

    // ========== Step 3: 次週献立生成（新規制限条件を反映） ==========
    // 生成対象期間
    const menuGenerationParams = {
      userId: 'user_001',
      generationWeek: '2024-01-22',
      restrictions: [newRestriction, allergyRestriction],
      existingMenus: existingMenus,
      familyMembers: [
        {
          memberId: 'member_001',
          name: '主人',
          age: 45,
          preferences: ['鶏肉', 'サラダ'],
        },
        {
          memberId: 'member_002',
          name: '妻',
          age: 43,
          preferences: ['魚', '野菜'],
        },
      ],
      budget_jpy: 15000,
    };

    const generatedMenus = generateNextWeekMenuWithRestrictions(menuGenerationParams);

    // 期待値の検証: 生成された献立が制限条件を満たすこと
    expect(generatedMenus).toEqual({
      userId: 'user_001',
      generationWeek: '2024-01-22',
      menus: [
        {
          date: '2024-01-22',
          menuId: expect.stringMatching(/^menu_/),
          dishes: expect.any(Array),
          totalSalt_g: expect.any(Number),
          containsEgg: false,
          estimatedBudget_jpy: expect.any(Number),
          satisfactionScore: expect.any(Number),
        },
        {
          date: '2024-01-23',
          menuId: expect.stringMatching(/^menu_/),
          dishes: expect.any(Array),
          totalSalt_g: expect.any(Number),
          containsEgg: false,
          estimatedBudget_jpy: expect.any(Number),
          satisfactionScore: expect.any(Number),
        },
        {
          date: '2024-01-24',
          menuId: expect.stringMatching(/^menu_/),
          dishes: expect.any(Array),
          totalSalt_g: expect.any(Number),
          containsEgg: false,
          estimatedBudget_jpy: expect.any(Number),
          satisfactionScore: expect.any(Number),
        },
        {
          date: '2024-01-25',
          menuId: expect.stringMatching(/^menu_/),
          dishes: expect.any(Array),
          totalSalt_g: expect.any(Number),
          containsEgg: false,
          estimatedBudget_jpy: expect.any(Number),
          satisfactionScore: expect.any(Number),
        },
        {
          date: '2024-01-26',
          menuId: expect.stringMatching(/^menu_/),
          dishes: expect.any(Array),
          totalSalt_g: expect.any(Number),
          containsEgg: false,
          estimatedBudget_jpy: expect.any(Number),
          satisfactionScore: expect.any(Number),
        },
        {
          date: '2024-01-27',
          menuId: expect.stringMatching(/^menu_/),
          dishes: expect.any(Array),
          totalSalt_g: expect.any(Number),
          containsEgg: false,
          estimatedBudget_jpy: expect.any(Number),
          satisfactionScore: expect.any(Number),
        },
        {
          date: '2024-01-28',
          menuId: expect.stringMatching(/^menu_/),
          dishes: expect.any(Array),
          totalSalt_g: expect.any(Number),
          containsEgg: false,
          estimatedBudget_jpy: expect.any(Number),
          satisfactionScore: expect.any(Number),
        },
      ],
      totalWeeklyBudget_jpy: expect.any(Number),
      generationTimestamp: expect.any(String),
    });

    // 各メニューの詳細検証
    generatedMenus.menus.forEach((menu) => {
      // 塩分制限の遵守確認（2.0g以下）
      expect(menu.totalSalt_g).toBeLessThanOrEqual(2.0);
      // 卵アレルギー対応の確認
      expect(menu.containsEgg).toBe(false);
      // 予算上限内の確認
      expect(menu.estimatedBudget_jpy).toBeLessThanOrEqual(menuGenerationParams.budget_jpy / 7);
    });

    // ========== Step 4: 献立の検証（制限条件充足確認） ==========
    const validationParams = {
      userId: 'user_001',
      menus: generatedMenus.menus,
      restrictions: [newRestriction, allergyRestriction],
      week: '2024-01-22',
    };

    const validationResult = validateMenuAgainstRestrictions(validationParams);

    // 期待値の検証: すべてのメニューが制限条件を満たしている
    expect(validationResult).toEqual({
      userId: 'user_001',
      week: '2024-01-22',
      isValid: true,
      validationDetails: [
        {
          date: '2024-01-22',
          menuId: expect.stringMatching(/^menu_/),
          meetsAllRestrictions: true,
          restrictionChecks: [
            {
              restrictionId: 'rest_001',
              type: 'salt',
              limit_g: 2.0,
              actual_g: expect.any(Number),
              isMet: true,
            },
            {
              restrictionId: 'rest_002',
              type: 'allergen',
              allergen: 'egg',
              containsAllergen: false,
              isMet: true,
            },
          ],
          complianceScore: 100,
        },
        {
          date: '2024-01-23',
          menuId: expect.stringMatching(/^menu_/),
          meetsAllRestrictions: true,
          restrictionChecks: [
            {
              restrictionId: 'rest_001',
              type: 'salt',
              limit_g: 2.0,
              actual_g: expect.any(Number),
              isMet: true,
            },
            {
              restrictionId: 'rest_002',
              type: 'allergen',
              allergen: 'egg',
              containsAllergen: false,
              isMet: true,
            },
          ],
          complianceScore: 100,
        },
        {
          date: '2024-01-24',
          menuId: expect.stringMatching(/^menu_/),
          meetsAllRestrictions: true,
          restrictionChecks: [
            {
              restrictionId: 'rest_001',
              type: 'salt',
              limit_g: 2.0,
              actual_g: expect.any(Number),
              isMet: true,
            },
            {
              restrictionId: 'rest_002',
              type: 'allergen',
              allergen: 'egg',
              containsAllergen: false,
              isMet: true,
            },
          ],
          complianceScore: 100,
        },
        {
          date: '2024-01-25',
          menuId: expect.stringMatching(/^menu_/),
          meetsAllRestrictions: true,
          restrictionChecks: [
            {
              restrictionId: 'rest_001',
              type: 'salt',
              limit_g: 2.0,
              actual_g: expect.any(Number),
              isMet: true,
            },
            {
              restrictionId: 'rest_002',
              type: 'allergen',
              allergen: 'egg',
              containsAllergen: false,
              isMet: true,
            },
          ],
          complianceScore: 100,
        },
        {
          date: '2024-01-26',
          menuId: expect.stringMatching(/^menu_/),
          meetsAllRestrictions: true,
          restrictionChecks: [
            {
              restrictionId: 'rest_001',
              type: 'salt',
              limit_g: 2.0,
              actual_g: expect.any(Number),
              isMet: true,
            },
            {
              restrictionId: 'rest_002',
              type: 'allergen',
              allergen: 'egg',
              containsAllergen: false,
              isMet: true,
            },
          ],
          complianceScore: 100,
        },
        {
          date: '2024-01-27',
          menuId: expect.stringMatching(/^menu_/),
          meetsAllRestrictions: true,
          restrictionChecks: [
            {
              restrictionId: 'rest_001',
              type: 'salt',
              limit_g: 2.0,
              actual_g: expect.any(Number),
              isMet: true,
            },
            {
              restrictionId: 'rest_002',
              type: 'allergen',
              allergen: 'egg',
              containsAllergen: false,
              isMet: true,
            },
          ],
          complianceScore: 100,
        },
        {
          date: '2024-01-28',
          menuId: expect.stringMatching(/^menu_/),
          meetsAllRestrictions: true,
          restrictionChecks: [
            {
              restrictionId: 'rest_001',
              type: 'salt',
              limit_g: 2.0,
              actual_g: expect.any(Number),
              isMet: true,
            },
            {
              restrictionId: 'rest_002',
              type: 'allergen',
              allergen: 'egg',
              containsAllergen: false,
              isMet: true,
            },
          ],
          complianceScore: 100,
        },
      ],
      overallComplianceScore: 100,
      validationTimestamp: expect.any(String),
    });

    // すべてのメニューが制限条件を満たしていることを検証
    expect(validationResult.isValid).toBe(true);
    expect(validationResult.overallComplianceScore).toBe(100);
    validationResult.validationDetails.forEach((detail) => {
      expect(detail.meetsAllRestrictions).toBe(true);
      expect(detail.complianceScore).toBe(100);
      detail.restrictionChecks.forEach((check) => {
        expect(check.isMet).toBe(true);
      });
    });

    // ========== Step 5: 献立確定・保存 ==========
    const saveFinalMenuParams = {
      userId: 'user_001',
      menus: generatedMenus.menus,
      week: '2024-01-22',
      restrictions: [newRestriction, allergyRestriction],
      validationResult: validationResult,
      approvedBy: 'user_001',
      approvalTimestamp: '2024-01-21T18:00:00Z',
    };

    const saveResult = saveFinalMenu(saveFinalMenuParams);

    // 期待値の検証: 献立がデータベースに正常に登録
    expect(saveResult).toEqual({
      success: true,
      userId: 'user_001',
      week: '2024-01-22',
      savedMenuCount: 7,
      menuIds: expect.arrayContaining([
        expect.stringMatching(/^menu_/),
        expect.stringMatching(/^menu_/),
        expect.stringMatching(/^menu_/),
        expect.stringMatching(/^menu_/),
        expect.stringMatching(/^menu_/),
        expect.stringMatching(/^menu_/),
        expect.stringMatching(/^menu_/),
      ]),
      restrictions: [newRestriction, allergyRestriction],
      savedTimestamp: expect.any(String),
      dbWriteStatus: 'committed',
      auditLog: {
        action: 'MENU_FINALIZED',
        userId: 'user_001',
        restrictionIds: ['rest_001', 'rest_002'],
        timestamp: expect.any(String),
      },
    });

    // 登録結果の詳細検証
    expect(saveResult.success).toBe(true);
    expect(saveResult.savedMenuCount).toBe(7);
    expect(saveResult.dbWriteStatus).toBe('committed');
    expect(saveResult.menuIds.length).toBe(7);
  });
});