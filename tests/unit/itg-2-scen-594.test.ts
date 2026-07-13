import { calculateAlgorithmImprovementComparison } from "../../src/logic/it-1-br-2-1-1-1";

describe("ユーザー食事記録と栄養摂取量の推移分析・栄養基準ロジック検証", () => {
  // SCEN-594
  test("改善前データが存在しない場合に比較処理がエラーハンドルされる", () => {
    // 改善後データのみを準備
    const afterImprovementData = {
      successRate: 85,
      cookingTimeReduction: 15,
      userSatisfactionScore: 78,
      nutritionAchievementRate: 88,
      measurementDate: "2024-02-15T10:00:00Z",
    };

    // 改善前データが null の状態で比較処理を実行
    const beforeImprovementData = null;

    // エラーがスローされることを期待
    expect(() =>
      calculateAlgorithmImprovementComparison(
        beforeImprovementData,
        afterImprovementData
      )
    ).toThrow(/改善前/);
  });

  test("改善前後のデータが存在する場合、効果差が正しく計算される", () => {
    const beforeImprovementData = {
      successRate: 70,
      cookingTimeReduction: 5,
      userSatisfactionScore: 62,
      nutritionAchievementRate: 75,
      measurementDate: "2024-01-15T10:00:00Z",
    };

    const afterImprovementData = {
      successRate: 85,
      cookingTimeReduction: 15,
      userSatisfactionScore: 78,
      nutritionAchievementRate: 88,
      measurementDate: "2024-02-15T10:00:00Z",
    };

    const result = calculateAlgorithmImprovementComparison(
      beforeImprovementData,
      afterImprovementData
    );

    // 効果差を検証: afterValue - beforeValue
    expect(result.successRateDifference).toBe(15); // 85 - 70
    expect(result.cookingTimeReductionDifference).toBe(10); // 15 - 5
    expect(result.userSatisfactionScoreDifference).toBe(16); // 78 - 62
    expect(result.nutritionAchievementRateDifference).toBe(13); // 88 - 75
    expect(result.totalImprovement).toBe(13.5); // (15 + 10 + 16 + 13) / 4
  });

  test("改善後データが存在しない場合に比較処理がエラーハンドルされる", () => {
    const beforeImprovementData = {
      successRate: 70,
      cookingTimeReduction: 5,
      userSatisfactionScore: 62,
      nutritionAchievementRate: 75,
      measurementDate: "2024-01-15T10:00:00Z",
    };

    const afterImprovementData = null;

    expect(() =>
      calculateAlgorithmImprovementComparison(
        beforeImprovementData,
        afterImprovementData
      )
    ).toThrow(/改善後/);
  });

  test("不完全なデータフィールドが渡された場合、検証エラーが返される", () => {
    const beforeImprovementData = {
      successRate: 70,
      cookingTimeReduction: 5,
      // userSatisfactionScore が欠損
      nutritionAchievementRate: 75,
      measurementDate: "2024-01-15T10:00:00Z",
    };

    const afterImprovementData = {
      successRate: 85,
      cookingTimeReduction: 15,
      userSatisfactionScore: 78,
      nutritionAchievementRate: 88,
      measurementDate: "2024-02-15T10:00:00Z",
    };

    expect(() =>
      calculateAlgorithmImprovementComparison(
        beforeImprovementData as any,
        afterImprovementData
      )
    ).toThrow(/必須項目/);
  });

  test("負の値がデータに含まれる場合、バリデーションエラーが返される", () => {
    const beforeImprovementData = {
      successRate: -10, // 負の値
      cookingTimeReduction: 5,
      userSatisfactionScore: 62,
      nutritionAchievementRate: 75,
      measurementDate: "2024-01-15T10:00:00Z",
    };

    const afterImprovementData = {
      successRate: 85,
      cookingTimeReduction: 15,
      userSatisfactionScore: 78,
      nutritionAchievementRate: 88,
      measurementDate: "2024-02-15T10:00:00Z",
    };

    expect(() =>
      calculateAlgorithmImprovementComparison(
        beforeImprovementData,
        afterImprovementData
      )
    ).toThrow(/数値範囲/);
  });

  test("改善度が大きい場合、優先度スコアが高く計算される", () => {
    const beforeImprovementData = {
      successRate: 50,
      cookingTimeReduction: 2,
      userSatisfactionScore: 40,
      nutritionAchievementRate: 50,
      measurementDate: "2024-01-15T10:00:00Z",
    };

    const afterImprovementData = {
      successRate: 95,
      cookingTimeReduction: 25,
      userSatisfactionScore: 92,
      nutritionAchievementRate: 95,
      measurementDate: "2024-02-15T10:00:00Z",
    };

    const result = calculateAlgorithmImprovementComparison(
      beforeImprovementData,
      afterImprovementData
    );

    // 大幅な改善が見られるため、優先度スコアは高い (85以上)
    expect(result.priorityScore).toBeGreaterThanOrEqual(85);
    expect(result.improvementLevel).toBe("high");
  });

  test("改善度が小さい場合、優先度スコアが低く計算される", () => {
    const beforeImprovementData = {
      successRate: 80,
      cookingTimeReduction: 10,
      userSatisfactionScore: 75,
      nutritionAchievementRate: 80,
      measurementDate: "2024-01-15T10:00:00Z",
    };

    const afterImprovementData = {
      successRate: 82,
      cookingTimeReduction: 11,
      userSatisfactionScore: 76,
      nutritionAchievementRate: 81,
      measurementDate: "2024-02-15T10:00:00Z",
    };

    const result = calculateAlgorithmImprovementComparison(
      beforeImprovementData,
      afterImprovementData
    );

    // わずかな改善のため、優先度スコアは低い (30以下)
    expect(result.priorityScore).toBeLessThanOrEqual(30);
    expect(result.improvementLevel).toBe("low");
  });
});