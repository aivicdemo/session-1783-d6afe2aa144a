import { detectConflictingDietPatterns } from "../../src/logic/it-1-br-4-2-1";

describe("食事制限条件の変更時に過去献立との抵触検出機能", () => {
  // SCEN-465
  test("複数食事制限条件の優先度自動判定機能 - 抵触リスク高の制限条件が優先度1で最初に表示される", () => {
    const newDietaryRestrictions = [
      {
        restrictionId: "R001",
        type: "allergy",
        allergen: "peanut",
        severity: "high",
        conflictRiskScore: 85,
      },
      {
        restrictionId: "R002",
        type: "religious",
        restriction: "halal",
        severity: "medium",
        conflictRiskScore: 35,
      },
      {
        restrictionId: "R003",
        type: "medical",
        restriction: "sodium_low",
        severity: "high",
        conflictRiskScore: 72,
      },
    ];

    const pastMealHistories = [
      {
        mealId: "M001",
        ingredients: ["peanut_oil", "vegetable"],
        createdAt: "2024-01-10T10:00:00Z",
      },
      {
        mealId: "M002",
        ingredients: ["chicken", "salt"],
        createdAt: "2024-01-09T11:00:00Z",
      },
      {
        mealId: "M003",
        ingredients: ["beef", "low_sodium_sauce"],
        createdAt: "2024-01-08T09:00:00Z",
      },
    ];

    const result = detectConflictingDietPatterns(
      newDietaryRestrictions,
      pastMealHistories
    );

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);

    // 優先度1が抵触リスクスコア最高（85）のアレルギー条件であること
    const priorityOne = result[0];
    expect(priorityOne.priority).toBe(1);
    expect(priorityOne.restrictionId).toBe("R001");
    expect(priorityOne.conflictRiskScore).toBe(85);
    expect(priorityOne.type).toBe("allergy");
    expect(priorityOne.allergen).toBe("peanut");

    // 優先度2が医学的制限（スコア72）であること
    const priorityTwo = result[1];
    expect(priorityTwo.priority).toBe(2);
    expect(priorityTwo.restrictionId).toBe("R003");
    expect(priorityTwo.conflictRiskScore).toBe(72);

    // 優先度3が宗教的制限（スコア35）であること
    const priorityThree = result[2];
    expect(priorityThree.priority).toBe(3);
    expect(priorityThree.restrictionId).toBe("R002");
    expect(priorityThree.conflictRiskScore).toBe(35);

    // 抵触検出結果の検証：R001は過去献立M001と抵触
    expect(priorityOne.conflictingMeals).toBeDefined();
    expect(Array.isArray(priorityOne.conflictingMeals)).toBe(true);
    expect(priorityOne.conflictingMeals.length).toBeGreaterThan(0);
    expect(priorityOne.conflictingMeals).toContain("M001");

    // 抵触検出結果の検証：R003は過去献立M002と抵触
    expect(priorityThree.conflictingMeals).toBeDefined();
    expect(priorityThree.conflictingMeals.length).toBeGreaterThan(0);
  });
});