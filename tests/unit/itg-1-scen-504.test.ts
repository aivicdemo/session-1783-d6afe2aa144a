import { prioritizeNutrientDeficiencyItems } from "../../src/logic/it-3";

describe("食事評価データを献立生成ロジックに反映させる機能", () => {
  // SCEN-504: [error] 栄養不足項目の優先度付けと献立生成条件調整 - 家族の嗜好リスク係数が無効値の場合、優先度付けがエラーとなる
  test("嗜好リスク係数が無効値の場合、優先度付け処理がエラーとなること", () => {
    const nutrientDeficiencies = [
      {
        nutrientId: "protein",
        deficiencyAmount: 10,
        improvementEffectScore: 85,
      },
      {
        nutrientId: "calcium",
        deficiencyAmount: 5,
        improvementEffectScore: 70,
      },
    ];

    const familyMemberPreferences = [
      {
        familyMemberId: "member-001",
        preferenceScore: 0.8,
      },
      {
        familyMemberId: "member-002",
        preferenceScore: 0.6,
      },
    ];

    // Test 1: 嗜好リスク係数が null の場合
    expect(() =>
      prioritizeNutrientDeficiencyItems(
        nutrientDeficiencies,
        familyMemberPreferences,
        null
      )
    ).toThrow(/嗜好リスク係数/);

    // Test 2: 嗜好リスク係数が undefined の場合
    expect(() =>
      prioritizeNutrientDeficiencyItems(
        nutrientDeficiencies,
        familyMemberPreferences,
        undefined
      )
    ).toThrow(/嗜好リスク係数/);

    // Test 3: 嗜好リスク係数が負の数の場合
    expect(() =>
      prioritizeNutrientDeficiencyItems(
        nutrientDeficiencies,
        familyMemberPreferences,
        -0.5
      )
    ).toThrow(/嗜好リスク係数/);

    // Test 4: 嗜好リスク係数が範囲外（1.0を超える）の場合
    expect(() =>
      prioritizeNutrientDeficiencyItems(
        nutrientDeficiencies,
        familyMemberPreferences,
        1.5
      )
    ).toThrow(/嗜好リスク係数/);

    // Test 5: 嗜好リスク係数が有効値（0.5）の場合、正常に実行される
    const validResult = prioritizeNutrientDeficiencyItems(
      nutrientDeficiencies,
      familyMemberPreferences,
      0.5
    );

    expect(validResult).toBeDefined();
    expect(Array.isArray(validResult)).toBe(true);
    expect(validResult.length).toBeGreaterThan(0);
    expect(validResult[0]).toHaveProperty("nutrientId");
    expect(validResult[0]).toHaveProperty("priorityScore");

    // Test 6: 嗜好リスク係数が有効値（0.0）の場合、正常に実行される
    const edgeCaseResult = prioritizeNutrientDeficiencyItems(
      nutrientDeficiencies,
      familyMemberPreferences,
      0.0
    );

    expect(edgeCaseResult).toBeDefined();
    expect(Array.isArray(edgeCaseResult)).toBe(true);

    // Test 7: 嗜好リスク係数が有効値（1.0）の場合、正常に実行される
    const maxValidResult = prioritizeNutrientDeficiencyItems(
      nutrientDeficiencies,
      familyMemberPreferences,
      1.0
    );

    expect(maxValidResult).toBeDefined();
    expect(Array.isArray(maxValidResult)).toBe(true);
  });
});