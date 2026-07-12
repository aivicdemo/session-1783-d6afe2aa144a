import { generatePainPointMatrix } from '../../src/logic/it-3';

describe('食事評価データを献立生成ロジックに反映させる機能', () => {
  // SCEN-654
  test('ペイン要因優先度マトリクス生成機能 - 発生頻度と影響度がいずれも最小値の場合でもマトリクスに正しく配置される', () => {
    const painPointInput = {
      painPointId: 'pain-001',
      name: '調理時間制限',
      occurrenceFrequency: 1,
      impactDegree: 1,
    };

    const result = generatePainPointMatrix([painPointInput]);

    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);

    const placedPainPoint = result.find((p: any) => p.painPointId === 'pain-001');

    expect(placedPainPoint).toBeDefined();
    expect(placedPainPoint.coordinateX).toBe(1);
    expect(placedPainPoint.coordinateY).toBe(1);
    expect(placedPainPoint.quadrant).toBe('low-priority');

    expect(placedPainPoint.occurrenceFrequency).toBe(1);
    expect(placedPainPoint.impactDegree).toBe(1);
  });
});