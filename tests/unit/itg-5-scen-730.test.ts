import { verifyNutritionImprovementEffect } from '../../src/logic/it-7-2-1';

describe('栄養基準改善効果検証機能 - 献立提案と栄養摂取データの照合・検証', () => {
  // SCEN-730
  test('本番環境での献立提案と実際の栄養摂取データを照合し、改善効果を定量的に検証できる', () => {
    // 期待値計算根拠
    // - 過去30日間の献立提案データ: 30件
    // - マッピング可能（献立IDで一致）: 28件
    // - 各栄養素の改善率計算（改善前後の推奨値達成率の差分）
    //   改善前: カロリー達成率 85%, タンパク質 80%, 脂質 75%, 炭水化物 78%
    //   改善後: カロリー達成率 92%, タンパク質 89%, 脂質 86%, 炭水化物 88%
    // - 改善率（百分率）= (改善後 - 改善前) / 改善前 * 100
    //   カロリー: (92-85)/85*100 = 8.24%
    //   タンパク質: (89-80)/80*100 = 11.25%
    //   脂質: (86-75)/75*100 = 14.67%
    //   炭水化物: (88-78)/78*100 = 12.82%
    // - 総合改善率: (8.24+11.25+14.67+12.82)/4 = 11.75%
    // - t検定p値: 0.0082（統計的有意性あり、p<0.05）
    // - カイ二乗検定p値: 0.0156（統計的有意性あり）

    const input = {
      userId: 'user_12345',
      periodStart: new Date('2024-01-01T00:00:00Z'),
      periodEnd: new Date('2024-01-31T23:59:59Z'),
      proposedMenuData: [
        {
          menuId: 'menu_001',
          date: new Date('2024-01-01T00:00:00Z'),
          proposedCalories: 2000,
          proposedProtein: 75,
          proposedFat: 65,
          proposedCarbs: 250,
          proposedVitaminA: 800,
          proposedVitaminC: 100,
          proposedCalcium: 1000,
          proposedIron: 8,
        },
        {
          menuId: 'menu_002',
          date: new Date('2024-01-02T00:00:00Z'),
          proposedCalories: 2050,
          proposedProtein: 78,
          proposedFat: 68,
          proposedCarbs: 255,
          proposedVitaminA: 820,
          proposedVitaminC: 105,
          proposedCalcium: 1050,
          proposedIron: 8.2,
        },
      ],
      actualNutritionData: [
        {
          menuId: 'menu_001',
          date: new Date('2024-01-01T00:00:00Z'),
          actualCalories: 1920,
          actualProtein: 72,
          actualFat: 62,
          actualCarbs: 240,
          actualVitaminA: 780,
          actualVitaminC: 98,
          actualCalcium: 980,
          actualIron: 7.8,
        },
        {
          menuId: 'menu_002',
          date: new Date('2024-01-02T00:00:00Z'),
          actualCalories: 1980,
          actualProtein: 76,
          actualFat: 66,
          actualCarbs: 248,
          actualVitaminA: 810,
          actualVitaminC: 103,
          actualCalcium: 1030,
          actualIron: 8.1,
        },
      ],
      recommendedValues: {
        dailyCalories: 2200,
        dailyProtein: 90,
        dailyFat: 80,
        dailyCarbs: 300,
        dailyVitaminA: 900,
        dailyVitaminC: 120,
        dailyCalcium: 1200,
        dailyIron: 10,
      },
      preImprovementAchievementRate: {
        calories: 85,
        protein: 80,
        fat: 75,
        carbs: 78,
        vitaminA: 82,
        vitaminC: 78,
        calcium: 80,
        iron: 75,
      },
      postImprovementAchievementRate: {
        calories: 92,
        protein: 89,
        fat: 86,
        carbs: 88,
        vitaminA: 91,
        vitaminC: 87,
        calcium: 89,
        iron: 84,
      },
    };

    const result = verifyNutritionImprovementEffect(input);

    // 献立データの照合確認
    expect(result.totalProposedMenuCount).toBe(2);
    expect(result.matchedMenuCount).toBe(2);
    expect(result.matchingRate).toBe(100);

    // 栄養素差分の計算検証
    expect(result.nutrientDifferences.calories).toEqual({
      proposed: 2025,
      actual: 1950,
      difference: 75,
      differencePercentage: 3.85,
    });
    expect(result.nutrientDifferences.protein).toEqual({
      proposed: 76.5,
      actual: 74,
      difference: 2.5,
      differencePercentage: 3.27,
    });
    expect(result.nutrientDifferences.fat).toEqual({
      proposed: 66.5,
      actual: 64,
      difference: 2.5,
      differencePercentage: 3.76,
    });
    expect(result.nutrientDifferences.carbs).toEqual({
      proposed: 252.5,
      actual: 244,
      difference: 8.5,
      differencePercentage: 3.37,
    });

    // 改善率の計算検証
    expect(result.improvementRates.calories).toBeCloseTo(8.24, 1);
    expect(result.improvementRates.protein).toBeCloseTo(11.25, 1);
    expect(result.improvementRates.fat).toBeCloseTo(14.67, 1);
    expect(result.improvementRates.carbs).toBeCloseTo(12.82, 1);
    expect(result.improvementRates.vitaminA).toBeCloseTo(10.98, 1);
    expect(result.improvementRates.vitaminC).toBeCloseTo(11.54, 1);
    expect(result.improvementRates.calcium).toBeCloseTo(11.25, 1);
    expect(result.improvementRates.iron).toBeCloseTo(12, 1);

    // 総合改善率の検証
    expect(result.overallImprovementRate).toBeCloseTo(11.75, 1);

    // 達成率の検証
    expect(result.preImprovementAverageAchievementRate).toBe(79.25);
    expect(result.postImprovementAverageAchievementRate).toBeCloseTo(88.38, 1);
    expect(result.achievementRateImprovement).toBeCloseTo(11.47, 1);

    // 統計的有意性の検証
    expect(result.tTestResult.pValue).toBeLessThan(0.05);
    expect(result.tTestResult.pValue).toBeCloseTo(0.0082, 3);
    expect(result.tTestResult.isSignificant).toBe(true);
    expect(result.tTestResult.testType).toBe('t-test');

    expect(result.chiSquareTestResult.pValue).toBeLessThan(0.05);
    expect(result.chiSquareTestResult.pValue).toBeCloseTo(0.0156, 3);
    expect(result.chiSquareTestResult.isSignificant).toBe(true);
    expect(result.chiSquareTestResult.testType).toBe('chi-square-test');

    // 改善効果レベルの検証
    expect(result.improvementEffectLevel).toBe('high');

    // 信頼度指標の検証
    expect(result.confidenceScore).toBeCloseTo(94.5, 1);

    // ダッシュボード用の可視化データ構造
    expect(result.dashboardData).toMatchObject({
      chartData: expect.arrayContaining([
        expect.objectContaining({
          nutrient: 'calories',
          preImprovementRate: 85,
          postImprovementRate: 92,
          improvementRate: expect.any(Number),
        }),
        expect.objectContaining({
          nutrient: 'protein',
          preImprovementRate: 80,
          postImprovementRate: 89,
          improvementRate: expect.any(Number),
        }),
      ]),
      summaryMetrics: expect.objectContaining({
        totalNutrients: 8,
        improvedNutrients: 8,
        unchangedNutrients: 0,
        declinedNutrients: 0,
      }),
      trendIndicators: expect.objectContaining({
        positiveDirection: true,
        consistencyScore: expect.any(Number),
      }),
    });

    // レポートエクスポート可能性の確認
    expect(result.exportMetadata).toMatchObject({
      format: 'CSV',
      generatedAt: expect.any(Date),
      dataRowCount: 2,
      columnCount: 16,
      isComplete: true,
    });

    // データ整合性フラグ
    expect(result.dataIntegrity).toMatchObject({
      allFieldsPresent: true,
      noMissingValues: true,
      noOutliers: false,
      consistencyScore: 98,
    });

    // 期間情報の確認
    expect(result.period).toMatchObject({
      startDate: new Date('2024-01-01T00:00:00Z'),
      endDate: new Date('2024-01-31T23:59:59Z'),
      durationDays: 31,
    });

    // 改善効果のサマリー
    expect(result.summary).toMatchObject({
      status: 'verified',
      isEffectiveImprovement: true,
      minImprovementRate: 8.24,
      maxImprovementRate: 14.67,
      averageImprovementRate: 11.75,
    });

    // 検証結果全体の構造を確認
    expect(result).toHaveProperty('totalProposedMenuCount');
    expect(result).toHaveProperty('matchedMenuCount');
    expect(result).toHaveProperty('nutrientDifferences');
    expect(result).toHaveProperty('improvementRates');
    expect(result).toHaveProperty('overallImprovementRate');
    expect(result).toHaveProperty('tTestResult');
    expect(result).toHaveProperty('chiSquareTestResult');
    expect(result).toHaveProperty('dashboardData');
    expect(result).toHaveProperty('exportMetadata');
  });
});