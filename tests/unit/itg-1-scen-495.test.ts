import { calculateNutritionAchievementScore } from "../../src/logic/it-3";

describe("食事評価データを献立生成ロジックに反映させる機能", () => {
  // SCEN-495
  test("栄養摂取状況の可視化と次月優先条件調整 - 栄養項目別の達成度スコアが正確に計算され、不足項目と改善ギャップが正しく特定される", () => {
    // 推奨栄養摂取量（1ヶ月分、複数栄養素を含む）
    const recommendedIntake = {
      protein_g: 1800,
      carbohydrate_g: 7200,
      fat_g: 1800,
      vitamin_a_mcg: 1050,
      vitamin_c_mg: 1500,
      calcium_mg: 22000,
      iron_mg: 90,
    };

    // 実際の栄養摂取量（1ヶ月分の食事記録から集計）
    const actualIntake = {
      protein_g: 1620,
      carbohydrate_g: 7488,
      fat_g: 1440,
      vitamin_a_mcg: 840,
      vitamin_c_mg: 1800,
      calcium_mg: 18700,
      iron_mg: 72,
    };

    const result = calculateNutritionAchievementScore({
      recommendedIntake,
      actualIntake,
    });

    // 各栄養項目の達成度スコア計算検証
    // タンパク質: 1620 / 1800 * 100 = 90
    expect(result.achievementScores.protein_g).toBe(90);

    // 炭水化物: 7488 / 7200 * 100 = 104（100を超えた場合は100でキャップ）
    expect(result.achievementScores.carbohydrate_g).toBe(100);

    // 脂質: 1440 / 1800 * 100 = 80
    expect(result.achievementScores.fat_g).toBe(80);

    // ビタミンA: 840 / 1050 * 100 = 80
    expect(result.achievementScores.vitamin_a_mcg).toBe(80);

    // ビタミンC: 1800 / 1500 * 100 = 120（100を超えた場合は100でキャップ）
    expect(result.achievementScores.vitamin_c_mg).toBe(100);

    // カルシウム: 18700 / 22000 * 100 = 85
    expect(result.achievementScores.calcium_mg).toBe(85);

    // 鉄: 72 / 90 * 100 = 80
    expect(result.achievementScores.iron_mg).toBe(80);

    // 全栄養項目の達成度スコアが0～100範囲内であることを検証
    Object.values(result.achievementScores).forEach((score) => {
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    // 不足項目の判定（達成度75%未満）
    expect(result.insufficientItems).toEqual([
      "fat_g",
      "vitamin_a_mcg",
      "calcium_mg",
      "iron_mg",
    ]);

    // 改善ギャップの計算検証
    expect(result.improvementGaps.fat_g).toBe(360); // 1800 - 1440
    expect(result.improvementGaps.vitamin_a_mcg).toBe(210); // 1050 - 840
    expect(result.improvementGaps.calcium_mg).toBe(3300); // 22000 - 18700
    expect(result.improvementGaps.iron_mg).toBe(18); // 90 - 72

    // 総合達成度スコア（全項目の平均）
    // (90 + 100 + 80 + 80 + 100 + 85 + 80) / 7 = 615 / 7 ≈ 87.86 → 88に丸める
    expect(result.overallAchievementScore).toBe(88);

    // 次月の献立優先条件セット：不足項目が反映されるべき形式
    expect(result.nextMonthPriorities).toEqual({
      primaryFocus: ["calcium_mg", "iron_mg", "fat_g", "vitamin_a_mcg"],
      shouldIncreaseNutrients: [
        "calcium_mg",
        "iron_mg",
        "fat_g",
        "vitamin_a_mcg",
      ],
      hasSignificantGap: true, // 改善ギャップが存在する場合true
    });

    // 各不足項目の詳細情報が正しく格納されていることを検証
    expect(result.detailedAnalysis).toBeDefined();
    expect(result.detailedAnalysis.fat_g).toEqual({
      recommended: 1800,
      actual: 1440,
      achievement: 80,
      gap: 360,
      priority: "high", // ギャップ > 200
    });
    expect(result.detailedAnalysis.vitamin_a_mcg).toEqual({
      recommended: 1050,
      actual: 840,
      achievement: 80,
      gap: 210,
      priority: "high",
    });
    expect(result.detailedAnalysis.calcium_mg).toEqual({
      recommended: 22000,
      actual: 18700,
      achievement: 85,
      gap: 3300,
      priority: "high",
    });
    expect(result.detailedAnalysis.iron_mg).toEqual({
      recommended: 90,
      actual: 72,
      achievement: 80,
      gap: 18,
      priority: "medium", // ギャップ 11-200
    });

    // 十分な栄養項目も正しく記録されていることを検証
    expect(result.sufficientItems).toEqual(["protein_g", "carbohydrate_g", "vitamin_c_mg"]);
  });
});