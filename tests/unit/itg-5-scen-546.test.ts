import { validateMealFeedbackScore } from '../../src/logic/it-7-2-1';

describe('献立評価フィードバック蓄積機能 - 満足度スコアバリデーション', () => {
  // SCEN-546: [error] 献立評価フィードバック蓄積機能 - 満足度スコアが0～5の範囲外の場合にエラーを返す
  test('満足度スコアが範囲外の値の場合、エラーをスロー', () => {
    const validMealId = 'meal_001';
    const userId = 'user_123';
    const completionDegree = 4.5;
    const request = 'more_spicy';

    // ケース1: 満足度スコアが -1 の場合
    expect(() => {
      validateMealFeedbackScore({
        meal_id: validMealId,
        user_id: userId,
        satisfaction_score: -1,
        completion_degree: completionDegree,
        request: request,
      });
    }).toThrow(/満足度スコア/);

    // ケース2: 満足度スコアが 6 の場合
    expect(() => {
      validateMealFeedbackScore({
        meal_id: validMealId,
        user_id: userId,
        satisfaction_score: 6,
        completion_degree: completionDegree,
        request: request,
      });
    }).toThrow(/満足度スコア/);

    // ケース3: 満足度スコアが 100 の場合
    expect(() => {
      validateMealFeedbackScore({
        meal_id: validMealId,
        user_id: userId,
        satisfaction_score: 100,
        completion_degree: completionDegree,
        request: request,
      });
    }).toThrow(/満足度スコア/);
  });

  // 正常系: 満足度スコアが0～5の範囲内の場合、バリデーション成功
  test('満足度スコアが0～5の範囲内の場合、バリデーション成功', () => {
    const validMealId = 'meal_002';
    const userId = 'user_456';
    const completionDegree = 3.2;
    const request = 'less_salt';

    // ケース1: 満足度スコアが 0 の場合
    const result0 = validateMealFeedbackScore({
      meal_id: validMealId,
      user_id: userId,
      satisfaction_score: 0,
      completion_degree: completionDegree,
      request: request,
    });
    expect(result0).toEqual({
      is_valid: true,
      meal_id: validMealId,
      user_id: userId,
      satisfaction_score: 0,
      completion_degree: completionDegree,
      request: request,
    });

    // ケース2: 満足度スコアが 2.5 の場合
    const result2_5 = validateMealFeedbackScore({
      meal_id: validMealId,
      user_id: userId,
      satisfaction_score: 2.5,
      completion_degree: completionDegree,
      request: request,
    });
    expect(result2_5).toEqual({
      is_valid: true,
      meal_id: validMealId,
      user_id: userId,
      satisfaction_score: 2.5,
      completion_degree: completionDegree,
      request: request,
    });

    // ケース3: 満足度スコアが 5 の場合
    const result5 = validateMealFeedbackScore({
      meal_id: validMealId,
      user_id: userId,
      satisfaction_score: 5,
      completion_degree: completionDegree,
      request: request,
    });
    expect(result5).toEqual({
      is_valid: true,
      meal_id: validMealId,
      user_id: userId,
      satisfaction_score: 5,
      completion_degree: completionDegree,
      request: request,
    });
  });
});