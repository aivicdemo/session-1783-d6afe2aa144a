import { distributeAndApproveRuleSpecifications } from '../../src/logic/it-1-br-6-2-1-1';

describe('食材流通業者・スーパーの在庫・価格データ連携インターフェース', () => {
  // SCEN-492: [edge] ルール仕様書配布・承認フロー自動進行機能 - 複数のルール仕様書が同時に確定した場合、各々のフローが並行して進行する
  test('複数ルール仕様書同時確定時に並行フロー進行とログ記録を確認', () => {
    // テストデータ: 3つの異なるルール仕様書を準備
    const ruleSpecA = {
      rule_spec_id: 'RULE-A-001',
      rule_name: '季節パターン_春野菜',
      rule_content: '春キャベツ・新玉ねぎ・アスパラを優先度スコア 95 に設定',
      created_date: new Date('2024-01-15T09:00:00Z'),
      status: 'confirmed',
      distribution_status: 'pending',
      approval_status: 'pending',
      distributed_timestamp: null,
      approved_timestamp: null,
      distribution_target_count: 5,
      distributed_count: 0,
      approval_request_timestamp: null,
    };

    const ruleSpecB = {
      rule_spec_id: 'RULE-B-002',
      rule_name: '割引率閾値_セール対象商品',
      rule_content: '割引率 20% 以上の商品を優先度スコア 85 に設定',
      created_date: new Date('2024-01-15T09:00:00Z'),
      status: 'confirmed',
      distribution_status: 'pending',
      approval_status: 'pending',
      distributed_timestamp: null,
      approved_timestamp: null,
      distribution_target_count: 5,
      distributed_count: 0,
      approval_request_timestamp: null,
    };

    const ruleSpecC = {
      rule_spec_id: 'RULE-C-003',
      rule_name: '販売期間_限定キャンペーン',
      rule_content: '指定期間内の限定販売商品を優先度スコア 90 に設定',
      created_date: new Date('2024-01-15T09:00:00Z'),
      status: 'confirmed',
      distribution_status: 'pending',
      approval_status: 'pending',
      distributed_timestamp: null,
      approved_timestamp: null,
      distribution_target_count: 5,
      distributed_count: 0,
      approval_request_timestamp: null,
    };

    const input_specs = [ruleSpecA, ruleSpecB, ruleSpecC];

    // 関数実行: 複数ルール仕様書を同時確定状態で配布・承認フロー自動進行
    const result = distributeAndApproveRuleSpecifications(input_specs);

    // 期待値: 全ルール仕様書が配布段階に進行
    expect(result.successful_distributions).toBe(3);
    expect(result.flow_status_a).toBe('distribution_in_progress');
    expect(result.flow_status_b).toBe('distribution_in_progress');
    expect(result.flow_status_c).toBe('distribution_in_progress');

    // 期待値: ルールAが配布段階に到達し、配布対象5名中0名から開始（配布処理開始）
    expect(result.rule_a_distribution_progress).toEqual({
      rule_spec_id: 'RULE-A-001',
      target_count: 5,
      distributed_count: 0,
      status: 'distributing',
    });

    // 期待値: ルールBが配布段階に到達し、配布対象5名中0名から開始（配布処理開始）
    expect(result.rule_b_distribution_progress).toEqual({
      rule_spec_id: 'RULE-B-002',
      target_count: 5,
      distributed_count: 0,
      status: 'distributing',
    });

    // 期待値: ルールCが配布段階に到達し、配布対象5名中0名から開始（配布処理開始）
    expect(result.rule_c_distribution_progress).toEqual({
      rule_spec_id: 'RULE-C-003',
      target_count: 5,
      distributed_count: 0,
      status: 'distributing',
    });

    // 期待値: 各フロー間の相互干渉がないことを確認（独立した flow_id を持つ）
    expect(result.flow_id_a).not.toBe(result.flow_id_b);
    expect(result.flow_id_b).not.toBe(result.flow_id_c);
    expect(result.flow_id_a).not.toBe(result.flow_id_c);

    // 期待値: 配布完了後、すべてのルール仕様書が承認段階に遷移
    expect(result.final_approval_status_a).toBe('approval_in_progress');
    expect(result.final_approval_status_b).toBe('approval_in_progress');
    expect(result.final_approval_status_c).toBe('approval_in_progress');

    // 期待値: 各ルール仕様書の進行状況ログが正確に記録されている
    expect(result.execution_logs).toHaveLength(15); // 3ルール × 5ログイベント（確定、配布開始、配布進行、承認要求、承認開始）
    expect(result.execution_logs[0]).toEqual({
      timestamp: expect.any(String),
      rule_spec_id: 'RULE-A-001',
      event_type: 'flow_initiated',
      stage: 'distribution',
    });
    expect(result.execution_logs[5]).toEqual({
      timestamp: expect.any(String),
      rule_spec_id: 'RULE-B-002',
      event_type: 'flow_initiated',
      stage: 'distribution',
    });
    expect(result.execution_logs[10]).toEqual({
      timestamp: expect.any(String),
      rule_spec_id: 'RULE-C-003',
      event_type: 'flow_initiated',
      stage: 'distribution',
    });

    // 期待値: 並行実行の記録がシステムログに記録されている
    expect(result.parallel_execution_record).toEqual({
      concurrent_flow_count: 3,
      start_time: expect.any(String),
      completion_time: expect.any(String),
      all_flows_independent: true,
      interference_detected: false,
    });

    // 期待値: 最終的に全ルール仕様書が承認段階に到達
    expect(result.final_flow_completion_status).toEqual({
      rule_a_completed: true,
      rule_b_completed: true,
      rule_c_completed: true,
      all_approval_stages_reached: true,
    });
  });
});