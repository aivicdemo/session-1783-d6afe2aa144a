import { calculateNutritionPriorityOrder } from "../../src/logic/it-1-br-2-1-1-1";

describe("ユーザー食事記録と栄養摂取量の推移データ集計・達成度可視化", () => {
  // SCEN-485: [edge] 栄養項目優先度判定 - 達成率が同一の複数栄養項目を優先度判定で正しく順序付けする
  test("達成率が同一の複数栄養項目を優先度判定ルール（重要度スコア+登録順序）で一貫性をもって順序付けする", () => {
    const nutritionItems = [
      {
        nutritionItemId: "protein",
        name: "タンパク質",
        targetValue: 60,
        actualValue: 45,
        achievementRate: 75,
        importanceScore: 10,
        registrationOrder: 1,
      },
      {
        nutritionItemId: "carb",
        name: "炭水化物",
        targetValue: 300,
        actualValue: 225,
        achievementRate: 75,
        importanceScore: 8,
        registrationOrder: 2,
      },
      {
        nutritionItemId: "fat",
        name: "脂質",
        targetValue: 60,
        actualValue: 45,
        achievementRate: 75,
        importanceScore: 6,
        registrationOrder: 3,
      },
      {
        nutritionItemId: "fiber",
        name: "食物繊維",
        targetValue: 25,
        actualValue: 18,
        achievementRate: 72,
        importanceScore: 9,
        registrationOrder: 4,
      },
    ];

    const result = calculateNutritionPriorityOrder(nutritionItems);

    // 同一達成率（75%）の栄養項目は重要度スコア降順で優先順位付け
    // protein（10） > carb（8） > fat（6）
    // fiber は達成率 72% で別グループ
    expect(result).toEqual([
      {
        nutritionItemId: "protein",
        name: "タンパク質",
        achievementRate: 75,
        importanceScore: 10,
        registrationOrder: 1,
        priorityRank: 1,
      },
      {
        nutritionItemId: "carb",
        name: "炭水化物",
        achievementRate: 75,
        importanceScore: 8,
        registrationOrder: 2,
        priorityRank: 2,
      },
      {
        nutritionItemId: "fat",
        name: "脂質",
        achievementRate: 75,
        importanceScore: 6,
        registrationOrder: 3,
        priorityRank: 3,
      },
      {
        nutritionItemId: "fiber",
        name: "食物繊維",
        achievementRate: 72,
        importanceScore: 9,
        registrationOrder: 4,
        priorityRank: 4,
      },
    ]);
  });

  test("同一達成率・同一重要度スコアの場合、登録順序に従って順序付けする", () => {
    const nutritionItems = [
      {
        nutritionItemId: "vitaminA",
        name: "ビタミンA",
        targetValue: 800,
        actualValue: 600,
        achievementRate: 75,
        importanceScore: 7,
        registrationOrder: 3,
      },
      {
        nutritionItemId: "vitaminC",
        name: "ビタミンC",
        targetValue: 100,
        actualValue: 75,
        achievementRate: 75,
        importanceScore: 7,
        registrationOrder: 1,
      },
      {
        nutritionItemId: "vitaminD",
        name: "ビタミンD",
        targetValue: 20,
        actualValue: 15,
        achievementRate: 75,
        importanceScore: 7,
        registrationOrder: 2,
      },
    ];

    const result = calculateNutritionPriorityOrder(nutritionItems);

    // 達成率・重要度スコアが同一の場合、登録順序でソート
    expect(result).toEqual([
      {
        nutritionItemId: "vitaminC",
        name: "ビタミンC",
        achievementRate: 75,
        importanceScore: 7,
        registrationOrder: 1,
        priorityRank: 1,
      },
      {
        nutritionItemId: "vitaminD",
        name: "ビタミンD",
        achievementRate: 75,
        importanceScore: 7,
        registrationOrder: 2,
        priorityRank: 2,
      },
      {
        nutritionItemId: "vitaminA",
        name: "ビタミンA",
        achievementRate: 75,
        importanceScore: 7,
        registrationOrder: 3,
        priorityRank: 3,
      },
    ]);
  });

  test("3項目以上の同一達成率に対して優先度ルール（重要度→登録順）を一貫して適用する", () => {
    const nutritionItems = [
      {
        nutritionItemId: "item1",
        name: "栄養素1",
        targetValue: 100,
        actualValue: 75,
        achievementRate: 75,
        importanceScore: 5,
        registrationOrder: 4,
      },
      {
        nutritionItemId: "item2",
        name: "栄養素2",
        targetValue: 100,
        actualValue: 75,
        achievementRate: 75,
        importanceScore: 9,
        registrationOrder: 2,
      },
      {
        nutritionItemId: "item3",
        name: "栄養素3",
        targetValue: 100,
        actualValue: 75,
        achievementRate: 75,
        importanceScore: 7,
        registrationOrder: 1,
      },
      {
        nutritionItemId: "item4",
        name: "栄養素4",
        targetValue: 100,
        actualValue: 75,
        achievementRate: 75,
        importanceScore: 7,
        registrationOrder: 3,
      },
      {
        nutritionItemId: "item5",
        name: "栄養素5",
        targetValue: 100,
        actualValue: 75,
        achievementRate: 75,
        importanceScore: 3,
        registrationOrder: 5,
      },
    ];

    const result = calculateNutritionPriorityOrder(nutritionItems);

    // 達成率 75% で統一
    // 重要度スコア: 9（item2） > 7（item3, item4） > 5（item1） > 3（item5）
    // 重要度 7 の中では登録順序: 1（item3） < 3（item4）
    expect(result).toEqual([
      {
        nutritionItemId: "item2",
        name: "栄養素2",
        achievementRate: 75,
        importanceScore: 9,
        registrationOrder: 2,
        priorityRank: 1,
      },
      {
        nutritionItemId: "item3",
        name: "栄養素3",
        achievementRate: 75,
        importanceScore: 7,
        registrationOrder: 1,
        priorityRank: 2,
      },
      {
        nutritionItemId: "item4",
        name: "栄養素4",
        achievementRate: 75,
        importanceScore: 7,
        registrationOrder: 3,
        priorityRank: 3,
      },
      {
        nutritionItemId: "item1",
        name: "栄養素1",
        achievementRate: 75,
        importanceScore: 5,
        registrationOrder: 4,
        priorityRank: 4,
      },
      {
        nutritionItemId: "item5",
        name: "栄養素5",
        achievementRate: 75,
        importanceScore: 3,
        registrationOrder: 5,
        priorityRank: 5,
      },
    ]);
  });

  test("達成率が異なる栄養項目は達成率の低い順に、同一達成率内では重要度スコアで優先順位付けする", () => {
    const nutritionItems = [
      {
        nutritionItemId: "high_achieve",
        name: "高達成",
        targetValue: 100,
        actualValue: 90,
        achievementRate: 90,
        importanceScore: 8,
        registrationOrder: 1,
      },
      {
        nutritionItemId: "low_achieve_high_importance",
        name: "低達成_高重要度",
        targetValue: 100,
        actualValue: 50,
        achievementRate: 50,
        importanceScore: 10,
        registrationOrder: 2,
      },
      {
        nutritionItemId: "mid_achieve_low_importance",
        name: "中達成_低重要度",
        targetValue: 100,
        actualValue: 75,
        achievementRate: 75,
        importanceScore: 4,
        registrationOrder: 3,
      },
      {
        nutritionItemId: "mid_achieve_high_importance",
        name: "中達成_高重要度",
        targetValue: 100,
        actualValue: 75,
        achievementRate: 75,
        importanceScore: 9,
        registrationOrder: 4,
      },
    ];

    const result = calculateNutritionPriorityOrder(nutritionItems);

    // 優先度順: 達成率 50% > 75%（重要度9） > 75%（重要度4） > 90%
    expect(result).toEqual([
      {
        nutritionItemId: "low_achieve_high_importance",
        name: "低達成_高重要度",
        achievementRate: 50,
        importanceScore: 10,
        registrationOrder: 2,
        priorityRank: 1,
      },
      {
        nutritionItemId: "mid_achieve_high_importance",
        name: "中達成_高重要度",
        achievementRate: 75,
        importanceScore: 9,
        registrationOrder: 4,
        priorityRank: 2,
      },
      {
        nutritionItemId: "mid_achieve_low_importance",
        name: "中達成_低重要度",
        achievementRate: 75,
        importanceScore: 4,
        registrationOrder: 3,
        priorityRank: 3,
      },
      {
        nutritionItemId: "high_achieve",
        name: "高達成",
        achievementRate: 90,
        importanceScore: 8,
        registrationOrder: 1,
        priorityRank: 4,
      },
    ]);
  });

  test("空の栄養項目リストが渡された場合は空配列を返す", () => {
    const nutritionItems: any[] = [];

    const result = calculateNutritionPriorityOrder(nutritionItems);

    expect(result).toEqual([]);
  });

  test("単一の栄養項目の場合、priorityRank=1で返す", () => {
    const nutritionItems = [
      {
        nutritionItemId: "single",
        name: "単一栄養素",
        targetValue: 100,
        actualValue: 75,
        achievementRate: 75,
        importanceScore: 8,
        registrationOrder: 1,
      },
    ];

    const result = calculateNutritionPriorityOrder(nutritionItems);

    expect(result).toEqual([
      {
        nutritionItemId: "single",
        name: "単一栄養素",
        achievementRate: 75,
        importanceScore: 8,
        registrationOrder: 1,
        priorityRank: 1,
      },
    ]);
  });
});