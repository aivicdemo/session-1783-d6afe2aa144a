import { generateWeeklyReport } from "../../src/logic/it-2";

describe("Weekly Report Generation with Incomplete Meal Evaluation Data", () => {
  // SCEN-393
  test("should detect and report aggregation failure when meal evaluation data is incomplete", () => {
    const incompleteMealEvaluationDataset = {
      weekStartDate: "2024-01-08",
      weekEndDate: "2024-01-14",
      mealEvaluations: [
        {
          mealId: "meal_001",
          familyMemberId: "member_001",
          evaluationDate: "2024-01-08",
          satisfactionScore: 4,
          completionRate: 85,
          mealRequest: "More vegetables",
          nutritionInfo: {
            calories: 650,
            protein: 25,
            carbohydrates: 80,
            fat: 15,
            fiber: null,
          },
        },
        {
          mealId: "meal_002",
          familyMemberId: "member_002",
          evaluationDate: "2024-01-09",
          satisfactionScore: null,
          completionRate: 90,
          mealRequest: "Less salt",
          nutritionInfo: null,
        },
        {
          mealId: "meal_003",
          familyMemberId: "member_001",
          evaluationDate: "2024-01-10",
          satisfactionScore: 5,
          completionRate: null,
          mealRequest: "",
          nutritionInfo: {
            calories: 720,
            protein: 28,
            carbohydrates: 95,
            fat: 18,
            fiber: 8,
          },
        },
        {
          mealId: "meal_004",
          familyMemberId: "member_003",
          evaluationDate: "2024-01-11",
          satisfactionScore: 3,
          completionRate: 75,
          mealRequest: "Gluten-free options",
          nutritionInfo: {
            calories: 580,
            protein: 22,
            carbohydrates: 70,
            fat: 12,
            fiber: 6,
          },
        },
      ],
    };

    const result = generateWeeklyReport(incompleteMealEvaluationDataset);

    expect(result.status).toBe("AGGREGATION_FAILED");
    expect(result.aggregationPossible).toBe(false);
    expect(result.incompleteDataItems).toContain("satisfactionScore");
    expect(result.incompleteDataItems).toContain("completionRate");
    expect(result.incompleteDataItems).toContain("nutritionInfo");
    expect(result.incompleteDataItems.length).toBe(3);
    expect(result.errorMessage).toMatch(/不完全なデータ/);
    expect(result.affectedMealCount).toBe(3);
    expect(result.reportGenerated).toBe(false);
    expect(result.userPromptMessage).toMatch(/データ補完/);
    expect(result.missingFieldsByMeal).toEqual([
      {
        mealId: "meal_002",
        missingFields: ["satisfactionScore", "nutritionInfo"],
      },
      {
        mealId: "meal_003",
        missingFields: ["completionRate"],
      },
    ]);
  });
});