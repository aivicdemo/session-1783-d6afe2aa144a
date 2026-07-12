import { classifyMealRejectReasons } from "../../src/logic/it-1-br-4-2-1";

describe("献立却下・修正理由のカテゴリ分類と異常値検出", () => {
  // SCEN-628
  test("異常値・重複・不完全データが検出され、適切なフラグが付けられてカテゴリ分類される", () => {
    const testReasons = [
      {
        id: "reason_001",
        mealId: "meal_001",
        userId: "user_001",
        reason: "栄養バランスが悪い",
        timestamp: "2024-01-15T10:00:00Z",
      },
      {
        id: "reason_002",
        mealId: "meal_001",
        userId: "user_001",
        reason: "",
        timestamp: "2024-01-15T10:05:00Z",
      },
      {
        id: "reason_003",
        mealId: "meal_001",
        userId: "user_001",
        reason: null,
        timestamp: "2024-01-15T10:10:00Z",
      },
      {
        id: "reason_004",
        mealId: "meal_001",
        userId: "user_001",
        reason: undefined,
        timestamp: "2024-01-15T10:15:00Z",
      },
      {
        id: "reason_005",
        mealId: "meal_001",
        userId: "user_001",
        reason: "栄養バランスが悪い",
        timestamp: "2024-01-15T10:20:00Z",
      },
      {
        id: "reason_006",
        mealId: "meal_001",
        userId: "user_001",
        reason: "調理時間が長すぎる",
        timestamp: "2024-01-15T10:25:00Z",
      },
      {
        id: "reason_007",
        mealId: "meal_001",
        userId: "user_001",
        reason: "調理時間が長すぎる",
        timestamp: "2024-01-15T10:30:00Z",
      },
      {
        id: "reason_008",
        mealId: "meal_001",
        userId: "user_001",
        reason: "食材制限に未対応",
        timestamp: undefined,
      },
      {
        id: "reason_009",
        mealId: "meal_001",
        userId: "user_001",
        reason: "家族の好みに合わない",
        timestamp: "2024-01-15T10:35:00Z",
      },
    ];

    const result = classifyMealRejectReasons(testReasons);

    expect(result).toBeDefined();
    expect(Array.isArray(result.classified_reasons)).toBe(true);
    expect(result.classified_reasons.length).toBeGreaterThan(0);

    const anomalyDetected = result.classified_reasons.filter(
      (item: any) => item.has_anomaly === true
    );
    expect(anomalyDetected.length).toBe(3);
    expect(anomalyDetected[0].reason_id).toBe("reason_002");
    expect(anomalyDetected[0].anomaly_type).toBe("empty_value");
    expect(anomalyDetected[1].reason_id).toBe("reason_003");
    expect(anomalyDetected[1].anomaly_type).toBe("null_value");
    expect(anomalyDetected[2].reason_id).toBe("reason_004");
    expect(anomalyDetected[2].anomaly_type).toBe("undefined_value");

    const duplicateDetected = result.classified_reasons.filter(
      (item: any) => item.is_duplicate === true
    );
    expect(duplicateDetected.length).toBe(2);
    const duplicateReasons = duplicateDetected.map((item: any) => item.reason);
    expect(duplicateReasons).toContain("栄養バランスが悪い");
    expect(duplicateReasons).toContain("調理時間が長すぎる");

    const incompleteDetected = result.classified_reasons.filter(
      (item: any) => item.is_incomplete === true
    );
    expect(incompleteDetected.length).toBe(1);
    expect(incompleteDetected[0].reason_id).toBe("reason_008");
    expect(incompleteDetected[0].missing_field).toBe("timestamp");

    const validClassified = result.classified_reasons.filter(
      (item: any) =>
        item.has_anomaly !== true &&
        item.is_duplicate !== true &&
        item.is_incomplete !== true
    );
    expect(validClassified.length).toBe(4);

    const nutritionCategory = validClassified.find(
      (item: any) => item.category === "nutrition_imbalance"
    );
    expect(nutritionCategory).toBeDefined();
    expect(nutritionCategory.reason_id).toBe("reason_001");

    const cookingTimeCategory = validClassified.find(
      (item: any) => item.category === "cooking_time_exceeded"
    );
    expect(cookingTimeCategory).toBeDefined();
    expect(cookingTimeCategory.reason_id).toBe("reason_006");

    const dietaryRestrictionCategory = validClassified.find(
      (item: any) => item.category === "dietary_restriction_unmet"
    );
    expect(dietaryRestrictionCategory).toBeDefined();

    const preferenceCategory = validClassified.find(
      (item: any) => item.category === "preference_mismatch"
    );
    expect(preferenceCategory).toBeDefined();
    expect(preferenceCategory.reason_id).toBe("reason_009");

    expect(result.summary).toBeDefined();
    expect(result.summary.total_input_count).toBe(9);
    expect(result.summary.valid_count).toBe(4);
    expect(result.summary.anomaly_count).toBe(3);
    expect(result.summary.duplicate_count).toBe(2);
    expect(result.summary.incomplete_count).toBe(1);
    expect(result.summary.anomaly_count + result.summary.duplicate_count + result.summary.incomplete_count).toBeLessThanOrEqual(9);
  });
});