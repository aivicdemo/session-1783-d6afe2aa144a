import { describe, test, expect, beforeEach } from '@jest/globals';
import {
  calculateSegmentMetrics,
} from '../../src/logic/it-3';

describe('ユーザーセグメント別分析機能 - 専業主夫層メトリクス計算', () => {
  // SCEN-395
  test('専業主夫層セグメントの献立生成成功率・調理時間短縮度・満足度スコアが正確に計算される', () => {
    // 前提: 専業主夫層セグメントのユーザーデータと献立生成履歴が存在する状態
    const segmentUsers = [
      {
        userId: 'user001',
        segment: 'househusband',
        ageGroup: '30-39',
        familySize: 4,
      },
      {
        userId: 'user002',
        segment: 'househusband',
        ageGroup: '40-49',
        familySize: 3,
      },
      {
        userId: 'user003',
        segment: 'househusband',
        ageGroup: '30-39',
        familySize: 5,
      },
    ];

    // 献立生成履歴データ (過去90日間)
    const mealGenerationHistory = [
      {
        userId: 'user001',
        generationDate: '2024-09-01',
        success: true,
        userSpecifiedTime: 60,
        actualCookingTime: 45,
        satisfactionScore: 4.5,
      },
      {
        userId: 'user001',
        generationDate: '2024-09-08',
        success: true,
        userSpecifiedTime: 60,
        actualCookingTime: 48,
        satisfactionScore: 4.2,
      },
      {
        userId: 'user001',
        generationDate: '2024-09-15',
        success: false,
        userSpecifiedTime: 60,
        actualCookingTime: 0,
        satisfactionScore: 2.0,
      },
      {
        userId: 'user001',
        generationDate: '2024-09-22',
        success: true,
        userSpecifiedTime: 60,
        actualCookingTime: 50,
        satisfactionScore: 4.8,
      },
      {
        userId: 'user002',
        generationDate: '2024-09-05',
        success: true,
        userSpecifiedTime: 45,
        actualCookingTime: 36,
        satisfactionScore: 4.0,
      },
      {
        userId: 'user002',
        generationDate: '2024-09-12',
        success: true,
        userSpecifiedTime: 45,
        actualCookingTime: 40,
        satisfactionScore: 3.8,
      },
      {
        userId: 'user002',
        generationDate: '2024-09-19',
        success: true,
        userSpecifiedTime: 45,
        actualCookingTime: 38,
        satisfactionScore: 4.1,
      },
      {
        userId: 'user003',
        generationDate: '2024-09-03',
        success: true,
        userSpecifiedTime: 90,
        actualCookingTime: 75,
        satisfactionScore: 4.3,
      },
      {
        userId: 'user003',
        generationDate: '2024-09-10',
        success: false,
        userSpecifiedTime: 90,
        actualCookingTime: 0,
        satisfactionScore: 2.5,
      },
      {
        userId: 'user003',
        generationDate: '2024-09-17',
        success: true,
        userSpecifiedTime: 90,
        actualCookingTime: 70,
        satisfactionScore: 4.6,
      },
    ];

    // 実行: calculateSegmentMetrics を呼び出す
    const result = calculateSegmentMetrics({
      segmentUsers,
      mealGenerationHistory,
      analysisStartDate: '2024-06-01',
      analysisEndDate: '2024-09-30',
    });

    // 期待値の計算
    // 献立生成成功率: (成功した献立数 ÷ 総献立生成要求数) × 100
    // 成功: user001: 3件, user002: 3件, user003: 2件 = 計8件
    // 総数: 10件
    // 成功率: (8 / 10) × 100 = 80.00%
    const expectedSuccessRate = 80.00;

    // 調理時間短縮度: (ユーザー指定時間 - 実際の調理時間) ÷ ユーザー指定時間 × 100
    // 成功したデータのみを対象
    // user001成功: (60-45)/60*100=25.00, (60-48)/60*100=20.00, (60-50)/60*100=16.67
    // user002成功: (45-36)/45*100=20.00, (45-40)/45*100=11.11, (45-38)/45*100=15.56
    // user003成功: (90-75)/90*100=16.67, (90-70)/90*100=22.22
    // 平均: (25.00+20.00+16.67+20.00+11.11+15.56+16.67+22.22) / 8 = 18.65%
    const expectedCookingTimeReduction = 18.65;

    // 満足度スコア: 加重平均 (全ユーザー・全データ)
    // (4.5+4.2+2.0+4.8+4.0+3.8+4.1+4.3+2.5+4.6) / 10 = 38.8 / 10 = 3.88
    const expectedSatisfactionScore = 3.88;

    // 統計値の計算
    // 成功率のデータポイント: [100, 100, 0, 100, 100, 100, 100, 0, 100] (ユーザーごと)
    // 平均値: 80.00
    // 中央値: 100
    // 標準偏差の計算
    const successRateValues = [100, 100, 0, 100, 100, 100, 100, 0, 100];
    const meanSuccessRate = 80.00;
    const varianceSuccessRate =
      successRateValues.reduce((sum, val) => sum + Math.pow(val - meanSuccessRate, 2), 0) / 9;
    const stdDevSuccessRate = Math.sqrt(varianceSuccessRate);
    const expectedStdDevSuccessRate = parseFloat(stdDevSuccessRate.toFixed(2));

    // 調理時間短縮度のデータポイント (成功のみ): [25.00, 20.00, 16.67, 20.00, 11.11, 15.56, 16.67, 22.22]
    const cookingTimeReductionValues = [25.0, 20.0, 16.67, 20.0, 11.11, 15.56, 16.67, 22.22];
    const meanCookingTimeReduction = 18.65;
    const varianceCookingTimeReduction = cookingTimeReductionValues.reduce(
      (sum, val) => sum + Math.pow(val - meanCookingTimeReduction, 2),
      0
    ) / 8;
    const stdDevCookingTimeReduction = Math.sqrt(varianceCookingTimeReduction);
    const expectedStdDevCookingTimeReduction = parseFloat(
      stdDevCookingTimeReduction.toFixed(2)
    );

    // 満足度スコアのデータポイント: [4.5, 4.2, 2.0, 4.8, 4.0, 3.8, 4.1, 4.3, 2.5, 4.6]
    const satisfactionScoreValues = [4.5, 4.2, 2.0, 4.8, 4.0, 3.8, 4.1, 4.3, 2.5, 4.6];
    const meanSatisfactionScore = 3.88;
    const varianceSatisfactionScore = satisfactionScoreValues.reduce(
      (sum, val) => sum + Math.pow(val - meanSatisfactionScore, 2),
      0
    ) / 10;
    const stdDevSatisfactionScore = Math.sqrt(varianceSatisfactionScore);
    const expectedStdDevSatisfactionScore = parseFloat(stdDevSatisfactionScore.toFixed(2));

    // 検証: 主要メトリクス
    expect(result.successRate).toBe(expectedSuccessRate);
    expect(result.cookingTimeReduction).toBe(expectedCookingTimeReduction);
    expect(result.satisfactionScore).toBe(expectedSatisfactionScore);

    // 検証: 統計値 (小数第2位まで正確)
    expect(result.statistics.successRateMedian).toBe(100.0);
    expect(result.statistics.successRateStdDev).toBe(expectedStdDevSuccessRate);

    expect(result.statistics.cookingTimeReductionMedian).toBe(20.0);
    expect(result.statistics.cookingTimeReductionStdDev).toBe(
      expectedStdDevCookingTimeReduction
    );

    expect(result.statistics.satisfactionScoreMedian).toBe(4.35);
    expect(result.statistics.satisfactionScoreStdDev).toBe(expectedStdDevSatisfactionScore);

    // 検証: ユーザー数
    expect(result.userCount).toBe(3);
    expect(result.totalMealGenerationRequests).toBe(10);
    expect(result.successfulMealGenerations).toBe(8);

    // 検証: すべての計算結果が小数第2位までの正確性を保持
    const decimalPlaces = (value: number): number => {
      const str = value.toString();
      const match = str.match(/\.(\d+)/);
      return match ? match[1].length : 0;
    };

    expect(decimalPlaces(result.successRate)).toBeLessThanOrEqual(2);
    expect(decimalPlaces(result.cookingTimeReduction)).toBeLessThanOrEqual(2);
    expect(decimalPlaces(result.satisfactionScore)).toBeLessThanOrEqual(2);
  });
});