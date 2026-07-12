import { judgeAlgorithmImprovement } from '../../src/logic/it-3';

describe('食事評価データを献立生成ロジックに反映させる機能', () => {
  // SCEN-435
  test('必要な定量指標データが不足している場合、エラーを返して改善度判定を中止する', () => {
    // 定量指標データから必須項目を欠落させるケース1: ユーザー満足度が未設定
    const insufficientData1 = {
      satisfactionScore: undefined,
      generationTime: 28.5,
      nutritionBalanceScore: 87.3,
      cookingTimeReductionDegree: 0.92,
      completionRate: 0.88,
      rejectionRate: 0.12,
      previousPeriodSatisfactionScore: 75.2,
      previousPeriodGenerationTime: 32.1,
      previousPeriodNutritionBalanceScore: 82.5,
      previousPeriodCookingTimeReductionDegree: 0.85,
      previousPeriodCompletionRate: 0.82,
      previousPeriodRejectionRate: 0.18,
    };

    expect(() => judgeAlgorithmImprovement(insufficientData1)).toThrow(
      /満足度/
    );

    // 定量指標データから必須項目を欠落させるケース2: 生成時間が未設定
    const insufficientData2 = {
      satisfactionScore: 82.4,
      generationTime: undefined,
      nutritionBalanceScore: 87.3,
      cookingTimeReductionDegree: 0.92,
      completionRate: 0.88,
      rejectionRate: 0.12,
      previousPeriodSatisfactionScore: 75.2,
      previousPeriodGenerationTime: 32.1,
      previousPeriodNutritionBalanceScore: 82.5,
      previousPeriodCookingTimeReductionDegree: 0.85,
      previousPeriodCompletionRate: 0.82,
      previousPeriodRejectionRate: 0.18,
    };

    expect(() => judgeAlgorithmImprovement(insufficientData2)).toThrow(
      /生成時間/
    );

    // 定量指標データから必須項目を欠落させるケース3: 栄養バランススコアが未設定
    const insufficientData3 = {
      satisfactionScore: 82.4,
      generationTime: 28.5,
      nutritionBalanceScore: undefined,
      cookingTimeReductionDegree: 0.92,
      completionRate: 0.88,
      rejectionRate: 0.12,
      previousPeriodSatisfactionScore: 75.2,
      previousPeriodGenerationTime: 32.1,
      previousPeriodNutritionBalanceScore: 82.5,
      previousPeriodCookingTimeReductionDegree: 0.85,
      previousPeriodCompletionRate: 0.82,
      previousPeriodRejectionRate: 0.18,
    };

    expect(() => judgeAlgorithmImprovement(insufficientData3)).toThrow(
      /栄養/
    );

    // 定量指標データから前期の必須項目を欠落させるケース4: 前期ユーザー満足度が未設定
    const insufficientData4 = {
      satisfactionScore: 82.4,
      generationTime: 28.5,
      nutritionBalanceScore: 87.3,
      cookingTimeReductionDegree: 0.92,
      completionRate: 0.88,
      rejectionRate: 0.12,
      previousPeriodSatisfactionScore: undefined,
      previousPeriodGenerationTime: 32.1,
      previousPeriodNutritionBalanceScore: 82.5,
      previousPeriodCookingTimeReductionDegree: 0.85,
      previousPeriodCompletionRate: 0.82,
      previousPeriodRejectionRate: 0.18,
    };

    expect(() => judgeAlgorithmImprovement(insufficientData4)).toThrow(
      /前期/
    );

    // 有効なデータセット: すべての必須項目が揃っている場合、正常に処理される
    const validData = {
      satisfactionScore: 82.4,
      generationTime: 28.5,
      nutritionBalanceScore: 87.3,
      cookingTimeReductionDegree: 0.92,
      completionRate: 0.88,
      rejectionRate: 0.12,
      previousPeriodSatisfactionScore: 75.2,
      previousPeriodGenerationTime: 32.1,
      previousPeriodNutritionBalanceScore: 82.5,
      previousPeriodCookingTimeReductionDegree: 0.85,
      previousPeriodCompletionRate: 0.82,
      previousPeriodRejectionRate: 0.18,
    };

    const result = judgeAlgorithmImprovement(validData);

    // 満足度改善度: (82.4 - 75.2) / 75.2 * 100 ≈ 9.55%
    const expectedSatisfactionImprovementDegree = 9.55;
    expect(result.satisfactionImprovementDegree).toBeCloseTo(
      expectedSatisfactionImprovementDegree,
      1
    );

    // 生成時間短縮度: (32.1 - 28.5) / 32.1 * 100 ≈ 11.21%
    const expectedGenerationTimeReductionDegree = 11.21;
    expect(result.generationTimeReductionDegree).toBeCloseTo(
      expectedGenerationTimeReductionDegree,
      1
    );

    // 栄養バランス改善度: (87.3 - 82.5) / 82.5 * 100 ≈ 5.82%
    const expectedNutritionBalanceImprovementDegree = 5.82;
    expect(result.nutritionBalanceImprovementDegree).toBeCloseTo(
      expectedNutritionBalanceImprovementDegree,
      1
    );

    // 調理時間短縮度改善度: (0.92 - 0.85) / 0.85 * 100 ≈ 8.24%
    const expectedCookingTimeReductionImprovementDegree = 8.24;
    expect(result.cookingTimeReductionImprovementDegree).toBeCloseTo(
      expectedCookingTimeReductionImprovementDegree,
      1
    );

    // 完食度改善度: (0.88 - 0.82) / 0.82 * 100 ≈ 7.32%
    const expectedCompletionRateImprovementDegree = 7.32;
    expect(result.completionRateImprovementDegree).toBeCloseTo(
      expectedCompletionRateImprovementDegree,
      1
    );

    // 却下率改善度: (0.18 - 0.12) / 0.18 * 100 ≈ 33.33%
    const expectedRejectionRateImprovementDegree = 33.33;
    expect(result.rejectionRateImprovementDegree).toBeCloseTo(
      expectedRejectionRateImprovementDegree,
      1
    );

    // 総合改善度: (9.55 + 11.21 + 5.82 + 8.24 + 7.32 + 33.33) / 6 ≈ 12.58%
    const expectedOverallImprovementDegree = 12.58;
    expect(result.overallImprovementDegree).toBeCloseTo(
      expectedOverallImprovementDegree,
      1
    );

    // 改善判定: 総合改善度が5%以上で改善成功と判定
    expect(result.isImproved).toBe(true);

    // エラーが発生していないことを確認
    expect(result.errorCode).toBeUndefined();
    expect(result.errorMessage).toBeUndefined();
  });
});