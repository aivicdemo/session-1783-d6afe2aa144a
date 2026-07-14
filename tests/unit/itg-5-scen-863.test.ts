import { classifyAndAggregateFailurePatterns } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-863: [edge] 失敗パターン分類・集計機能 - 単一のカテゴリのみが存在する場合に該当カテゴリの発生頻度が100%と算出される
  test('単一カテゴリのみが存在する場合、該当カテゴリの発生頻度が100%として算出される', () => {
    const failurePatternDataset = [
      {
        id: 1,
        reason_text: 'ネットワーク接続エラーが発生しました',
        timestamp: '2024-01-15T10:00:00Z',
        user_id: 'user_001'
      },
      {
        id: 2,
        reason_text: 'サーバーが一時的に利用できません',
        timestamp: '2024-01-15T10:15:00Z',
        user_id: 'user_001'
      },
      {
        id: 3,
        reason_text: '通信エラーが発生しました',
        timestamp: '2024-01-15T10:30:00Z',
        user_id: 'user_002'
      },
      {
        id: 4,
        reason_text: 'インターネット接続がタイムアウトしました',
        timestamp: '2024-01-15T10:45:00Z',
        user_id: 'user_003'
      }
    ];

    const result = classifyAndAggregateFailurePatterns(failurePatternDataset);

    expect(result.total_count).toBe(4);
    expect(result.categories).toBeDefined();
    expect(Array.isArray(result.categories)).toBe(true);
    
    const networkErrorCategory = result.categories.find(
      (cat: { category_name: string; occurrence_frequency: number }) => 
        cat.category_name === 'ネットワークエラー'
    );

    expect(networkErrorCategory).toBeDefined();
    expect(networkErrorCategory.occurrence_frequency).toBe(100);
    expect(typeof networkErrorCategory.occurrence_frequency).toBe('number');
    
    expect(result.categories.length).toBe(1);
    
    const expectedFormula = (4 / 4) * 100;
    expect(networkErrorCategory.occurrence_frequency).toBe(expectedFormula);
  });
});