import { aggregateMonthlyCostAndSatisfaction } from '../../src/logic/it-3';

describe('食事評価データを献立生成ロジックに反映させる機能', () => {
  // SCEN-406
  test('月末日に月次食費実績、予算比削減率、食材別コスト分析、満足度スコアが正常に集計される', () => {
    const mealRecords = [
      {
        mealId: 'meal_001',
        date: '2024-01-05',
        ingredients: [
          { ingredientId: 'ing_001', ingredientName: 'トマト', cost: 150, quantity: 2 },
          { ingredientId: 'ing_002', ingredientName: '玉ねぎ', cost: 100, quantity: 1 }
        ],
        totalCost: 250,
        satisfactionScore: 4
      },
      {
        mealId: 'meal_002',
        date: '2024-01-10',
        ingredients: [
          { ingredientId: 'ing_001', ingredientName: 'トマト', cost: 150, quantity: 1 },
          { ingredientId: 'ing_003', ingredientName: 'ニンジン', cost: 120, quantity: 2 }
        ],
        totalCost: 270,
        satisfactionScore: 5
      },
      {
        mealId: 'meal_003',
        date: '2024-01-15',
        ingredients: [
          { ingredientId: 'ing_002', ingredientName: '玉ねぎ', cost: 100, quantity: 1 },
          { ingredientId: 'ing_003', ingredientName: 'ニンジン', cost: 120, quantity: 1 }
        ],
        totalCost: 220,
        satisfactionScore: 3
      },
      {
        mealId: 'meal_004',
        date: '2024-01-20',
        ingredients: [
          { ingredientId: 'ing_001', ingredientName: 'トマト', cost: 150, quantity: 1 },
          { ingredientId: 'ing_002', ingredientName: '玉ねぎ', cost: 100, quantity: 2 }
        ],
        totalCost: 250,
        satisfactionScore: 4
      },
      {
        mealId: 'meal_005',
        date: '2024-01-31',
        ingredients: [
          { ingredientId: 'ing_003', ingredientName: 'ニンジン', cost: 120, quantity: 1 }
        ],
        totalCost: 120,
        satisfactionScore: 2
      }
    ];

    const monthlyBudget = 1500;
    const currentDate = '2024-01-31';

    const result = aggregateMonthlyCostAndSatisfaction({
      mealRecords,
      monthlyBudget,
      currentDate
    });

    // (1) 月次食費実績が当月すべての食事記録コストの合計と一致すること
    const expectedTotalCost = 250 + 270 + 220 + 250 + 120;
    expect(result.monthlyTotalCost).toBe(1110);
    expect(result.monthlyTotalCost).toBe(expectedTotalCost);

    // (2) 削減率が正常に計算され数値型で返却されること
    const expectedReductionRate = ((monthlyBudget - expectedTotalCost) / monthlyBudget) * 100;
    expect(typeof result.budgetReductionRate).toBe('number');
    expect(result.budgetReductionRate).toBe(26.0);

    // (3) 食材別コスト分析が食材ごとにカテゴリ分けされ、各食材の総コストと使用回数が正確に算出されていること
    expect(result.ingredientCostAnalysis).toEqual([
      {
        ingredientId: 'ing_001',
        ingredientName: 'トマト',
        totalCost: 450,
        usageCount: 4
      },
      {
        ingredientId: 'ing_002',
        ingredientName: '玉ねぎ',
        totalCost: 300,
        usageCount: 4
      },
      {
        ingredientId: 'ing_003',
        ingredientName: 'ニンジン',
        totalCost: 360,
        usageCount: 4
      }
    ]);

    // (4) 満足度スコアが1-5の範囲内で、記録されたすべてのスコアの平均値として集計されていること
    const expectedAverageSatisfaction = (4 + 5 + 3 + 4 + 2) / 5;
    expect(result.averageSatisfactionScore).toBe(3.6);
    expect(result.averageSatisfactionScore).toBeGreaterThanOrEqual(1);
    expect(result.averageSatisfactionScore).toBeLessThanOrEqual(5);

    // (5) すべての集計結果が期待値と一致して保存されていること
    expect(result).toEqual({
      monthlyTotalCost: 1110,
      budgetReductionRate: 26.0,
      ingredientCostAnalysis: [
        {
          ingredientId: 'ing_001',
          ingredientName: 'トマト',
          totalCost: 450,
          usageCount: 4
        },
        {
          ingredientId: 'ing_002',
          ingredientName: '玉ねぎ',
          totalCost: 300,
          usageCount: 4
        },
        {
          ingredientId: 'ing_003',
          ingredientName: 'ニンジン',
          totalCost: 360,
          usageCount: 4
        }
      ],
      averageSatisfactionScore: 3.6,
      month: '2024-01',
      isSuccessfullyAggregated: true
    });

    // 集計データが有効な状態であることを追加検証
    expect(result.isSuccessfullyAggregated).toBe(true);
    expect(result.month).toBe('2024-01');
  });
});