import { calculateMealPriorityFromEvaluation } from '../../src/logic/it-1-br-3-2-1';

describe('購入実績の記録と月次食費削減効果の自動集計・分析機能', () => {
  // SCEN-346
  test('評価データに基づく献立生成ロジックの自動反映機能 - 蓄積された食事評価データから高評価料理とリクエストが正しく抽出され、優先度付けされて次週献立生成ロジックに反映される', () => {
    // 前提: 過去1週間分の食事評価データが蓄積されている状態
    const mealEvaluationData = [
      {
        mealId: 'meal_001',
        dishName: '鶏肉の照り焼き',
        evaluationScore: 4.5,
        completionRate: 0.95,
        userRequest: 'リクエスト1',
        requestFrequency: 3,
        nutritionBalanceScore: 0.88,
        category: 'main_dish'
      },
      {
        mealId: 'meal_002',
        dishName: '野菜炒め',
        evaluationScore: 3.8,
        completionRate: 0.80,
        userRequest: 'リクエスト2',
        requestFrequency: 2,
        nutritionBalanceScore: 0.75,
        category: 'side_dish'
      },
      {
        mealId: 'meal_003',
        dishName: 'サラダ',
        evaluationScore: 3.2,
        completionRate: 0.60,
        userRequest: 'リクエスト3',
        requestFrequency: 1,
        nutritionBalanceScore: 0.70,
        category: 'side_dish'
      },
      {
        mealId: 'meal_004',
        dishName: '豚肉のしょうが焼き',
        evaluationScore: 4.3,
        completionRate: 0.92,
        userRequest: 'リクエスト4',
        requestFrequency: 2,
        nutritionBalanceScore: 0.85,
        category: 'main_dish'
      },
      {
        mealId: 'meal_005',
        dishName: 'スープ',
        evaluationScore: 3.9,
        completionRate: 0.85,
        userRequest: 'リクエスト5',
        requestFrequency: 2,
        nutritionBalanceScore: 0.80,
        category: 'soup'
      }
    ];

    const evaluationScoreThreshold = 4.0;

    // 手順: 過去1週間分の食事評価データを取得し、評価スコア（例：4.0以上）で高評価料理を抽出する
    // 手順: 抽出された高評価料理に対する利用者のリクエスト情報を収集し、優先度スコアを計算する
    const result = calculateMealPriorityFromEvaluation({
      mealEvaluationData,
      evaluationScoreThreshold
    });

    // 期待結果: 高評価料理（評価スコア 4.0以上）が正しく抽出される
    expect(result.highRatedMeals).toHaveLength(2);
    expect(result.highRatedMeals[0].dishName).toBe('鶏肉の照り焼き');
    expect(result.highRatedMeals[1].dishName).toBe('豚肉のしょうが焼き');

    // 期待結果: 優先度スコアが正確に計算される（優先度 = 評価スコア × リクエスト頻度 × 栄養バランススコア）
    // 鶏肉の照り焼き: 4.5 × 3 × 0.88 = 11.88
    // 豚肉のしょうが焼き: 4.3 × 2 × 0.85 = 7.31
    expect(result.prioritizedMeals[0]).toEqual({
      mealId: 'meal_001',
      dishName: '鶏肉の照り焼き',
      evaluationScore: 4.5,
      completionRate: 0.95,
      userRequest: 'リクエスト1',
      requestFrequency: 3,
      nutritionBalanceScore: 0.88,
      category: 'main_dish',
      priorityScore: 11.88,
      rank: 1
    });

    expect(result.prioritizedMeals[1]).toEqual({
      mealId: 'meal_004',
      dishName: '豚肉のしょうが焼き',
      evaluationScore: 4.3,
      completionRate: 0.92,
      userRequest: 'リクエスト4',
      requestFrequency: 2,
      nutritionBalanceScore: 0.85,
      category: 'main_dish',
      priorityScore: 7.31,
      rank: 2
    });

    // 期待結果: 優先度付けされたデータが降順でソートされている
    expect(result.prioritizedMeals).toHaveLength(2);
    expect(result.prioritizedMeals[0].priorityScore).toBeGreaterThan(result.prioritizedMeals[1].priorityScore);

    // 期待結果: 献立生成ロジックの入力パラメータとして正しく設定される
    expect(result.mealGenerationInput).toEqual({
      preferredDishes: [
        {
          mealId: 'meal_001',
          dishName: '鶏肉の照り焼き',
          priorityScore: 11.88,
          category: 'main_dish'
        },
        {
          mealId: 'meal_004',
          dishName: '豚肉のしょうが焼き',
          priorityScore: 7.31,
          category: 'main_dish'
        }
      ],
      generatedAt: '2024-01-21T09:00:00Z',
      applicableForWeek: '2024-01-22'
    });

    // 期待結果: 生成対象週が正しく設定されている
    expect(result.mealGenerationInput.applicableForWeek).toBe('2024-01-22');

    // 期待結果: 抽出された高評価料理が次週献立に反映されることを確認
    expect(result.nextWeekMealPlan).toEqual({
      week: '2024-01-22',
      recommendedDishes: [
        {
          dayOfWeek: 'Monday',
          mealType: 'dinner',
          dishName: '鶏肉の照り焼き',
          priorityScore: 11.88
        },
        {
          dayOfWeek: 'Wednesday',
          mealType: 'dinner',
          dishName: '豚肉のしょうが焼き',
          priorityScore: 7.31
        }
      ]
    });

    // 期待結果: 優先度の高い料理が献立に適切に組み込まれている
    expect(result.nextWeekMealPlan.recommendedDishes[0].dishName).toBe('鶏肉の照り焼き');
    expect(result.nextWeekMealPlan.recommendedDishes[0].priorityScore).toBe(11.88);
    expect(result.nextWeekMealPlan.recommendedDishes[1].dishName).toBe('豚肉のしょうが焼き');
    expect(result.nextWeekMealPlan.recommendedDishes[1].priorityScore).toBe(7.31);
  });
});