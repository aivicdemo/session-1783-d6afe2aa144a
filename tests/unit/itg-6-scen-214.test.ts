import { calculateImprovementPriorityScore } from '../../src/logic/it-8-1-1-1';

describe('改善課題優先度スコアリング機能 - 入力値範囲検証', () => {
  // SCEN-214
  test('スコアリング入力値が有効範囲外の場合、エラーハンドリングが正常に実行される', () => {
    // 有効範囲: 0-100, 数値型のみ
    // スコアリング項目: importance(重要度), urgency(緊急度), implementationDifficulty(実装難易度)

    // ケース1: 負の数値を入力
    expect(() =>
      calculateImprovementPriorityScore({
        improvementTaskId: 'task_001',
        importance: -10,
        urgency: 50,
        implementationDifficulty: 30,
      })
    ).toThrow(/importance/);

    // ケース2: 100を超える値を入力
    expect(() =>
      calculateImprovementPriorityScore({
        improvementTaskId: 'task_001',
        importance: 50,
        urgency: 150,
        implementationDifficulty: 30,
      })
    ).toThrow(/urgency/);

    // ケース3: 実装難易度が範囲外
    expect(() =>
      calculateImprovementPriorityScore({
        improvementTaskId: 'task_001',
        importance: 50,
        urgency: 50,
        implementationDifficulty: 101,
      })
    ).toThrow(/implementationDifficulty/);

    // ケース4: NaN を入力
    expect(() =>
      calculateImprovementPriorityScore({
        improvementTaskId: 'task_001',
        importance: NaN,
        urgency: 50,
        implementationDifficulty: 30,
      })
    ).toThrow(/importance/);

    // ケース5: null を入力
    expect(() =>
      calculateImprovementPriorityScore({
        improvementTaskId: 'task_001',
        importance: null as any,
        urgency: 50,
        implementationDifficulty: 30,
      })
    ).toThrow(/importance/);

    // ケース6: 文字列を入力
    expect(() =>
      calculateImprovementPriorityScore({
        improvementTaskId: 'task_001',
        importance: '50' as any,
        urgency: 50,
        implementationDifficulty: 30,
      })
    ).toThrow(/importance/);

    // ケース7: 正常系 - すべて有効範囲内
    const validResult = calculateImprovementPriorityScore({
      improvementTaskId: 'task_001',
      importance: 80,
      urgency: 60,
      implementationDifficulty: 40,
    });

    // 優先度スコア = (importance + urgency) / 2 - (implementationDifficulty / 2)
    // = (80 + 60) / 2 - (40 / 2) = 70 - 20 = 50
    expect(validResult).toEqual({
      improvementTaskId: 'task_001',
      priorityScore: 50,
      status: 'valid',
      inputValidated: true,
    });

    // ケース8: 境界値テスト - 最小値
    const minBoundaryResult = calculateImprovementPriorityScore({
      improvementTaskId: 'task_002',
      importance: 0,
      urgency: 0,
      implementationDifficulty: 0,
    });

    // スコア = (0 + 0) / 2 - (0 / 2) = 0
    expect(minBoundaryResult.priorityScore).toBe(0);

    // ケース9: 境界値テスト - 最大値
    const maxBoundaryResult = calculateImprovementPriorityScore({
      improvementTaskId: 'task_003',
      importance: 100,
      urgency: 100,
      implementationDifficulty: 0,
    });

    // スコア = (100 + 100) / 2 - (0 / 2) = 100
    expect(maxBoundaryResult.priorityScore).toBe(100);

    // ケース10: 実装難易度が高い場合のスコア低下
    const highDifficultyResult = calculateImprovementPriorityScore({
      improvementTaskId: 'task_004',
      importance: 100,
      urgency: 100,
      implementationDifficulty: 100,
    });

    // スコア = (100 + 100) / 2 - (100 / 2) = 100 - 50 = 50
    expect(highDifficultyResult.priorityScore).toBe(50);

    // ケース11: undefined を含む入力
    expect(() =>
      calculateImprovementPriorityScore({
        improvementTaskId: 'task_005',
        importance: undefined as any,
        urgency: 50,
        implementationDifficulty: 30,
      })
    ).toThrow(/importance/);

    // ケース12: 小数点値の正常系
    const decimalResult = calculateImprovementPriorityScore({
      improvementTaskId: 'task_006',
      importance: 75.5,
      urgency: 45.5,
      implementationDifficulty: 25.5,
    });

    // スコア = (75.5 + 45.5) / 2 - (25.5 / 2) = 60.5 - 12.75 = 47.75
    expect(decimalResult.priorityScore).toBe(47.75);

    // ケース13: 浮動小数点誤差対応
    const floatingPointResult = calculateImprovementPriorityScore({
      improvementTaskId: 'task_007',
      importance: 33.33,
      urgency: 33.33,
      implementationDifficulty: 33.34,
    });

    // スコア = (33.33 + 33.33) / 2 - (33.34 / 2) ≈ 33.33 - 16.67 = 16.66
    expect(Math.abs(floatingPointResult.priorityScore - 16.66)).toBeLessThan(0.01);
  });
});