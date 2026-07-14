import { calculateAlgorithmImprovementMetrics } from '../../src/logic/it-7-2-1';

describe('献立生成アルゴリズムの改善効果定量比較ダッシュボード', () => {
  test('SCEN-879: アルゴリズム改善指標の定量比較 - 改善前後の成功率・調理時間短縮度・ユーザー満足度スコアが全て正の改善を示す場合に改善効果ありと判定される', () => {
    // 改善前のメトリクス
    const metricsBeforeImprovement = {
      successRate: 0.72, // 成功率: 72%
      averageCookingTimeMinutes: 45, // 平均調理時間: 45分
      userSatisfactionScore: 3.2, // ユーザー満足度スコア: 3.2/5.0
    };

    // 改善後のメトリクス
    const metricsAfterImprovement = {
      successRate: 0.85, // 成功率: 85%
      averageCookingTimeMinutes: 38, // 平均調理時間: 38分
      userSatisfactionScore: 4.1, // ユーザー満足度スコア: 4.1/5.0
    };

    // 期待される改善度の計算
    // 成功率の改善度: (0.85 - 0.72) / 0.72 * 100 = 18.06%
    const expectedSuccessRateImprovement = 0.13; // 13ポイント改善（0.85 - 0.72）
    // 調理時間短縮度: (45 - 38) / 45 * 100 = 15.56% 短縮
    const expectedCookingTimeReduction = 7; // 7分短縮（45 - 38）
    // ユーザー満足度スコアの改善度: (4.1 - 3.2) = 0.9ポイント
    const expectedSatisfactionScoreImprovement = 0.9; // 0.9ポイント改善（4.1 - 3.2）

    const result = calculateAlgorithmImprovementMetrics(
      metricsBeforeImprovement,
      metricsAfterImprovement,
    );

    // 改善前後の成功率差分を検証
    expect(result.successRateImprovement).toBe(expectedSuccessRateImprovement);
    expect(result.successRateImprovement).toBeGreaterThan(0);

    // 調理時間短縮度を検証（正の値 = 短縮されている）
    expect(result.cookingTimeReductionMinutes).toBe(expectedCookingTimeReduction);
    expect(result.cookingTimeReductionMinutes).toBeGreaterThan(0);

    // ユーザー満足度スコアの改善度を検証
    expect(result.satisfactionScoreImprovement).toBe(expectedSatisfactionScoreImprovement);
    expect(result.satisfactionScoreImprovement).toBeGreaterThan(0);

    // 全てのメトリクスが正の改善を示しているかを検証
    expect(result.allMetricsImproved).toBe(true);

    // 改善効果ありの判定結果を検証
    expect(result.improvementJudgment).toBe('改善効果あり');

    // ダッシュボード表示用のメッセージを検証
    expect(result.dashboardMessage).toContain('改善効果あり');
    expect(result.dashboardMessage).toContain('13');
    expect(result.dashboardMessage).toContain('7');
    expect(result.dashboardMessage).toContain('0.9');
  });
});