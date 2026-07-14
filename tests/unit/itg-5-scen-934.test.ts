import { identifyMaxDifferentiationSegment } from '../../src/logic/it-7-2-1';

describe('差別化効果最大セグメント優先度付け', () => {
  // SCEN-934
  test('発生頻度と改善効果の2軸で優先度スコアが正しく計算され、最高スコアのセグメントが特定される', () => {
    // テストデータ準備：複数セグメント（発生頻度と改善効果が異なる）
    const segments = [
      {
        segmentId: 'seg_001',
        segmentName: '30代専業主夫_4人家族',
        occurrenceFrequency: 45,
        improvementEffect: 8.5,
      },
      {
        segmentId: 'seg_002',
        segmentName: '40代専業主夫_3人家族',
        occurrenceFrequency: 30,
        improvementEffect: 12.0,
      },
      {
        segmentId: 'seg_003',
        segmentName: '35代専業主夫_5人家族',
        occurrenceFrequency: 55,
        improvementEffect: 6.5,
      },
      {
        segmentId: 'seg_004',
        segmentName: '50代専業主夫_2人家族',
        occurrenceFrequency: 20,
        improvementEffect: 15.0,
      },
    ];

    // 差別化効果最大セグメント優先度付けロジックを実行
    const result = identifyMaxDifferentiationSegment(segments);

    // 優先度スコアが各セグメントについて計算されたことを確認
    expect(result).toBeDefined();
    expect(result.scores).toBeDefined();
    expect(Array.isArray(result.scores)).toBe(true);
    expect(result.scores.length).toBe(4);

    // 優先度スコアの計算結果を検証
    // 計算式: priority_score = (occurrenceFrequency / 100) * 50 + (improvementEffect / 20) * 50
    // seg_001: (45/100)*50 + (8.5/20)*50 = 22.5 + 21.25 = 43.75
    // seg_002: (30/100)*50 + (12.0/20)*50 = 15 + 30 = 45
    // seg_003: (55/100)*50 + (6.5/20)*50 = 27.5 + 16.25 = 43.75
    // seg_004: (20/100)*50 + (15.0/20)*50 = 10 + 37.5 = 47.5

    const scoresMap = new Map(
      result.scores.map((score) => [score.segmentId, score.priorityScore])
    );

    expect(scoresMap.get('seg_001')).toBe(43.75);
    expect(scoresMap.get('seg_002')).toBe(45);
    expect(scoresMap.get('seg_003')).toBe(43.75);
    expect(scoresMap.get('seg_004')).toBe(47.5);

    // 最高スコアのセグメントが正しく特定されたことを確認
    expect(result.maxSegment).toBeDefined();
    expect(result.maxSegment.segmentId).toBe('seg_004');
    expect(result.maxSegment.segmentName).toBe('50代専業主夫_2人家族');
    expect(result.maxSegment.priorityScore).toBe(47.5);

    // 優先度スコアが降順でソートされていることを確認
    for (let i = 0; i < result.scores.length - 1; i++) {
      expect(result.scores[i].priorityScore).toBeGreaterThanOrEqual(
        result.scores[i + 1].priorityScore
      );
    }
  });

  test('複数セグメントが同一最高スコアの場合、最初のセグメントが特定される', () => {
    // 同一スコアを持つセグメントを準備
    const segments = [
      {
        segmentId: 'seg_a',
        segmentName: 'セグメントA',
        occurrenceFrequency: 40,
        improvementEffect: 10.0,
      },
      {
        segmentId: 'seg_b',
        segmentName: 'セグメントB',
        occurrenceFrequency: 40,
        improvementEffect: 10.0,
      },
      {
        segmentId: 'seg_c',
        segmentName: 'セグメントC',
        occurrenceFrequency: 30,
        improvementEffect: 8.0,
      },
    ];

    const result = identifyMaxDifferentiationSegment(segments);

    // 同一最高スコアの場合の処理
    // seg_a: (40/100)*50 + (10.0/20)*50 = 20 + 25 = 45
    // seg_b: (40/100)*50 + (10.0/20)*50 = 20 + 25 = 45
    // seg_c: (30/100)*50 + (8.0/20)*50 = 15 + 20 = 35

    expect(result.maxSegment).toBeDefined();
    expect(result.maxSegment.priorityScore).toBe(45);
    // 最初に出現したセグメントが選択されることを確認
    expect(result.maxSegment.segmentId).toBe('seg_a');
  });

  test('セグメントが1つのみの場合、そのセグメントが最高優先度で特定される', () => {
    const segments = [
      {
        segmentId: 'seg_single',
        segmentName: 'シングルセグメント',
        occurrenceFrequency: 50,
        improvementEffect: 7.5,
      },
    ];

    const result = identifyMaxDifferentiationSegment(segments);

    expect(result.scores.length).toBe(1);
    expect(result.maxSegment.segmentId).toBe('seg_single');
    // 計算式: (50/100)*50 + (7.5/20)*50 = 25 + 18.75 = 43.75
    expect(result.maxSegment.priorityScore).toBe(43.75);
  });

  test('発生頻度が高く改善効果が低いセグメントと、発生頻度が低く改善効果が高いセグメントの優先度スコア比較', () => {
    const segments = [
      {
        segmentId: 'seg_high_freq',
        segmentName: '高発生頻度セグメント',
        occurrenceFrequency: 80,
        improvementEffect: 3.0,
      },
      {
        segmentId: 'seg_high_effect',
        segmentName: '高改善効果セグメント',
        occurrenceFrequency: 20,
        improvementEffect: 18.0,
      },
    ];

    const result = identifyMaxDifferentiationSegment(segments);

    // high_freq: (80/100)*50 + (3.0/20)*50 = 40 + 7.5 = 47.5
    // high_effect: (20/100)*50 + (18.0/20)*50 = 10 + 45 = 55

    const scoresMap = new Map(
      result.scores.map((score) => [score.segmentId, score.priorityScore])
    );

    expect(scoresMap.get('seg_high_freq')).toBe(47.5);
    expect(scoresMap.get('seg_high_effect')).toBe(55);

    // 改善効果の重みが大きくなるケースを確認
    expect(result.maxSegment.segmentId).toBe('seg_high_effect');
    expect(result.maxSegment.priorityScore).toBe(55);
  });

  test('空のセグメント配列が渡された場合、エラーがスロー される', () => {
    const segments: any[] = [];

    expect(() => {
      identifyMaxDifferentiationSegment(segments);
    }).toThrow(/セグメント/);
  });

  test('発生頻度または改善効果が負の値の場合、エラーがスロー される', () => {
    const invalidSegments = [
      {
        segmentId: 'seg_invalid',
        segmentName: '無効なセグメント',
        occurrenceFrequency: -10,
        improvementEffect: 5.0,
      },
    ];

    expect(() => {
      identifyMaxDifferentiationSegment(invalidSegments);
    }).toThrow(/頻度|効果/);
  });

  test('発生頻度と改善効果の2軸スコア計算結果がセグメント特性を正しく反映', () => {
    const segments = [
      {
        segmentId: 'seg_balanced',
        segmentName: 'バランス型セグメント',
        occurrenceFrequency: 50,
        improvementEffect: 10.0,
      },
      {
        segmentId: 'seg_freq_dominant',
        segmentName: '発生頻度優位型',
        occurrenceFrequency: 90,
        improvementEffect: 2.0,
      },
      {
        segmentId: 'seg_effect_dominant',
        segmentName: '改善効果優位型',
        occurrenceFrequency: 10,
        improvementEffect: 19.0,
      },
    ];

    const result = identifyMaxDifferentiationSegment(segments);

    // balanced: (50/100)*50 + (10.0/20)*50 = 25 + 25 = 50
    // freq_dominant: (90/100)*50 + (2.0/20)*50 = 45 + 5 = 50
    // effect_dominant: (10/100)*50 + (19.0/20)*50 = 5 + 47.5 = 52.5

    const scoresMap = new Map(
      result.scores.map((score) => [score.segmentId, score.priorityScore])
    );

    expect(scoresMap.get('seg_balanced')).toBe(50);
    expect(scoresMap.get('seg_freq_dominant')).toBe(50);
    expect(scoresMap.get('seg_effect_dominant')).toBe(52.5);

    // 異なるセグメント特性が優先度スコアに反映されることを確認
    expect(result.maxSegment.segmentId).toBe('seg_effect_dominant');
    expect(result.maxSegment.priorityScore).toBe(52.5);
  });
});