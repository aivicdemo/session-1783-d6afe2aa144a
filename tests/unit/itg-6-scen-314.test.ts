import { generatePainPointMatrix } from '../../src/logic/it-1-br-8-2-1-1';

describe('ユーザーセグメント別の利用パターン分析ダッシュボード', () => {
  // SCEN-314: [edge] ペイン要因定量化・優先度マトリクス生成機能 - 発生頻度と影響度が同等の境界値を示すペイン要因について、マトリクス上で正確に配置される
  test('should generate pain point matrix with accurate boundary value placement for identical frequency and impact scores', () => {
    const painPoints = [
      {
        id: 'pain_001',
        name: 'ペイン要因A',
        frequencyScore: 5,
        impactScore: 5,
        category: 'food_restriction',
      },
      {
        id: 'pain_002',
        name: 'ペイン要因B',
        frequencyScore: 5,
        impactScore: 5,
        category: 'cooking_time',
      },
      {
        id: 'pain_003',
        name: 'ペイン要因C',
        frequencyScore: 3,
        impactScore: 7,
        category: 'budget_constraint',
      },
      {
        id: 'pain_004',
        name: 'ペイン要因D',
        frequencyScore: 7,
        impactScore: 3,
        category: 'family_preference',
      },
    ];

    const matrix = generatePainPointMatrix(painPoints);

    // マトリクスが正常に生成されたことを検証
    expect(matrix).toBeDefined();
    expect(matrix.painPoints).toEqual(expect.any(Array));
    expect(matrix.painPoints.length).toBe(4);

    // 境界値を持つペイン要因A（freq: 5, impact: 5）の配置を検証
    const painPointA = matrix.painPoints.find((p: any) => p.id === 'pain_001');
    expect(painPointA).toBeDefined();
    expect(painPointA.frequencyScore).toBe(5);
    expect(painPointA.impactScore).toBe(5);
    expect(painPointA.matrixPosition).toEqual({ x: 5, y: 5 });
    expect(painPointA.quadrant).toBe('medium-high');
    expect(painPointA.priorityRank).toBe('medium');

    // 境界値を持つペイン要因B（freq: 5, impact: 5）の配置を検証
    const painPointB = matrix.painPoints.find((p: any) => p.id === 'pain_002');
    expect(painPointB).toBeDefined();
    expect(painPointB.frequencyScore).toBe(5);
    expect(painPointB.impactScore).toBe(5);
    expect(painPointB.matrixPosition).toEqual({ x: 5, y: 5 });
    expect(painPointB.quadrant).toBe('medium-high');
    expect(painPointB.priorityRank).toBe('medium');

    // 同一座標に複数のペイン要因がある場合、オフセット配置で識別可能であることを検証
    expect(painPointA.offsetX).toBe(0);
    expect(painPointB.offsetX).toBe(1);
    expect(painPointA.displayIndex).toBe(1);
    expect(painPointB.displayIndex).toBe(2);

    // ペイン要因C（freq: 3, impact: 7）の配置を検証
    const painPointC = matrix.painPoints.find((p: any) => p.id === 'pain_003');
    expect(painPointC).toBeDefined();
    expect(painPointC.matrixPosition).toEqual({ x: 3, y: 7 });
    expect(painPointC.quadrant).toBe('high-impact');
    expect(painPointC.priorityRank).toBe('high');

    // ペイン要因D（freq: 7, impact: 3）の配置を検証
    const painPointD = matrix.painPoints.find((p: any) => p.id === 'pain_004');
    expect(painPointD).toBeDefined();
    expect(painPointD.matrixPosition).toEqual({ x: 7, y: 3 });
    expect(painPointD.quadrant).toBe('frequent-low-impact');
    expect(painPointD.priorityRank).toBe('low');

    // マトリクスの軸スケールが正確に反映されていることを検証
    expect(matrix.xAxis.min).toBe(0);
    expect(matrix.xAxis.max).toBe(10);
    expect(matrix.yAxis.min).toBe(0);
    expect(matrix.yAxis.max).toBe(10);
    expect(matrix.xAxis.label).toBe('発生頻度');
    expect(matrix.yAxis.label).toBe('影響度');

    // 相対位置関係が数値に一致していることを検証
    expect(painPointA.matrixPosition.x).toBeLessThan(painPointD.matrixPosition.x);
    expect(painPointA.matrixPosition.y).toBeLessThan(painPointC.matrixPosition.y);
    expect(painPointC.matrixPosition.y).toBeGreaterThan(painPointD.matrixPosition.y);

    // 表示形式が設計通りであることを検証
    expect(painPointA.displayFormat).toEqual(
      expect.objectContaining({
        color: expect.any(String),
        icon: expect.any(String),
        label: expect.any(String),
      })
    );
    expect(painPointB.displayFormat.color).toBe(painPointA.displayFormat.color);

    // 境界値マーク処理が適用されていることを検証
    expect(painPointA.isBoundaryValue).toBe(true);
    expect(painPointB.isBoundaryValue).toBe(true);
    expect(painPointC.isBoundaryValue).toBe(false);
    expect(painPointD.isBoundaryValue).toBe(false);

    // マトリクスの統計情報が正確であることを検証
    expect(matrix.statistics).toEqual(
      expect.objectContaining({
        totalPainPoints: 4,
        boundaryValueCount: 2,
        highPriorityCount: 1,
        mediumPriorityCount: 2,
        lowPriorityCount: 1,
      })
    );

    // 同一座標ペイン要因の重複排除が正確に実施されたことを検証
    const boundaryPositions = matrix.painPoints
      .filter((p: any) => p.isBoundaryValue)
      .map((p: any) => `${p.matrixPosition.x},${p.matrixPosition.y}`);
    expect(boundaryPositions).toEqual(['5,5', '5,5']);
    expect(new Set(boundaryPositions).size).toBe(1);
  });
});