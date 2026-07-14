import { classifyRejectReasonCategory } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類機能', () => {
  // SCEN-919: [edge] 却下修正理由の自動カテゴリ分類機能 - 空文字列または不完全なテキストデータが不完全データフラグでマークされる
  test('SCEN-919: 空文字列および不完全なテキストデータが入力された場合、不完全データフラグが正確にマークされる', () => {
    // 空文字列パターン
    const emptyStringResult = classifyRejectReasonCategory({
      reasonText: '',
      timestamp: new Date('2024-01-15T11:00:00Z').toISOString(),
    });
    expect(emptyStringResult.isIncompleteData).toBe(true);
    expect(emptyStringResult.category).toBe('INCOMPLETE');
    expect(emptyStringResult.confidence).toBe(0);

    // 1文字パターン
    const singleCharResult = classifyRejectReasonCategory({
      reasonText: 'a',
      timestamp: new Date('2024-01-15T11:00:00Z').toISOString(),
    });
    expect(singleCharResult.isIncompleteData).toBe(true);
    expect(singleCharResult.category).toBe('INCOMPLETE');

    // 特殊文字のみパターン
    const specialCharOnlyResult = classifyRejectReasonCategory({
      reasonText: '!!!',
      timestamp: new Date('2024-01-15T11:00:00Z').toISOString(),
    });
    expect(specialCharOnlyResult.isIncompleteData).toBe(true);
    expect(specialCharOnlyResult.category).toBe('INCOMPLETE');

    // 制御文字含むパターン
    const controlCharResult = classifyRejectReasonCategory({
      reasonText: '\n\t\r',
      timestamp: new Date('2024-01-15T11:00:00Z').toISOString(),
    });
    expect(controlCharResult.isIncompleteData).toBe(true);
    expect(controlCharResult.category).toBe('INCOMPLETE');

    // ホワイトスペースのみパターン
    const whitespaceOnlyResult = classifyRejectReasonCategory({
      reasonText: '   ',
      timestamp: new Date('2024-01-15T11:00:00Z').toISOString(),
    });
    expect(whitespaceOnlyResult.isIncompleteData).toBe(true);
    expect(whitespaceOnlyResult.category).toBe('INCOMPLETE');

    // null パターン（エラーをスロー）
    expect(() =>
      classifyRejectReasonCategory({
        reasonText: null as any,
        timestamp: new Date('2024-01-15T11:00:00Z').toISOString(),
      })
    ).toThrow(/テキスト/);

    // undefined パターン（エラーをスロー）
    expect(() =>
      classifyRejectReasonCategory({
        reasonText: undefined as any,
        timestamp: new Date('2024-01-15T11:00:00Z').toISOString(),
      })
    ).toThrow(/テキスト/);

    // 正常な入力パターン（栄養バランスカテゴリ）
    const validNutritionResult = classifyRejectReasonCategory({
      reasonText: '栄養バランスが家族の好みに合致していません',
      timestamp: new Date('2024-01-15T11:00:00Z').toISOString(),
    });
    expect(validNutritionResult.isIncompleteData).toBe(false);
    expect(validNutritionResult.category).toBe('NUTRITION');
    expect(validNutritionResult.confidence).toBeGreaterThan(0.7);

    // 正常な入力パターン（調理時間カテゴリ）
    const validCookingTimeResult = classifyRejectReasonCategory({
      reasonText: '調理時間が長すぎます',
      timestamp: new Date('2024-01-15T11:00:00Z').toISOString(),
    });
    expect(validCookingTimeResult.isIncompleteData).toBe(false);
    expect(validCookingTimeResult.category).toBe('COOKING_TIME');
    expect(validCookingTimeResult.confidence).toBeGreaterThan(0.7);

    // 正常な入力パターン（食材制限カテゴリ）
    const validFoodRestrictionResult = classifyRejectReasonCategory({
      reasonText: '子どもがアレルギーを持つ食材が含まれています',
      timestamp: new Date('2024-01-15T11:00:00Z').toISOString(),
    });
    expect(validFoodRestrictionResult.isIncompleteData).toBe(false);
    expect(validFoodRestrictionResult.category).toBe('FOOD_RESTRICTION');
    expect(validFoodRestrictionResult.confidence).toBeGreaterThan(0.7);

    // 不完全データフラグは一貫して保持される
    const firstEmptyCheck = classifyRejectReasonCategory({
      reasonText: '',
      timestamp: new Date('2024-01-15T11:00:00Z').toISOString(),
    });
    const secondEmptyCheck = classifyRejectReasonCategory({
      reasonText: '',
      timestamp: new Date('2024-01-15T12:00:00Z').toISOString(),
    });
    expect(firstEmptyCheck.isIncompleteData).toBe(secondEmptyCheck.isIncompleteData);
    expect(firstEmptyCheck.category).toBe(secondEmptyCheck.category);
  });
});