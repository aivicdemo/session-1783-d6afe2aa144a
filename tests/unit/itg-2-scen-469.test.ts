import { calculateNutritionGap } from "../../src/logic/it-1-br-2-1-1-1";

describe("栄養基準ロジック評価機能 - 改善ギャップ計算", () => {
  test("SCEN-469: 改善ギャップが正の値で正しく計算される", () => {
    // テスト対象: 栄養基準値より現在値が低い複数の栄養項目について改善ギャップを計算
    // 入力パターン1: タンパク質（g）
    const proteinInput = {
      nutritionItemId: "nutrition_001",
      nutritionItemName: "タンパク質",
      targetValue: 60,
      currentValue: 45,
      unit: "g",
      precision: 1,
    };

    const proteinResult = calculateNutritionGap(proteinInput);

    // 改善ギャップ = 目標値 - 現在値 = 60 - 45 = 15
    expect(proteinResult.gap).toBe(15);
    expect(proteinResult.gapPercentage).toBe(25); // (15 / 60) * 100 = 25%
    expect(proteinResult.isPositive).toBe(true);

    // 入力パターン2: 食物繊維（g）
    const fiberInput = {
      nutritionItemId: "nutrition_002",
      nutritionItemName: "食物繊維",
      targetValue: 25,
      currentValue: 18.5,
      unit: "g",
      precision: 1,
    };

    const fiberResult = calculateNutritionGap(fiberInput);

    // 改善ギャップ = 25 - 18.5 = 6.5
    expect(fiberResult.gap).toBe(6.5);
    expect(fiberResult.gapPercentage).toBe(26); // (6.5 / 25) * 100 = 26%
    expect(fiberResult.isPositive).toBe(true);

    // 入力パターン3: カルシウム（mg）
    const calciumInput = {
      nutritionItemId: "nutrition_003",
      nutritionItemName: "カルシウム",
      targetValue: 800,
      currentValue: 520,
      unit: "mg",
      precision: 0,
    };

    const calciumResult = calculateNutritionGap(calciumInput);

    // 改善ギャップ = 800 - 520 = 280
    expect(calciumResult.gap).toBe(280);
    expect(calciumResult.gapPercentage).toBe(35); // (280 / 800) * 100 = 35%
    expect(calciumResult.isPositive).toBe(true);

    // 入力パターン4: 鉄分（mg）- 小数点精度検証
    const ironInput = {
      nutritionItemId: "nutrition_004",
      nutritionItemName: "鉄分",
      targetValue: 10.5,
      currentValue: 7.8,
      unit: "mg",
      precision: 2,
    };

    const ironResult = calculateNutritionGap(ironInput);

    // 改善ギャップ = 10.5 - 7.8 = 2.7 → 小数点第2位で四捨五入 = 2.7
    expect(ironResult.gap).toBe(2.7);
    expect(ironResult.gapPercentage).toBeCloseTo(25.71, 1); // (2.7 / 10.5) * 100 ≒ 25.71%
    expect(ironResult.isPositive).toBe(true);

    // 入力パターン5: ビタミンA（μgRE）- 大きな数値での精度検証
    const vitaminAInput = {
      nutritionItemId: "nutrition_005",
      nutritionItemName: "ビタミンA",
      targetValue: 900,
      currentValue: 450,
      unit: "μgRE",
      precision: 0,
    };

    const vitaminAResult = calculateNutritionGap(vitaminAInput);

    // 改善ギャップ = 900 - 450 = 450
    expect(vitaminAResult.gap).toBe(450);
    expect(vitaminAResult.gapPercentage).toBe(50); // (450 / 900) * 100 = 50%
    expect(vitaminAResult.isPositive).toBe(true);

    // 境界値テスト: 現在値 = 目標値の場合、改善ギャップ = 0（ゼロは正ではない）
    const boundaryZeroInput = {
      nutritionItemId: "nutrition_006",
      nutritionItemName: "ビタミンD",
      targetValue: 15,
      currentValue: 15,
      unit: "μg",
      precision: 1,
    };

    const boundaryZeroResult = calculateNutritionGap(boundaryZeroInput);

    // 改善ギャップ = 15 - 15 = 0
    expect(boundaryZeroResult.gap).toBe(0);
    expect(boundaryZeroResult.gapPercentage).toBe(0);
    expect(boundaryZeroResult.isPositive).toBe(false); // ゼロは正ではない

    // エラーテスト: 現在値が目標値より高い場合、エラーをスロー
    const excessInput = {
      nutritionItemId: "nutrition_007",
      nutritionItemName: "ナトリウム",
      targetValue: 2000,
      currentValue: 2500,
      unit: "mg",
      precision: 0,
    };

    expect(() => calculateNutritionGap(excessInput)).toThrow(/目標値/);

    // エラーテスト: 無効な入力（負の値）
    const negativeInput = {
      nutritionItemId: "nutrition_008",
      nutritionItemName: "亜鉛",
      targetValue: -10,
      currentValue: 5,
      unit: "mg",
      precision: 1,
    };

    expect(() => calculateNutritionGap(negativeInput)).toThrow(/栄養値/);
  });
});