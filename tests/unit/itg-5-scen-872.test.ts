import { generateAlgorithmComparisonReport } from '../../src/logic/it-7-2-1';

describe('献立生成アルゴリズム改善効果比較レポート生成', () => {
  // SCEN-872: [normal] 改善提案レポート生成機能 - 複数アルゴリズムバージョンの改善効果を同一レポート内で比較表示できる
  test('複数のアルゴリズムバージョンを選択して改善効果比較レポートを生成し、性能指標と改善率が正確に表示される', () => {
    // 【入力】
    // - アルゴリズムバージョン v1.0, v1.1, v2.0 の 3 世代を比較対象として選択
    // - 評価期間: 2024-01-01 ～ 2024-01-31（週単位集計で 4 週分）
    // - 各バージョンの週単位の性能指標（献立生成成功率、調理時間短縮度、ユーザー満足度スコア）
    const input = {
      algorithmVersions: ['v1.0', 'v1.1', 'v2.0'],
      evaluationStartDate: '2024-01-01',
      evaluationEndDate: '2024-01-31',
      versionMetrics: {
        'v1.0': {
          week1: {
            successRate: 65.0,
            cookingTimeReduction: 15.0,
            satisfactionScore: 3.2
          },
          week2: {
            successRate: 66.0,
            cookingTimeReduction: 16.0,
            satisfactionScore: 3.3
          },
          week3: {
            successRate: 65.5,
            cookingTimeReduction: 15.5,
            satisfactionScore: 3.25
          },
          week4: {
            successRate: 66.5,
            cookingTimeReduction: 16.5,
            satisfactionScore: 3.35
          }
        },
        'v1.1': {
          week1: {
            successRate: 72.0,
            cookingTimeReduction: 22.0,
            satisfactionScore: 3.8
          },
          week2: {
            successRate: 73.5,
            cookingTimeReduction: 23.5,
            satisfactionScore: 3.9
          },
          week3: {
            successRate: 74.0,
            cookingTimeReduction: 24.0,
            satisfactionScore: 4.0
          },
          week4: {
            successRate: 75.0,
            cookingTimeReduction: 25.0,
            satisfactionScore: 4.1
          }
        },
        'v2.0': {
          week1: {
            successRate: 78.0,
            cookingTimeReduction: 28.0,
            satisfactionScore: 4.2
          },
          week2: {
            successRate: 80.0,
            cookingTimeReduction: 30.0,
            satisfactionScore: 4.4
          },
          week3: {
            successRate: 81.0,
            cookingTimeReduction: 31.0,
            satisfactionScore: 4.5
          },
          week4: {
            successRate: 82.5,
            cookingTimeReduction: 32.5,
            satisfactionScore: 4.6
          }
        }
      }
    };

    // 【実行】
    const report = generateAlgorithmComparisonReport(input);

    // 【期待結果の詳細】
    // 各バージョンの平均値を計算（4週の平均）
    // v1.0: successRate = (65+66+65.5+66.5)/4 = 65.75%, cookingTimeReduction = (15+16+15.5+16.5)/4 = 15.75分, satisfactionScore = (3.2+3.3+3.25+3.35)/4 = 3.275
    // v1.1: successRate = (72+73.5+74+75)/4 = 73.625%, cookingTimeReduction = (22+23.5+24+25)/4 = 23.625分, satisfactionScore = (3.8+3.9+4.0+4.1)/4 = 3.95
    // v2.0: successRate = (78+80+81+82.5)/4 = 80.375%, cookingTimeReduction = (28+30+31+32.5)/4 = 30.375分, satisfactionScore = (4.2+4.4+4.5+4.6)/4 = 4.425

    // 改善率の計算（v1.0 比較ベース = 0%、v1.1 と v2.0 の v1.0 比）
    // v1.1 vs v1.0: successRate改善率 = ((73.625-65.75)/65.75) * 100 = 11.97%
    // v2.0 vs v1.0: successRate改善率 = ((80.375-65.75)/65.75) * 100 = 22.24%
    // v1.1 vs v1.0: satisfactionScore改善率 = ((3.95-3.275)/3.275) * 100 = 20.61%
    // v2.0 vs v1.0: satisfactionScore改善率 = ((4.425-3.275)/3.275) * 100 = 35.08%

    // レポート全体の構造検証
    expect(report).toBeDefined();
    expect(report.reportId).toBeDefined();
    expect(typeof report.reportId).toBe('string');
    
    // ===== 【1】 レポートメタデータ検証 =====
    expect(report.generatedAt).toBe('2024-01-31T23:59:59Z');
    expect(report.evaluationPeriod).toEqual({
      startDate: '2024-01-01',
      endDate: '2024-01-31'
    });
    expect(report.versionsCompared).toEqual(['v1.0', 'v1.1', 'v2.0']);
    expect(report.totalWeeks).toBe(4);

    // ===== 【2】 各バージョンの平均性能指標検証 =====
    expect(report.versionSummary).toBeDefined();
    expect(report.versionSummary).toHaveLength(3);

    // v1.0 の平均値
    const v1_0_summary = report.versionSummary.find(
      (v: any) => v.algorithmVersion === 'v1.0'
    );
    expect(v1_0_summary).toBeDefined();
    expect(v1_0_summary.averageSuccessRate).toBeCloseTo(65.75, 2);
    expect(v1_0_summary.averageCookingTimeReduction).toBeCloseTo(15.75, 2);
    expect(v1_0_summary.averageSatisfactionScore).toBeCloseTo(3.275, 3);

    // v1.1 の平均値
    const v1_1_summary = report.versionSummary.find(
      (v: any) => v.algorithmVersion === 'v1.1'
    );
    expect(v1_1_summary).toBeDefined();
    expect(v1_1_summary.averageSuccessRate).toBeCloseTo(73.625, 2);
    expect(v1_1_summary.averageCookingTimeReduction).toBeCloseTo(23.625, 2);
    expect(v1_1_summary.averageSatisfactionScore).toBeCloseTo(3.95, 2);

    // v2.0 の平均値
    const v2_0_summary = report.versionSummary.find(
      (v: any) => v.algorithmVersion === 'v2.0'
    );
    expect(v2_0_summary).toBeDefined();
    expect(v2_0_summary.averageSuccessRate).toBeCloseTo(80.375, 2);
    expect(v2_0_summary.averageCookingTimeReduction).toBeCloseTo(30.375, 2);
    expect(v2_0_summary.averageSatisfactionScore).toBeCloseTo(4.425, 2);

    // ===== 【3】 改善率（対 v1.0 ベース）の検証 =====
    expect(v1_0_summary.improvementRate).toEqual({
      successRatePercent: 0.0,
      cookingTimeReductionPercent: 0.0,
      satisfactionScorePercent: 0.0
    });

    expect(v1_1_summary.improvementRate).toEqual({
      successRatePercent: 11.97,
      cookingTimeReductionPercent: 50.0,
      satisfactionScorePercent: 20.61
    });

    expect(v2_0_summary.improvementRate).toEqual({
      successRatePercent: 22.24,
      cookingTimeReductionPercent: 93.02,
      satisfactionScorePercent: 35.08
    });

    // ===== 【4】 差分値の検証 =====
    expect(v1_1_summary.performanceDifference).toEqual({
      successRateDiff: 7.875,
      cookingTimeReductionDiff: 7.875,
      satisfactionScoreDiff: 0.675
    });

    expect(v2_0_summary.performanceDifference).toEqual({
      successRateDiff: 14.625,
      cookingTimeReductionDiff: 14.625,
      satisfactionScoreDiff: 1.15
    });

    // ===== 【5】 比較グラフデータ検証 =====
    expect(report.comparisonCharts).toBeDefined();
    expect(report.comparisonCharts.successRateChart).toBeDefined();
    expect(report.comparisonCharts.successRateChart.type).toBe('line');
    expect(report.comparisonCharts.successRateChart.seriesData).toHaveLength(3);

    // 成功率チャート - v1.0 系列
    const successRateSeriesV1_0 = report.comparisonCharts.successRateChart.seriesData.find(
      (s: any) => s.version === 'v1.0'
    );
    expect(successRateSeriesV1_0.values).toEqual([65.0, 66.0, 65.5, 66.5]);

    // 成功率チャート - v1.1 系列
    const successRateSeriesV1_1 = report.comparisonCharts.successRateChart.seriesData.find(
      (s: any) => s.version === 'v1.1'
    );
    expect(successRateSeriesV1_1.values).toEqual([72.0, 73.5, 74.0, 75.0]);

    // 成功率チャート - v2.0 系列
    const successRateSeriesV2_0 = report.comparisonCharts.successRateChart.seriesData.find(
      (s: any) => s.version === 'v2.0'
    );
    expect(successRateSeriesV2_0.values).toEqual([78.0, 80.0, 81.0, 82.5]);

    // 調理時間短縮度チャート
    expect(report.comparisonCharts.cookingTimeReductionChart).toBeDefined();
    expect(report.comparisonCharts.cookingTimeReductionChart.type).toBe('bar');
    expect(report.comparisonCharts.cookingTimeReductionChart.seriesData).toHaveLength(3);

    const cookingTimeSeriesV1_0 = report.comparisonCharts.cookingTimeReductionChart.seriesData.find(
      (s: any) => s.version === 'v1.0'
    );
    expect(cookingTimeSeriesV1_0.values).toEqual([15.0, 16.0, 15.5, 16.5]);

    const cookingTimeSeriesV2_0 = report.comparisonCharts.cookingTimeReductionChart.seriesData.find(
      (s: any) => s.version === 'v2.0'
    );
    expect(cookingTimeSeriesV2_0.values).toEqual([28.0, 30.0, 31.0, 32.5]);

    // ユーザー満足度スコアチャート
    expect(report.comparisonCharts.satisfactionScoreChart).toBeDefined();
    expect(report.comparisonCharts.satisfactionScoreChart.type).toBe('line');

    const satisfactionSeriesV1_1 = report.comparisonCharts.satisfactionScoreChart.seriesData.find(
      (s: any) => s.version === 'v1.1'
    );
    expect(satisfactionSeriesV1_1.values).toEqual([3.8, 3.9, 4.0, 4.1]);

    // ===== 【6】 最適バージョン推奨検証 =====
    expect(report.recommendedVersion).toBeDefined();
    expect(report.recommendedVersion.algorithmVersion).toBe('v2.0');
    expect(report.recommendedVersion.recommendationReason).toBeDefined();
    expect(typeof report.recommendedVersion.recommendationReason).toBe('string');
    expect(report.recommendedVersion.recommendationReason.length).toBeGreaterThan(0);

    // 推奨理由に改善効果数値が含まれていることを確認
    expect(report.recommendedVersion.recommendationReason).toMatch(/22.24/);
    expect(report.recommendedVersion.recommendedVersion).toBe('v2.0');

    // ===== 【7】 総括セクション検証 =====
    expect(report.summary).toBeDefined();
    expect(report.summary.bestPerformer).toBe('v2.0');
    expect(report.summary.improvementHighlight).toBeDefined();
    expect(report.summary.improvementHighlight.metric).toBe('successRate');
    expect(report.summary.improvementHighlight.maxImprovement).toBeCloseTo(22.24, 2);

    // ===== 【8】 データ品質フラグ検証 =====
    expect(report.dataQuality).toBeDefined();
    expect(report.dataQuality.isValid).toBe(true);
    expect(report.dataQuality.completenessPercent).toBe(100);
    expect(report.dataQuality.anomaliesDetected).toBe(0);
  });
});