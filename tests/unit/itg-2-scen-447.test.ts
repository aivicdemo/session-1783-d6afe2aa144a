import { calculateDashboardMetrics } from "../../src/logic/it-1-br-2-1-1-1";

describe("ユーザーの食事記録と栄養摂取量の推移データ自動集計ダッシュボード機能", () => {
  // SCEN-447: [normal] ダッシュボード表示データの自動更新機能
  test("最新の献立実績と購入記録に基づいてダッシュボード表示データが自動更新される", () => {
    // 初期状態：ダッシュボード表示用の献立実績データ
    const initialMealRecords = [
      {
        meal_record_id: 1,
        user_id: 101,
        meal_date: "2024-01-15",
        meal_type: "breakfast",
        total_calories: 400,
        timestamp: "2024-01-15T08:30:00Z",
      },
      {
        meal_record_id: 2,
        user_id: 101,
        meal_date: "2024-01-15",
        meal_type: "lunch",
        total_calories: 650,
        timestamp: "2024-01-15T12:00:00Z",
      },
    ];

    // 初期状態：購入記録データ
    const initialPurchaseRecords = [
      {
        purchase_record_id: 1,
        user_id: 101,
        purchase_date: "2024-01-14",
        purchase_amount: 3500,
        item_count: 12,
        timestamp: "2024-01-14T14:30:00Z",
      },
    ];

    // 初期ダッシュボード集計
    const initialDashboard = calculateDashboardMetrics(
      initialMealRecords,
      initialPurchaseRecords,
      "2024-01-15"
    );

    // 初期表示状態の検証
    expect(initialDashboard.total_calories).toBe(1050);
    expect(initialDashboard.meal_count).toBe(2);
    expect(initialDashboard.total_purchase_amount).toBe(3500);
    expect(initialDashboard.total_items_purchased).toBe(12);
    expect(initialDashboard.last_updated).toBe("2024-01-15T12:00:00Z");

    // 献立実績データベースに新しい献立記録を追加
    const updatedMealRecords = [
      ...initialMealRecords,
      {
        meal_record_id: 3,
        user_id: 101,
        meal_date: "2024-01-15",
        meal_type: "dinner",
        total_calories: 720,
        timestamp: "2024-01-15T18:45:00Z",
      },
    ];

    // 購入記録データベースに新しい購入データを追加
    const updatedPurchaseRecords = [
      ...initialPurchaseRecords,
      {
        purchase_record_id: 2,
        user_id: 101,
        purchase_date: "2024-01-15",
        purchase_amount: 2800,
        item_count: 9,
        timestamp: "2024-01-15T17:20:00Z",
      },
    ];

    // 更新後のダッシュボード集計
    const updatedDashboard = calculateDashboardMetrics(
      updatedMealRecords,
      updatedPurchaseRecords,
      "2024-01-15"
    );

    // ダッシュボード上の栄養分析グラフが更新されたことを確認
    expect(updatedDashboard.total_calories).toBe(1770); // 400 + 650 + 720
    expect(updatedDashboard.meal_count).toBe(3); // 3 meals

    // 集計データ（総カロリー、栄養素合計など）が新しい値に更新されていることを確認
    expect(updatedDashboard.average_calories_per_meal).toBe(590); // 1770 / 3

    // 購入記録の集計結果（購入額合計、商品数など）が反映されていることを確認
    expect(updatedDashboard.total_purchase_amount).toBe(6300); // 3500 + 2800
    expect(updatedDashboard.total_items_purchased).toBe(21); // 12 + 9

    // 複数の献立実績と購入記録を同時に追加した場合、
    // すべてのデータが正しく集計・表示されることを確認
    const multipleUpdatedMealRecords = [
      ...updatedMealRecords,
      {
        meal_record_id: 4,
        user_id: 101,
        meal_date: "2024-01-16",
        meal_type: "breakfast",
        total_calories: 420,
        timestamp: "2024-01-16T08:15:00Z",
      },
    ];

    const multipleUpdatedPurchaseRecords = [
      ...updatedPurchaseRecords,
      {
        purchase_record_id: 3,
        user_id: 101,
        purchase_date: "2024-01-16",
        purchase_amount: 4200,
        item_count: 15,
        timestamp: "2024-01-16T16:00:00Z",
      },
    ];

    const multipleUpdateDashboard = calculateDashboardMetrics(
      multipleUpdatedMealRecords,
      multipleUpdatedPurchaseRecords,
      "2024-01-15"
    );

    // 2024-01-15のデータのみでの集計（date_filter = "2024-01-15"）
    expect(multipleUpdateDashboard.total_calories).toBe(1770); // 初期から変わらない（date_filterが2024-01-15）
    expect(multipleUpdateDashboard.meal_count).toBe(3);
    expect(multipleUpdateDashboard.total_purchase_amount).toBe(6300);
    expect(multipleUpdateDashboard.total_items_purchased).toBe(21);

    // 更新前後のタイムスタンプを確認し、最新のデータが表示されていることを検証
    expect(updatedDashboard.last_updated).toBe("2024-01-15T18:45:00Z");
    expect(updatedDashboard.last_purchase_updated).toBe("2024-01-15T17:20:00Z");

    // 整合性チェック：集計値がデータセットと一致
    expect(updatedDashboard.total_calories).toBe(
      updatedMealRecords
        .filter((m) => m.meal_date === "2024-01-15")
        .reduce((sum, m) => sum + m.total_calories, 0)
    );

    expect(updatedDashboard.total_purchase_amount).toBe(
      updatedPurchaseRecords
        .filter((p) => p.purchase_date === "2024-01-15")
        .reduce((sum, p) => sum + p.purchase_amount, 0)
    );

    // グラフ用データ構造の検証
    expect(updatedDashboard.meal_timeline).toBeDefined();
    expect(Array.isArray(updatedDashboard.meal_timeline)).toBe(true);
    expect(updatedDashboard.meal_timeline.length).toBe(3);

    expect(updatedDashboard.purchase_timeline).toBeDefined();
    expect(Array.isArray(updatedDashboard.purchase_timeline)).toBe(true);
    expect(updatedDashboard.purchase_timeline.length).toBe(2);

    // 時系列順序の確認
    const sortedMealTimeline = updatedDashboard.meal_timeline;
    expect(sortedMealTimeline[0].timestamp).toBe("2024-01-15T08:30:00Z");
    expect(sortedMealTimeline[1].timestamp).toBe("2024-01-15T12:00:00Z");
    expect(sortedMealTimeline[2].timestamp).toBe("2024-01-15T18:45:00Z");

    // 栄養分析の正確性
    expect(updatedDashboard.nutrition_summary).toBeDefined();
    expect(updatedDashboard.nutrition_summary.total_daily_calories).toBe(1770);
    expect(updatedDashboard.nutrition_summary.meals_logged).toBe(3);

    // 購入分析の正確性
    expect(updatedDashboard.purchase_summary).toBeDefined();
    expect(updatedDashboard.purchase_summary.total_expenditure).toBe(6300);
    expect(updatedDashboard.purchase_summary.transactions_count).toBe(2);
    expect(updatedDashboard.purchase_summary.average_transaction_amount).toBe(
      3150
    ); // 6300 / 2
  });
});