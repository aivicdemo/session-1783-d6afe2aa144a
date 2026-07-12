import { prioritizeSegmentsByDifferentiationEffect } from "../../src/logic/it-3";

describe("食事評価データを献立生成ロジックに反映させる機能", () => {
  test("SCEN-692: 改善効果が同一の複数セグメントがある場合、発生頻度で正確に優先度が決定される", () => {
    // テストデータ: 改善効果が同一（0.8）で発生頻度が異なるセグメント
    const segments = [
      {
        segmentId: "segment-A",
        segmentName: "セグメントA",
        improvementEffect: 0.8,
        occurrenceFrequency: 100,
      },
      {
        segmentId: "segment-B",
        segmentName: "セグメントB",
        improvementEffect: 0.8,
        occurrenceFrequency: 50,
      },
      {
        segmentId: "segment-C",
        segmentName: "セグメントC",
        improvementEffect: 0.8,
        occurrenceFrequency: 75,
      },
    ];

    // 最大差別化効果セグメント優先度付け機能を実行
    const result = prioritizeSegmentsByDifferentiationEffect(segments);

    // 優先度順序の検証: セグメントA（100回）> セグメントC（75回）> セグメントB（50回）
    expect(result).toHaveLength(3);

    // 1位: セグメントA（発生頻度100）
    expect(result[0].segmentId).toBe("segment-A");
    expect(result[0].priority).toBe(1);
    expect(result[0].occurrenceFrequency).toBe(100);

    // 2位: セグメントC（発生頻度75）
    expect(result[1].segmentId).toBe("segment-C");
    expect(result[1].priority).toBe(2);
    expect(result[1].occurrenceFrequency).toBe(75);

    // 3位: セグメントB（発生頻度50）
    expect(result[2].segmentId).toBe("segment-B");
    expect(result[2].priority).toBe(3);
    expect(result[2].occurrenceFrequency).toBe(50);

    // 改善効果がすべて同一であることを確認
    expect(result[0].improvementEffect).toBe(0.8);
    expect(result[1].improvementEffect).toBe(0.8);
    expect(result[2].improvementEffect).toBe(0.8);
  });
});