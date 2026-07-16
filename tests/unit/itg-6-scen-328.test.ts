import { verifyDifferentiationAxis } from "../../src/logic/it-8-1-1-1";

describe("ユーザーインタビュー記録と利用ログから食材制限・調理時間制限・予算制約の優先度マトリクス生成", () => {
  // SCEN-328: [edge] 競合アプリとの差別化軸検証機能 - 対応度ギャップが29.9の場合は差別化軸の候補から除外される
  test("対応度ギャップが29.9の機能項目は差別化軸候補リストから除外される", () => {
    const input = {
      painFactors: [
        {
          painFactorId: "pain_001",
          name: "食材制限対応",
          frequency: 45,
          impact: 8.5,
          competitorCoverageScore: 65,
          ownAppCoverageScore: 94.9,
          gapScore: 29.9,
        },
        {
          painFactorId: "pain_002",
          name: "調理時間短縮",
          frequency: 52,
          impact: 9.2,
          competitorCoverageScore: 55,
          ownAppCoverageScore: 86,
          gapScore: 31.0,
        },
        {
          painFactorId: "pain_003",
          name: "予算制約対応",
          frequency: 38,
          impact: 7.8,
          competitorCoverageScore: 70,
          ownAppCoverageScore: 95,
          gapScore: 25.0,
        },
      ],
      gapThreshold: 30.0,
    };

    const result = verifyDifferentiationAxis(input);

    expect(result).toEqual({
      differentiationAxisCandidates: [
        {
          painFactorId: "pain_002",
          name: "調理時間短縮",
          frequency: 52,
          impact: 9.2,
          competitorCoverageScore: 55,
          ownAppCoverageScore: 86,
          gapScore: 31.0,
          priorityScore: expect.any(Number),
          isQualifiedForDifferentiation: true,
        },
      ],
      excludedFactors: [
        {
          painFactorId: "pain_001",
          name: "食材制限対応",
          gapScore: 29.9,
          reason: "ギャップスコアが閾値30.0未満",
        },
        {
          painFactorId: "pain_003",
          name: "予算制約対応",
          gapScore: 25.0,
          reason: "ギャップスコアが閾値30.0未満",
        },
      ],
      totalQualifiedCount: 1,
      totalExcludedCount: 2,
      gapThresholdUsed: 30.0,
    });

    expect(result.differentiationAxisCandidates.length).toBe(1);
    expect(result.differentiationAxisCandidates[0].painFactorId).toBe(
      "pain_002"
    );
    expect(result.differentiationAxisCandidates[0].gapScore).toBe(31.0);
    expect(result.differentiationAxisCandidates[0].isQualifiedForDifferentiation).toBe(
      true
    );

    expect(result.excludedFactors.length).toBe(2);
    expect(
      result.excludedFactors.some((f) => f.painFactorId === "pain_001")
    ).toBe(true);
    expect(
      result.excludedFactors.some((f) => f.painFactorId === "pain_003")
    ).toBe(true);

    const pain001Excluded = result.excludedFactors.find(
      (f) => f.painFactorId === "pain_001"
    );
    expect(pain001Excluded?.gapScore).toBe(29.9);
    expect(pain001Excluded?.reason).toBe("ギャップスコアが閾値30.0未満");

    expect(result.totalQualifiedCount).toBe(1);
    expect(result.totalExcludedCount).toBe(2);
    expect(result.gapThresholdUsed).toBe(30.0);
  });
});