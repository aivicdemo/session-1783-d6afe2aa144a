import { prioritizeSegmentsByDifferentiationEffect } from '../../src/logic/it-7-2-1';

describe('差別化効果最大セグメント優先度付け', () => {
  // SCEN-935
  test('発生頻度と改善効果が同等の複数セグメントが存在する場合、全セグメントが同一優先度で返される', () => {
    const segments = [
      {
        segmentId: 'seg_A',
        segmentName: 'セグメントA',
        occurrenceFrequency: 100,
        improvementEffectRate: 25,
      },
      {
        segmentId: 'seg_B',
        segmentName: 'セグメントB',
        occurrenceFrequency: 100,
        improvementEffectRate: 25,
      },
      {
        segmentId: 'seg_C',
        segmentName: 'セグメントC',
        occurrenceFrequency: 100,
        improvementEffectRate: 25,
      },
    ];

    const result = prioritizeSegmentsByDifferentiationEffect(segments);

    expect(result).toHaveLength(3);
    expect(result[0].priority).toBe(result[1].priority);
    expect(result[1].priority).toBe(result[2].priority);
    expect(result[0].priority).toEqual(1);
    expect(result[0].segmentId).toBe('seg_A');
    expect(result[1].segmentId).toBe('seg_B');
    expect(result[2].segmentId).toBe('seg_C');
  });
});