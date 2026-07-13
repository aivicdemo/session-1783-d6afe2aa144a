import { calculateNutritionAchievementDashboard } from "../../src/logic/it-1-br-2-1-1-1";

describe("栄養項目別達成度計算と改善ギャップの優先度付け可視化", () => {
  // SCEN-344
  test("複数の栄養項目について達成度が百分率で正確に計算され、ギャップが優先度順に可視化される", () => {
    const input = {
      nutritionItems: [
        {
          itemId: "protein",
          itemName: "タンパク質",
          targetValue: 50,
          actualValue: 45,
          unit: "g",
        },
        {
          itemId: "calcium",
          itemName: "カルシウム",
          targetValue: 800,
          actualValue: 600,
          unit: "mg",
        },
        {
          itemId: "vitaminC",
          itemName: "ビタミンC",
          targetValue: 100,
          actualValue: 85,
          unit: "mg",
        },
        {
          itemId: "fiber",
          itemName: "食物繊維",
          targetValue: 20,
          actualValue: 12,
          unit: "g",
        },
      ],
    };

    const result = calculateNutritionAchievementDashboard(input);

    // 達成度計算の検証 (実績値÷目標値×100)
    expect(result.achievementScores).toEqual({
      protein: 90.0, // 45÷50×100 = 90.0
      calcium: 75.0, // 600÷800×100 = 75.0
      vitaminC: 85.0, // 85÷100×100 = 85.0
      fiber: 60.0, // 12÷20×100 = 60.0
    });

    // 改善ギャップの計算 (目標値 - 実績値)
    expect(result.improvementGaps).toEqual({
      protein: 5, // 50 - 45 = 5
      calcium: 200, // 800 - 600 = 200
      vitaminC: 15, // 100 - 85 = 15
      fiber: 8, // 20 - 12 = 8
    });

    // ギャップの優先度付け (大きい順)
    expect(result.gapPriorities).toEqual([
      { itemId: "calcium", itemName: "カルシウム", gap: 200, priority: 1 },
      { itemId: "vitaminC", itemName: "ビタミンC", gap: 15, priority: 2 },
      { itemId: "protein", itemName: "タンパク質", gap: 5, priority: 3 },
      { itemId: "fiber", itemName: "食物繊維", gap: 8, priority: 4 },
    ]);

    // 100%以上と100%未満の分類
    expect(result.classification).toEqual({
      above100Percent: [],
      below100Percent: [
        { itemId: "protein", itemName: "タンパク質", achievement: 90.0 },
        { itemId: "calcium", itemName: "カルシウム", achievement: 75.0 },
        { itemId: "vitaminC", itemName: "ビタミンC", achievement: 85.0 },
        { itemId: "fiber", itemName: "食物繊維", achievement: 60.0 },
      ],
    });

    // ダッシュボード可視化データの検証
    expect(result.visualization).toEqual({
      format: "ranking",
      sortedByGapDescending: [
        {
          rank: 1,
          itemId: "calcium",
          itemName: "カルシウム",
          achievement: 75.0,
          gap: 200,
          color: "red",
        },
        {
          rank: 2,
          itemId: "vitaminC",
          itemName: "ビタミンC",
          achievement: 85.0,
          gap: 15,
          color: "orange",
        },
        {
          rank: 3,
          itemId: "fiber",
          itemName: "食物繊維",
          achievement: 60.0,
          gap: 8,
          color: "yellow",
        },
        {
          rank: 4,
          itemId: "protein",
          itemName: "タンパク質",
          achievement: 90.0,
          gap: 5,
          color: "lightyellow",
        },
      ],
    });
  });

  test("実績値の変更に応じて達成度とギャップ優先度がリアルタイムで正確に再計算・更新される", () => {
    const initialInput = {
      nutritionItems: [
        {
          itemId: "protein",
          itemName: "タンパク質",
          targetValue: 50,
          actualValue: 30,
          unit: "g",
        },
        {
          itemId: "calcium",
          itemName: "カルシウム",
          targetValue: 800,
          actualValue: 400,
          unit: "mg",
        },
      ],
    };

    const initialResult = calculateNutritionAchievementDashboard(initialInput);

    // 初期状態の達成度
    expect(initialResult.achievementScores).toEqual({
      protein: 60.0, // 30÷50×100 = 60.0
      calcium: 50.0, // 400÷800×100 = 50.0
    });

    expect(initialResult.improvementGaps).toEqual({
      protein: 20, // 50 - 30 = 20
      calcium: 400, // 800 - 400 = 400
    });

    // 実績値を更新
    const updatedInput = {
      nutritionItems: [
        {
          itemId: "protein",
          itemName: "タンパク質",
          targetValue: 50,
          actualValue: 48,
          unit: "g",
        },
        {
          itemId: "calcium",
          itemName: "カルシウム",
          targetValue: 800,
          actualValue: 700,
          unit: "mg",
        },
      ],
    };

    const updatedResult = calculateNutritionAchievementDashboard(updatedInput);

    // 更新後の達成度
    expect(updatedResult.achievementScores).toEqual({
      protein: 96.0, // 48÷50×100 = 96.0
      calcium: 87.5, // 700÷800×100 = 87.5
    });

    expect(updatedResult.improvementGaps).toEqual({
      protein: 2, // 50 - 48 = 2
      calcium: 100, // 800 - 700 = 100
    });

    // 優先度も再計算される (カルシウムのギャップが大きいので優先度1)
    expect(updatedResult.gapPriorities).toEqual([
      { itemId: "calcium", itemName: "カルシウム", gap: 100, priority: 1 },
      { itemId: "protein", itemName: "タンパク質", gap: 2, priority: 2 },
    ]);
  });

  test("達成度が100%以上の項目と100%未満の項目が正しく分類・表示される", () => {
    const input = {
      nutritionItems: [
        {
          itemId: "protein",
          itemName: "タンパク質",
          targetValue: 50,
          actualValue: 55,
          unit: "g",
        },
        {
          itemId: "calcium",
          itemName: "カルシウム",
          targetValue: 800,
          actualValue: 800,
          unit: "mg",
        },
        {
          itemId: "vitaminC",
          itemName: "ビタミンC",
          targetValue: 100,
          actualValue: 75,
          unit: "mg",
        },
        {
          itemId: "fiber",
          itemName: "食物繊維",
          targetValue: 20,
          actualValue: 30,
          unit: "g",
        },
      ],
    };

    const result = calculateNutritionAchievementDashboard(input);

    // 達成度の計算確認
    expect(result.achievementScores).toEqual({
      protein: 110.0, // 55÷50×100 = 110.0
      calcium: 100.0, // 800÷800×100 = 100.0
      vitaminC: 75.0, // 75÷100×100 = 75.0
      fiber: 150.0, // 30÷20×100 = 150.0
    });

    // 100%以上と100%未満の分類
    expect(result.classification).toEqual({
      above100Percent: [
        { itemId: "protein", itemName: "タンパク質", achievement: 110.0 },
        { itemId: "calcium", itemName: "カルシウム", achievement: 100.0 },
        { itemId: "fiber", itemName: "食物繊維", achievement: 150.0 },
      ],
      below100Percent: [
        { itemId: "vitaminC", itemName: "ビタミンC", achievement: 75.0 },
      ],
    });

    // 改善ギャップ (100%以上の項目はギャップが負またはゼロ)
    expect(result.improvementGaps).toEqual({
      protein: -5, // 50 - 55 = -5
      calcium: 0, // 800 - 800 = 0
      vitaminC: 25, // 100 - 75 = 25
      fiber: -10, // 20 - 30 = -10
    });
  });
});