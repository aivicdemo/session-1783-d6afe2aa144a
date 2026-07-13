import { analyzePredictionAccuracyDeviation } from "../../src/logic/it-1-br-3-2-1";

describe("購入実績の記録と月次食費削減効果の自動集計・分析機能", () => {
  // SCEN-456: [normal] 予測精度低下要因分析機能 - 特定カテゴリの乖離度が閾値を超えた場合に該当カテゴリの優先度が最高に設定される
  test("特定カテゴリの乖離度が閾値を超えた場合、該当カテゴリの優先度が最高に自動設定される", () => {
    const categories = [
      {
        categoryId: "cat_001",
        categoryName: "食料品",
        budgetAmount: 30000,
        actualAmount: 28500,
        deviationThreshold: 0.15,
      },
      {
        categoryId: "cat_002",
        categoryName: "外食",
        budgetAmount: 10000,
        actualAmount: 18000,
        deviationThreshold: 0.15,
      },
      {
        categoryId: "cat_003",
        categoryName: "飲料",
        budgetAmount: 5000,
        actualAmount: 5200,
        deviationThreshold: 0.15,
      },
    ];

    const analysisResult = analyzePredictionAccuracyDeviation({
      categories,
      analysisMonth: "2024-01",
    });

    // 外食カテゴリの乖離度計算: |18000 - 10000| / 10000 = 0.8 (80%)
    // これは閾値 0.15 (15%) を超えているため、優先度が最高に設定される
    const outsideDiningCategory = analysisResult.prioritizedCategories[0];
    expect(outsideDiningCategory.categoryId).toBe("cat_002");
    expect(outsideDiningCategory.categoryName).toBe("外食");
    expect(outsideDiningCategory.deviationRate).toBe(0.8);
    expect(outsideDiningCategory.priority).toBe("HIGHEST");
    expect(outsideDiningCategory.priorityLabel).toBe("最高");
    expect(outsideDiningCategory.displayOrder).toBe(1);

    // 食料品カテゴリの乖離度計算: |28500 - 30000| / 30000 = 0.05 (5%)
    // これは閾値 0.15 (15%) 以下であるため、通常優先度
    const foodCategory = analysisResult.prioritizedCategories[1];
    expect(foodCategory.categoryId).toBe("cat_001");
    expect(foodCategory.categoryName).toBe("食料品");
    expect(foodCategory.deviationRate).toBeCloseTo(0.05, 2);
    expect(foodCategory.priority).toBe("NORMAL");
    expect(foodCategory.priorityLabel).toBe("通常");
    expect(foodCategory.displayOrder).toBe(2);

    // 飲料カテゴリの乖離度計算: |5200 - 5000| / 5000 = 0.04 (4%)
    // これは閾値 0.15 (15%) 以下であるため、通常優先度
    const beverageCategory = analysisResult.prioritizedCategories[2];
    expect(beverageCategory.categoryId).toBe("cat_003");
    expect(beverageCategory.categoryName).toBe("飲料");
    expect(beverageCategory.deviationRate).toBe(0.04);
    expect(beverageCategory.priority).toBe("NORMAL");
    expect(beverageCategory.priorityLabel).toBe("通常");
    expect(beverageCategory.displayOrder).toBe(3);

    // 分析結果全体の検証
    expect(analysisResult.analysisMonth).toBe("2024-01");
    expect(analysisResult.totalCategoriesAnalyzed).toBe(3);
    expect(analysisResult.highestPriorityCategoryCount).toBe(1);
    expect(analysisResult.prioritizedCategories.length).toBe(3);
    expect(analysisResult.prioritizedCategories[0].priority).toBe("HIGHEST");
  });
});