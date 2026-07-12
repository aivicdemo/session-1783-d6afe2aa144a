import { normalizeAndValidateRefrigeratorInventory } from "../../src/logic/it-1-1-1";

describe("冷蔵庫在庫情報の正規化・バリデーション", () => {
  // SCEN-344
  test("食材名が空文字で入力されたときエラーが返される", () => {
    const input = {
      ingredient_name: "",
      quantity: 1,
      unit: "個",
    };

    expect(() => normalizeAndValidateRefrigeratorInventory(input)).toThrow(
      /食材名/
    );
  });
});