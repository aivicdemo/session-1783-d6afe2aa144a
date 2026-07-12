import { analyzeFeatureUsagePattern } from '../../src/logic/it-3';

describe('食事評価データを献立生成ロジックに反映させる機能', () => {
  // SCEN-399
  test('機能別使用パターン分析機能 - 機能別の使用頻度・離脱ポイント・競合差別化根拠が定量化される', () => {
    const analysisStartDate = new Date('2024-01-01T00:00:00Z');
    const analysisEndDate = new Date('2024-01-31T23:59:59Z');
    const userId = 'user_001';

    const input = {
      userId,
      analysisStartDate,
      analysisEndDate,
      functionNames: [
        '献立生成',
        '在庫管理',
        '栄養分析',
        '予算管理',
        'レシピ検索'
      ]
    };

    const result = analyzeFeatureUsagePattern(input);

    // 期待値: 献立生成 - 使用頻度 24回, 離脱率 8.3%, 競合差別化根拠スコア 85
    expect(result.features[0].name).toBe('献立生成');
    expect(result.features[0].usageFrequency).toBe(24);
    expect(result.features[0].accessCount).toBe(24);
    expect(result.features[0].averageSessionMinutes).toBe(12.5);
    expect(result.features[0].abandonnmentRate).toBe(8.3);
    expect(result.features[0].competitiveDifferentiationScore).toBe(85);

    // 期待値: 在庫管理 - 使用頻度 18回, 離脱率 11.1%, 競合差別化根拠スコア 72
    expect(result.features[1].name).toBe('在庫管理');
    expect(result.features[1].usageFrequency).toBe(18);
    expect(result.features[1].accessCount).toBe(18);
    expect(result.features[1].averageSessionMinutes).toBe(8.3);
    expect(result.features[1].abandonnmentRate).toBe(11.1);
    expect(result.features[1].competitiveDifferentiationScore).toBe(72);

    // 期待値: 栄養分析 - 使用頻度 15回, 離脱率 13.3%, 競合差別化根拠スコア 78
    expect(result.features[2].name).toBe('栄養分析');
    expect(result.features[2].usageFrequency).toBe(15);
    expect(result.features[2].accessCount).toBe(15);
    expect(result.features[2].averageSessionMinutes).toBe(9.7);
    expect(result.features[2].abandonnmentRate).toBe(13.3);
    expect(result.features[2].competitiveDifferentiationScore).toBe(78);

    // 期待値: 予算管理 - 使用頻度 12回, 離脱率 16.7%, 競合差別化根拠スコア 65
    expect(result.features[3].name).toBe('予算管理');
    expect(result.features[3].usageFrequency).toBe(12);
    expect(result.features[3].accessCount).toBe(12);
    expect(result.features[3].averageSessionMinutes).toBe(6.2);
    expect(result.features[3].abandonnmentRate).toBe(16.7);
    expect(result.features[3].competitiveDifferentiationScore).toBe(65);

    // 期待値: レシピ検索 - 使用頻度 9回, 離脱率 22.2%, 競合差別化根拠スコア 58
    expect(result.features[4].name).toBe('レシピ検索');
    expect(result.features[4].usageFrequency).toBe(9);
    expect(result.features[4].accessCount).toBe(9);
    expect(result.features[4].averageSessionMinutes).toBe(5.1);
    expect(result.features[4].abandonnmentRate).toBe(22.2);
    expect(result.features[4].competitiveDifferentiationScore).toBe(58);

    // 離脱ポイント詳細データの検証
    expect(result.features[0].abandonmentPoints).toEqual([
      {
        screenName: '献立確認画面',
        abandonmentCount: 2,
        abandonmentRate: 8.3
      }
    ]);

    expect(result.features[1].abandonmentPoints).toEqual([
      {
        screenName: '在庫編集画面',
        abandonmentCount: 2,
        abandonmentRate: 11.1
      }
    ]);

    expect(result.features[2].abandonmentPoints).toEqual([
      {
        screenName: '栄養詳細分析画面',
        abandonmentCount: 2,
        abandonmentRate: 13.3
      }
    ]);

    expect(result.features[3].abandonmentPoints).toEqual([
      {
        screenName: '予算設定画面',
        abandonmentCount: 2,
        abandonmentRate: 16.7
      }
    ]);

    expect(result.features[4].abandonmentPoints).toEqual([
      {
        screenName: 'レシピ詳細画面',
        abandonmentCount: 2,
        abandonmentRate: 22.2
      }
    ]);

    // 競合差別化根拠データの検証
    expect(result.competitiveDifferentiationReasons).toEqual([
      {
        featureName: '献立生成',
        uniqueFeatureUtilizationRate: 94,
        userSatisfactionScore: 8.7,
        differentiationPotential: 'Very High'
      },
      {
        featureName: '栄養分析',
        uniqueFeatureUtilizationRate: 87,
        userSatisfactionScore: 8.2,
        differentiationPotential: 'High'
      },
      {
        featureName: '在庫管理',
        uniqueFeatureUtilizationRate: 79,
        userSatisfactionScore: 7.8,
        differentiationPotential: 'Medium'
      },
      {
        featureName: '予算管理',
        uniqueFeatureUtilizationRate: 71,
        userSatisfactionScore: 7.3,
        differentiationPotential: 'Medium'
      },
      {
        featureName: 'レシピ検索',
        uniqueFeatureUtilizationRate: 63,
        userSatisfactionScore: 6.9,
        differentiationPotential: 'Low'
      }
    ]);

    // 分析期間情報の検証
    expect(result.analysisPeriod.startDate).toBe('2024-01-01T00:00:00Z');
    expect(result.analysisPeriod.endDate).toBe('2024-01-31T23:59:59Z');
    expect(result.analysisPeriod.durationDays).toBe(30);

    // サマリー統計の検証
    expect(result.summaryStatistics.totalFeatureAccess).toBe(78);
    expect(result.summaryStatistics.averageSessionDurationMinutes).toBe(8.36);
    expect(result.summaryStatistics.overallAbandonmentRate).toBe(14.38);
    expect(result.summaryStatistics.averageUserSatisfactionScore).toBe(7.78);

    // エクスポート用フォーマット検証
    expect(result.exportFormat).toEqual({
      csv: {
        fileName: 'feature_usage_analysis_2024-01-01_2024-01-31.csv',
        columns: [
          'featureName',
          'usageFrequency',
          'accessCount',
          'averageSessionMinutes',
          'abandonmentRate',
          'competitiveDifferentiationScore',
          'uniqueFeatureUtilizationRate',
          'userSatisfactionScore'
        ]
      },
      pdf: {
        fileName: 'feature_usage_analysis_2024-01-01_2024-01-31.pdf',
        sections: [
          '使用頻度分析',
          '離脱ポイント分析',
          '競合差別化根拠分析',
          'サマリー'
        ]
      }
    });

    // グラフ形式データの検証
    expect(result.graphData).toEqual({
      usageFrequencyChart: {
        type: 'bar',
        title: '機能別使用頻度',
        data: [
          { label: '献立生成', value: 24 },
          { label: '在庫管理', value: 18 },
          { label: '栄養分析', value: 15 },
          { label: '予算管理', value: 12 },
          { label: 'レシピ検索', value: 9 }
        ]
      },
      abandonmentRateChart: {
        type: 'line',
        title: '機能別離脱率',
        data: [
          { label: '献立生成', value: 8.3 },
          { label: '在庫管理', value: 11.1 },
          { label: '栄養分析', value: 13.3 },
          { label: '予算管理', value: 16.7 },
          { label: 'レシピ検索', value: 22.2 }
        ]
      },
      differentiationScoreChart: {
        type: 'scatter',
        title: '競合差別化根拠スコア',
        data: [
          { label: '献立生成', x: 94, y: 8.7 },
          { label: '栄養分析', x: 87, y: 8.2 },
          { label: '在庫管理', x: 79, y: 7.8 },
          { label: '予算管理', x: 71, y: 7.3 },
          { label: 'レシピ検索', x: 63, y: 6.9 }
        ]
      }
    });

    // 精度検証フラグ
    expect(result.dataAccuracyValidation).toEqual({
      isValid: true,
      precision: 'high',
      lastUpdated: '2024-01-31T23:59:59Z',
      validationStatus: 'passed'
    });
  });
});