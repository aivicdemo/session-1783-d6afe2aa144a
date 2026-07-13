import { calculateMealOptimizationScore } from '../../src/logic/it-1-br-6-2-1-1';

describe('流通業者在庫・価格データ連携インターフェース', () => {
  // SCEN-369: [edge] 流通業者在庫・価格データ連携による献立最適化機能 - スコア計算で複数食材の価格が同一のとき、在庫充足度で順位付けが行われる
  test('複数食材が同一価格の場合、在庫充足度で順位付けされること', () => {
    // 準備: 複数食材の在庫・価格データを設定
    const ingredients = [
      {
        ingredient_id: 'ing-001',
        ingredient_name: '食材A',
        price: 100,
        stock_fulfillment_rate: 90,
      },
      {
        ingredient_id: 'ing-002',
        ingredient_name: '食材B',
        price: 100,
        stock_fulfillment_rate: 70,
      },
      {
        ingredient_id: 'ing-003',
        ingredient_name: '食材C',
        price: 100,
        stock_fulfillment_rate: 85,
      },
    ];

    const params = {
      ingredients: ingredients,
      season_priority_weight: 0.3,
      discount_priority_weight: 0.2,
      stock_priority_weight: 0.5,
    };

    // スコア計算を実行
    const result = calculateMealOptimizationScore(params);

    // スコア計算結果のランキング順序を取得
    const ranked_ingredients = result.ranked_ingredients;

    // 価格が同一の食材について、在庫充足度の高い順に並んでいることを確認
    expect(ranked_ingredients.length).toBe(3);

    // 第1位: 食材A（在庫充足度 90%）
    expect(ranked_ingredients[0].ingredient_id).toBe('ing-001');
    expect(ranked_ingredients[0].ingredient_name).toBe('食材A');
    expect(ranked_ingredients[0].optimization_score).toBe(70);
    expect(ranked_ingredients[0].stock_fulfillment_rate).toBe(90);

    // 第2位: 食材C（在庫充足度 85%）
    expect(ranked_ingredients[1].ingredient_id).toBe('ing-003');
    expect(ranked_ingredients[1].ingredient_name).toBe('食材C');
    expect(ranked_ingredients[1].optimization_score).toBe(67.5);
    expect(ranked_ingredients[1].stock_fulfillment_rate).toBe(85);

    // 第3位: 食材B（在庫充足度 70%）
    expect(ranked_ingredients[2].ingredient_id).toBe('ing-002');
    expect(ranked_ingredients[2].ingredient_name).toBe('食材B');
    expect(ranked_ingredients[2].optimization_score).toBe(60);
    expect(ranked_ingredients[2].stock_fulfillment_rate).toBe(70);

    // 全体結果の検証
    expect(result.optimization_completed).toBe(true);
    expect(result.ranking_basis).toBe('stock_fulfillment_rate');
  });
});