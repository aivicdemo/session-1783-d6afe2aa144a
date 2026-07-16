import { extractFrequencyMetrics } from '../../src/logic/it-8-1-1-1';

describe('ユーザーインタビュー記録と利用ログからの食材制限・調理時間・予算抽出', () => {
  // SCEN-240
  test('インタビュー記録がNULLまたは利用ログが空の場合、発生頻度抽出処理がスキップされ、適切なスキップメッセージまたはNULL/空の結果が返されること', () => {
    // Case 1: インタビュー記録がNULLの状態
    const result_interview_null = extractFrequencyMetrics({
      interview_records: null,
      usage_logs: [
        {
          log_id: 'log_001',
          user_id: 'user_123',
          action_type: 'menu_generation',
          timestamp: '2024-01-15T10:00:00Z',
          constraint_type: 'food_restriction',
          constraint_value: 'gluten_free',
        },
      ],
    });

    expect(result_interview_null).toEqual({
      status: 'skipped',
      message: 'インタビュー記録が空またはNULLのため処理をスキップしました',
      data: null,
    });

    // Case 2: 利用ログが空配列の状態
    const result_usage_logs_empty = extractFrequencyMetrics({
      interview_records: [
        {
          interview_id: 'int_001',
          user_id: 'user_123',
          interview_date: '2024-01-10T14:00:00Z',
          pain_factors: [
            {
              category: 'food_restriction',
              description: 'グルテンフリー対応が必要',
              frequency: 1,
            },
          ],
        },
      ],
      usage_logs: [],
    });

    expect(result_usage_logs_empty).toEqual({
      status: 'skipped',
      message: '利用ログが空のため処理をスキップしました',
      data: null,
    });

    // Case 3: インタビュー記録がNULLかつ利用ログが空の状態
    const result_both_empty = extractFrequencyMetrics({
      interview_records: null,
      usage_logs: [],
    });

    expect(result_both_empty).toEqual({
      status: 'skipped',
      message: 'インタビュー記録と利用ログが空またはNULLのため処理をスキップしました',
      data: null,
    });

    // Case 4: インタビュー記録が空配列かつ利用ログがNULLの状態
    const result_both_null_or_empty = extractFrequencyMetrics({
      interview_records: [],
      usage_logs: null,
    });

    expect(result_both_null_or_empty).toEqual({
      status: 'skipped',
      message: 'インタビュー記録と利用ログが空またはNULLのため処理をスキップしました',
      data: null,
    });

    // Case 5: 有効なデータが存在する場合は正常に処理される
    const result_valid_data = extractFrequencyMetrics({
      interview_records: [
        {
          interview_id: 'int_001',
          user_id: 'user_123',
          interview_date: '2024-01-10T14:00:00Z',
          pain_factors: [
            {
              category: 'food_restriction',
              description: 'グルテンフリー対応が必要',
              frequency: 1,
            },
            {
              category: 'cooking_time',
              description: '30分以内で調理できる献立が欲しい',
              frequency: 1,
            },
            {
              category: 'budget_constraint',
              description: '1日1000円以内の予算',
              frequency: 1,
            },
          ],
        },
      ],
      usage_logs: [
        {
          log_id: 'log_001',
          user_id: 'user_123',
          action_type: 'menu_generation',
          timestamp: '2024-01-15T10:00:00Z',
          constraint_type: 'food_restriction',
          constraint_value: 'gluten_free',
        },
        {
          log_id: 'log_002',
          user_id: 'user_123',
          action_type: 'menu_generation',
          timestamp: '2024-01-15T11:00:00Z',
          constraint_type: 'cooking_time',
          constraint_value: '30_min',
        },
        {
          log_id: 'log_003',
          user_id: 'user_123',
          action_type: 'menu_generation',
          timestamp: '2024-01-15T12:00:00Z',
          constraint_type: 'budget_constraint',
          constraint_value: '1000_yen',
        },
      ],
    });

    expect(result_valid_data.status).toBe('success');
    expect(result_valid_data.data).toBeDefined();
    expect(result_valid_data.data.frequency_metrics).toEqual({
      food_restriction: {
        count: 2,
        impact_score: 85,
      },
      cooking_time: {
        count: 1,
        impact_score: 75,
      },
      budget_constraint: {
        count: 1,
        impact_score: 80,
      },
    });
    expect(result_valid_data.data.priority_matrix).toEqual([
      {
        constraint_type: 'food_restriction',
        frequency: 2,
        impact: 85,
        priority_rank: 'high',
      },
      {
        constraint_type: 'budget_constraint',
        frequency: 1,
        impact: 80,
        priority_rank: 'medium',
      },
      {
        constraint_type: 'cooking_time',
        frequency: 1,
        impact: 75,
        priority_rank: 'medium',
      },
    ]);
  });
});