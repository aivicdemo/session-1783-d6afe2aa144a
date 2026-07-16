import { describe, it, expect, beforeEach } from '@jest/globals';
import { validateInterviewQuestionSchema } from '../../src/logic/it-8-1-1-1';

describe('it-8-1-1-1: Interview Question Schema Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-307
  it('should reject interview question input that does not conform to standardized schema', () => {
    const invalid_inputs = [
      {
        // Missing required field: question_id
        question_text: '調理時間の制限はありますか？',
        category: 'cooking_time',
        data_type: 'string',
      },
      {
        // Missing required field: question_text
        question_id: 'Q001',
        category: 'food_restriction',
        data_type: 'string',
      },
      {
        // Invalid category value
        question_id: 'Q002',
        question_text: '食材制限について教えてください',
        category: 'invalid_category',
        data_type: 'string',
      },
      {
        // Invalid data_type value
        question_id: 'Q003',
        question_text: '月の食費予算はいくらですか？',
        category: 'budget_constraint',
        data_type: 'invalid_type',
      },
      {
        // question_text exceeds max length (500 characters)
        question_id: 'Q004',
        question_text: 'a'.repeat(501),
        category: 'cooking_time',
        data_type: 'string',
      },
      {
        // Missing required field: data_type
        question_id: 'Q005',
        question_text: 'ご家族の人数は何名ですか？',
        category: 'family_composition',
      },
      {
        // Invalid question_id format (should be alphanumeric)
        question_id: 'Q@001',
        question_text: '朝食と夕食のどちらを重視しますか？',
        category: 'meal_preference',
        data_type: 'string',
      },
      {
        // question_id is empty string
        question_id: '',
        question_text: '週何日の献立を生成しますか？',
        category: 'meal_frequency',
        data_type: 'number',
      },
      {
        // question_text is empty string
        question_id: 'Q006',
        question_text: '',
        category: 'cooking_time',
        data_type: 'string',
      },
      {
        // Null required field
        question_id: null,
        question_text: '特定のアレルギーはありますか？',
        category: 'food_restriction',
        data_type: 'string',
      },
    ];

    invalid_inputs.forEach((invalid_input) => {
      expect(() => {
        validateInterviewQuestionSchema(invalid_input);
      }).toThrow(/スキーマ準拠/);
    });
  });

  it('should validate data type mismatch in expected_response_format', () => {
    const input_with_mismatched_type = {
      question_id: 'Q007',
      question_text: '食費の月予算を数値で入力してください',
      category: 'budget_constraint',
      data_type: 'number',
      expected_response_format: {
        type: 'string', // Mismatch: data_type says 'number'
        min_value: 100,
        max_value: 100000,
      },
    };

    expect(() => {
      validateInterviewQuestionSchema(input_with_mismatched_type);
    }).toThrow(/データ型/);
  });

  it('should accept valid interview question conforming to standardized schema', () => {
    const valid_input = {
      question_id: 'Q008',
      question_text: '調理に使える時間は1食あたり何分ですか？',
      category: 'cooking_time',
      data_type: 'number',
      expected_response_format: {
        type: 'number',
        min_value: 0,
        max_value: 180,
      },
    };

    const result = validateInterviewQuestionSchema(valid_input);
    expect(result).toEqual({
      is_valid: true,
      question_id: 'Q008',
      question_text: '調理に使える時間は1食あたり何分ですか？',
      category: 'cooking_time',
      data_type: 'number',
      expected_response_format: {
        type: 'number',
        min_value: 0,
        max_value: 180,
      },
      validation_timestamp: expect.any(String),
    });
  });

  it('should validate multiple valid questions and return array of validation results', () => {
    const valid_inputs = [
      {
        question_id: 'Q009',
        question_text: 'ご家族の人数を教えてください',
        category: 'family_composition',
        data_type: 'number',
        expected_response_format: {
          type: 'number',
          min_value: 1,
          max_value: 10,
        },
      },
      {
        question_id: 'Q010',
        question_text: '食物アレルギーの有無と種類を記入してください',
        category: 'food_restriction',
        data_type: 'string',
        expected_response_format: {
          type: 'string',
          max_length: 500,
        },
      },
      {
        question_id: 'Q011',
        question_text: '月の食費予算を教えてください',
        category: 'budget_constraint',
        data_type: 'number',
        expected_response_format: {
          type: 'number',
          min_value: 1000,
          max_value: 500000,
        },
      },
    ];

    const results = valid_inputs.map((input) =>
      validateInterviewQuestionSchema(input),
    );

    expect(results).toHaveLength(3);
    results.forEach((result, index) => {
      expect(result.is_valid).toBe(true);
      expect(result.question_id).toBe(`Q00${9 + index}`);
    });
  });

  it('should provide detailed error messages for specific schema violations', () => {
    const input_missing_category = {
      question_id: 'Q012',
      question_text: '献立の好みはありますか？',
      data_type: 'string',
    };

    expect(() => {
      validateInterviewQuestionSchema(input_missing_category);
    }).toThrow(/カテゴリ/);
  });

  it('should reject question_text exceeding character limit', () => {
    const input_oversized_text = {
      question_id: 'Q013',
      question_text: 'a'.repeat(501),
      category: 'food_restriction',
      data_type: 'string',
    };

    expect(() => {
      validateInterviewQuestionSchema(input_oversized_text);
    }).toThrow(/文字数/);
  });

  it('should validate question_id format strictly', () => {
    const inputs_with_invalid_format = [
      {
        question_id: 'invalid_id_format',
        question_text: '何か質問ですか？',
        category: 'cooking_time',
        data_type: 'string',
      },
      {
        question_id: 'Q-001',
        question_text: '何か質問ですか？',
        category: 'cooking_time',
        data_type: 'string',
      },
      {
        question_id: 'Q 001',
        question_text: '何か質問ですか？',
        category: 'cooking_time',
        data_type: 'string',
      },
    ];

    inputs_with_invalid_format.forEach((invalid_input) => {
      expect(() => {
        validateInterviewQuestionSchema(invalid_input);
      }).toThrow(/ID形式/);
    });
  });

  it('should validate allowed category values', () => {
    const input_with_invalid_category = {
      question_id: 'Q014',
      question_text: 'テスト質問',
      category: 'unknown_category',
      data_type: 'string',
    };

    expect(() => {
      validateInterviewQuestionSchema(input_with_invalid_category);
    }).toThrow(/カテゴリ/);
  });

  it('should validate allowed data_type values', () => {
    const input_with_invalid_type = {
      question_id: 'Q015',
      question_text: 'テスト質問',
      category: 'cooking_time',
      data_type: 'boolean_type',
    };

    expect(() => {
      validateInterviewQuestionSchema(input_with_invalid_type);
    }).toThrow(/データ型/);
  });

  it('should accept only predefined category enum values: cooking_time, food_restriction, budget_constraint, family_composition', () => {
    const valid_categories = [
      'cooking_time',
      'food_restriction',
      'budget_constraint',
      'family_composition',
    ];

    valid_categories.forEach((category) => {
      const valid_input = {
        question_id: 'Q016',
        question_text: 'テスト質問',
        category: category,
        data_type: 'string',
      };

      const result = validateInterviewQuestionSchema(valid_input);
      expect(result.is_valid).toBe(true);
      expect(result.category).toBe(category);
    });
  });

  it('should reject input with undefined or null values in required fields', () => {
    const invalid_nulls = [
      {
        question_id: undefined,
        question_text: '質問テキスト',
        category: 'cooking_time',
        data_type: 'string',
      },
      {
        question_id: 'Q017',
        question_text: undefined,
        category: 'cooking_time',
        data_type: 'string',
      },
      {
        question_id: 'Q018',
        question_text: '質問テキスト',
        category: undefined,
        data_type: 'string',
      },
      {
        question_id: 'Q019',
        question_text: '質問テキスト',
        category: 'cooking_time',
        data_type: undefined,
      },
    ];

    invalid_nulls.forEach((invalid_input) => {
      expect(() => {
        validateInterviewQuestionSchema(invalid_input);
      }).toThrow(/必須フィールド/);
    });
  });

  it('should validate response format constraints when present', () => {
    const input_with_constraint_violation = {
      question_id: 'Q020',
      question_text: '月の食費予算',
      category: 'budget_constraint',
      data_type: 'number',
      expected_response_format: {
        type: 'number',
        min_value: 100000,
        max_value: 50000, // Invalid: max < min
      },
    };

    expect(() => {
      validateInterviewQuestionSchema(input_with_constraint_violation);
    }).toThrow(/制約/);
  });
});