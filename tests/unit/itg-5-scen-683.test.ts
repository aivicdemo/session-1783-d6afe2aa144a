import { calculateNutrientPriorityOrder } from "../../src/logic/it-7-2-1";

describe("it-7-2-1: 栄養項目別乖離度定量化と優先度順序決定", () => {
  // SCEN-683: [normal] 栄養項目別乖離度定量化 - 複数栄養項目の乖離度から優先度順序を正確に決定する
  test("should calculate nutrient divergence rates and assign priority order based on absolute divergence magnitude", () => {
    // テストデータ: 複数栄養項目の目標値と実績値
    const nutrient_items = [
      { nutrient_id: "P001", nutrient_name: "タンパク質", target_value: 50, actual_value: 40 },
      { nutrient_id: "F002", nutrient_name: "脂質", target_value: 60, actual_value: 75 },
      { nutrient_id: "C003", nutrient_name: "炭水化物", target_value: 300, actual_value: 280 },
      { nutrient_id: "Na004", nutrient_name: "ナトリウム", target_value: 2500, actual_value: 3200 },
      { nutrient_id: "Ca005", nutrient_name: "カルシウム", target_value: 800, actual_value: 650 },
    ];

    // 期待値の計算:
    // タンパク質: (40 - 50) / 50 * 100 = -20% → 絶対値 20%
    // 脂質: (75 - 60) / 60 * 100 = 25% → 絶対値 25%
    // 炭水化物: (280 - 300) / 300 * 100 = -6.67% → 絶対値 6.67%
    // ナトリウム: (3200 - 2500) / 2500 * 100 = 28% → 絶対値 28%
    // カルシウム: (650 - 800) / 800 * 100 = -18.75% → 絶対値 18.75%
    // 
    // 乖離度の絶対値が大きい順にソート:
    // 1. ナトリウム: 28%
    // 2. 脂質: 25%
    // 3. タンパク質: 20%
    // 4. カルシウム: 18.75%
    // 5. 炭水化物: 6.67%

    const result = calculateNutrientPriorityOrder(nutrient_items);

    expect(result).toEqual([
      { nutrient_id: "Na004", nutrient_name: "ナトリウム", divergence_rate: 28, priority: 1 },
      { nutrient_id: "F002", nutrient_name: "脂質", divergence_rate: 25, priority: 2 },
      { nutrient_id: "P001", nutrient_name: "タンパク質", divergence_rate: 20, priority: 3 },
      { nutrient_id: "Ca005", nutrient_name: "カルシウム", divergence_rate: 18.75, priority: 4 },
      { nutrient_id: "C003", nutrient_name: "炭水化物", divergence_rate: 6.67, priority: 5 },
    ]);

    // パターン2: 同等の乖離度を持つ項目が存在するケース
    const nutrient_items_equal_divergence = [
      { nutrient_id: "A001", nutrient_name: "項目A", target_value: 100, actual_value: 80 },
      { nutrient_id: "B002", nutrient_name: "項目B", target_value: 100, actual_value: 80 },
      { nutrient_id: "C003", nutrient_name: "項目C", target_value: 50, actual_value: 45 },
    ];

    // 期待値の計算:
    // 項目A: (80 - 100) / 100 * 100 = -20% → 絶対値 20%
    // 項目B: (80 - 100) / 100 * 100 = -20% → 絶対値 20%
    // 項目C: (45 - 50) / 50 * 100 = -10% → 絶対値 10%
    //
    // 乖離度が同等の場合、入力順序で安定的に順序付けられることを確認

    const result_equal = calculateNutrientPriorityOrder(nutrient_items_equal_divergence);

    expect(result_equal).toHaveLength(3);
    expect(result_equal[0].priority).toBe(1);
    expect(result_equal[1].priority).toBe(2);
    expect(result_equal[2].priority).toBe(3);
    // 同等乖離度の項目は入力順序を保持
    expect(result_equal[0].nutrient_id).toBe("A001");
    expect(result_equal[1].nutrient_id).toBe("B002");
    expect(result_equal[2].nutrient_id).toBe("C003");

    // パターン3: 乖離度が大きい項目が混在するケース
    const nutrient_items_mixed = [
      { nutrient_id: "P001", nutrient_name: "タンパク質", target_value: 50, actual_value: 10 },
      { nutrient_id: "F002", nutrient_name: "脂質", target_value: 60, actual_value: 61 },
      { nutrient_id: "C003", nutrient_name: "炭水化物", target_value: 300, actual_value: 600 },
    ];

    // 期待値の計算:
    // タンパク質: (10 - 50) / 50 * 100 = -80% → 絶対値 80%
    // 脂質: (61 - 60) / 60 * 100 = 1.67% → 絶対値 1.67%
    // 炭水化物: (600 - 300) / 300 * 100 = 100% → 絶対値 100%
    //
    // 乖離度の絶対値が大きい順:
    // 1. 炭水化物: 100%
    // 2. タンパク質: 80%
    // 3. 脂質: 1.67%

    const result_mixed = calculateNutrientPriorityOrder(nutrient_items_mixed);

    expect(result_mixed).toEqual([
      { nutrient_id: "C003", nutrient_name: "炭水化物", divergence_rate: 100, priority: 1 },
      { nutrient_id: "P001", nutrient_name: "タンパク質", divergence_rate: 80, priority: 2 },
      { nutrient_id: "F002", nutrient_name: "脂質", divergence_rate: 1.67, priority: 3 },
    ]);

    // パターン4: 単一栄養項目
    const nutrient_items_single = [
      { nutrient_id: "P001", nutrient_name: "タンパク質", target_value: 50, actual_value: 55 },
    ];

    // 期待値の計算:
    // タンパク質: (55 - 50) / 50 * 100 = 10% → 絶対値 10%

    const result_single = calculateNutrientPriorityOrder(nutrient_items_single);

    expect(result_single).toEqual([
      { nutrient_id: "P001", nutrient_name: "タンパク質", divergence_rate: 10, priority: 1 },
    ]);

    // パターン5: 複数項目で乖離度がゼロに近いケース（すべて目標値に達している）
    const nutrient_items_zero_divergence = [
      { nutrient_id: "P001", nutrient_name: "タンパク質", target_value: 50, actual_value: 50 },
      { nutrient_id: "F002", nutrient_name: "脂質", target_value: 60, actual_value: 60 },
      { nutrient_id: "C003", nutrient_name: "炭水化物", target_value: 300, actual_value: 300 },
    ];

    // 期待値の計算:
    // すべて乖離度 0%
    // 入力順序を保持

    const result_zero = calculateNutrientPriorityOrder(nutrient_items_zero_divergence);

    expect(result_zero).toHaveLength(3);
    expect(result_zero.every((item) => item.divergence_rate === 0)).toBe(true);
    expect(result_zero[0].nutrient_id).toBe("P001");
    expect(result_zero[1].nutrient_id).toBe("F002");
    expect(result_zero[2].nutrient_id).toBe("C003");
  });
});