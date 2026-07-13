import { rankMenuCandidates } from "../../src/logic/it-1-br-3-2-1";

describe("購入実績の記録と月次食費削減効果の自動集計・分析機能", () => {
  // SCEN-339
  test("複数制約条件下での献立候補ランキング機能 - 矛盾した制約条件では空リストまたはエラーメッセージを返す", () => {
    const contradictory_constraints = {
      max_budget_yen: 100,
      min_protein_g: 20,
      max_fat_g: 5,
      family_member_count: 4,
      cooking_time_minutes: 30,
      allergy_exclude_ingredients: ["egg", "milk"],
      dietary_restrictions: ["vegetarian"],
    };

    const menu_candidates = [
      {
        menu_id: "M001",
        menu_name: "High Protein Chicken Bowl",
        budget_yen: 150,
        protein_g: 25,
        fat_g: 12,
        cooking_time_minutes: 20,
        ingredients: ["chicken", "rice", "egg"],
        nutritional_score: 85,
      },
      {
        menu_id: "M002",
        menu_name: "Tofu Stir Fry",
        budget_yen: 200,
        protein_g: 15,
        fat_g: 8,
        cooking_time_minutes: 25,
        ingredients: ["tofu", "vegetables", "oil"],
        nutritional_score: 70,
      },
      {
        menu_id: "M003",
        menu_name: "Budget Pasta",
        budget_yen: 80,
        protein_g: 12,
        fat_g: 4,
        cooking_time_minutes: 15,
        ingredients: ["pasta", "tomato", "garlic"],
        nutritional_score: 60,
      },
    ];

    const result = rankMenuCandidates(contradictory_constraints, menu_candidates);

    // Assert: empty list is returned for impossible constraints
    if (Array.isArray(result)) {
      expect(result).toEqual([]);
    } else {
      // Or error object is returned with proper structure
      expect(result).toHaveProperty("error_code");
      expect(result).toHaveProperty("error_message");
      expect(result.error_code).toMatch(/constraint|impossible|conflict/);
    }
  });

  // Boundary: constraints with budget too low but protein requirement too high
  test("制約条件が物理的に不可能な組み合わせの場合、システムは正常に処理を完了する", () => {
    const impossible_constraints = {
      max_budget_yen: 50,
      min_protein_g: 30,
      max_fat_g: 3,
      family_member_count: 2,
      cooking_time_minutes: 10,
      allergy_exclude_ingredients: ["chicken", "fish", "tofu", "meat"],
      dietary_restrictions: ["vegan", "gluten_free"],
    };

    const limited_candidates = [
      {
        menu_id: "M004",
        menu_name: "Rice and Vegetables",
        budget_yen: 60,
        protein_g: 8,
        fat_g: 2,
        cooking_time_minutes: 20,
        ingredients: ["rice", "carrot", "onion"],
        nutritional_score: 45,
      },
    ];

    const result = rankMenuCandidates(impossible_constraints, limited_candidates);

    // Assert: system completes without crash; returns empty list or error
    expect(result).toBeDefined();
    if (Array.isArray(result)) {
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    } else {
      expect(typeof result).toBe("object");
      expect(result).toHaveProperty("error_code");
    }
  });

  // Success case: when constraints are satisfiable
  test("制約条件を満たす献立候補が存在する場合、ランキング済みリストを返す", () => {
    const reasonable_constraints = {
      max_budget_yen: 300,
      min_protein_g: 15,
      max_fat_g: 15,
      family_member_count: 4,
      cooking_time_minutes: 45,
      allergy_exclude_ingredients: ["peanut"],
      dietary_restrictions: [],
    };

    const candidates_satisfiable = [
      {
        menu_id: "M005",
        menu_name: "Grilled Fish with Vegetables",
        budget_yen: 280,
        protein_g: 22,
        fat_g: 10,
        cooking_time_minutes: 35,
        ingredients: ["salmon", "broccoli", "sweet_potato"],
        nutritional_score: 90,
      },
      {
        menu_id: "M006",
        menu_name: "Chicken Rice Bowl",
        budget_yen: 250,
        protein_g: 18,
        fat_g: 12,
        cooking_time_minutes: 30,
        ingredients: ["chicken_breast", "rice", "carrots"],
        nutritional_score: 85,
      },
    ];

    const result = rankMenuCandidates(
      reasonable_constraints,
      candidates_satisfiable
    );

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("menu_id");
    expect(result[0]).toHaveProperty("rank");
    expect(result[0].rank).toBe(1);
  });
});