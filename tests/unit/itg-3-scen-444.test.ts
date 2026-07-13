import { calculateFoodExpenseReductionEffect } from '../../src/logic/it-1-br-3-2-1';

describe('購入実績の記録と月次食費削減効果の自動集計・分析機能', () => {
  // SCEN-444: [edge] SLA超過時の遅延対応と暫定処理 - SLA経過時間が定義値のちょうど境界時点で、正常フロー終了と遅延処理の振り分けが正確に判定される
  test('SLA境界値での処理振り分けが一貫して正常に実行される', () => {
    const SLA_THRESHOLD_SECONDS = 300;
    const TEST_ITERATIONS = 5;
    const results: Array<{
      iteration: number;
      start_timestamp: string;
      elapsed_seconds: number;
      processing_status: string;
      routed_to: string;
      log_timestamp: string;
    }> = [];

    for (let i = 0; i < TEST_ITERATIONS; i++) {
      const start_time_string = '2024-01-15T10:00:00Z';
      const boundary_time_string = '2024-01-15T10:05:00Z';
      
      const elapsed_time_ms =
        new Date(boundary_time_string).getTime() -
        new Date(start_time_string).getTime();
      const elapsed_seconds = elapsed_time_ms / 1000;

      const purchase_records = [
        {
          purchase_id: `purchase_${i}_001`,
          user_id: 'user_household_001',
          purchase_date: '2024-01-15',
          purchase_amount: 4500,
          vendor_id: 'supermarket_alpha_001',
          items_count: 12,
        },
        {
          purchase_id: `purchase_${i}_002`,
          user_id: 'user_household_001',
          purchase_date: '2024-01-16',
          purchase_amount: 3200,
          vendor_id: 'supermarket_alpha_001',
          items_count: 8,
        },
        {
          purchase_id: `purchase_${i}_003`,
          user_id: 'user_household_001',
          purchase_date: '2024-01-17',
          purchase_amount: 2800,
          vendor_id: 'supermarket_beta_001',
          items_count: 7,
        },
      ];

      const monthly_budget = 25000;
      const target_month = '2024-01';

      const result = calculateFoodExpenseReductionEffect({
        purchase_records,
        monthly_budget,
        target_month,
        process_start_timestamp: start_time_string,
        process_boundary_timestamp: boundary_time_string,
        sla_threshold_seconds: SLA_THRESHOLD_SECONDS,
      });

      const is_at_boundary = elapsed_seconds === SLA_THRESHOLD_SECONDS;
      const routed_flow =
        elapsed_seconds <= SLA_THRESHOLD_SECONDS
          ? 'normal_flow'
          : 'fallback_flow';

      results.push({
        iteration: i,
        start_timestamp: start_time_string,
        elapsed_seconds,
        processing_status: is_at_boundary ? 'boundary_exact' : 'normal',
        routed_to: routed_flow,
        log_timestamp: result.process_completion_timestamp,
      });

      expect(result).toBeDefined();
      expect(result.total_purchase_amount).toBe(10500);
      expect(result.budget_utilization_rate).toBe(0.42);
      expect(result.remaining_budget).toBe(14500);
      expect(result.purchase_count).toBe(3);
      expect(result.process_elapsed_seconds).toBe(300);
      expect(result.sla_decision).toBe('normal_flow');
      expect(result.process_completion_timestamp).toBe(boundary_time_string);
    }

    // 全テスト実行結果の一貫性を検証
    const routing_decisions = results.map((r) => r.routed_to);
    const all_decisions_consistent = routing_decisions.every(
      (d) => d === routing_decisions[0]
    );
    expect(all_decisions_consistent).toBe(true);

    const all_routed_to_normal = routing_decisions.every(
      (d) => d === 'normal_flow'
    );
    expect(all_routed_to_normal).toBe(true);

    const completion_timestamps = results.map((r) => r.log_timestamp);
    const all_timestamps_valid = completion_timestamps.every(
      (ts) => ts === '2024-01-15T10:05:00Z'
    );
    expect(all_timestamps_valid).toBe(true);

    // 複数回実行の中で処理統計が一致することを検証
    const first_result = results[0];
    const last_result = results[TEST_ITERATIONS - 1];
    expect(first_result.elapsed_seconds).toBe(last_result.elapsed_seconds);
    expect(first_result.routed_to).toBe(last_result.routed_to);

    // SLA境界値の正確性を検証
    results.forEach((res) => {
      expect(res.elapsed_seconds).toBe(300);
    });
  });
});