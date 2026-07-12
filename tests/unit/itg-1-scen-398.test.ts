import { identifyMaxDifferentiationSegment } from "../../src/logic/it-3";

describe("ユーザーセグメント別分析 - 最高差別化効果セグメント特定", () => {
  test("SCEN-398: 複数セグメント間の効果差を比較し、最高差別化効果セグメントが正確に特定される", () => {
    // 準備: 3つのユーザーセグメント（年代別、食習慣別、予算別）を作成
    const segmentData = [
      {
        segmentId: "seg_001",
        segmentName: "20代_低予算層",
        segmentType: "age_budget",
        mealGenerationSuccessRate: 85,
        cookingTimeReductionRate: 42,
        userSatisfactionScore: 78,
        proposalAdoptionRate: 72,
        repeatUsageRate: 65,
      },
      {
        segmentId: "seg_002",
        segmentName: "40代_高予算層",
        segmentType: "age_budget",
        mealGenerationSuccessRate: 92,
        cookingTimeReductionRate: 55,
        userSatisfactionScore: 88,
        proposalAdoptionRate: 81,
        repeatUsageRate: 76,
      },
      {
        segmentId: "seg_003",
        segmentName: "30代_中予算層",
        segmentType: "age_budget",
        mealGenerationSuccessRate: 88,
        cookingTimeReductionRate: 48,
        userSatisfactionScore: 82,
        proposalAdoptionRate: 75,
        repeatUsageRate: 70,
      },
    ];

    // 実行: 複数セグメント間の効果差を比較し、最高差別化効果セグメントを特定
    const result = identifyMaxDifferentiationSegment(segmentData);

    // 検証: 最高差別化効果セグメント（seg_002）が正確に特定されているか
    expect(result.maxDifferentiationSegmentId).toBe("seg_002");
    expect(result.maxDifferentiationSegmentName).toBe("40代_高予算層");

    // 検証: 差別化効果スコアの計算が正確か
    // 差別化効果スコア = (成功率 * 0.25) + (調理時間短縮率 * 0.25) + (満足度 * 0.3) + (採用率 * 0.1) + (リピート率 * 0.1)
    // seg_001: (85*0.25) + (42*0.25) + (78*0.3) + (72*0.1) + (65*0.1) = 21.25 + 10.5 + 23.4 + 7.2 + 6.5 = 68.85
    // seg_002: (92*0.25) + (55*0.25) + (88*0.3) + (81*0.1) + (76*0.1) = 23 + 13.75 + 26.4 + 8.1 + 7.6 = 78.85
    // seg_003: (88*0.25) + (48*0.25) + (82*0.3) + (75*0.1) + (70*0.1) = 22 + 12 + 24.6 + 7.5 + 7 = 73.1
    expect(result.differentiationScores).toEqual({
      seg_001: 68.85,
      seg_002: 78.85,
      seg_003: 73.1,
    });

    // 検証: セグメント間の効果差が正確に計算されているか
    // 最高スコア(seg_002: 78.85) vs 次点(seg_003: 73.1) = 5.75ポイント差
    // 最高スコア(seg_002: 78.85) vs 最低(seg_001: 68.85) = 10ポイント差
    expect(result.maxMinusSecondDifferential).toBe(5.75);
    expect(result.maxMinusMinDifferential).toBe(10);

    // 検証: 各セグメントの効果指標がレポートに正確に反映されているか
    expect(result.segmentEffectReport).toContainEqual({
      segmentId: "seg_002",
      segmentName: "40代_高予算層",
      mealGenerationSuccessRate: 92,
      cookingTimeReductionRate: 55,
      userSatisfactionScore: 88,
      proposalAdoptionRate: 81,
      repeatUsageRate: 76,
      differentiationScore: 78.85,
      isMaxDifferentiation: true,
    });

    expect(result.segmentEffectReport).toContainEqual({
      segmentId: "seg_001",
      segmentName: "20代_低予算層",
      mealGenerationSuccessRate: 85,
      cookingTimeReductionRate: 42,
      userSatisfactionScore: 78,
      proposalAdoptionRate: 72,
      repeatUsageRate: 65,
      differentiationScore: 68.85,
      isMaxDifferentiation: false,
    });

    expect(result.segmentEffectReport).toContainEqual({
      segmentId: "seg_003",
      segmentName: "30代_中予算層",
      mealGenerationSuccessRate: 88,
      cookingTimeReductionRate: 48,
      userSatisfactionScore: 82,
      proposalAdoptionRate: 75,
      repeatUsageRate: 70,
      differentiationScore: 73.1,
      isMaxDifferentiation: false,
    });

    // 検証: セグメント効果レポートの一貫性
    expect(result.segmentEffectReport.length).toBe(3);
    expect(result.segmentEffectReport[0].isMaxDifferentiation).toBe(true); // 最高効果セグメント

    // 検証: レポートのランキング順序（差別化効果スコアの降順）
    const scoreSequence = result.segmentEffectReport.map(
      (seg: { differentiationScore: number }) => seg.differentiationScore
    );
    expect(scoreSequence).toEqual([78.85, 73.1, 68.85]);

    // 検証: 分析結果メタデータ
    expect(result.analysisTimestamp).toBeDefined();
    expect(result.analysisTimestamp).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
    );
    expect(result.totalSegmentsAnalyzed).toBe(3);
    expect(result.analysisCompletionStatus).toBe("completed");
  });
});