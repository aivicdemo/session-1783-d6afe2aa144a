import { analyzeSegmentDifferentiationEffect } from '../../src/logic/it-1';

describe('月次食費実績の超過要因分析機能', () => {
  // SCEN-381
  test('セグメント別差別化効果分析機能 - 専業主夫層セグメントについて献立生成成功率・調理時間短縮度・満足度スコアが正しく可視化される', () => {
    const segmentId = 'househusband_segment_001';
    const segmentName = '専業主夫層';
    const userCount = 450;
    const analysisStartDate = new Date('2024-01-01T00:00:00Z');
    const analysisEndDate = new Date('2024-03-31T23:59:59Z');

    const weeklyMetricsWeek1 = {
      week: '2024-W01',
      mealGenerationSuccessRate: 87.5,
      cookingTimeShorteningDegree: 15.3,
      satisfactionScore: 82.4,
    };

    const weeklyMetricsWeek2 = {
      week: '2024-W02',
      mealGenerationSuccessRate: 89.2,
      cookingTimeShorteningDegree: 16.8,
      satisfactionScore: 84.1,
    };

    const weeklyMetricsWeek3 = {
      week: '2024-W03',
      mealGenerationSuccessRate: 91.5,
      cookingTimeShorteningDegree: 18.2,
      satisfactionScore: 86.7,
    };

    const weeklyMetricsWeek4 = {
      week: '2024-W04',
      mealGenerationSuccessRate: 90.8,
      cookingTimeShorteningDegree: 17.5,
      satisfactionScore: 85.3,
    };

    const weeklyMetricsData = [
      weeklyMetricsWeek1,
      weeklyMetricsWeek2,
      weeklyMetricsWeek3,
      weeklyMetricsWeek4,
    ];

    const averageMealGenerationSuccessRate =
      (87.5 + 89.2 + 91.5 + 90.8) / 4;
    const averageCookingTimeShorteningDegree =
      (15.3 + 16.8 + 18.2 + 17.5) / 4;
    const averageSatisfactionScore =
      (82.4 + 84.1 + 86.7 + 85.3) / 4;

    const inputData = {
      segmentId,
      segmentName,
      userCount,
      analysisStartDate,
      analysisEndDate,
      weeklyMetricsData,
    };

    const result = analyzeSegmentDifferentiationEffect(inputData);

    expect(result).toBeDefined();
    expect(result.segmentId).toBe(segmentId);
    expect(result.segmentName).toBe(segmentName);
    expect(result.userCount).toBe(450);

    expect(result.averageMealGenerationSuccessRate).toBeCloseTo(
      89.75,
      2
    );
    expect(result.averageCookingTimeShorteningDegree).toBeCloseTo(
      16.95,
      2
    );
    expect(result.averageSatisfactionScore).toBeCloseTo(84.63, 2);

    expect(result.mealGenerationSuccessRateMin).toBe(87.5);
    expect(result.mealGenerationSuccessRateMax).toBe(91.5);
    expect(result.cookingTimeShorteningDegreeMin).toBe(15.3);
    expect(result.cookingTimeShorteningDegreeMax).toBe(18.2);
    expect(result.satisfactionScoreMin).toBe(82.4);
    expect(result.satisfactionScoreMax).toBe(86.7);

    expect(result.weeklyTrends).toHaveLength(4);
    expect(result.weeklyTrends[0]).toEqual({
      week: '2024-W01',
      mealGenerationSuccessRate: 87.5,
      cookingTimeShorteningDegree: 15.3,
      satisfactionScore: 82.4,
    });
    expect(result.weeklyTrends[1]).toEqual({
      week: '2024-W02',
      mealGenerationSuccessRate: 89.2,
      cookingTimeShorteningDegree: 16.8,
      satisfactionScore: 84.1,
    });
    expect(result.weeklyTrends[2]).toEqual({
      week: '2024-W03',
      mealGenerationSuccessRate: 91.5,
      cookingTimeShorteningDegree: 18.2,
      satisfactionScore: 86.7,
    });
    expect(result.weeklyTrends[3]).toEqual({
      week: '2024-W04',
      mealGenerationSuccessRate: 90.8,
      cookingTimeShorteningDegree: 17.5,
      satisfactionScore: 85.3,
    });

    expect(result.exportFormat).toBeDefined();
    expect(result.exportFormat.format).toBe('CSV');
    expect(result.exportFormat.fileName).toContain(segmentName);
    expect(result.exportFormat.fileName).toContain('2024-01-01');
    expect(result.exportFormat.fileName).toContain('2024-03-31');

    expect(result.exportData).toBeDefined();
    const csvLines = result.exportData.split('\n').filter((line: string) => line.trim() !== '');
    expect(csvLines.length).toBeGreaterThan(1);
    expect(csvLines[0]).toContain('Week');
    expect(csvLines[0]).toContain('MealGenerationSuccessRate');
    expect(csvLines[0]).toContain('CookingTimeShorteningDegree');
    expect(csvLines[0]).toContain('SatisfactionScore');

    expect(result.unitLabels).toEqual({
      mealGenerationSuccessRate: '%',
      cookingTimeShorteningDegree: '分',
      satisfactionScore: 'ポイント',
    });

    expect(result.analysisStartDate).toBe('2024-01-01');
    expect(result.analysisEndDate).toBe('2024-03-31');

    expect(result.graphDatasets).toHaveLength(3);
    expect(result.graphDatasets[0].label).toBe('献立生成成功率');
    expect(result.graphDatasets[0].dataPoints).toEqual([87.5, 89.2, 91.5, 90.8]);
    expect(result.graphDatasets[1].label).toBe('調理時間短縮度');
    expect(result.graphDatasets[1].dataPoints).toEqual([15.3, 16.8, 18.2, 17.5]);
    expect(result.graphDatasets[2].label).toBe('満足度スコア');
    expect(result.graphDatasets[2].dataPoints).toEqual([82.4, 84.1, 86.7, 85.3]);

    const previousWeeklyMetrics = [
      {
        week: '2023-W48',
        mealGenerationSuccessRate: 81.2,
        cookingTimeShorteningDegree: 12.5,
        satisfactionScore: 78.6,
      },
      {
        week: '2023-W49',
        mealGenerationSuccessRate: 83.4,
        cookingTimeShorteningDegree: 13.8,
        satisfactionScore: 80.2,
      },
    ];

    const previousAverageMealSuccessRate = (81.2 + 83.4) / 2;
    const currentAverageMealSuccessRate = 89.75;
    const mealSuccessRateImprovement = currentAverageMealSuccessRate - previousAverageMealSuccessRate;

    expect(mealSuccessRateImprovement).toBeCloseTo(6.6, 1);

    const inputDataWithPrevious = {
      ...inputData,
      previousWeeklyMetricsData: previousWeeklyMetrics,
    };

    const resultWithComparison = analyzeSegmentDifferentiationEffect(inputDataWithPrevious);

    expect(resultWithComparison.comparisonMetrics).toBeDefined();
    expect(resultWithComparison.comparisonMetrics.mealGenerationSuccessRateChange).toBeCloseTo(
      6.6,
      1
    );
  });
});