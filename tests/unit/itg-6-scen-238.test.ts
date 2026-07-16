import { analyzeSegmentUtilizationPatterns } from '../../src/logic/it-1-br-8-2-2-1';

describe('ユーザーセグメント別利用パターン分析 - 利用ログ不足またはセグメント分類データ欠落時のエラーハンドリング', () => {
  // SCEN-238
  test('利用ログが不足またはセグメント分類データが欠落している場合、パターン分析処理は実行されず、適切なエラーメッセージが返却される', () => {
    // 準備: 利用ログが不足（0件）のテストデータ
    const insufficientUsageLogsData = {
      usageLogsCount: 0,
      usageLogs: [],
      segmentationData: [
        {
          segmentId: 'seg_001',
          userId: 'user_001',
          classificationDatetime: '2024-01-15T10:00:00Z',
          segmentName: 'time_constrained_group',
        },
      ],
      analysisStartDate: '2024-01-01T00:00:00Z',
      analysisEndDate: '2024-01-31T23:59:59Z',
    };

    // テスト実行: 利用ログ不足の場合
    expect(() =>
      analyzeSegmentUtilizationPatterns(insufficientUsageLogsData)
    ).toThrow(/利用ログ不足/);
  });

  test('セグメント分類データの必須フィールド（segmentId）が欠落している場合、エラーメッセージが返却される', () => {
    // 準備: segmentId フィールドが欠落したセグメント分類データ
    const missingSegmentIdData = {
      usageLogsCount: 5,
      usageLogs: [
        {
          logId: 'log_001',
          userId: 'user_001',
          featureName: 'menu_generation',
          usageTimestamp: '2024-01-15T09:30:00Z',
          actionType: 'click',
        },
        {
          logId: 'log_002',
          userId: 'user_001',
          featureName: 'nutrition_dashboard',
          usageTimestamp: '2024-01-15T10:15:00Z',
          actionType: 'view',
        },
      ],
      segmentationData: [
        {
          // segmentId が欠落
          userId: 'user_001',
          classificationDatetime: '2024-01-15T10:00:00Z',
          segmentName: 'time_constrained_group',
        },
      ],
      analysisStartDate: '2024-01-01T00:00:00Z',
      analysisEndDate: '2024-01-31T23:59:59Z',
    };

    // テスト実行: segmentId 欠落の場合
    expect(() =>
      analyzeSegmentUtilizationPatterns(missingSegmentIdData)
    ).toThrow(/segmentId/);
  });

  test('セグメント分類データの必須フィールド（userId）が欠落している場合、エラーメッセージが返却される', () => {
    // 準備: userId フィールドが欠落したセグメント分類データ
    const missingUserIdData = {
      usageLogsCount: 5,
      usageLogs: [
        {
          logId: 'log_001',
          userId: 'user_001',
          featureName: 'menu_generation',
          usageTimestamp: '2024-01-15T09:30:00Z',
          actionType: 'click',
        },
      ],
      segmentationData: [
        {
          segmentId: 'seg_001',
          // userId が欠落
          classificationDatetime: '2024-01-15T10:00:00Z',
          segmentName: 'time_constrained_group',
        },
      ],
      analysisStartDate: '2024-01-01T00:00:00Z',
      analysisEndDate: '2024-01-31T23:59:59Z',
    };

    // テスト実行: userId 欠落の場合
    expect(() =>
      analyzeSegmentUtilizationPatterns(missingUserIdData)
    ).toThrow(/userId/);
  });

  test('セグメント分類データの必須フィールド（classificationDatetime）が欠落している場合、エラーメッセージが返却される', () => {
    // 準備: classificationDatetime フィールドが欠落したセグメント分類データ
    const missingClassificationDatetimeData = {
      usageLogsCount: 5,
      usageLogs: [
        {
          logId: 'log_001',
          userId: 'user_001',
          featureName: 'menu_generation',
          usageTimestamp: '2024-01-15T09:30:00Z',
          actionType: 'click',
        },
      ],
      segmentationData: [
        {
          segmentId: 'seg_001',
          userId: 'user_001',
          // classificationDatetime が欠落
          segmentName: 'time_constrained_group',
        },
      ],
      analysisStartDate: '2024-01-01T00:00:00Z',
      analysisEndDate: '2024-01-31T23:59:59Z',
    };

    // テスト実行: classificationDatetime 欠落の場合
    expect(() =>
      analyzeSegmentUtilizationPatterns(missingClassificationDatetimeData)
    ).toThrow(/classificationDatetime/);
  });

  test('利用ログとセグメント分類データが正常に存在する場合、パターン分析が正常に実行され、セグメント別の利用パターンが返却される', () => {
    // 準備: 十分な利用ログとセグメント分類データ
    const validAnalysisData = {
      usageLogsCount: 8,
      usageLogs: [
        {
          logId: 'log_001',
          userId: 'user_001',
          featureName: 'menu_generation',
          usageTimestamp: '2024-01-15T09:30:00Z',
          actionType: 'click',
        },
        {
          logId: 'log_002',
          userId: 'user_001',
          featureName: 'nutrition_dashboard',
          usageTimestamp: '2024-01-15T10:15:00Z',
          actionType: 'view',
        },
        {
          logId: 'log_003',
          userId: 'user_001',
          featureName: 'budget_tracker',
          usageTimestamp: '2024-01-15T10:45:00Z',
          actionType: 'click',
        },
        {
          logId: 'log_004',
          userId: 'user_002',
          featureName: 'menu_generation',
          usageTimestamp: '2024-01-16T08:00:00Z',
          actionType: 'click',
        },
        {
          logId: 'log_005',
          userId: 'user_002',
          featureName: 'ingredient_restriction',
          usageTimestamp: '2024-01-16T08:30:00Z',
          actionType: 'view',
        },
        {
          logId: 'log_006',
          userId: 'user_002',
          featureName: 'cooking_time_tracker',
          usageTimestamp: '2024-01-16T09:00:00Z',
          actionType: 'click',
        },
        {
          logId: 'log_007',
          userId: 'user_003',
          featureName: 'menu_generation',
          usageTimestamp: '2024-01-17T07:00:00Z',
          actionType: 'click',
        },
        {
          logId: 'log_008',
          userId: 'user_003',
          featureName: 'shopping_list',
          usageTimestamp: '2024-01-17T07:30:00Z',
          actionType: 'view',
        },
      ],
      segmentationData: [
        {
          segmentId: 'seg_time_constrained',
          userId: 'user_001',
          classificationDatetime: '2024-01-01T00:00:00Z',
          segmentName: 'time_constrained_group',
        },
        {
          segmentId: 'seg_budget_conscious',
          userId: 'user_002',
          classificationDatetime: '2024-01-01T00:00:00Z',
          segmentName: 'budget_conscious_group',
        },
        {
          segmentId: 'seg_time_constrained',
          userId: 'user_003',
          classificationDatetime: '2024-01-01T00:00:00Z',
          segmentName: 'time_constrained_group',
        },
      ],
      analysisStartDate: '2024-01-01T00:00:00Z',
      analysisEndDate: '2024-01-31T23:59:59Z',
    };

    // テスト実行: パターン分析を実行
    const result = analyzeSegmentUtilizationPatterns(validAnalysisData);

    // 期待値の検証
    expect(result).toBeDefined();
    expect(result.analysisStatus).toBe('success');
    expect(result.segmentPatterns).toBeDefined();
    expect(Array.isArray(result.segmentPatterns)).toBe(true);

    // セグメント別の利用パターンが正しく集計されている
    expect(result.segmentPatterns.length).toBe(2);

    // time_constrained_group セグメント（user_001, user_003 の利用ログ）
    const timeConstrainedPattern = result.segmentPatterns.find(
      (p) => p.segmentName === 'time_constrained_group'
    );
    expect(timeConstrainedPattern).toBeDefined();
    expect(timeConstrainedPattern?.userCount).toBe(2);
    expect(timeConstrainedPattern?.totalLogsInSegment).toBe(4);
    expect(timeConstrainedPattern?.featureUsageFrequency).toBeDefined();

    // budget_conscious_group セグメント（user_002 の利用ログ）
    const budgetConsciousPattern = result.segmentPatterns.find(
      (p) => p.segmentName === 'budget_conscious_group'
    );
    expect(budgetConsciousPattern).toBeDefined();
    expect(budgetConsciousPattern?.userCount).toBe(1);
    expect(budgetConsciousPattern?.totalLogsInSegment).toBe(3);

    // 各セグメントの機能別使用頻度データが含まれている
    expect(Array.isArray(timeConstrainedPattern?.featureUsageFrequency)).toBe(true);
    expect(timeConstrainedPattern?.featureUsageFrequency.length).toBeGreaterThan(0);

    // 各機能の使用頻度ランクが付与されている
    timeConstrainedPattern?.featureUsageFrequency.forEach((freq) => {
      expect(freq.featureName).toBeDefined();
      expect(typeof freq.usageCount).toBe('number');
      expect(freq.usageCount).toBeGreaterThan(0);
      expect(['high', 'medium', 'low']).toContain(freq.frequencyRank);
    });

    // 離脱ポイント分析データが含まれている
    expect(result.abandonmentPoints).toBeDefined();
    expect(Array.isArray(result.abandonmentPoints)).toBe(true);

    // エラーは発生していない
    expect(result.errorMessage).toBeUndefined();
  });

  test('セグメント分類データが空配列の場合、パターン分析処理は実行されず、適切なエラーメッセージが返却される', () => {
    // 準備: セグメント分類データが空
    const emptySegmentationData = {
      usageLogsCount: 5,
      usageLogs: [
        {
          logId: 'log_001',
          userId: 'user_001',
          featureName: 'menu_generation',
          usageTimestamp: '2024-01-15T09:30:00Z',
          actionType: 'click',
        },
        {
          logId: 'log_002',
          userId: 'user_001',
          featureName: 'nutrition_dashboard',
          usageTimestamp: '2024-01-15T10:15:00Z',
          actionType: 'view',
        },
      ],
      segmentationData: [],
      analysisStartDate: '2024-01-01T00:00:00Z',
      analysisEndDate: '2024-01-31T23:59:59Z',
    };

    // テスト実行: セグメント分類データ空の場合
    expect(() =>
      analyzeSegmentUtilizationPatterns(emptySegmentationData)
    ).toThrow(/セグメント分類/);
  });

  test('利用ログとセグメント分類データが存在するが、分析期間外の場合、適切なエラーメッセージが返却される', () => {
    // 準備: 分析期間外のセグメント分類データ
    const outOfRangeData = {
      usageLogsCount: 2,
      usageLogs: [
        {
          logId: 'log_001',
          userId: 'user_001',
          featureName: 'menu_generation',
          usageTimestamp: '2024-01-15T09:30:00Z',
          actionType: 'click',
        },
        {
          logId: 'log_002',
          userId: 'user_001',
          featureName: 'nutrition_dashboard',
          usageTimestamp: '2024-01-15T10:15:00Z',
          actionType: 'view',
        },
      ],
      segmentationData: [
        {
          segmentId: 'seg_001',
          userId: 'user_001',
          classificationDatetime: '2023-12-01T00:00:00Z', // 分析期間外
          segmentName: 'time_constrained_group',
        },
      ],
      analysisStartDate: '2024-01-01T00:00:00Z',
      analysisEndDate: '2024-01-31T23:59:59Z',
    };

    // テスト実行: 分析期間外の場合
    expect(() =>
      analyzeSegmentUtilizationPatterns(outOfRangeData)
    ).toThrow(/分析期間/);
  });

  test('複数のセグメント分類データが欠落している場合、すべての欠落フィールドを特定してエラーメッセージに含める', () => {
    // 準備: 複数のフィールドが欠落したセグメント分類データ
    const multipleFieldsMissingData = {
      usageLogsCount: 5,
      usageLogs: [
        {
          logId: 'log_001',
          userId: 'user_001',
          featureName: 'menu_generation',
          usageTimestamp: '2024-01-15T09:30:00Z',
          actionType: 'click',
        },
        {
          logId: 'log_002',
          userId: 'user_001',
          featureName: 'nutrition_dashboard',
          usageTimestamp: '2024-01-15T10:15:00Z',
          actionType: 'view',
        },
      ],
      segmentationData: [
        {
          // segmentId, userId 両方欠落
          classificationDatetime: '2024-01-15T10:00:00Z',
          segmentName: 'time_constrained_group',
        },
      ],
      analysisStartDate: '2024-01-01T00:00:00Z',
      analysisEndDate: '2024-01-31T23:59:59Z',
    };

    // テスト実行: 複数フィールド欠落の場合
    expect(() =>
      analyzeSegmentUtilizationPatterns(multipleFieldsMissingData)
    ).toThrow(/必須フィールド/);
  });
});