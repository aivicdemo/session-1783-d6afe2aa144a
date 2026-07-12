import { calculateAlgorithmImprovementComparison } from "../../src/logic/it-1-1-1";

describe("アルゴリズム改善効果の定量比較機能", () => {
  // SCEN-447: [edge] 調理時間短縮度が0分の場合でも正常に集計される
  test("調理時間短縮度が0分の複数データを正常に集計し、合計値・件数・平均値が正確に計算される", () => {
    const testData = [
      {
        algorithmVersionId: "v1.0",
        mealPlanId: "plan001",
        cookingTimeReductionMinutes: 0,
        satisfactionScore: 4.5,
        completionRate: 0.95,
        rejectionRate: 0.05,
      },
      {
        algorithmVersionId: "v1.0",
        mealPlanId: "plan002",
        cookingTimeReductionMinutes: 0,
        satisfactionScore: 4.2,
        completionRate: 0.92,
        rejectionRate: 0.08,
      },
      {
        algorithmVersionId: "v1.0",
        mealPlanId: "plan003",
        cookingTimeReductionMinutes: 0,
        satisfactionScore: 4.8,
        completionRate: 0.98,
        rejectionRate: 0.02,
      },
    ];

    const result = calculateAlgorithmImprovementComparison(testData);

    // 合計値が0分であることを確認
    expect(result.totalCookingTimeReductionMinutes).toBe(0);

    // 件数が入力したデータ件数（3件）と一致していることを確認
    expect(result.dataCount).toBe(3);

    // 平均値が0分で正常に計算されていることを確認
    expect(result.averageCookingTimeReductionMinutes).toBe(0);

    // 異常値（null、undefined、NaN）が含まれていないことを確認
    expect(result.totalCookingTimeReductionMinutes).not.toBeNull();
    expect(result.totalCookingTimeReductionMinutes).not.toBeUndefined();
    expect(Number.isNaN(result.totalCookingTimeReductionMinutes)).toBe(false);

    expect(result.averageCookingTimeReductionMinutes).not.toBeNull();
    expect(result.averageCookingTimeReductionMinutes).not.toBeUndefined();
    expect(Number.isNaN(result.averageCookingTimeReductionMinutes)).toBe(false);

    expect(result.dataCount).not.toBeNull();
    expect(result.dataCount).not.toBeUndefined();

    // 平均満足度スコアが正常に計算されていることを確認
    expect(result.averageSatisfactionScore).toBe(4.5);

    // 平均完食度が正常に計算されていることを確認
    expect(result.averageCompletionRate).toBe(0.95);

    // 平均却下率が正常に計算されていることを確認
    expect(result.averageRejectionRate).toBe(0.05);

    // エラーフラグが存在しないことを確認
    expect(result.hasError).toBe(false);
  });
});