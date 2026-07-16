import { verifyNutritionBaselineImprovement } from "../../src/logic/it-8-1-1-1";

describe("栄養基準設定の改善効果検証", () => {
  test("SCEN-224: 栄養基準デプロイ後も実食事記録が基準値から乖離したまま改善効果が検出されない", () => {
    const baseline_before_deployment = {
      protein_min: 50,
      protein_max: 100,
      carbs_min: 200,
      carbs_max: 400,
      fat_min: 40,
      fat_max: 80,
      fiber_min: 20,
      fiber_max: 40,
    };

    const baseline_after_deployment = {
      protein_min: 55,
      protein_max: 105,
      carbs_min: 210,
      carbs_max: 410,
      fat_min: 45,
      fat_max: 85,
      fiber_min: 22,
      fiber_max: 42,
    };

    const actual_intake_records = [
      {
        date: "2024-01-15",
        protein: 40,
        carbs: 180,
        fat: 35,
        fiber: 15,
      },
      {
        date: "2024-01-16",
        protein: 42,
        carbs: 185,
        fat: 36,
        fiber: 14,
      },
      {
        date: "2024-01-17",
        protein: 41,
        carbs: 182,
        fat: 34,
        fiber: 16,
      },
    ];

    const improvement_threshold = 0.15;

    const result = verifyNutritionBaselineImprovement({
      baseline_before_deployment,
      baseline_after_deployment,
      actual_intake_records,
      improvement_threshold,
    });

    expect(result.improvement_detected).toBe(false);
    expect(result.average_deviation_before).toBeLessThan(-15);
    expect(result.average_deviation_after).toBeLessThan(-15);
    expect(result.improvement_rate).toBeLessThan(0.15);
    expect(result.error_message).toMatch(/改善効果/);
    expect(result.alert_issued).toBe(true);
    expect(result.log_entry).toBeDefined();
    expect(result.log_entry.severity).toBe("error");
    expect(result.log_entry.timestamp).toBeDefined();
  });

  test("SCEN-224: 栄養基準デプロイ後、実食事記録が基準値内に改善された場合の成功パターン", () => {
    const baseline_before_deployment = {
      protein_min: 50,
      protein_max: 100,
      carbs_min: 200,
      carbs_max: 400,
      fat_min: 40,
      fat_max: 80,
      fiber_min: 20,
      fiber_max: 40,
    };

    const baseline_after_deployment = {
      protein_min: 45,
      protein_max: 95,
      carbs_min: 180,
      carbs_max: 380,
      fat_min: 35,
      fat_max: 75,
      fiber_min: 18,
      fiber_max: 38,
    };

    const actual_intake_records = [
      {
        date: "2024-01-15",
        protein: 52,
        carbs: 220,
        fat: 45,
        fiber: 22,
      },
      {
        date: "2024-01-16",
        protein: 54,
        carbs: 225,
        fat: 46,
        fiber: 23,
      },
      {
        date: "2024-01-17",
        protein: 51,
        carbs: 218,
        fat: 44,
        fiber: 21,
      },
    ];

    const improvement_threshold = 0.15;

    const result = verifyNutritionBaselineImprovement({
      baseline_before_deployment,
      baseline_after_deployment,
      actual_intake_records,
      improvement_threshold,
    });

    expect(result.improvement_detected).toBe(true);
    expect(result.improvement_rate).toBeGreaterThanOrEqual(0.15);
    expect(result.alert_issued).toBe(false);
    expect(result.error_message).toBeNull();
  });

  test("SCEN-224: 実食事記録データが空の場合のエラーハンドリング", () => {
    const baseline_before_deployment = {
      protein_min: 50,
      protein_max: 100,
      carbs_min: 200,
      carbs_max: 400,
      fat_min: 40,
      fat_max: 80,
      fiber_min: 20,
      fiber_max: 40,
    };

    const baseline_after_deployment = {
      protein_min: 55,
      protein_max: 105,
      carbs_min: 210,
      carbs_max: 410,
      fat_min: 45,
      fat_max: 85,
      fiber_min: 22,
      fiber_max: 42,
    };

    const actual_intake_records: Array<{
      date: string;
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
    }> = [];

    const improvement_threshold = 0.15;

    expect(() =>
      verifyNutritionBaselineImprovement({
        baseline_before_deployment,
        baseline_after_deployment,
        actual_intake_records,
        improvement_threshold,
      })
    ).toThrow(/食事記録/);
  });

  test("SCEN-224: 改善度閾値が0の境界値ケース", () => {
    const baseline_before_deployment = {
      protein_min: 50,
      protein_max: 100,
      carbs_min: 200,
      carbs_max: 400,
      fat_min: 40,
      fat_max: 80,
      fiber_min: 20,
      fiber_max: 40,
    };

    const baseline_after_deployment = {
      protein_min: 50,
      protein_max: 100,
      carbs_min: 200,
      carbs_max: 400,
      fat_min: 40,
      fat_max: 80,
      fiber_min: 20,
      fiber_max: 40,
    };

    const actual_intake_records = [
      {
        date: "2024-01-15",
        protein: 75,
        carbs: 300,
        fat: 60,
        fiber: 30,
      },
    ];

    const improvement_threshold = 0;

    const result = verifyNutritionBaselineImprovement({
      baseline_before_deployment,
      baseline_after_deployment,
      actual_intake_records,
      improvement_threshold,
    });

    expect(result.improvement_detected).toBe(true);
    expect(result.improvement_rate).toBeGreaterThanOrEqual(0);
  });

  test("SCEN-224: 負の改善度（悪化）が検出される場合", () => {
    const baseline_before_deployment = {
      protein_min: 50,
      protein_max: 100,
      carbs_min: 200,
      carbs_max: 400,
      fat_min: 40,
      fat_max: 80,
      fiber_min: 20,
      fiber_max: 40,
    };

    const baseline_after_deployment = {
      protein_min: 60,
      protein_max: 110,
      carbs_min: 240,
      carbs_max: 440,
      fat_min: 50,
      fat_max: 90,
      fiber_min: 25,
      fiber_max: 45,
    };

    const actual_intake_records = [
      {
        date: "2024-01-15",
        protein: 30,
        carbs: 150,
        fat: 25,
        fiber: 10,
      },
      {
        date: "2024-01-16",
        protein: 32,
        carbs: 155,
        fat: 26,
        fiber: 11,
      },
    ];

    const improvement_threshold = 0.15;

    const result = verifyNutritionBaselineImprovement({
      baseline_before_deployment,
      baseline_after_deployment,
      actual_intake_records,
      improvement_threshold,
    });

    expect(result.improvement_detected).toBe(false);
    expect(result.improvement_rate).toBeLessThan(0);
    expect(result.alert_issued).toBe(true);
    expect(result.log_entry.severity).toBe("error");
  });

  test("SCEN-224: 複数栄養素の乖離度計算精度検証", () => {
    const baseline_before_deployment = {
      protein_min: 50,
      protein_max: 100,
      carbs_min: 200,
      carbs_max: 400,
      fat_min: 40,
      fat_max: 80,
      fiber_min: 20,
      fiber_max: 40,
    };

    const baseline_after_deployment = {
      protein_min: 50,
      protein_max: 100,
      carbs_min: 200,
      carbs_max: 400,
      fat_min: 40,
      fat_max: 80,
      fiber_min: 20,
      fiber_max: 40,
    };

    const actual_intake_records = [
      {
        date: "2024-01-15",
        protein: 45,
        carbs: 250,
        fat: 55,
        fiber: 25,
      },
    ];

    const improvement_threshold = 0.1;

    const result = verifyNutritionBaselineImprovement({
      baseline_before_deployment,
      baseline_after_deployment,
      actual_intake_records,
      improvement_threshold,
    });

    expect(result.nutrient_wise_deviations).toBeDefined();
    expect(result.nutrient_wise_deviations.protein).toBeLessThan(0);
    expect(result.nutrient_wise_deviations.carbs).toBeGreaterThan(0);
    expect(result.nutrient_wise_deviations.fat).toBeGreaterThan(0);
    expect(result.nutrient_wise_deviations.fiber).toBeGreaterThan(0);
  });
});