import { evaluateMealConstraintSatisfaction } from "../../src/logic/it-7-2-1";

describe("献立生成の成功率・調理時間短縮度・ユーザー満足度スコアなどの行動指標を週次で自動集計し、アルゴリズム改善前後の効果差を定量比較するダッシュボード機能", () => {
  // SCEN-540: [normal] 制約条件充足度評価機能 - 複数制約条件を全て満たす献立案について各制約ごとの充足度スコアと総合スコアを計算する
  test("複数の制約条件を全て満たす献立案について、各制約ごとの充足度スコア（0～100）と総合スコア（加重平均値）が正確に計算されること", () => {
    // 準備：複数の制約条件を定義（栄養バランス、コスト、調理時間、アレルゲン回避）
    const mealPlan = {
      mealId: "meal_001",
      name: "バランス定食",
      dishes: [
        { dishId: "d1", name: "鶏ササミの塩焼き", cookingTimeMin: 10 },
        { dishId: "d2", name: "野菜サラダ", cookingTimeMin: 5 },
        { dishId: "d3", name: "米", cookingTimeMin: 20 },
      ],
      totalCookingTimeMin: 35,
      estimatedCostJPY: 850,
      nutritionScorePercentage: 92,
      allergenRiskLevel: 0,
      ingredients: ["鶏ササミ", "キャベツ", "人参", "米"],
    };

    const constraints = {
      nutritionBalance: {
        name: "栄養バランス",
        targetScore: 90,
        actualScore: 92,
        weight: 0.35,
      },
      cost: {
        name: "コスト",
        budgetJPY: 1000,
        actualCostJPY: 850,
        weight: 0.25,
      },
      cookingTime: {
        name: "調理時間",
        maxTimeMin: 45,
        actualTimeMin: 35,
        weight: 0.25,
      },
      allergenAvoidance: {
        name: "アレルゲン回避",
        restrictedAllergens: ["卵", "乳製品", "エビ"],
        detectedAllergens: [],
        weight: 0.15,
      },
    };

    // 実行：制約条件充足度評価機能を実行
    const result = evaluateMealConstraintSatisfaction(mealPlan, constraints);

    // 検証1：結果オブジェクトが構造化フォーマットで返される
    expect(result).toHaveProperty("constraintScores");
    expect(result).toHaveProperty("overallScore");
    expect(result).toHaveProperty("satisfactionDetails");

    // 検証2：各制約ごとの充足度スコアが計算されている
    expect(result.constraintScores).toHaveProperty("nutritionBalance");
    expect(result.constraintScores).toHaveProperty("cost");
    expect(result.constraintScores).toHaveProperty("cookingTime");
    expect(result.constraintScores).toHaveProperty("allergenAvoidance");

    // 検証3：栄養バランス充足度スコア（actualScore/targetScore * 100）= 92/90 * 100 = 102.2 → 100に正規化
    expect(result.constraintScores.nutritionBalance).toBe(100);

    // 検証4：コスト充足度スコア（budgetJPY/actualCostJPY * 100）= 1000/850 * 100 = 117.6 → 100に正規化
    expect(result.constraintScores.cost).toBe(100);

    // 検証5：調理時間充足度スコア（maxTimeMin/actualTimeMin * 100）= 45/35 * 100 = 128.6 → 100に正規化
    expect(result.constraintScores.cookingTime).toBe(100);

    // 検証6：アレルゲン回避充足度スコア（検出アレルゲン数が0のため100）
    expect(result.constraintScores.allergenAvoidance).toBe(100);

    // 検証7：各制約スコアが0～100の範囲内であることを検証
    Object.values(result.constraintScores).forEach((score) => {
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    // 検証8：総合スコアが加重平均として正しく計算されていることを確認
    // 総合スコア = 100*0.35 + 100*0.25 + 100*0.25 + 100*0.15 = 35 + 25 + 25 + 15 = 100
    expect(result.overallScore).toBe(100);

    // 検証9：総合スコアが0～100の範囲内であることを検証
    expect(result.overallScore).toBeGreaterThanOrEqual(0);
    expect(result.overallScore).toBeLessThanOrEqual(100);

    // 検証10：各制約ごとのスコア詳細が結果オブジェクトに含まれていることを検証
    expect(result.satisfactionDetails).toHaveProperty("nutritionBalanceDetail");
    expect(result.satisfactionDetails).toHaveProperty("costDetail");
    expect(result.satisfactionDetails).toHaveProperty("cookingTimeDetail");
    expect(result.satisfactionDetails).toHaveProperty("allergenAvoidanceDetail");

    // 検証11：各詳細オブジェクトが期待されるフィールドを持つことを確認
    expect(result.satisfactionDetails.nutritionBalanceDetail).toHaveProperty(
      "score"
    );
    expect(result.satisfactionDetails.nutritionBalanceDetail).toHaveProperty(
      "satisfied"
    );
    expect(result.satisfactionDetails.nutritionBalanceDetail).toHaveProperty(
      "ratio"
    );

    // 検証12：栄養バランスの詳細チェック
    expect(result.satisfactionDetails.nutritionBalanceDetail.score).toBe(100);
    expect(result.satisfactionDetails.nutritionBalanceDetail.satisfied).toBe(
      true
    );
    expect(result.satisfactionDetails.nutritionBalanceDetail.ratio).toBeCloseTo(
      1.0222,
      3
    );

    // 検証13：コストの詳細チェック
    expect(result.satisfactionDetails.costDetail.score).toBe(100);
    expect(result.satisfactionDetails.costDetail.satisfied).toBe(true);
    expect(result.satisfactionDetails.costDetail.ratio).toBeCloseTo(1.1765, 3);

    // 検証14：調理時間の詳細チェック
    expect(result.satisfactionDetails.cookingTimeDetail.score).toBe(100);
    expect(result.satisfactionDetails.cookingTimeDetail.satisfied).toBe(true);
    expect(result.satisfactionDetails.cookingTimeDetail.ratio).toBeCloseTo(
      1.2857,
      3
    );

    // 検証15：アレルゲン回避の詳細チェック
    expect(result.satisfactionDetails.allergenAvoidanceDetail.score).toBe(100);
    expect(result.satisfactionDetails.allergenAvoidanceDetail.satisfied).toBe(
      true
    );
    expect(
      result.satisfactionDetails.allergenAvoidanceDetail.allergenCount
    ).toBe(0);

    // 検証16：結果形式が仕様書で定義されたフォーマットに準拠していることを確認
    expect(typeof result.overallScore).toBe("number");
    expect(typeof result.constraintScores.nutritionBalance).toBe("number");
    expect(typeof result.constraintScores.cost).toBe("number");
    expect(typeof result.constraintScores.cookingTime).toBe("number");
    expect(typeof result.constraintScores.allergenAvoidance).toBe("number");
    expect(typeof result.satisfactionDetails.nutritionBalanceDetail.satisfied).toBe(
      "boolean"
    );
    expect(typeof result.satisfactionDetails.costDetail.satisfied).toBe(
      "boolean"
    );
    expect(typeof result.satisfactionDetails.cookingTimeDetail.satisfied).toBe(
      "boolean"
    );
    expect(
      typeof result.satisfactionDetails.allergenAvoidanceDetail.satisfied
    ).toBe("boolean");

    // 検証17：すべての制約が満たされていることを確認
    expect(result.satisfactionDetails.nutritionBalanceDetail.satisfied).toBe(
      true
    );
    expect(result.satisfactionDetails.costDetail.satisfied).toBe(true);
    expect(result.satisfactionDetails.cookingTimeDetail.satisfied).toBe(true);
    expect(result.satisfactionDetails.allergenAvoidanceDetail.satisfied).toBe(
      true
    );
  });
});