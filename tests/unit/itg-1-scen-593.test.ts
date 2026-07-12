import { validateNutritionCriteriaAndEvaluate } from "../../src/logic/it-3";

describe("食事評価データを献立生成ロジックに反映させる機能", () => {
  test("SCEN-593: 栄養基準ロジック評価検証機能 - 検証基準が矛盾または不合理な値を含む場合、評価処理がエラーで中断される", () => {
    // ハッピーパス: 正常な栄養基準値で評価が成功する
    const validCriteria = {
      nutritionItemId: 1,
      itemName: "タンパク質",
      minValue: 50,
      maxValue: 100,
      unit: "g",
      targetValue: 75,
    };

    const validFamilyData = {
      familyId: 1,
      age: 35,
      gender: "male",
      activityLevel: 1.5,
    };

    const validEvaluationResult = validateNutritionCriteriaAndEvaluate(
      validCriteria,
      validFamilyData
    );

    expect(validEvaluationResult.isValid).toBe(true);
    expect(validEvaluationResult.achievementRate).toBe(100);
    expect(validEvaluationResult.errorMessage).toBeNull();

    // エラーテスト1: 最小値 > 最大値（矛盾した栄養基準）
    const contradictoryCriteria = {
      nutritionItemId: 2,
      itemName: "脂質",
      minValue: 150,
      maxValue: 80,
      unit: "g",
      targetValue: 100,
    };

    expect(() =>
      validateNutritionCriteriaAndEvaluate(
        contradictoryCriteria,
        validFamilyData
      )
    ).toThrow(/最小値/);

    // エラーテスト2: 負の最小値（不合理な値）
    const negativeMinCriteria = {
      nutritionItemId: 3,
      itemName: "カルシウム",
      minValue: -50,
      maxValue: 100,
      unit: "mg",
      targetValue: 75,
    };

    expect(() =>
      validateNutritionCriteriaAndEvaluate(negativeMinCriteria, validFamilyData)
    ).toThrow(/負の値/);

    // エラーテスト3: 異常に大きい最大値（不合理な値）
    const abnormallyLargeCriteria = {
      nutritionItemId: 4,
      itemName: "ビタミンC",
      minValue: 50,
      maxValue: 100000,
      unit: "mg",
      targetValue: 75,
    };

    expect(() =>
      validateNutritionCriteriaAndEvaluate(
        abnormallyLargeCriteria,
        validFamilyData
      )
    ).toThrow(/基準値/);

    // エラーテスト4: ターゲット値が範囲外（矛盾した条件）
    const outOfRangeTargetCriteria = {
      nutritionItemId: 5,
      itemName: "鉄",
      minValue: 10,
      maxValue: 20,
      unit: "mg",
      targetValue: 50,
    };

    expect(() =>
      validateNutritionCriteriaAndEvaluate(
        outOfRangeTargetCriteria,
        validFamilyData
      )
    ).toThrow(/ターゲット値/);

    // エラーテスト5: 最小値と最大値が同一で、ターゲット値が異なる（矛盾）
    const conflictingEqualBoundsCriteria = {
      nutritionItemId: 6,
      itemName: "ナトリウム",
      minValue: 60,
      maxValue: 60,
      unit: "mg",
      targetValue: 80,
    };

    expect(() =>
      validateNutritionCriteriaAndEvaluate(
        conflictingEqualBoundsCriteria,
        validFamilyData
      )
    ).toThrow(/ターゲット値/);

    // 境界値テスト: 最小値 = 最大値 = ターゲット値（妥当な固定値）
    const validFixedValueCriteria = {
      nutritionItemId: 7,
      itemName: "亜鉛",
      minValue: 11,
      maxValue: 11,
      unit: "mg",
      targetValue: 11,
    };

    const boundaryResult = validateNutritionCriteriaAndEvaluate(
      validFixedValueCriteria,
      validFamilyData
    );

    expect(boundaryResult.isValid).toBe(true);
    expect(boundaryResult.achievementRate).toBe(100);

    // 境界値テスト: ターゲット値が最小値と同一
    const minBoundaryCriteria = {
      nutritionItemId: 8,
      itemName: "マグネシウム",
      minValue: 320,
      maxValue: 400,
      unit: "mg",
      targetValue: 320,
    };

    const minBoundaryResult = validateNutritionCriteriaAndEvaluate(
      minBoundaryCriteria,
      validFamilyData
    );

    expect(minBoundaryResult.isValid).toBe(true);
    expect(minBoundaryResult.achievementRate).toBe(100);

    // 境界値テスト: ターゲット値が最大値と同一
    const maxBoundaryCriteria = {
      nutritionItemId: 9,
      itemName: "リン",
      minValue: 800,
      maxValue: 1200,
      unit: "mg",
      targetValue: 1200,
    };

    const maxBoundaryResult = validateNutritionCriteriaAndEvaluate(
      maxBoundaryCriteria,
      validFamilyData
    );

    expect(maxBoundaryResult.isValid).toBe(true);
    expect(maxBoundaryResult.achievementRate).toBe(100);

    // 境界値テスト: ターゲット値が範囲中央（50%達成を想定）
    const midRangeCriteria = {
      nutritionItemId: 10,
      itemName: "食物繊維",
      minValue: 20,
      maxValue: 30,
      unit: "g",
      targetValue: 25,
    };

    const midRangeResult = validateNutritionCriteriaAndEvaluate(
      midRangeCriteria,
      validFamilyData
    );

    expect(midRangeResult.isValid).toBe(true);
    expect(midRangeResult.achievementRate).toBe(100);

    // エラーテスト6: unitが空文字列（不合理な値）
    const emptyUnitCriteria = {
      nutritionItemId: 11,
      itemName: "ビタミンA",
      minValue: 700,
      maxValue: 900,
      unit: "",
      targetValue: 800,
    };

    expect(() =>
      validateNutritionCriteriaAndEvaluate(emptyUnitCriteria, validFamilyData)
    ).toThrow(/単位/);

    // エラーテスト7: itemNameが空文字列（不合理な値）
    const emptyItemNameCriteria = {
      nutritionItemId: 12,
      itemName: "",
      minValue: 50,
      maxValue: 100,
      unit: "g",
      targetValue: 75,
    };

    expect(() =>
      validateNutritionCriteriaAndEvaluate(
        emptyItemNameCriteria,
        validFamilyData
      )
    ).toThrow(/項目名/);
  });
});