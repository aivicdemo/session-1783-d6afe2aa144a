import { validateMealPlanValidity } from "../../src/logic/it-1-1-1";

describe("アルゴリズム改善反映後の献立妥当性判定", () => {
  test("SCEN-477: 改善反映後の献立が全制限条件・嗜好・栄養基準を満たす場合、妥当判定で結果が記録される", () => {
    // テストユーザーの制限条件
    const userRestrictions = {
      userId: "user_001",
      allergies: ["卵", "牛乳"],
      religiousRestrictions: ["豚肉"],
      dietaryRestrictions: ["グルテンフリー"]
    };

    // テストユーザーの食事嗜好
    const userPreferences = {
      userId: "user_001",
      favoriteIngredients: ["鶏肉", "米", "トマト"],
      dislikedIngredients: ["納豆", "レバー"]
    };

    // 1日の栄養基準値
    const dailyNutritionStandard = {
      calorieMin: 1800,
      calorieMax: 2200,
      proteinMin: 50,
      proteinMax: 100,
      fatMin: 50,
      fatMax: 80,
      carbohydrateMin: 225,
      carbohydrateMax: 325
    };

    // 生成された献立データ
    const generatedMealPlan = {
      mealPlanId: "meal_plan_20240115_001",
      userId: "user_001",
      date: "2024-01-15",
      meals: [
        {
          mealType: "breakfast",
          dishes: ["米", "鶏肉スープ", "トマトサラダ"],
          ingredients: ["米", "鶏肉", "トマト", "玉ねぎ", "塩"]
        },
        {
          mealType: "lunch",
          dishes: ["鶏肉カレー", "白米", "野菜スティック"],
          ingredients: ["鶏肉", "米", "トマト", "人参", "玉ねぎ"]
        },
        {
          mealType: "dinner",
          dishes: ["鶏肉グリル", "米", "ブロッコリー"],
          ingredients: ["鶏肉", "米", "ブロッコリー", "レモン", "オリーブオイル"]
        }
      ],
      totalNutrition: {
        calories: 2000,
        protein: 75,
        fat: 65,
        carbohydrate: 280
      }
    };

    // 献立妥当性判定実行
    const validationResult = validateMealPlanValidity({
      mealPlan: generatedMealPlan,
      userRestrictions: userRestrictions,
      userPreferences: userPreferences,
      dailyNutritionStandard: dailyNutritionStandard,
      algorithmVersion: "v2.1_improved"
    });

    // 妥当性判定結果の検証
    expect(validationResult.isValid).toBe(true);
    expect(validationResult.validityJudgment).toBe("妥当");
    expect(validationResult.mealPlanId).toBe("meal_plan_20240115_001");
    expect(validationResult.userId).toBe("user_001");
    expect(validationResult.judgmentDate).toBe("2024-01-15");

    // 制限条件充足度の検証
    expect(validationResult.restrictionComplianceScore).toBe(100);
    expect(validationResult.hasAllergyViolation).toBe(false);
    expect(validationResult.hasReligiousViolation).toBe(false);
    expect(validationResult.hasDietaryViolation).toBe(false);

    // 嗜好反映度の検証
    expect(validationResult.preferenceAlignmentScore).toBeGreaterThanOrEqual(80);
    expect(validationResult.favoriteIngredientsIncluded).toEqual(["鶏肉", "米", "トマト"]);
    expect(validationResult.dislikedIngredientsExcluded).toBe(true);

    // 栄養基準充足度の検証
    expect(validationResult.calorieComplianceScore).toBe(100);
    expect(validationResult.proteinComplianceScore).toBe(100);
    expect(validationResult.fatComplianceScore).toBe(100);
    expect(validationResult.carbohydrateComplianceScore).toBe(100);
    expect(validationResult.nutritionComplianceOverallScore).toBe(100);

    // 総合評価スコア
    expect(validationResult.overallValidityScore).toBe(100);

    // 記録データの検証
    expect(validationResult.recordedAt).toBe("2024-01-15T09:00:00Z");
    expect(validationResult.algorithmVersionApplied).toBe("v2.1_improved");
    expect(validationResult.validationDetails).toHaveProperty("restrictionComplianceDetails");
    expect(validationResult.validationDetails).toHaveProperty("preferenceAlignmentDetails");
    expect(validationResult.validationDetails).toHaveProperty("nutritionComplianceDetails");

    // エラーケース: 制限条件違反がある場合
    const invalidMealPlanWithAllergen = {
      mealPlanId: "meal_plan_20240115_002",
      userId: "user_001",
      date: "2024-01-15",
      meals: [
        {
          mealType: "breakfast",
          dishes: ["オムレツ", "牛乳入りパン"],
          ingredients: ["卵", "牛乳", "バター"]
        }
      ],
      totalNutrition: { calories: 500, protein: 20, fat: 30, carbohydrate: 50 }
    };

    expect(() =>
      validateMealPlanValidity({
        mealPlan: invalidMealPlanWithAllergen,
        userRestrictions: userRestrictions,
        userPreferences: userPreferences,
        dailyNutritionStandard: dailyNutritionStandard,
        algorithmVersion: "v2.1_improved"
      })
    ).toThrow(/アレルギー/);

    // エラーケース: 宗教的制限違反がある場合
    const invalidMealPlanWithReligious = {
      mealPlanId: "meal_plan_20240115_003",
      userId: "user_001",
      date: "2024-01-15",
      meals: [
        {
          mealType: "lunch",
          dishes: ["豚肉カツ"],
          ingredients: ["豚肉", "卵", "パン粉"]
        }
      ],
      totalNutrition: { calories: 600, protein: 30, fat: 40, carbohydrate: 60 }
    };

    expect(() =>
      validateMealPlanValidity({
        mealPlan: invalidMealPlanWithReligious,
        userRestrictions: userRestrictions,
        userPreferences: userPreferences,
        dailyNutritionStandard: dailyNutritionStandard,
        algorithmVersion: "v2.1_improved"
      })
    ).toThrow(/宗教的制限/);

    // エラーケース: 栄養基準不足
    const invalidMealPlanLowNutrition = {
      mealPlanId: "meal_plan_20240115_004",
      userId: "user_001",
      date: "2024-01-15",
      meals: [
        {
          mealType: "breakfast",
          dishes: ["米"],
          ingredients: ["米"]
        }
      ],
      totalNutrition: {
        calories: 800,
        protein: 20,
        fat: 15,
        carbohydrate: 150
      }
    };

    expect(() =>
      validateMealPlanValidity({
        mealPlan: invalidMealPlanLowNutrition,
        userRestrictions: userRestrictions,
        userPreferences: userPreferences,
        dailyNutritionStandard: dailyNutritionStandard,
        algorithmVersion: "v2.1_improved"
      })
    ).toThrow(/栄養基準/);

    // エラーケース: グルテンフリー制限違反
    const invalidMealPlanGluten = {
      mealPlanId: "meal_plan_20240115_005",
      userId: "user_001",
      date: "2024-01-15",
      meals: [
        {
          mealType: "dinner",
          dishes: ["パスタ"],
          ingredients: ["小麦粉パスタ", "トマトソース"]
        }
      ],
      totalNutrition: { calories: 1500, protein: 40, fat: 50, carbohydrate: 200 }
    };

    expect(() =>
      validateMealPlanValidity({
        mealPlan: invalidMealPlanGluten,
        userRestrictions: userRestrictions,
        userPreferences: userPreferences,
        dailyNutritionStandard: dailyNutritionStandard,
        algorithmVersion: "v2.1_improved"
      })
    ).toThrow(/グルテンフリー/);

    // 境界値テスト: カロリー最小値ちょうど
    const mealPlanMinCalorie = {
      mealPlanId: "meal_plan_20240115_006",
      userId: "user_001",
      date: "2024-01-15",
      meals: [
        {
          mealType: "breakfast",
          dishes: ["米", "鶏肉"],
          ingredients: ["米", "鶏肉"]
        }
      ],
      totalNutrition: {
        calories: 1800,
        protein: 50,
        fat: 50,
        carbohydrate: 225
      }
    };

    const resultMinCalorie = validateMealPlanValidity({
      mealPlan: mealPlanMinCalorie,
      userRestrictions: userRestrictions,
      userPreferences: userPreferences,
      dailyNutritionStandard: dailyNutritionStandard,
      algorithmVersion: "v2.1_improved"
    });

    expect(resultMinCalorie.isValid).toBe(true);
    expect(resultMinCalorie.calorieComplianceScore).toBe(100);

    // 境界値テスト: カロリー最大値ちょうど
    const mealPlanMaxCalorie = {
      mealPlanId: "meal_plan_20240115_007",
      userId: "user_001",
      date: "2024-01-15",
      meals: [
        {
          mealType: "breakfast",
          dishes: ["米", "鶏肉"],
          ingredients: ["米", "鶏肉"]
        }
      ],
      totalNutrition: {
        calories: 2200,
        protein: 100,
        fat: 80,
        carbohydrate: 325
      }
    };

    const resultMaxCalorie = validateMealPlanValidity({
      mealPlan: mealPlanMaxCalorie,
      userRestrictions: userRestrictions,
      userPreferences: userPreferences,
      dailyNutritionStandard: dailyNutritionStandard,
      algorithmVersion: "v2.1_improved"
    });

    expect(resultMaxCalorie.isValid).toBe(true);
    expect(resultMaxCalorie.calorieComplianceScore).toBe(100);

    // 複合条件テスト: 複数の好物が含まれ、嫌いな食材が除外されている
    const mealPlanMultiplePreferences = {
      mealPlanId: "meal_plan_20240115_008",
      userId: "user_001",
      date: "2024-01-15",
      meals: [
        {
          mealType: "breakfast",
          dishes: ["米", "鶏肉スープ", "トマトサラダ"],
          ingredients: ["米", "鶏肉", "トマト"]
        },
        {
          mealType: "lunch",
          dishes: ["鶏肉", "米", "トマト"],
          ingredients: ["鶏肉", "米", "トマト"]
        },
        {
          mealType: "dinner",
          dishes: ["鶏肉グリル", "米", "トマト"],
          ingredients: ["鶏肉", "米", "トマト"]
        }
      ],
      totalNutrition: {
        calories: 2000,
        protein: 75,
        fat: 65,
        carbohydrate: 280
      }
    };

    const resultMultiPreferences = validateMealPlanValidity({
      mealPlan: mealPlanMultiplePreferences,
      userRestrictions: userRestrictions,
      userPreferences: userPreferences,
      dailyNutritionStandard: dailyNutritionStandard,
      algorithmVersion: "v2.1_improved"
    });

    expect(resultMultiPreferences.isValid).toBe(true);
    expect(resultMultiPreferences.preferenceAlignmentScore).toBeGreaterThanOrEqual(90);
    expect(resultMultiPreferences.validityJudgment).toBe("妥当");
  });
});