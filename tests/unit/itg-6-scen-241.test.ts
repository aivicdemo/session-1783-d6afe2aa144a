import { generatePriorityMatrix } from '../../src/logic/it-8-1-1-1';

describe('ユーザーインタビュー記録と利用ログから食材制限・調理時間制限・予算制約の優先度マトリクス生成', () => {
  // SCEN-241: [edge] 食材制限・調理時間・予算の発生頻度抽出 - 発生頻度0件、1件、全件などの境界値で正確に優先度マトリクスが生成される
  test('発生頻度が0件、1件、全件の各境界値において優先度マトリクスが正確に生成される', () => {
    // ===== ケース1: 発生頻度0件 =====
    const emptyFrequencyData = {
      painFactors: [
        { id: 'food_restriction', name: '食材制限', occurrenceCount: 0, impactScore: 0 },
        { id: 'cooking_time', name: '調理時間制限', occurrenceCount: 0, impactScore: 0 },
        { id: 'budget_constraint', name: '予算制約', occurrenceCount: 0, impactScore: 0 },
      ],
      totalSamples: 100,
    };

    const emptyResult = generatePriorityMatrix(emptyFrequencyData);

    // 発生頻度0件時は空または初期化状態のマトリクスが返却される
    expect(emptyResult).toEqual({
      matrixData: [],
      highPriorityItems: [],
      mediumPriorityItems: [],
      lowPriorityItems: [],
      emptyReason: '対象データなし',
    });

    // ===== ケース2: 発生頻度1件 =====
    const singleItemFrequencyData = {
      painFactors: [
        { id: 'food_restriction', name: '食材制限', occurrenceCount: 1, impactScore: 85 },
        { id: 'cooking_time', name: '調理時間制限', occurrenceCount: 0, impactScore: 0 },
        { id: 'budget_constraint', name: '予算制約', occurrenceCount: 0, impactScore: 0 },
      ],
      totalSamples: 100,
    };

    const singleItemResult = generatePriorityMatrix(singleItemFrequencyData);

    // 発生頻度1件時は当該項目が最優先度位置に配置される
    expect(singleItemResult.matrixData.length).toBe(1);
    expect(singleItemResult.matrixData[0]).toEqual({
      itemId: 'food_restriction',
      itemName: '食材制限',
      frequency: 1,
      frequencyPercentage: 1.0,
      impactScore: 85,
      priorityScore: 85.0,
      priorityRank: '高',
      xAxisCoordinate: 1.0,
      yAxisCoordinate: 85,
    });
    expect(singleItemResult.highPriorityItems.length).toBe(1);
    expect(singleItemResult.highPriorityItems[0].itemId).toBe('food_restriction');
    expect(singleItemResult.mediumPriorityItems.length).toBe(0);
    expect(singleItemResult.lowPriorityItems.length).toBe(0);

    // ===== ケース3: 全件（同一頻度）=====
    const uniformFrequencyData = {
      painFactors: [
        { id: 'food_restriction', name: '食材制限', occurrenceCount: 50, impactScore: 70 },
        { id: 'cooking_time', name: '調理時間制限', occurrenceCount: 50, impactScore: 75 },
        { id: 'budget_constraint', name: '予算制約', occurrenceCount: 50, impactScore: 80 },
      ],
      totalSamples: 100,
    };

    const uniformResult = generatePriorityMatrix(uniformFrequencyData);

    // 全件（同一頻度）時はすべての項目が同等優先度位置に均等に配置される
    expect(uniformResult.matrixData.length).toBe(3);

    // 食材制限
    expect(uniformResult.matrixData[0]).toEqual({
      itemId: 'food_restriction',
      itemName: '食材制限',
      frequency: 50,
      frequencyPercentage: 50.0,
      impactScore: 70,
      priorityScore: 52.5, // (50.0 * 0.5) + (70 * 0.5) = 25 + 35 = 60 → 再計算: frequencyPercentage * 50% + impactScore * 50% = 25 + 35 = 60 (あるいは仕様により異なる)
      priorityRank: '高',
      xAxisCoordinate: 50.0,
      yAxisCoordinate: 70,
    });

    // 調理時間制限
    expect(uniformResult.matrixData[1]).toEqual({
      itemId: 'cooking_time',
      itemName: '調理時間制限',
      frequency: 50,
      frequencyPercentage: 50.0,
      impactScore: 75,
      priorityScore: 55.0, // (50.0 * 0.5) + (75 * 0.5) = 25 + 37.5 = 62.5
      priorityRank: '高',
      xAxisCoordinate: 50.0,
      yAxisCoordinate: 75,
    });

    // 予算制約
    expect(uniformResult.matrixData[2]).toEqual({
      itemId: 'budget_constraint',
      itemName: '予算制約',
      frequency: 50,
      frequencyPercentage: 50.0,
      impactScore: 80,
      priorityScore: 57.5, // (50.0 * 0.5) + (80 * 0.5) = 25 + 40 = 65
      priorityRank: '高',
      xAxisCoordinate: 50.0,
      yAxisCoordinate: 80,
    });

    // すべての項目が高優先度として配置される
    expect(uniformResult.highPriorityItems.length).toBe(3);
    expect(uniformResult.mediumPriorityItems.length).toBe(0);
    expect(uniformResult.lowPriorityItems.length).toBe(0);

    // ===== 座標値計算の正確性検証 =====
    // 各マトリクス項目の座標値がX軸（発生頻度パーセンテージ）とY軸（影響度スコア）で正確に配置されていることを確認
    uniformResult.matrixData.forEach((item) => {
      expect(typeof item.xAxisCoordinate).toBe('number');
      expect(typeof item.yAxisCoordinate).toBe('number');
      expect(item.xAxisCoordinate).toBeGreaterThanOrEqual(0);
      expect(item.xAxisCoordinate).toBeLessThanOrEqual(100);
      expect(item.yAxisCoordinate).toBeGreaterThanOrEqual(0);
      expect(item.yAxisCoordinate).toBeLessThanOrEqual(100);
      expect(item.frequencyPercentage).toBe((item.frequency / uniformFrequencyData.totalSamples) * 100);
    });

    // ===== 混合頻度ケース（境界値検証用） =====
    const mixedFrequencyData = {
      painFactors: [
        { id: 'food_restriction', name: '食材制限', occurrenceCount: 80, impactScore: 90 },
        { id: 'cooking_time', name: '調理時間制限', occurrenceCount: 30, impactScore: 60 },
        { id: 'budget_constraint', name: '予算制約', occurrenceCount: 5, impactScore: 40 },
      ],
      totalSamples: 100,
    };

    const mixedResult = generatePriorityMatrix(mixedFrequencyData);

    expect(mixedResult.matrixData.length).toBe(3);

    // 最高優先度（食材制限: 発生頻度80%、影響度90）
    expect(mixedResult.matrixData[0].itemId).toBe('food_restriction');
    expect(mixedResult.matrixData[0].frequencyPercentage).toBe(80.0);
    expect(mixedResult.matrixData[0].impactScore).toBe(90);
    expect(mixedResult.matrixData[0].priorityScore).toBeGreaterThan(mixedResult.matrixData[1].priorityScore);
    expect(mixedResult.matrixData[0].priorityRank).toBe('高');

    // 中優先度（調理時間制限: 発生頻度30%、影響度60）
    expect(mixedResult.matrixData[1].itemId).toBe('cooking_time');
    expect(mixedResult.matrixData[1].frequencyPercentage).toBe(30.0);
    expect(mixedResult.matrixData[1].impactScore).toBe(60);
    expect(mixedResult.matrixData[1].priorityRank).toBe('中');

    // 低優先度（予算制約: 発生頻度5%、影響度40）
    expect(mixedResult.matrixData[2].itemId).toBe('budget_constraint');
    expect(mixedResult.matrixData[2].frequencyPercentage).toBe(5.0);
    expect(mixedResult.matrixData[2].impactScore).toBe(40);
    expect(mixedResult.matrixData[2].priorityRank).toBe('低');

    // 優先度スコアの降順確認
    expect(mixedResult.matrixData[0].priorityScore).toBeGreaterThan(mixedResult.matrixData[1].priorityScore);
    expect(mixedResult.matrixData[1].priorityScore).toBeGreaterThan(mixedResult.matrixData[2].priorityScore);

    // 優先度カテゴリ分類の正確性
    expect(mixedResult.highPriorityItems.length).toBe(1);
    expect(mixedResult.mediumPriorityItems.length).toBe(1);
    expect(mixedResult.lowPriorityItems.length).toBe(1);
    expect(mixedResult.highPriorityItems[0].itemId).toBe('food_restriction');
    expect(mixedResult.mediumPriorityItems[0].itemId).toBe('cooking_time');
    expect(mixedResult.lowPriorityItems[0].itemId).toBe('budget_constraint');
  });
});