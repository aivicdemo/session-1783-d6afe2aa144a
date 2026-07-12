import { identifyMaxDifferentiationSegments } from "../../src/logic/it-1-br-4-2-1";

describe("食事制限条件の変更時に過去献立との抵触検出機能", () => {
  // SCEN-691
  test("発生頻度が0%のセグメントが優先度付けから除外される", () => {
    const testSegments = [
      {
        segmentId: "seg_001",
        segmentName: "Young Family",
        occurrenceFrequencyPercent: 10,
        differentiationEffectScore: 65,
      },
      {
        segmentId: "seg_002",
        segmentName: "Large Family",
        occurrenceFrequencyPercent: 25,
        differentiationEffectScore: 78,
      },
      {
        segmentId: "seg_003",
        segmentName: "Inactive Segment",
        occurrenceFrequencyPercent: 0,
        differentiationEffectScore: 45,
      },
      {
        segmentId: "seg_004",
        segmentName: "Budget Conscious",
        occurrenceFrequencyPercent: 15,
        differentiationEffectScore: 72,
      },
    ];

    const result = identifyMaxDifferentiationSegments(testSegments);

    expect(result).toEqual([
      {
        segmentId: "seg_002",
        segmentName: "Large Family",
        occurrenceFrequencyPercent: 25,
        differentiationEffectScore: 78,
        priorityRank: 1,
      },
      {
        segmentId: "seg_004",
        segmentName: "Budget Conscious",
        occurrenceFrequencyPercent: 15,
        differentiationEffectScore: 72,
        priorityRank: 2,
      },
      {
        segmentId: "seg_001",
        segmentName: "Young Family",
        occurrenceFrequencyPercent: 10,
        differentiationEffectScore: 65,
        priorityRank: 3,
      },
    ]);

    expect(result.length).toBe(3);
    expect(result.some((s) => s.segmentId === "seg_003")).toBe(false);
  });
});