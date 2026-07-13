import { analyzeMonthlyCostOverageFactors } from "../../src/logic/it-1-br-3-2-1";

describe("購入実績の記録と月次食費削減効果の自動集計・分析機能", () => {
  // SCEN-413: [edge] 月次食費実績の超過要因分析機能 - 月初日と月末日の購入記録を含めて正確に集計される
  test("月初日と月末日の購入記録を含めて月次食費実績が正確に集計され、超過要因分析に反映される", () => {
    const purchase_records = [
      {
        purchase_id: "p1",
        purchase_date: new Date("2024-01-01T10:30:00Z"),
        amount: 1000,
        category: "vegetables",
        store_name: "supermarket_a",
      },
      {
        purchase_id: "p2",
        purchase_date: new Date("2024-01-15T14:45:00Z"),
        amount: 1500,
        category: "meat",
        store_name: "supermarket_a",
      },
      {
        purchase_id: "p3",
        purchase_date: new Date("2024-01-20T09:20:00Z"),
        amount: 1200,
        category: "dairy",
        store_name: "supermarket_b",
      },
      {
        purchase_id: "p4",
        purchase_date: new Date("2024-01-31T18:00:00Z"),
        amount: 2000,
        category: "fruits",
        store_name: "supermarket_c",
      },
    ];

    const monthly_budget = 5000;
    const target_year = 2024;
    const target_month = 1;

    const result = analyzeMonthlyCostOverageFactors({
      purchase_records,
      monthly_budget,
      target_year,
      target_month,
    });

    // 月次集計結果の総額を検証：5,700円
    expect(result.total_amount).toBe(5700);

    // 月初日（1日）の購入記録がカウントされているか確認
    const first_day_purchase = result.purchases_by_date.find(
      (p) => p.purchase_date === "2024-01-01"
    );
    expect(first_day_purchase).toBeDefined();
    expect(first_day_purchase?.amount).toBe(1000);
    expect(first_day_purchase?.count).toBe(1);

    // 月末日（31日）の購入記録がカウントされているか確認
    const last_day_purchase = result.purchases_by_date.find(
      (p) => p.purchase_date === "2024-01-31"
    );
    expect(last_day_purchase).toBeDefined();
    expect(last_day_purchase?.amount).toBe(2000);
    expect(last_day_purchase?.count).toBe(1);

    // 月初日と月末日の記録が重複なく集計されているか確認
    expect(result.purchases_by_date.length).toBe(4);
    const total_from_breakdown = result.purchases_by_date.reduce(
      (sum, p) => sum + p.amount,
      0
    );
    expect(total_from_breakdown).toBe(5700);

    // 超過要因分析において、月初日と月末日の購入が適切に要因分析の対象に含まれているか確認
    expect(result.is_over_budget).toBe(true);
    expect(result.overage_amount).toBe(700); // 5700 - 5000
    expect(result.overage_rate).toBe(14); // (700 / 5000) * 100 = 14%

    // カテゴリ別内訳で月初日と月末日の購入が含まれているか確認
    const category_breakdown = result.category_breakdown;
    expect(category_breakdown).toContainEqual(
      expect.objectContaining({
        category: "vegetables",
        total_amount: 1000,
      })
    );
    expect(category_breakdown).toContainEqual(
      expect.objectContaining({
        category: "fruits",
        total_amount: 2000,
      })
    );

    // すべてのカテゴリの合計が正確であることを確認
    const category_total = category_breakdown.reduce(
      (sum, c) => sum + c.total_amount,
      0
    );
    expect(category_total).toBe(5700);

    // 超過要因分析結果の構造を検証
    expect(result.top_factors).toBeDefined();
    expect(Array.isArray(result.top_factors)).toBe(true);
    expect(result.top_factors.length).toBeGreaterThan(0);

    // トップファクターに含まれる要因の優先度が正しく計算されているか確認
    result.top_factors.forEach((factor) => {
      expect(factor.factor_type).toBeDefined();
      expect(factor.impact_amount).toBeGreaterThanOrEqual(0);
      expect(factor.priority_score).toBeGreaterThanOrEqual(0);
      expect(factor.priority_score).toBeLessThanOrEqual(100);
    });

    // 対象期間が正確に設定されているか確認
    expect(result.period_start).toBe("2024-01-01");
    expect(result.period_end).toBe("2024-01-31");
  });
});