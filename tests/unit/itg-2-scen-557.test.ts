import { sortImprovementTargetsByPriority } from '../../src/logic/it-1-br-2-1-1-1';

describe('需要予測精度改善判定機能 - 改善対象機能の優先度ソート', () => {
  // SCEN-557
  test('複数の改善対象機能がある場合、優先度スコアで降順ソートされる', () => {
    const improvementTargets = [
      {
        id: 'target_001',
        functionName: '栄養バランス検証ロジック',
        priorityScore: 72,
        insertedAt: '2024-01-01T10:00:00Z',
      },
      {
        id: 'target_002',
        functionName: '献立提案アルゴリズム',
        priorityScore: 95,
        insertedAt: '2024-01-01T09:00:00Z',
      },
      {
        id: 'target_003',
        functionName: 'アレルギー検出ロジック',
        priorityScore: 88,
        insertedAt: '2024-01-01T11:00:00Z',
      },
      {
        id: 'target_004',
        functionName: '調理時間予測モデル',
        priorityScore: 60,
        insertedAt: '2024-01-01T08:00:00Z',
      },
    ];

    const result = sortImprovementTargetsByPriority(improvementTargets);

    expect(result).toHaveLength(4);
    expect(result[0].priorityScore).toBe(95);
    expect(result[0].functionName).toBe('献立提案アルゴリズム');
    expect(result[1].priorityScore).toBe(88);
    expect(result[1].functionName).toBe('アレルギー検出ロジック');
    expect(result[2].priorityScore).toBe(72);
    expect(result[2].functionName).toBe('栄養バランス検証ロジック');
    expect(result[3].priorityScore).toBe(60);
    expect(result[3].functionName).toBe('調理時間予測モデル');
  });

  test('同じスコアを持つ機能については挿入順で並ぶ', () => {
    const improvementTargets = [
      {
        id: 'target_001',
        functionName: '機能A',
        priorityScore: 85,
        insertedAt: '2024-01-01T10:00:00Z',
      },
      {
        id: 'target_002',
        functionName: '機能B',
        priorityScore: 85,
        insertedAt: '2024-01-01T09:00:00Z',
      },
      {
        id: 'target_003',
        functionName: '機能C',
        priorityScore: 90,
        insertedAt: '2024-01-01T11:00:00Z',
      },
    ];

    const result = sortImprovementTargetsByPriority(improvementTargets);

    expect(result).toHaveLength(3);
    expect(result[0].priorityScore).toBe(90);
    expect(result[0].functionName).toBe('機能C');
    expect(result[1].priorityScore).toBe(85);
    expect(result[1].functionName).toBe('機能B');
    expect(result[2].priorityScore).toBe(85);
    expect(result[2].functionName).toBe('機能A');
  });

  test('空配列が入力された場合、空配列を返す', () => {
    const improvementTargets: any[] = [];

    const result = sortImprovementTargetsByPriority(improvementTargets);

    expect(result).toEqual([]);
  });

  test('単一の改善対象機能の場合、そのまま返される', () => {
    const improvementTargets = [
      {
        id: 'target_001',
        functionName: '栄養基準ロジック改善',
        priorityScore: 78,
        insertedAt: '2024-01-01T10:00:00Z',
      },
    ];

    const result = sortImprovementTargetsByPriority(improvementTargets);

    expect(result).toHaveLength(1);
    expect(result[0].priorityScore).toBe(78);
    expect(result[0].functionName).toBe('栄養基準ロジック改善');
  });

  test('優先度スコアが0または最大値100を含む場合も正しくソートされる', () => {
    const improvementTargets = [
      {
        id: 'target_001',
        functionName: '低優先度機能',
        priorityScore: 0,
        insertedAt: '2024-01-01T10:00:00Z',
      },
      {
        id: 'target_002',
        functionName: '最高優先度機能',
        priorityScore: 100,
        insertedAt: '2024-01-01T09:00:00Z',
      },
      {
        id: 'target_003',
        functionName: '中優先度機能',
        priorityScore: 50,
        insertedAt: '2024-01-01T11:00:00Z',
      },
    ];

    const result = sortImprovementTargetsByPriority(improvementTargets);

    expect(result).toHaveLength(3);
    expect(result[0].priorityScore).toBe(100);
    expect(result[1].priorityScore).toBe(50);
    expect(result[2].priorityScore).toBe(0);
  });
});