import {
  generatePainFactorPriorityMatrix,
} from "../../src/logic/it-8-1-1-1";

describe("ペイン要因の優先度マトリクス生成機能", () => {
  // SCEN-322
  test("発生頻度または影響度がnullまたは負数の場合にエラーが発生する", () => {
    // ケース1: 発生頻度がnull
    expect(() =>
      generatePainFactorPriorityMatrix({
        painFactorId: "pf_001",
        painFactorName: "食材制限",
        occurrenceFrequency: null as any,
        impactDegree: 75,
        userSegment: "stay_at_home_father",
      })
    ).toThrow(/発生頻度/);

    // ケース2: 影響度がnull
    expect(() =>
      generatePainFactorPriorityMatrix({
        painFactorId: "pf_002",
        painFactorName: "調理時間制限",
        occurrenceFrequency: 45,
        impactDegree: null as any,
        userSegment: "stay_at_home_father",
      })
    ).toThrow(/影響度/);

    // ケース3: 発生頻度が負数
    expect(() =>
      generatePainFactorPriorityMatrix({
        painFactorId: "pf_003",
        painFactorName: "予算制約",
        occurrenceFrequency: -1,
        impactDegree: 60,
        userSegment: "stay_at_home_father",
      })
    ).toThrow(/発生頻度/);

    // ケース4: 影響度が負数
    expect(() =>
      generatePainFactorPriorityMatrix({
        painFactorId: "pf_004",
        painFactorName: "食材制限",
        occurrenceFrequency: 50,
        impactDegree: -5,
        userSegment: "stay_at_home_father",
      })
    ).toThrow(/影響度/);

    // ケース5: 発生頻度と影響度の両方が負数
    expect(() =>
      generatePainFactorPriorityMatrix({
        painFactorId: "pf_005",
        painFactorName: "調理時間制限",
        occurrenceFrequency: -10,
        impactDegree: -20,
        userSegment: "stay_at_home_father",
      })
    ).toThrow(/発生頻度|影響度/);

    // ケース6: 正常なデータで成功
    const result = generatePainFactorPriorityMatrix({
      painFactorId: "pf_006",
      painFactorName: "食材制限",
      occurrenceFrequency: 62,
      impactDegree: 78,
      userSegment: "stay_at_home_father",
    });

    expect(result).toBeDefined();
    expect(result.painFactorId).toBe("pf_006");
    expect(result.painFactorName).toBe("食材制限");
    expect(result.occurrenceFrequency).toBe(62);
    expect(result.impactDegree).toBe(78);
    expect(result.priorityScore).toBe(4836); // 62 * 78 = 4836
    expect(result.priorityRank).toBe("high"); // 発生頻度 >= 50 && 影響度 >= 70 => high
  });
});