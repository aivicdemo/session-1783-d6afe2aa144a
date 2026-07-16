import { consolidateAndDeduplicateImprovementIssues } from '../../src/logic/it-8-1-1-1';

describe('ユーザーインタビュー記録と利用ログからペイン要因を抽出・分類し優先度マトリクスを生成', () => {
  // SCEN-210: [error] 改善課題リスト統合・重複排除機能 - 入力フィードバックが不完全または形式が不正な場合、エラーハンドリングが正常に実行される
  test('should handle incomplete or invalid feedback data with proper error handling', () => {
    // ハッピーパス: 完全で正常なフィードバックデータ
    const valid_feedback_list = [
      {
        feedback_id: 'fb_001',
        user_segment: 'house_husband_30s',
        pain_category: 'cooking_time',
        impact_score: 8.5,
        frequency_count: 12,
        description: '30分以内の献立が足りない'
      },
      {
        feedback_id: 'fb_002',
        user_segment: 'house_husband_30s',
        pain_category: 'cooking_time',
        impact_score: 8.2,
        frequency_count: 10,
        description: '時短レシピが必要'
      }
    ];

    const valid_verification_issues = [
      {
        issue_id: 'vi_001',
        pain_category: 'cooking_time',
        user_segment: 'house_husband_30s',
        severity_level: 'high'
      }
    ];

    const valid_result = consolidateAndDeduplicateImprovementIssues(
      valid_feedback_list,
      valid_verification_issues
    );

    expect(valid_result).toBeDefined();
    expect(valid_result.consolidated_issues).toBeDefined();
    expect(Array.isArray(valid_result.consolidated_issues)).toBe(true);
    expect(valid_result.duplication_count).toBe(1);
    expect(valid_result.impact_scope).toBeDefined();
    expect(valid_result.system_status).toBe('success');

    // エラーケース1: フィードバックリストが null または undefined
    expect(() => 
      consolidateAndDeduplicateImprovementIssues(null as any, valid_verification_issues)
    ).toThrow(/フィードバック/);

    // エラーケース2: フィードバックリストが空配列（最小サンプル数未満）
    expect(() =>
      consolidateAndDeduplicateImprovementIssues([], valid_verification_issues)
    ).toThrow(/サンプル数/);

    // エラーケース3: フィードバック要素に必須フィールドが欠落
    const incomplete_feedback = [
      {
        feedback_id: 'fb_003',
        user_segment: 'house_husband_30s'
        // pain_category が欠落
      }
    ];
    expect(() =>
      consolidateAndDeduplicateImprovementIssues(
        incomplete_feedback as any,
        valid_verification_issues
      )
    ).toThrow(/必須フィールド/);

    // エラーケース4: pain_category の値が不正（許可されていない値）
    const invalid_category_feedback = [
      {
        feedback_id: 'fb_004',
        user_segment: 'house_husband_30s',
        pain_category: 'invalid_category_xyz',
        impact_score: 7.0,
        frequency_count: 5,
        description: '無効なカテゴリ'
      }
    ];
    expect(() =>
      consolidateAndDeduplicateImprovementIssues(
        invalid_category_feedback,
        valid_verification_issues
      )
    ).toThrow(/カテゴリ/);

    // エラーケース5: impact_score が数値範囲外
    const out_of_range_feedback = [
      {
        feedback_id: 'fb_005',
        user_segment: 'house_husband_30s',
        pain_category: 'cooking_time',
        impact_score: 15.5, // 範囲外（0～10)
        frequency_count: 3,
        description: 'スコア範囲外'
      }
    ];
    expect(() =>
      consolidateAndDeduplicateImprovementIssues(
        out_of_range_feedback,
        valid_verification_issues
      )
    ).toThrow(/スコア/);

    // エラーケース6: verification_issues が null または undefined
    expect(() =>
      consolidateAndDeduplicateImprovementIssues(
        valid_feedback_list,
        null as any
      )
    ).toThrow(/検証結果/);

    // エラーケース7: frequency_count が負数
    const negative_frequency_feedback = [
      {
        feedback_id: 'fb_006',
        user_segment: 'house_husband_30s',
        pain_category: 'budget_constraint',
        impact_score: 6.5,
        frequency_count: -2, // 負数
        description: '件数が負'
      }
    ];
    expect(() =>
      consolidateAndDeduplicateImprovementIssues(
        negative_frequency_feedback,
        valid_verification_issues
      )
    ).toThrow(/頻度/);

    // エラーケース8: user_segment が空文字列
    const empty_segment_feedback = [
      {
        feedback_id: 'fb_007',
        user_segment: '', // 空文字列
        pain_category: 'food_restriction',
        impact_score: 5.0,
        frequency_count: 4,
        description: 'セグメント空'
      }
    ];
    expect(() =>
      consolidateAndDeduplicateImprovementIssues(
        empty_segment_feedback,
        valid_verification_issues
      )
    ).toThrow(/セグメント/);

    // エラーケース9: description が null
    const null_description_feedback = [
      {
        feedback_id: 'fb_008',
        user_segment: 'house_husband_40s',
        pain_category: 'cooking_time',
        impact_score: 7.2,
        frequency_count: 6,
        description: null // null
      }
    ];
    expect(() =>
      consolidateAndDeduplicateImprovementIssues(
        null_description_feedback as any,
        valid_verification_issues
      )
    ).toThrow(/説明/);

    // エラーケース10: verification_issues 要素に必須フィールド欠落
    const incomplete_verification = [
      {
        issue_id: 'vi_002'
        // pain_category が欠落
      }
    ];
    expect(() =>
      consolidateAndDeduplicateImprovementIssues(
        valid_feedback_list,
        incomplete_verification as any
      )
    ).toThrow(/検証結果.*必須/);

    // 複合エラーケース: 複数の不完全な要素を含む
    const mixed_invalid_feedback = [
      {
        feedback_id: 'fb_009',
        user_segment: 'house_husband_30s',
        pain_category: 'cooking_time',
        impact_score: 9.5,
        frequency_count: 8,
        description: '有効なフィードバック'
      },
      {
        feedback_id: 'fb_010',
        user_segment: '', // 無効
        pain_category: 'food_restriction',
        impact_score: 11.0, // 範囲外
        frequency_count: -1, // 負数
        description: '複数エラー'
      }
    ];
    expect(() =>
      consolidateAndDeduplicateImprovementIssues(
        mixed_invalid_feedback,
        valid_verification_issues
      )
    ).toThrow(/セグメント|スコア|頻度/);

    // リトライ可能性の検証: エラー後の再入力テスト
    const retry_feedback = [
      {
        feedback_id: 'fb_011',
        user_segment: 'house_husband_50s',
        pain_category: 'budget_constraint',
        impact_score: 7.8,
        frequency_count: 9,
        description: 'リトライテスト用フィードバック'
      }
    ];

    const retry_verification = [
      {
        issue_id: 'vi_003',
        pain_category: 'budget_constraint',
        user_segment: 'house_husband_50s',
        severity_level: 'medium'
      }
    ];

    // リトライが成功することを検証
    const retry_result = consolidateAndDeduplicateImprovementIssues(
      retry_feedback,
      retry_verification
    );
    expect(retry_result.system_status).toBe('success');
    expect(retry_result.consolidated_issues.length).toBeGreaterThan(0);
  });
});