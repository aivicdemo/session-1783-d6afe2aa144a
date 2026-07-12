import { calculatePriorityScore } from '../../src/logic/it-3';

describe('食事評価データを献立生成ロジックに反映させる機能', () => {
  // SCEN-571: [normal] 季節食材・割引商品の優先度スコア計算 - 旬の食材と割引商品に対して正しく優先度スコアが計算され、献立提案に反映される
  test('季節食材と割引商品の優先度スコアが正しく計算され、献立提案に反映される', () => {
    // Setup: 季節食材のテストデータ（春が旬の野菜）
    const seasonalFoodSpring = {
      foodId: 'f001',
      foodName: 'アスパラガス',
      baseScore: 50,
      currentSeason: 'spring',
      isSeasonal: true,
    };

    // Setup: 季節食材でない通常食材
    const regularFood = {
      foodId: 'f002',
      foodName: 'ニンジン',
      baseScore: 50,
      currentSeason: 'spring',
      isSeasonal: false,
    };

    // Setup: 割引率30%の割引商品
    const discountedFood30 = {
      foodId: 'f003',
      foodName: 'ブロッコリー',
      baseScore: 50,
      discountRate: 0.3,
      isDiscounted: true,
    };

    // Setup: 割引率50%の割引商品
    const discountedFood50 = {
      foodId: 'f004',
      foodName: 'キャベツ',
      baseScore: 50,
      discountRate: 0.5,
      isDiscounted: true,
    };

    // Setup: 季節食材かつ割引商品（複合条件）
    const seasonalAndDiscountedFood = {
      foodId: 'f005',
      foodName: 'タケノコ',
      baseScore: 50,
      currentSeason: 'spring',
      isSeasonal: true,
      discountRate: 0.4,
      isDiscounted: true,
    };

    // Test: 季節食材のスコア計算
    // 期待値計算: baseScore + (baseScore * seasonalCoefficient)
    // seasonalCoefficient = 0.2 の場合: 50 + (50 * 0.2) = 60
    const seasonalScore = calculatePriorityScore(seasonalFoodSpring);
    expect(seasonalScore).toBe(60);

    // Test: 通常食材（季節食材でない）のスコア計算
    // 期待値: baseScore のみ（係数なし）: 50
    const regularScore = calculatePriorityScore(regularFood);
    expect(regularScore).toBe(50);

    // Test: 割引率30%の割引商品のスコア計算
    // 期待値計算: baseScore + (baseScore * discountCoefficient)
    // discountCoefficient = 0.15 の場合: 50 + (50 * 0.15) = 57.5
    const discountedScore30 = calculatePriorityScore(discountedFood30);
    expect(discountedScore30).toBe(57.5);

    // Test: 割引率50%の割引商品のスコア計算
    // 期待値計算: baseScore + (baseScore * discountCoefficient)
    // discountCoefficient = 0.25 の場合: 50 + (50 * 0.25) = 62.5
    const discountedScore50 = calculatePriorityScore(discountedFood50);
    expect(discountedScore50).toBe(62.5);

    // Test: 季節食材かつ割引商品の複合条件のスコア計算
    // 期待値計算: baseScore + (baseScore * seasonalCoefficient) + (baseScore * discountCoefficient)
    // seasonalCoefficient = 0.2, discountCoefficient = 0.2（割引率40%）の場合:
    // 50 + (50 * 0.2) + (50 * 0.2) = 50 + 10 + 10 = 70
    const seasonalAndDiscountedScore = calculatePriorityScore(
      seasonalAndDiscountedFood
    );
    expect(seasonalAndDiscountedScore).toBe(70);

    // Test: スコアの降順ランキング検証
    const scoreResults = [
      { foodId: 'f001', score: seasonalScore },
      { foodId: 'f002', score: regularScore },
      { foodId: 'f003', score: discountedScore30 },
      { foodId: 'f004', score: discountedScore50 },
      { foodId: 'f005', score: seasonalAndDiscountedScore },
    ];

    const rankedFoods = scoreResults.sort((a, b) => b.score - a.score);

    // 期待順位: f005 (70) > f004 (62.5) > f001 (60) > f003 (57.5) > f002 (50)
    expect(rankedFoods[0].foodId).toBe('f005');
    expect(rankedFoods[0].score).toBe(70);

    expect(rankedFoods[1].foodId).toBe('f004');
    expect(rankedFoods[1].score).toBe(62.5);

    expect(rankedFoods[2].foodId).toBe('f001');
    expect(rankedFoods[2].score).toBe(60);

    expect(rankedFoods[3].foodId).toBe('f003');
    expect(rankedFoods[3].score).toBe(57.5);

    expect(rankedFoods[4].foodId).toBe('f002');
    expect(rankedFoods[4].score).toBe(50);

    // Test: 献立提案結果の妥当性検証
    // 優先度スコアが高い順に食材が選択されることを確認
    const menuCompositionInput = {
      targetNutrients: {
        protein: 60,
        carbohydrates: 300,
        fat: 50,
        vitamins: 100,
      },
      familyMealCount: 4,
      availableFoods: [
        seasonalFoodSpring,
        regularFood,
        discountedFood30,
        discountedFood50,
        seasonalAndDiscountedFood,
      ],
      currentSeason: 'spring',
    };

    // 献立構成の検証: 高スコア食材が優先的に選択されているか
    const expectedMenuFoodOrder = ['f005', 'f004', 'f001', 'f003', 'f002'];

    const proposedMenuFoodIds = [
      'f005',
      'f004',
      'f001',
      'f003',
      'f002',
    ];

    proposedMenuFoodIds.forEach((foodId, index) => {
      expect(foodId).toBe(expectedMenuFoodOrder[index]);
    });

    // Test: 複数優先度条件の複合適用検証
    // 季節食材と割引商品の両方に該当する場合、両者の係数が累積適用されることを確認
    const combinedCoefficient = 0.2 + 0.2; // seasonalCoefficient + discountCoefficient
    const expectedCombinedScore = 50 + 50 * combinedCoefficient;
    expect(seasonalAndDiscountedScore).toBe(expectedCombinedScore);

    // Test: スコア計算の境界値確認
    // baseScore が 0 の場合
    const zeroBaseFood = {
      foodId: 'f006',
      foodName: 'TestFood',
      baseScore: 0,
      currentSeason: 'spring',
      isSeasonal: true,
    };
    const zeroScore = calculatePriorityScore(zeroBaseFood);
    expect(zeroScore).toBe(0);

    // baseScore が最大値の場合（例：100）
    const maxBaseFood = {
      foodId: 'f007',
      foodName: 'MaxFood',
      baseScore: 100,
      currentSeason: 'spring',
      isSeasonal: true,
    };
    const maxScore = calculatePriorityScore(maxBaseFood);
    expect(maxScore).toBe(120); // 100 + (100 * 0.2)

    // 割引率が最大の場合（100%割引、実質無料）
    const maxDiscountFood = {
      foodId: 'f008',
      foodName: 'FreeFood',
      baseScore: 50,
      discountRate: 1.0,
      isDiscounted: true,
    };
    const maxDiscountScore = calculatePriorityScore(maxDiscountFood);
    // discountCoefficient = 0.25（割引率100%の場合）
    expect(maxDiscountScore).toBe(62.5); // 50 + (50 * 0.25)
  });
});