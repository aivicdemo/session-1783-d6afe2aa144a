import { validateMenuConfirmationConstraints } from "../../src/logic/it-1-br-2-1-1-1";

describe("献立確定時の全制約条件検証・確定可否判定機能", () => {
  // SCEN-332: [edge] 複数の制約条件が同時に未充足の場合、全未充足項目が判定結果に含まれる
  test("複数制約条件が同時に未充足の場合、全未充足項目が判定結果に含まれること", () => {
    const menu_id = "menu_001";
    const constraints = [
      {
        constraint_id: "c_protein",
        constraint_name: "タンパク質",
        constraint_type: "minimum",
        target_value: 50,
        unit: "g",
      },
      {
        constraint_id: "c_calorie",
        constraint_name: "カロリー",
        constraint_type: "maximum",
        target_value: 2000,
        unit: "kcal",
      },
      {
        constraint_id: "c_salt",
        constraint_name: "塩分",
        constraint_type: "maximum",
        target_value: 10,
        unit: "g",
      },
      {
        constraint_id: "c_fiber",
        constraint_name: "食物繊維",
        constraint_type: "minimum",
        target_value: 25,
        unit: "g",
      },
    ];

    const actual_nutrition = {
      protein: 35,
      calorie: 2500,
      salt: 15,
      fiber: 18,
    };

    const result = validateMenuConfirmationConstraints({
      menu_id,
      constraints,
      actual_nutrition,
    });

    expect(result.confirmation_allowed).toBe(false);
    expect(result.unsatisfied_constraints.length).toBe(4);

    const unsatisfied_items = result.unsatisfied_constraints.map(
      (item) => item.constraint_name
    );
    expect(unsatisfied_items).toContain("タンパク質");
    expect(unsatisfied_items).toContain("カロリー");
    expect(unsatisfied_items).toContain("塩分");
    expect(unsatisfied_items).toContain("食物繊維");

    const protein_result = result.unsatisfied_constraints.find(
      (item) => item.constraint_name === "タンパク質"
    );
    expect(protein_result).toEqual({
      constraint_id: "c_protein",
      constraint_name: "タンパク質",
      constraint_type: "minimum",
      target_value: 50,
      actual_value: 35,
      gap: -15,
      gap_description: "不足",
      unit: "g",
    });

    const calorie_result = result.unsatisfied_constraints.find(
      (item) => item.constraint_name === "カロリー"
    );
    expect(calorie_result).toEqual({
      constraint_id: "c_calorie",
      constraint_name: "カロリー",
      constraint_type: "maximum",
      target_value: 2000,
      actual_value: 2500,
      gap: 500,
      gap_description: "超過",
      unit: "kcal",
    });

    const salt_result = result.unsatisfied_constraints.find(
      (item) => item.constraint_name === "塩分"
    );
    expect(salt_result).toEqual({
      constraint_id: "c_salt",
      constraint_name: "塩分",
      constraint_type: "maximum",
      target_value: 10,
      actual_value: 15,
      gap: 5,
      gap_description: "超過",
      unit: "g",
    });

    const fiber_result = result.unsatisfied_constraints.find(
      (item) => item.constraint_name === "食物繊維"
    );
    expect(fiber_result).toEqual({
      constraint_id: "c_fiber",
      constraint_name: "食物繊維",
      constraint_type: "minimum",
      target_value: 25,
      actual_value: 18,
      gap: -7,
      gap_description: "不足",
      unit: "g",
    });

    expect(result.validation_timestamp).toBeDefined();
    expect(typeof result.validation_timestamp).toBe("string");
  });
});