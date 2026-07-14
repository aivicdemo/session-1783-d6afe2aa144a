import { classifyRejectReason } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計', () => {
  // SCEN-564: 献立却下修正理由の自動カテゴリ分類機能
  test('should classify rejection reasons into predefined categories and aggregate failure patterns with 100% accuracy', () => {
    // 複数の献立却下・修正理由データを準備
    const rejectReasons = [
      {
        userId: 'user_001',
        reasonText: '栄養バランスが家族の必要栄養素に対応していない',
        submittedAt: '2024-01-15T11:00:00Z',
      },
      {
        userId: 'user_001',
        reasonText: '必要な食材が市場に在庫されていない状態',
        submittedAt: '2024-01-15T12:30:00Z',
      },
      {
        userId: 'user_001',
        reasonText: '提案された調理時間が60分を超過している',
        submittedAt: '2024-01-15T13:45:00Z',
      },
      {
        userId: 'user_001',
        reasonText: '子どものアレルギー対象食材が含まれている',
        submittedAt: '2024-01-15T14:20:00Z',
      },
      {
        userId: 'user_001',
        reasonText: '予算上限の2000円を超える食材構成',
        submittedAt: '2024-01-15T15:00:00Z',
      },
      {
        userId: 'user_001',
        reasonText: '家族が好まない食材が複数含まれている',
        submittedAt: '2024-01-15T15:30:00Z',
      },
      {
        userId: 'user_002',
        reasonText: '栄養バランスが基準値に対して不足',
        submittedAt: '2024-01-16T10:00:00Z',
      },
      {
        userId: 'user_002',
        reasonText: '調理時間が45分超過している',
        submittedAt: '2024-01-16T11:15:00Z',
      },
    ];

    // 自動カテゴリ分類処理を実行
    const classificationResult = classifyRejectReason({
      reasons: rejectReasons,
      definedCategories: [
        'nutritionBalance',
        'ingredientAvailability',
        'cookingTime',
        'allergyViolation',
        'budgetExceeded',
        'familyPreference',
      ],
    });

    // 分類された結果を検証
    expect(classificationResult).toEqual({
      totalReasons: 8,
      classifiedCount: 8,
      classificationAccuracy: 100,
      categorizedReasons: [
        {
          reasonText: '栄養バランスが家族の必要栄養素に対応していない',
          category: 'nutritionBalance',
          confidence: 0.95,
          userId: 'user_001',
          submittedAt: '2024-01-15T11:00:00Z',
        },
        {
          reasonText: '必要な食材が市場に在庫されていない状態',
          category: 'ingredientAvailability',
          confidence: 0.92,
          userId: 'user_001',
          submittedAt: '2024-01-15T12:30:00Z',
        },
        {
          reasonText: '提案された調理時間が60分を超過している',
          category: 'cookingTime',
          confidence: 0.97,
          userId: 'user_001',
          submittedAt: '2024-01-15T13:45:00Z',
        },
        {
          reasonText: '子どものアレルギー対象食材が含まれている',
          category: 'allergyViolation',
          confidence: 0.98,
          userId: 'user_001',
          submittedAt: '2024-01-15T14:20:00Z',
        },
        {
          reasonText: '予算上限の2000円を超える食材構成',
          category: 'budgetExceeded',
          confidence: 0.96,
          userId: 'user_001',
          submittedAt: '2024-01-15T15:00:00Z',
        },
        {
          reasonText: '家族が好まない食材が複数含まれている',
          category: 'familyPreference',
          confidence: 0.91,
          userId: 'user_001',
          submittedAt: '2024-01-15T15:30:00Z',
        },
        {
          reasonText: '栄養バランスが基準値に対して不足',
          category: 'nutritionBalance',
          confidence: 0.94,
          userId: 'user_002',
          submittedAt: '2024-01-16T10:00:00Z',
        },
        {
          reasonText: '調理時間が45分超過している',
          category: 'cookingTime',
          confidence: 0.96,
          userId: 'user_002',
          submittedAt: '2024-01-16T11:15:00Z',
        },
      ],
      aggregatedFailurePatterns: {
        nutritionBalance: {
          count: 2,
          percentage: 25.0,
          exampleReasons: [
            '栄養バランスが家族の必要栄養素に対応していない',
            '栄養バランスが基準値に対して不足',
          ],
        },
        ingredientAvailability: {
          count: 1,
          percentage: 12.5,
          exampleReasons: [
            '必要な食材が市場に在庫されていない状態',
          ],
        },
        cookingTime: {
          count: 2,
          percentage: 25.0,
          exampleReasons: [
            '提案された調理時間が60分を超過している',
            '調理時間が45分超過している',
          ],
        },
        allergyViolation: {
          count: 1,
          percentage: 12.5,
          exampleReasons: [
            '子どものアレルギー対象食材が含まれている',
          ],
        },
        budgetExceeded: {
          count: 1,
          percentage: 12.5,
          exampleReasons: [
            '予算上限の2000円を超える食材構成',
          ],
        },
        familyPreference: {
          count: 1,
          percentage: 12.5,
          exampleReasons: [
            '家族が好まない食材が複数含まれている',
          ],
        },
      },
      periodAnalysis: {
        startDate: '2024-01-15T11:00:00Z',
        endDate: '2024-01-16T11:15:00Z',
        topFailurePattern: 'nutritionBalance',
        topFailurePatternCount: 2,
        secondFailurePattern: 'cookingTime',
        secondFailurePatternCount: 2,
      },
      classificationDetails: {
        successfulClassifications: 8,
        failedClassifications: 0,
        unclassifiedReasons: [],
        confidenceScoreDistribution: {
          veryHigh: 4,
          high: 3,
          moderate: 1,
        },
      },
    });

    // ダッシュボード表示用の集計結果を検証
    expect(classificationResult.aggregatedFailurePatterns.nutritionBalance.count).toBe(2);
    expect(classificationResult.aggregatedFailurePatterns.nutritionBalance.percentage).toBe(25.0);
    expect(classificationResult.aggregatedFailurePatterns.cookingTime.count).toBe(2);
    expect(classificationResult.aggregatedFailurePatterns.cookingTime.percentage).toBe(25.0);
    expect(classificationResult.aggregatedFailurePatterns.allergyViolation.count).toBe(1);
    expect(classificationResult.aggregatedFailurePatterns.allergyViolation.percentage).toBe(12.5);
    expect(classificationResult.aggregatedFailurePatterns.budgetExceeded.count).toBe(1);
    expect(classificationResult.aggregatedFailurePatterns.budgetExceeded.percentage).toBe(12.5);
    expect(classificationResult.aggregatedFailurePatterns.familyPreference.count).toBe(1);
    expect(classificationResult.aggregatedFailurePatterns.familyPreference.percentage).toBe(12.5);
    expect(classificationResult.aggregatedFailurePatterns.ingredientAvailability.count).toBe(1);
    expect(classificationResult.aggregatedFailurePatterns.ingredientAvailability.percentage).toBe(12.5);

    // 分類精度が100%であることを検証
    expect(classificationResult.classificationAccuracy).toBe(100);
    expect(classificationResult.totalReasons).toBe(8);
    expect(classificationResult.classifiedCount).toBe(8);

    // 上位失敗パターンの検証
    expect(classificationResult.periodAnalysis.topFailurePattern).toBe('nutritionBalance');
    expect(classificationResult.periodAnalysis.topFailurePatternCount).toBe(2);
    expect(classificationResult.periodAnalysis.secondFailurePattern).toBe('cookingTime');
    expect(classificationResult.periodAnalysis.secondFailurePatternCount).toBe(2);

    // 複数期間を指定した集計結果の正確性を検証
    const period1Analysis = classifyRejectReason({
      reasons: rejectReasons.slice(0, 6),
      definedCategories: [
        'nutritionBalance',
        'ingredientAvailability',
        'cookingTime',
        'allergyViolation',
        'budgetExceeded',
        'familyPreference',
      ],
    });

    expect(period1Analysis.totalReasons).toBe(6);
    expect(period1Analysis.classifiedCount).toBe(6);
    expect(period1Analysis.aggregatedFailurePatterns.nutritionBalance.count).toBe(1);
    expect(period1Analysis.aggregatedFailurePatterns.cookingTime.count).toBe(1);
    expect(period1Analysis.aggregatedFailurePatterns.allergyViolation.count).toBe(1);
    expect(period1Analysis.aggregatedFailurePatterns.budgetExceeded.count).toBe(1);
    expect(period1Analysis.aggregatedFailurePatterns.familyPreference.count).toBe(1);
    expect(period1Analysis.aggregatedFailurePatterns.ingredientAvailability.count).toBe(1);

    // 分類失敗がないことを検証
    expect(classificationResult.classificationDetails.failedClassifications).toBe(0);
    expect(classificationResult.classificationDetails.unclassifiedReasons.length).toBe(0);

    // 信頼度スコア分布を検証
    expect(classificationResult.classificationDetails.confidenceScoreDistribution.veryHigh).toBe(4);
    expect(classificationResult.classificationDetails.confidenceScoreDistribution.high).toBe(3);
    expect(classificationResult.classificationDetails.confidenceScoreDistribution.moderate).toBe(1);
  });
});