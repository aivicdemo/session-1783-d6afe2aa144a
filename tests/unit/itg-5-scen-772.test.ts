import { describe, test, expect, beforeEach, afterEach } from "@jest/globals";
import { verifyNutritionBalanceWithSlaCheck } from "../../src/logic/it-7-2-1";

describe("IT-7-2-1: Weekly Algorithm Improvement Dashboard - Nutrition Balance Verification SLA Check", () => {
  let startTime: number;
  const DEFAULT_SLA_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  beforeEach(() => {
    startTime = Date.now();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  // SCEN-772: SLA遅延検知・代替処理機能 - SLA以内の場合は通常フロー継続
  test("should execute normal nutrition balance verification flow when elapsed time is within SLA threshold", () => {
    const verificationStartTimestamp = new Date("2024-01-15T09:00:00Z").getTime();
    const verificationCheckTimestamp = new Date("2024-01-15T10:30:00Z").getTime();
    const elapsedTimeMs = verificationCheckTimestamp - verificationStartTimestamp;

    const nutritionData = {
      userId: "user_001",
      familyId: "family_001",
      verificationStartTimestamp: verificationStartTimestamp,
      verificationCheckTimestamp: verificationCheckTimestamp,
      targetCalories: 2000,
      actualCalories: 1950,
      targetProteinGrams: 50,
      actualProteinGrams: 48,
      targetCarbsGrams: 300,
      actualCarbsGrams: 295,
      targetFatGrams: 65,
      actualFatGrams: 63,
      slaTresholdMs: DEFAULT_SLA_THRESHOLD_MS,
    };

    const result = verifyNutritionBalanceWithSlaCheck(nutritionData);

    // SLA内であることを確認: 1.5時間 < 24時間
    expect(elapsedTimeMs).toBeLessThan(DEFAULT_SLA_THRESHOLD_MS);
    expect(elapsedTimeMs).toBe(5400000); // 1.5 hours in ms

    // 代替処理フラグが立っていないことを確認
    expect(result.isAlternativeProcessExecuted).toBe(false);

    // 通常フロー実行フラグが立っていることを確認
    expect(result.isNormalFlowExecuted).toBe(true);

    // 栄養バランス検証の標準処理結果が返されていることを確認
    expect(result.verificationStatus).toBe("completed");
    expect(result.verificationType).toBe("normal");

    // カロリー達成度: (1950 / 2000) * 100 = 97.5%
    expect(result.caloriesAchievementRate).toBe(97.5);

    // タンパク質達成度: (48 / 50) * 100 = 96%
    expect(result.proteinAchievementRate).toBe(96);

    // 炭水化物達成度: (295 / 300) * 100 = 98.33...
    expect(result.carbsAchievementRate).toBeCloseTo(98.33, 1);

    // 脂質達成度: (63 / 65) * 100 = 96.92...
    expect(result.fatAchievementRate).toBeCloseTo(96.92, 1);

    // 総合栄養バランススコア
    const expectedOverallScore =
      (97.5 + 96 + 98.33 + 96.92) / 4;
    expect(result.overallNutritionScore).toBeCloseTo(expectedOverallScore, 1);

    // 検証結果に異常フラグが立っていないことを確認
    expect(result.hasAnomalies).toBe(false);

    // 検証完了タイムスタンプが記録されていることを確認
    expect(result.verificationCompletedTimestamp).toBeDefined();
    expect(typeof result.verificationCompletedTimestamp).toBe("number");

    // 検証処理に要した時間が記録されていることを確認
    expect(result.processingTimeMs).toBeDefined();
    expect(result.processingTimeMs).toBeGreaterThan(0);

    // 代替処理の代わりに正常な検証結果が返されていることを確認
    expect(result.detailedNutrientBreakdown).toBeDefined();
    expect(result.detailedNutrientBreakdown.calories.target).toBe(2000);
    expect(result.detailedNutrientBreakdown.calories.actual).toBe(1950);
    expect(result.detailedNutrientBreakdown.protein.target).toBe(50);
    expect(result.detailedNutrientBreakdown.protein.actual).toBe(48);
    expect(result.detailedNutrientBreakdown.carbs.target).toBe(300);
    expect(result.detailedNutrientBreakdown.carbs.actual).toBe(295);
    expect(result.detailedNutrientBreakdown.fat.target).toBe(65);
    expect(result.detailedNutrientBreakdown.fat.actual).toBe(63);

    // 警告またはエラーが発生していないことを確認
    expect(result.warnings).toEqual([]);
    expect(result.errors).toEqual([]);
  });
});