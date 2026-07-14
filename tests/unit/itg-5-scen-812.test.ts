import { aggregateWeeklyFailurePatterns } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-812
  test('失敗パターン週次集計機能 - 集計処理中にデータベース接続エラーが発生した場合、部分集計結果と例外メッセージが記録される', async () => {
    const mockFailurePatternData = [
      {
        id: 'pattern_001',
        user_id: 'user_123',
        rejection_date: '2024-01-08T14:30:00Z',
        reason_category: '栄養バランス',
        reason_text: '野菜が足りない',
        rejected_menu_id: 'menu_001',
      },
      {
        id: 'pattern_002',
        user_id: 'user_123',
        rejection_date: '2024-01-09T16:15:00Z',
        reason_category: '調理時間',
        reason_text: '30分では無理',
        rejected_menu_id: 'menu_002',
      },
      {
        id: 'pattern_003',
        user_id: 'user_456',
        rejection_date: '2024-01-10T10:45:00Z',
        reason_category: '予算',
        reason_text: '高すぎる',
        rejected_menu_id: 'menu_003',
      },
      {
        id: 'pattern_004',
        user_id: 'user_789',
        rejection_date: '2024-01-11T08:20:00Z',
        reason_category: '食材在庫',
        reason_text: '卵がない',
        rejected_menu_id: 'menu_004',
      },
      {
        id: 'pattern_005',
        user_id: 'user_123',
        rejection_date: '2024-01-12T18:00:00Z',
        reason_category: '家族の好み',
        reason_text: '子どもが嫌いな食材',
        rejected_menu_id: 'menu_005',
      },
    ];

    const aggregationStartDate = '2024-01-08T00:00:00Z';
    const aggregationEndDate = '2024-01-15T23:59:59Z';

    const mockDatabaseError = new Error('DB Connection Error: Connection timeout after 5000ms');
    mockDatabaseError.name = 'DatabaseConnectionError';

    const input = {
      aggregation_start_date: aggregationStartDate,
      aggregation_end_date: aggregationEndDate,
      partial_data: mockFailurePatternData.slice(0, 3),
      db_connection_error: mockDatabaseError,
      error_occurred_at_index: 3,
    };

    const result = await aggregateWeeklyFailurePatterns(input);

    expect(result).toBeDefined();
    expect(result.status).toBe('partial_failure');
    expect(result.partial_aggregate).toBeDefined();
    expect(result.partial_aggregate.total_patterns_processed).toBe(3);
    expect(result.partial_aggregate.category_breakdown).toEqual({
      栄養バランス: 1,
      調理時間: 1,
      予算: 1,
    });
    expect(result.partial_aggregate.affected_users).toEqual(['user_123', 'user_123', 'user_456']);
    expect(result.partial_aggregate.aggregation_period_start).toBe(aggregationStartDate);
    expect(result.partial_aggregate.aggregation_period_end).toBe(aggregationEndDate);

    expect(result.error_log).toBeDefined();
    expect(result.error_log.error_type).toBe('DB Connection Error');
    expect(result.error_log.error_message).toContain('DB Connection Error');
    expect(result.error_log.error_timestamp).toBeDefined();
    expect(new Date(result.error_log.error_timestamp).getTime()).toBeGreaterThan(0);

    expect(result.error_log.error_details).toBeDefined();
    expect(result.error_log.error_details.failure_point_index).toBe(3);
    expect(result.error_log.error_details.failed_pattern_id).toBe('pattern_004');
    expect(result.error_log.error_details.aggregation_target_period).toBe(
      `${aggregationStartDate} ~ ${aggregationEndDate}`
    );
    expect(result.error_log.error_details.patterns_remaining_in_queue).toBe(2);

    expect(result.dashboard_readiness).toBe(true);
    expect(result.partial_display_enabled).toBe(true);

    expect(result.recovery_suggestion).toBeDefined();
    expect(result.recovery_suggestion).toContain('DB Connection Error');
  });
});