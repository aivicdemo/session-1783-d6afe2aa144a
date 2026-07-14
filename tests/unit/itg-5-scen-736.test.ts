import { categorizeAndAggregateRejectionReasons } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-736: [error] 改善提案優先度スコアリング通知機能 - スコアリングデータが不完全な場合、通知は送信されずエラーとなる
  test('スコアリングデータが不完全な場合、エラーを発生させ通知は送信されない', () => {
    // 必須フィールドが不足したスコアリングデータを用意
    const incomplete_scoring_data = {
      proposal_id: 'PROP-001',
      // score_value が欠落
      priority_level: 'high'
    };

    // 不完全なデータで関数を実行
    expect(() =>
      categorizeAndAggregateRejectionReasons([
        {
          rejection_reason_id: 'RR-001',
          reason_text: '栄養バランスが不適切',
          reason_category: 'nutrition_imbalance',
          user_id: 'USR-001',
          timestamp: '2024-01-15T10:30:00Z',
          improvement_proposal_id: 'PROP-001',
          scoring_data: incomplete_scoring_data as any
        }
      ])
    ).toThrow(/必須フィールド/);
  });

  test('すべての必須フィールドが揃っている場合、スコアリングデータは有効となり通知が準備される', () => {
    const complete_scoring_data = {
      proposal_id: 'PROP-002',
      score_value: 85,
      priority_level: 'high'
    };

    const rejection_records = [
      {
        rejection_reason_id: 'RR-002',
        reason_text: '家族の好みが反映されていない',
        reason_category: 'user_preference_not_reflected',
        user_id: 'USR-002',
        timestamp: '2024-01-15T11:00:00Z',
        improvement_proposal_id: 'PROP-002',
        scoring_data: complete_scoring_data
      },
      {
        rejection_reason_id: 'RR-003',
        reason_text: '調理時間が超過した',
        reason_category: 'cooking_time_exceeded',
        user_id: 'USR-002',
        timestamp: '2024-01-15T11:15:00Z',
        improvement_proposal_id: 'PROP-002',
        scoring_data: complete_scoring_data
      }
    ];

    const result = categorizeAndAggregateRejectionReasons(rejection_records);

    // スコアリングデータが有効であることを確認
    expect(result).toHaveProperty('notification_status');
    expect(result.notification_status).toBe('ready_to_send');
    expect(result.aggregated_categories).toBeDefined();
    expect(Object.keys(result.aggregated_categories)).toContain(
      'user_preference_not_reflected'
    );
    expect(Object.keys(result.aggregated_categories)).toContain(
      'cooking_time_exceeded'
    );
    expect(result.aggregated_categories.user_preference_not_reflected).toBe(1);
    expect(result.aggregated_categories.cooking_time_exceeded).toBe(1);
  });

  test('提案IDが欠落した場合、エラーが発生し通知は送信されない', () => {
    const invalid_scoring_data = {
      // proposal_id が欠落
      score_value: 75,
      priority_level: 'medium'
    };

    expect(() =>
      categorizeAndAggregateRejectionReasons([
        {
          rejection_reason_id: 'RR-004',
          reason_text: '食材制限が漏れている',
          reason_category: 'food_restriction_omitted',
          user_id: 'USR-003',
          timestamp: '2024-01-15T12:00:00Z',
          improvement_proposal_id: 'PROP-003',
          scoring_data: invalid_scoring_data as any
        }
      ])
    ).toThrow(/必須フィールド/);
  });

  test('スコア値が欠落した場合、エラーが発生し通知は送信されない', () => {
    const missing_score_value = {
      proposal_id: 'PROP-004',
      // score_value が欠落
      priority_level: 'low'
    };

    expect(() =>
      categorizeAndAggregateRejectionReasons([
        {
          rejection_reason_id: 'RR-005',
          reason_text: '予算超過の恐れがある',
          reason_category: 'budget_exceeded_risk',
          user_id: 'USR-004',
          timestamp: '2024-01-15T12:30:00Z',
          improvement_proposal_id: 'PROP-004',
          scoring_data: missing_score_value as any
        }
      ])
    ).toThrow(/必須フィールド/);
  });

  test('優先度レベルが欠落した場合、エラーが発生し通知は送信されない', () => {
    const missing_priority_level = {
      proposal_id: 'PROP-005',
      score_value: 60
      // priority_level が欠落
    };

    expect(() =>
      categorizeAndAggregateRejectionReasons([
        {
          rejection_reason_id: 'RR-006',
          reason_text: '在庫が不足している',
          reason_category: 'inventory_insufficient',
          user_id: 'USR-005',
          timestamp: '2024-01-15T13:00:00Z',
          improvement_proposal_id: 'PROP-005',
          scoring_data: missing_priority_level as any
        }
      ])
    ).toThrow(/必須フィールド/);
  });

  test('複数の却下理由がある場合、すべての必須フィールドが揃っていれば正常に集計される', () => {
    const valid_scoring_data = {
      proposal_id: 'PROP-006',
      score_value: 90,
      priority_level: 'high'
    };

    const multi_rejection_records = [
      {
        rejection_reason_id: 'RR-007',
        reason_text: '栄養バランスが悪い',
        reason_category: 'nutrition_imbalance',
        user_id: 'USR-006',
        timestamp: '2024-01-15T13:30:00Z',
        improvement_proposal_id: 'PROP-006',
        scoring_data: valid_scoring_data
      },
      {
        rejection_reason_id: 'RR-008',
        reason_text: '栄養バランスが悪い',
        reason_category: 'nutrition_imbalance',
        user_id: 'USR-006',
        timestamp: '2024-01-15T14:00:00Z',
        improvement_proposal_id: 'PROP-006',
        scoring_data: valid_scoring_data
      },
      {
        rejection_reason_id: 'RR-009',
        reason_text: '調理時間超過',
        reason_category: 'cooking_time_exceeded',
        user_id: 'USR-006',
        timestamp: '2024-01-15T14:30:00Z',
        improvement_proposal_id: 'PROP-006',
        scoring_data: valid_scoring_data
      }
    ];

    const result = categorizeAndAggregateRejectionReasons(
      multi_rejection_records
    );

    expect(result.notification_status).toBe('ready_to_send');
    expect(result.aggregated_categories.nutrition_imbalance).toBe(2);
    expect(result.aggregated_categories.cooking_time_exceeded).toBe(1);
    expect(result.total_rejection_count).toBe(3);
  });

  test('スコアリングデータがnullの場合、エラーが発生する', () => {
    expect(() =>
      categorizeAndAggregateRejectionReasons([
        {
          rejection_reason_id: 'RR-010',
          reason_text: '何らかの理由',
          reason_category: 'unknown',
          user_id: 'USR-007',
          timestamp: '2024-01-15T15:00:00Z',
          improvement_proposal_id: 'PROP-007',
          scoring_data: null as any
        }
      ])
    ).toThrow(/必須フィールド/);
  });

  test('スコアリングデータがundefinedの場合、エラーが発生する', () => {
    expect(() =>
      categorizeAndAggregateRejectionReasons([
        {
          rejection_reason_id: 'RR-011',
          reason_text: '何らかの理由',
          reason_category: 'unknown',
          user_id: 'USR-008',
          timestamp: '2024-01-15T15:30:00Z',
          improvement_proposal_id: 'PROP-008',
          scoring_data: undefined as any
        }
      ])
    ).toThrow(/必須フィールド/);
  });
});