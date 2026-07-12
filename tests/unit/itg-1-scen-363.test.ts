import { calculateFoodRatingPriority, reflectRatingInMenuGeneration } from '../../src/logic/it-3';

describe('食事評価データを献立生成ロジックに反映させる機能', () => {
  // SCEN-363: [edge] 食事評価データの献立生成ロジック反映機能 - 矛盾する評価データ（同一料理で高評価と低評価が混在）を受け取った場合、加重平均で優先度が算出される
  test('矛盾する評価データから加重平均で優先度を算出し、献立生成ロジックに反映する', () => {
    // 同一料理（唐揚げ）に対する矛盾する評価データを準備
    const food_rating_data = [
      {
        dish_id: 'karaage_001',
        dish_name: '唐揚げ',
        family_member_id: 'member_001',
        satisfaction_score: 5,
        evaluation_datetime: new Date('2024-01-08T18:30:00Z'),
      },
      {
        dish_id: 'karaage_001',
        dish_name: '唐揚げ',
        family_member_id: 'member_002',
        satisfaction_score: 5,
        evaluation_datetime: new Date('2024-01-08T18:35:00Z'),
      },
      {
        dish_id: 'karaage_001',
        dish_name: '唐揚げ',
        family_member_id: 'member_003',
        satisfaction_score: 5,
        evaluation_datetime: new Date('2024-01-08T18:40:00Z'),
      },
      {
        dish_id: 'karaage_001',
        dish_name: '唐揚げ',
        family_member_id: 'member_004',
        satisfaction_score: 2,
        evaluation_datetime: new Date('2024-01-09T18:30:00Z'),
      },
      {
        dish_id: 'karaage_001',
        dish_name: '唐揚げ',
        family_member_id: 'member_005',
        satisfaction_score: 2,
        evaluation_datetime: new Date('2024-01-09T18:35:00Z'),
      },
    ];

    // 加重平均の計算: (5×3 + 2×2) ÷ 5 = 3.8
    const priority_result = calculateFoodRatingPriority({
      dish_id: 'karaage_001',
      dish_name: '唐揚げ',
      rating_data: food_rating_data,
    });

    // 優先度スコアが3.8点で算出されることを確認
    expect(priority_result.priority_score).toBe(3.8);
    expect(priority_result.total_evaluations).toBe(5);
    expect(priority_result.high_rating_count).toBe(3);
    expect(priority_result.low_rating_count).toBe(2);

    // その優先度スコアが献立生成アルゴリズムに正しく反映されることを確認
    const menu_generation_input = {
      user_id: 'user_001',
      family_id: 'family_001',
      target_date: new Date('2024-01-15T00:00:00Z'),
      dish_priorities: [priority_result],
      dietary_restrictions: [],
      allergy_info: [],
    };

    const generated_menu = reflectRatingInMenuGeneration(menu_generation_input);

    // 生成された献立に唐揚げが中程度の優先度で組み込まれていることを確認
    const karaage_in_menu = generated_menu.menu_items.find(
      (item: any) => item.dish_id === 'karaage_001'
    );
    expect(karaage_in_menu).toBeDefined();
    expect(karaage_in_menu.inclusion_priority).toBe(3.8);
    expect(karaage_in_menu.dish_name).toBe('唐揚げ');
    expect(generated_menu.total_items).toBeGreaterThan(0);
  });
});