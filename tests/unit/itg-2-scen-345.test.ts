import { calculateNutritionAchievementAndGaps } from "../../src/logic/it-1-br-2-1-1-1";

describe("栄養項目別達成度計算と改善ギャップ優先度付け可視化", () => {
  // SCEN-345: 目標値が0の栄養項目について達成度が計算されず、「計算不可」として適切に処理される
  test("目標値が0の栄養項目で達成度計算不可、ダッシュボード表示と改善ギャップ除外を確認", () => {
    const user_id = "test-user-001";
    const nutrition_items = [
      {
        nutrition_id: "potassium-001",
        nutrition_name: "カリウム",
        unit: "mg",
        target_value: 0,
        actual_value: 100,
      },
      {
        nutrition_id: "calcium-001",
        nutrition_name: "カルシウム",
        unit: "mg",
        target_value: 800,
        actual_value: 600,
      },
      {
        nutrition_id: "iron-001",
        nutrition_name: "鉄",
        unit: "mg",
        target_value: 8,
        actual_value: 12,
      },
    ];
    const analysis_date = "2024-03-15";
    const system_logs: string[] = [];

    const result = calculateNutritionAchievementAndGaps(
      user_id,
      nutrition_items,
      analysis_date,
      (log: string) => system_logs.push(log)
    );

    // 目標値0の項目は「計算不可」と表示される
    const potassium_result = result.achievement_scores.find(
      (item) => item.nutrition_id === "potassium-001"
    );
    expect(potassium_result).toBeDefined();
    expect(potassium_result?.achievement_percentage).toBe(null);
    expect(potassium_result?.display_status).toBe("計算不可");

    // 目標値が有効な項目は達成度が計算される
    const calcium_result = result.achievement_scores.find(
      (item) => item.nutrition_id === "calcium-001"
    );
    expect(calcium_result).toBeDefined();
    expect(calcium_result?.achievement_percentage).toBe(75); // (600/800)*100
    expect(calcium_result?.display_status).toBe("達成");

    const iron_result = result.achievement_scores.find(
      (item) => item.nutrition_id === "iron-001"
    );
    expect(iron_result).toBeDefined();
    expect(iron_result?.achievement_percentage).toBe(100); // (12/8)*100 = 150 → cap at 100 or report as exceeded
    expect(iron_result?.display_status).toBe("達成");

    // 改善ギャップの優先度付けで目標値0の項目は除外される
    const gaps_list = result.improvement_gaps;
    const potassium_gap = gaps_list.find(
      (item) => item.nutrition_id === "potassium-001"
    );
    expect(potassium_gap).toBeUndefined();

    // カルシウムは不足のため優先度リストに含まれる
    const calcium_gap = gaps_list.find(
      (item) => item.nutrition_id === "calcium-001"
    );
    expect(calcium_gap).toBeDefined();
    expect(calcium_gap?.gap_value).toBe(200); // 800 - 600
    expect(calcium_gap?.priority_rank).toBe(1);

    // システムログにゼロ除算警告が記録される
    const zero_division_log = system_logs.find((log) =>
      /ゼロ除算|zero.*division|目標値.*0/i.test(log)
    );
    expect(zero_division_log).toBeDefined();

    // ダッシュボード表示用構造で計算不可項目が正しく標記される
    const dashboard_view = result.dashboard_display;
    const potassium_dashboard = dashboard_view.find(
      (item) => item.nutrition_id === "potassium-001"
    );
    expect(potassium_dashboard?.label).toBe("カリウム");
    expect(potassium_dashboard?.value_display).toBe("計算不可");
    expect(potassium_dashboard?.is_calculable).toBe(false);

    // 正常項目はダッシュボードに表示される
    const calcium_dashboard = dashboard_view.find(
      (item) => item.nutrition_id === "calcium-001"
    );
    expect(calcium_dashboard?.is_calculable).toBe(true);
    expect(calcium_dashboard?.achievement_rate).toBe(75);

    // エラーハンドリング後もシステムは正常に動作（戻り値が完全）
    expect(result.status).toBe("success_with_warnings");
    expect(result.error_count).toBe(1); // 目標値0 → 1件のエラーハンドリング
    expect(result.processed_date).toBe("2024-03-15");
  });
});