import { getWeeklyNutritionDashboard } from "../../src/logic/it-1-br-2-1-1-1";

describe("週次ダッシュボード集計機能", () => {
  // SCEN-377
  test("当週のデータが存在しない場合にエラーハンドリングされる", () => {
    const userId = "user_new_001";
    const weekStartDate = "2024-01-01";
    const weekEndDate = "2024-01-07";

    expect(() =>
      getWeeklyNutritionDashboard({
        userId,
        weekStartDate,
        weekEndDate,
      })
    ).toThrow(/当週のデータ/);
  });

  test("当週のデータが存在する場合に集計結果が返される", () => {
    const userId = "user_001";
    const weekStartDate = "2024-01-08";
    const weekEndDate = "2024-01-14";

    const mealRecords = [
      {
        userId,
        mealDate: "2024-01-08",
        mealType: "breakfast",
        nutritionItems: [
          { nutrientId: "protein", actualValue: 20, unit: "g" },
          { nutrientId: "carbs", actualValue: 50, unit: "g" },
          { nutrientId: "fat", actualValue: 15, unit: "g" },
        ],
      },
      {
        userId,
        mealDate: "2024-01-09",
        mealType: "lunch",
        nutritionItems: [
          { nutrientId: "protein", actualValue: 30, unit: "g" },
          { nutrientId: "carbs", actualValue: 60, unit: "g" },
          { nutrientId: "fat", actualValue: 20, unit: "g" },
        ],
      },
      {
        userId,
        mealDate: "2024-01-10",
        mealType: "dinner",
        nutritionItems: [
          { nutrientId: "protein", actualValue: 25, unit: "g" },
          { nutrientId: "carbs", actualValue: 55, unit: "g" },
          { nutrientId: "fat", actualValue: 18, unit: "g" },
        ],
      },
    ];

    const nutritionTargets = [
      { nutrientId: "protein", targetValue: 210, unit: "g" },
      { nutrientId: "carbs", targetValue: 420, unit: "g" },
      { nutrientId: "fat", targetValue: 140, unit: "g" },
    ];

    const result = getWeeklyNutritionDashboard({
      userId,
      weekStartDate,
      weekEndDate,
      mealRecords,
      nutritionTargets,
    });

    expect(result).toBeDefined();
    expect(result.weekStartDate).toBe("2024-01-08");
    expect(result.weekEndDate).toBe("2024-01-14");

    expect(result.nutritionSummary).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          nutrientId: "protein",
          totalActualValue: 75,
          targetValue: 210,
          achievementRate: 35.71,
          unit: "g",
        }),
        expect.objectContaining({
          nutrientId: "carbs",
          totalActualValue: 165,
          targetValue: 420,
          achievementRate: 39.28,
          unit: "g",
        }),
        expect.objectContaining({
          nutrientId: "fat",
          totalActualValue: 53,
          targetValue: 140,
          achievementRate: 37.85,
          unit: "g",
        }),
      ])
    );

    const proteinSummary = result.nutritionSummary.find(
      (item) => item.nutrientId === "protein"
    );
    expect(proteinSummary?.gap).toBe(135);

    const carbsSummary = result.nutritionSummary.find(
      (item) => item.nutrientId === "carbs"
    );
    expect(carbsSummary?.gap).toBe(255);

    const priorityItems = result.nutritionSummary
      .filter((item) => item.achievementRate < 50)
      .sort((a, b) => a.achievementRate - b.achievementRate);

    expect(priorityItems.length).toBeGreaterThan(0);
    expect(priorityItems[0].nutrientId).toBe("carbs");
  });

  test("複数日のデータから正確に集計される", () => {
    const userId = "user_002";
    const weekStartDate = "2024-01-15";
    const weekEndDate = "2024-01-21";

    const mealRecords = [
      {
        userId,
        mealDate: "2024-01-15",
        mealType: "breakfast",
        nutritionItems: [
          { nutrientId: "calcium", actualValue: 300, unit: "mg" },
        ],
      },
      {
        userId,
        mealDate: "2024-01-15",
        mealType: "lunch",
        nutritionItems: [
          { nutrientId: "calcium", actualValue: 200, unit: "mg" },
        ],
      },
      {
        userId,
        mealDate: "2024-01-15",
        mealType: "dinner",
        nutritionItems: [
          { nutrientId: "calcium", actualValue: 250, unit: "mg" },
        ],
      },
      {
        userId,
        mealDate: "2024-01-16",
        mealType: "breakfast",
        nutritionItems: [
          { nutrientId: "calcium", actualValue: 280, unit: "mg" },
        ],
      },
      {
        userId,
        mealDate: "2024-01-16",
        mealType: "lunch",
        nutritionItems: [
          { nutrientId: "calcium", actualValue: 220, unit: "mg" },
        ],
      },
    ];

    const nutritionTargets = [
      { nutrientId: "calcium", targetValue: 1400, unit: "mg" },
    ];

    const result = getWeeklyNutritionDashboard({
      userId,
      weekStartDate,
      weekEndDate,
      mealRecords,
      nutritionTargets,
    });

    const calciumSummary = result.nutritionSummary.find(
      (item) => item.nutrientId === "calcium"
    );

    expect(calciumSummary?.totalActualValue).toBe(1250);
    expect(calciumSummary?.achievementRate).toBeCloseTo(89.28, 1);
    expect(calciumSummary?.gap).toBe(150);
  });

  test("達成度が100%以上の栄養項目も正しく集計される", () => {
    const userId = "user_003";
    const weekStartDate = "2024-01-22";
    const weekEndDate = "2024-01-28";

    const mealRecords = [
      {
        userId,
        mealDate: "2024-01-22",
        mealType: "breakfast",
        nutritionItems: [
          { nutrientId: "sodium", actualValue: 2000, unit: "mg" },
        ],
      },
      {
        userId,
        mealDate: "2024-01-23",
        mealType: "lunch",
        nutritionItems: [
          { nutrientId: "sodium", actualValue: 1500, unit: "mg" },
        ],
      },
    ];

    const nutritionTargets = [
      { nutrientId: "sodium", targetValue: 2500, unit: "mg" },
    ];

    const result = getWeeklyNutritionDashboard({
      userId,
      weekStartDate,
      weekEndDate,
      mealRecords,
      nutritionTargets,
    });

    const sodiumSummary = result.nutritionSummary.find(
      (item) => item.nutrientId === "sodium"
    );

    expect(sodiumSummary?.totalActualValue).toBe(3500);
    expect(sodiumSummary?.achievementRate).toBe(140);
    expect(sodiumSummary?.gap).toBe(-1000);
  });

  test("当週のデータが存在しないユーザーの場合は見つかりません例外が発生する", () => {
    const userId = "user_nonexistent";
    const weekStartDate = "2024-02-01";
    const weekEndDate = "2024-02-07";

    expect(() =>
      getWeeklyNutritionDashboard({
        userId,
        weekStartDate,
        weekEndDate,
      })
    ).toThrow(/ユーザー/);
  });

  test("栄養目標が未設定の場合にエラーハンドリングされる", () => {
    const userId = "user_004";
    const weekStartDate = "2024-02-08";
    const weekEndDate = "2024-02-14";

    const mealRecords = [
      {
        userId,
        mealDate: "2024-02-08",
        mealType: "breakfast",
        nutritionItems: [
          { nutrientId: "protein", actualValue: 20, unit: "g" },
        ],
      },
    ];

    expect(() =>
      getWeeklyNutritionDashboard({
        userId,
        weekStartDate,
        weekEndDate,
        mealRecords,
        nutritionTargets: [],
      })
    ).toThrow(/栄養目標/);
  });
});