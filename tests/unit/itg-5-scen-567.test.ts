import { analyzeMonthlyFoodCostExcess } from "../../src/logic/it-7-2-1";

describe("月次食費超過要因分析機能", () => {
  // SCEN-567
  test("食費実績が予算上限を超過した場合、食材構成と購入単価の変動に分解される", () => {
    // 前提条件: 月次食費超過データが準備されている
    const userId = "user_001";
    const year = 2024;
    const month = 1;
    const budgetLimit = 50000; // 予算上限: 50,000円

    // 実績データ: 食材別の購入量・単価
    // 前月比較用の基準データも含める
    const currentMonthPurchases = [
      // 食材A: 購入量10kg、単価1000円/kg → 合計10,000円
      { foodItemId: "item_001", itemName: "食材A", quantity: 10, unitPrice: 1000, totalPrice: 10000 },
      // 食材B: 購入量5kg、単価800円/kg → 合計4,000円（前月は600円/kg）
      { foodItemId: "item_002", itemName: "食材B", quantity: 5, unitPrice: 800, totalPrice: 4000 },
      // 食材C: 購入量15kg、単価1200円/kg → 合計18,000円（前月は10kg）
      { foodItemId: "item_003", itemName: "食材C", quantity: 15, unitPrice: 1200, totalPrice: 18000 },
      // 食材D: 購入量8kg、単価900円/kg → 合計7,200円
      { foodItemId: "item_004", itemName: "食材D", quantity: 8, unitPrice: 900, totalPrice: 7200 },
    ];

    // 前月実績（基準）: 同じ単価・異なる購入量
    const previousMonthPurchases = [
      { foodItemId: "item_001", itemName: "食材A", quantity: 10, unitPrice: 1000, totalPrice: 10000 },
      { foodItemId: "item_002", itemName: "食材B", quantity: 5, unitPrice: 600, totalPrice: 3000 },
      { foodItemId: "item_003", itemName: "食材C", quantity: 10, unitPrice: 1200, totalPrice: 12000 },
      { foodItemId: "item_004", itemName: "食材D", quantity: 8, unitPrice: 900, totalPrice: 7200 },
    ];

    const currentMonthTotal = 39200; // 実績合計
    const previousMonthTotal = 32200; // 前月合計

    // 分析入力データ
    const analysisInput = {
      userId,
      year,
      month,
      budgetLimit,
      currentMonthPurchases,
      previousMonthPurchases,
      currentMonthTotal,
      previousMonthTotal,
    };

    // 分析実行
    const result = analyzeMonthlyFoodCostExcess(analysisInput);

    // 期待値計算
    // 超過額 = 39,200 - 50,000 = -10,800（実際には超過していない、ここでは逆のケースを用意）
    // 正しいシナリオ: 実績が予算を超過するケース
    const revisedAnalysisInput = {
      userId,
      year,
      month,
      budgetLimit: 35000, // 予算を35,000に設定して超過させる
      currentMonthPurchases,
      previousMonthPurchases,
      currentMonthTotal: 39200, // 実績: 39,200円
      previousMonthTotal: 32200,
    };

    const revisedResult = analyzeMonthlyFoodCostExcess(revisedAnalysisInput);

    // 超過額の検証
    const excessAmount = revisedResult.currentMonthTotal - revisedAnalysisInput.budgetLimit; // 39,200 - 35,000 = 4,200
    expect(revisedResult.excessAmount).toBe(4200);

    // 食材構成の変動分析
    // 食材C: 購入量 10kg → 15kg に増加、単価据置 1,200円
    // 構成変動による増加分 = (15 - 10) × 1,200 = 6,000円
    const compositionVariance = revisedResult.compositionVariance;
    expect(compositionVariance).toBe(6000);

    // 購入単価の変動分析
    // 食材B: 単価 600円/kg → 800円/kg に上昇、購入量据置 5kg
    // 単価変動による増加分 = 5 × (800 - 600) = 1,000円
    const unitPriceVariance = revisedResult.unitPriceVariance;
    expect(unitPriceVariance).toBe(1000);

    // 両要因の合計が超過額を説明できることを検証
    // 6,000 + 1,000 = 7,000 > 4,200（超過額）
    // ※ 実際には他の食材の変動も含まれるため、詳細検証
    const totalVariance = compositionVariance + unitPriceVariance;
    expect(totalVariance).toBeGreaterThanOrEqual(excessAmount);

    // 詳細内訳の検証
    expect(revisedResult.detailedBreakdown).toBeDefined();
    expect(Array.isArray(revisedResult.detailedBreakdown)).toBe(true);

    // 食材別の寄与度が正確に計算されていることを確認
    const foodItemCBreakdown = revisedResult.detailedBreakdown.find(
      (item: any) => item.foodItemId === "item_003"
    );
    expect(foodItemCBreakdown).toBeDefined();
    expect(foodItemCBreakdown.contributionAmount).toBe(6000);
    expect(foodItemCBreakdown.contributionType).toBe("composition");

    const foodItemBBreakdown = revisedResult.detailedBreakdown.find(
      (item: any) => item.foodItemId === "item_002"
    );
    expect(foodItemBBreakdown).toBeDefined();
    expect(foodItemBBreakdown.contributionAmount).toBe(1000);
    expect(foodItemBBreakdown.contributionType).toBe("unitPrice");

    // 分析結果の統計情報
    expect(revisedResult.analysisDate).toBeDefined();
    expect(revisedResult.analysisStatus).toBe("completed");

    // 次月の献立生成への推奨優先条件が提案されていることを確認
    expect(revisedResult.nextMonthRecommendation).toBeDefined();
    expect(revisedResult.nextMonthRecommendation.priorityItems).toContain("item_003"); // 購入量が多い食材
  });
});