import { detectCompetitiveDifferentiationAxis } from '../../src/logic/it-1-br-4-2-1';

describe('食事制限条件の変更時に過去献立との抵触検出機能', () => {
  // SCEN-693
  test('専業主夫層の具体的ペイン要因と競合差別化軸が定量的に根拠付けされた機能リストが生成される', () => {
    const userSegmentInput = {
      segmentId: 'seg-001',
      segmentName: '専業主夫',
      userCount: 1250,
      ageRange: '30-50',
      familyComposition: '4人家族',
      foodRestrictionPresence: true,
    };

    const painAnalysisData = {
      painFactorId: 'pain-001',
      painFactorName: '調理時間短縮',
      occurrenceFrequency: 0.87,
      impactLevel: 0.92,
      quantitativeEvidence: {
        userSatisfactionScore: 4.3,
        surveyDataCount: 325,
        averageTimeReduction: 23.5,
      },
    };

    const competitorBenchmarkData = [
      {
        competitorAppId: 'comp-001',
        competitorName: 'RecipeApp Pro',
        painFactorCoverageScore: 65,
        featureComparisonScore: 58,
        userPreferenceScore: 0.62,
      },
      {
        competitorAppId: 'comp-002',
        competitorName: 'NutritionPlus',
        painFactorCoverageScore: 72,
        featureComparisonScore: 68,
        userPreferenceScore: 0.71,
      },
    ];

    const differentiatationAxisInput = {
      userSegmentId: userSegmentInput.segmentId,
      painAnalysis: painAnalysisData,
      competitorBenchmarks: competitorBenchmarkData,
      marketShareData: {
        ourMarketShare: 18.5,
        topCompetitorShare: 31.2,
        segmentTotalMarket: 2400000,
      },
    };

    const result = detectCompetitiveDifferentiationAxis(differentiatationAxisInput);

    expect(result).toEqual({
      userSegmentId: 'seg-001',
      painFactorName: '調理時間短縮',
      painFactorQuantitativeEvidence: {
        userSatisfactionScore: 4.3,
        surveyDataCount: 325,
        averageTimeReduction: 23.5,
      },
      differentiatationAxisList: [
        {
          axisId: 'axis-001',
          axisName: 'AI時短レシピ提案',
          targetPainFactor: '調理時間短縮',
          competitiveGapScore: 35,
          marketOpportunitySizeInYen: 441000,
          implementationDifficulty: 'medium',
          priorityRank: 1,
          quantitativeRootCause: {
            competitorCoverageGap: 35,
            userPreferenceDifferential: 0.30,
            potentialMarketCaptureRate: 0.1837,
          },
        },
        {
          axisId: 'axis-002',
          axisName: '栄養バランス自動最適化',
          targetPainFactor: '栄養管理',
          competitiveGapScore: 28,
          marketOpportunitySizeInYen: 336000,
          implementationDifficulty: 'high',
          priorityRank: 2,
          quantitativeRootCause: {
            competitorCoverageGap: 28,
            userPreferenceDifferential: 0.25,
            potentialMarketCaptureRate: 0.14,
          },
        },
      ],
      featureListExportFormat: {
        exportTimestamp: '2024-01-15T11:00:00Z',
        fileFormat: 'pdf',
        includesMarketData: true,
        includedSections: [
          'pain_analysis_summary',
          'competitive_benchmark',
          'differentiation_axis_detail',
          'implementation_roadmap',
        ],
      },
      generationSuccessful: true,
      qualityAssuranceStatus: 'passed',
    });

    expect(result.painFactorName).toBe('調理時間短縮');
    expect(result.differentiatationAxisList.length).toBe(2);
    expect(result.differentiatationAxisList[0].priorityRank).toBe(1);
    expect(result.differentiatationAxisList[0].competitiveGapScore).toBe(35);
    expect(result.differentiatationAxisList[1].priorityRank).toBe(2);
    expect(result.differentiatationAxisList[1].competitiveGapScore).toBe(28);
    expect(result.featureListExportFormat.includesMarketData).toBe(true);
    expect(result.generationSuccessful).toBe(true);
    expect(result.qualityAssuranceStatus).toBe('passed');
  });
});