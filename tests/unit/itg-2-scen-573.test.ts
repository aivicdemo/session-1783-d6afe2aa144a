import { calculateMealGenerationSuccessRateComparison } from "../../src/logic/it-1-br-2-1-1-1";

describe("ユーザーの食事記録と栄養摂取量の推移データを自動集計し、栄養項目別の達成度と改善ギャップを可視化するダッシュボード機能", () => {
  // SCEN-573
  test("改善前後の献立生成成功率が正しく計算される", () => {
    // 改善前データセット: 1000件の献立生成リクエストのうち850件が成功
    const pre_improvement_total_requests = 1000;
    const pre_improvement_success_count = 850;
    const pre_improvement_success_rate = (pre_improvement_success_count / pre_improvement_total_requests) * 100;
    // 期待値: 85%

    // 改善後データセット: 同じ1000件のリクエストのうち920件が成功
    const post_improvement_total_requests = 1000;
    const post_improvement_success_count = 920;
    const post_improvement_success_rate = (post_improvement_success_count / post_improvement_total_requests) * 100;
    // 期待値: 92%

    // 改善率（差分値）の計算
    const improvement_rate = post_improvement_success_rate - pre_improvement_success_rate;
    // 期待値: 7%

    // システムの計算ロジックに入力
    const result = calculateMealGenerationSuccessRateComparison({
      pre_improvement_total_requests,
      pre_improvement_success_count,
      post_improvement_total_requests,
      post_improvement_success_count,
    });

    // 改善前成功率の検証
    expect(result.pre_improvement_success_rate).toBe(85.0);

    // 改善後成功率の検証
    expect(result.post_improvement_success_rate).toBe(92.0);

    // 改善率（差分値）の検証
    expect(result.improvement_rate).toBe(7.0);

    // 計算誤差が0.01%以内であることを確認
    const tolerance = 0.01;
    expect(Math.abs(result.pre_improvement_success_rate - pre_improvement_success_rate)).toBeLessThanOrEqual(tolerance);
    expect(Math.abs(result.post_improvement_success_rate - post_improvement_success_rate)).toBeLessThanOrEqual(tolerance);
    expect(Math.abs(result.improvement_rate - improvement_rate)).toBeLessThanOrEqual(tolerance);

    // ダッシュボード表示用オブジェクトの検証
    expect(result).toEqual({
      pre_improvement_success_rate: 85.0,
      post_improvement_success_rate: 92.0,
      improvement_rate: 7.0,
      pre_improvement_total_requests: 1000,
      pre_improvement_success_count: 850,
      post_improvement_total_requests: 1000,
      post_improvement_success_count: 920,
    });
  });
});