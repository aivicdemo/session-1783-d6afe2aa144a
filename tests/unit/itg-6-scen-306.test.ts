import { standardizeInterviewQuestionsAndResponses } from '../../src/logic/it-8-1-1-1';

describe('ユーザーインタビュー記録の質問項目標準化・回答フォーマット統一', () => {
  // SCEN-306
  test('インタビュー質問項目が標準化され、複数の異なる回答フォーマットがすべて統一フォーマットに統合される', () => {
    const input_non_standardized_questions = [
      {
        question_id: 'Q001',
        question_text: '食材制限はありますか？',
        response_format: 'text',
        responses: ['アレルギーで卵が食べられません', '特に制限なし', '牛乳は避けたいです']
      },
      {
        question_id: 'Q002',
        question_text: '調理時間の制約',
        response_format: 'choice',
        choice_options: ['15分以内', '30分以内', '60分以内', '制限なし'],
        responses: [1, 2, 0, 3]
      },
      {
        question_id: 'Q003',
        question_text: '予算制約の程度を教えてください',
        response_format: 'likert',
        likert_scale: 5,
        responses: [3, 4, 2, 5, 1]
      }
    ];

    const result = standardizeInterviewQuestionsAndResponses(input_non_standardized_questions);

    expect(result).toBeDefined();
    expect(result.standardized_questions).toBeDefined();
    expect(result.standardized_questions.length).toBe(3);

    // 質問項目の標準化確認
    expect(result.standardized_questions[0]).toEqual({
      question_id: 'Q001',
      question_text: '食材制限はありますか？',
      standardized_format: 'text_array',
      pain_category: '食材制限',
      responses: [
        { standardized_value: 'アレルギーで卵が食べられません', original_format: 'text' },
        { standardized_value: '特に制限なし', original_format: 'text' },
        { standardized_value: '牛乳は避けたいです', original_format: 'text' }
      ]
    });

    // 選択肢形式の標準化確認
    expect(result.standardized_questions[1]).toEqual({
      question_id: 'Q002',
      question_text: '調理時間の制約',
      standardized_format: 'choice_index',
      pain_category: '調理時間制限',
      choice_mapping: {
        0: '15分以内',
        1: '30分以内',
        2: '60分以内',
        3: '制限なし'
      },
      responses: [
        { standardized_value: 1, original_format: 'choice', decoded_label: '30分以内' },
        { standardized_value: 2, original_format: 'choice', decoded_label: '60分以内' },
        { standardized_value: 0, original_format: 'choice', decoded_label: '15分以内' },
        { standardized_value: 3, original_format: 'choice', decoded_label: '制限なし' }
      ]
    });

    // Likertスケール形式の標準化確認
    expect(result.standardized_questions[2]).toEqual({
      question_id: 'Q003',
      question_text: '予算制約の程度を教えてください',
      standardized_format: 'likert_scale_normalized',
      pain_category: '予算制約',
      likert_scale: 5,
      responses: [
        { standardized_value: 3, original_format: 'likert', normalized_0_to_1: 0.5 },
        { standardized_value: 4, original_format: 'likert', normalized_0_to_1: 0.75 },
        { standardized_value: 2, original_format: 'likert', normalized_0_to_1: 0.25 },
        { standardized_value: 5, original_format: 'likert', normalized_0_to_1: 1.0 },
        { standardized_value: 1, original_format: 'likert', normalized_0_to_1: 0.0 }
      ]
    });

    // 統一フォーマット後の回答データ一貫性確認
    expect(result.unified_response_structure).toEqual({
      response_id: expect.any(String),
      question_id: expect.any(String),
      standardized_format: expect.any(String),
      standardized_value: expect.any([String, Number]),
      original_format: expect.any(String),
      pain_category: expect.any(String),
      extracted_at: expect.any(String)
    });

    // 検索・フィルタリング対応確認
    expect(result.filterable_index).toBeDefined();
    expect(result.filterable_index.by_pain_category).toBeDefined();
    expect(result.filterable_index.by_pain_category['食材制限']).toEqual(['Q001']);
    expect(result.filterable_index.by_pain_category['調理時間制限']).toEqual(['Q002']);
    expect(result.filterable_index.by_pain_category['予算制約']).toEqual(['Q003']);

    // 分析準備完了の確認
    expect(result.analysis_ready).toBe(true);
    expect(result.total_questions_standardized).toBe(3);
    expect(result.total_responses_unified).toBe(11);
    expect(result.standardization_completion_percentage).toBe(100);
  });
});