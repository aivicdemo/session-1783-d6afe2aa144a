import { classifyRejectReason } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-565: [edge] 献立却下修正理由の自動カテゴリ分類機能 - 既知カテゴリに該当しない却下理由が入力された場合、その旨が記録され新規カテゴリ候補として推奨される
  test('既知カテゴリに該当しない新規の却下理由が入力された場合、未分類として記録され新規カテゴリ候補として推奨される', () => {
    const rejection_reason_text = '調理設備の故障により実現不可';
    const known_categories = [
      '栄養バランス',
      'アレルギー対応',
      '予算超過',
      '調理時間超過',
      '食材在庫不足',
      '家族の好み未反映'
    ];
    const timestamp = new Date('2024-01-15T14:30:00Z');
    const user_id = 'user_12345';

    const result = classifyRejectReason({
      rejection_reason_text,
      known_categories,
      timestamp,
      user_id
    });

    // 既知カテゴリに該当しないため、classification_result が 'unknown' であることを検証
    expect(result.classification_result).toBe('unknown');

    // 入力された却下理由がそのまま記録されていることを検証
    expect(result.original_reason_text).toBe('調理設備の故障により実現不可');

    // 既知カテゴリ外として明確に記録されていることを検証
    expect(result.is_known_category).toBe(false);

    // 新規カテゴリ候補が生成されていることを検証
    expect(result.suggested_new_categories).toBeDefined();
    expect(Array.isArray(result.suggested_new_categories)).toBe(true);
    expect(result.suggested_new_categories.length).toBeGreaterThan(0);

    // 推奨カテゴリ候補に適切なカテゴリ名が提案されていることを検証
    const first_suggestion = result.suggested_new_categories[0];
    expect(first_suggestion.category_name).toBeDefined();
    expect(typeof first_suggestion.category_name).toBe('string');
    expect(first_suggestion.category_name.length).toBeGreaterThan(0);

    // 関連度スコアが 0～1 の範囲で算出されていることを検証
    expect(first_suggestion.relevance_score).toBeGreaterThanOrEqual(0);
    expect(first_suggestion.relevance_score).toBeLessThanOrEqual(1);

    // タイムスタンプが正確に記録されていることを検証
    expect(result.processed_timestamp).toEqual(timestamp);

    // ユーザーID が記録されていることを検証
    expect(result.user_id).toBe('user_12345');

    // 新規カテゴリ候補が関連度スコアの高い順にソートされていることを検証
    for (let i = 0; i < result.suggested_new_categories.length - 1; i++) {
      expect(result.suggested_new_categories[i].relevance_score).toBeGreaterThanOrEqual(
        result.suggested_new_categories[i + 1].relevance_score
      );
    }

    // 推奨される新規カテゴリ名の妥当性を検証（例："設備トラブル" など業務的に関連のあるカテゴリが提案されていること）
    const category_names = result.suggested_new_categories.map(
      (cat: { category_name: string }) => cat.category_name
    );
    expect(category_names.some((name: string) => name.includes('設備') || name.includes('トラブル'))).toBe(
      true
    );
  });
});