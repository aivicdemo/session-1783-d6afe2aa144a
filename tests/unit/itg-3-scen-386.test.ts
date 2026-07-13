import { analyzeFeatureUsagePatterns } from '../../src/logic/it-1';

describe('月次食費実績の超過要因分析機能', () => {
  // SCEN-386: [edge] 機能別使用パターン分析機能 - 離脱率が 100%（全ユーザーが離脱）の場合に警告レベルが正しく判定される
  test('SCEN-386: 離脱率が100%のエッジケースで警告レベルが最高レベルで判定される', () => {
    const analysisDataset = {
      analysisId: 'analysis-20240115-001',
      analysisPeriod: {
        startDate: new Date('2024-01-01T00:00:00Z'),
        endDate: new Date('2024-01-31T23:59:59Z'),
      },
      featureUsageRecords: [
        {
          userId: 'user-001',
          featureName: 'menu_generation',
          accessCount: 0,
          abandonmentPoint: 'step_01_constraint_input',
          abandonmentTimestamp: new Date('2024-01-15T10:30:00Z'),
        },
        {
          userId: 'user-002',
          featureName: 'menu_generation',
          accessCount: 0,
          abandonmentPoint: 'step_02_candidate_display',
          abandonmentTimestamp: new Date('2024-01-15T11:15:00Z'),
        },
        {
          userId: 'user-003',
          featureName: 'menu_generation',
          accessCount: 0,
          abandonmentPoint: 'step_03_evaluation',
          abandonmentTimestamp: new Date('2024-01-15T12:00:00Z'),
        },
      ],
      totalUsersAnalyzed: 3,
      completionCount: 0,
      abandonmentCount: 3,
    };

    const result = analyzeFeatureUsagePatterns(analysisDataset);

    // 離脱率が100%のエッジケースで警告レベルが最高レベルとして判定される
    expect(result.alertLevel).toBe('critical');

    // 警告レベルが最高レベルの場合、対応する警告メッセージが表示される
    expect(result.alertMessage).toMatch(/ユーザー離脱/);
    expect(result.alertMessage).toMatch(/100%/);
    expect(result.alertMessage.length).toBeGreaterThan(0);

    // 離脱率が正確に計算される（100%）
    expect(result.abandonmentRate).toBe(100);

    // ログ出力に警告判定の詳細情報が正しく記録されている
    expect(result.detailedLog).toBeDefined();
    expect(result.detailedLog).toMatch(/critical/);
    expect(result.detailedLog).toMatch(/離脱率/);

    // 各離脱ポイントの分布が記録される
    expect(result.abandonmentPointDistribution).toBeDefined();
    expect(result.abandonmentPointDistribution['step_01_constraint_input']).toBe(1);
    expect(result.abandonmentPointDistribution['step_02_candidate_display']).toBe(1);
    expect(result.abandonmentPointDistribution['step_03_evaluation']).toBe(1);

    // 分析結果の基本情報
    expect(result.analysisId).toBe('analysis-20240115-001');
    expect(result.totalUsersAnalyzed).toBe(3);
    expect(result.completionCount).toBe(0);
    expect(result.abandonmentCount).toBe(3);

    // 予期しないエラーが発生していないことを確認
    expect(result.hasError).toBe(false);
    expect(result.errorDetails).toBeUndefined();
  });
});