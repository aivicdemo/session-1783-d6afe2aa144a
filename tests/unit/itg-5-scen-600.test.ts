import { aggregateDisengagementMetrics } from '../../src/logic/it-7-2-1';

describe('機能別使用パターン分析機能 - 離脱ポイント時系列境界値集計', () => {
  // SCEN-600
  test('期間開始直後・期間終了直前の離脱イベントが正しく集計され、離脱率が正確に計算される', () => {
    const analysis_period_start = new Date('2024-01-01T00:00:00Z');
    const analysis_period_end = new Date('2024-01-31T23:59:59Z');

    const disengagement_events = [
      // 期間開始直後（2024年1月1日00:00:01）: 5件
      { event_timestamp: new Date('2024-01-01T00:00:01Z'), event_type: 'disengagement' },
      { event_timestamp: new Date('2024-01-01T00:00:02Z'), event_type: 'disengagement' },
      { event_timestamp: new Date('2024-01-01T00:00:03Z'), event_type: 'disengagement' },
      { event_timestamp: new Date('2024-01-01T00:00:04Z'), event_type: 'disengagement' },
      { event_timestamp: new Date('2024-01-01T00:00:05Z'), event_type: 'disengagement' },
      // 期間中間（2024年1月15日12:00:00）: 10件
      { event_timestamp: new Date('2024-01-15T12:00:00Z'), event_type: 'disengagement' },
      { event_timestamp: new Date('2024-01-15T12:00:01Z'), event_type: 'disengagement' },
      { event_timestamp: new Date('2024-01-15T12:00:02Z'), event_type: 'disengagement' },
      { event_timestamp: new Date('2024-01-15T12:00:03Z'), event_type: 'disengagement' },
      { event_timestamp: new Date('2024-01-15T12:00:04Z'), event_type: 'disengagement' },
      { event_timestamp: new Date('2024-01-15T12:00:05Z'), event_type: 'disengagement' },
      { event_timestamp: new Date('2024-01-15T12:00:06Z'), event_type: 'disengagement' },
      { event_timestamp: new Date('2024-01-15T12:00:07Z'), event_type: 'disengagement' },
      { event_timestamp: new Date('2024-01-15T12:00:08Z'), event_type: 'disengagement' },
      { event_timestamp: new Date('2024-01-15T12:00:09Z'), event_type: 'disengagement' },
      // 期間終了直前（2024年1月31日23:59:58）: 3件
      { event_timestamp: new Date('2024-01-31T23:59:56Z'), event_type: 'disengagement' },
      { event_timestamp: new Date('2024-01-31T23:59:57Z'), event_type: 'disengagement' },
      { event_timestamp: new Date('2024-01-31T23:59:58Z'), event_type: 'disengagement' },
    ];

    const result = aggregateDisengagementMetrics(
      disengagement_events,
      analysis_period_start,
      analysis_period_end
    );

    // 集計されたイベント数: 18件（5 + 10 + 3）
    expect(result.total_disengagement_events).toBe(18);

    // 期間開始直後の離脱イベント数
    expect(result.disengagement_at_period_start).toBe(5);

    // 期間終了直前の離脱イベント数
    expect(result.disengagement_at_period_end).toBe(3);

    // 期間中間の離脱イベント数
    expect(result.disengagement_in_period_middle).toBe(10);

    // 離脱率の計算: 18 / 18 = 1.0 (100%)
    expect(result.disengagement_rate).toBe(1.0);

    // 全イベント数（この場合は全て離脱イベント）
    expect(result.total_events_in_period).toBe(18);

    // 期間内のイベント漏れなし、重複なし
    expect(result.event_count_by_boundary).toEqual({
      at_period_start: 5,
      in_period_middle: 10,
      at_period_end: 3,
    });

    // タイムゾーン誤差なし（全てUTCで統一）
    expect(result.timezone_adjusted).toBe(true);

    // 境界値の直前のイベント（期間外）が除外されることを確認
    const before_period_start = new Date('2023-12-31T23:59:59Z');
    const after_period_end = new Date('2024-02-01T00:00:00Z');

    const events_with_boundary_edge_cases = [
      { event_timestamp: before_period_start, event_type: 'disengagement' }, // 除外対象
      { event_timestamp: new Date('2024-01-01T00:00:01Z'), event_type: 'disengagement' }, // 含める
      { event_timestamp: new Date('2024-01-31T23:59:58Z'), event_type: 'disengagement' }, // 含める
      { event_timestamp: after_period_end, event_type: 'disengagement' }, // 除外対象
    ];

    const result_with_edges = aggregateDisengagementMetrics(
      events_with_boundary_edge_cases,
      analysis_period_start,
      analysis_period_end
    );

    // 期間内のイベントのみ: 2件（境界外の2件は除外）
    expect(result_with_edges.total_disengagement_events).toBe(2);
    expect(result_with_edges.total_events_in_period).toBe(2);

    // 離脱率: 2 / 2 = 1.0 (100%)
    expect(result_with_edges.disengagement_rate).toBe(1.0);
  });
});