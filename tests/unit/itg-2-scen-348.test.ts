import { describe, test, expect, beforeEach } from "@jest/globals";
import {
  analyzeMonthlyBudgetExceedance,
  adjustNextMonthMealPriorities,
} from "../../src/logic/it-1-br-2-1-1-1";

describe("月次食費超過要因分析と次月献立優先条件の自動調整", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-348
  test("月末食費実績が予算超過時、超過要因が食材構成と購入単価変動に分解され、次月献立優先条件が自動調整される", () => {
    // === 前提条件の設定 ===
    const userId = "user_001";
    const yearMonth = "2024-01";
    const budgetAmount = 100000;
    const actualSpent = 115000;

    // 購入実績データ：当月の食材別購入履歴
    const purchaseRecords = [
      {
        itemId: "item_001",
        itemName: "トマト",
        plannedQuantity: 10,
        actualQuantity: 12,
        standardPrice: 200,
        actualPrice: 250,
        category: "野菜",
      },
      {
        itemId: "item_002",
        itemName: "鶏肉",
        plannedQuantity: 5,
        actualQuantity: 5,
        standardPrice: 800,
        actualPrice: 950,
        category: "肉類",
      },
      {
        itemId: "item_003",
        itemName: "米",
        plannedQuantity: 20,
        actualQuantity: 20,
        standardPrice: 300,
        actualPrice: 300,
        category: "穀類",
      },
      {
        itemId: "item_004",
        itemName: "卵",
        plannedQuantity: 30,
        actualQuantity: 35,
        plannedQuantity: 30,
        actualQuantity: 35,
        standardPrice: 30,
        actualPrice: 35,
        category: "卵・乳製品",
      },
    ];

    // === 超過要因分析の実行 ===
    const exceedanceAnalysis = analyzeMonthlyBudgetExceedance({
      userId,
      yearMonth,
      budgetAmount,
      actualSpent,
      purchaseRecords,
    });

    // === 期待値計算 ===
    // 食材構成による超過：数量増加による超過
    const quantityExceedance =
      (12 - 10) * 200 + // トマト：数量超過分のコスト（標準価格ベース）
      (35 - 30) * 30; // 卵：数量超過分のコスト

    // 購入単価変動による超過：価格上昇による超過
    const priceFluctuationExceedance =
      (250 - 200) * 12 + // トマト：価格上昇分 × 実績数量
      (950 - 800) * 5 + // 鶏肉：価格上昇分 × 実績数量
      (35 - 30) * 35; // 卵：価格上昇分 × 実績数量

    const totalExceedance = actualSpent - budgetAmount; // 15,000円

    // === 超過要因分析の検証 ===
    expect(exceedanceAnalysis).toEqual({
      userId,
      yearMonth,
      budgetAmount,
      actualSpent,
      totalExceedance: 15000,
      exceedanceFactors: {
        quantityExceedance: expect.any(Number),
        priceFluctuationExceedance: expect.any(Number),
      },
      itemizeBreakdown: [
        {
          itemId: "item_001",
          itemName: "トマト",
          category: "野菜",
          quantityExceedance: 400, // (12-10) * 200
          priceFluctuationExceedance: 600, // (250-200) * 12
          totalExceedance: 1000,
        },
        {
          itemId: "item_002",
          itemName: "鶏肉",
          category: "肉類",
          quantityExceedance: 0,
          priceFluctuationExceedance: 750, // (950-800) * 5
          totalExceedance: 750,
        },
        {
          itemId: "item_003",
          itemName: "米",
          category: "穀類",
          quantityExceedance: 0,
          priceFluctuationExceedance: 0,
          totalExceedance: 0,
        },
        {
          itemId: "item_004",
          itemName: "卵",
          category: "卵・乳製品",
          quantityExceedance: 150, // (35-30) * 30
          priceFluctuationExceedance: 175, // (35-30) * 35
          totalExceedance: 325,
        },
      ],
      riskItems: [
        {
          itemId: "item_002",
          itemName: "鶏肉",
          riskLevel: "high",
          priceInflationRate: 0.1875, // (950-800)/800
        },
        {
          itemId: "item_001",
          itemName: "トマト",
          riskLevel: "high",
          priceInflationRate: 0.25, // (250-200)/200
        },
        {
          itemId: "item_004",
          itemName: "卵",
          riskLevel: "medium",
          priceInflationRate: 0.1667, // (35-30)/30
        },
      ],
    });

    // === 次月献立優先条件の自動調整 ===
    const adjustedPriorities = adjustNextMonthMealPriorities({
      userId,
      currentYearMonth: yearMonth,
      exceedanceAnalysis,
      mealPreferences: [
        {
          itemId: "item_001",
          currentUsageFrequency: 0.8,
        },
        {
          itemId: "item_002",
          currentUsageFrequency: 0.6,
        },
        {
          itemId: "item_003",
          currentUsageFrequency: 0.9,
        },
        {
          itemId: "item_004",
          currentUsageFrequency: 0.7,
        },
      ],
    });

    // === 調整内容の検証 ===
    expect(adjustedPriorities).toEqual({
      userId,
      nextYearMonth: "2024-02",
      adjustments: [
        {
          type: "usage_frequency_reduction",
          targetItemId: "item_002",
          targetItemName: "鶏肉",
          currentUsageFrequency: 0.6,
          adjustedUsageFrequency: 0.3, // 50%削減
          reason: "price_inflation_high",
          priceInflationRate: 0.1875,
        },
        {
          type: "usage_frequency_reduction",
          targetItemId: "item_001",
          targetItemName: "トマト",
          currentUsageFrequency: 0.8,
          adjustedUsageFrequency: 0.4, // 50%削減
          reason: "price_inflation_high",
          priceInflationRate: 0.25,
        },
        {
          type: "substitute_proposal",
          originalItemId: "item_002",
          originalItemName: "鶏肉",
          suggestedSubstitutes: [
            {
              itemId: "item_005",
              itemName: "豚肉",
              estimatedPriceReduction: 0.15,
              nutritionalComparison: "similar",
            },
            {
              itemId: "item_006",
              itemName: "豆製品",
              estimatedPriceReduction: 0.25,
              nutritionalComparison: "acceptable_alternative",
            },
          ],
        },
        {
          type: "substitute_proposal",
          originalItemId: "item_001",
          originalItemName: "トマト",
          suggestedSubstitutes: [
            {
              itemId: "item_007",
              itemName: "缶詰トマト",
              estimatedPriceReduction: 0.2,
              nutritionalComparison: "similar",
            },
          ],
        },
        {
          type: "priority_increase",
          targetItemId: "item_003",
          targetItemName: "米",
          reason: "price_stability",
          newPriority: 1.2, // 優先度を20%上昇
        },
      ],
      budgetAllocationStrategy: {
        highRiskReduction: 5000, // 高リスク食材の使用頻度低減による削減見込み
        substituteItemCost: 3000, // 代替食材への切り替えによるコスト削減
        stableItemIncrease: 2000, // 安定価格食材の使用増加
        expectedNextMonthBudget: 110000, // 115,000 - 5,000
      },
      implementationSchedule: {
        mealGenerationStartDate: "2024-02-01",
        applyCutoffDate: "2024-02-05",
        reviewDate: "2024-02-28",
      },
    });

    // === 追加検証：調整結果の詳細 ===
    expect(adjustedPriorities.adjustments).toHaveLength(5);
    expect(adjustedPriorities.adjustments[0].type).toBe(
      "usage_frequency_reduction"
    );
    expect(adjustedPriorities.adjustments[0].adjustedUsageFrequency).toBe(0.3);

    // === 調整内容が適切に記録されていることの確認 ===
    expect(adjustedPriorities.budgetAllocationStrategy.expectedNextMonthBudget).toBe(110000);
    expect(
      adjustedPriorities.budgetAllocationStrategy.highRiskReduction
    ).toBeGreaterThan(0);
    expect(
      adjustedPriorities.budgetAllocationStrategy.substituteItemCost
    ).toBeGreaterThan(0);

    // === エラーケース：予算未超過時の処理 ===
    const noExceedanceAnalysis = analyzeMonthlyBudgetExceedance({
      userId,
      yearMonth: "2024-02",
      budgetAmount: 100000,
      actualSpent: 95000,
      purchaseRecords: [],
    });

    expect(noExceedanceAnalysis.totalExceedance).toBe(0);
    expect(noExceedanceAnalysis.exceedanceFactors.quantityExceedance).toBe(0);
    expect(noExceedanceAnalysis.exceedanceFactors.priceFluctuationExceedance).toBe(
      0
    );

    // === エラーケース：データ欠損時の処理 ===
    expect(() => {
      analyzeMonthlyBudgetExceedance({
        userId: "",
        yearMonth,
        budgetAmount,
        actualSpent,
        purchaseRecords,
      });
    }).toThrow(/ユーザーID/);

    expect(() => {
      analyzeMonthlyBudgetExceedance({
        userId,
        yearMonth: "",
        budgetAmount,
        actualSpent,
        purchaseRecords,
      });
    }).toThrow(/年月/);

    expect(() => {
      analyzeMonthlyBudgetExceedance({
        userId,
        yearMonth,
        budgetAmount: -100000,
        actualSpent,
        purchaseRecords,
      });
    }).toThrow(/予算/);

    expect(() => {
      adjustNextMonthMealPriorities({
        userId: "",
        currentYearMonth: yearMonth,
        exceedanceAnalysis,
        mealPreferences: [],
      });
    }).toThrow(/ユーザーID/);
  });
});