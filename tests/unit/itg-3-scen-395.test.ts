import { calculateMonthlySpendingReductionEffect } from '../../src/logic/it-1-br-6-2-1-1';

describe('Monthly Spending Reduction Effect Calculation - Distributor Priority', () => {
  // SCEN-395
  test('should determine purchase priority based on preset priority order when all distributors have identical prices', () => {
    const distributor_a = {
      distributor_id: 'DIST_A',
      distributor_name: 'Distributor A',
      priority_order: 1,
      price: 1000,
    };

    const distributor_b = {
      distributor_id: 'DIST_B',
      distributor_name: 'Distributor B',
      priority_order: 2,
      price: 1000,
    };

    const distributor_c = {
      distributor_id: 'DIST_C',
      distributor_name: 'Distributor C',
      priority_order: 3,
      price: 1000,
    };

    const distributors = [distributor_a, distributor_b, distributor_c];

    const purchase_records = [
      {
        record_id: 'REC_001',
        distributor_id: 'DIST_A',
        ingredient_name: 'Tomato',
        quantity: 10,
        unit_price: 1000,
        total_cost: 10000,
        purchase_date: '2024-01-15',
      },
      {
        record_id: 'REC_002',
        distributor_id: 'DIST_B',
        ingredient_name: 'Tomato',
        quantity: 10,
        unit_price: 1000,
        total_cost: 10000,
        purchase_date: '2024-01-15',
      },
      {
        record_id: 'REC_003',
        distributor_id: 'DIST_C',
        ingredient_name: 'Tomato',
        quantity: 10,
        unit_price: 1000,
        total_cost: 10000,
        purchase_date: '2024-01-15',
      },
    ];

    const monthly_budget = 50000;
    const analysis_month = '2024-01';

    const result = calculateMonthlySpendingReductionEffect({
      distributors,
      purchase_records,
      monthly_budget,
      analysis_month,
    });

    // 価格が同一の場合、優先順位1のDistributor Aが第一候補として選択される
    expect(result.recommended_primary_distributor_id).toBe('DIST_A');
    expect(result.recommended_primary_distributor_name).toBe('Distributor A');
    expect(result.recommended_primary_priority_order).toBe(1);

    // 優先順位に基づいた流通業者リストが正しく出力される
    expect(result.distributor_priority_list).toEqual([
      {
        distributor_id: 'DIST_A',
        distributor_name: 'Distributor A',
        priority_order: 1,
        price: 1000,
      },
      {
        distributor_id: 'DIST_B',
        distributor_name: 'Distributor B',
        priority_order: 2,
        price: 1000,
      },
      {
        distributor_id: 'DIST_C',
        distributor_name: 'Distributor C',
        priority_order: 3,
        price: 1000,
      },
    ]);

    // 月次食費削減効果レポートで優先順位順の流通業者リストが出力される
    expect(result.monthly_report.recommended_purchase_priority_order).toEqual([
      'DIST_A',
      'DIST_B',
      'DIST_C',
    ]);

    // 総購入コストの計算（全流通業者で30,000円）
    expect(result.total_monthly_purchase_cost).toBe(30000);

    // 予算に対する達成度を計算（30,000 / 50,000 = 60%）
    expect(result.budget_achievement_rate).toBe(60);

    // 削減余地がない場合、余地は0として計算（50,000 - 30,000 = 20,000）
    expect(result.potential_reduction_amount).toBe(20000);

    // 価格が同一の場合、価格に基づく削減効果は0
    expect(result.price_based_reduction_amount).toBe(0);

    // 優先順位に基づいて購入先を集約した場合の最適コスト
    // Distributor Aの優先度が最も高いため、全購入をDist Aに統一した場合のシミュレーション
    expect(result.optimized_total_cost_if_consolidated_to_top_priority).toBe(
      10000
    );
  });
});