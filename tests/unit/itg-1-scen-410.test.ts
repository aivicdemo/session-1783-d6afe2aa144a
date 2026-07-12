import { validateMealRating } from '../../src/logic/it-1-br-1783670064270-1-1-1';

describe('食事評価入力バリデーション機能', () => {
  test('SCEN-410: 満足度・完食度・リクエストすべてが入力されて送信された場合、バリデーション成功としてデータベースに保存される', () => {
    const mealRatingInput = {
      mealId: 'meal_20240115_001',
      familyMemberId: 'member_father_001',
      satisfactionScore: 4,
      completionRate: 5,
      requestText: '味付けが好みです',
      timestamp: new Date('2024-01-15T19:30:00Z'),
    };

    const result = validateMealRating(mealRatingInput);

    expect(result.isValid).toBe(true);
    expect(result.mealId).toBe('meal_20240115_001');
    expect(result.familyMemberId).toBe('member_father_001');
    expect(result.satisfactionScore).toBe(4);
    expect(result.completionRate).toBe(5);
    expect(result.requestText).toBe('味付けが好みです');
    expect(result.savedToDatabase).toBe(true);
    expect(result.message).toBe('データ保存成功');
  });

  test('SCEN-410-ERR-001: 満足度スコアが1～5の範囲外の場合、バリデーション失敗', () => {
    const mealRatingInput = {
      mealId: 'meal_20240115_001',
      familyMemberId: 'member_father_001',
      satisfactionScore: 6,
      completionRate: 5,
      requestText: '味付けが好みです',
      timestamp: new Date('2024-01-15T19:30:00Z'),
    };

    expect(() => validateMealRating(mealRatingInput)).toThrow(/満足度スコア/);
  });

  test('SCEN-410-ERR-002: 完食度が1～5の範囲外の場合、バリデーション失敗', () => {
    const mealRatingInput = {
      mealId: 'meal_20240115_001',
      familyMemberId: 'member_father_001',
      satisfactionScore: 4,
      completionRate: 0,
      requestText: '味付けが好みです',
      timestamp: new Date('2024-01-15T19:30:00Z'),
    };

    expect(() => validateMealRating(mealRatingInput)).toThrow(/完食度/);
  });

  test('SCEN-410-ERR-003: リクエストテキストが空文字列の場合、バリデーション失敗', () => {
    const mealRatingInput = {
      mealId: 'meal_20240115_001',
      familyMemberId: 'member_father_001',
      satisfactionScore: 4,
      completionRate: 5,
      requestText: '',
      timestamp: new Date('2024-01-15T19:30:00Z'),
    };

    expect(() => validateMealRating(mealRatingInput)).toThrow(/リクエスト/);
  });

  test('SCEN-410-ERR-004: mealIdが未指定の場合、バリデーション失敗', () => {
    const mealRatingInput = {
      mealId: '',
      familyMemberId: 'member_father_001',
      satisfactionScore: 4,
      completionRate: 5,
      requestText: '味付けが好みです',
      timestamp: new Date('2024-01-15T19:30:00Z'),
    };

    expect(() => validateMealRating(mealRatingInput)).toThrow(/献立ID/);
  });

  test('SCEN-410-ERR-005: familyMemberIdが未指定の場合、バリデーション失敗', () => {
    const mealRatingInput = {
      mealId: 'meal_20240115_001',
      familyMemberId: '',
      satisfactionScore: 4,
      completionRate: 5,
      requestText: '味付けが好みです',
      timestamp: new Date('2024-01-15T19:30:00Z'),
    };

    expect(() => validateMealRating(mealRatingInput)).toThrow(/家族成員ID/);
  });

  test('SCEN-410-BOUNDARY: 満足度スコア最小値（1）でバリデーション成功', () => {
    const mealRatingInput = {
      mealId: 'meal_20240115_002',
      familyMemberId: 'member_child_001',
      satisfactionScore: 1,
      completionRate: 1,
      requestText: '別の味付けを試してみたいです',
      timestamp: new Date('2024-01-15T20:00:00Z'),
    };

    const result = validateMealRating(mealRatingInput);

    expect(result.isValid).toBe(true);
    expect(result.satisfactionScore).toBe(1);
    expect(result.completionRate).toBe(1);
    expect(result.savedToDatabase).toBe(true);
  });

  test('SCEN-410-BOUNDARY: 満足度スコア最大値（5）でバリデーション成功', () => {
    const mealRatingInput = {
      mealId: 'meal_20240115_003',
      familyMemberId: 'member_mother_001',
      satisfactionScore: 5,
      completionRate: 5,
      requestText: '素晴らしい料理でした',
      timestamp: new Date('2024-01-15T20:30:00Z'),
    };

    const result = validateMealRating(mealRatingInput);

    expect(result.isValid).toBe(true);
    expect(result.satisfactionScore).toBe(5);
    expect(result.completionRate).toBe(5);
    expect(result.savedToDatabase).toBe(true);
  });

  test('SCEN-410-EDGE: リクエストテキストが最大文字数（500文字）でバリデーション成功', () => {
    const longRequestText = 'あ'.repeat(500);

    const mealRatingInput = {
      mealId: 'meal_20240115_004',
      familyMemberId: 'member_father_001',
      satisfactionScore: 3,
      completionRate: 4,
      requestText: longRequestText,
      timestamp: new Date('2024-01-15T21:00:00Z'),
    };

    const result = validateMealRating(mealRatingInput);

    expect(result.isValid).toBe(true);
    expect(result.requestText.length).toBe(500);
    expect(result.savedToDatabase).toBe(true);
  });

  test('SCEN-410-ERR-006: リクエストテキストが最大文字数（500文字）を超える場合、バリデーション失敗', () => {
    const overLengthRequestText = 'あ'.repeat(501);

    const mealRatingInput = {
      mealId: 'meal_20240115_005',
      familyMemberId: 'member_father_001',
      satisfactionScore: 3,
      completionRate: 4,
      requestText: overLengthRequestText,
      timestamp: new Date('2024-01-15T21:30:00Z'),
    };

    expect(() => validateMealRating(mealRatingInput)).toThrow(/文字数/);
  });
});