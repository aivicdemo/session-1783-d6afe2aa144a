import { recordRejectionReasonStructured } from '../../src/logic/it-1-br-2-1-2-1';

describe('改善提案却下・保留理由の構造化記録機能', () => {
  // SCEN-543
  test('理由カテゴリが不正な値のときは記録処理がエラーになる', () => {
    const invalidReasonCategoryValues = [
      'INVALID_CATEGORY',
      'undefined_value',
      '',
      'REJECT_ACCEPT', // 存在しないカテゴリ
      'HOLD_FUTURE', // 存在しないカテゴリ
    ];

    const baseInput = {
      proposalId: 'PROP_2024_001',
      divisionType: 'REJECTION',
      specificReason: '栄養基準アルゴリズムの変更は技術的に実現困難',
      recordedBy: 'PM_001',
      recordedAt: new Date('2024-01-15T10:30:00Z'),
    };

    // テスト1: 存在しないカテゴリ値でエラーが発生すること
    const invalidInput1 = {
      ...baseInput,
      reasonCategory: 'INVALID_CATEGORY',
    };
    expect(() => recordRejectionReasonStructured(invalidInput1)).toThrow(
      /理由カテゴリ/
    );

    // テスト2: 空文字列でエラーが発生すること
    const invalidInput2 = {
      ...baseInput,
      reasonCategory: '',
    };
    expect(() => recordRejectionReasonStructured(invalidInput2)).toThrow(
      /理由カテゴリ/
    );

    // テスト3: nullでエラーが発生すること
    const invalidInput3 = {
      ...baseInput,
      reasonCategory: null,
    };
    expect(() => recordRejectionReasonStructured(invalidInput3)).toThrow(
      /理由カテゴリ/
    );

    // テスト4: undefinedでエラーが発生すること
    const invalidInput4 = {
      ...baseInput,
      reasonCategory: undefined,
    };
    expect(() => recordRejectionReasonStructured(invalidInput4)).toThrow(
      /理由カテゴリ/
    );

    // テスト5: 正常な理由カテゴリ値でエラーが発生しないこと（成功パス）
    const validInput = {
      ...baseInput,
      reasonCategory: 'TECHNICAL_DIFFICULTY',
    };
    const result = recordRejectionReasonStructured(validInput);
    expect(result).toEqual({
      recordId: expect.any(String),
      proposalId: 'PROP_2024_001',
      reasonCategory: 'TECHNICAL_DIFFICULTY',
      divisionType: 'REJECTION',
      specificReason:
        '栄養基準アルゴリズムの変更は技術的に実現困難',
      recordedBy: 'PM_001',
      recordedAt: new Date('2024-01-15T10:30:00Z'),
      status: 'RECORDED',
      savedToDB: true,
    });

    // テスト6: 別の正常な理由カテゴリ値でも成功すること
    const validInput2 = {
      ...baseInput,
      reasonCategory: 'BUSINESS_PRIORITY',
      divisionType: 'HOLD',
    };
    const result2 = recordRejectionReasonStructured(validInput2);
    expect(result2.status).toBe('RECORDED');
    expect(result2.savedToDB).toBe(true);
    expect(result2.divisionType).toBe('HOLD');
  });
});