import { calculatePriorityScore } from '../../src/logic/it-1-br-4-2-1';

describe('食事制限条件の変更時に過去献立との抵触検出機能', () => {
  // SCEN-631: [normal] 改善提案の優先度スコア算出
  test('改善提案の優先度スコアが KPI寄与度・実装難度・ユーザー影響度から正確に算出される', () => {
    // テストケース 1: KPI寄与度 8、実装難度 3、ユーザー影響度 7
    const score1 = calculatePriorityScore({
      kpiContribution: 8,
      implementationDifficulty: 3,
      userImpact: 7,
    });

    // 計算式: (KPI寄与度 × 0.4) + (ユーザー影響度 × 0.35) - (実装難度 × 0.25)
    // (8 × 0.4) + (7 × 0.35) - (3 × 0.25) = 3.2 + 2.45 - 0.75 = 4.9
    expect(score1).toBe(4.9);
    expect(typeof score1).toBe('number');
    expect(score1).toBeGreaterThanOrEqual(0);
    expect(score1).toBeLessThanOrEqual(10);

    // テストケース 2: KPI寄与度 5、実装難度 9、ユーザー影響度 2
    const score2 = calculatePriorityScore({
      kpiContribution: 5,
      implementationDifficulty: 9,
      userImpact: 2,
    });

    // (5 × 0.4) + (2 × 0.35) - (9 × 0.25) = 2.0 + 0.7 - 2.25 = 0.45
    expect(score2).toBe(0.45);
    expect(typeof score2).toBe('number');
    expect(score2).toBeGreaterThanOrEqual(0);
    expect(score2).toBeLessThanOrEqual(10);

    // テストケース 3: KPI寄与度 10、実装難度 1、ユーザー影響度 10
    const score3 = calculatePriorityScore({
      kpiContribution: 10,
      implementationDifficulty: 1,
      userImpact: 10,
    });

    // (10 × 0.4) + (10 × 0.35) - (1 × 0.25) = 4.0 + 3.5 - 0.25 = 7.25
    expect(score3).toBe(7.25);
    expect(typeof score3).toBe('number');
    expect(score3).toBeGreaterThanOrEqual(0);
    expect(score3).toBeLessThanOrEqual(10);

    // テストケース 4: KPI寄与度 1、実装難度 10、ユーザー影響度 1
    const score4 = calculatePriorityScore({
      kpiContribution: 1,
      implementationDifficulty: 10,
      userImpact: 1,
    });

    // (1 × 0.4) + (1 × 0.35) - (10 × 0.25) = 0.4 + 0.35 - 2.5 = -1.75
    // 最小値は 0 に調整
    expect(score4).toBe(0);
    expect(typeof score4).toBe('number');
    expect(score4).toBeGreaterThanOrEqual(0);
    expect(score4).toBeLessThanOrEqual(10);

    // テストケース 5: KPI寄与度 6、実装難度 4、ユーザー影響度 8
    const score5 = calculatePriorityScore({
      kpiContribution: 6,
      implementationDifficulty: 4,
      userImpact: 8,
    });

    // (6 × 0.4) + (8 × 0.35) - (4 × 0.25) = 2.4 + 2.8 - 1.0 = 4.2
    expect(score5).toBe(4.2);
    expect(typeof score5).toBe('number');
    expect(score5).toBeGreaterThanOrEqual(0);
    expect(score5).toBeLessThanOrEqual(10);
  });
});