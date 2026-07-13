import { validateMenuConfirmation } from '../../src/logic/it-1-br-2-1-1-1';

describe('献立確定時の全制約条件検証・確定可否判定機能', () => {
  // SCEN-329
  test('全制約条件を満たす献立案に対して確定可能判定が返される', async () => {
    const fetchMock = require('jest-fetch-mock');
    fetchMock.resetMocks();

    // テストデータ: 栄養基準値
    const nutritionStandards = {
      calories: { min: 1800, max: 2200 },
      protein: { min: 50, max: 70 },
      fat: { min: 50, max: 80 },
      carbohydrates: { min: 200, max: 300 },
      sodium: { min: 0, max: 2500 },
    };

    // テストデータ: 登録済みアレルギー除外対象
    const allergyExclusions = ['egg', 'shrimp', 'peanut'];

    // テストデータ: 予算上限（月次の一日分を想定）
    const budgetLimit = 1500;

    // テストデータ: 調理時間上限（分）
    const cookingTimeLimit = 90;

    // テストデータ: 在庫（食材ID: 必要数）
    const inventoryData = {
      chicken_breast: 600, // g
      rice: 450, // g
      carrot: 150, // g
      onion: 100, // g
      salt: 5, // g
      olive_oil: 20, // ml
    };

    // テストデータ: 献立案（複数の料理で構成）
    const mealPlan = {
      meal_id: 'meal_20240115_001',
      status: 'pending',
      dishes: [
        {
          dish_id: 'dish_001',
          name: 'Grilled Chicken with Rice',
          nutrition: {
            calories: 650,
            protein: 35,
            fat: 15,
            carbohydrates: 75,
            sodium: 800,
          },
          allergens: ['chicken'],
          price: 750,
          cooking_time: 40,
          ingredients: {
            chicken_breast: 300,
            rice: 225,
            salt: 2,
            olive_oil: 10,
          },
        },
        {
          dish_id: 'dish_002',
          name: 'Steamed Vegetables',
          nutrition: {
            calories: 280,
            protein: 12,
            fat: 8,
            carbohydrates: 45,
            sodium: 400,
          },
          allergens: ['none'],
          price: 450,
          cooking_time: 30,
          ingredients: {
            carrot: 150,
            onion: 100,
            salt: 3,
            olive_oil: 10,
          },
        },
        {
          dish_id: 'dish_003',
          name: 'Fresh Salad',
          nutrition: {
            calories: 320,
            protein: 10,
            fat: 18,
            carbohydrates: 38,
            sodium: 300,
          },
          allergens: ['none'],
          price: 300,
          cooking_time: 15,
          ingredients: {
            onion: 0,
            carrot: 0,
            salt: 0,
            olive_oil: 0,
          },
        },
      ],
    };

    // 献立案の栄養価を合算
    const aggregatedNutrition = {
      calories: 650 + 280 + 320,
      protein: 35 + 12 + 10,
      fat: 15 + 8 + 18,
      carbohydrates: 75 + 45 + 38,
      sodium: 800 + 400 + 300,
    };

    // 期待値の栄養基準値範囲内チェック
    expect(aggregatedNutrition.calories).toBeGreaterThanOrEqual(
      nutritionStandards.calories.min
    );
    expect(aggregatedNutrition.calories).toBeLessThanOrEqual(
      nutritionStandards.calories.max
    );
    expect(aggregatedNutrition.protein).toBeGreaterThanOrEqual(
      nutritionStandards.protein.min
    );
    expect(aggregatedNutrition.protein).toBeLessThanOrEqual(
      nutritionStandards.protein.max
    );
    expect(aggregatedNutrition.fat).toBeGreaterThanOrEqual(
      nutritionStandards.fat.min
    );
    expect(aggregatedNutrition.fat).toBeLessThanOrEqual(
      nutritionStandards.fat.max
    );
    expect(aggregatedNutrition.carbohydrates).toBeGreaterThanOrEqual(
      nutritionStandards.carbohydrates.min
    );
    expect(aggregatedNutrition.carbohydrates).toBeLessThanOrEqual(
      nutritionStandards.carbohydrates.max
    );
    expect(aggregatedNutrition.sodium).toBeGreaterThanOrEqual(
      nutritionStandards.sodium.min
    );
    expect(aggregatedNutrition.sodium).toBeLessThanOrEqual(
      nutritionStandards.sodium.max
    );

    // アレルギー検証: 献立案に含まれる全料理のアレルゲンを確認
    const mealAllergens = mealPlan.dishes
      .flatMap((dish) => dish.allergens)
      .filter((allergen) => allergen !== 'none');
    const hasExcludedAllergen = mealAllergens.some((allergen) =>
      allergyExclusions.includes(allergen)
    );
    expect(hasExcludedAllergen).toBe(false);

    // 予算検証: 献立案の合計金額が予算上限以下
    const totalPrice = mealPlan.dishes.reduce(
      (sum, dish) => sum + dish.price,
      0
    );
    expect(totalPrice).toBeLessThanOrEqual(budgetLimit);

    // 調理時間検証: 全料理の調理時間合計が上限以下
    const totalCookingTime = mealPlan.dishes.reduce(
      (sum, dish) => sum + dish.cooking_time,
      0
    );
    expect(totalCookingTime).toBeLessThanOrEqual(cookingTimeLimit);

    // 在庫検証: 献立案で使用する全食材の在庫数が必要数以上
    const requiredIngredients: { [key: string]: number } = {};
    mealPlan.dishes.forEach((dish) => {
      Object.entries(dish.ingredients).forEach(([ingredientId, quantity]) => {
        requiredIngredients[ingredientId] =
          (requiredIngredients[ingredientId] || 0) + quantity;
      });
    });

    Object.entries(requiredIngredients).forEach(([ingredientId, quantity]) => {
      if (quantity > 0) {
        expect(inventoryData[ingredientId]).toBeGreaterThanOrEqual(quantity);
      }
    });

    // モック: 献立確定APIレスポンス
    const confirmationResponse = {
      status: 200,
      meal_id: 'meal_20240115_001',
      can_confirm: true,
      confirmed_meal_id: 'meal_20240115_001_confirmed',
      updated_status: 'confirmed',
      timestamp: '2024-01-15T12:00:00Z',
    };

    fetchMock.mockResponseOnce(JSON.stringify(confirmationResponse), {
      status: 200,
    });

    // 献立確定APIに献立案を送信
    const result = await validateMenuConfirmation({
      meal_id: mealPlan.meal_id,
      nutrition_standards: nutritionStandards,
      allergy_exclusions: allergyExclusions,
      budget_limit: budgetLimit,
      cooking_time_limit: cookingTimeLimit,
      inventory: inventoryData,
      dishes: mealPlan.dishes,
    });

    // レスポンス検証: ステータスコードが200
    expect(result.status).toBe(200);

    // レスポンス検証: 確定可否判定が true
    expect(result.can_confirm).toBe(true);

    // レスポンス検証: 確定済み献立IDが返却
    expect(result.confirmed_meal_id).toBe('meal_20240115_001_confirmed');

    // レスポンス検証: ステータスが「confirmed」に更新
    expect(result.updated_status).toBe('confirmed');

    // API呼び出しが1回実行されたことを確認
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});