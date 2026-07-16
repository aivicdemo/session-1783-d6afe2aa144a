import { defineUserFeedbackExtractionSpec } from '../../src/logic/it-8-1-2-1';

describe('ユーザーフィードバック・利用ログ抽出仕様定義', () => {
  // SCEN-243
  test('改善レビュー会議結論データが空または不正な形式の場合、抽出仕様定義が失敗し適切なエラーメッセージが返される', () => {
    // ケース 1: 改善レビュー会議結論データが空文字列の場合
    expect(() =>
      defineUserFeedbackExtractionSpec({
        review_conclusion_data: '',
        target_extraction_data_types: ['user_feedback', 'app_log'],
        aggregation_period_start: '2024-01-01',
        aggregation_period_end: '2024-01-31',
        filter_conditions: { failure_category: 'nutrition_balance' },
        output_format: 'csv',
      })
    ).toThrow(/改善レビュー会議結論データ/);

    // ケース 2: 改善レビュー会議結論データが null の場合
    expect(() =>
      defineUserFeedbackExtractionSpec({
        review_conclusion_data: null as any,
        target_extraction_data_types: ['user_feedback', 'app_log'],
        aggregation_period_start: '2024-01-01',
        aggregation_period_end: '2024-01-31',
        filter_conditions: { failure_category: 'nutrition_balance' },
        output_format: 'csv',
      })
    ).toThrow(/改善レビュー会議結論データ/);

    // ケース 3: 改善レビュー会議結論データが特殊文字のみの場合
    expect(() =>
      defineUserFeedbackExtractionSpec({
        review_conclusion_data: '!@#$%^&*()',
        target_extraction_data_types: ['user_feedback', 'app_log'],
        aggregation_period_start: '2024-01-01',
        aggregation_period_end: '2024-01-31',
        filter_conditions: { failure_category: 'nutrition_balance' },
        output_format: 'csv',
      })
    ).toThrow(/改善レビュー会議結論データ/);

    // ケース 4: 改善レビュー会議結論データが改行コードのみの場合
    expect(() =>
      defineUserFeedbackExtractionSpec({
        review_conclusion_data: '\n\n\n',
        target_extraction_data_types: ['user_feedback', 'app_log'],
        aggregation_period_start: '2024-01-01',
        aggregation_period_end: '2024-01-31',
        filter_conditions: { failure_category: 'nutrition_balance' },
        output_format: 'csv',
      })
    ).toThrow(/改善レビュー会議結論データ/);

    // ケース 5: 改善レビュー会議結論データが無効な JSON 形式の場合
    expect(() =>
      defineUserFeedbackExtractionSpec({
        review_conclusion_data: '{ invalid json: }',
        target_extraction_data_types: ['user_feedback', 'app_log'],
        aggregation_period_start: '2024-01-01',
        aggregation_period_end: '2024-01-31',
        filter_conditions: { failure_category: 'nutrition_balance' },
        output_format: 'csv',
      })
    ).toThrow(/改善レビュー会議結論データ/);

    // ケース 6: 改善レビュー会議結論データが空白文字のみの場合
    expect(() =>
      defineUserFeedbackExtractionSpec({
        review_conclusion_data: '   \t  ',
        target_extraction_data_types: ['user_feedback', 'app_log'],
        aggregation_period_start: '2024-01-01',
        aggregation_period_end: '2024-01-31',
        filter_conditions: { failure_category: 'nutrition_balance' },
        output_format: 'csv',
      })
    ).toThrow(/改善レビュー会議結論データ/);

    // ケース 7: 改善レビュー会議結論データが未定義の場合
    expect(() =>
      defineUserFeedbackExtractionSpec({
        review_conclusion_data: undefined as any,
        target_extraction_data_types: ['user_feedback', 'app_log'],
        aggregation_period_start: '2024-01-01',
        aggregation_period_end: '2024-01-31',
        filter_conditions: { failure_category: 'nutrition_balance' },
        output_format: 'csv',
      })
    ).toThrow(/改善レビュー会議結論データ/);

    // ケース 8: 成功ケース - 正しい形式の改善レビュー会議結論データ
    const valid_conclusion_data = JSON.stringify({
      conclusion_id: 'review_20240115_001',
      issues_identified: [
        {
          issue_id: 'issue_001',
          category: 'nutrition_balance',
          severity: 'high',
        },
        {
          issue_id: 'issue_002',
          category: 'cooking_time_exceeded',
          severity: 'medium',
        },
      ],
      improvement_recommendations: [
        { recommendation_id: 'rec_001', priority: 1 },
      ],
      review_date: '2024-01-15',
      next_review_date: '2024-02-15',
    });

    const result = defineUserFeedbackExtractionSpec({
      review_conclusion_data: valid_conclusion_data,
      target_extraction_data_types: ['user_feedback', 'app_log'],
      aggregation_period_start: '2024-01-01',
      aggregation_period_end: '2024-01-31',
      filter_conditions: { failure_category: 'nutrition_balance' },
      output_format: 'csv',
    });

    expect(result).toBeDefined();
    expect(result.spec_id).toBeDefined();
    expect(result.target_extraction_data_types).toEqual([
      'user_feedback',
      'app_log',
    ]);
    expect(result.aggregation_period_start).toBe('2024-01-01');
    expect(result.aggregation_period_end).toBe('2024-01-31');
    expect(result.filter_conditions).toEqual({
      failure_category: 'nutrition_balance',
    });
    expect(result.output_format).toBe('csv');
    expect(result.extraction_spec_definition_status).toBe('defined');
    expect(result.definition_timestamp).toBeDefined();
  });
});