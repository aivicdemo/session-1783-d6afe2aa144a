import { calculateMenuConstraintFulfillmentScores } from "../../src/logic/it-1-br-3-2-1";

describe("Multiple Constraint Fulfillment Evaluation", () => {
  // SCEN-327
  test("should calculate constraint fulfillment scores correctly when menu satisfies all constraints", () => {
    const menu_id = "menu_001";
    const nutrition_target = {
      protein_g: 50,
      carbs_g: 300,
      fat_g: 60,
    };
    const nutrition_actual = {
      protein_g: 50,
      carbs_g: 300,
      fat_g: 60,
    };
    const allergen_exclusions = ["egg", "dairy"];
    const allergen_actual = [];
    const budget_limit_yen = 800;
    const budget_actual_yen = 720;
    const cooking_time_limit_min = 30;
    const cooking_time_actual_min = 25;

    const result = calculateMenuConstraintFulfillmentScores({
      menu_id,
      nutrition_target,
      nutrition_actual,
      allergen_exclusions,
      allergen_actual,
      budget_limit_yen,
      budget_actual_yen,
      cooking_time_limit_min,
      cooking_time_actual_min,
    });

    expect(result.nutrition_fulfillment_score).toBe(100);
    expect(result.allergen_fulfillment_score).toBe(100);
    expect(result.budget_fulfillment_score).toBe(100);
    expect(result.cooking_time_fulfillment_score).toBe(100);
    expect(result.overall_evaluation_score).toBe(100);
  });

  test("should calculate partial constraint scores when some constraints are partially met", () => {
    const menu_id = "menu_002";
    const nutrition_target = {
      protein_g: 50,
      carbs_g: 300,
      fat_g: 60,
    };
    const nutrition_actual = {
      protein_g: 40,
      carbs_g: 250,
      fat_g: 48,
    };
    const allergen_exclusions = ["egg", "dairy"];
    const allergen_actual = [];
    const budget_limit_yen = 800;
    const budget_actual_yen = 750;
    const cooking_time_limit_min = 30;
    const cooking_time_actual_min = 28;

    const result = calculateMenuConstraintFulfillmentScores({
      menu_id,
      nutrition_target,
      nutrition_actual,
      allergen_exclusions,
      allergen_actual,
      budget_limit_yen,
      budget_actual_yen,
      cooking_time_limit_min,
      cooking_time_actual_min,
    });

    expect(result.nutrition_fulfillment_score).toBe(80);
    expect(result.allergen_fulfillment_score).toBe(100);
    expect(result.budget_fulfillment_score).toBe(93);
    expect(result.cooking_time_fulfillment_score).toBe(93);
    expect(result.overall_evaluation_score).toBe(91.5);
  });

  test("should calculate lower scores when allergen constraints are violated", () => {
    const menu_id = "menu_003";
    const nutrition_target = {
      protein_g: 50,
      carbs_g: 300,
      fat_g: 60,
    };
    const nutrition_actual = {
      protein_g: 50,
      carbs_g: 300,
      fat_g: 60,
    };
    const allergen_exclusions = ["egg", "dairy"];
    const allergen_actual = ["egg"];
    const budget_limit_yen = 800;
    const budget_actual_yen = 700;
    const cooking_time_limit_min = 30;
    const cooking_time_actual_min = 25;

    const result = calculateMenuConstraintFulfillmentScores({
      menu_id,
      nutrition_target,
      nutrition_actual,
      allergen_exclusions,
      allergen_actual,
      budget_limit_yen,
      budget_actual_yen,
      cooking_time_limit_min,
      cooking_time_actual_min,
    });

    expect(result.nutrition_fulfillment_score).toBe(100);
    expect(result.allergen_fulfillment_score).toBe(0);
    expect(result.budget_fulfillment_score).toBe(100);
    expect(result.cooking_time_fulfillment_score).toBe(100);
    expect(result.overall_evaluation_score).toBe(75);
  });

  test("should calculate lower scores when budget constraint is exceeded", () => {
    const menu_id = "menu_004";
    const nutrition_target = {
      protein_g: 50,
      carbs_g: 300,
      fat_g: 60,
    };
    const nutrition_actual = {
      protein_g: 50,
      carbs_g: 300,
      fat_g: 60,
    };
    const allergen_exclusions = ["egg", "dairy"];
    const allergen_actual = [];
    const budget_limit_yen = 800;
    const budget_actual_yen = 900;
    const cooking_time_limit_min = 30;
    const cooking_time_actual_min = 25;

    const result = calculateMenuConstraintFulfillmentScores({
      menu_id,
      nutrition_target,
      nutrition_actual,
      allergen_exclusions,
      allergen_actual,
      budget_limit_yen,
      budget_actual_yen,
      cooking_time_limit_min,
      cooking_time_actual_min,
    });

    expect(result.nutrition_fulfillment_score).toBe(100);
    expect(result.allergen_fulfillment_score).toBe(100);
    expect(result.budget_fulfillment_score).toBe(0);
    expect(result.cooking_time_fulfillment_score).toBe(100);
    expect(result.overall_evaluation_score).toBe(75);
  });

  test("should calculate lower scores when cooking time constraint is exceeded", () => {
    const menu_id = "menu_005";
    const nutrition_target = {
      protein_g: 50,
      carbs_g: 300,
      fat_g: 60,
    };
    const nutrition_actual = {
      protein_g: 50,
      carbs_g: 300,
      fat_g: 60,
    };
    const allergen_exclusions = ["egg", "dairy"];
    const allergen_actual = [];
    const budget_limit_yen = 800;
    const budget_actual_yen = 700;
    const cooking_time_limit_min = 30;
    const cooking_time_actual_min = 35;

    const result = calculateMenuConstraintFulfillmentScores({
      menu_id,
      nutrition_target,
      nutrition_actual,
      allergen_exclusions,
      allergen_actual,
      budget_limit_yen,
      budget_actual_yen,
      cooking_time_limit_min,
      cooking_time_actual_min,
    });

    expect(result.nutrition_fulfillment_score).toBe(100);
    expect(result.allergen_fulfillment_score).toBe(100);
    expect(result.budget_fulfillment_score).toBe(100);
    expect(result.cooking_time_fulfillment_score).toBe(0);
    expect(result.overall_evaluation_score).toBe(75);
  });

  test("should calculate weighted average correctly with mixed constraint satisfaction", () => {
    const menu_id = "menu_006";
    const nutrition_target = {
      protein_g: 50,
      carbs_g: 300,
      fat_g: 60,
    };
    const nutrition_actual = {
      protein_g: 35,
      carbs_g: 210,
      fat_g: 42,
    };
    const allergen_exclusions = ["egg", "dairy"];
    const allergen_actual = [];
    const budget_limit_yen = 800;
    const budget_actual_yen = 650;
    const cooking_time_limit_min = 30;
    const cooking_time_actual_min = 20;

    const result = calculateMenuConstraintFulfillmentScores({
      menu_id,
      nutrition_target,
      nutrition_actual,
      allergen_exclusions,
      allergen_actual,
      budget_limit_yen,
      budget_actual_yen,
      cooking_time_limit_min,
      cooking_time_actual_min,
    });

    expect(result.nutrition_fulfillment_score).toBe(70);
    expect(result.allergen_fulfillment_score).toBe(100);
    expect(result.budget_fulfillment_score).toBe(100);
    expect(result.cooking_time_fulfillment_score).toBe(100);
    expect(result.overall_evaluation_score).toBe(92.5);
  });

  test("should throw error when nutrition_target is missing required fields", () => {
    const menu_id = "menu_007";
    const nutrition_target = { protein_g: 50 };
    const nutrition_actual = { protein_g: 50, carbs_g: 300, fat_g: 60 };
    const allergen_exclusions = ["egg"];
    const allergen_actual = [];
    const budget_limit_yen = 800;
    const budget_actual_yen = 700;
    const cooking_time_limit_min = 30;
    const cooking_time_actual_min = 25;

    expect(() =>
      calculateMenuConstraintFulfillmentScores({
        menu_id,
        nutrition_target: nutrition_target as any,
        nutrition_actual,
        allergen_exclusions,
        allergen_actual,
        budget_limit_yen,
        budget_actual_yen,
        cooking_time_limit_min,
        cooking_time_actual_min,
      })
    ).toThrow(/栄養目標/);
  });

  test("should throw error when budget_limit_yen is negative", () => {
    const menu_id = "menu_008";
    const nutrition_target = {
      protein_g: 50,
      carbs_g: 300,
      fat_g: 60,
    };
    const nutrition_actual = {
      protein_g: 50,
      carbs_g: 300,
      fat_g: 60,
    };
    const allergen_exclusions = ["egg"];
    const allergen_actual = [];
    const budget_limit_yen = -100;
    const budget_actual_yen = 700;
    const cooking_time_limit_min = 30;
    const cooking_time_actual_min = 25;

    expect(() =>
      calculateMenuConstraintFulfillmentScores({
        menu_id,
        nutrition_target,
        nutrition_actual,
        allergen_exclusions,
        allergen_actual,
        budget_limit_yen,
        budget_actual_yen,
        cooking_time_limit_min,
        cooking_time_actual_min,
      })
    ).toThrow(/予算/);
  });

  test("should throw error when cooking_time_limit_min is zero or negative", () => {
    const menu_id = "menu_009";
    const nutrition_target = {
      protein_g: 50,
      carbs_g: 300,
      fat_g: 60,
    };
    const nutrition_actual = {
      protein_g: 50,
      carbs_g: 300,
      fat_g: 60,
    };
    const allergen_exclusions = ["egg"];
    const allergen_actual = [];
    const budget_limit_yen = 800;
    const budget_actual_yen = 700;
    const cooking_time_limit_min = 0;
    const cooking_time_actual_min = 25;

    expect(() =>
      calculateMenuConstraintFulfillmentScores({
        menu_id,
        nutrition_target,
        nutrition_actual,
        allergen_exclusions,
        allergen_actual,
        budget_limit_yen,
        budget_actual_yen,
        cooking_time_limit_min,
        cooking_time_actual_min,
      })
    ).toThrow(/調理時間/);
  });

  test("should return score of 50 when nutrition partially meets 50 percent of target", () => {
    const menu_id = "menu_010";
    const nutrition_target = {
      protein_g: 100,
      carbs_g: 400,
      fat_g: 100,
    };
    const nutrition_actual = {
      protein_g: 50,
      carbs_g: 200,
      fat_g: 50,
    };
    const allergen_exclusions = ["egg"];
    const allergen_actual = [];
    const budget_limit_yen = 800;
    const budget_actual_yen = 700;
    const cooking_time_limit_min = 30;
    const cooking_time_actual_min = 25;

    const result = calculateMenuConstraintFulfillmentScores({
      menu_id,
      nutrition_target,
      nutrition_actual,
      allergen_exclusions,
      allergen_actual,
      budget_limit_yen,
      budget_actual_yen,
      cooking_time_limit_min,
      cooking_time_actual_min,
    });

    expect(result.nutrition_fulfillment_score).toBe(50);
    expect(result.overall_evaluation_score).toBe(87.5);
  });
});