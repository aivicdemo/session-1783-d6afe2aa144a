import { detectConflictingMenus } from "../../src/logic/it-1-br-4-2-1";

describe("食事制限条件の変更時に過去献立との抵触検出機能", () => {
  // SCEN-336
  test("過去献立との抵触検出 - 新規入力された食事制限に抵触する過去献立が全て検出され、一覧として返される", () => {
    const past_menus = [
      {
        menu_id: "menu_001",
        menu_name: "鶏肉のから揚げ、ご飯、味噌汁",
        dishes: [
          {
            dish_id: "dish_001_1",
            dish_name: "鶏肉のから揚げ",
            ingredients: [
              { ingredient_id: "ing_001", ingredient_name: "鶏肉", is_animal_protein: true }
            ]
          },
          {
            dish_id: "dish_001_2",
            dish_name: "ご飯",
            ingredients: [
              { ingredient_id: "ing_002", ingredient_name: "米", is_animal_protein: false }
            ]
          },
          {
            dish_id: "dish_001_3",
            dish_name: "味噌汁",
            ingredients: [
              { ingredient_id: "ing_003", ingredient_name: "味噌", is_animal_protein: false }
            ]
          }
        ]
      },
      {
        menu_id: "menu_002",
        menu_name: "牛肉ステーキ、ポテトサラダ、スープ",
        dishes: [
          {
            dish_id: "dish_002_1",
            dish_name: "牛肉ステーキ",
            ingredients: [
              { ingredient_id: "ing_004", ingredient_name: "牛肉", is_animal_protein: true }
            ]
          },
          {
            dish_id: "dish_002_2",
            dish_name: "ポテトサラダ",
            ingredients: [
              { ingredient_id: "ing_005", ingredient_name: "じゃがいも", is_animal_protein: false }
            ]
          },
          {
            dish_id: "dish_002_3",
            dish_name: "スープ",
            ingredients: [
              { ingredient_id: "ing_006", ingredient_name: "塩", is_animal_protein: false }
            ]
          }
        ]
      },
      {
        menu_id: "menu_003",
        menu_name: "卵焼き、ご飯、漬物",
        dishes: [
          {
            dish_id: "dish_003_1",
            dish_name: "卵焼き",
            ingredients: [
              { ingredient_id: "ing_007", ingredient_name: "卵", is_animal_protein: true }
            ]
          },
          {
            dish_id: "dish_003_2",
            dish_name: "ご飯",
            ingredients: [
              { ingredient_id: "ing_008", ingredient_name: "米", is_animal_protein: false }
            ]
          },
          {
            dish_id: "dish_003_3",
            dish_name: "漬物",
            ingredients: [
              { ingredient_id: "ing_009", ingredient_name: "大根", is_animal_protein: false }
            ]
          }
        ]
      }
    ];

    const new_restriction = {
      restriction_id: "rest_001",
      restriction_name: "動物性タンパク質の摂取を制限",
      restriction_type: "animal_protein_limit",
      trigger_ingredients: ["鶏肉", "牛肉", "卵"]
    };

    const result = detectConflictingMenus(past_menus, new_restriction);

    expect(result.conflicting_menus).toHaveLength(3);
    expect(result.conflicting_menus[0]).toEqual({
      menu_id: "menu_001",
      menu_name: "鶏肉のから揚げ、ご飯、味噌汁",
      conflict_reason: "動物性タンパク質の摂取を制限",
      conflicting_ingredients: ["鶏肉"],
      conflicting_dishes: ["鶏肉のから揚げ"]
    });
    expect(result.conflicting_menus[1]).toEqual({
      menu_id: "menu_002",
      menu_name: "牛肉ステーキ、ポテトサラダ、スープ",
      conflict_reason: "動物性タンパク質の摂取を制限",
      conflicting_ingredients: ["牛肉"],
      conflicting_dishes: ["牛肉ステーキ"]
    });
    expect(result.conflicting_menus[2]).toEqual({
      menu_id: "menu_003",
      menu_name: "卵焼き、ご飯、漬物",
      conflict_reason: "動物性タンパク質の摂取を制限",
      conflicting_ingredients: ["卵"],
      conflicting_dishes: ["卵焼き"]
    });
    expect(result.total_conflicting_count).toBe(3);
    expect(result.detection_timestamp).toBeDefined();
  });
});