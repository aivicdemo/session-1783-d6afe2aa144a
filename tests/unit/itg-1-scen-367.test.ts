import { calculateNutritionDashboard } from "../../src/logic/it-2";

describe("家族成員の食事評価データの蓄積・管理機能", () => {
  // SCEN-367: [error] 栄養分析ダッシュボード表示機能 - 食事記録が1週間未満の場合、栄養分析結果は算出されない
  test("should not display nutrition analysis results when meal records are less than 1 week", () => {
    const user_id = "user_001";
    const meal_records = [
      {
        meal_record_id: "meal_001",
        user_id: user_id,
        meal_date: new Date("2024-01-08T12:00:00Z"),
        meal_type: "lunch",
      },
      {
        meal_record_id: "meal_002",
        user_id: user_id,
        meal_date: new Date("2024-01-09T12:00:00Z"),
        meal_type: "lunch",
      },
      {
        meal_record_id: "meal_003",
        user_id: user_id,
        meal_date: new Date("2024-01-10T12:00:00Z"),
        meal_type: "lunch",
      },
      {
        meal_record_id: "meal_004",
        user_id: user_id,
        meal_date: new Date("2024-01-11T12:00:00Z"),
        meal_type: "lunch",
      },
      {
        meal_record_id: "meal_005",
        user_id: user_id,
        meal_date: new Date("2024-01-12T12:00:00Z"),
        meal_type: "lunch",
      },
      {
        meal_record_id: "meal_006",
        user_id: user_id,
        meal_date: new Date("2024-01-13T12:00:00Z"),
        meal_type: "lunch",
      },
    ];

    const current_date = new Date("2024-01-13T14:00:00Z");
    const result = calculateNutritionDashboard({
      user_id: user_id,
      meal_records: meal_records,
      current_date: current_date,
    });

    expect(result.is_analysis_available).toBe(false);
    expect(result.message).toMatch(/1週間以上/);
    expect(result.nutrition_summary).toBeNull();
    expect(result.analysis_charts).toEqual([]);
    expect(result.achievement_scores).toEqual({});
  });

  test("should display nutrition analysis results when meal records are 7 days or more", () => {
    const user_id = "user_002";
    const meal_records = [
      {
        meal_record_id: "meal_101",
        user_id: user_id,
        meal_date: new Date("2024-01-07T12:00:00Z"),
        meal_type: "lunch",
      },
      {
        meal_record_id: "meal_102",
        user_id: user_id,
        meal_date: new Date("2024-01-08T12:00:00Z"),
        meal_type: "lunch",
      },
      {
        meal_record_id: "meal_103",
        user_id: user_id,
        meal_date: new Date("2024-01-09T12:00:00Z"),
        meal_type: "lunch",
      },
      {
        meal_record_id: "meal_104",
        user_id: user_id,
        meal_date: new Date("2024-01-10T12:00:00Z"),
        meal_type: "lunch",
      },
      {
        meal_record_id: "meal_105",
        user_id: user_id,
        meal_date: new Date("2024-01-11T12:00:00Z"),
        meal_type: "lunch",
      },
      {
        meal_record_id: "meal_106",
        user_id: user_id,
        meal_date: new Date("2024-01-12T12:00:00Z"),
        meal_type: "lunch",
      },
      {
        meal_record_id: "meal_107",
        user_id: user_id,
        meal_date: new Date("2024-01-13T12:00:00Z"),
        meal_type: "lunch",
      },
    ];

    const current_date = new Date("2024-01-14T14:00:00Z");
    const result = calculateNutritionDashboard({
      user_id: user_id,
      meal_records: meal_records,
      current_date: current_date,
    });

    expect(result.is_analysis_available).toBe(true);
    expect(result.message).toBeNull();
    expect(result.nutrition_summary).not.toBeNull();
    expect(result.analysis_charts).not.toEqual([]);
    expect(Object.keys(result.achievement_scores).length).toBeGreaterThan(0);
  });

  test("should throw error when user_id is missing", () => {
    expect(() =>
      calculateNutritionDashboard({
        user_id: "",
        meal_records: [],
        current_date: new Date("2024-01-14T14:00:00Z"),
      })
    ).toThrow(/ユーザーID/);
  });

  test("should throw error when meal_records is null", () => {
    expect(() =>
      calculateNutritionDashboard({
        user_id: "user_003",
        meal_records: null as any,
        current_date: new Date("2024-01-14T14:00:00Z"),
      })
    ).toThrow(/食事記録/);
  });

  test("should throw error when current_date is in future", () => {
    expect(() =>
      calculateNutritionDashboard({
        user_id: "user_004",
        meal_records: [],
        current_date: new Date("2099-01-14T14:00:00Z"),
      })
    ).toThrow(/日付/);
  });

  test("should handle boundary case of exactly 7 days", () => {
    const user_id = "user_005";
    const base_date = new Date("2024-01-07T12:00:00Z");
    const meal_records = Array.from({ length: 7 }, (_, i) => ({
      meal_record_id: `meal_${200 + i}`,
      user_id: user_id,
      meal_date: new Date(
        base_date.getTime() + i * 24 * 60 * 60 * 1000
      ),
      meal_type: "lunch",
    }));

    const current_date = new Date("2024-01-14T00:00:00Z");
    const result = calculateNutritionDashboard({
      user_id: user_id,
      meal_records: meal_records,
      current_date: current_date,
    });

    expect(result.is_analysis_available).toBe(true);
  });

  test("should handle boundary case of 6 days", () => {
    const user_id = "user_006";
    const base_date = new Date("2024-01-08T12:00:00Z");
    const meal_records = Array.from({ length: 6 }, (_, i) => ({
      meal_record_id: `meal_${300 + i}`,
      user_id: user_id,
      meal_date: new Date(
        base_date.getTime() + i * 24 * 60 * 60 * 1000
      ),
      meal_type: "lunch",
    }));

    const current_date = new Date("2024-01-14T00:00:00Z");
    const result = calculateNutritionDashboard({
      user_id: user_id,
      meal_records: meal_records,
      current_date: current_date,
    });

    expect(result.is_analysis_available).toBe(false);
    expect(result.message).toMatch(/1週間以上/);
  });
});