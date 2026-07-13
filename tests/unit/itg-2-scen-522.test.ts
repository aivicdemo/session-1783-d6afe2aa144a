import { calculateComprehensivePriorityScore } from "../../src/logic/it-1-br-2-1-2-1";

describe("栄養士からの改善提案を優先度付けして管理し、開発チームに定期通知する機能", () => {
  // SCEN-522: [edge] 改善課題の優先度スコアリング - 総合優先度スコアの計算で浮動小数点精度による誤差が回避される
  test("複数の改善課題に対して総合優先度スコアを計算し、浮動小数点精度を保持する", () => {
    // 前提: 栄養管理・分析ダッシュボードシステムにログインし、改善課題の優先度スコアリング機能にアクセス
    // 課題A: 重要度: 8.3, 緊急度: 7.5, 実現可能性: 6.2
    const taskA = {
      taskId: "task-A",
      importance: 8.3,
      urgency: 7.5,
      feasibility: 6.2,
    };

    // 課題B: 重要度: 9.1, 緊急度: 8.8, 実現可能性: 7.4
    const taskB = {
      taskId: "task-B",
      importance: 9.1,
      urgency: 8.8,
      feasibility: 7.4,
    };

    const weights = {
      importance: 0.4,
      urgency: 0.35,
      feasibility: 0.25,
    };

    // 期待値計算:
    // 課題A: 8.3 × 0.4 + 7.5 × 0.35 + 6.2 × 0.25 = 3.32 + 2.625 + 1.55 = 7.495
    // 課題B: 9.1 × 0.4 + 8.8 × 0.35 + 7.4 × 0.25 = 3.64 + 3.08 + 1.85 = 8.57
    const expectedScoreTaskA = 7.495;
    const expectedScoreTaskB = 8.57;

    // 総合優先度スコア計算式を実行
    const scoreTaskA = calculateComprehensivePriorityScore(
      taskA.importance,
      taskA.urgency,
      taskA.feasibility,
      weights.importance,
      weights.urgency,
      weights.feasibility
    );

    const scoreTaskB = calculateComprehensivePriorityScore(
      taskB.importance,
      taskB.urgency,
      taskB.feasibility,
      weights.importance,
      weights.urgency,
      weights.feasibility
    );

    // 課題A: 8.3 × 0.4 + 7.5 × 0.35 + 6.2 × 0.25 = 7.495
    expect(scoreTaskA).toBe(7.495);

    // 課題B: 9.1 × 0.4 + 8.8 × 0.35 + 7.4 × 0.25 = 8.57
    expect(scoreTaskB).toBe(8.57);

    // 複数回計算を繰り返し実行し、同じ入力値に対する計算結果の一貫性を確認
    const scoreTaskA_Run2 = calculateComprehensivePriorityScore(
      taskA.importance,
      taskA.urgency,
      taskA.feasibility,
      weights.importance,
      weights.urgency,
      weights.feasibility
    );

    const scoreTaskB_Run2 = calculateComprehensivePriorityScore(
      taskB.importance,
      taskB.urgency,
      taskB.feasibility,
      weights.importance,
      weights.urgency,
      weights.feasibility
    );

    const scoreTaskA_Run3 = calculateComprehensivePriorityScore(
      taskA.importance,
      taskA.urgency,
      taskA.feasibility,
      weights.importance,
      weights.urgency,
      weights.feasibility
    );

    const scoreTaskB_Run3 = calculateComprehensivePriorityScore(
      taskB.importance,
      taskB.urgency,
      taskB.feasibility,
      weights.importance,
      weights.urgency,
      weights.feasibility
    );

    // 複数回の計算実行でも値が変動しないことを確認
    expect(scoreTaskA_Run2).toBe(scoreTaskA);
    expect(scoreTaskA_Run3).toBe(scoreTaskA);
    expect(scoreTaskB_Run2).toBe(scoreTaskB);
    expect(scoreTaskB_Run3).toBe(scoreTaskB);

    // スコアの小数点以下の精度が正確に保持されていることを検証
    expect(scoreTaskA.toString()).toBe("7.495");
    expect(scoreTaskB.toString()).toBe("8.57");

    // 得られたスコアが浮動小数点精度誤差なく期待値と一致
    expect(Math.abs(scoreTaskA - expectedScoreTaskA)).toBeLessThan(
      Number.EPSILON * 100
    );
    expect(Math.abs(scoreTaskB - expectedScoreTaskB)).toBeLessThan(
      Number.EPSILON * 100
    );

    // 課題A と課題B のスコアを比較し、課題B が高優先度であることを確認
    expect(scoreTaskB).toBeGreaterThan(scoreTaskA);

    // スコアの小数点第3位以上の精度が保持されていることを検証
    const taskA_DecimalPlaces = scoreTaskA.toString().split(".")[1]?.length || 0;
    const taskB_DecimalPlaces = scoreTaskB.toString().split(".")[1]?.length || 0;

    expect(taskA_DecimalPlaces).toBeGreaterThanOrEqual(3);
    expect(taskB_DecimalPlaces).toBeGreaterThanOrEqual(2);
  });
});