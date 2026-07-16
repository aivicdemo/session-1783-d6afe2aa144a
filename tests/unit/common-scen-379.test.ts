import { optimizeMenuScoring } from "../../src/logic/common";

describe("共通", () => {
  // SCEN-379
  test("献立案の最適化スコアリング機能 - 複数献立案の食材構成が確定した時点で、流通業者の在庫・価格データが照合される", async () => {
    // テストデータ: 複数の献立案
    const menuPlanA = {
      id: "menu_plan_001",
      name: "献立案A",
      status: "confirmed",
      ingredients: [
        { ingredient_id: "ing_001", name: "鶏肉", quantity: 500, unit: "g" },
        { ingredient_id: "ing_002", name: "人参", quantity: 200, unit: "g" },
      ],
    };

    const menuPlanB = {
      id: "menu_plan_002",
      name: "献立案B",
      status: "confirmed",
      ingredients: [
        { ingredient_id: "ing_001", name: "鶏肉", quantity: 400, unit: "g" },
        { ingredient_id: "ing_003", name: "キャベツ", quantity: 300, unit: "g" },
      ],
    };

    const menuPlanC = {
      id: "menu_plan_003",
      name: "献立案C",
      status: "confirmed",
      ingredients: [
        { ingredient_id: "ing_002", name: "人参", quantity: 250, unit: "g" },
        { ingredient_id: "ing_003", name: "キャベツ", quantity: 350, unit: "g" },
      ],
    };

    const menuPlans = [menuPlanA, menuPlanB, menuPlanC];

    // Mock: 流通業者の在庫・価格データベース
    const mockInventoryData = {
      ing_001: {
        ingredient_id: "ing_001",
        name: "鶏肉",
        stock_quantity: 1500,
        unit: "g",
        distributor: "流通業者A",
      },
      ing_002: {
        ingredient_id: "ing_002",
        name: "人参",
        stock_quantity: 800,
        unit: "g",
        distributor: "流通業者B",
      },
      ing_003: {
        ingredient_id: "ing_003",
        name: "キャベツ",
        stock_quantity: 2000,
        unit: "g",
        distributor: "流通業者C",
      },
    };

    const mockPriceData = {
      ing_001: {
        ingredient_id: "ing_001",
        name: "鶏肉",
        price: 1200,
        currency: "JPY",
        distributor: "流通業者A",
      },
      ing_002: {
        ingredient_id: "ing_002",
        name: "人参",
        price: 80,
        currency: "JPY",
        distributor: "流通業者B",
      },
      ing_003: {
        ingredient_id: "ing_003",
        name: "キャベツ",
        price: 150,
        currency: "JPY",
        distributor: "流通業者C",
      },
    };

    // 関数を実行
    const result = await optimizeMenuScoring(menuPlans, {
      inventoryData: mockInventoryData,
      priceData: mockPriceData,
    });

    // 検証1: 結果に複数献立案が含まれている
    expect(result.optimized_menus).toHaveLength(3);

    // 検証2: 献立案Aに対して在庫・価格データが紐付けられている
    const optimizedMenuA = result.optimized_menus.find(
      (m) => m.id === "menu_plan_001"
    );
    expect(optimizedMenuA).toBeDefined();
    expect(optimizedMenuA?.ingredients).toHaveLength(2);

    const menuA_ing001 = optimizedMenuA?.ingredients.find(
      (i) => i.ingredient_id === "ing_001"
    );
    expect(menuA_ing001?.stock_quantity).toBe(1500);
    expect(menuA_ing001?.price).toBe(1200);
    expect(menuA_ing001?.distributor).toBe("流通業者A");

    const menuA_ing002 = optimizedMenuA?.ingredients.find(
      (i) => i.ingredient_id === "ing_002"
    );
    expect(menuA_ing002?.stock_quantity).toBe(800);
    expect(menuA_ing002?.price).toBe(80);
    expect(menuA_ing002?.distributor).toBe("流通業者B");

    // 検証3: 献立案Bに対して在庫・価格データが紐付けられている
    const optimizedMenuB = result.optimized_menus.find(
      (m) => m.id === "menu_plan_002"
    );
    expect(optimizedMenuB).toBeDefined();
    expect(optimizedMenuB?.ingredients).toHaveLength(2);

    const menuB_ing001 = optimizedMenuB?.ingredients.find(
      (i) => i.ingredient_id === "ing_001"
    );
    expect(menuB_ing001?.stock_quantity).toBe(1500);
    expect(menuB_ing001?.price).toBe(1200);

    const menuB_ing003 = optimizedMenuB?.ingredients.find(
      (i) => i.ingredient_id === "ing_003"
    );
    expect(menuB_ing003?.stock_quantity).toBe(2000);
    expect(menuB_ing003?.price).toBe(150);
    expect(menuB_ing003?.distributor).toBe("流通業者C");

    // 検証4: 献立案Cに対して在庫・価格データが紐付けられている
    const optimizedMenuC = result.optimized_menus.find(
      (m) => m.id === "menu_plan_003"
    );
    expect(optimizedMenuC).toBeDefined();
    expect(optimizedMenuC?.ingredients).toHaveLength(2);

    const menuC_ing002 = optimizedMenuC?.ingredients.find(
      (i) => i.ingredient_id === "ing_002"
    );
    expect(menuC_ing002?.stock_quantity).toBe(800);
    expect(menuC_ing002?.price).toBe(80);

    const menuC_ing003 = optimizedMenuC?.ingredients.find(
      (i) => i.ingredient_id === "ing_003"
    );
    expect(menuC_ing003?.stock_quantity).toBe(2000);
    expect(menuC_ing003?.price).toBe(150);

    // 検証5: すべての献立案について照合が完了した状態
    expect(result.completion_status).toBe("completed");
    expect(result.reconciliation_timestamp).toBeDefined();

    // 検証6: 各献立案のスコアが計算されている
    result.optimized_menus.forEach((menu) => {
      expect(menu.optimization_score).toBeDefined();
      expect(typeof menu.optimization_score).toBe("number");
      expect(menu.optimization_score).toBeGreaterThanOrEqual(0);
      expect(menu.optimization_score).toBeLessThanOrEqual(100);
    });

    // 検証7: 食材の在庫と要求数量を比較して可能性を判定
    expect(optimizedMenuA?.is_feasible).toBe(true); // 鶏肉500g ≤ 在庫1500g, 人参200g ≤ 在庫800g
    expect(optimizedMenuB?.is_feasible).toBe(true); // 鶏肉400g ≤ 在庫1500g, キャベツ300g ≤ 在庫2000g
    expect(optimizedMenuC?.is_feasible).toBe(true); // 人参250g ≤ 在庫800g, キャベツ350g ≤ 在庫2000g
  });
});