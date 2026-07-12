import { prioritizeSegmentsByMaxDifferentiationEffect } from "../../src/logic/it-2";

describe("家族成員の食事評価データの蓄積・管理機能", () => {
  // SCEN-690
  test("最大差別化効果セグメント優先度付け機能 - セグメント別データの必須フィールド欠損時にエラーが返される", () => {
    const baseSegmentData = {
      segmentId: "seg_001",
      segmentName: "young_family",
      successRate: 85,
      cookingTimeReduction: 25,
      satisfactionScore: 4.2,
    };

    // ケース1: 成功率が null の場合
    const missingSuccessRate = {
      ...baseSegmentData,
      successRate: null,
    };
    expect(() =>
      prioritizeSegmentsByMaxDifferentiationEffect([missingSuccessRate])
    ).toThrow(/必須パラメータ/);

    // ケース2: 成功率が undefined の場合
    const undefinedSuccessRate = {
      ...baseSegmentData,
      successRate: undefined,
    };
    expect(() =>
      prioritizeSegmentsByMaxDifferentiationEffect([undefinedSuccessRate])
    ).toThrow(/必須パラメータ/);

    // ケース3: 調理時間短縮度が null の場合
    const missingCookingTime = {
      ...baseSegmentData,
      cookingTimeReduction: null,
    };
    expect(() =>
      prioritizeSegmentsByMaxDifferentiationEffect([missingCookingTime])
    ).toThrow(/必須パラメータ/);

    // ケース4: 調理時間短縮度が undefined の場合
    const undefinedCookingTime = {
      ...baseSegmentData,
      cookingTimeReduction: undefined,
    };
    expect(() =>
      prioritizeSegmentsByMaxDifferentiationEffect([undefinedCookingTime])
    ).toThrow(/必須パラメータ/);

    // ケース5: 満足度スコアが null の場合
    const missingSatisfaction = {
      ...baseSegmentData,
      satisfactionScore: null,
    };
    expect(() =>
      prioritizeSegmentsByMaxDifferentiationEffect([missingSatisfaction])
    ).toThrow(/必須パラメータ/);

    // ケース6: 満足度スコアが undefined の場合
    const undefinedSatisfaction = {
      ...baseSegmentData,
      satisfactionScore: undefined,
    };
    expect(() =>
      prioritizeSegmentsByMaxDifferentiationEffect([undefinedSatisfaction])
    ).toThrow(/必須パラメータ/);

    // ケース7: 完全なデータで正常に処理される
    const completeSegments = [
      {
        segmentId: "seg_001",
        segmentName: "young_family",
        successRate: 85,
        cookingTimeReduction: 25,
        satisfactionScore: 4.2,
      },
      {
        segmentId: "seg_002",
        segmentName: "elderly_couple",
        successRate: 78,
        cookingTimeReduction: 15,
        satisfactionScore: 4.5,
      },
    ];

    const result = prioritizeSegmentsByMaxDifferentiationEffect(completeSegments);

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
    expect(result[0]).toHaveProperty("segmentId");
    expect(result[0]).toHaveProperty("priorityScore");
    expect(typeof result[0].priorityScore).toBe("number");
  });
});