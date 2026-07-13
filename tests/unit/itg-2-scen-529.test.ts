import { evaluateTechnicalFeasibility } from '../../src/logic/it-1-br-2-1-2-1';

describe('技術実現性評価機能 - 条件付き実装の場合、条件内容が判定結果に記録される', () => {
  // SCEN-529
  test('条件付き実装選択時、入力した条件内容が判定結果に完全に記録され、複数条件もすべて保存される', () => {
    // 前提: 栄養士が改善提案に対して技術実現性評価を実施する
    // 発生条件: 技術実現性評価画面で「条件付き実装」を選択し、複数の条件内容を入力して判定実行ボタンをクリック

    const proposal_id = 'proposal_001';
    const feasibility_classification = 'conditional_implementation';
    const condition_details = [
      { condition_type: 'OS_requirement', condition_value: 'Windows 10 or higher' },
      { condition_type: 'memory_requirement', condition_value: '8GB or higher' },
      { condition_type: 'dependency_library', condition_value: 'Node.js v16+' },
    ];
    const evaluated_by = 'dev_team_001';
    const evaluation_timestamp = new Date('2025-02-15T10:30:00Z');

    // 結果: 条件付き実装の判定結果が生成され、すべての入力条件内容が記録される
    const result = evaluateTechnicalFeasibility({
      proposal_id,
      feasibility_classification,
      condition_details,
      evaluated_by,
      evaluation_timestamp,
    });

    // 判定結果に条件付き実装分類が記録される
    expect(result.feasibility_classification).toBe('conditional_implementation');

    // 入力したすべての条件内容が判定結果に記録される
    expect(result.condition_details).toHaveLength(3);
    expect(result.condition_details).toEqual([
      { condition_type: 'OS_requirement', condition_value: 'Windows 10 or higher' },
      { condition_type: 'memory_requirement', condition_value: '8GB or higher' },
      { condition_type: 'dependency_library', condition_value: 'Node.js v16+' },
    ]);

    // 判定結果に提案ID、評価者、タイムスタンプが記録される
    expect(result.proposal_id).toBe('proposal_001');
    expect(result.evaluated_by).toBe('dev_team_001');
    expect(result.evaluation_timestamp).toEqual(new Date('2025-02-15T10:30:00Z'));

    // 判定結果が永続的に保存されるための履歴ID・保存タイムスタンプが付与される
    expect(result.evaluation_record_id).toBeDefined();
    expect(result.record_saved_at).toBeDefined();

    // 詳細情報展開フィールドが存在し、条件内容の詳細確認が可能
    expect(result.detail_expandable).toBe(true);
    expect(result.expanded_detail).toEqual({
      condition_count: 3,
      conditions_summary: 'OS_requirement: Windows 10 or higher | memory_requirement: 8GB or higher | dependency_library: Node.js v16+',
    });
  });

  test('異なる条件内容で再度判定を実行した場合、各判定結果に異なる条件内容が正しく記録される', () => {
    // 前提: 第1回目の判定結果が保存されており、第2回目の判定を実施
    // 発生条件: 異なる条件内容を入力して判定実行ボタンをクリック

    const proposal_id_v2 = 'proposal_002';
    const feasibility_classification_v2 = 'conditional_implementation';
    const condition_details_v2 = [
      { condition_type: 'database_requirement', condition_value: 'PostgreSQL v12+' },
      { condition_type: 'api_compatibility', condition_value: 'REST API v2 or higher' },
    ];
    const evaluated_by_v2 = 'dev_team_002';
    const evaluation_timestamp_v2 = new Date('2025-02-15T11:45:00Z');

    // 結果: 第2回目の判定結果が生成され、異なる条件内容が正しく記録される
    const result_v2 = evaluateTechnicalFeasibility({
      proposal_id: proposal_id_v2,
      feasibility_classification: feasibility_classification_v2,
      condition_details: condition_details_v2,
      evaluated_by: evaluated_by_v2,
      evaluation_timestamp: evaluation_timestamp_v2,
    });

    // 第2回目の判定結果に記録された条件内容が第1回目と異なることを確認
    expect(result_v2.condition_details).toHaveLength(2);
    expect(result_v2.condition_details).toEqual([
      { condition_type: 'database_requirement', condition_value: 'PostgreSQL v12+' },
      { condition_type: 'api_compatibility', condition_value: 'REST API v2 or higher' },
    ]);

    // 提案ID、評価者、タイムスタンプも異なる値で記録される
    expect(result_v2.proposal_id).toBe('proposal_002');
    expect(result_v2.evaluated_by).toBe('dev_team_002');
    expect(result_v2.evaluation_timestamp).toEqual(new Date('2025-02-15T11:45:00Z'));

    // 第2回目の判定結果も永続的に保存されるための履歴ID・保存タイムスタンプが付与される
    expect(result_v2.evaluation_record_id).toBeDefined();
    expect(result_v2.record_saved_at).toBeDefined();

    // 詳細情報展開フィールドに第2回目の条件が反映される
    expect(result_v2.expanded_detail.condition_count).toBe(2);
    expect(result_v2.expanded_detail.conditions_summary).toBe(
      'database_requirement: PostgreSQL v12+ | api_compatibility: REST API v2 or higher'
    );
  });

  test('条件内容が空の場合、エラーが発生して判定が実行されない', () => {
    // 前提: 技術実現性評価画面で条件付き実装を選択したが、条件内容を入力していない状態
    // 発生条件: 条件内容なしで判定実行ボタンをクリック

    const proposal_id = 'proposal_003';
    const feasibility_classification = 'conditional_implementation';
    const condition_details: any[] = [];
    const evaluated_by = 'dev_team_001';
    const evaluation_timestamp = new Date('2025-02-15T12:00:00Z');

    // 結果: 条件内容が空の場合、エラーが発生して判定が実行されず、ユーザーに通知される
    expect(() =>
      evaluateTechnicalFeasibility({
        proposal_id,
        feasibility_classification,
        condition_details,
        evaluated_by,
        evaluation_timestamp,
      })
    ).toThrow(/条件内容/);
  });

  test('条件内容の詳細情報から過去の判定結果の条件内容が参照可能であることを検証', () => {
    // 前提: 複数回の技術実現性評価が完了し、判定履歴が保存されている状態
    // 発生条件: 過去の判定結果の詳細情報を展開して確認

    const proposal_id = 'proposal_004';
    const feasibility_classification = 'conditional_implementation';
    const condition_details = [
      { condition_type: 'OS_requirement', condition_value: 'macOS 11 or higher' },
      { condition_type: 'storage_requirement', condition_value: '50GB free space' },
    ];
    const evaluated_by = 'dev_team_003';
    const evaluation_timestamp = new Date('2025-02-15T13:20:00Z');

    // 結果: 判定結果が生成され、履歴から参照可能な状態で保存される
    const result = evaluateTechnicalFeasibility({
      proposal_id,
      feasibility_classification,
      condition_details,
      evaluated_by,
      evaluation_timestamp,
    });

    // 判定結果の詳細情報が完全に記録される
    expect(result.evaluation_record_id).toBeDefined();
    expect(result.record_saved_at).toBeDefined();

    // 詳細情報展開フィールドから条件内容が確認可能
    expect(result.detail_expandable).toBe(true);
    expect(result.expanded_detail.condition_count).toBe(2);

    // 記録された条件内容がシステムに永続的に保存されることを検証
    // （履歴参照可能フラグが true になっていることで確認）
    expect(result.is_retrievable_from_history).toBe(true);

    // 条件内容の各要素が正确に記録されている
    expect(result.condition_details[0]).toEqual({
      condition_type: 'OS_requirement',
      condition_value: 'macOS 11 or higher',
    });
    expect(result.condition_details[1]).toEqual({
      condition_type: 'storage_requirement',
      condition_value: '50GB free space',
    });
  });
});