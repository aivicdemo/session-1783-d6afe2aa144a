import { aggregateFailurePatterns } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-701
  test('失敗パターン集計 - 同一パターンが複数回発生した場合、発生頻度を正確に集計する', () => {
    const failureRecords = [
      { patternId: 'timeout_error', patternName: 'タイムアウトエラー', timestamp: '2024-01-15T10:00:00Z', category: '調理時間超過' },
      { patternId: 'timeout_error', patternName: 'タイムアウトエラー', timestamp: '2024-01-15T10:15:00Z', category: '調理時間超過' },
      { patternId: 'timeout_error', patternName: 'タイムアウトエラー', timestamp: '2024-01-15T10:30:00Z', category: '調理時間超過' },
      { patternId: 'timeout_error', patternName: 'タイムアウトエラー', timestamp: '2024-01-15T10:45:00Z', category: '調理時間超過' },
      { patternId: 'timeout_error', patternName: 'タイムアウトエラー', timestamp: '2024-01-15T11:00:00Z', category: '調理時間超過' },
      { patternId: 'connection_error', patternName: '接続エラー', timestamp: '2024-01-15T11:15:00Z', category: 'サーバーエラー' },
      { patternId: 'connection_error', patternName: '接続エラー', timestamp: '2024-01-15T11:30:00Z', category: 'サーバーエラー' },
    ];

    const aggregateResult = aggregateFailurePatterns(failureRecords);

    // タイムアウトエラーの集計結果検証: 発生頻度が5回
    expect(aggregateResult.patterns.find((p) => p.patternId === 'timeout_error')?.frequency).toBe(5);

    // 接続エラーの集計結果検証: 発生頻度が2回
    expect(aggregateResult.patterns.find((p) => p.patternId === 'connection_error')?.frequency).toBe(2);

    // 全失敗パターンの合計が7回
    expect(aggregateResult.totalFailureCount).toBe(7);

    // 集計パターン数が2種類
    expect(aggregateResult.patterns).toHaveLength(2);

    // グラフ・チャート用の割合計算の検証
    const timeoutPattern = aggregateResult.patterns.find((p) => p.patternId === 'timeout_error');
    const connectionPattern = aggregateResult.patterns.find((p) => p.patternId === 'connection_error');

    expect(timeoutPattern?.percentageOfTotal).toBe((5 / 7) * 100);
    expect(connectionPattern?.percentageOfTotal).toBe((2 / 7) * 100);

    // タイムアウトエラーが最も高い優先度を持つことを確認（発生頻度が最大）
    expect(timeoutPattern?.priorityRank).toBe(1);
    expect(connectionPattern?.priorityRank).toBe(2);

    // 各パターンのカテゴリ情報が保持されていることを確認
    expect(timeoutPattern?.category).toBe('調理時間超過');
    expect(connectionPattern?.category).toBe('サーバーエラー');
  });
});