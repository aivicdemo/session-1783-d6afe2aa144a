import { identifyMaxDifferentiationSegment } from '../../src/logic/it-1-br-4-2-1';

describe('食事制限条件変更時の過去献立抵触検出 - 最大差別化効果セグメント優先度付け機能', () => {
  // SCEN-689
  test('2軸マトリクス（発生頻度×改善効果）で最大差別化効果セグメントが正確に特定される', () => {
    // Arrange: セグメントデータセット（発生頻度・改善効果の値を設定）
    const segmentDataset = [
      {
        segmentId: 'seg_001',
        segmentName: '30代_4人家族_食材制限あり',
        occurrenceFrequency: 85, // 高頻度（85点）
        improvementEffect: 92,   // 高改善効果（92点）
        differentiationScore: 85 * 92 / 100, // 78.2
      },
      {
        segmentId: 'seg_002',
        segmentName: '40代_3人家族_食材制限なし',
        occurrenceFrequency: 72, // 中頻度（72点）
        improvementEffect: 88,   // 高改善効果（88点）
        differentiationScore: 72 * 88 / 100, // 63.36
      },
      {
        segmentId: 'seg_003',
        segmentName: '25代_2人家族_食材制限あり',
        occurrenceFrequency: 91, // 高頻度（91点）
        improvementEffect: 45,   // 低改善効果（45点）
        differentiationScore: 91 * 45 / 100, // 40.95
      },
      {
        segmentId: 'seg_004',
        segmentName: '35代_5人家族_食材制限なし',
        occurrenceFrequency: 38, // 低頻度（38点）
        improvementEffect: 78,   // 中改善効果（78点）
        differentiationScore: 38 * 78 / 100, // 29.64
      },
      {
        segmentId: 'seg_005',
        segmentName: '50代_2人家族_食材制限あり',
        occurrenceFrequency: 22, // 低頻度（22点）
        improvementEffect: 35,   // 低改善効果（35点）
        differentiationScore: 22 * 35 / 100, // 7.7
      },
      {
        segmentId: 'seg_006',
        segmentName: '28代_3人家族_食材制限あり',
        occurrenceFrequency: 88, // 高頻度（88点）
        improvementEffect: 89,   // 高改善効果（89点）
        differentiationScore: 88 * 89 / 100, // 78.32
      },
      {
        segmentId: 'seg_007',
        segmentName: '45代_4人家族_食材制限なし',
        occurrenceFrequency: 65, // 中頻度（65点）
        improvementEffect: 42,   // 低改善効果（42点）
        differentiationScore: 65 * 42 / 100, // 27.3
      },
      {
        segmentId: 'seg_008',
        segmentName: '32代_6人家族_食材制限あり',
        occurrenceFrequency: 79, // 高頻度（79点）
        improvementEffect: 85,   // 高改善効果（85点）
        differentiationScore: 79 * 85 / 100, // 67.15
      },
      {
        segmentId: 'seg_009',
        segmentName: '55代_2人家族_食材制限なし',
        occurrenceFrequency: 28, // 低頻度（28点）
        improvementEffect: 68,   // 中改善効果（68点）
        differentiationScore: 28 * 68 / 100, // 19.04
      },
      {
        segmentId: 'seg_010',
        segmentName: '30代_2人家族_食材制限あり',
        occurrenceFrequency: 85, // 高頻度（85点）
        improvementEffect: 92,   // 高改善効果（92点）
        differentiationScore: 85 * 92 / 100, // 78.2
      },
    ];

    // Act: 最大差別化効果セグメント優先度付け実行
    const result = identifyMaxDifferentiationSegment({
      segments: segmentDataset,
      frequencyThresholdHigh: 75,
      frequencyThresholdLow: 50,
      effectThresholdHigh: 80,
      effectThresholdLow: 50,
    });

    // Assert: 高頻度×高改善効果象限の検証
    expect(result.maxDifferentiationSegment.segmentId).toBe('seg_001');
    expect(result.maxDifferentiationSegment.segmentName).toBe('30代_4人家族_食材制限あり');
    expect(result.maxDifferentiationSegment.differentiationScore).toBe(78.2);

    // 2軸マトリクス分類の検証：高頻度×高効果象限
    const quadrantHighHigh = result.matrix.quadrants.highFrequency_highEffect;
    expect(quadrantHighHigh.length).toBe(3); // seg_001, seg_006, seg_010
    expect(quadrantHighHigh.map((s: any) => s.segmentId).sort()).toEqual(
      ['seg_001', 'seg_006', 'seg_010'].sort()
    );

    // 2軸マトリクス分類の検証：高頻度×低効果象限
    const quadrantHighLow = result.matrix.quadrants.highFrequency_lowEffect;
    expect(quadrantHighLow.length).toBe(1); // seg_003
    expect(quadrantHighLow[0].segmentId).toBe('seg_003');

    // 2軸マトリクス分類の検証：低頻度×高効果象限
    const quadrantLowHigh = result.matrix.quadrants.lowFrequency_highEffect;
    expect(quadrantLowHigh.length).toBe(2); // seg_004, seg_009
    expect(quadrantLowHigh.map((s: any) => s.segmentId).sort()).toEqual(
      ['seg_004', 'seg_009'].sort()
    );

    // 2軸マトリクス分類の検証：低頻度×低効果象限
    const quadrantLowLow = result.matrix.quadrants.lowFrequency_lowEffect;
    expect(quadrantLowLow.length).toBe(1); // seg_005
    expect(quadrantLowLow[0].segmentId).toBe('seg_005');

    // 優先度ランキングの検証：発生頻度×改善効果の組み合わせに基づく順序
    const priorityRanking = result.priorityRanking;
    expect(priorityRanking.length).toBe(10);
    expect(priorityRanking[0].segmentId).toBe('seg_001'); // 最高優先度
    expect(priorityRanking[0].priorityScore).toBe(78.2);
    expect(priorityRanking[1].segmentId).toBe('seg_006'); // 2番目
    expect(priorityRanking[1].priorityScore).toBe(78.32);
    expect(priorityRanking[2].segmentId).toBe('seg_010'); // 3番目（seg_001と同スコアだが、時間順で後）
    expect(priorityRanking[2].priorityScore).toBe(78.2);
    expect(priorityRanking[9].segmentId).toBe('seg_005'); // 最低優先度
    expect(priorityRanking[9].priorityScore).toBe(7.7);

    // 同一スコアセグメント（seg_001とseg_010は両方78.2）の処理確認
    const sameScoreSegments = priorityRanking.filter(
      (s: any) => s.differentiationScore === 78.2
    );
    expect(sameScoreSegments.length).toBe(2);

    // 外れ値データ処理の確認：スコアが正しく計算されていることを確認
    const lowestScoreSegment = priorityRanking[priorityRanking.length - 1];
    expect(lowestScoreSegment.occurrenceFrequency).toBe(22);
    expect(lowestScoreSegment.improvementEffect).toBe(35);
    expect(lowestScoreSegment.differentiationScore).toBe(7.7);

    // 結果全体の構造検証
    expect(result).toHaveProperty('maxDifferentiationSegment');
    expect(result).toHaveProperty('matrix');
    expect(result).toHaveProperty('priorityRanking');
    expect(result.matrix).toHaveProperty('quadrants');
    expect(result.matrix.quadrants).toHaveProperty('highFrequency_highEffect');
    expect(result.matrix.quadrants).toHaveProperty('highFrequency_lowEffect');
    expect(result.matrix.quadrants).toHaveProperty('lowFrequency_highEffect');
    expect(result.matrix.quadrants).toHaveProperty('lowFrequency_lowEffect');
  });
});