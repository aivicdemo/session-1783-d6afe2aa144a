import { reflectMealEvaluationDataToMenuLogic } from '../../src/logic/it-3';

describe('食事評価データを献立生成ロジックに反映させる機能', () => {
  // SCEN-362: [edge] 食事評価データの献立生成ロジック反映機能 - 評価データが閾値未満の場合、献立生成ロジックに反映されない
  test('評価スコアが閾値未満の食事評価データは献立生成ロジックに反映されず、閾値以上のデータのみを使用して献立が生成される', () => {
    const threshold = 3.0;
    
    const mealEvaluationDataBelowThreshold = [
      {
        meal_evaluation_id: 'eval_001',
        family_member_id: 'member_001',
        menu_id: 'menu_001',
        dish_name: 'カレーライス',
        satisfaction_score: 2.5,
        completion_rate: 0.6,
        request_text: '辛すぎた',
        recorded_at: new Date('2024-01-15T18:30:00Z'),
      },
      {
        meal_evaluation_id: 'eval_002',
        family_member_id: 'member_002',
        menu_id: 'menu_001',
        dish_name: 'カレーライス',
        satisfaction_score: 2.8,
        completion_rate: 0.5,
        request_text: 'もっと甘くしてほしい',
        recorded_at: new Date('2024-01-15T18:30:00Z'),
      },
    ];

    const mealEvaluationDataAboveThreshold = [
      {
        meal_evaluation_id: 'eval_003',
        family_member_id: 'member_003',
        menu_id: 'menu_002',
        dish_name: '唐揚げ',
        satisfaction_score: 4.2,
        completion_rate: 0.95,
        request_text: 'また作ってほしい',
        recorded_at: new Date('2024-01-16T18:30:00Z'),
      },
      {
        meal_evaluation_id: 'eval_004',
        family_member_id: 'member_001',
        menu_id: 'menu_002',
        dish_name: '唐揚げ',
        satisfaction_score: 3.8,
        completion_rate: 0.88,
        request_text: '家族全員大好き',
        recorded_at: new Date('2024-01-16T18:30:00Z'),
      },
    ];

    const allMealEvaluationData = [
      ...mealEvaluationDataBelowThreshold,
      ...mealEvaluationDataAboveThreshold,
    ];

    const familyFoodPreferences = {
      family_id: 'fam_001',
      family_member_count: 4,
    };

    const dietaryRestrictions = {
      family_id: 'fam_001',
      restrictions: [
        {
          restriction_id: 'res_001',
          restriction_type: 'allergy',
          ingredient: 'えび',
          severity: 'severe',
        },
      ],
    };

    const result = reflectMealEvaluationDataToMenuLogic({
      all_meal_evaluation_data: allMealEvaluationData,
      threshold_score: threshold,
      family_food_preferences: familyFoodPreferences,
      dietary_restrictions: dietaryRestrictions,
      current_menu_generation_id: 'gen_001',
    });

    // 閾値以上の評価データのみが献立生成ロジックに反映されたことを確認
    expect(result.filtered_evaluation_data).toHaveLength(2);
    expect(result.filtered_evaluation_data[0].meal_evaluation_id).toBe('eval_003');
    expect(result.filtered_evaluation_data[0].satisfaction_score).toBe(4.2);
    expect(result.filtered_evaluation_data[1].meal_evaluation_id).toBe('eval_004');
    expect(result.filtered_evaluation_data[1].satisfaction_score).toBe(3.8);

    // 閾値未満のデータが除外されたことを確認
    expect(result.excluded_evaluation_data).toHaveLength(2);
    expect(result.excluded_evaluation_data[0].meal_evaluation_id).toBe('eval_001');
    expect(result.excluded_evaluation_data[0].satisfaction_score).toBe(2.5);
    expect(result.excluded_evaluation_data[1].meal_evaluation_id).toBe('eval_002');
    expect(result.excluded_evaluation_data[1].satisfaction_score).toBe(2.8);

    // 除外理由がログに記録されていることを確認
    expect(result.filtering_log).toEqual(
      expect.objectContaining({
        threshold_score: threshold,
        total_input_count: 4,
        filtered_count: 2,
        excluded_count: 2,
        filtering_timestamp: expect.any(String),
      })
    );

    // 献立生成ロジック用の推奨食材リストに、閾値以上の評価データから抽出された食材のみが含まれていることを確認
    expect(result.recommended_dishes_for_menu_logic).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          dish_name: '唐揚げ',
          average_satisfaction_score: 4.0,
          recommended_priority: 'high',
        }),
      ])
    );

    // 推奨優先度の計算が正確であることを確認（閾値以上の2件の平均: (4.2 + 3.8) / 2 = 4.0）
    const karaageRecommendation = result.recommended_dishes_for_menu_logic.find(
      (dish) => dish.dish_name === '唐揚げ'
    );
    expect(karaageRecommendation?.average_satisfaction_score).toBe(4.0);
    expect(karaageRecommendation?.completion_rate_average).toBe(0.915);

    // カレーライスは推奨リストに含まれていないことを確認（閾値未満のため除外）
    const curryRecommendation = result.recommended_dishes_for_menu_logic.find(
      (dish) => dish.dish_name === 'カレーライス'
    );
    expect(curryRecommendation).toBeUndefined();

    // 献立生成ロジック統合フラグが true になっていることを確認
    expect(result.is_ready_for_menu_generation).toBe(true);

    // 除外されたデータの理由が詳細に記録されていることを確認
    expect(result.excluded_evaluation_details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          meal_evaluation_id: 'eval_001',
          exclusion_reason: 'score_below_threshold',
          satisfaction_score: 2.5,
          threshold_score: threshold,
        }),
        expect.objectContaining({
          meal_evaluation_id: 'eval_002',
          exclusion_reason: 'score_below_threshold',
          satisfaction_score: 2.8,
          threshold_score: threshold,
        }),
      ])
    );
  });
});