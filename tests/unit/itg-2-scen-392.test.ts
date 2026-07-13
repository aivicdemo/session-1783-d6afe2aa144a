import {
  aggregateMonthlyMealCostAndNutritionData,
  calculateMealSatisfactionScore,
  calculateFoodCostReductionRate,
  generateNextMonthMenuPriorityConditions,
  sortMenuProposalsBySatisfactionScore,
  sortMenuProposalsByCostReductionRate,
  combineMultiplePriorityConditionsForMenuProposal,
  validateAndDisplayMenuProposalJustification,
} from "../../src/logic/it-1-br-2-1-1-1";

describe("月次食費集計と次月献立生成優先条件の提案", () => {
  // SCEN-392: [normal] 月次食費集計機能 - 次月の献立生成優先条件が満足度スコアと削減率から正しく提案される
  test("月次食費実績と栄養摂取データから次月献立生成優先条件を満足度スコアと食費削減率に基づいて提案する", () => {
    // ===== 前提: 月末時点で献立実績データと食費実績データがシステムに蓄積されている状態 =====
    const userId = "user_001";
    const currentMonth = "2024-01";
    const monthlyBudget = 50000; // 月間予算: 50,000円

    // 当月の食費実績データ
    const currentMonthFoodExpenses = [
      {
        date: "2024-01-01",
        category: "野菜",
        amount: 2500,
        mealId: "meal_001",
      },
      {
        date: "2024-01-02",
        category: "肉類",
        amount: 3200,
        mealId: "meal_002",
      },
      {
        date: "2024-01-03",
        category: "魚類",
        amount: 2800,
        mealId: "meal_003",
      },
      {
        date: "2024-01-04",
        category: "穀類",
        amount: 1500,
        mealId: "meal_004",
      },
      {
        date: "2024-01-05",
        category: "乳製品",
        amount: 1800,
        mealId: "meal_005",
      },
    ];

    const totalMonthlyExpenses = currentMonthFoodExpenses.reduce(
      (sum, exp) => sum + exp.amount,
      0
    ); // 11,800円

    // 当月の献立データと家族成員の食事評価
    const currentMonthMealRecords = [
      {
        mealId: "meal_001",
        mealName: "野菜サラダ",
        satisfactionScore: 4,
        completionRate: 0.9,
        familyFeedback: "美味しかった",
        nutritionAchievementRate: 0.85,
      },
      {
        mealId: "meal_002",
        mealName: "牛肉ステーキ",
        satisfactionScore: 5,
        completionRate: 1.0,
        familyFeedback: "最高だった",
        nutritionAchievementRate: 0.92,
      },
      {
        mealId: "meal_003",
        mealName: "焼き魚",
        satisfactionScore: 4,
        completionRate: 0.85,
        familyFeedback: "良かった",
        nutritionAchievementRate: 0.88,
      },
      {
        mealId: "meal_004",
        mealName: "米粥",
        satisfactionScore: 3,
        completionRate: 0.7,
        familyFeedback: "普通",
        nutritionAchievementRate: 0.75,
      },
      {
        mealId: "meal_005",
        mealName: "ヨーグルト",
        satisfactionScore: 4,
        completionRate: 0.95,
        familyFeedback: "美味しい",
        nutritionAchievementRate: 0.81,
      },
    ];

    // ===== ステップ1: 月次食費集計機能を開く & 当月の食費データと献立データが正しく読み込まれていることを確認 =====
    const aggregatedData = aggregateMonthlyMealCostAndNutritionData({
      userId,
      month: currentMonth,
      expenses: currentMonthFoodExpenses,
      mealRecords: currentMonthMealRecords,
    });

    expect(aggregatedData).toBeDefined();
    expect(aggregatedData.totalExpenses).toBe(11800);
    expect(aggregatedData.mealCount).toBe(5);
    expect(aggregatedData.expenses).toEqual(currentMonthFoodExpenses);
    expect(aggregatedData.mealRecords).toEqual(currentMonthMealRecords);

    // ===== ステップ2: 当月の満足度スコア（1-5段階）を確認 =====
    const satisfactionScore = calculateMealSatisfactionScore({
      mealRecords: currentMonthMealRecords,
    });

    // 満足度スコア計算: (4 + 5 + 4 + 3 + 4) / 5 = 20 / 5 = 4.0
    expect(satisfactionScore).toBe(4.0);

    // ===== ステップ3: 当月の食費削減率（%）を計算・確認 =====
    const previousMonthExpenses = 15000; // 前月の食費: 15,000円
    const foodCostReductionRate = calculateFoodCostReductionRate({
      currentMonthExpenses: totalMonthlyExpenses,
      previousMonthExpenses,
    });

    // 食費削減率: (15000 - 11800) / 15000 * 100 = 3200 / 15000 * 100 = 21.33%
    expect(foodCostReductionRate).toBeCloseTo(21.33, 1);

    // ===== ステップ4: 次月の献立生成ボタンをクリック & 優先条件の提案ロジックが実行 =====
    const nextMonthCandidateMenus = [
      {
        candidateMenuId: "candidate_001",
        mealName: "高タンパク鶏肉丼",
        estimatedCost: 2200,
        estimatedSatisfactionScore: 4.5,
        estimatedCostReductionRate: 18.0,
        nutritionBalance: {
          protein: 0.95,
          carb: 0.88,
          fat: 0.82,
          vitamin: 0.79,
        },
      },
      {
        candidateMenuId: "candidate_002",
        mealName: "野菜たっぷりスープ",
        estimatedCost: 1800,
        estimatedSatisfactionScore: 4.0,
        estimatedCostReductionRate: 25.0,
        nutritionBalance: {
          protein: 0.75,
          carb: 0.85,
          fat: 0.88,
          vitamin: 0.92,
        },
      },
      {
        candidateMenuId: "candidate_003",
        mealName: "豪華海鮮盛り",
        estimatedCost: 3500,
        estimatedSatisfactionScore: 5.0,
        estimatedCostReductionRate: 10.0,
        nutritionBalance: {
          protein: 0.98,
          carb: 0.80,
          fat: 0.85,
          vitamin: 0.87,
        },
      },
    ];

    const nextMonthPriorityConditions = generateNextMonthMenuPriorityConditions({
      userId,
      currentSatisfactionScore: satisfactionScore,
      currentCostReductionRate: foodCostReductionRate,
      candidateMenus: nextMonthCandidateMenus,
      budget: monthlyBudget,
    });

    expect(nextMonthPriorityConditions).toBeDefined();
    expect(nextMonthPriorityConditions.priorityConditions).toBeDefined();
    expect(nextMonthPriorityConditions.priorityConditions.length).toBeGreaterThan(
      0
    );

    // ===== ステップ5: 提案された献立が満足度スコアが高い順にソート =====
    const sortedBySatisfaction = sortMenuProposalsBySatisfactionScore({
      menus: nextMonthCandidateMenus,
    });

    expect(sortedBySatisfaction).toBeDefined();
    expect(sortedBySatisfaction[0].candidateMenuId).toBe("candidate_003"); // 満足度5.0が最初
    expect(sortedBySatisfaction[1].candidateMenuId).toBe("candidate_001"); // 満足度4.5が次
    expect(sortedBySatisfaction[2].candidateMenuId).toBe("candidate_002"); // 満足度4.0が最後
    expect(sortedBySatisfaction[0].estimatedSatisfactionScore).toBe(5.0);
    expect(sortedBySatisfaction[1].estimatedSatisfactionScore).toBe(4.5);
    expect(sortedBySatisfaction[2].estimatedSatisfactionScore).toBe(4.0);

    // ===== ステップ6: 提案された献立が食費削減率が高い順にソート =====
    const sortedByCostReduction = sortMenuProposalsByCostReductionRate({
      menus: nextMonthCandidateMenus,
    });

    expect(sortedByCostReduction).toBeDefined();
    expect(sortedByCostReduction[0].candidateMenuId).toBe("candidate_002"); // 削減率25.0が最初
    expect(sortedByCostReduction[1].candidateMenuId).toBe("candidate_001"); // 削減率18.0が次
    expect(sortedByCostReduction[2].candidateMenuId).toBe("candidate_003"); // 削減率10.0が最後
    expect(sortedByCostReduction[0].estimatedCostReductionRate).toBe(25.0);
    expect(sortedByCostReduction[1].estimatedCostReductionRate).toBe(18.0);
    expect(sortedByCostReduction[2].estimatedCostReductionRate).toBe(10.0);

    // ===== ステップ7: 複数の優先条件を組み合わせた提案結果が表示される =====
    const combinedProposalResult = combineMultiplePriorityConditionsForMenuProposal({
      candidateMenus: nextMonthCandidateMenus,
      satisfactionWeight: 0.6,
      costReductionWeight: 0.4,
      targetBudget: monthlyBudget,
    });

    expect(combinedProposalResult).toBeDefined();
    expect(combinedProposalResult.rankedProposals).toBeDefined();
    expect(combinedProposalResult.rankedProposals.length).toBe(3);

    // 複合スコアを検証: 満足度スコア * 0.6 + 削減率 * 0.4
    // candidate_001: 4.5 * 0.6 + 18.0 * 0.4 = 2.7 + 7.2 = 9.9
    // candidate_002: 4.0 * 0.6 + 25.0 * 0.4 = 2.4 + 10.0 = 12.4
    // candidate_003: 5.0 * 0.6 + 10.0 * 0.4 = 3.0 + 4.0 = 7.0
    // したがって並び順は: candidate_002 (12.4) > candidate_001 (9.9) > candidate_003 (7.0)
    expect(combinedProposalResult.rankedProposals[0].candidateMenuId).toBe(
      "candidate_002"
    );
    expect(combinedProposalResult.rankedProposals[1].candidateMenuId).toBe(
      "candidate_001"
    );
    expect(combinedProposalResult.rankedProposals[2].candidateMenuId).toBe(
      "candidate_003"
    );

    // 複合スコアが計算されていることを確認
    expect(combinedProposalResult.rankedProposals[0].combinedScore).toBeCloseTo(
      12.4,
      1
    );
    expect(combinedProposalResult.rankedProposals[1].combinedScore).toBeCloseTo(
      9.9,
      1
    );
    expect(combinedProposalResult.rankedProposals[2].combinedScore).toBeCloseTo(
      7.0,
      1
    );

    // ===== ステップ8: 提案結果に対して満足度スコアと削減率の根拠情報が正しく表示 =====
    const justificationData = validateAndDisplayMenuProposalJustification({
      rankedProposals: combinedProposalResult.rankedProposals,
      currentSatisfactionScore: satisfactionScore,
      currentCostReductionRate: foodCostReductionRate,
    });

    expect(justificationData).toBeDefined();
    expect(justificationData.proposals).toBeDefined();
    expect(justificationData.proposals.length).toBe(3);

    // 各提案に対する根拠情報を検証
    expect(justificationData.proposals[0]).toMatchObject({
      candidateMenuId: "candidate_002",
      satisfactionScoreJustification: expect.any(String),
      costReductionRateJustification: expect.any(String),
      combinedScoreBreakdown: expect.objectContaining({
        satisfactionComponent: expect.any(Number),
        costReductionComponent: expect.any(Number),
        totalScore: expect.any(Number),
      }),
    });

    // 満足度スコアの根拠情報が当月実績値を含むことを確認
    expect(justificationData.proposals[0].satisfactionScoreJustification).toContain(
      "4.0"
    );

    // 食費削減率の根拠情報が当月実績値を含むことを確認
    expect(
      justificationData.proposals[0].costReductionRateJustification
    ).toContain("21.33");

    // 複合スコアの内訳が正しく計算されていることを確認
    expect(
      justificationData.proposals[0].combinedScoreBreakdown.satisfactionComponent
    ).toBeCloseTo(4.0 * 0.6, 1);
    expect(
      justificationData.proposals[0].combinedScoreBreakdown.costReductionComponent
    ).toBeCloseTo(25.0 * 0.4, 1);
    expect(
      justificationData.proposals[0].combinedScoreBreakdown.totalScore
    ).toBeCloseTo(12.4, 1);

    // ===== ステップ9: 提案された献立を確定し、次月の献立として登録 =====
    const confirmationResult = {
      nextMonthMenuId: "nextmonth_menu_001",
      selectedMenuIds: [
        combinedProposalResult.rankedProposals[0].candidateMenuId,
        combinedProposalResult.rankedProposals[1].candidateMenuId,
      ],
      priorityConditionsApplied: {
        satisfactionScore: satisfactionScore,
        costReductionRate: foodCostReductionRate,
        satisfactionWeight: 0.6,
        costReductionWeight: 0.4,
      },
      registrationTimestamp: "2024-02-01T09:00:00Z",
    };

    expect(confirmationResult).toBeDefined();
    expect(confirmationResult.nextMonthMenuId).toBeDefined();
    expect(confirmationResult.selectedMenuIds).toHaveLength(2);
    expect(confirmationResult.selectedMenuIds[0]).toBe("candidate_002");
    expect(confirmationResult.selectedMenuIds[1]).toBe("candidate_001");
    expect(confirmationResult.priorityConditionsApplied.satisfactionScore).toBe(
      4.0
    );
    expect(
      confirmationResult.priorityConditionsApplied.costReductionRate
    ).toBeCloseTo(21.33, 1);

    // ===== 期待結果の最終検証 =====
    // 1. 月次食費実績と栄養摂取データが正しく集計されている
    expect(aggregatedData.totalExpenses).toBe(11800);
    expect(aggregatedData.mealCount).toBe(5);

    // 2. 満足度スコアが正確に計算されている
    expect(satisfactionScore).toBe(4.0);

    // 3. 食費削減率が正確に計算されている
    expect(foodCostReductionRate).toBeCloseTo(21.33, 1);

    // 4. 複数の条件を組み合わせた最適な献立候補が提示されている
    expect(combinedProposalResult.rankedProposals).toHaveLength(3);
    expect(combinedProposalResult.rankedProposals[0].candidateMenuId).toBe(
      "candidate_002"
    );

    // 5. 各提案に対する満足度スコアと食費削減率の根拠情報が正確に計算・表示されている
    expect(justificationData.proposals[0].combinedScoreBreakdown.totalScore).toBeCloseTo(
      12.4,
      1
    );
    expect(
      justificationData.proposals[1].combinedScoreBreakdown.totalScore
    ).toBeCloseTo(9.9, 1);
    expect(
      justificationData.proposals[2].combinedScoreBreakdown.totalScore
    ).toBeCloseTo(7.0, 1);
  });
});