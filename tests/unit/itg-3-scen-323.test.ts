import {
  detectConflictingMenus,
} from "../../src/logic/it-1-br-3-2-1";

describe("Purchase Record and Monthly Food Expense Reduction Analysis", () => {
  // SCEN-323
  test("should automatically detect past menus conflicting with newly added allergen condition and display them in list format", () => {
    const user_id = "user_001";
    const new_allergen = "egg";
    const past_menus = [
      {
        menu_id: "menu_001",
        menu_name: "Omelet with ham",
        execution_date: "2024-01-10",
        ingredients: ["egg", "ham", "butter"],
        allergens: ["egg"],
      },
      {
        menu_id: "menu_002",
        menu_name: "Spaghetti Carbonara",
        execution_date: "2024-01-12",
        ingredients: ["pasta", "egg", "bacon", "cream"],
        allergens: ["egg"],
      },
      {
        menu_id: "menu_003",
        menu_name: "Chicken Teriyaki",
        execution_date: "2024-01-15",
        ingredients: ["chicken", "soy_sauce", "mirin"],
        allergens: [],
      },
      {
        menu_id: "menu_004",
        menu_name: "Custard Pudding",
        execution_date: "2024-01-18",
        ingredients: ["egg", "milk", "sugar", "vanilla"],
        allergens: ["egg"],
      },
      {
        menu_id: "menu_005",
        menu_name: "Vegetable Salad",
        execution_date: "2024-01-20",
        ingredients: ["lettuce", "tomato", "cucumber", "dressing"],
        allergens: [],
      },
    ];

    const result = detectConflictingMenus({
      user_id,
      new_allergen,
      past_menus,
    });

    expect(result).toEqual({
      allergen: "egg",
      total_detected_count: 3,
      conflicting_menus: [
        {
          menu_id: "menu_001",
          menu_name: "Omelet with ham",
          execution_date: "2024-01-10",
          contained_allergens: ["egg"],
          conflict_reason: "egg detected in ingredients",
        },
        {
          menu_id: "menu_002",
          menu_name: "Spaghetti Carbonara",
          execution_date: "2024-01-12",
          contained_allergens: ["egg"],
          conflict_reason: "egg detected in ingredients",
        },
        {
          menu_id: "menu_004",
          menu_name: "Custard Pudding",
          execution_date: "2024-01-18",
          contained_allergens: ["egg"],
          conflict_reason: "egg detected in ingredients",
        },
      ],
      non_conflicting_count: 2,
    });

    expect(result.total_detected_count).toBe(3);
    expect(result.conflicting_menus.length).toBeGreaterThanOrEqual(3);
    expect(result.conflicting_menus.every((m) => m.contained_allergens.includes("egg"))).toBe(true);
    expect(result.non_conflicting_count).toBe(2);
  });

  test("should handle case where allergen condition matches no past menus", () => {
    const user_id = "user_002";
    const new_allergen = "peanut";
    const past_menus = [
      {
        menu_id: "menu_101",
        menu_name: "Chicken Rice Bowl",
        execution_date: "2024-01-10",
        ingredients: ["chicken", "rice", "soy_sauce"],
        allergens: [],
      },
      {
        menu_id: "menu_102",
        menu_name: "Miso Soup",
        execution_date: "2024-01-12",
        ingredients: ["miso", "tofu", "wakame"],
        allergens: [],
      },
    ];

    const result = detectConflictingMenus({
      user_id,
      new_allergen,
      past_menus,
    });

    expect(result.total_detected_count).toBe(0);
    expect(result.conflicting_menus.length).toBe(0);
    expect(result.non_conflicting_count).toBe(2);
  });

  test("should throw error when past_menus array is empty", () => {
    const user_id = "user_003";
    const new_allergen = "milk";
    const past_menus: any[] = [];

    expect(() => {
      detectConflictingMenus({
        user_id,
        new_allergen,
        past_menus,
      });
    }).toThrow(/履歴/);
  });

  test("should throw error when user_id is missing", () => {
    const past_menus = [
      {
        menu_id: "menu_201",
        menu_name: "Test Menu",
        execution_date: "2024-01-10",
        ingredients: ["egg"],
        allergens: ["egg"],
      },
    ];

    expect(() => {
      detectConflictingMenus({
        user_id: "",
        new_allergen: "egg",
        past_menus,
      });
    }).toThrow(/ユーザー/);
  });

  test("should throw error when new_allergen is empty string", () => {
    const user_id = "user_004";
    const past_menus = [
      {
        menu_id: "menu_301",
        menu_name: "Test Menu",
        execution_date: "2024-01-10",
        ingredients: ["egg"],
        allergens: ["egg"],
      },
    ];

    expect(() => {
      detectConflictingMenus({
        user_id,
        new_allergen: "",
        past_menus,
      });
    }).toThrow(/アレルギー/);
  });

  test("should correctly detect multiple allergens in a single menu", () => {
    const user_id = "user_005";
    const new_allergen = "milk";
    const past_menus = [
      {
        menu_id: "menu_401",
        menu_name: "Egg and Milk Custard",
        execution_date: "2024-01-10",
        ingredients: ["egg", "milk", "sugar"],
        allergens: ["egg", "milk"],
      },
    ];

    const result = detectConflictingMenus({
      user_id,
      new_allergen,
      past_menus,
    });

    expect(result.total_detected_count).toBe(1);
    expect(result.conflicting_menus[0].contained_allergens).toContain("milk");
  });

  test("should preserve execution_date ordering in detected menus list", () => {
    const user_id = "user_006";
    const new_allergen = "shellfish";
    const past_menus = [
      {
        menu_id: "menu_501",
        menu_name: "Shrimp Tempura",
        execution_date: "2024-01-20",
        ingredients: ["shrimp", "flour"],
        allergens: ["shellfish"],
      },
      {
        menu_id: "menu_502",
        menu_name: "Crab Rice",
        execution_date: "2024-01-10",
        ingredients: ["crab", "rice"],
        allergens: ["shellfish"],
      },
      {
        menu_id: "menu_503",
        menu_name: "Oyster Gratin",
        execution_date: "2024-01-15",
        ingredients: ["oyster", "cheese"],
        allergens: ["shellfish"],
      },
    ];

    const result = detectConflictingMenus({
      user_id,
      new_allergen,
      past_menus,
    });

    expect(result.conflicting_menus.length).toBe(3);
    expect(result.conflicting_menus[0].menu_id).toBe("menu_502");
    expect(result.conflicting_menus[1].menu_id).toBe("menu_503");
    expect(result.conflicting_menus[2].menu_id).toBe("menu_501");
  });
});