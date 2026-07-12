import { recalculatePainFactorPriority } from "../../src/logic/it-3";

describe("食事評価データを献立生成ロジックに反映させる機能", () => {
  // SCEN-679: [normal] 優先度マトリクス再計算機能 - 四半期市場環境変化時にペイン要因の優先度が正しく再計算される
  test("should recalculate pain factor priority matrix based on quarterly market environment changes", () => {
    // 初期ペイン要因と優先度スコア
    const initialPainFactors = [
      {
        id: "pf_001",
        name: "食材制限",
        frequencyScore: 85,
        impactScore: 78,
        initialPriorityScore: 81,
        initialImportanceAxis: 78,
        initialUrgencyAxis: 85,
      },
      {
        id: "pf_002",
        name: "調理時間制限",
        frequencyScore: 72,
        impactScore: 88,
        initialPriorityScore: 80,
        initialImportanceAxis: 88,
        initialUrgencyAxis: 72,
      },
      {
        id: "pf_003",
        name: "予算制約",
        frequencyScore: 65,
        impactScore: 70,
        initialPriorityScore: 67,
        initialImportanceAxis: 70,
        initialUrgencyAxis: 65,
      },
      {
        id: "pf_004",
        name: "栄養バランス",
        frequencyScore: 58,
        impactScore: 92,
        initialPriorityScore: 75,
        initialImportanceAxis: 92,
        initialUrgencyAxis: 58,
      },
      {
        id: "pf_005",
        name: "家族嗜好未反映",
        frequencyScore: 70,
        impactScore: 75,
        initialPriorityScore: 72,
        initialImportanceAxis: 75,
        initialUrgencyAxis: 70,
      },
    ];

    // 初期状態の優先度順位: 食材制限(81) > 調理時間制限(80) > 栄養バランス(75) > 家族嗜好未反映(72) > 予算制約(67)
    const initialRanking = [0, 1, 3, 4, 2]; // indices

    // 四半期市場環境変化パラメータ
    const marketEnvironmentChanges = {
      demandTrendShift: 1.15, // 需要トレンド変化率: 1.15倍（食材制限のニーズ増加）
      competitionIntensity: 0.92, // 競争状況: 0.92倍（競合は調理時間短縮に注力）
      consumerPreferenceShift: {
        healthFocus: 1.25, // 健康志向が25%上昇→栄養バランス重要度UP
        timeOptimization: 0.88, // 時間最適化のニーズ12%低下
        budgetSensitivity: 1.1, // 予算意識が10%上昇
      },
      marketVolatility: 0.95, // 市場変動性: 0.95（若干安定化）
    };

    // 再計算ロジック実行
    const recalculationResult = recalculatePainFactorPriority(
      initialPainFactors,
      marketEnvironmentChanges
    );

    // 検証1: 再計算後の優先度スコアが正しく計算されている
    // 食材制限: 81 * 1.15 = 93.15 ≈ 93
    expect(recalculationResult.updatedPainFactors[0].recalculatedPriorityScore).toBe(93);

    // 調理時間制限: 80 * 0.88 = 70.4 ≈ 70
    expect(recalculationResult.updatedPainFactors[1].recalculatedPriorityScore).toBe(70);

    // 栄養バランス: 75 * 1.25 = 93.75 ≈ 94
    expect(recalculationResult.updatedPainFactors[3].recalculatedPriorityScore).toBe(94);

    // 家族嗜好未反映: 72 * 1.1 = 79.2 ≈ 79
    expect(recalculationResult.updatedPainFactors[4].recalculatedPriorityScore).toBe(79);

    // 予算制約: 67 * 1.1 = 73.7 ≈ 74
    expect(recalculationResult.updatedPainFactors[2].recalculatedPriorityScore).toBe(74);

    // 検証2: 重要度軸と緊急性軸が市場環境に応じて更新されている
    // 食材制限: importance = 78 * 1.15 = 89.7 ≈ 90, urgency = 85 * 1.15 = 97.75 ≈ 98
    expect(recalculationResult.updatedPainFactors[0].recalculatedImportanceAxis).toBe(90);
    expect(recalculationResult.updatedPainFactors[0].recalculatedUrgencyAxis).toBe(98);

    // 栄養バランス: importance = 92 * 1.25 = 115 → cap at 100, urgency = 58 * 1.25 = 72.5 ≈ 73
    expect(recalculationResult.updatedPainFactors[3].recalculatedImportanceAxis).toBe(100);
    expect(recalculationResult.updatedPainFactors[3].recalculatedUrgencyAxis).toBe(73);

    // 検証3: 再計算後の優先度順位が正しく再配置されている
    // 新優先度順位: 栄養バランス(94) > 食材制限(93) > 家族嗜好未反映(79) > 予算制約(74) > 調理時間制限(70)
    const newRanking = recalculationResult.newPriorityRanking;
    expect(newRanking[0]).toBe("pf_004"); // 栄養バランス: 優先度1位
    expect(newRanking[1]).toBe("pf_001"); // 食材制限: 優先度2位
    expect(newRanking[2]).toBe("pf_005"); // 家族嗜好未反映: 優先度3位
    expect(newRanking[3]).toBe("pf_003"); // 予算制約: 優先度4位
    expect(newRanking[4]).toBe("pf_002"); // 調理時間制限: 優先度5位

    // 検証4: 優先度が変更されたペイン要因を確認
    expect(recalculationResult.priorityChanges).toHaveLength(5);

    // 栄養バランスの優先度変化: 元は3位 → 新1位（変化度: -2）
    const nutritionChange = recalculationResult.priorityChanges.find(
      (c) => c.painFactorId === "pf_004"
    );
    expect(nutritionChange?.previousRank).toBe(3);
    expect(nutritionChange?.newRank).toBe(1);
    expect(nutritionChange?.rankShift).toBe(-2);
    expect(nutritionChange?.scoreDelta).toBe(19); // 94 - 75 = 19

    // 調理時間制限の優先度変化: 元は2位 → 新5位（変化度: +3）
    const cookingTimeChange = recalculationResult.priorityChanges.find(
      (c) => c.painFactorId === "pf_002"
    );
    expect(cookingTimeChange?.previousRank).toBe(2);
    expect(cookingTimeChange?.newRank).toBe(5);
    expect(cookingTimeChange?.rankShift).toBe(3);
    expect(cookingTimeChange?.scoreDelta).toBe(-10); // 70 - 80 = -10

    // 検証5: マトリクス座標（重要度軸 vs 緊急性軸）の更新確認
    const matrixCoordinates = recalculationResult.matrixCoordinates;

    // 食材制限: importance=90, urgency=98 → 左上（重要かつ緊急）
    const foodRestrictionCoord = matrixCoordinates.find(
      (c) => c.painFactorId === "pf_001"
    );
    expect(foodRestrictionCoord?.importanceAxis).toBe(90);
    expect(foodRestrictionCoord?.urgencyAxis).toBe(98);
    expect(foodRestrictionCoord?.quadrant).toBe("high_importance_high_urgency");

    // 栄養バランス: importance=100, urgency=73 → 右上（重要だが緊急性低）
    const nutritionCoord = matrixCoordinates.find(
      (c) => c.painFactorId === "pf_004"
    );
    expect(nutritionCoord?.importanceAxis).toBe(100);
    expect(nutritionCoord?.urgencyAxis).toBe(73);
    expect(nutritionCoord?.quadrant).toBe("high_importance_low_urgency");

    // 予算制約: importance=77, urgency=71 → 右下（低重要性低緊急性）
    const budgetCoord = matrixCoordinates.find(
      (c) => c.painFactorId === "pf_003"
    );
    expect(budgetCoord?.importanceAxis).toBe(77);
    expect(budgetCoord?.urgencyAxis).toBe(71);
    expect(budgetCoord?.quadrant).toBe("low_importance_low_urgency");

    // 検証6: 再計算メタデータが正しく記録されている
    expect(recalculationResult.recalculationTimestamp).toBeDefined();
    expect(recalculationResult.quarterIdentifier).toBe("Q2_2024");
    expect(recalculationResult.marketEnvironmentFactorsApplied).toEqual([
      "demandTrendShift",
      "competitionIntensity",
      "consumerPreferenceShift",
      "marketVolatility",
    ]);
    expect(recalculationResult.recalculationStatus).toBe("completed");

    // 検証7: 献立提案優先順序が最適化されている確認
    expect(recalculationResult.recommendedMenuPriorityOrder).toEqual([
      "pf_004", // 栄養バランス（健康志向UP対応）
      "pf_001", // 食材制限（需要トレンドUP対応）
      "pf_005", // 家族嗜好未反映
      "pf_003", // 予算制約
      "pf_002", // 調理時間制限（競合対応状況UPで自社優先度DOWN）
    ]);

    // 検証8: 市場環境変化の適用率が確認可能
    expect(recalculationResult.weightingFactorsApplied).toBeDefined();
    expect(
      recalculationResult.weightingFactorsApplied.find(
        (w) => w.factor === "demandTrendShift"
      )?.appliedWeight
    ).toBe(1.15);
    expect(
      recalculationResult.weightingFactorsApplied.find(
        (w) => w.factor === "competitionIntensity"
      )?.appliedWeight
    ).toBe(0.92);
  });
});