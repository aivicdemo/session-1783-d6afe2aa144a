import { aggregateWeeklyMetrics } from "../../src/logic/it-7-2-1";

describe("週次献立生成メトリクス集計ダッシュボード", () => {
  test("SCEN-556: 無効な満足度スコア（範囲外）を含む食事評価データを入力した場合、エラーが返され蓄積されない", () => {
    // 有効な評価データの構造定義
    const valid_meal_record = {
      meal_id: "meal_001",
      meal_name: "鶏肉の味噌煮",
      date_time: new Date("2024-01-15T18:30:00Z"),
      satisfaction_score: 4,
      completion_rate: 0.95,
      cooking_time_minutes: 35,
      nutrition_info: {
        calories: 450,
        protein_g: 25,
        carbs_g: 35,
        fat_g: 15
      },
      user_id: "user_123",
      family_member_id: "member_001"
    };

    // テストケース1: 満足度スコア -1（範囲外・負の値）
    const invalid_score_negative = {
      ...valid_meal_record,
      satisfaction_score: -1
    };

    expect(() => aggregateWeeklyMetrics([invalid_score_negative]))
      .toThrow(/満足度スコア/);

    // テストケース2: 満足度スコア 0（範囲外・下限未満）
    const invalid_score_zero = {
      ...valid_meal_record,
      satisfaction_score: 0
    };

    expect(() => aggregateWeeklyMetrics([invalid_score_zero]))
      .toThrow(/満足度スコア/);

    // テストケース3: 満足度スコア 6（範囲外・上限超過）
    const invalid_score_over = {
      ...valid_meal_record,
      satisfaction_score: 6
    };

    expect(() => aggregateWeeklyMetrics([invalid_score_over]))
      .toThrow(/満足度スコア/);

    // テストケース4: 満足度スコア 100（範囲外・極端な上限超過）
    const invalid_score_extreme = {
      ...valid_meal_record,
      satisfaction_score: 100
    };

    expect(() => aggregateWeeklyMetrics([invalid_score_extreme]))
      .toThrow(/満足度スコア/);

    // テストケース5: 有効なスコア範囲（1～5）でのハッピーパス検証
    const valid_scores = [1, 2, 3, 4, 5];
    const valid_meal_records = valid_scores.map((score, idx) => ({
      ...valid_meal_record,
      meal_id: `meal_${idx}`,
      satisfaction_score: score
    }));

    const result = aggregateWeeklyMetrics(valid_meal_records);

    // 集計結果の検証
    expect(result).toEqual(
      expect.objectContaining({
        total_meals_evaluated: 5,
        average_satisfaction_score: 3.0,
        average_completion_rate: 0.95,
        average_cooking_time_minutes: 35,
        week_start_date: expect.any(String),
        week_end_date: expect.any(String),
        metrics_status: "success"
      })
    );

    // 満足度スコアの平均値が正確に計算されていることを確認
    // (1 + 2 + 3 + 4 + 5) / 5 = 15 / 5 = 3.0
    expect(result.average_satisfaction_score).toBe(3.0);

    // 総評価件数が正確に集計されていることを確認
    expect(result.total_meals_evaluated).toBe(5);

    // 完食度の平均値が正確に計算されていることを確認
    // (0.95 + 0.95 + 0.95 + 0.95 + 0.95) / 5 = 4.75 / 5 = 0.95
    expect(result.average_completion_rate).toBe(0.95);

    // 調理時間の平均値が正確に計算されていることを確認
    // (35 + 35 + 35 + 35 + 35) / 5 = 175 / 5 = 35
    expect(result.average_cooking_time_minutes).toBe(35);
  });
});