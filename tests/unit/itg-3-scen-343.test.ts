import { recordMealEvaluation } from '../../src/logic/it-1-br-3-2-1';

describe('食事評価データの時系列蓄積・管理機能', () => {
  // SCEN-343
  test('評価データに必須項目が不足している場合、エラーが返される', () => {
    const valid_meal_eval_base = {
      user_id: 'user_001',
      family_member_id: 'member_001',
      meal_date: new Date('2024-01-15T19:00:00Z'),
      meal_content: 'fish_and_rice',
      satisfaction_score: 85,
      completion_rate: 90,
      nutritional_rating: 8,
      request_text: 'もっと塩辛くしてほしい',
    };

    // ハッピーパス: すべての必須項目が揃っている場合は成功
    const result_success = recordMealEvaluation({
      user_id: valid_meal_eval_base.user_id,
      family_member_id: valid_meal_eval_base.family_member_id,
      meal_date: valid_meal_eval_base.meal_date,
      meal_content: valid_meal_eval_base.meal_content,
      satisfaction_score: valid_meal_eval_base.satisfaction_score,
      completion_rate: valid_meal_eval_base.completion_rate,
      nutritional_rating: valid_meal_eval_base.nutritional_rating,
      request_text: valid_meal_eval_base.request_text,
    });
    expect(result_success).toHaveProperty('evaluation_id');
    expect(result_success.evaluation_id).toBeTruthy();
    expect(result_success).toHaveProperty('recorded_at');

    // エラーパス1: 食事日時が不足している場合
    expect(() =>
      recordMealEvaluation({
        user_id: valid_meal_eval_base.user_id,
        family_member_id: valid_meal_eval_base.family_member_id,
        meal_date: undefined as any,
        meal_content: valid_meal_eval_base.meal_content,
        satisfaction_score: valid_meal_eval_base.satisfaction_score,
        completion_rate: valid_meal_eval_base.completion_rate,
        nutritional_rating: valid_meal_eval_base.nutritional_rating,
        request_text: valid_meal_eval_base.request_text,
      })
    ).toThrow(/食事日時/);

    // エラーパス2: 食事内容が不足している場合
    expect(() =>
      recordMealEvaluation({
        user_id: valid_meal_eval_base.user_id,
        family_member_id: valid_meal_eval_base.family_member_id,
        meal_date: valid_meal_eval_base.meal_date,
        meal_content: '' as any,
        satisfaction_score: valid_meal_eval_base.satisfaction_score,
        completion_rate: valid_meal_eval_base.completion_rate,
        nutritional_rating: valid_meal_eval_base.nutritional_rating,
        request_text: valid_meal_eval_base.request_text,
      })
    ).toThrow(/食事内容/);

    // エラーパス3: 栄養価評価が不足している場合
    expect(() =>
      recordMealEvaluation({
        user_id: valid_meal_eval_base.user_id,
        family_member_id: valid_meal_eval_base.family_member_id,
        meal_date: valid_meal_eval_base.meal_date,
        meal_content: valid_meal_eval_base.meal_content,
        satisfaction_score: valid_meal_eval_base.satisfaction_score,
        completion_rate: valid_meal_eval_base.completion_rate,
        nutritional_rating: undefined as any,
        request_text: valid_meal_eval_base.request_text,
      })
    ).toThrow(/栄養価評価/);

    // エラーパス4: ユーザーIDが不足している場合
    expect(() =>
      recordMealEvaluation({
        user_id: '' as any,
        family_member_id: valid_meal_eval_base.family_member_id,
        meal_date: valid_meal_eval_base.meal_date,
        meal_content: valid_meal_eval_base.meal_content,
        satisfaction_score: valid_meal_eval_base.satisfaction_score,
        completion_rate: valid_meal_eval_base.completion_rate,
        nutritional_rating: valid_meal_eval_base.nutritional_rating,
        request_text: valid_meal_eval_base.request_text,
      })
    ).toThrow(/ユーザーID/);

    // エラーパス5: 家族成員IDが不足している場合
    expect(() =>
      recordMealEvaluation({
        user_id: valid_meal_eval_base.user_id,
        family_member_id: null as any,
        meal_date: valid_meal_eval_base.meal_date,
        meal_content: valid_meal_eval_base.meal_content,
        satisfaction_score: valid_meal_eval_base.satisfaction_score,
        completion_rate: valid_meal_eval_base.completion_rate,
        nutritional_rating: valid_meal_eval_base.nutritional_rating,
        request_text: valid_meal_eval_base.request_text,
      })
    ).toThrow(/家族成員/);

    // 複数の必須項目が不足している場合（最初に検出されたもののエラーが返される）
    expect(() =>
      recordMealEvaluation({
        user_id: '',
        family_member_id: undefined as any,
        meal_date: undefined as any,
        meal_content: '',
        satisfaction_score: valid_meal_eval_base.satisfaction_score,
        completion_rate: valid_meal_eval_base.completion_rate,
        nutritional_rating: undefined as any,
        request_text: valid_meal_eval_base.request_text,
      })
    ).toThrow(/必須項目/);
  });
});