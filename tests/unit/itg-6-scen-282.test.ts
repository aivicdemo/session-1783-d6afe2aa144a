import { extractAbandonmentPoints } from '../../src/logic/it-8-1-2-1';

describe('献立生成フロー内の制約条件入力パターンと離脱ポイント自動抽出', () => {
  // SCEN-282
  test('フロー初期段階での離脱と最終段階での離脱が異なる離脱ポイントとして抽出される', () => {
    // 準備: テストデータ - 同じ機能を使用するユーザーのフロー情報
    const flowLogsInput = [
      {
        userId: 'user_001',
        featureName: 'meal_generation',
        flowStep: 1,
        stepDescription: 'constraint_input_initial',
        timestamp: '2024-01-15T10:00:00Z',
        abandonedAt: '2024-01-15T10:05:00Z',
        isAbandoned: true,
      },
      {
        userId: 'user_002',
        featureName: 'meal_generation',
        flowStep: 5,
        stepDescription: 'constraint_input_final',
        timestamp: '2024-01-15T10:10:00Z',
        abandonedAt: '2024-01-15T10:25:00Z',
        isAbandoned: true,
      },
      {
        userId: 'user_003',
        featureName: 'meal_generation',
        flowStep: 1,
        stepDescription: 'constraint_input_initial',
        timestamp: '2024-01-15T10:30:00Z',
        abandonedAt: '2024-01-15T10:32:00Z',
        isAbandoned: true,
      },
      {
        userId: 'user_004',
        featureName: 'meal_generation',
        flowStep: 5,
        stepDescription: 'constraint_input_final',
        timestamp: '2024-01-15T10:40:00Z',
        abandonedAt: '2024-01-15T10:55:00Z',
        isAbandoned: true,
      },
    ];

    // 実行: 離脱ポイント抽出機能を実行
    const extractionResult = extractAbandonmentPoints(flowLogsInput);

    // 検証1: 初期段階（ステップ1）の離脱ポイントが抽出されていることを確認
    const step1AbandonmentPoint = extractionResult.abandonmentPoints.find(
      (point) => point.flowStep === 1,
    );
    expect(step1AbandonmentPoint).toBeDefined();
    expect(step1AbandonmentPoint?.stepDescription).toBe(
      'constraint_input_initial',
    );

    // 検証2: 最終段階（ステップ5）の離脱ポイントが抽出されていることを確認
    const step5AbandonmentPoint = extractionResult.abandonmentPoints.find(
      (point) => point.flowStep === 5,
    );
    expect(step5AbandonmentPoint).toBeDefined();
    expect(step5AbandonmentPoint?.stepDescription).toBe(
      'constraint_input_final',
    );

    // 検証3: 初期段階と最終段階の離脱ポイントが異なるレコードとして分類されていることを確認
    expect(extractionResult.abandonmentPoints.length).toBe(2);
    const uniqueSteps = new Set(
      extractionResult.abandonmentPoints.map((p) => p.flowStep),
    );
    expect(uniqueSteps.size).toBe(2);
    expect(uniqueSteps.has(1)).toBe(true);
    expect(uniqueSteps.has(5)).toBe(true);

    // 検証4: 初期段階（ステップ1）別の離脱ユーザー数が正確にカウントされていることを確認
    expect(step1AbandonmentPoint?.abandonmentCount).toBe(2);
    expect(step1AbandonmentPoint?.abandonmentUserIds).toEqual(
      expect.arrayContaining(['user_001', 'user_003']),
    );
    expect(step1AbandonmentPoint?.abandonmentUserIds.length).toBe(2);

    // 検証5: 最終段階（ステップ5）別の離脱ユーザー数が正確にカウントされていることを確認
    expect(step5AbandonmentPoint?.abandonmentCount).toBe(2);
    expect(step5AbandonmentPoint?.abandonmentUserIds).toEqual(
      expect.arrayContaining(['user_002', 'user_004']),
    );
    expect(step5AbandonmentPoint?.abandonmentUserIds.length).toBe(2);

    // 検証6: 全体の離脱ユーザー数が正確にカウントされていることを確認
    expect(extractionResult.totalAbandonmentCount).toBe(4);

    // 検証7: 各離脱ポイントの離脱率が正確に計算されていることを確認
    // ステップ1の離脱率: 2 / 4 = 0.5 (50%)
    expect(step1AbandonmentPoint?.abandonmentRate).toBe(0.5);
    // ステップ5の離脱率: 2 / 4 = 0.5 (50%)
    expect(step5AbandonmentPoint?.abandonmentRate).toBe(0.5);

    // 検証8: 離脱ポイントが発生頻度でソートされていることを確認
    expect(extractionResult.abandonmentPoints[0].abandonmentCount).toBeGreaterThanOrEqual(
      extractionResult.abandonmentPoints[1].abandonmentCount,
    );
  });
});