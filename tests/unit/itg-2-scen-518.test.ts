import { consolidateImprovementIssues } from "../../src/logic/it-1-br-2-1-2-1";

describe("栄養士からの改善提案を優先度付けして管理し、開発チームに定期通知する機能", () => {
  // SCEN-518
  test("改善課題リストの重複排除と統合 - 各統合課題に影響範囲が正しく付与される", () => {
    const improvementIssues = [
      {
        issueId: "issue_001",
        title: "タンパク質摂取量の改善",
        nutritionItem: "protein",
        userSegment: "stay_at_home_father",
        dietRestrictionType: "low_sodium",
        createdAt: "2024-01-15T09:00:00Z",
        updatedAt: "2024-01-15T09:00:00Z",
      },
      {
        issueId: "issue_002",
        title: "タンパク質摂取量の改善 (重複)",
        nutritionItem: "protein",
        userSegment: "stay_at_home_father",
        dietRestrictionType: "low_sodium",
        createdAt: "2024-01-15T09:30:00Z",
        updatedAt: "2024-01-15T09:30:00Z",
      },
      {
        issueId: "issue_003",
        title: "タンパク質摂取量の改善 (重複2)",
        nutritionItem: "protein",
        userSegment: "stay_at_home_father",
        dietRestrictionType: "low_sodium",
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-15T10:00:00Z",
      },
      {
        issueId: "issue_004",
        title: "ビタミンC摂取量の改善",
        nutritionItem: "vitamin_c",
        userSegment: "working_spouse",
        dietRestrictionType: "gluten_free",
        createdAt: "2024-01-15T10:30:00Z",
        updatedAt: "2024-01-15T10:30:00Z",
      },
    ];

    const result = consolidateImprovementIssues(improvementIssues);

    expect(result.consolidatedIssues).toHaveLength(2);

    const proteinIssue = result.consolidatedIssues.find(
      (issue) => issue.nutritionItem === "protein"
    );
    expect(proteinIssue).toBeDefined();
    expect(proteinIssue?.consolidatedIds).toEqual([
      "issue_001",
      "issue_002",
      "issue_003",
    ]);
    expect(proteinIssue?.nutritionItem).toBe("protein");
    expect(proteinIssue?.userSegment).toBe("stay_at_home_father");
    expect(proteinIssue?.dietRestrictionType).toBe("low_sodium");
    expect(proteinIssue?.impactScope).toEqual({
      nutritionItems: ["protein"],
      userSegments: ["stay_at_home_father"],
      dietRestrictionTypes: ["low_sodium"],
    });

    const vitaminIssue = result.consolidatedIssues.find(
      (issue) => issue.nutritionItem === "vitamin_c"
    );
    expect(vitaminIssue).toBeDefined();
    expect(vitaminIssue?.consolidatedIds).toEqual(["issue_004"]);
    expect(vitaminIssue?.nutritionItem).toBe("vitamin_c");
    expect(vitaminIssue?.userSegment).toBe("working_spouse");
    expect(vitaminIssue?.dietRestrictionType).toBe("gluten_free");
    expect(vitaminIssue?.impactScope).toEqual({
      nutritionItems: ["vitamin_c"],
      userSegments: ["working_spouse"],
      dietRestrictionTypes: ["gluten_free"],
    });

    expect(result.deduplicationRate).toBe(0.5);
    expect(result.originalCount).toBe(4);
    expect(result.consolidatedCount).toBe(2);
    expect(result.removedDuplicateCount).toBe(2);
  });
});