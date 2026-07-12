import { calculateConstraintSatisfactionScore } from "../../src/logic/it-1-br-1783670064270-1-1-1";

describe("複数制約条件の充足度判定 - 不正な形式検出とエラーハンドリング", () => {
  test("SCEN-349: 不正な形式のJSON制約条件でエラーが返される", () => {
    // ===== ハッピーパス: 正常な制約条件でスコア計算成功 =====
    const valid_constraints = {
      nutrition: {
        protein_g: 50,
        carbs_g: 250,
        fat_g: 60,
        fiber_g: 25,
      },
      allergy: ["peanut", "shellfish"],
      budget_jpy: 2500,
      cooking_time_minutes: 45,
    };

    const valid_result = calculateConstraintSatisfactionScore(valid_constraints);
    expect(valid_result).toHaveProperty("success", true);
    expect(valid_result).toHaveProperty("total_score");
    expect(typeof valid_result.total_score).toBe("number");
    expect(valid_result.total_score).toBeGreaterThanOrEqual(0);
    expect(valid_result.total_score).toBeLessThanOrEqual(100);

    // ===== エラーケース1: JSON形式が不正（閉じ括弧不足） =====
    const invalid_json_missing_brace = `{
      "nutrition": {
        "protein_g": 50,
        "carbs_g": 250,
        "fat_g": 60
      }
    `; // 末尾の } が不足

    expect(() => {
      calculateConstraintSatisfactionScore(JSON.parse(invalid_json_missing_brace));
    }).toThrow(/JSON形式/);

    // ===== エラーケース2: 必須キーが不正（nutrition.protein_g が存在しない） =====
    const invalid_missing_key = {
      nutrition: {
        carbs_g: 250,
        fat_g: 60,
        fiber_g: 25,
        // protein_g キーが欠落
      },
      allergy: ["peanut"],
      budget_jpy: 2500,
      cooking_time_minutes: 45,
    };

    expect(() => {
      calculateConstraintSatisfactionScore(invalid_missing_key);
    }).toThrow(/必須項目/);

    // ===== エラーケース3: 数値が不正な型（budget_jpy が文字列） =====
    const invalid_type = {
      nutrition: {
        protein_g: 50,
        carbs_g: 250,
        fat_g: 60,
        fiber_g: 25,
      },
      allergy: ["peanut"],
      budget_jpy: "2500円", // 文字列型（数値であるべき）
      cooking_time_minutes: 45,
    };

    expect(() => {
      calculateConstraintSatisfactionScore(invalid_type);
    }).toThrow(/型が不正/);

    // ===== エラーケース4: 配列要素が不正（allergy が文字列の代わりに数値を含む） =====
    const invalid_array_element = {
      nutrition: {
        protein_g: 50,
        carbs_g: 250,
        fat_g: 60,
        fiber_g: 25,
      },
      allergy: ["peanut", 123], // 数値が混在
      budget_jpy: 2500,
      cooking_time_minutes: 45,
    };

    expect(() => {
      calculateConstraintSatisfactionScore(invalid_array_element);
    }).toThrow(/アレルギー/);

    // ===== エラーケース5: 論理的に矛盾した値（budget_jpy が負数） =====
    const invalid_negative_value = {
      nutrition: {
        protein_g: 50,
        carbs_g: 250,
        fat_g: 60,
        fiber_g: 25,
      },
      allergy: ["peanut"],
      budget_jpy: -2500, // 負数は不正
      cooking_time_minutes: 45,
    };

    expect(() => {
      calculateConstraintSatisfactionScore(invalid_negative_value);
    }).toThrow(/予算/);

    // ===== エラーケース6: 制約条件がnull/undefined =====
    expect(() => {
      calculateConstraintSatisfactionScore(null as any);
    }).toThrow(/制約条件/);

    expect(() => {
      calculateConstraintSatisfactionScore(undefined as any);
    }).toThrow(/制約条件/);

    // ===== エラーケース7: 制約条件が空オブジェクト =====
    expect(() => {
      calculateConstraintSatisfactionScore({});
    }).toThrow(/必須項目/);

    // ===== 成功ケース: 境界値を含む正常な制約条件 =====
    const boundary_value_constraints = {
      nutrition: {
        protein_g: 0, // 最小値
        carbs_g: 500, // 高めの値
        fat_g: 0,
        fiber_g: 60, // 高い値
      },
      allergy: [], // 空配列（アレルギーなし）
      budget_jpy: 0, // 最小値
      cooking_time_minutes: 180, // 3時間
    };

    const boundary_result = calculateConstraintSatisfactionScore(
      boundary_value_constraints
    );
    expect(boundary_result).toHaveProperty("success", true);
    expect(boundary_result.total_score).toBeGreaterThanOrEqual(0);
    expect(boundary_result.total_score).toBeLessThanOrEqual(100);

    // ===== 成功ケース: 複数アレルギー、複雑な栄養条件 =====
    const complex_constraints = {
      nutrition: {
        protein_g: 75,
        carbs_g: 300,
        fat_g: 80,
        fiber_g: 35,
      },
      allergy: ["peanut", "shellfish", "egg", "milk"],
      budget_jpy: 3500,
      cooking_time_minutes: 60,
    };

    const complex_result = calculateConstraintSatisfactionScore(
      complex_constraints
    );
    expect(complex_result).toHaveProperty("success", true);
    expect(complex_result.total_score).toBeGreaterThanOrEqual(0);
    expect(complex_result.total_score).toBeLessThanOrEqual(100);
    expect(complex_result).toHaveProperty("constraint_scores");
    expect(typeof complex_result.constraint_scores).toBe("object");
  });
});