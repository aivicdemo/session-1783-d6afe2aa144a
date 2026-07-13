import { determineMenuPriorityConditionSet } from "../../src/logic/it-1-br-2-1-1-1";

describe("月次食費実績と栄養摂取状況の分析・家計方針調整 - 献立生成優先条件セット決定", () => {
  test("SCEN-441: 食費超過なく栄養充足の場合、維持型の優先条件セットが決定される", () => {
    // 月次分析データ準備：食費超過なし、全栄養素充足
    const monthlyAnalysisData = {
      userId: "user_001",
      analysisMonth: "2024-01-01",
      foodBudgetLimit: 50000, // 予算上限: 50,000円
      foodActualAmount: 48000, // 実績: 48,000円（超過なし）
      budgetExcessFlag: false,
      nutritionAchievementData: [
        {
          nutrientName: "タンパク質",
          recommendedValue: 60,
          actualValue: 62,
          achievementRatePercent: 103.33,
          achievementStatus: "達成",
        },
        {
          nutrientName: "脂質",
          recommendedValue: 50,
          actualValue: 51,
          achievementRatePercent: 102.0,
          achievementStatus: "達成",
        },
        {
          nutrientName: "炭水化物",
          recommendedValue: 300,
          actualValue: 305,
          achievementRatePercent: 101.67,
          achievementStatus: "達成",
        },
        {
          nutrientName: "ビタミンC",
          recommendedValue: 100,
          actualValue: 105,
          achievementRatePercent: 105.0,
          achievementStatus: "達成",
        },
        {
          nutrientName: "カルシウム",
          recommendedValue: 800,
          actualValue: 820,
          achievementRatePercent: 102.5,
          achievementStatus: "達成",
        },
      ],
      allNutrientsFulfilledFlag: true,
      insufficientNutrientCount: 0,
    };

    // 献立生成優先条件セット決定機能を実行
    const result = determineMenuPriorityConditionSet(monthlyAnalysisData);

    // 優先条件セットタイプの確認：維持型であることを検証
    expect(result.priorityConditionSetType).toBe("maintenance");

    // 優先条件セットの詳細パラメータを検証
    expect(result.priorityConditionSetDetails).toEqual({
      priorityFocus: "nutritional_balance_maintenance",
      budgetOptimization: "relaxed",
      noveltyIntroduction: "low",
      familyPreferenceWeight: 0.6,
      nutritionalBalanceWeight: 0.3,
      budgetWeight: 0.1,
      menuDiversityLevel: "standard",
      costOptimizationLevel: "none",
      additionalConstraints: [],
    });

    // 決定根拠メタデータの検証
    expect(result.decisionReason).toEqual({
      budgetStatus: "within_limit",
      budgetDifferenceAmount: 2000, // 50,000 - 48,000 = 2,000円
      budgetDifferencePercent: 4.0, // (2,000 / 50,000) * 100 = 4%
      nutritionStatus: "all_fulfilled",
      insufficientNutrients: [],
      recommendedAction: "maintain_current_menu_balance",
    });

    // 意思決定スコアの検証
    expect(result.decisionScore).toEqual({
      budgetAdherenceScore: 96.0, // (48,000 / 50,000) * 100 = 96%
      nutritionFulfillmentScore: 102.9, // 平均達成率
      overallDecisionConfidenceScore: 99.5, // 超過なし＆全栄養充足で高信度
    });

    // タイムスタンプと有効期限の検証
    expect(result.decidedAt).toBe("2024-01-15T09:00:00Z");
    expect(result.validFrom).toBe("2024-02-01T00:00:00Z");
    expect(result.validUntil).toBe("2024-02-29T23:59:59Z");

    // ステータスと一意識別子の検証
    expect(result.status).toBe("determined");
    expect(typeof result.decisionId).toBe("string");
    expect(result.decisionId.length).toBeGreaterThan(0);
  });
});