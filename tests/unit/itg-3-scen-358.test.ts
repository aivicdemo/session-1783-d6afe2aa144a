import { analyzeMonthlyExpenseBreakdown } from "../../src/logic/it-1-br-6-2-1-1";

describe("Monthly Expense Breakdown Analysis - Micro Price Variance", () => {
  test("SCEN-358: Micro price variance (< 0.01%) is accurately reflected in expense breakdown analysis", () => {
    // Setup: Base month with product A at 1,000 yen per unit
    const base_month_data = {
      product_id: "PROD_A",
      base_unit_price: 1000.0,
      base_quantity: 100,
      base_total: 100000,
    };

    // Test month with product A at 1,000.05 yen (0.005% variance)
    const test_month_data = {
      product_id: "PROD_A",
      test_unit_price: 1000.05,
      test_quantity: 100,
      test_total: 100005,
    };

    // Expected calculation:
    // Price variance per unit: 1000.05 - 1000.0 = 0.05 yen
    // Variance percentage: (0.05 / 1000.0) * 100 = 0.005%
    // Total excess by unit price: 0.05 * 100 = 5 yen (NOT 50 as in initial spec, corrected to actual calculation)
    // Actual total variance: 100005 - 100000 = 5 yen

    const breakdown_result = analyzeMonthlyExpenseBreakdown({
      baseline_month: base_month_data,
      test_month: test_month_data,
      products: [
        {
          id: "PROD_A",
          base_price: 1000.0,
          test_price: 1000.05,
          quantity: 100,
        },
      ],
    });

    // Verify micro price variance is accurately captured
    expect(breakdown_result.unit_price_variance).toBe(0.05);
    expect(breakdown_result.variance_percentage).toBe(0.005);
    expect(breakdown_result.total_excess_by_unit_price).toBe(5);

    // Verify no rounding errors occur
    expect(breakdown_result.total_excess_by_unit_price).toStrictEqual(5);

    // Test with multiple products having micro variances
    const multi_product_breakdown = analyzeMonthlyExpenseBreakdown({
      baseline_month: {
        products: [
          {
            id: "PROD_A",
            base_price: 1000.0,
            quantity: 100,
          },
          {
            id: "PROD_B",
            base_price: 500.0,
            quantity: 50,
          },
          {
            id: "PROD_C",
            base_price: 2000.0,
            quantity: 25,
          },
        ],
      },
      test_month: {
        products: [
          {
            id: "PROD_A",
            test_price: 1000.05,
            quantity: 100,
          },
          {
            id: "PROD_B",
            test_price: 500.003,
            quantity: 50,
          },
          {
            id: "PROD_C",
            test_price: 2000.02,
            quantity: 25,
          },
        ],
      },
    });

    // Verify cumulative micro variance calculations:
    // PROD_A: (1000.05 - 1000.0) * 100 = 5 yen
    // PROD_B: (500.003 - 500.0) * 50 = 0.15 yen
    // PROD_C: (2000.02 - 2000.0) * 25 = 0.5 yen
    // Total: 5 + 0.15 + 0.5 = 5.65 yen

    expect(multi_product_breakdown.cumulative_excess).toBe(5.65);
    expect(multi_product_breakdown.breakdown_by_product).toEqual([
      {
        product_id: "PROD_A",
        excess_amount: 5,
        variance_percentage: 0.005,
      },
      {
        product_id: "PROD_B",
        excess_amount: 0.15,
        variance_percentage: 0.0006,
      },
      {
        product_id: "PROD_C",
        excess_amount: 0.5,
        variance_percentage: 0.0025,
      },
    ]);

    // Verify export functionality preserves micro data without precision loss
    const exported_report = breakdown_result.export_report({
      format: "json",
      precision: 10,
    });

    expect(exported_report.unit_price_variance).toBe(0.05);
    expect(exported_report.variance_percentage).toBe(0.005);
    expect(exported_report.total_excess_by_unit_price).toBe(5);

    // Verify that micro variance below 0.01% threshold is still accurately recorded
    const ultra_micro_variance = analyzeMonthlyExpenseBreakdown({
      baseline_month: {
        products: [
          {
            id: "PROD_D",
            base_price: 5000.0,
            quantity: 20,
          },
        ],
      },
      test_month: {
        products: [
          {
            id: "PROD_D",
            test_price: 5000.0001,
            quantity: 20,
          },
        ],
      },
    });

    // Variance: (5000.0001 - 5000.0) * 20 = 0.002 yen
    // Variance percentage: (0.0001 / 5000.0) * 100 = 0.000002% (< 0.01%)

    expect(ultra_micro_variance.total_excess_by_unit_price).toBe(0.002);
    expect(ultra_micro_variance.variance_percentage).toBeLessThan(0.01);
    expect(ultra_micro_variance.export_report({ format: "json" })).toEqual(
      expect.objectContaining({
        total_excess_by_unit_price: 0.002,
      })
    );
  });
});