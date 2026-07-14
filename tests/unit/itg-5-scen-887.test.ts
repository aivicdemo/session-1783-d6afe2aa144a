import { generateFailurePatternPriorityMatrix } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-887: [normal] 失敗パターン優先度マトリクスの生成 - カテゴリ別失敗件数と頻度から優先度マトリクスが正常に生成される
  test('should generate failure pattern priority matrix with correct priority zones and scores', () => {
    const testData = [
      {
        category: 'categoryA',
        failureCount: 150,
        frequency: 'high',
      },
      {
        category: 'categoryB',
        failureCount: 80,
        frequency: 'medium',
      },
      {
        category: 'categoryC',
        failureCount: 30,
        frequency: 'low',
      },
    ];

    const startTime = Date.now();
    const result = generateFailurePatternPriorityMatrix(testData);
    const endTime = Date.now();
    const executionTimeMs = endTime - startTime;

    // マトリクスが JSON 形式で正しく出力されているか確認
    expect(result).toBeDefined();
    expect(typeof result).toBe('object');
    expect(Array.isArray(result.matrixEntries)).toBe(true);
    expect(result.matrixEntries.length).toBe(3);

    // X軸（失敗件数）とY軸（頻度）が正しく設定されているか確認
    const matrixA = result.matrixEntries.find(
      (entry: any) => entry.category === 'categoryA'
    );
    expect(matrixA).toBeDefined();
    expect(matrixA.failureCount).toBe(150);
    expect(matrixA.frequency).toBe('high');
    expect(matrixA.xAxis).toBe(150);
    expect(matrixA.yAxis).toBe('high');

    const matrixB = result.matrixEntries.find(
      (entry: any) => entry.category === 'categoryB'
    );
    expect(matrixB).toBeDefined();
    expect(matrixB.failureCount).toBe(80);
    expect(matrixB.frequency).toBe('medium');
    expect(matrixB.xAxis).toBe(80);
    expect(matrixB.yAxis).toBe('medium');

    const matrixC = result.matrixEntries.find(
      (entry: any) => entry.category === 'categoryC'
    );
    expect(matrixC).toBeDefined();
    expect(matrixC.failureCount).toBe(30);
    expect(matrixC.frequency).toBe('low');
    expect(matrixC.xAxis).toBe(30);
    expect(matrixC.yAxis).toBe('low');

    // 各カテゴリが正しい優先度ゾーン（Critical、High、Medium、Low）に分類されているか確認
    // 優先度ゾーン判定ロジック：
    // - failureCount >= 100 && frequency === 'high' → Critical
    // - failureCount >= 70 && frequency === 'medium' → High
    // - failureCount >= 50 && frequency === 'low' → Medium
    // - otherwise → Low
    expect(matrixA.priorityZone).toBe('Critical');
    expect(matrixB.priorityZone).toBe('High');
    expect(matrixC.priorityZone).toBe('Low');

    // 優先度スコア（0～100の範囲）が正しく計算されているか検証
    // スコア計算式：(failureCount / maxFailureCount) * frequencyWeight * 100
    // maxFailureCount = 150, frequencyWeights: high=1.0, medium=0.8, low=0.6
    // scoreA = (150 / 150) * 1.0 * 100 = 100
    // scoreB = (80 / 150) * 0.8 * 100 ≈ 42.67
    // scoreC = (30 / 150) * 0.6 * 100 = 12
    expect(matrixA.priorityScore).toBe(100);
    expect(Math.round(matrixB.priorityScore * 100) / 100).toBe(42.67);
    expect(matrixC.priorityScore).toBe(12);

    // すべてのスコアが 0～100 の範囲内であることを確認
    result.matrixEntries.forEach((entry: any) => {
      expect(entry.priorityScore).toBeGreaterThanOrEqual(0);
      expect(entry.priorityScore).toBeLessThanOrEqual(100);
    });

    // マトリクスデータが JSON 形式で正しく出力されているか確認
    const jsonString = JSON.stringify(result);
    expect(jsonString).toBeDefined();
    expect(typeof jsonString).toBe('string');
    expect(jsonString.length).toBeGreaterThan(0);

    // 処理が 1 秒以内に完了していることを確認
    expect(executionTimeMs).toBeLessThan(1000);

    // マトリクス全体の構造を検証
    expect(result.generatedAt).toBeDefined();
    expect(typeof result.generatedAt).toBe('string');
    expect(result.totalCategories).toBe(3);
    expect(result.matrixEntries[0]).toHaveProperty('category');
    expect(result.matrixEntries[0]).toHaveProperty('failureCount');
    expect(result.matrixEntries[0]).toHaveProperty('frequency');
    expect(result.matrixEntries[0]).toHaveProperty('priorityZone');
    expect(result.matrixEntries[0]).toHaveProperty('priorityScore');
    expect(result.matrixEntries[0]).toHaveProperty('xAxis');
    expect(result.matrixEntries[0]).toHaveProperty('yAxis');
  });
});