import { validateMenuBeforeConfirmation } from "../../src/logic/it-1-br-6-2-1-1";

describe("献立確定前の全制約検証機能 - 在庫データ=0の場合", () => {
  // SCEN-336
  test("在庫データが0の全食材について在庫不足として正確に判定され献立確定がブロックされること", () => {
    // Arrange: 献立とそれに含まれる食材、および在庫データの準備
    const menu_id = "menu_20240115_family_001";
    const family_id = "family_001";
    const user_id = "user_001";
    const confirmation_date = new Date("2024-01-15T11:00:00Z");

    // 献立に含まれる複数の食材
    const menu_items = [
      {
        ingredient_id: "ing_chicken_001",
        ingredient_name: "鶏肉",
        required_quantity: 500,
        unit: "g",
      },
      {
        ingredient_id: "ing_onion_001",
        ingredient_name: "玉ねぎ",
        required_quantity: 200,
        unit: "g",
      },
      {
        ingredient_id: "ing_carrot_001",
        ingredient_name: "人参",
        required_quantity: 150,
        unit: "g",
      },
    ];

    // 在庫データ: すべての食材の在庫が0
    const inventory_data = [
      {
        ingredient_id: "ing_chicken_001",
        current_stock: 0,
        unit: "g",
        storage_location: "冷凍庫",
        expiry_date: null,
      },
      {
        ingredient_id: "ing_onion_001",
        current_stock: 0,
        unit: "g",
        storage_location: "野菜室",
        expiry_date: null,
      },
      {
        ingredient_id: "ing_carrot_001",
        current_stock: 0,
        unit: "g",
        storage_location: "野菜室",
        expiry_date: null,
      },
    ];

    // 栄養制約
    const nutrition_constraints = {
      min_calories: 2000,
      max_calories: 2500,
      protein_min_g: 50,
      carbs_min_g: 250,
    };

    // アレルギー制約
    const allergy_constraints = ["卵", "乳製品"];

    // 食事制限制約
    const dietary_restrictions = ["ベジタリアン対応"];

    // 予算制約
    const budget_constraint_yen = 1500;

    // 調理時間制約
    const cooking_time_constraint_minutes = 40;

    // Act: 献立確定前の全制約検証を実行
    const validation_result = validateMenuBeforeConfirmation({
      menu_id,
      user_id,
      family_id,
      menu_items,
      inventory_data,
      nutrition_constraints,
      allergy_constraints,
      dietary_restrictions,
      budget_constraint_yen,
      cooking_time_constraint_minutes,
      confirmation_date,
    });

    // Assert: 在庫不足が正確に判定されていることを検証
    expect(validation_result.can_confirm).toBe(false);

    // 検証結果に在庫制約エラーが含まれていることを検証
    expect(validation_result.constraint_violations).toContainEqual(
      expect.objectContaining({
        constraint_type: "inventory",
        status: "failed",
      })
    );

    // 不足食材の詳細情報が正確に検出されていることを検証
    const inventory_violation = validation_result.constraint_violations.find(
      (v) => v.constraint_type === "inventory"
    );

    expect(inventory_violation).toBeDefined();
    expect(inventory_violation?.violation_details).toBeDefined();
    expect(Array.isArray(inventory_violation?.violation_details)).toBe(true);

    if (Array.isArray(inventory_violation?.violation_details)) {
      // 鶏肉の不足が正確に判定されているか
      const chicken_shortage = (
        inventory_violation.violation_details as Array<{
          ingredient_id: string;
          ingredient_name: string;
          required_quantity: number;
          current_stock: number;
          shortage_quantity: number;
          unit: string;
        }>
      ).find((d) => d.ingredient_id === "ing_chicken_001");

      expect(chicken_shortage).toBeDefined();
      expect(chicken_shortage?.ingredient_name).toBe("鶏肉");
      expect(chicken_shortage?.required_quantity).toBe(500);
      expect(chicken_shortage?.current_stock).toBe(0);
      expect(chicken_shortage?.shortage_quantity).toBe(500);
      expect(chicken_shortage?.unit).toBe("g");

      // 玉ねぎの不足が正確に判定されているか
      const onion_shortage = (
        inventory_violation.violation_details as Array<{
          ingredient_id: string;
          ingredient_name: string;
          required_quantity: number;
          current_stock: number;
          shortage_quantity: number;
          unit: string;
        }>
      ).find((d) => d.ingredient_id === "ing_onion_001");

      expect(onion_shortage).toBeDefined();
      expect(onion_shortage?.ingredient_name).toBe("玉ねぎ");
      expect(onion_shortage?.required_quantity).toBe(200);
      expect(onion_shortage?.current_stock).toBe(0);
      expect(onion_shortage?.shortage_quantity).toBe(200);
      expect(onion_shortage?.unit).toBe("g");

      // 人参の不足が正確に判定されているか
      const carrot_shortage = (
        inventory_violation.violation_details as Array<{
          ingredient_id: string;
          ingredient_name: string;
          required_quantity: number;
          current_stock: number;
          shortage_quantity: number;
          unit: string;
        }>
      ).find((d) => d.ingredient_id === "ing_carrot_001");

      expect(carrot_shortage).toBeDefined();
      expect(carrot_shortage?.ingredient_name).toBe("人参");
      expect(carrot_shortage?.required_quantity).toBe(150);
      expect(carrot_shortage?.current_stock).toBe(0);
      expect(carrot_shortage?.shortage_quantity).toBe(150);
      expect(carrot_shortage?.unit).toBe("g");

      // 不足食材の数が3つであることを検証
      expect(inventory_violation.violation_details.length).toBe(3);
    }

    // 献立確定がブロックされていることを確認
    expect(validation_result.confirmation_allowed).toBe(false);

    // メッセージが適切に設定されていることを検証
    expect(validation_result.error_message).toMatch(/在庫不足/);

    // 検証実行日時が記録されていることを検証
    expect(validation_result.validated_at).toEqual(confirmation_date);

    // 検証ステータスが失敗を示していることを検証
    expect(validation_result.validation_status).toBe("failed");

    // 不足食材の総数が3であることを検証（チェックサム）
    expect(validation_result.shortage_count).toBe(3);
  });
});