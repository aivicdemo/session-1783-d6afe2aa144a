import { analyzeFeatureUsagePatterns } from '../../src/logic/it-1-br-2-1-1-1';

describe('機能別使用パターン分析機能', () => {
  // SCEN-383
  test('機能別の使用頻度・離脱ポイント・競合差別化根拠が正確に定量化される', () => {
    const analysisStartDate = new Date('2024-12-01T00:00:00Z');
    const analysisEndDate = new Date('2024-12-31T23:59:59Z');
    const userId = 'user-001';

    const featureUsageInput = {
      userId,
      analysisStartDate,
      analysisEndDate,
      featureAccessLogs: [
        {
          featureId: 'feature-001',
          featureName: '献立自動生成',
          accessCount: 45,
          totalUsageTimeSeconds: 2700,
          activeUserCount: 38,
          abandonmentCount: 7,
          abandonmentRate: 15.56,
        },
        {
          featureId: 'feature-002',
          featureName: '栄養管理ダッシュボード',
          accessCount: 120,
          totalUsageTimeSeconds: 5400,
          activeUserCount: 95,
          abandonmentCount: 25,
          abandonmentRate: 20.83,
        },
        {
          featureId: 'feature-003',
          featureName: '食費管理',
          accessCount: 78,
          totalUsageTimeSeconds: 3900,
          activeUserCount: 62,
          abandonmentCount: 16,
          abandonmentRate: 20.51,
        },
      ],
      competitorBenchmarkData: {
        averageFeatureUsageFrequency: 81,
        averageAbandonmentRate: 18.75,
        topFeatureId: 'feature-002',
      },
    };

    const result = analyzeFeatureUsagePatterns(featureUsageInput);

    expect(result).toEqual({
      analysisId: expect.any(String),
      userId,
      analysisStartDate: analysisStartDate.toISOString(),
      analysisEndDate: analysisEndDate.toISOString(),
      featureAnalytics: [
        {
          featureId: 'feature-001',
          featureName: '献立自動生成',
          usageFrequency: 45,
          averageUsageTimePerAccessSeconds: 60,
          activeUserCount: 38,
          abandonmentCount: 7,
          abandonmentRate: 15.56,
          comparisonToBenchmark: {
            frequencyDifferential: -36,
            abandonmentRateDifferential: -3.19,
            rankingPosition: 2,
          },
        },
        {
          featureId: 'feature-002',
          featureName: '栄養管理ダッシュボード',
          usageFrequency: 120,
          averageUsageTimePerAccessSeconds: 45,
          activeUserCount: 95,
          abandonmentCount: 25,
          abandonmentRate: 20.83,
          comparisonToBenchmark: {
            frequencyDifferential: 39,
            abandonmentRateDifferential: 2.08,
            rankingPosition: 1,
          },
        },
        {
          featureId: 'feature-003',
          featureName: '食費管理',
          usageFrequency: 78,
          averageUsageTimePerAccessSeconds: 50,
          activeUserCount: 62,
          abandonmentCount: 16,
          abandonmentRate: 20.51,
          comparisonToBenchmark: {
            frequencyDifferential: -3,
            abandonmentRateDifferential: 1.76,
            rankingPosition: 3,
          },
        },
      ],
      abandonmentPointAnalysis: {
        highestAbandonmentFeatureId: 'feature-002',
        highestAbandonmentRate: 20.83,
        lowestAbandonmentFeatureId: 'feature-001',
        lowestAbandonmentRate: 15.56,
        totalAbandonmentCount: 48,
        averageAbandonmentRate: 18.97,
      },
      competitiveDifferentiationMetrics: {
        topPerformingFeature: {
          featureId: 'feature-002',
          featureName: '栄養管理ダッシュボード',
          usageFrequencyScore: 1.48,
          abandonmentRateScore: 0.89,
          competitiveDifferentiationScore: 7.82,
          differentiationRanking: '高',
        },
        differentiationSummary: {
          strongPoints: ['feature-002'],
          weakPoints: ['feature-003'],
          opportunityAreas: [],
        },
      },
      exportData: {
        format: 'CSV',
        content: `featureId,featureName,usageFrequency,averageUsageTimeSeconds,activeUserCount,abandonmentRate,frequencyDifferential,abandonmentRateDifferential,rankingPosition
feature-001,献立自動生成,45,60,38,15.56,-36,-3.19,2
feature-002,栄養管理ダッシュボード,120,45,95,20.83,39,2.08,1
feature-003,食費管理,78,50,62,20.51,-3,1.76,3`,
        precision: 2,
      },
      dataIntegrity: {
        isExportDataMatchesDisplay: true,
        validationStatus: '合格',
        checksPerformed: ['数値精度確認', 'フィールド統一性確認', 'データ欠損確認'],
      },
    });

    expect(result.featureAnalytics[0].abandonmentRate).toBe(15.56);
    expect(result.featureAnalytics[1].usageFrequency).toBe(120);
    expect(result.featureAnalytics[2].averageUsageTimePerAccessSeconds).toBe(50);
    expect(result.abandonmentPointAnalysis.averageAbandonmentRate).toBe(18.97);
    expect(result.competitiveDifferentiationMetrics.topPerformingFeature.competitiveDifferentiationScore).toBe(7.82);
    expect(result.dataIntegrity.isExportDataMatchesDisplay).toBe(true);
  });
});