import { generateMultiConstraintMeals } from "../../src/logic/it-1-1-1";

describe("複数制約条件付き献立生成機能 - 優先度同一時の満足度スコアソート", () => {
  // SCEN-356
  test("優先度が同一の複数献立候補については満足度スコアで昇順にソートされる", () => {
    // Arrange: 複数の制約条件を設定
    const constraints = {
      calorieUpperLimit: 2000,
      excludeAllergens: ["egg"],
      cookingTimeUpperLimitMinutes: 30,
    };

    const familyMembers = [
      {
        memberId: "member_1",
        age: 10,
        allergies: ["egg"],
      },
      {
        memberId: "member_2",
        age: 8,
        allergies: [],
      },
    ];

    // Act: 複数の制約条件に合致する献立候補を生成
    const result = generateMultiConstraintMeals({
      constraints,
      familyMembers,
    });

    // Assert: 生成された献立候補が存在することを確認
    expect(result).toBeDefined();
    expect(result.mealCandidates).toBeDefined();
    expect(Array.isArray(result.mealCandidates)).toBe(true);
    expect(result.mealCandidates.length).toBeGreaterThan(0);

    // Assert: 優先度が同一の献立候補を抽出
    const priorityGroups = new Map<number, any[]>();
    result.mealCandidates.forEach((meal) => {
      const priority = meal.priorityLevel;
      if (!priorityGroups.has(priority)) {
        priorityGroups.set(priority, []);
      }
      priorityGroups.get(priority)!.push(meal);
    });

    // Assert: 各優先度グループについて満足度スコアが昇順でソートされていることを確認
    priorityGroups.forEach((mealsInGroup) => {
      if (mealsInGroup.length > 1) {
        // 同一優先度の献立が複数存在する場合のみ検証
        for (let i = 0; i < mealsInGroup.length - 1; i++) {
          const currentSatisfactionScore = mealsInGroup[i].satisfactionScore;
          const nextSatisfactionScore = mealsInGroup[i + 1].satisfactionScore;
          expect(currentSatisfactionScore).toBeLessThanOrEqual(
            nextSatisfactionScore
          );
        }
      }
    });

    // Assert: 実例ケース検証 - 満足度スコア65, 72, 85がこの順序で表示されることを確認
    const candidateWithScores = result.mealCandidates.filter(
      (meal) =>
        meal.satisfactionScore === 65 ||
        meal.satisfactionScore === 72 ||
        meal.satisfactionScore === 85
    );

    if (candidateWithScores.length === 3) {
      const expectedOrder = [65, 72, 85];
      const actualOrder = candidateWithScores.map(
        (meal) => meal.satisfactionScore
      );
      expect(actualOrder).toEqual(expectedOrder);
    }

    // Assert: すべての献立候補が制約条件を満たしていることを確認
    result.mealCandidates.forEach((meal) => {
      // カロリー制約確認
      expect(meal.totalCalories).toBeLessThanOrEqual(2000);

      // アレルギー制約確認（卵が含まれていないこと）
      expect(meal.ingredients).not.toContain("egg");

      // 調理時間制約確認
      expect(meal.cookingTimeMinutes).toBeLessThanOrEqual(30);

      // 満足度スコアが0～100の範囲内であることを確認
      expect(meal.satisfactionScore).toBeGreaterThanOrEqual(0);
      expect(meal.satisfactionScore).toBeLessThanOrEqual(100);
    });
  });
});