import { prioritizeSegmentsByDifferentiationEffect } from "../../src/logic/it-1-br-8-2-1-1";

describe("ユーザーセグメント別の利用パターン分析ダッシュボード", () => {
  // SCEN-371
  test("セグメント別最大差別化効果優先度付け - 発生頻度と改善効果の2軸で差別化セグメントが正しく優先度付けされる", () => {
    // テストデータ準備：複数のセグメント（A, B, C, D）
    const segmentData = [
      {
        segmentId: "SEG_A",
        segmentName: "20s_family_high_restriction",
        occurrenceFrequency: 0.85, // 高
        improvementEffect: 0.9, // 高
      },
      {
        segmentId: "SEG_B",
        segmentName: "30s_family_medium_restriction",
        occurrenceFrequency: 0.65, // 中
        improvementEffect: 0.75, // 中
      },
      {
        segmentId: "SEG_C",
        segmentName: "40s_family_low_restriction",
        occurrenceFrequency: 0.45, // 低
        improvementEffect: 0.55, // 低
      },
      {
        segmentId: "SEG_D",
        segmentName: "30s_couple_high_restriction",
        occurrenceFrequency: 0.8, // 高
        improvementEffect: 0.7, // 中
      },
    ];

    // セグメント別最大差別化効果優先度付けの処理を実行
    const result = prioritizeSegmentsByDifferentiationEffect(segmentData);

    // 優先度スコアの計算ロジックを検証
    // スコア = 発生頻度 × 改善効果
    // SEG_A: 0.85 × 0.9 = 0.765
    // SEG_B: 0.65 × 0.75 = 0.4875
    // SEG_C: 0.45 × 0.55 = 0.2475
    // SEG_D: 0.8 × 0.7 = 0.56

    expect(result).toHaveLength(4);

    // 優先度が高い順に正しくソートされていることを確認
    expect(result[0].segmentId).toBe("SEG_A");
    expect(result[0].priorityScore).toBe(0.765);
    expect(result[0].priorityRank).toBe(1);

    expect(result[1].segmentId).toBe("SEG_D");
    expect(result[1].priorityScore).toBe(0.56);
    expect(result[1].priorityRank).toBe(2);

    expect(result[2].segmentId).toBe("SEG_B");
    expect(result[2].priorityScore).toBe(0.4875);
    expect(result[2].priorityRank).toBe(3);

    expect(result[3].segmentId).toBe("SEG_C");
    expect(result[3].priorityScore).toBe(0.2475);
    expect(result[3].priorityRank).toBe(4);

    // 結果に含まれるすべてのセグメントが正しく処理されていることを確認
    const resultSegmentIds = result.map((item) => item.segmentId);
    expect(resultSegmentIds).toEqual(
      expect.arrayContaining(["SEG_A", "SEG_B", "SEG_C", "SEG_D"])
    );

    // 同一スコアのセグメントが存在しないことを確認
    const scores = result.map((item) => item.priorityScore);
    const uniqueScores = new Set(scores);
    expect(uniqueScores.size).toBe(scores.length);

    // 各セグメントのメタデータが保持されていることを確認
    result.forEach((item) => {
      expect(item.segmentId).toBeDefined();
      expect(item.segmentName).toBeDefined();
      expect(item.priorityScore).toBeGreaterThan(0);
      expect(item.priorityScore).toBeLessThanOrEqual(1);
      expect(item.priorityRank).toBeGreaterThan(0);
      expect(item.priorityRank).toBeLessThanOrEqual(4);
    });
  });
});