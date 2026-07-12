import { validateMealPlans } from "../../src/logic/it-1-1-1";

describe("アルゴリズム改善反映後の献立妥当性判定", () => {
  test("SCEN-479: 制限条件が一つも設定されていない家族構成に対して改善献立の妥当性を判定できる", () => {
    // 制限条件が一つも設定されていない家族構成
    const familyComposition = {
      familyId: "fam_001",
      members: [
        {
          memberId: "mem_001",
          name: "父",
          age: 40,
          gender: "male",
          restrictions: [],
          allergies: [],
        },
        {
          memberId: "mem_002",
          name: "母",
          age: 38,
          gender: "female",
          restrictions: [],
          allergies: [],
        },
        {
          memberId: "mem_003",
          name: "長男",
          age: 10,
          gender: "male",
          restrictions: [],
          allergies: [],
        },
      ],
    };

    // 改善献立アルゴリズムによって生成された献立情報
    const improvedMealPlans = [
      {
        mealPlanId: "plan_001",
        date: "2024-01-15",
        meals: [
          {
            mealId: "meal_001",
            name: "鶏の照り焼き",
            ingredients: ["鶏肉", "醤油", "砂糖", "みりん"],
            cookingTimeMinutes: 20,
            nutritionInfo: {
              calories: 350,
              protein: 30,
              carbs: 15,
              fat: 12,
              fiber: 2,
            },
          },
          {
            mealId: "meal_002",
            name: "野菜サラダ",
            ingredients: ["レタス", "トマト", "きゅうり", "ニンジン"],
            cookingTimeMinutes: 5,
            nutritionInfo: {
              calories: 80,
              protein: 2,
              carbs: 15,
              fat: 1,
              fiber: 3,
            },
          },
        ],
      },
      {
        mealPlanId: "plan_002",
        date: "2024-01-16",
        meals: [
          {
            mealId: "meal_003",
            name: "魚のムニエル",
            ingredients: ["白身魚", "バター", "レモン", "小麦粉"],
            cookingTimeMinutes: 15,
            nutritionInfo: {
              calories: 280,
              protein: 28,
              carbs: 8,
              fat: 14,
              fiber: 1,
            },
          },
          {
            mealId: "meal_004",
            name: "ポテトサラダ",
            ingredients: ["ジャガイモ", "マヨネーズ", "卵", "玉ねぎ"],
            cookingTimeMinutes: 10,
            nutritionInfo: {
              calories: 200,
              protein: 5,
              carbs: 20,
              fat: 11,
              fiber: 2,
            },
          },
        ],
      },
    ];

    // 改善献立の妥当性判定ロジックを実行
    const validationResult = validateMealPlans({
      familyComposition,
      mealPlans: improvedMealPlans,
    });

    // 期待結果: ステータスコードが成功（200）
    expect(validationResult.statusCode).toBe(200);

    // 期待結果: 判定結果フラグがtrueとなる（制限条件がないため全ての献立が有効）
    expect(validationResult.isValid).toBe(true);

    // 期待結果: すべての献立が有効と判定される
    expect(validationResult.mealValidations).toHaveLength(2);
    expect(validationResult.mealValidations[0].isValid).toBe(true);
    expect(validationResult.mealValidations[0].mealPlanId).toBe("plan_001");
    expect(validationResult.mealValidations[1].isValid).toBe(true);
    expect(validationResult.mealValidations[1].mealPlanId).toBe("plan_002");

    // 期待結果: 詳細メッセージが適切に返される
    expect(validationResult.message).toBe(
      "制限条件がないため全ての献立が有効です"
    );

    // 期待結果: 各献立の検証詳細も確認
    expect(validationResult.mealValidations[0].details).toEqual({
      restrictionCheck: "passed",
      allergyCheck: "passed",
      nutritionCheck: "passed",
    });
    expect(validationResult.mealValidations[1].details).toEqual({
      restrictionCheck: "passed",
      allergyCheck: "passed",
      nutritionCheck: "passed",
    });
  });
});