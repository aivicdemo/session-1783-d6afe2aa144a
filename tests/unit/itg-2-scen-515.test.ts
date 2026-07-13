import { calculateNutritionAchievementDashboard } from "../../src/logic/it-1-br-2-1-1-1";

describe("栄養基準設定の有効性判定と改善項目の可視化", () => {
  // SCEN-515
  test("達成度が100%の栄養項目が改善対象から除外される", () => {
    // Arrange
    const nutritionData = {
      userId: "user_001",
      evaluationDate: new Date("2024-01-15T00:00:00Z"),
      nutritionItems: [
        {
          nutrientId: "protein_001",
          nutrientName: "タンパク質",
          targetValue: 60,
          actualValue: 60,
          unit: "g",
          achievementRate: 100,
        },
        {
          nutrientId: "calcium_001",
          nutrientName: "カルシウム",
          targetValue: 800,
          actualValue: 760,
          unit: "mg",
          achievementRate: 95,
        },
        {
          nutrientId: "vitaminC_001",
          nutrientName: "ビタミンC",
          targetValue: 100,
          actualValue: 80,
          unit: "mg",
          achievementRate: 80,
        },
      ],
    };

    // Act
    const result = calculateNutritionAchievementDashboard(nutritionData);

    // Assert: 改善対象リストが正しく構成されている
    expect(result.improvementTargets).toBeDefined();
    expect(Array.isArray(result.improvementTargets)).toBe(true);

    // 達成度100%のタンパク質が改善対象リストに含まれていないことを検証
    const proteinInImprovementList = result.improvementTargets.some(
      (item: { nutrientId: string }) => item.nutrientId === "protein_001"
    );
    expect(proteinInImprovementList).toBe(false);

    // 達成度95%のカルシウムが改善対象リストに含まれていることを検証
    const calciumInImprovementList = result.improvementTargets.some(
      (item: { nutrientId: string }) => item.nutrientId === "calcium_001"
    );
    expect(calciumInImprovementList).toBe(true);

    // 達成度80%のビタミンCが改善対象リストに含まれていることを検証
    const vitaminCInImprovementList = result.improvementTargets.some(
      (item: { nutrientId: string }) => item.nutrientId === "vitaminC_001"
    );
    expect(vitaminCInImprovementList).toBe(true);

    // 改善対象リストの件数が正確であることを検証（達成度100%の1件を除いた2件）
    expect(result.improvementTargets.length).toBe(2);

    // 改善対象リストが達成度の低い順に優先度付けされていることを検証
    expect(result.improvementTargets[0].nutrientName).toBe("ビタミンC");
    expect(result.improvementTargets[1].nutrientName).toBe("カルシウム");

    // 各改善対象の達成度ギャップが正確に計算されていることを検証
    const vitaminCGap = result.improvementTargets.find(
      (item: { nutrientId: string }) => item.nutrientId === "vitaminC_001"
    );
    expect(vitaminCGap.achievementGap).toBe(20);

    const calciumGap = result.improvementTargets.find(
      (item: { nutrientId: string }) => item.nutrientId === "calcium_001"
    );
    expect(calciumGap.achievementGap).toBe(5);

    // ダッシュボード全体の統計情報が正確であることを検証
    expect(result.totalItems).toBe(3);
    expect(result.achievedItems).toBe(1);
    expect(result.improvementNeededItems).toBe(2);
    expect(result.overallAchievementRate).toBeCloseTo(91.67, 1);
  });
});