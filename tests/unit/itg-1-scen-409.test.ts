import { aggregateMonthlySatisfactionScore, generateNextMonthProposalConditions } from '../../src/logic/it-3';

describe('月次食費集計・提案機能 - 満足度スコア欠落時の処理', () => {
  // SCEN-409
  test('満足度スコアが全て欠落している場合、集計では空値として次月提案条件に反映される', () => {
    // 当月の複数献立レコード（全て満足度スコア = null）
    const current_month_menus = [
      {
        menu_id: 'menu_001',
        menu_date: '2024-01-15',
        satisfaction_score: null,
        completion_rate: 85,
        total_cost: 1200,
      },
      {
        menu_id: 'menu_002',
        menu_date: '2024-01-22',
        satisfaction_score: null,
        completion_rate: 90,
        total_cost: 1100,
      },
      {
        menu_id: 'menu_003',
        menu_date: '2024-01-29',
        satisfaction_score: undefined,
        completion_rate: 80,
        total_cost: 1300,
      },
    ];

    // 月次食費集計機能を実行
    const aggregation_result = aggregateMonthlySatisfactionScore({
      menu_records: current_month_menus,
      aggregation_month: '2024-01',
    });

    // 集計結果内の満足度スコア欄が空値になっていることを確認
    expect(aggregation_result.aggregated_satisfaction_score).toBeNull();
    expect(aggregation_result.average_completion_rate).toBe(85);
    expect(aggregation_result.total_monthly_cost).toBe(3600);
    expect(aggregation_result.satisfaction_score_status).toBe('missing');

    // 次月提案条件生成機能を実行
    const next_month_conditions = generateNextMonthProposalConditions({
      current_month_aggregation: aggregation_result,
      budget_constraint: 4000,
      nutrition_priority: 'balanced',
    });

    // 生成された次月提案条件内の満足度スコア関連の条件を確認
    expect(next_month_conditions.satisfaction_score_condition).toBeNull();
    expect(next_month_conditions.satisfaction_score_filter_applied).toBe(false);
    expect(next_month_conditions.proposal_logic_mode).toBe('skip_satisfaction_filter');

    // 提案ロジックが満足度スコアに基づく条件分岐をスキップしていることを検証
    expect(next_month_conditions.active_filter_count).toBe(2); // budget_constraint と nutrition_priority のみ
    expect(next_month_conditions.inactive_filter_count).toBe(1); // satisfaction_score_filter がスキップ
    expect(next_month_conditions.fallback_strategy).toBe('use_completion_rate_and_cost');
  });
});