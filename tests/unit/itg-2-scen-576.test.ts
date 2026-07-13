import { calculateAlgorithmImprovementMetrics } from '../../src/logic/it-1-br-2-1-1-1';

describe('ユーザー食事記録と栄養摂取量推移データのダッシュボード集計', () => {
  // SCEN-576: [error] アルゴリズム改善効果定量指標算出 - 改善前後のデータが存在しない場合にnullエラーが発生する
  test('should properly handle null error when pre/post improvement data is missing', () => {
    // 改善前データが存在しない状態
    const preImprovementDataMissing = {
      preImprovementMetrics: null,
      postImprovementMetrics: {
        successRate: 85,
        cookingTimeReduction: 15,
        userSatisfactionScore: 92,
        timestamp: new Date('2024-01-15T11:00:00Z'),
      },
    };

    expect(() => {
      calculateAlgorithmImprovementMetrics(preImprovementDataMissing);
    }).toThrow(/改善前データ/);

    // 改善後データが存在しない状態
    const postImprovementDataMissing = {
      preImprovementMetrics: {
        successRate: 75,
        cookingTimeReduction: 8,
        userSatisfactionScore: 85,
        timestamp: new Date('2024-01-08T11:00:00Z'),
      },
      postImprovementMetrics: null,
    };

    expect(() => {
      calculateAlgorithmImprovementMetrics(postImprovementDataMissing);
    }).toThrow(/改善後データ/);

    // 改善前後のデータが両方とも存在しない状態
    const bothDataMissing = {
      preImprovementMetrics: null,
      postImprovementMetrics: null,
    };

    expect(() => {
      calculateAlgorithmImprovementMetrics(bothDataMissing);
    }).toThrow(/改善前後データ/);

    // 成功ケース：改善前後のデータが正常に存在する場合
    const validData = {
      preImprovementMetrics: {
        successRate: 75,
        cookingTimeReduction: 8,
        userSatisfactionScore: 85,
        timestamp: new Date('2024-01-08T11:00:00Z'),
      },
      postImprovementMetrics: {
        successRate: 85,
        cookingTimeReduction: 15,
        userSatisfactionScore: 92,
        timestamp: new Date('2024-01-15T11:00:00Z'),
      },
    };

    const result = calculateAlgorithmImprovementMetrics(validData);

    // 改善効果の定量指標を検証：成功率改善度 = (85 - 75) / 75 * 100 = 13.33%
    expect(result.successRateImprovement).toBe(13.33);

    // 調理時間短縮度改善 = (15 - 8) / 8 * 100 = 87.5%
    expect(result.cookingTimeReductionImprovement).toBe(87.5);

    // ユーザー満足度スコア改善 = (92 - 85) / 85 * 100 = 8.24%
    expect(result.userSatisfactionScoreImprovement).toBe(8.24);

    // 総合改善スコア = (13.33 + 87.5 + 8.24) / 3 = 36.36
    expect(result.overallImprovementScore).toBe(36.36);

    // エラーハンドリング状態の確認
    expect(result.errorOccurred).toBe(false);
    expect(result.errorMessage).toBeNull();
  });
});