import { analyzeUserSegmentUtilizationPatterns } from '../../src/logic/it-1-br-8-2-1-1';

describe('ユーザーセグメント別利用パターン分析ダッシュボード', () => {
  // SCEN-278
  test('[normal] ユーザーセグメント別利用パターン分析機能 - 機能別使用頻度からユーザーセグメント別の利用パターンが分析される', () => {
    // テストデータ: 複数のユーザーセグメント
    const segmentData = [
      {
        segmentId: 'free_users_001',
        segmentName: 'フリーユーザー',
        userCount: 150,
        featureUsage: [
          { featureId: 'feature_A', featureName: '献立生成', usageCount: 420, usageRate: 0.28 },
          { featureId: 'feature_B', featureName: '栄養管理', usageCount: 180, usageRate: 0.12 },
          { featureId: 'feature_C', featureName: '食費管理', usageCount: 900, usageRate: 0.60 },
        ],
      },
      {
        segmentId: 'paid_users_001',
        segmentName: '有料ユーザー',
        userCount: 320,
        featureUsage: [
          { featureId: 'feature_A', featureName: '献立生成', usageCount: 2560, usageRate: 0.64 },
          { featureId: 'feature_B', featureName: '栄養管理', usageCount: 1280, usageRate: 0.32 },
          { featureId: 'feature_C', featureName: '食費管理', usageCount: 160, usageRate: 0.04 },
        ],
      },
      {
        segmentId: 'enterprise_users_001',
        segmentName: 'エンタープライズユーザー',
        userCount: 85,
        featureUsage: [
          { featureId: 'feature_A', featureName: '献立生成', usageCount: 595, usageRate: 0.35 },
          { featureId: 'feature_B', featureName: '栄養管理', usageCount: 850, usageRate: 0.50 },
          { featureId: 'feature_C', featureName: '食費管理', usageCount: 255, usageRate: 0.15 },
        ],
      },
    ];

    const analysisResult = analyzeUserSegmentUtilizationPatterns(segmentData);

    // 返却された結果が正しい形式であることを確認
    expect(analysisResult).toBeDefined();
    expect(Array.isArray(analysisResult.segmentPatterns)).toBe(true);
    expect(analysisResult.segmentPatterns.length).toBe(3);

    // フリーユーザーセグメントの分析結果を検証
    const freeUserPattern = analysisResult.segmentPatterns.find(
      (p: any) => p.segmentId === 'free_users_001'
    );
    expect(freeUserPattern).toBeDefined();
    expect(freeUserPattern.segmentName).toBe('フリーユーザー');
    expect(freeUserPattern.userCount).toBe(150);

    // フリーユーザーの機能別使用頻度ランキング: 食費管理が1位（60%）、献立生成が2位（28%）、栄養管理が3位（12%）
    expect(freeUserPattern.topFeature.featureId).toBe('feature_C');
    expect(freeUserPattern.topFeature.featureName).toBe('食費管理');
    expect(freeUserPattern.topFeature.usageRate).toBe(0.60);
    expect(freeUserPattern.featureRanking[0].featureId).toBe('feature_C');
    expect(freeUserPattern.featureRanking[1].featureId).toBe('feature_A');
    expect(freeUserPattern.featureRanking[2].featureId).toBe('feature_B');

    // 有料ユーザーセグメントの分析結果を検証
    const paidUserPattern = analysisResult.segmentPatterns.find(
      (p: any) => p.segmentId === 'paid_users_001'
    );
    expect(paidUserPattern).toBeDefined();
    expect(paidUserPattern.segmentName).toBe('有料ユーザー');
    expect(paidUserPattern.userCount).toBe(320);

    // 有料ユーザーの機能別使用頻度ランキング: 献立生成が1位（64%）、栄養管理が2位（32%）、食費管理が3位（4%）
    expect(paidUserPattern.topFeature.featureId).toBe('feature_A');
    expect(paidUserPattern.topFeature.featureName).toBe('献立生成');
    expect(paidUserPattern.topFeature.usageRate).toBe(0.64);
    expect(paidUserPattern.featureRanking[0].featureId).toBe('feature_A');
    expect(paidUserPattern.featureRanking[1].featureId).toBe('feature_B');
    expect(paidUserPattern.featureRanking[2].featureId).toBe('feature_C');

    // エンタープライズユーザーセグメントの分析結果を検証
    const enterpriseUserPattern = analysisResult.segmentPatterns.find(
      (p: any) => p.segmentId === 'enterprise_users_001'
    );
    expect(enterpriseUserPattern).toBeDefined();
    expect(enterpriseUserPattern.segmentName).toBe('エンタープライズユーザー');
    expect(enterpriseUserPattern.userCount).toBe(85);

    // エンタープライズユーザーの機能別使用頻度ランキング: 栄養管理が1位（50%）、献立生成が2位（35%）、食費管理が3位（15%）
    expect(enterpriseUserPattern.topFeature.featureId).toBe('feature_B');
    expect(enterpriseUserPattern.topFeature.featureName).toBe('栄養管理');
    expect(enterpriseUserPattern.topFeature.usageRate).toBe(0.50);
    expect(enterpriseUserPattern.featureRanking[0].featureId).toBe('feature_B');
    expect(enterpriseUserPattern.featureRanking[1].featureId).toBe('feature_A');
    expect(enterpriseUserPattern.featureRanking[2].featureId).toBe('feature_C');

    // セグメント間の利用パターン差異を検証
    expect(analysisResult.segmentComparison).toBeDefined();
    expect(analysisResult.segmentComparison.mostDifferentiatedFeature).toBeDefined();

    // 各セグメント間で最も使用率の差が大きい機能を検証
    // feature_A: フリーユーザー(28%) vs 有料ユーザー(64%) = 36%差
    // feature_B: フリーユーザー(12%) vs エンタープライズ(50%) = 38%差
    // feature_C: フリーユーザー(60%) vs 有料ユーザー(4%) = 56%差（最大差）
    expect(analysisResult.segmentComparison.mostDifferentiatedFeature.featureId).toBe('feature_C');
    expect(analysisResult.segmentComparison.maxUsageRateDifference).toBe(0.56);

    // 分析結果の形式と内容の整合性を検証
    expect(analysisResult.analysisTimestamp).toBeDefined();
    expect(typeof analysisResult.analysisTimestamp).toBe('string');

    // 各セグメントの分析品質指標を検証
    analysisResult.segmentPatterns.forEach((pattern: any) => {
      expect(pattern.segmentId).toBeDefined();
      expect(pattern.segmentName).toBeDefined();
      expect(pattern.userCount).toBeGreaterThan(0);
      expect(pattern.topFeature).toBeDefined();
      expect(pattern.topFeature.usageRate).toBeGreaterThan(0);
      expect(pattern.topFeature.usageRate).toBeLessThanOrEqual(1);
      expect(Array.isArray(pattern.featureRanking)).toBe(true);
      expect(pattern.featureRanking.length).toBe(3);

      // ランキングが使用率の降順であることを確認
      for (let i = 0; i < pattern.featureRanking.length - 1; i++) {
        expect(pattern.featureRanking[i].usageRate).toBeGreaterThanOrEqual(
          pattern.featureRanking[i + 1].usageRate
        );
      }
    });

    // セグメント間の利用パターン特性差異が明確に区別されていることを確認
    expect(freeUserPattern.topFeature.featureId).not.toBe(paidUserPattern.topFeature.featureId);
    expect(paidUserPattern.topFeature.featureId).not.toBe(enterpriseUserPattern.topFeature.featureId);
    expect(freeUserPattern.topFeature.featureId).not.toBe(enterpriseUserPattern.topFeature.featureId);

    // 分析結果が期待される構造で出力されていることを確認
    expect(analysisResult).toHaveProperty('segmentPatterns');
    expect(analysisResult).toHaveProperty('segmentComparison');
    expect(analysisResult).toHaveProperty('analysisTimestamp');
    expect(analysisResult.segmentComparison).toHaveProperty('mostDifferentiatedFeature');
    expect(analysisResult.segmentComparison).toHaveProperty('maxUsageRateDifference');
  });
});