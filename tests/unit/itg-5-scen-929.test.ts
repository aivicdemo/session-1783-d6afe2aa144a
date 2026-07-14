import { calculateSegmentSuccessRates } from '../../src/logic/it-7-2-1';

describe('献立生成アルゴリズムの成功・失敗パターン分析と改善提案 - セグメント別成功率集計', () => {
  // SCEN-929
  test('セグメント別献立生成成功率集計機能 - 複数セグメント間の成功率差が正確に計算され差別化ポイント特定の根拠データとして提供される', () => {
    // 前提: 複数セグメント（年代別3パターン）の献立生成試行ログが蓄積されている状態
    // 発生条件: ダッシュボードでセグメント別成功率集計機能を実行
    // 期待結果: 各セグメントの成功率が自動計算され、セグメント間の成功率差が明確に算出される

    const segmentData = [
      {
        segmentId: 'age-20s',
        segmentName: '20代',
        successCount: 45,
        totalAttempts: 50
      },
      {
        segmentId: 'age-30s',
        segmentName: '30代',
        successCount: 78,
        totalAttempts: 100
      },
      {
        segmentId: 'age-40s',
        segmentName: '40代',
        successCount: 82,
        totalAttempts: 100
      }
    ];

    const result = calculateSegmentSuccessRates(segmentData);

    // 各セグメントの成功率が正確に計算されることを検証
    // 20代: 45/50 = 0.9 = 90%
    // 30代: 78/100 = 0.78 = 78%
    // 40代: 82/100 = 0.82 = 82%
    expect(result.segmentMetrics).toEqual([
      {
        segmentId: 'age-20s',
        segmentName: '20代',
        successCount: 45,
        totalAttempts: 50,
        successRate: 90,
        rank: 1
      },
      {
        segmentId: 'age-30s',
        segmentName: '30代',
        successCount: 78,
        totalAttempts: 100,
        successRate: 78,
        rank: 3
      },
      {
        segmentId: 'age-40s',
        segmentName: '40代',
        successCount: 82,
        totalAttempts: 100,
        successRate: 82,
        rank: 2
      }
    ]);

    // セグメント間の成功率差を検証
    // 最大差: 90 - 78 = 12
    // 最小差: 82 - 78 = 4
    // 平均差: (12 + 10 + 4) / 3 = 8.67
    expect(result.successRateDifferences).toEqual({
      maxDifference: 12,
      minDifference: 4,
      averageDifference: 8.67,
      highestSegment: {
        segmentId: 'age-20s',
        segmentName: '20代',
        successRate: 90
      },
      lowestSegment: {
        segmentId: 'age-30s',
        segmentName: '30代',
        successRate: 78
      }
    });

    // 差別化ポイント特定の根拠データが提供されることを検証
    expect(result.differentiationInsights).toEqual({
      topPerformer: {
        segmentId: 'age-20s',
        segmentName: '20代',
        successRate: 90,
        advantage: 12
      },
      performanceGap: 12,
      recommendation: '20代セグメントの献立生成ロジックを分析し、成功要因を他セグメントに適用'
    });

    // エクスポート可能なデータフォーマットが提供されることを検証
    expect(result.exportData).toBeDefined();
    expect(result.exportData.format).toBe('csv');
    expect(result.exportData.columns).toEqual([
      'segmentId',
      'segmentName',
      'successCount',
      'totalAttempts',
      'successRate',
      'rank'
    ]);
    expect(result.exportData.rows.length).toBe(3);

    // 成功率が接近している場合のテスト: 複数セグメント（食事制限別）
    const closeSuccessRateData = [
      {
        segmentId: 'restrict-none',
        segmentName: '制限なし',
        successCount: 95,
        totalAttempts: 100
      },
      {
        segmentId: 'restrict-allergy',
        segmentName: 'アレルギー制限あり',
        successCount: 93,
        totalAttempts: 100
      },
      {
        segmentId: 'restrict-nutrition',
        segmentName: '栄養制限あり',
        successCount: 91,
        totalAttempts: 100
      }
    ];

    const closeResult = calculateSegmentSuccessRates(closeSuccessRateData);

    // 成功率が接近している場合でも正確に計算される
    // 制限なし: 95/100 = 95%
    // アレルギー制限: 93/100 = 93%
    // 栄養制限: 91/100 = 91%
    expect(closeResult.segmentMetrics).toEqual([
      {
        segmentId: 'restrict-none',
        segmentName: '制限なし',
        successCount: 95,
        totalAttempts: 100,
        successRate: 95,
        rank: 1
      },
      {
        segmentId: 'restrict-allergy',
        segmentName: 'アレルギー制限あり',
        successCount: 93,
        totalAttempts: 100,
        successRate: 93,
        rank: 2
      },
      {
        segmentId: 'restrict-nutrition',
        segmentName: '栄養制限あり',
        successCount: 91,
        totalAttempts: 100,
        successRate: 91,
        rank: 3
      }
    ]);

    // 接近した場合の差分計算
    // 最大差: 95 - 91 = 4
    // 最小差: 93 - 91 = 2
    // 平均差: (4 + 2 + 2) / 3 = 2.67
    expect(closeResult.successRateDifferences).toEqual({
      maxDifference: 4,
      minDifference: 2,
      averageDifference: 2.67,
      highestSegment: {
        segmentId: 'restrict-none',
        segmentName: '制限なし',
        successRate: 95
      },
      lowestSegment: {
        segmentId: 'restrict-nutrition',
        segmentName: '栄養制限あり',
        successRate: 91
      }
    });

    // 成功率が大きく異なる場合のテスト
    const largeGapData = [
      {
        segmentId: 'family-small',
        segmentName: '小規模家族',
        successCount: 95,
        totalAttempts: 100
      },
      {
        segmentId: 'family-large',
        segmentName: '大規模家族',
        successCount: 35,
        totalAttempts: 100
      },
      {
        segmentId: 'family-medium',
        segmentName: '中規模家族',
        successCount: 65,
        totalAttempts: 100
      }
    ];

    const largeGapResult = calculateSegmentSuccessRates(largeGapData);

    // 成功率が大きく異なる場合の計算
    // 小規模家族: 95/100 = 95%
    // 大規模家族: 35/100 = 35%
    // 中規模家族: 65/100 = 65%
    expect(largeGapResult.segmentMetrics).toEqual([
      {
        segmentId: 'family-small',
        segmentName: '小規模家族',
        successCount: 95,
        totalAttempts: 100,
        successRate: 95,
        rank: 1
      },
      {
        segmentId: 'family-large',
        segmentName: '大規模家族',
        successCount: 35,
        totalAttempts: 100,
        successRate: 35,
        rank: 3
      },
      {
        segmentId: 'family-medium',
        segmentName: '中規模家族',
        successCount: 65,
        totalAttempts: 100,
        successRate: 65,
        rank: 2
      }
    ]);

    // 大きく異なる場合の差分計算
    // 最大差: 95 - 35 = 60
    // 最小差: 65 - 35 = 30
    // 平均差: (60 + 30 + 30) / 3 = 40
    expect(largeGapResult.successRateDifferences).toEqual({
      maxDifference: 60,
      minDifference: 30,
      averageDifference: 40,
      highestSegment: {
        segmentId: 'family-small',
        segmentName: '小規模家族',
        successRate: 95
      },
      lowestSegment: {
        segmentId: 'family-large',
        segmentName: '大規模家族',
        successRate: 35
      }
    });

    // ランキング順序が正確に計算されていることを検証
    expect(largeGapResult.segmentMetrics[0].rank).toBe(1);
    expect(largeGapResult.segmentMetrics[1].rank).toBe(3);
    expect(largeGapResult.segmentMetrics[2].rank).toBe(2);

    // エクスポートデータの行数が正確であることを検証
    expect(largeGapResult.exportData.rows.length).toBe(3);
  });
});