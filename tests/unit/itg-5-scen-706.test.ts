import { mergeAndDeduplicateImprovementIssues } from "../../src/logic/it-7-3-1";

describe("献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能", () => {
  // SCEN-706
  test("改善課題統合・重複排除機能 - 統合された改善課題に対して影響範囲が正確に付与される", () => {
    const improvementIssues = [
      {
        issueId: "issue-001",
        title: "栄養バランス計算ロジック改善",
        description: "たんぱく質の計算誤差を修正",
        nutritionItems: ["protein", "fat"],
        userSegments: ["age_20_30", "family_size_2_3"],
        dietaryRestrictionTypes: ["vegetarian"],
        status: "pending",
        createdAt: "2024-01-10T10:00:00Z",
        updatedAt: "2024-01-10T10:00:00Z",
      },
      {
        issueId: "issue-002",
        title: "栄養バランス計算ロジック改善",
        description: "たんぱく質の計算誤差を修正",
        nutritionItems: ["protein", "carbohydrate"],
        userSegments: ["age_30_40", "family_size_4_5"],
        dietaryRestrictionTypes: ["vegan"],
        status: "pending",
        createdAt: "2024-01-12T14:30:00Z",
        updatedAt: "2024-01-12T14:30:00Z",
      },
      {
        issueId: "issue-003",
        title: "栄養バランス計算ロジック改善",
        description: "たんぱく質の計算誤差を修正",
        nutritionItems: ["fat", "carbohydrate"],
        userSegments: ["age_20_30", "family_size_2_3"],
        dietaryRestrictionTypes: ["gluten_free"],
        status: "pending",
        createdAt: "2024-01-15T09:15:00Z",
        updatedAt: "2024-01-15T09:15:00Z",
      },
    ];

    const result = mergeAndDeduplicateImprovementIssues(improvementIssues);

    expect(result.mergedIssues).toHaveLength(1);

    const mergedIssue = result.mergedIssues[0];
    expect(mergedIssue.title).toBe("栄養バランス計算ロジック改善");
    expect(mergedIssue.description).toBe("たんぱく質の計算誤差を修正");
    expect(mergedIssue.status).toBe("pending");

    const expectedNutritionItems = ["protein", "fat", "carbohydrate"];
    const sortedNutrition = mergedIssue.aggregatedNutritionItems.sort();
    expect(sortedNutrition).toEqual(expectedNutritionItems.sort());
    expect(mergedIssue.aggregatedNutritionItems).toHaveLength(3);

    const expectedUserSegments = ["age_20_30", "age_30_40", "family_size_2_3", "family_size_4_5"];
    const sortedSegments = mergedIssue.aggregatedUserSegments.sort();
    expect(sortedSegments).toEqual(expectedUserSegments.sort());
    expect(mergedIssue.aggregatedUserSegments).toHaveLength(4);

    const expectedDietaryRestrictions = ["vegetarian", "vegan", "gluten_free"];
    const sortedRestrictions = mergedIssue.aggregatedDietaryRestrictionTypes.sort();
    expect(sortedRestrictions).toEqual(expectedDietaryRestrictions.sort());
    expect(mergedIssue.aggregatedDietaryRestrictionTypes).toHaveLength(3);

    const uniqueNutrition = new Set(mergedIssue.aggregatedNutritionItems);
    expect(uniqueNutrition.size).toBe(mergedIssue.aggregatedNutritionItems.length);

    const uniqueSegments = new Set(mergedIssue.aggregatedUserSegments);
    expect(uniqueSegments.size).toBe(mergedIssue.aggregatedUserSegments.length);

    const uniqueRestrictions = new Set(mergedIssue.aggregatedDietaryRestrictionTypes);
    expect(uniqueRestrictions.size).toBe(mergedIssue.aggregatedDietaryRestrictionTypes.length);

    expect(mergedIssue.createdAt).toBe("2024-01-10T10:00:00Z");
    expect(mergedIssue.updatedAt).toMatch(/^2024-01-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
    expect(mergedIssue.sourceIssueIds).toContain("issue-001");
    expect(mergedIssue.sourceIssueIds).toContain("issue-002");
    expect(mergedIssue.sourceIssueIds).toContain("issue-003");
    expect(mergedIssue.sourceIssueIds).toHaveLength(3);
  });
});