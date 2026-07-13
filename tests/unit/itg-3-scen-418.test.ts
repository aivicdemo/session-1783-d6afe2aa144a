import { analyzeMonthlyCostReduction } from '../../src/logic/it-1-br-3-2-1';

describe('購入実績の記録と月次食費削減効果の自動集計・分析機能', () => {
  // SCEN-418: [normal] 分析タイミング判定機能 - 毎月初日09:00で月次分析が判定・実行される
  test('毎月初日09:00に月次分析が自動実行され、食費集計・カテゴリ別分析・最適化提案が正常に生成される', () => {
    // 前提: 月次の献立生成と食材購入が完了し、実績食費データが集計された状態
    // 発生条件: 毎月1日09:00の分析タイミング判定
    // 期待結果: 分析タイミング判定が実行され、月次分析処理が自動実行される

    // テスト用の固定日時（毎月1日09:00）
    const analysis_trigger_date = new Date('2024-03-01T09:00:00Z');

    // 月次食費実績データ（3月1日～31日）
    const monthly_expense_data = {
      user_id: 'user_001',
      month: '2024-03',
      purchase_records: [
        {
          purchase_id: 'purchase_001',
          purchase_date: '2024-03-05',
          category: '野菜',
          amount: 1500,
          quantity: 5,
          unit_price: 300,
        },
        {
          purchase_id: 'purchase_002',
          purchase_date: '2024-03-10',
          category: '肉',
          amount: 3000,
          quantity: 2,
          unit_price: 1500,
        },
        {
          purchase_id: 'purchase_003',
          purchase_date: '2024-03-15',
          category: '魚',
          amount: 2500,
          quantity: 3,
          unit_price: 833,
        },
        {
          purchase_id: 'purchase_004',
          purchase_date: '2024-03-20',
          category: '乳製品',
          amount: 1000,
          quantity: 4,
          unit_price: 250,
        },
        {
          purchase_id: 'purchase_005',
          purchase_date: '2024-03-25',
          category: '穀物',
          amount: 1200,
          quantity: 6,
          unit_price: 200,
        },
      ],
      total_actual_expense: 9200,
      monthly_budget: 10000,
    };

    // 前月の実績データ（2月1日～29日）
    const previous_month_expense_data = {
      month: '2024-02',
      total_actual_expense: 9800,
      monthly_budget: 10000,
    };

    // 家族成員データ
    const family_member_data = {
      members: [
        { member_id: 'member_001', name: '本人', age: 35, gender: 'M' },
        { member_id: 'member_002', name: '配偶者', age: 33, gender: 'F' },
        { member_id: 'member_003', name: '子ども1', age: 8, gender: 'M' },
        { member_id: 'member_004', name: '子ども2', age: 5, gender: 'F' },
      ],
    };

    // 栄養基準値データ（栄養士監修）
    const nutrition_standard_data = {
      energy_kcal_daily: 2000,
      protein_g_daily: 60,
      fat_g_daily: 65,
      carbohydrate_g_daily: 250,
      calcium_mg_daily: 800,
      iron_mg_daily: 10,
    };

    // 食事記録データ（3月分）
    const meal_record_data = {
      records: [
        {
          record_id: 'meal_001',
          meal_date: '2024-03-05',
          nutrition: {
            energy_kcal: 1950,
            protein_g: 58,
            fat_g: 62,
            carbohydrate_g: 245,
            calcium_mg: 750,
            iron_mg: 9,
          },
          satisfaction_score: 85,
        },
        {
          record_id: 'meal_002',
          meal_date: '2024-03-10',
          nutrition: {
            energy_kcal: 2100,
            protein_g: 65,
            fat_g: 70,
            carbohydrate_g: 260,
            calcium_mg: 850,
            iron_mg: 11,
          },
          satisfaction_score: 90,
        },
        {
          record_id: 'meal_003',
          meal_date: '2024-03-15',
          nutrition: {
            energy_kcal: 1800,
            protein_g: 55,
            fat_g: 58,
            carbohydrate_g: 230,
            calcium_mg: 700,
            iron_mg: 8,
          },
          satisfaction_score: 78,
        },
        {
          record_id: 'meal_004',
          meal_date: '2024-03-20',
          nutrition: {
            energy_kcal: 2050,
            protein_g: 62,
            fat_g: 66,
            carbohydrate_g: 255,
            calcium_mg: 800,
            iron_mg: 10,
          },
          satisfaction_score: 88,
        },
        {
          record_id: 'meal_005',
          meal_date: '2024-03-25',
          nutrition: {
            energy_kcal: 1950,
            protein_g: 59,
            fat_g: 63,
            carbohydrate_g: 248,
            calcium_mg: 780,
            iron_mg: 9,
          },
          satisfaction_score: 85,
        },
      ],
    };

    // 分析実行入力
    const analysis_input = {
      trigger_date: analysis_trigger_date,
      user_id: monthly_expense_data.user_id,
      current_month_data: monthly_expense_data,
      previous_month_data: previous_month_expense_data,
      family_members: family_member_data.members,
      nutrition_standard: nutrition_standard_data,
      meal_records: meal_record_data.records,
    };

    // 実行
    const result = analyzeMonthlyCostReduction(analysis_input);

    // ===== アサーション開始 =====

    // 1. 分析タイミング判定が正常に実行されたこと
    expect(result).toBeDefined();
    expect(result.analysis_executed).toBe(true);

    // 2. 分析実行タイミングが毎月1日09:00であること
    expect(result.analysis_trigger_date).toEqual(new Date('2024-03-01T09:00:00Z'));

    // 3. 月間食費集計が正常に生成されたこと
    expect(result.monthly_summary).toBeDefined();
    expect(result.monthly_summary.total_actual_expense).toBe(9200);
    expect(result.monthly_summary.monthly_budget).toBe(10000);

    // 4. 予算の充足度を計算（実績 / 予算 * 100）
    const budget_fulfillment_rate = (9200 / 10000) * 100; // 92%
    expect(result.monthly_summary.budget_fulfillment_rate).toBe(92);

    // 5. 食費が予算内か否かを判定
    expect(result.monthly_summary.is_within_budget).toBe(true);

    // 6. 食費削減額を計算（前月実績 - 当月実績）
    const cost_reduction_amount = 9800 - 9200; // 600円削減
    expect(result.monthly_summary.cost_reduction_amount).toBe(600);

    // 7. 食費削減率を計算（削減額 / 前月実績 * 100）
    const cost_reduction_rate = (600 / 9800) * 100; // 6.12%
    expect(result.monthly_summary.cost_reduction_rate).toBeCloseTo(6.122, 2);

    // 8. カテゴリ別分析が正常に生成されたこと
    expect(result.category_analysis).toBeDefined();
    expect(Array.isArray(result.category_analysis)).toBe(true);

    // 9. カテゴリ別の集計が正確であること（5カテゴリ）
    expect(result.category_analysis.length).toBe(5);

    // 野菜: 1500円
    const vegetable_category = result.category_analysis.find(cat => cat.category === '野菜');
    expect(vegetable_category).toBeDefined();
    expect(vegetable_category.total_amount).toBe(1500);
    expect(vegetable_category.category_percentage).toBe((1500 / 9200) * 100); // 16.30%

    // 肉: 3000円
    const meat_category = result.category_analysis.find(cat => cat.category === '肉');
    expect(meat_category).toBeDefined();
    expect(meat_category.total_amount).toBe(3000);
    expect(meat_category.category_percentage).toBeCloseTo((3000 / 9200) * 100, 2); // 32.61%

    // 魚: 2500円
    const fish_category = result.category_analysis.find(cat => cat.category === '魚');
    expect(fish_category).toBeDefined();
    expect(fish_category.total_amount).toBe(2500);
    expect(fish_category.category_percentage).toBeCloseTo((2500 / 9200) * 100, 2); // 27.17%

    // 乳製品: 1000円
    const dairy_category = result.category_analysis.find(cat => cat.category === '乳製品');
    expect(dairy_category).toBeDefined();
    expect(dairy_category.total_amount).toBe(1000);
    expect(dairy_category.category_percentage).toBeCloseTo((1000 / 9200) * 100, 2); // 10.87%

    // 穀物: 1200円
    const grain_category = result.category_analysis.find(cat => cat.category === '穀物');
    expect(grain_category).toBeDefined();
    expect(grain_category.total_amount).toBe(1200);
    expect(grain_category.category_percentage).toBeCloseTo((1200 / 9200) * 100, 2); // 13.04%

    // 10. 栄養摂取状況の分析が正常に生成されたこと
    expect(result.nutrition_analysis).toBeDefined();

    // 11. 栄養項目別の達成度が計算されていること
    expect(result.nutrition_analysis.energy_kcal_achievement_rate).toBeDefined();
    expect(result.nutrition_analysis.protein_g_achievement_rate).toBeDefined();
    expect(result.nutrition_analysis.fat_g_achievement_rate).toBeDefined();
    expect(result.nutrition_analysis.carbohydrate_g_achievement_rate).toBeDefined();
    expect(result.nutrition_analysis.calcium_mg_achievement_rate).toBeDefined();
    expect(result.nutrition_analysis.iron_mg_achievement_rate).toBeDefined();

    // 12. エネルギー達成度を検証（（1950+2100+1800+2050+1950）/5 / 2000 * 100）
    const avg_energy = (1950 + 2100 + 1800 + 2050 + 1950) / 5; // 1980 kcal
    const energy_achievement = (1980 / 2000) * 100; // 99%
    expect(result.nutrition_analysis.energy_kcal_achievement_rate).toBe(99);

    // 13. タンパク質達成度を検証（（58+65+55+62+59）/5 / 60 * 100）
    const avg_protein = (58 + 65 + 55 + 62 + 59) / 5; // 59.8g
    const protein_achievement = (59.8 / 60) * 100; // 99.67%
    expect(result.nutrition_analysis.protein_g_achievement_rate).toBeCloseTo(99.67, 2);

    // 14. 脂肪達成度を検証（（62+70+58+66+63）/5 / 65 * 100）
    const avg_fat = (62 + 70 + 58 + 66 + 63) / 5; // 63.8g
    const fat_achievement = (63.8 / 65) * 100; // 98.15%
    expect(result.nutrition_analysis.fat_g_achievement_rate).toBeCloseTo(98.15, 2);

    // 15. カーボハイドレート達成度を検証（（245+260+230+255+248）/5 / 250 * 100）
    const avg_carb = (245 + 260 + 230 + 255 + 248) / 5; // 247.6g
    const carb_achievement = (247.6 / 250) * 100; // 99.04%
    expect(result.nutrition_analysis.carbohydrate_g_achievement_rate).toBeCloseTo(99.04, 2);

    // 16. カルシウム達成度を検証（（750+850+700+800+780）/5 / 800 * 100）
    const avg_calcium = (750 + 850 + 700 + 800 + 780) / 5; // 776mg
    const calcium_achievement = (776 / 800) * 100; // 97%
    expect(result.nutrition_analysis.calcium_mg_achievement_rate).toBe(97);

    // 17. 鉄分達成度を検証（（9+11+8+10+9）/5 / 10 * 100）
    const avg_iron = (9 + 11 + 8 + 10 + 9) / 5; // 9.4mg
    const iron_achievement = (9.4 / 10) * 100; // 94%
    expect(result.nutrition_analysis.iron_mg_achievement_rate).toBe(94);

    // 18. 栄養不足項目が正確に検出されること
    expect(result.nutrition_analysis.insufficient_items).toBeDefined();
    expect(Array.isArray(result.nutrition_analysis.insufficient_items)).toBe(true);

    // カルシウムが不足（97%）、鉄分が不足（94%）
    expect(result.nutrition_analysis.insufficient_items).toContain('calcium_mg');
    expect(result.nutrition_analysis.insufficient_items).toContain('iron_mg');

    // 19. 満足度スコアの平均が正確に計算されること
    const avg_satisfaction = (85 + 90 + 78 + 88 + 85) / 5; // 85.2
    expect(result.nutrition_analysis.avg_satisfaction_score).toBe(85.2);

    // 20. 最適化提案が正常に生成されたこと
    expect(result.optimization_suggestions).toBeDefined();
    expect(Array.isArray(result.optimization_suggestions)).toBe(true);

    // 21. 最適化提案に食費削減提案が含まれること（予算内であることを確認）
    const cost_optimization = result.optimization_suggestions.find(
      sugg => sugg.suggestion_type === 'cost_reduction'
    );
    expect(cost_optimization).toBeDefined();
    expect(cost_optimization.description).toContain('削減');

    // 22. 最適化提案に栄養改善提案が含まれること（不足項目に基づく）
    const nutrition_optimization = result.optimization_suggestions.find(
      sugg => sugg.suggestion_type === 'nutrition_improvement'
    );
    expect(nutrition_optimization).toBeDefined();

    // 23. 栄養改善提案にカルシウムと鉄分の改善が含まれること
    expect(nutrition_optimization.target_nutrients).toContain('calcium_mg');
    expect(nutrition_optimization.target_nutrients).toContain('iron_mg');

    // 24. 提案の優先度が正確に設定されていること
    expect(result.optimization_suggestions.every(sugg => sugg.priority >= 1 && sugg.priority <= 5)).toBe(true);

    // 25. 次月の献立優先条件が生成されたこと
    expect(result.next_month_priority_conditions).toBeDefined();

    // 26. 次月の献立優先条件が食費削減と栄養改善の両立を目指すこと
    expect(result.next_month_priority_conditions.cost_optimization_target).toBeDefined();
    expect(result.next_month_priority_conditions.nutrition_improvement_targets).toBeDefined();

    // 27. 次月の献立優先条件の予算目標が妥当であること
    // （当月実績を基準に、さらに5%削減を目指す場合の計算）
    const next_month_target_budget = 9200 * 0.95; // 8740円
    expect(result.next_month_priority_conditions.cost_optimization_target).toBeLessThanOrEqual(9200);

    // 28. 分析結果が完全性の基準を満たしていること
    expect(result.analysis_completeness_status).toBe('complete');

    // 29. 分析実行ステータスが成功であること
    expect(result.analysis_status).toBe('success');

    // 30. 分析完了タイムスタンプが記録されていること
    expect(result.analysis_completed_timestamp).toBeDefined();
  });
});