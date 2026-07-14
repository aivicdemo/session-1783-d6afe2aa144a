import { categorizePainFactorsAndGeneratePriorityMatrix } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-606
  test('優先度マトリクスの重要度スコア境界値（0.0～1.0）で正しくペイン要因を配置できる', () => {
    const testPainFactors = [
      {
        id: 'pain_1',
        category: 'nutrition',
        description: 'Nutritional balance not met',
        importanceScore: 0.0,
        affectedUsers: 12,
        frequency: 5,
      },
      {
        id: 'pain_2',
        category: 'budget',
        description: 'Budget constraint exceeded',
        importanceScore: 0.25,
        affectedUsers: 28,
        frequency: 18,
      },
      {
        id: 'pain_3',
        category: 'preference',
        description: 'Family preference not reflected',
        importanceScore: 0.5,
        affectedUsers: 45,
        frequency: 32,
      },
      {
        id: 'pain_4',
        category: 'cooking_time',
        description: 'Cooking time exceeded',
        importanceScore: 0.75,
        affectedUsers: 67,
        frequency: 51,
      },
      {
        id: 'pain_5',
        category: 'inventory',
        description: 'Ingredient inventory mismatch',
        importanceScore: 1.0,
        affectedUsers: 89,
        frequency: 73,
      },
    ];

    const result = categorizePainFactorsAndGeneratePriorityMatrix(testPainFactors);

    // すべてのペイン要因が結果に含まれることを確認
    expect(result.matrixPositions).toHaveLength(5);

    // 各ペイン要因のY軸座標値が重要度スコアに正比例していることを検証
    const position_0_0 = result.matrixPositions.find((p) => p.painFactorId === 'pain_1');
    expect(position_0_0).toBeDefined();
    expect(position_0_0!.yAxisCoordinate).toBe(0.0);
    expect(position_0_0!.priorityRank).toBe('lowest');

    const position_0_25 = result.matrixPositions.find((p) => p.painFactorId === 'pain_2');
    expect(position_0_25).toBeDefined();
    expect(position_0_25!.yAxisCoordinate).toBe(0.25);
    expect(position_0_25!.priorityRank).toBe('low');

    const position_0_5 = result.matrixPositions.find((p) => p.painFactorId === 'pain_3');
    expect(position_0_5).toBeDefined();
    expect(position_0_5!.yAxisCoordinate).toBe(0.5);
    expect(position_0_5!.priorityRank).toBe('medium');

    const position_0_75 = result.matrixPositions.find((p) => p.painFactorId === 'pain_4');
    expect(position_0_75).toBeDefined();
    expect(position_0_75!.yAxisCoordinate).toBe(0.75);
    expect(position_0_75!.priorityRank).toBe('high');

    const position_1_0 = result.matrixPositions.find((p) => p.painFactorId === 'pain_5');
    expect(position_1_0).toBeDefined();
    expect(position_1_0!.yAxisCoordinate).toBe(1.0);
    expect(position_1_0!.priorityRank).toBe('highest');

    // 境界値間のペイン要因の相対的な配置順序が昇順で正しいことを確認
    const sortedByScore = result.matrixPositions.sort(
      (a, b) => a.yAxisCoordinate - b.yAxisCoordinate,
    );
    expect(sortedByScore[0].painFactorId).toBe('pain_1');
    expect(sortedByScore[1].painFactorId).toBe('pain_2');
    expect(sortedByScore[2].painFactorId).toBe('pain_3');
    expect(sortedByScore[3].painFactorId).toBe('pain_4');
    expect(sortedByScore[4].painFactorId).toBe('pain_5');

    // マトリクス全体の構造検証
    expect(result.matrixDimensions).toEqual({
      xAxisMin: 0,
      xAxisMax: 100,
      yAxisMin: 0.0,
      yAxisMax: 1.0,
    });

    // スコア値が0.0と1.0の極値に対して、システムがエラーを返さないことを確認
    expect(result.status).toBe('success');
    expect(result.errors).toHaveLength(0);

    // 配置順序が昇順で維持されていることを再確認
    for (let i = 0; i < result.matrixPositions.length - 1; i++) {
      expect(result.matrixPositions[i].yAxisCoordinate).toBeLessThanOrEqual(
        result.matrixPositions[i + 1].yAxisCoordinate,
      );
    }
  });
});