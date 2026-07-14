import { categorizeRejectionReasons } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-574: [normal] 献立却下修正理由の自動カテゴリ分類機能 - 献立却下理由テキストが事前定義カテゴリに正確に自動分類される
  test('献立却下修正理由のテキストが事前定義カテゴリに正確に自動分類される', () => {
    // テストデータ：複数の献立却下理由テキスト
    const test_reasons = [
      // テストケース1：栄養バランス関連
      'タンパク質の配分が不適切',
      // テストケース2：食材不適切関連
      '季節外れの食材を使用している',
      // テストケース3：アレルギー対応関連
      '特定アレルゲンの表示が不足している',
      // 追加テストケース：調理難度関連
      '調理手順が複雑すぎる',
      // 追加テストケース：コスト超過関連
      '食材コストが予算を超えている',
    ];

    const test_input = {
      rejection_reasons: test_reasons,
      timestamp: new Date('2024-01-15T11:00:00Z'),
    };

    const result = categorizeRejectionReasons(test_input);

    // 期待される分類結果：各テキストが正しいカテゴリに分類される
    const expected_categorized = [
      {
        reason_text: 'タンパク質の配分が不適切',
        category: '栄養バランス',
        confidence_score: 95,
      },
      {
        reason_text: '季節外れの食材を使用している',
        category: '食材不適切',
        confidence_score: 92,
      },
      {
        reason_text: '特定アレルゲンの表示が不足している',
        category: 'アレルギー対応',
        confidence_score: 98,
      },
      {
        reason_text: '調理手順が複雑すぎる',
        category: '調理難度',
        confidence_score: 89,
      },
      {
        reason_text: '食材コストが予算を超えている',
        category: 'コスト超過',
        confidence_score: 91,
      },
    ];

    // 分類結果が正確に期待値と一致することを確認
    expect(result.categorized_reasons).toEqual(expected_categorized);

    // 分類精度レポートの検証：正確性が要件を満たすことを確認
    const total_reasons = test_reasons.length;
    const correctly_classified = expected_categorized.length;
    const accuracy_percentage = (correctly_classified / total_reasons) * 100;

    expect(result.classification_accuracy_percentage).toBe(100);
    expect(result.total_reasons_processed).toBe(5);
    expect(result.correctly_classified_count).toBe(5);

    // カテゴリ別集計結果を検証
    const category_summary = result.category_summary;
    expect(category_summary['栄養バランス']).toBe(1);
    expect(category_summary['食材不適切']).toBe(1);
    expect(category_summary['アレルギー対応']).toBe(1);
    expect(category_summary['調理難度']).toBe(1);
    expect(category_summary['コスト超過']).toBe(1);

    // 平均信頼度スコアが高いことを確認
    const average_confidence =
      expected_categorized.reduce((sum, item) => sum + item.confidence_score, 0) /
      expected_categorized.length;
    expect(result.average_confidence_score).toBe(93);

    // タイムスタンプが正しく記録されていることを確認
    expect(result.processed_timestamp).toEqual(new Date('2024-01-15T11:00:00Z'));

    // 分類結果が事前定義カテゴリのみを含むことを確認
    const predefined_categories = [
      '栄養バランス',
      '食材不適切',
      '調理難度',
      'コスト超過',
      'アレルギー対応',
    ];
    result.categorized_reasons.forEach((item) => {
      expect(predefined_categories).toContain(item.category);
    });
  });
});