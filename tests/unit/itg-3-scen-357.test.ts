import {
  analyzeExcessCostFactors,
  adjustMenuPriorityConditions,
  generateMenuWithAdjustedConditions,
  calculateEstimatedFoodCost,
} from "../../src/logic/it-1-br-6-2-1-1";

describe("Food Cost Excess Factor Analysis and Menu Adjustment", () => {
  // SCEN-357
  test(
    "should analyze monthly food cost excess factors, adjust menu priority conditions, " +
      "and reflect reduced usage of excess-candidate ingredients in next month menu generation",
    () => {
      // Setup: Previous month food cost data exceeding budget
      const previous_month_budget = 50000; // JPY
      const previous_month_actual_cost = 57500; // JPY (超過額: 7500 JPY)
      const previous_month_excess = previous_month_actual_cost - previous_month_budget; // 7500

      // Setup: Previous month ingredient cost breakdown
      const ingredient_costs = [
        { ingredient_id: "beef_001", category: "meat", cost: 12000, qty: 2.0 },
        {
          ingredient_id: "chicken_002",
          category: "meat",
          cost: 8000,
          qty: 2.5,
        },
        {
          ingredient_id: "salmon_003",
          category: "seafood",
          cost: 10500,
          qty: 1.5,
        },
        {
          ingredient_id: "shrimp_004",
          category: "seafood",
          cost: 9200,
          qty: 1.2,
        },
        {
          ingredient_id: "broccoli_005",
          category: "vegetable",
          cost: 3600,
          qty: 4.0,
        },
        {
          ingredient_id: "carrot_006",
          category: "vegetable",
          cost: 1800,
          qty: 5.0,
        },
      ];

      // Step 1: Execute excess factor analysis
      const excess_analysis_result = analyzeExcessCostFactors({
        budget: previous_month_budget,
        actual_cost: previous_month_actual_cost,
        ingredient_costs: ingredient_costs,
      });

      // Verify: Analysis result identifies top 3 excess ingredients
      expect(excess_analysis_result).toEqual(
        expect.objectContaining({
          total_excess: 7500,
          excess_rate: expect.closeTo((7500 / 50000) * 100, 0.01),
          excess_ingredients: expect.arrayContaining([
            expect.objectContaining({
              ingredient_id: "beef_001",
              category: "meat",
              excess_amount: 12000,
              rank: 1,
            }),
            expect.objectContaining({
              ingredient_id: "salmon_003",
              category: "seafood",
              excess_amount: 10500,
              rank: 2,
            }),
            expect.objectContaining({
              ingredient_id: "shrimp_004",
              category: "seafood",
              excess_amount: 9200,
              rank: 3,
            }),
          ]),
        })
      );

      // Verify: Top 3 excess ingredients (beef, salmon, shrimp) are correctly ordered
      expect(excess_analysis_result.excess_ingredients.length).toBe(3);
      expect(excess_analysis_result.excess_ingredients[0].ingredient_id).toBe(
        "beef_001"
      );
      expect(excess_analysis_result.excess_ingredients[1].ingredient_id).toBe(
        "salmon_003"
      );
      expect(excess_analysis_result.excess_ingredients[2].ingredient_id).toBe(
        "shrimp_004"
      );

      // Verify: Excess rate is correctly calculated (15%)
      expect(excess_analysis_result.excess_rate).toBeCloseTo(15.0, 2);

      // Step 2: Adjust menu priority conditions based on analysis
      const current_menu_priority_conditions = {
        nutritional_balance_weight: 0.4,
        family_preference_weight: 0.35,
        budget_optimization_weight: 0.15,
        cooking_time_weight: 0.1,
      };

      const reduced_cost_target = previous_month_actual_cost * 0.92; // 92% of previous month (削減目標: 8%)

      const adjusted_priority_conditions = adjustMenuPriorityConditions({
        current_conditions: current_menu_priority_conditions,
        excess_analysis: excess_analysis_result,
        target_cost_ratio: 0.92,
        excluded_ingredients: [
          "beef_001",
          "salmon_003",
          "shrimp_004",
        ],
        substitute_ingredients: [
          { original: "beef_001", substitute: "chicken_002", cost_ratio: 0.67 },
          { original: "salmon_003", substitute: "broccoli_005", cost_ratio: 0.34 },
          { original: "shrimp_004", substitute: "carrot_006", cost_ratio: 0.20 },
        ],
      });

      // Verify: Budget optimization weight increased (0.15 → 0.25)
      expect(adjusted_priority_conditions.budget_optimization_weight).toBe(0.25);

      // Verify: Nutritional balance weight slightly decreased (0.4 → 0.35)
      expect(adjusted_priority_conditions.nutritional_balance_weight).toBe(0.35);

      // Verify: Excluded ingredients list is set
      expect(adjusted_priority_conditions.excluded_ingredients).toEqual([
        "beef_001",
        "salmon_003",
        "shrimp_004",
      ]);

      // Verify: Substitute mapping is configured
      expect(adjusted_priority_conditions.substitute_mapping).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            original: "beef_001",
            substitute: "chicken_002",
            cost_ratio: 0.67,
          }),
          expect.objectContaining({
            original: "salmon_003",
            substitute: "broccoli_005",
            cost_ratio: 0.34,
          }),
          expect.objectContaining({
            original: "shrimp_004",
            substitute: "carrot_006",
            cost_ratio: 0.20,
          }),
        ])
      );

      // Step 3: Generate next month menu with adjusted conditions
      const family_constraints = {
        family_size: 4,
        allergies: [],
        dietary_restrictions: [],
        preferred_cuisines: ["Japanese", "Western"],
      };

      const next_month_menu_days = 7; // Generate 1 week menu

      const generated_menu = generateMenuWithAdjustedConditions({
        priority_conditions: adjusted_priority_conditions,
        family_constraints: family_constraints,
        target_cost: reduced_cost_target,
        menu_days: next_month_menu_days,
        available_ingredients: [
          "chicken_002",
          "broccoli_005",
          "carrot_006",
          "rice_007",
          "egg_008",
          "tofu_009",
        ],
      });

      // Verify: Generated menu does not contain excluded high-cost ingredients
      const menu_ingredients_flat = generated_menu.daily_menus.flatMap(
        (day: { meals: { ingredients: string[] }[] }) =>
          day.meals.flatMap((meal: { ingredients: string[] }) => meal.ingredients)
      );

      expect(menu_ingredients_flat).not.toContain("beef_001");
      expect(menu_ingredients_flat).not.toContain("salmon_003");
      expect(menu_ingredients_flat).not.toContain("shrimp_004");

      // Verify: Generated menu includes substitute ingredients
      expect(menu_ingredients_flat).toContain("chicken_002");
      expect(menu_ingredients_flat).toContain("broccoli_005");
      expect(menu_ingredients_flat).toContain("carrot_006");

      // Verify: Menu contains expected number of days
      expect(generated_menu.daily_menus.length).toBe(7);

      // Step 4: Calculate estimated food cost for generated menu
      const ingredient_unit_prices = {
        beef_001: 6000,
        chicken_002: 3200,
        salmon_003: 7000,
        shrimp_004: 7667,
        broccoli_005: 900,
        carrot_006: 360,
        rice_007: 200,
        egg_008: 250,
        tofu_009: 150,
      };

      const estimated_cost_generated_menu = calculateEstimatedFoodCost({
        daily_menus: generated_menu.daily_menus,
        ingredient_prices: ingredient_unit_prices,
        family_size: 4,
      });

      // Verify: Estimated cost is within target range (92% of previous month)
      expect(estimated_cost_generated_menu).toBeLessThanOrEqual(reduced_cost_target);

      // Verify: Estimated cost is less than previous month actual cost
      expect(estimated_cost_generated_menu).toBeLessThan(previous_month_actual_cost);

      // Verify: Cost reduction is approximately 8% or more
      const cost_reduction_rate =
        ((previous_month_actual_cost - estimated_cost_generated_menu) /
          previous_month_actual_cost) *
        100;
      expect(cost_reduction_rate).toBeGreaterThanOrEqual(8.0);

      // Verify: Estimated cost exceeds budget by acceptable margin (max 2%)
      const budget_variance_rate =
        ((estimated_cost_generated_menu - previous_month_budget) /
          previous_month_budget) *
        100;
      expect(budget_variance_rate).toBeLessThanOrEqual(2.0);

      // Verify: Estimated cost for generated menu is positive
      expect(estimated_cost_generated_menu).toBeGreaterThan(0);

      // Verify: Complete flow result summary
      expect({
        previous_month_budget: previous_month_budget,
        previous_month_actual: previous_month_actual_cost,
        excess_amount: previous_month_excess,
        excess_rate_percent: excess_analysis_result.excess_rate,
        top_excess_ingredients: excess_analysis_result.excess_ingredients.map(
          (ing: { ingredient_id: string; excess_amount: number; rank: number }) => ({
            id: ing.ingredient_id,
            excess: ing.excess_amount,
            rank: ing.rank,
          })
        ),
        adjusted_conditions_budget_weight:
          adjusted_priority_conditions.budget_optimization_weight,
        generated_menu_days: generated_menu.daily_menus.length,
        generated_menu_excluded_high_cost: !menu_ingredients_flat.includes(
          "beef_001"
        ),
        generated_menu_includes_substitutes:
          menu_ingredients_flat.includes("chicken_002") &&
          menu_ingredients_flat.includes("broccoli_005"),
        estimated_cost: estimated_cost_generated_menu,
        cost_reduction_percent: cost_reduction_rate,
        meets_budget_target: estimated_cost_generated_menu <= reduced_cost_target,
      }).toEqual({
        previous_month_budget: 50000,
        previous_month_actual: 57500,
        excess_amount: 7500,
        excess_rate_percent: 15.0,
        top_excess_ingredients: [
          { id: "beef_001", excess: 12000, rank: 1 },
          { id: "salmon_003", excess: 10500, rank: 2 },
          { id: "shrimp_004", excess: 9200, rank: 3 },
        ],
        adjusted_conditions_budget_weight: 0.25,
        generated_menu_days: 7,
        generated_menu_excluded_high_cost: true,
        generated_menu_includes_substitutes: true,
        estimated_cost: estimated_cost_generated_menu,
        cost_reduction_percent: cost_reduction_rate,
        meets_budget_target: true,
      });
    }
  );
});