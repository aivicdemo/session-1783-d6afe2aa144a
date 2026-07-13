import { calculateNutrientDeviationQuantification } from "../../src/logic/it-1-br-2-1-1-1";

describe("乖離度定量化機能 - 栄養項目別達成度と改善ギャップの可視化", () => {
  // SCEN-489: [error] 乖離度定量化 - 目標値が定義されていない栄養項目に対してエラーを返す
  test("目標値が定義されていない栄養項目でエラーを返す", () => {
    const nutritionRecordData = {
      userId: "user_001",
      recordDate: "2024-01-15",
      nutritionItems: [
        {
          nutrientId: "nutrient_001",
          nutrientName: "タンパク質",
          actualIntake: 65,
          unit: "g",
          targetValue: 60,
        },
        {
          nutrientId: "nutrient_002",
          nutrientName: "ビタミンA",
          actualIntake: 800,
          unit: "μg",
          targetValue: null, // 目標値が定義されていない
        },
      ],
    };

    expect(() =>
      calculateNutrientDeviationQuantification(nutritionRecordData)
    ).toThrow(/目標値/);
  });

  // 正常系：目標値が定義されている場合に乖離度を計算して返す
  test("全栄養項目に目標値が定義されている場合に乖離度を計算する", () => {
    const nutritionRecordData = {
      userId: "user_001",
      recordDate: "2024-01-15",
      nutritionItems: [
        {
          nutrientId: "nutrient_001",
          nutrientName: "タンパク質",
          actualIntake: 65,
          unit: "g",
          targetValue: 60,
        },
        {
          nutrientId: "nutrient_002",
          nutrientName: "ビタミンA",
          actualIntake: 900,
          unit: "μg",
          targetValue: 850,
        },
      ],
    };

    const result = calculateNutrientDeviationQuantification(
      nutritionRecordData
    );

    expect(result).toEqual({
      userId: "user_001",
      recordDate: "2024-01-15",
      deviationData: [
        {
          nutrientId: "nutrient_001",
          nutrientName: "タンパク質",
          targetValue: 60,
          actualIntake: 65,
          achievementRate: 108.33,
          deviationDegree: 8.33,
          status: "超過",
        },
        {
          nutrientId: "nutrient_002",
          nutrientName: "ビタミンA",
          targetValue: 850,
          actualIntake: 900,
          achievementRate: 105.88,
          deviationDegree: 5.88,
          status: "超過",
        },
      ],
      overallAchievementRate: 107.11,
      priorityRanking: [
        {
          nutrientId: "nutrient_001",
          nutrientName: "タンパク質",
          improvementGap: 0,
          priority: 1,
        },
        {
          nutrientId: "nutrient_002",
          nutrientName: "ビタミンA",
          improvementGap: 0,
          priority: 2,
        },
      ],
    });
  });

  // 不足している栄養項目の場合
  test("目標値に対して不足している栄養項目でギャップを計算する", () => {
    const nutritionRecordData = {
      userId: "user_002",
      recordDate: "2024-01-16",
      nutritionItems: [
        {
          nutrientId: "nutrient_003",
          nutrientName: "カルシウム",
          actualIntake: 500,
          unit: "mg",
          targetValue: 800,
        },
        {
          nutrientId: "nutrient_004",
          nutrientName: "鉄",
          actualIntake: 6,
          unit: "mg",
          targetValue: 10,
        },
      ],
    };

    const result = calculateNutrientDeviationQuantification(
      nutritionRecordData
    );

    expect(result).toEqual({
      userId: "user_002",
      recordDate: "2024-01-16",
      deviationData: [
        {
          nutrientId: "nutrient_003",
          nutrientName: "カルシウム",
          targetValue: 800,
          actualIntake: 500,
          achievementRate: 62.5,
          deviationDegree: -37.5,
          status: "不足",
        },
        {
          nutrientId: "nutrient_004",
          nutrientName: "鉄",
          targetValue: 10,
          actualIntake: 6,
          achievementRate: 60.0,
          deviationDegree: -40.0,
          status: "不足",
        },
      ],
      overallAchievementRate: 61.25,
      priorityRanking: [
        {
          nutrientId: "nutrient_004",
          nutrientName: "鉄",
          improvementGap: 4,
          priority: 1,
        },
        {
          nutrientId: "nutrient_003",
          nutrientName: "カルシウム",
          improvementGap: 300,
          priority: 2,
        },
      ],
    });
  });

  // エッジケース：空の栄養項目リスト
  test("栄養項目リストが空の場合にエラーを返す", () => {
    const nutritionRecordData = {
      userId: "user_003",
      recordDate: "2024-01-17",
      nutritionItems: [],
    };

    expect(() =>
      calculateNutrientDeviationQuantification(nutritionRecordData)
    ).toThrow(/栄養項目/);
  });

  // エッジケース：目標値が 0 以下の場合
  test("目標値が0以下の場合にエラーを返す", () => {
    const nutritionRecordData = {
      userId: "user_004",
      recordDate: "2024-01-18",
      nutritionItems: [
        {
          nutrientId: "nutrient_005",
          nutrientName: "ナトリウム",
          actualIntake: 2000,
          unit: "mg",
          targetValue: 0,
        },
      ],
    };

    expect(() =>
      calculateNutrientDeviationQuantification(nutritionRecordData)
    ).toThrow(/目標値/);
  });
});