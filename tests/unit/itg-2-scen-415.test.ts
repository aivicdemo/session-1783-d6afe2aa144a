import { processMultipleConstraints } from '../../src/logic/it-1-br-2-1-1-1';

describe('ユーザーの食事記録と栄養摂取量の推移データを自動集計し、栄養項目別の達成度と改善ギャップを可視化するダッシュボード機能', () => {
  // SCEN-415: [edge] 複数制限条件同時入力処理機能 - 制限条件が10件以上同時入力された場合、全条件が優先度順に処理される
  test('SCEN-415: 制限条件が10件以上同時入力された場合、全条件が優先度順に処理される', () => {
    const input_constraints = [
      { constraint_id: 'c001', constraint_name: 'カロリー上限', constraint_value: 2000, priority: 3, constraint_type: 'upper_limit' },
      { constraint_id: 'c002', constraint_name: 'タンパク質下限', constraint_value: 50, priority: 1, constraint_type: 'lower_limit' },
      { constraint_id: 'c003', constraint_name: '塩分上限', constraint_value: 6, priority: 5, constraint_type: 'upper_limit' },
      { constraint_id: 'c004', constraint_name: '脂質下限', constraint_value: 25, priority: 2, constraint_type: 'lower_limit' },
      { constraint_id: 'c005', constraint_name: '糖質上限', constraint_value: 300, priority: 4, constraint_type: 'upper_limit' },
      { constraint_id: 'c006', constraint_name: '食物繊維下限', constraint_value: 20, priority: 6, constraint_type: 'lower_limit' },
      { constraint_id: 'c007', constraint_name: 'コレステロール上限', constraint_value: 200, priority: 7, constraint_type: 'upper_limit' },
      { constraint_id: 'c008', constraint_name: 'カリウム下限', constraint_value: 2000, priority: 8, constraint_type: 'lower_limit' },
      { constraint_id: 'c009', constraint_name: 'リン上限', constraint_value: 1000, priority: 9, constraint_type: 'upper_limit' },
      { constraint_id: 'c010', constraint_name: 'マグネシウム下限', constraint_value: 300, priority: 10, constraint_type: 'lower_limit' },
      { constraint_id: 'c011', constraint_name: '亜鉛上限', constraint_value: 15, priority: 11, constraint_type: 'upper_limit' },
    ];
    const input_user_id = 'user_123';
    const input_timestamp = new Date('2024-01-15T11:00:00Z');

    const result = processMultipleConstraints({
      user_id: input_user_id,
      constraints: input_constraints,
      timestamp: input_timestamp,
    });

    // 全11件の制限条件が受け付けられたことを検証
    expect(result.total_constraints_received).toBe(11);

    // 全11件が処理されたことを検証
    expect(result.total_constraints_processed).toBe(11);

    // 全制限条件が完了ステータスであることを検証
    expect(result.constraints_processed.length).toBe(11);
    result.constraints_processed.forEach((processed_constraint) => {
      expect(processed_constraint.status).toBe('completed');
    });

    // 制限条件が優先度順（昇順）に処理されたかを検証
    const priority_sequence = result.constraints_processed.map((pc) => pc.priority);
    expect(priority_sequence).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);

    // 処理順序ログが記録されていることを検証
    expect(result.processing_log).toBeDefined();
    expect(result.processing_log.length).toBe(11);

    // 各ログエントリが正しい順序で記録されていることを検証
    result.processing_log.forEach((log_entry, index) => {
      expect(log_entry.execution_order).toBe(index + 1);
      expect(log_entry.constraint_id).toBeDefined();
      expect(log_entry.result_status).toBe('success');
    });

    // ダッシュボード表示用の優先度順結果が生成されていることを検証
    expect(result.dashboard_display_result).toBeDefined();
    expect(result.dashboard_display_result.constraints_by_priority.length).toBe(11);

    // ダッシュボード結果が優先度順に並んでいることを検証
    const dashboard_priorities = result.dashboard_display_result.constraints_by_priority.map(
      (item) => item.priority
    );
    expect(dashboard_priorities).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);

    // 処理時間が正確に記録されていることを検証（単位：ミリ秒）
    expect(result.processing_duration_ms).toBeGreaterThanOrEqual(0);
    expect(typeof result.processing_duration_ms).toBe('number');

    // ダッシュボード反映確認フラグが true であることを検証
    expect(result.dashboard_reflected).toBe(true);

    // 処理の正確性確認：各制限条件の値と型が保持されていることを検証
    result.constraints_processed.forEach((processed_constraint, index) => {
      const original_constraint = input_constraints.find(
        (c) => c.constraint_id === processed_constraint.constraint_id
      );
      expect(processed_constraint.constraint_name).toBe(original_constraint.constraint_name);
      expect(processed_constraint.constraint_value).toBe(original_constraint.constraint_value);
      expect(processed_constraint.constraint_type).toBe(original_constraint.constraint_type);
    });

    // 全処理ログが記録されていることを検証
    expect(result.processing_log).toHaveLength(11);
  });
});