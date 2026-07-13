import { categorizeFoodRejectionReasons, calculateImprovementPriorityScore } from '../../src/logic/it-1-br-2-1-1-1';

describe('献立却下・修正理由の自動カテゴリ分類と改善優先度スコア計算', () => {
  // SCEN-361: [normal] 献立却下・修正理由の自動カテゴリ分類 - 失敗パターンが正しく集計され、改善優先度スコアが計算される
  test('should categorize rejection reasons and calculate improvement priority scores with correct aggregation and ranking', () => {
    // Precondition: 複数の献立却下・修正理由レコード（最低10件以上）を準備
    const rejectionReasons = [
      {
        id: 'reject_001',
        userId: 'user_001',
        reason: '栄養バランスが家族の基準に合致していない',
        category: null,
        timestamp: new Date('2024-01-15T10:30:00Z'),
      },
      {
        id: 'reject_002',
        userId: 'user_001',
        reason: 'タンパク質含有量が推奨値を下回っている',
        category: null,
        timestamp: new Date('2024-01-16T14:15:00Z'),
      },
      {
        id: 'reject_003',
        userId: 'user_001',
        reason: '月の食費予算を超過する食材構成',
        category: null,
        timestamp: new Date('2024-01-17T09:00:00Z'),
      },
      {
        id: 'reject_004',
        userId: 'user_001',
        reason: 'コストが家計方針の上限を上回っている',
        category: null,
        timestamp: new Date('2024-01-18T11:20:00Z'),
      },
      {
        id: 'reject_005',
        userId: 'user_001',
        reason: '含有アレルゲン（卵）が家族成員の制限に抵触',
        category: null,
        timestamp: new Date('2024-01-19T13:45:00Z'),
      },
      {
        id: 'reject_006',
        userId: 'user_001',
        reason: '調理時間が60分を超えており、時間制限に違反',
        category: null,
        timestamp: new Date('2024-01-20T08:30:00Z'),
      },
      {
        id: 'reject_007',
        userId: 'user_001',
        reason: '食物繊維量が推奨値を下回っている',
        category: null,
        timestamp: new Date('2024-01-21T15:00:00Z'),
      },
      {
        id: 'reject_008',
        userId: 'user_001',
        reason: '調理難易度が高く実行不可',
        category: null,
        timestamp: new Date('2024-01-22T10:15:00Z'),
      },
      {
        id: 'reject_009',
        userId: 'user_001',
        reason: 'ナトリウム含有量が制限基準を超過',
        category: null,
        timestamp: new Date('2024-01-23T12:00:00Z'),
      },
      {
        id: 'reject_010',
        userId: 'user_001',
        reason: '食材が冷蔵庫在庫にない',
        category: null,
        timestamp: new Date('2024-01-24T16:30:00Z'),
      },
      {
        id: 'reject_011',
        userId: 'user_001',
        reason: 'カルシウム不足で骨健康基準を満たさない',
        category: null,
        timestamp: new Date('2024-01-25T09:45:00Z'),
      },
      {
        id: 'reject_012',
        userId: 'user_001',
        reason: '予算制約のため代替食材を提案すること',
        category: null,
        timestamp: new Date('2024-01-26T14:20:00Z'),
      },
    ];

    // Trigger: カテゴリ分類機能を実行
    const categorizedResults = categorizeFoodRejectionReasons(rejectionReasons);

    // Outcome 1: 各レコードが正しいカテゴリに分類されたことを確認
    expect(categorizedResults).toHaveLength(12);
    
    const nutritionBalanceItems = categorizedResults.filter(
      (item) => item.category === 'nutritionBalance'
    );
    expect(nutritionBalanceItems).toHaveLength(5); // reject_001, reject_002, reject_007, reject_009, reject_011
    
    const costExceedItems = categorizedResults.filter(
      (item) => item.category === 'costExceed'
    );
    expect(costExceedItems).toHaveLength(3); // reject_003, reject_004, reject_012
    
    const allergyViolationItems = categorizedResults.filter(
      (item) => item.category === 'allergyViolation'
    );
    expect(allergyViolationItems).toHaveLength(1); // reject_005
    
    const cookingTimeExceedItems = categorizedResults.filter(
      (item) => item.category === 'cookingTimeExceed'
    );
    expect(cookingTimeExceedItems).toHaveLength(2); // reject_006, reject_008
    
    const inventoryShortageItems = categorizedResults.filter(
      (item) => item.category === 'inventoryShortage'
    );
    expect(inventoryShortageItems).toHaveLength(1); // reject_010

    // Verify each categorized record has timestamp preserved
    expect(categorizedResults[0]).toHaveProperty('timestamp');
    expect(categorizedResults[0].timestamp).toEqual(new Date('2024-01-15T10:30:00Z'));

    // Outcome 2: 分類されたレコード群から失敗パターン別の集計処理を実行
    const aggregationInput = {
      categorizedReasons: categorizedResults,
      periodStartDate: new Date('2024-01-15T00:00:00Z'),
      periodEndDate: new Date('2024-01-26T23:59:59Z'),
    };

    const aggregationResult = calculateImprovementPriorityScore(aggregationInput);

    // Outcome 3: 各カテゴリごとの発生件数が正確に集計されたことを確認
    expect(aggregationResult.categoryAggregate).toHaveProperty('nutritionBalance');
    expect(aggregationResult.categoryAggregate.nutritionBalance.occurrenceCount).toBe(5);
    
    expect(aggregationResult.categoryAggregate).toHaveProperty('costExceed');
    expect(aggregationResult.categoryAggregate.costExceed.occurrenceCount).toBe(3);
    
    expect(aggregationResult.categoryAggregate).toHaveProperty('allergyViolation');
    expect(aggregationResult.categoryAggregate.allergyViolation.occurrenceCount).toBe(1);
    
    expect(aggregationResult.categoryAggregate).toHaveProperty('cookingTimeExceed');
    expect(aggregationResult.categoryAggregate.cookingTimeExceed.occurrenceCount).toBe(2);
    
    expect(aggregationResult.categoryAggregate).toHaveProperty('inventoryShortage');
    expect(aggregationResult.categoryAggregate.inventoryShortage.occurrenceCount).toBe(1);

    // Outcome 4: 発生頻度が正確に計算されたことを確認
    // 発生頻度 = 発生件数 / 総件数
    const totalOccurrences = 12;
    expect(aggregationResult.categoryAggregate.nutritionBalance.frequency).toBeCloseTo(
      5 / totalOccurrences,
      4
    );
    expect(aggregationResult.categoryAggregate.costExceed.frequency).toBeCloseTo(
      3 / totalOccurrences,
      4
    );
    expect(aggregationResult.categoryAggregate.allergyViolation.frequency).toBeCloseTo(
      1 / totalOccurrences,
      4
    );
    expect(aggregationResult.categoryAggregate.cookingTimeExceed.frequency).toBeCloseTo(
      2 / totalOccurrences,
      4
    );

    // Outcome 5: 時系列での発生パターンが正確に集計されたことを確認
    expect(aggregationResult.categoryAggregate.nutritionBalance).toHaveProperty(
      'temporalPattern'
    );
    expect(Array.isArray(aggregationResult.categoryAggregate.nutritionBalance.temporalPattern)).toBe(
      true
    );
    expect(aggregationResult.categoryAggregate.nutritionBalance.temporalPattern.length).toBeGreaterThan(0);

    // Outcome 6: 改善優先度スコア計算ロジック（重要度 × 発生頻度 × 影響度など）を実行
    // 計算式: priorityScore = (occurrenceCount × weightImportance) + (frequency × 100 × weightFrequency) + (impactSeverity × weightImpact)
    // 具体例: nutritionBalance: (5 × 30) + (0.4167 × 100 × 25) + (80 × 20) = 150 + 1041.75 + 1600 = 2791.75 → 正規化して 0-100 に収める
    
    expect(aggregationResult.priorityScores).toBeDefined();
    expect(aggregationResult.priorityScores).toHaveProperty('nutritionBalance');
    expect(aggregationResult.priorityScores).toHaveProperty('costExceed');
    expect(aggregationResult.priorityScores).toHaveProperty('allergyViolation');
    expect(aggregationResult.priorityScores).toHaveProperty('cookingTimeExceed');
    expect(aggregationResult.priorityScores).toHaveProperty('inventoryShortage');

    // Outcome 7: 計算された改善優先度スコアが期待値範囲内（0～100）であることを確認
    Object.values(aggregationResult.priorityScores).forEach((score) => {
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    // Specific priority score values based on formula:
    // nutritionBalance: highest (5 occurrences, high importance)
    expect(aggregationResult.priorityScores.nutritionBalance).toBe(87);
    
    // costExceed: second highest (3 occurrences, high impact)
    expect(aggregationResult.priorityScores.costExceed).toBe(72);
    
    // cookingTimeExceed: third (2 occurrences, medium impact)
    expect(aggregationResult.priorityScores.cookingTimeExceed).toBe(58);
    
    // allergyViolation: fourth (1 occurrence, high impact due to safety)
    expect(aggregationResult.priorityScores.allergyViolation).toBe(45);
    
    // inventoryShortage: lowest (1 occurrence, low importance)
    expect(aggregationResult.priorityScores.inventoryShortage).toBe(30);

    // Outcome 8: 優先度スコアが高い順に正しくソート・ランキングされていることを確認
    expect(aggregationResult.priorityRanking).toBeDefined();
    expect(aggregationResult.priorityRanking).toHaveLength(5);
    
    expect(aggregationResult.priorityRanking[0]).toEqual({
      rank: 1,
      category: 'nutritionBalance',
      priorityScore: 87,
    });
    
    expect(aggregationResult.priorityRanking[1]).toEqual({
      rank: 2,
      category: 'costExceed',
      priorityScore: 72,
    });
    
    expect(aggregationResult.priorityRanking[2]).toEqual({
      rank: 3,
      category: 'cookingTimeExceed',
      priorityScore: 58,
    });
    
    expect(aggregationResult.priorityRanking[3]).toEqual({
      rank: 4,
      category: 'allergyViolation',
      priorityScore: 45,
    });
    
    expect(aggregationResult.priorityRanking[4]).toEqual({
      rank: 5,
      category: 'inventoryShortage',
      priorityScore: 30,
    });

    // Verify ranking is in descending order
    for (let i = 0; i < aggregationResult.priorityRanking.length - 1; i++) {
      expect(aggregationResult.priorityRanking[i].priorityScore).toBeGreaterThan(
        aggregationResult.priorityRanking[i + 1].priorityScore
      );
    }

    // Outcome 9: ダッシュボード表示用フォーマットが正確に生成されたことを確認
    expect(aggregationResult.dashboardMetadata).toBeDefined();
    expect(aggregationResult.dashboardMetadata).toHaveProperty('totalAnalyzedRecords');
    expect(aggregationResult.dashboardMetadata.totalAnalyzedRecords).toBe(12);
    
    expect(aggregationResult.dashboardMetadata).toHaveProperty('analysisStartDate');
    expect(aggregationResult.dashboardMetadata.analysisStartDate).toEqual(
      new Date('2024-01-15T00:00:00Z')
    );
    
    expect(aggregationResult.dashboardMetadata).toHaveProperty('analysisEndDate');
    expect(aggregationResult.dashboardMetadata.analysisEndDate).toEqual(
      new Date('2024-01-26T23:59:59Z')
    );
    
    expect(aggregationResult.dashboardMetadata).toHaveProperty('generatedAt');
    expect(aggregationResult.dashboardMetadata.generatedAt).toBeInstanceOf(Date);

    // Outcome 10: ダッシュボード表示内容が正確であることを確認
    expect(aggregationResult.dashboardDisplay).toBeDefined();
    expect(aggregationResult.dashboardDisplay.title).toBe('献立改善優先度ダッシュボード');
    expect(aggregationResult.dashboardDisplay.summary).toEqual({
      totalFailurePatterns: 12,
      distinctCategories: 5,
      topPriorityCategory: 'nutritionBalance',
      topPriorityScore: 87,
    });
    
    expect(aggregationResult.dashboardDisplay.chartData).toBeDefined();
    expect(Array.isArray(aggregationResult.dashboardDisplay.chartData)).toBe(true);
    expect(aggregationResult.dashboardDisplay.chartData.length).toBe(5);
    
    // Verify chart data ordering
    expect(aggregationResult.dashboardDisplay.chartData[0].category).toBe('nutritionBalance');
    expect(aggregationResult.dashboardDisplay.chartData[0].score).toBe(87);
    expect(aggregationResult.dashboardDisplay.chartData[0].occurrenceCount).toBe(5);
    
    expect(aggregationResult.dashboardDisplay.chartData[1].category).toBe('costExceed');
    expect(aggregationResult.dashboardDisplay.chartData[1].score).toBe(72);
    expect(aggregationResult.dashboardDisplay.chartData[1].occurrenceCount).toBe(3);
    
    expect(aggregationResult.dashboardDisplay.chartData[4].category).toBe('inventoryShortage');
    expect(aggregationResult.dashboardDisplay.chartData[4].score).toBe(30);
    expect(aggregationResult.dashboardDisplay.chartData[4].occurrenceCount).toBe(1);

    // Outcome 11: 意思決定支援情報が提供されていることを確認
    expect(aggregationResult.improvementRecommendations).toBeDefined();
    expect(Array.isArray(aggregationResult.improvementRecommendations)).toBe(true);
    expect(aggregationResult.improvementRecommendations.length).toBeGreaterThan(0);
    
    expect(aggregationResult.improvementRecommendations[0]).toHaveProperty('priority');
    expect(aggregationResult.improvementRecommendations[0]).toHaveProperty('category');
    expect(aggregationResult.improvementRecommendations[0]).toHaveProperty('recommendation');
    expect(aggregationResult.improvementRecommendations[0]).toHaveProperty('expectedImpact');
    
    // Top recommendation should be for nutritionBalance
    expect(aggregationResult.improvementRecommendations[0].priority).toBe(1);
    expect(aggregationResult.improvementRecommendations[0].category).toBe('nutritionBalance');
    expect(aggregationResult.improvementRecommendations[0].expectedImpact).toBeGreaterThan(0);
  });
});