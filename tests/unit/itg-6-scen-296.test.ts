import { calculatePriorityScore } from "../../src/logic/it-1-br-8-2-1-1";

describe("改善提案優先度評価機能", () => {
  // SCEN-296: [normal] 改善提案優先度評価機能 - 優先度スコアが3つの評価指標から正しく算出される
  test("should calculate priority score correctly from three evaluation metrics", () => {
    // テストパターン1: 均等な値
    const proposal1 = {
      painSolutionDegree: 80,
      differentiationEffect: 80,
      implementationDifficulty: 20,
    };
    const score1 = calculatePriorityScore(proposal1);
    const expectedScore1 = (80 * 0.4 + 80 * 0.35 + (100 - 20) * 0.25);
    expect(score1).toBeCloseTo(expectedScore1, 1);

    // テストパターン2: ペイン解決度が高い
    const proposal2 = {
      painSolutionDegree: 95,
      differentiationEffect: 60,
      implementationDifficulty: 40,
    };
    const score2 = calculatePriorityScore(proposal2);
    const expectedScore2 = (95 * 0.4 + 60 * 0.35 + (100 - 40) * 0.25);
    expect(score2).toBeCloseTo(expectedScore2, 1);

    // テストパターン3: 差別化効果が高い
    const proposal3 = {
      painSolutionDegree: 70,
      differentiationEffect: 90,
      implementationDifficulty: 30,
    };
    const score3 = calculatePriorityScore(proposal3);
    const expectedScore3 = (70 * 0.4 + 90 * 0.35 + (100 - 30) * 0.25);
    expect(score3).toBeCloseTo(expectedScore3, 1);

    // テストパターン4: 実装難易度が低い
    const proposal4 = {
      painSolutionDegree: 65,
      differentiationEffect: 75,
      implementationDifficulty: 10,
    };
    const score4 = calculatePriorityScore(proposal4);
    const expectedScore4 = (65 * 0.4 + 75 * 0.35 + (100 - 10) * 0.25);
    expect(score4).toBeCloseTo(expectedScore4, 1);

    // テストパターン5: 全て最小値
    const proposal5 = {
      painSolutionDegree: 0,
      differentiationEffect: 0,
      implementationDifficulty: 100,
    };
    const score5 = calculatePriorityScore(proposal5);
    const expectedScore5 = (0 * 0.4 + 0 * 0.35 + (100 - 100) * 0.25);
    expect(score5).toBeCloseTo(expectedScore5, 1);

    // テストパターン6: 全て最大値
    const proposal6 = {
      painSolutionDegree: 100,
      differentiationEffect: 100,
      implementationDifficulty: 0,
    };
    const score6 = calculatePriorityScore(proposal6);
    const expectedScore6 = (100 * 0.4 + 100 * 0.35 + (100 - 0) * 0.25);
    expect(score6).toBeCloseTo(expectedScore6, 1);

    // テストパターン7: 混在パターン（高、中、低）
    const proposal7 = {
      painSolutionDegree: 85,
      differentiationEffect: 50,
      implementationDifficulty: 70,
    };
    const score7 = calculatePriorityScore(proposal7);
    const expectedScore7 = (85 * 0.4 + 50 * 0.35 + (100 - 70) * 0.25);
    expect(score7).toBeCloseTo(expectedScore7, 1);

    // テストパターン8: 実装難易度が高いが他は高い
    const proposal8 = {
      painSolutionDegree: 90,
      differentiationEffect: 85,
      implementationDifficulty: 80,
    };
    const score8 = calculatePriorityScore(proposal8);
    const expectedScore8 = (90 * 0.4 + 85 * 0.35 + (100 - 80) * 0.25);
    expect(score8).toBeCloseTo(expectedScore8, 1);

    // スコアの一貫性検証：スコア値の大小関係が合理的か確認
    expect(score6).toBeGreaterThan(score5);
    expect(score2).toBeGreaterThan(score5);
    expect(score1).toBeLessThan(score6);
  });
});