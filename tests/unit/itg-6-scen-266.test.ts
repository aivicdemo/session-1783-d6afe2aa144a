import { generateFailurePatternPriorityMatrix } from '../../src/logic/it-8-1-2-1';

describe('失敗パターン優先度マトリクス生成機能', () => {
  // SCEN-266
  test('却下修正理由の発生頻度と影響度から優先度マトリクスが正常に生成される', () => {
    // Arrange: テストデータの準備
    const failureReasons = [
      {
        id: 'reason_001',
        name: '栄養バランス不適切',
        frequency: 45,
        impactScore: 5,
      },
      {
        id: 'reason_002',
        name: '家族好み未反映',
        frequency: 32,
        impactScore: 4,
      },
      {
        id: 'reason_003',
        name: '調理時間超過',
        frequency: 28,
        impactScore: 3,
      },
      {
        id: 'reason_004',
        name: '食材制限漏れ',
        frequency: 18,
        impactScore: 5,
      },
      {
        id: 'reason_005',
        name: 'その他',
        frequency: 12,
        impactScore: 2,
      },
    ];

    // Act: マトリクス生成関数を呼び出す
    const result = generateFailurePatternPriorityMatrix(failureReasons);

    // Assert: マトリクスが存在することを確認
    expect(result).toBeDefined();
    expect(result).not.toBeNull();

    // マトリクスの基本構造を確認
    expect(result).toHaveProperty('matrix');
    expect(result).toHaveProperty('sortedItems');
    expect(result).toHaveProperty('axisConfig');

    // X軸（発生頻度）とY軸（影響度）の設定を確認
    expect(result.axisConfig).toEqual({
      xAxis: 'frequency',
      yAxis: 'impactScore',
    });

    // ソート済みアイテムが存在することを確認
    expect(Array.isArray(result.sortedItems)).toBe(true);
    expect(result.sortedItems.length).toBe(5);

    // 優先度スコアが正しく計算されていることを確認
    // 期待値：frequency × impactScore
    expect(result.sortedItems[0]).toEqual({
      id: 'reason_001',
      name: '栄養バランス不適切',
      frequency: 45,
      impactScore: 5,
      priorityScore: 225, // 45 × 5
    });

    expect(result.sortedItems[1]).toEqual({
      id: 'reason_004',
      name: '食材制限漏れ',
      frequency: 18,
      impactScore: 5,
      priorityScore: 90, // 18 × 5
    });

    expect(result.sortedItems[2]).toEqual({
      id: 'reason_002',
      name: '家族好み未反映',
      frequency: 32,
      impactScore: 4,
      priorityScore: 128, // 32 × 4
    });

    expect(result.sortedItems[3]).toEqual({
      id: 'reason_003',
      name: '調理時間超過',
      frequency: 28,
      impactScore: 3,
      priorityScore: 84, // 28 × 3
    });

    expect(result.sortedItems[4]).toEqual({
      id: 'reason_005',
      name: 'その他',
      frequency: 12,
      impactScore: 2,
      priorityScore: 24, // 12 × 2
    });

    // マトリクスが優先度スコアの降順でソートされていることを確認
    const priorityScores = result.sortedItems.map((item: any) => item.priorityScore);
    const sortedPriorityScores = [...priorityScores].sort(
      (a: number, b: number) => b - a
    );
    expect(priorityScores).toEqual(sortedPriorityScores);

    // マトリクスセルの構成を確認（発生頻度レンジと影響度レンジでグループ化）
    expect(result.matrix).toBeDefined();
    expect(typeof result.matrix).toBe('object');

    // マトリクス内で高優先度（priorityScore 200以上）の項目が存在することを確認
    const highPriorityItems = result.sortedItems.filter(
      (item: any) => item.priorityScore >= 200
    );
    expect(highPriorityItems.length).toBeGreaterThan(0);
    expect(highPriorityItems[0].id).toBe('reason_001');

    // マトリクス内で中優先度（100-199）と低優先度（100未満）が適切に分類されていることを確認
    const mediumPriorityItems = result.sortedItems.filter(
      (item: any) => item.priorityScore >= 100 && item.priorityScore < 200
    );
    const lowPriorityItems = result.sortedItems.filter(
      (item: any) => item.priorityScore < 100
    );

    expect(mediumPriorityItems.length).toBe(1); // reason_002: 128
    expect(lowPriorityItems.length).toBe(3); // reason_003, reason_004, reason_005

    // 却下修正理由がマトリクスの各セルに正しくマッピングされていることを確認
    result.sortedItems.forEach((item: any, index: number) => {
      // idが正しく保持されている
      expect(item.id).toBeDefined();
      expect(typeof item.id).toBe('string');

      // nameが正しく保持されている
      expect(item.name).toBeDefined();
      expect(typeof item.name).toBe('string');

      // frequencyが正しく保持されている
      expect(item.frequency).toBeGreaterThan(0);
      expect(Number.isInteger(item.frequency)).toBe(true);

      // impactScoreが1-5の範囲内である
      expect(item.impactScore).toBeGreaterThanOrEqual(1);
      expect(item.impactScore).toBeLessThanOrEqual(5);

      // priorityScoreが正しく計算されている
      expect(item.priorityScore).toBe(item.frequency * item.impactScore);
    });

    // 高優先度の項目（priorityScore上位）が上位に配置されていることを確認
    expect(result.sortedItems[0].priorityScore).toBeGreaterThan(
      result.sortedItems[1].priorityScore
    );
    expect(result.sortedItems[1].priorityScore).toBeGreaterThan(
      result.sortedItems[2].priorityScore
    );
    expect(result.sortedItems[2].priorityScore).toBeGreaterThan(
      result.sortedItems[3].priorityScore
    );
    expect(result.sortedItems[3].priorityScore).toBeGreaterThan(
      result.sortedItems[4].priorityScore
    );

    // 全アイテムがマトリクスに含まれていることを確認
    expect(result.sortedItems.length).toBe(failureReasons.length);
  });
});