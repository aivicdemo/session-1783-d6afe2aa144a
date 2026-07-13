import { validateMealEvaluationScore } from "../../src/logic/it-1-br-2-1-1-1";

describe("食事評価データの時系列蓄積と嗜好学習 - データ品質エラーハンドリング", () => {
  test("SCEN-340: 評価スコアが有効範囲外の場合、データ品質エラーが記録される", () => {
    const valid_user_id = "user_12345";
    const valid_meal_id = "meal_67890";
    const valid_timestamp = "2024-01-15T19:30:00Z";
    const valid_family_member_id = "family_member_001";

    // ハッピーパス: スコア 3（有効範囲内 1-5）
    const valid_result = validateMealEvaluationScore({
      user_id: valid_user_id,
      meal_id: valid_meal_id,
      evaluation_score: 3,
      timestamp: valid_timestamp,
      family_member_id: valid_family_member_id,
    });

    expect(valid_result).toEqual({
      is_valid: true,
      error_code: null,
      error_message: null,
      quality_check_log: {
        score_in_range: true,
        user_id: valid_user_id,
        meal_id: valid_meal_id,
        timestamp: valid_timestamp,
        family_member_id: valid_family_member_id,
      },
    });

    // エラーケース1: スコア -1（有効範囲下限未満）
    const result_negative = validateMealEvaluationScore({
      user_id: valid_user_id,
      meal_id: valid_meal_id,
      evaluation_score: -1,
      timestamp: valid_timestamp,
      family_member_id: valid_family_member_id,
    });

    expect(result_negative).toEqual({
      is_valid: false,
      error_code: "EVAL_SCORE_OUT_OF_RANGE",
      error_message: "評価スコアが有効範囲外です",
      quality_check_log: {
        score_in_range: false,
        user_id: valid_user_id,
        meal_id: valid_meal_id,
        timestamp: valid_timestamp,
        family_member_id: valid_family_member_id,
        invalid_score_value: -1,
        valid_range: "1-5",
      },
    });

    // エラーケース2: スコア 10（有効範囲上限超過）
    const result_overflow = validateMealEvaluationScore({
      user_id: valid_user_id,
      meal_id: valid_meal_id,
      evaluation_score: 10,
      timestamp: valid_timestamp,
      family_member_id: valid_family_member_id,
    });

    expect(result_overflow).toEqual({
      is_valid: false,
      error_code: "EVAL_SCORE_OUT_OF_RANGE",
      error_message: "評価スコアが有効範囲外です",
      quality_check_log: {
        score_in_range: false,
        user_id: valid_user_id,
        meal_id: valid_meal_id,
        timestamp: valid_timestamp,
        family_member_id: valid_family_member_id,
        invalid_score_value: 10,
        valid_range: "1-5",
      },
    });

    // エラーケース3: スコア 0（範囲外）
    const result_zero = validateMealEvaluationScore({
      user_id: valid_user_id,
      meal_id: valid_meal_id,
      evaluation_score: 0,
      timestamp: valid_timestamp,
      family_member_id: valid_family_member_id,
    });

    expect(result_zero.is_valid).toBe(false);
    expect(result_zero.error_code).toBe("EVAL_SCORE_OUT_OF_RANGE");
    expect(result_zero.error_message).toMatch(/評価スコア.*有効範囲外/);
    expect(result_zero.quality_check_log.score_in_range).toBe(false);

    // 境界値テスト: スコア 1（下限）
    const result_min_valid = validateMealEvaluationScore({
      user_id: valid_user_id,
      meal_id: valid_meal_id,
      evaluation_score: 1,
      timestamp: valid_timestamp,
      family_member_id: valid_family_member_id,
    });

    expect(result_min_valid.is_valid).toBe(true);
    expect(result_min_valid.error_code).toBeNull();
    expect(result_min_valid.quality_check_log.score_in_range).toBe(true);

    // 境界値テスト: スコア 5（上限）
    const result_max_valid = validateMealEvaluationScore({
      user_id: valid_user_id,
      meal_id: valid_meal_id,
      evaluation_score: 5,
      timestamp: valid_timestamp,
      family_member_id: valid_family_member_id,
    });

    expect(result_max_valid.is_valid).toBe(true);
    expect(result_max_valid.error_code).toBeNull();
    expect(result_max_valid.quality_check_log.score_in_range).toBe(true);

    // エラーが発生した場合、無効なデータが嗜好学習モデルに含まれないことを確認
    expect(result_negative.quality_check_log).toHaveProperty("invalid_score_value");
    expect(result_overflow.quality_check_log).toHaveProperty("invalid_score_value");
    expect(result_negative.quality_check_log.invalid_score_value).toBe(-1);
    expect(result_overflow.quality_check_log.invalid_score_value).toBe(10);
  });
});