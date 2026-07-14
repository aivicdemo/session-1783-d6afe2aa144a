import { aggregateRejectionReasons } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-649: [normal] 失敗パターン集計機能 - 複数の却下修正理由が集計され、失敗パターンの頻度が正確に計算される
  test('複数の却下修正理由が集計され、失敗パターンの頻度が正確に計算される', () => {
    const rejection_records = [
      {
        rejection_id: 'REJ001',
        rejection_reason_category: '仕様不一致',
        timestamp: '2024-01-15T10:00:00Z',
      },
      {
        rejection_id: 'REJ002',
        rejection_reason_category: '仕様不一致',
        timestamp: '2024-01-15T10:15:00Z',
      },
      {
        rejection_id: 'REJ003',
        rejection_reason_category: '仕様不一致',
        timestamp: '2024-01-15T10:30:00Z',
      },
      {
        rejection_id: 'REJ004',
        rejection_reason_category: '仕様不一致',
        timestamp: '2024-01-15T10:45:00Z',
      },
      {
        rejection_id: 'REJ005',
        rejection_reason_category: '仕様不一致',
        timestamp: '2024-01-15T11:00:00Z',
      },
      {
        rejection_id: 'REJ006',
        rejection_reason_category: '性能問題',
        timestamp: '2024-01-15T11:15:00Z',
      },
      {
        rejection_id: 'REJ007',
        rejection_reason_category: '性能問題',
        timestamp: '2024-01-15T11:30:00Z',
      },
      {
        rejection_id: 'REJ008',
        rejection_reason_category: '性能問題',
        timestamp: '2024-01-15T11:45:00Z',
      },
      {
        rejection_id: 'REJ009',
        rejection_reason_category: 'その他',
        timestamp: '2024-01-15T12:00:00Z',
      },
      {
        rejection_id: 'REJ010',
        rejection_reason_category: 'その他',
        timestamp: '2024-01-15T12:15:00Z',
      },
    ];

    const result = aggregateRejectionReasons(rejection_records);

    // 仕様不一致: 5件 / 10件 = 50%
    expect(result.pattern_aggregates).toEqual(
      expect.objectContaining({
        仕様不一致: {
          count: 5,
          frequency_percentage: 50,
        },
      })
    );

    // 性能問題: 3件 / 10件 = 30%
    expect(result.pattern_aggregates).toEqual(
      expect.objectContaining({
        性能問題: {
          count: 3,
          frequency_percentage: 30,
        },
      })
    );

    // その他: 2件 / 10件 = 20%
    expect(result.pattern_aggregates).toEqual(
      expect.objectContaining({
        その他: {
          count: 2,
          frequency_percentage: 20,
        },
      })
    );

    // 合計が100%であることを確認
    const total_percentage = Object.values(result.pattern_aggregates).reduce(
      (sum: number, pattern: { frequency_percentage: number }) =>
        sum + pattern.frequency_percentage,
      0
    );
    expect(total_percentage).toBe(100);

    // 総レコード数が10件であることを確認
    expect(result.total_records).toBe(10);

    // 各パターンのカウントが正確であることを確認
    const total_count = Object.values(result.pattern_aggregates).reduce(
      (sum: number, pattern: { count: number }) => sum + pattern.count,
      0
    );
    expect(total_count).toBe(10);
  });
});