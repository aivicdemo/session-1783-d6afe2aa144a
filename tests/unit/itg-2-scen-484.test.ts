import { prioritizeNutritionItemsByAchievementRate } from '../../src/logic/it-1-br-2-1-1-1';

describe('栄養項目優先度判定 - 達成率が低い栄養項目を優先度付けして特定', () => {
  // SCEN-484
  test('達成率が低い栄養項目を優先度順に特定し、改善が必要な項目を優先度付けする', () => {
    // Precondition: 栄養管理・分析ダッシュボードシステムにログイン済みで、
    // 栄養項目別の達成率データが集計されている状態

    // 入力: 複数の栄養項目と達成率（0-100%）
    const nutritionItems = [
      {
        nutrient_id: 'protein_001',
        nutrient_name: 'タンパク質',
        target_value: 60,
        actual_value: 45,
        unit: 'g',
        achievement_rate: 75, // 45/60 * 100 = 75%
      },
      {
        nutrient_id: 'calcium_001',
        nutrient_name: 'カルシウム',
        target_value: 800,
        actual_value: 480,
        unit: 'mg',
        achievement_rate: 60, // 480/800 * 100 = 60%
      },
      {
        nutrient_id: 'iron_001',
        nutrient_name: '鉄',
        target_value: 18,
        actual_value: 8,
        unit: 'mg',
        achievement_rate: 44, // 8/18 * 100 = 44.4% → 44%
      },
      {
        nutrient_id: 'vitaminc_001',
        nutrient_name: 'ビタミンC',
        target_value: 100,
        actual_value: 35,
        unit: 'mg',
        achievement_rate: 35, // 35/100 * 100 = 35%
      },
      {
        nutrient_id: 'fiber_001',
        nutrient_name: '食物繊維',
        target_value: 25,
        actual_value: 20,
        unit: 'g',
        achievement_rate: 80, // 20/25 * 100 = 80%
      },
    ];

    // 実行: 達成率が低い順に優先度付けアルゴリズムを実行
    const result = prioritizeNutritionItemsByAchievementRate(nutritionItems);

    // 検証1: 優先度付けが正しく実行されていることを確認
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(5);

    // 検証2: 達成率が最も低い項目が優先度1として特定されていることを確認
    // ビタミンC（35%）が最も低いため、優先度1
    expect(result[0]).toEqual({
      nutrient_id: 'vitaminc_001',
      nutrient_name: 'ビタミンC',
      target_value: 100,
      actual_value: 35,
      unit: 'mg',
      achievement_rate: 35,
      priority: 1,
      gap_to_target: 65, // 100 - 35 = 65
    });

    // 検証3: 優先度2が鉄（44%）であることを確認
    expect(result[1]).toEqual({
      nutrient_id: 'iron_001',
      nutrient_name: '鉄',
      target_value: 18,
      actual_value: 8,
      unit: 'mg',
      achievement_rate: 44,
      priority: 2,
      gap_to_target: 10, // 18 - 8 = 10
    });

    // 検証4: 優先度3がカルシウム（60%）であることを確認
    expect(result[2]).toEqual({
      nutrient_id: 'calcium_001',
      nutrient_name: 'カルシウム',
      target_value: 800,
      actual_value: 480,
      unit: 'mg',
      achievement_rate: 60,
      priority: 3,
      gap_to_target: 320, // 800 - 480 = 320
    });

    // 検証5: 優先度4がタンパク質（75%）であることを確認
    expect(result[3]).toEqual({
      nutrient_id: 'protein_001',
      nutrient_name: 'タンパク質',
      target_value: 60,
      actual_value: 45,
      unit: 'g',
      achievement_rate: 75,
      priority: 4,
      gap_to_target: 15, // 60 - 45 = 15
    });

    // 検証6: 優先度5が食物繊維（80%）であることを確認
    // 達成率が最も高い項目は優先度が最も低い
    expect(result[4]).toEqual({
      nutrient_id: 'fiber_001',
      nutrient_name: '食物繊維',
      target_value: 25,
      actual_value: 20,
      unit: 'g',
      achievement_rate: 80,
      priority: 5,
      gap_to_target: 5, // 25 - 20 = 5
    });

    // 検証7: すべての項目が達成率の低い順に正しく順序付けされていることを確認
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].achievement_rate).toBeLessThanOrEqual(result[i + 1].achievement_rate);
      expect(result[i].priority).toBe(i + 1);
      expect(result[i + 1].priority).toBe(i + 2);
    }

    // 検証8: gap_to_target が正しく計算されていることを確認
    result.forEach((item) => {
      const expected_gap = item.target_value - item.actual_value;
      expect(item.gap_to_target).toBe(expected_gap);
    });

    // 検証9: 優先度が1から連続した整数であることを確認
    result.forEach((item, index) => {
      expect(item.priority).toBe(index + 1);
    });

    // 検証10: ユーザーが改善すべき栄養項目を優先順位付きで特定できることを確認
    // 達成率が低い項目（優先度が高い項目）から改善することで効果的な栄養改善が可能
    expect(result[0].achievement_rate).toBe(35); // 最優先項目
    expect(result[0].priority).toBe(1);
    expect(result[0].gap_to_target).toBe(65); // 最大の改善ギャップ
  });
});