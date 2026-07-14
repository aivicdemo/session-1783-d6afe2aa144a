import { classifyAndAggregateFailurePatterns } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-861
  test('定義されていないカテゴリが検出された場合に分類エラーが返却される', () => {
    const invalid_category_data = {
      failure_patterns: [
        {
          pattern_id: 'fp_001',
          user_id: 'user_123',
          reason_text: 'タンパク質が不足しています',
          input_category: 'nutrition',
          timestamp: '2024-01-15T10:30:00Z'
        },
        {
          pattern_id: 'fp_002',
          user_id: 'user_123',
          reason_text: '子どもが好きな食材が入っていない',
          input_category: 'undefined_category_xyz',
          timestamp: '2024-01-15T10:35:00Z'
        }
      ],
      valid_categories: ['nutrition', 'preference', 'cooking_time', 'budget', 'ingredient_restriction']
    };

    expect(() => classifyAndAggregateFailurePatterns(invalid_category_data)).toThrow(/カテゴリ/);
  });
});