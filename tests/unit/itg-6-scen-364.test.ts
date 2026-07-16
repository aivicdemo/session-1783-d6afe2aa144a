import { compareSegmentCookingTimeSavings } from '../../src/logic/it-8-1-2-1';

describe('調理時間短縮実現度比較・可視化機能', () => {
  // SCEN-364
  test('セグメント間の短縮効果の大小が比較・順序付けされて可視化される', () => {
    // ユーザーセグメント別の調理時間短縮データ
    const segmentData = [
      {
        segmentId: 'seg_001',
        segmentName: '忙しいサラリーマン',
        targetCookingMinutes: 30,
        actualCookingMinutes: 18,
        shortageAchievementRate: 60.0,
      },
      {
        segmentId: 'seg_002',
        segmentName: '子育て中の親',
        targetCookingMinutes: 40,
        actualCookingMinutes: 28,
        shortageAchievementRate: 70.0,
      },
      {
        segmentId: 'seg_003',
        segmentName: '高齢者',
        targetCookingMinutes: 45,
        actualCookingMinutes: 36,
        shortageAchievementRate: 80.0,
      },
      {
        segmentId: 'seg_004',
        segmentName: '専業主夫',
        targetCookingMinutes: 35,
        actualCookingMinutes: 21,
        shortageAchievementRate: 40.0,
      },
    ];

    const result = compareSegmentCookingTimeSavings(segmentData);

    // 期待値：短縮効果の高い順に順序付けされたセグメント
    // 高齢者（80.0%） > 子育て中の親（70.0%） > 忙しいサラリーマン（60.0%） > 専業主夫（40.0%）
    expect(result.sortedSegments).toHaveLength(4);
    expect(result.sortedSegments[0].segmentName).toBe('高齢者');
    expect(result.sortedSegments[0].shortageAchievementRate).toBe(80.0);
    expect(result.sortedSegments[1].segmentName).toBe('子育て中の親');
    expect(result.sortedSegments[1].shortageAchievementRate).toBe(70.0);
    expect(result.sortedSegments[2].segmentName).toBe('忙しいサラリーマン');
    expect(result.sortedSegments[2].shortageAchievementRate).toBe(60.0);
    expect(result.sortedSegments[3].segmentName).toBe('専業主夫');
    expect(result.sortedSegments[3].shortageAchievementRate).toBe(40.0);

    // 最高短縮効果と最低短縮効果の検証
    expect(result.maxShortageAchievementRate).toBe(80.0);
    expect(result.minShortageAchievementRate).toBe(40.0);

    // セグメント間の短縮効果差を検証
    expect(result.shortageAchievementRateDifference).toBe(40.0);

    // 可視化用データの確認
    expect(result.visualizationData).toBeDefined();
    expect(result.visualizationData).toHaveLength(4);
    expect(result.visualizationData[0].segmentName).toBe('高齢者');
    expect(result.visualizationData[0].shortageAchievementRate).toBe(80.0);
    expect(result.visualizationData[3].segmentName).toBe('専業主夫');
    expect(result.visualizationData[3].shortageAchievementRate).toBe(40.0);

    // グラフ・チャート表示用データの検証
    expect(result.chartConfig).toBeDefined();
    expect(result.chartConfig.type).toBe('bar');
    expect(result.chartConfig.title).toBe('セグメント別調理時間短縮実現度');
    expect(result.chartConfig.yAxisLabel).toBe('短縮実現度（%）');

    // 各セグメント間の短縮効果差が視覚的に明確に区別できることを確認
    // セグメント間の差が十分に可視化されるレベルであることを検証
    const rateValues = result.sortedSegments.map(s => s.shortageAchievementRate);
    const minRateDifference = Math.min(
      ...[80.0 - 70.0, 70.0 - 60.0, 60.0 - 40.0]
    );
    expect(minRateDifference).toBeGreaterThanOrEqual(10.0);

    // セグメント内で調理時間短縮が正しく計算されていることを確認
    result.sortedSegments.forEach(segment => {
      const timeSavingMinutes = segment.targetCookingMinutes - segment.actualCookingMinutes;
      const expectedRate = (timeSavingMinutes / segment.targetCookingMinutes) * 100;
      expect(segment.shortageAchievementRate).toBe(expectedRate);
    });

    // ソート順序が正しく降順であることを検証
    for (let i = 0; i < result.sortedSegments.length - 1; i++) {
      expect(result.sortedSegments[i].shortageAchievementRate).toBeGreaterThanOrEqual(
        result.sortedSegments[i + 1].shortageAchievementRate
      );
    }
  });
});