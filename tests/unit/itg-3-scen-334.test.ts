import { validateMenuBeforeConfirmation } from "../../src/logic/it-1-br-3-2-1";

describe("購入実績の記録と月次食費削減効果の自動集計・分析機能", () => {
  // SCEN-334
  test("献立確定前の全制約検証機能 - 複数の制約条件違反を詳細に返す", () => {
    const menu_id = "menu_001";
    const user_id = "user_001";
    const family_members = [
      {
        member_id: "member_001",
        age: 35,
        allergies: ["卵", "乳製品", "ピーナッツ"],
        dietary_restrictions: ["低塩"],
      },
      {
        member_id: "member_002",
        age: 8,
        allergies: ["甲殻類"],
        dietary_restrictions: [],
      },
    ];

    const budget_limit_yen = 5000;
    const proposed_menu = {
      menu_id: menu_id,
      items: [
        {
          dish_id: "dish_001",
          dish_name: "卵焼き",
          estimated_cost_yen: 800,
          ingredients: ["卵", "砂糖", "塩"],
          nutrition: { protein_g: 8, calcium_mg: 50, iron_mg: 1.5, sodium_mg: 600 },
        },
        {
          dish_id: "dish_002",
          dish_name: "エビフライ",
          estimated_cost_yen: 1200,
          ingredients: ["エビ", "小麦粉", "油", "パン粉"],
          nutrition: { protein_g: 20, calcium_mg: 100, iron_mg: 2, sodium_mg: 800 },
        },
        {
          dish_id: "dish_003",
          dish_name: "チーズバーグ",
          estimated_cost_yen: 1500,
          ingredients: ["牛肉", "チーズ", "塩", "油"],
          nutrition: { protein_g: 25, calcium_mg: 300, iron_mg: 2.5, sodium_mg: 1200 },
        },
        {
          dish_id: "dish_004",
          dish_name: "ピーナッツ和え",
          estimated_cost_yen: 400,
          ingredients: ["ピーナッツ", "もやし", "醤油"],
          nutrition: { protein_g: 10, calcium_mg: 40, iron_mg: 1, sodium_mg: 500 },
        },
      ],
      total_estimated_cost_yen: 3900,
      total_nutrition: {
        protein_g: 63,
        calcium_mg: 490,
        iron_mg: 7,
        sodium_mg: 3100,
      },
    };

    const nutrition_targets = {
      protein_g_min: 80,
      protein_g_max: 200,
      calcium_mg_min: 600,
      iron_mg_min: 12,
      sodium_mg_max: 2300,
    };

    const cooking_time_limit_minutes = 45;
    const proposed_cooking_time_minutes = 120;

    const result = validateMenuBeforeConfirmation({
      menu_id,
      user_id,
      family_members,
      proposed_menu,
      budget_limit_yen,
      nutrition_targets,
      cooking_time_limit_minutes,
      proposed_cooking_time_minutes,
    });

    expect(result.is_valid).toBe(false);
    expect(result.http_status_code).toBe(422);
    expect(result.violations).toBeDefined();
    expect(Array.isArray(result.violations)).toBe(true);
    expect(result.violations.length).toBeGreaterThanOrEqual(3);

    const violation_types = result.violations.map((v) => v.violation_type);
    expect(violation_types).toContain("アレルギー");
    expect(violation_types).toContain("栄養不足");
    expect(violation_types).toContain("調理時間超過");

    const allergy_violation = result.violations.find((v) => v.violation_type === "アレルギー");
    expect(allergy_violation).toBeDefined();
    expect(allergy_violation?.violation_details).toBeDefined();
    expect(allergy_violation?.current_value).toBeDefined();
    expect(allergy_violation?.limit_value).toBeDefined();
    expect(allergy_violation?.severity_level).toMatch(/警告|エラー/);
    expect(allergy_violation?.remediation_suggestion).toBeDefined();
    expect(typeof allergy_violation?.remediation_suggestion).toBe("string");
    expect(allergy_violation?.remediation_suggestion.length).toBeGreaterThan(0);

    const nutrition_violation = result.violations.find((v) => v.violation_type === "栄養不足");
    expect(nutrition_violation).toBeDefined();
    expect(nutrition_violation?.violation_details).toBeDefined();
    expect(nutrition_violation?.current_value).toBeDefined();
    expect(nutrition_violation?.limit_value).toBeDefined();
    expect(nutrition_violation?.severity_level).toMatch(/警告|エラー/);
    expect(nutrition_violation?.remediation_suggestion).toBeDefined();

    const cooking_time_violation = result.violations.find(
      (v) => v.violation_type === "調理時間超過"
    );
    expect(cooking_time_violation).toBeDefined();
    expect(cooking_time_violation?.violation_details).toBeDefined();
    expect(cooking_time_violation?.current_value).toBe(120);
    expect(cooking_time_violation?.limit_value).toBe(45);
    expect(cooking_time_violation?.severity_level).toMatch(/警告|エラー/);
    expect(cooking_time_violation?.remediation_suggestion).toBeDefined();

    expect(result.error_message).toBeDefined();
    expect(result.error_message.length).toBeGreaterThan(0);
    expect(result.error_message).toMatch(/違反|制約|確認/);

    expect(result.menu_is_confirmed).toBe(false);

    const allergy_violation_2 = result.violations.find((v) => v.violation_type === "アレルギー");
    if (allergy_violation_2) {
      expect(allergy_violation_2.violation_details).toContain("卵");
      expect(allergy_violation_2.violation_details).toContain("乳製品");
      expect(allergy_violation_2.violation_details).toContain("ピーナッツ");
    }

    const nutrition_violation_2 = result.violations.find(
      (v) => v.violation_type === "栄養不足"
    );
    if (nutrition_violation_2) {
      expect(nutrition_violation_2.violation_details).toMatch(/タンパク質|カルシウム|鉄分/);
    }
  });
});