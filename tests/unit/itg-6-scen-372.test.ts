import { prioritizeSegmentsByMaxDifferentiationEffect } from '../../src/logic/it-1-br-8-2-1-1';

describe('ユーザーセグメント別の利用パターン分析ダッシュボード', () => {
  // SCEN-372
  test('[edge] セグメント別最大差別化効果優先度付け - 成功率と満足度スコアが同一のセグメントが複数ある場合、発生頻度で順序付けされる', () => {
    const segmentA = {
      segmentId: 'seg-001',
      segmentName: 'Segment A',
      successRate: 80,
      satisfactionScore: 85,
      occurrenceFrequency: 150,
    };

    const segmentB = {
      segmentId: 'seg-002',
      segmentName: 'Segment B',
      successRate: 80,
      satisfactionScore: 85,
      occurrenceFrequency: 200,
    };

    const segmentC = {
      segmentId: 'seg-003',
      segmentName: 'Segment C',
      successRate: 80,
      satisfactionScore: 85,
      occurrenceFrequency: 100,
    };

    const segments = [segmentA, segmentB, segmentC];

    const result = prioritizeSegmentsByMaxDifferentiationEffect(segments);

    expect(result).toHaveLength(3);

    expect(result[0].segmentId).toBe('seg-002');
    expect(result[0].segmentName).toBe('Segment B');
    expect(result[0].occurrenceFrequency).toBe(200);
    expect(result[0].priorityScore).toBe(88);

    expect(result[1].segmentId).toBe('seg-001');
    expect(result[1].segmentName).toBe('Segment A');
    expect(result[1].occurrenceFrequency).toBe(150);
    expect(result[1].priorityScore).toBe(87);

    expect(result[2].segmentId).toBe('seg-003');
    expect(result[2].segmentName).toBe('Segment C');
    expect(result[2].occurrenceFrequency).toBe(100);
    expect(result[2].priorityScore).toBe(86);
  });
});