import { evaluateNutritionLogicWithTiebreaker } from '../../src/logic/it-3';

describe('食事評価データを献立生成ロジックに反映させる機能', () => {
  test('SCEN-594: 改善優先度が同値の複数案が存在する場合、判定基準に従って順序付けが実行される', () => {
    // テストケース1: 優先度スコア5.0で同じ複数案 - 栄養素バランスで差別化
    const candidates_1 = [
      {
        mealPlanId: 'plan_001',
        priorityScore: 5.0,
        nutritionBalance: 85.5,
        costEfficiency: 72.0,
        cookingDifficulty: 45.0,
      },
      {
        mealPlanId: 'plan_002',
        priorityScore: 5.0,
        nutritionBalance: 88.2,
        costEfficiency: 72.0,
        cookingDifficulty: 45.0,
      },
      {
        mealPlanId: 'plan_003',
        priorityScore: 5.0,
        nutritionBalance: 82.1,
        costEfficiency: 72.0,
        cookingDifficulty: 45.0,
      },
    ];

    const result_1 = evaluateNutritionLogicWithTiebreaker(candidates_1);

    // 栄養素バランスが高い順に順序付けられること
    expect(result_1.rankedCandidates[0].mealPlanId).toBe('plan_002');
    expect(result_1.rankedCandidates[0].nutritionBalance).toBe(88.2);
    expect(result_1.rankedCandidates[1].mealPlanId).toBe('plan_001');
    expect(result_1.rankedCandidates[1].nutritionBalance).toBe(85.5);
    expect(result_1.rankedCandidates[2].mealPlanId).toBe('plan_003');
    expect(result_1.rankedCandidates[2].nutritionBalance).toBe(82.1);

    // テストケース2: 優先度スコア5.0で栄養素バランスも同じ - コスト効率で差別化
    const candidates_2 = [
      {
        mealPlanId: 'plan_004',
        priorityScore: 5.0,
        nutritionBalance: 86.0,
        costEfficiency: 68.5,
        cookingDifficulty: 50.0,
      },
      {
        mealPlanId: 'plan_005',
        priorityScore: 5.0,
        nutritionBalance: 86.0,
        costEfficiency: 75.3,
        cookingDifficulty: 50.0,
      },
      {
        mealPlanId: 'plan_006',
        priorityScore: 5.0,
        nutritionBalance: 86.0,
        costEfficiency: 71.2,
        cookingDifficulty: 50.0,
      },
    ];

    const result_2 = evaluateNutritionLogicWithTiebreaker(candidates_2);

    // コスト効率が高い順に順序付けられること
    expect(result_2.rankedCandidates[0].mealPlanId).toBe('plan_005');
    expect(result_2.rankedCandidates[0].costEfficiency).toBe(75.3);
    expect(result_2.rankedCandidates[1].mealPlanId).toBe('plan_006');
    expect(result_2.rankedCandidates[1].costEfficiency).toBe(71.2);
    expect(result_2.rankedCandidates[2].mealPlanId).toBe('plan_004');
    expect(result_2.rankedCandidates[2].costEfficiency).toBe(68.5);

    // テストケース3: 優先度スコア5.0、栄養素バランス86.0、コスト効率72.0で同じ - 調理難易度で差別化
    const candidates_3 = [
      {
        mealPlanId: 'plan_007',
        priorityScore: 5.0,
        nutritionBalance: 86.0,
        costEfficiency: 72.0,
        cookingDifficulty: 55.3,
      },
      {
        mealPlanId: 'plan_008',
        priorityScore: 5.0,
        nutritionBalance: 86.0,
        costEfficiency: 72.0,
        cookingDifficulty: 42.8,
      },
      {
        mealPlanId: 'plan_009',
        priorityScore: 5.0,
        nutritionBalance: 86.0,
        costEfficiency: 72.0,
        cookingDifficulty: 48.1,
      },
    ];

    const result_3 = evaluateNutritionLogicWithTiebreaker(candidates_3);

    // 調理難易度が低い順に順序付けられること
    expect(result_3.rankedCandidates[0].mealPlanId).toBe('plan_008');
    expect(result_3.rankedCandidates[0].cookingDifficulty).toBe(42.8);
    expect(result_3.rankedCandidates[1].mealPlanId).toBe('plan_009');
    expect(result_3.rankedCandidates[1].cookingDifficulty).toBe(48.1);
    expect(result_3.rankedCandidates[2].mealPlanId).toBe('plan_007');
    expect(result_3.rankedCandidates[2].cookingDifficulty).toBe(55.3);

    // テストケース4: 複雑なエッジケース - 3段階のタイブレーカーが全て機能する検証
    const candidates_4 = [
      {
        mealPlanId: 'plan_010',
        priorityScore: 5.0,
        nutritionBalance: 85.0,
        costEfficiency: 70.0,
        cookingDifficulty: 40.0,
      },
      {
        mealPlanId: 'plan_011',
        priorityScore: 5.0,
        nutritionBalance: 87.0,
        costEfficiency: 70.0,
        cookingDifficulty: 55.0,
      },
      {
        mealPlanId: 'plan_012',
        priorityScore: 5.0,
        nutritionBalance: 87.0,
        costEfficiency: 75.0,
        cookingDifficulty: 60.0,
      },
      {
        mealPlanId: 'plan_013',
        priorityScore: 5.0,
        nutritionBalance: 87.0,
        costEfficiency: 70.0,
        cookingDifficulty: 45.0,
      },
    ];

    const result_4 = evaluateNutritionLogicWithTiebreaker(candidates_4);

    // 第1段階: 栄養素バランス (plan_010は85.0で最下位)
    expect(result_4.rankedCandidates[3].mealPlanId).toBe('plan_010');
    expect(result_4.rankedCandidates[3].nutritionBalance).toBe(85.0);

    // 第2段階: 栄養素バランス87.0の中で、コスト効率で順序付け
    const tier_2_plans = result_4.rankedCandidates.slice(0, 3);
    const tier_2_high_cost = tier_2_plans.find(
      (p) => p.costEfficiency === 75.0
    );
    expect(tier_2_high_cost?.mealPlanId).toBe('plan_012');
    expect(tier_2_high_cost?.costEfficiency).toBe(75.0);

    // 第3段階: 栄養素バランス87.0、コスト効率70.0の中で、調理難易度で順序付け
    const tier_3_plans = tier_2_plans.filter(
      (p) => p.costEfficiency === 70.0
    );
    const tier_3_low_difficulty = tier_3_plans.sort(
      (a, b) => a.cookingDifficulty - b.cookingDifficulty
    )[0];
    expect(tier_3_low_difficulty.mealPlanId).toBe('plan_013');
    expect(tier_3_low_difficulty.cookingDifficulty).toBe(45.0);

    // 全体として正しく順序付けられているか確認
    expect(result_4.rankedCandidates).toHaveLength(4);
    expect(result_4.tieBreakingRuleApplied).toBe(true);

    // テストケース5: 異なる優先度スコアを持つ混合ケース - 同じ優先度内で正確に順序付け
    const candidates_5 = [
      {
        mealPlanId: 'plan_014',
        priorityScore: 4.5,
        nutritionBalance: 90.0,
        costEfficiency: 80.0,
        cookingDifficulty: 30.0,
      },
      {
        mealPlanId: 'plan_015',
        priorityScore: 5.0,
        nutritionBalance: 86.5,
        costEfficiency: 73.0,
        cookingDifficulty: 48.5,
      },
      {
        mealPlanId: 'plan_016',
        priorityScore: 5.0,
        nutritionBalance: 86.5,
        costEfficiency: 73.0,
        cookingDifficulty: 51.2,
      },
      {
        mealPlanId: 'plan_017',
        priorityScore: 5.5,
        nutritionBalance: 82.0,
        costEfficiency: 65.0,
        cookingDifficulty: 60.0,
      },
    ];

    const result_5 = evaluateNutritionLogicWithTiebreaker(candidates_5);

    // 優先度スコア5.0の同一グループ内で、調理難易度が低い順に並ぶことを確認
    const priority_5_0_group = result_5.rankedCandidates.filter(
      (p) => p.priorityScore === 5.0
    );
    const priority_5_0_sorted = priority_5_0_group.sort(
      (a, b) => a.cookingDifficulty - b.cookingDifficulty
    );
    expect(priority_5_0_sorted[0].mealPlanId).toBe('plan_015');
    expect(priority_5_0_sorted[0].cookingDifficulty).toBe(48.5);
    expect(priority_5_0_sorted[1].mealPlanId).toBe('plan_016');
    expect(priority_5_0_sorted[1].cookingDifficulty).toBe(51.2);
  });
});