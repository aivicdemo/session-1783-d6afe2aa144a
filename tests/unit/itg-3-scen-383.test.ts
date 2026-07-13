import { analyzeSegmentStatisticalReliability } from "../../src/logic/it-1";

describe("月次食費実績の超過要因分析機能", () => {
  // SCEN-383
  test("セグメント内のサンプルサイズが極小（1～2件）の場合に統計的信頼度が正しく判定される", () => {
    // セグメントA: n=1
    const segmentAData = {
      segmentId: "seg_001",
      segmentName: "専業主夫_30代_子2人",
      samples: [
        {
          userId: "user_a1",
          foodExpense: 50000,
          nutritionScore: 85,
          satisfactionScore: 4.5,
        },
      ],
    };

    const resultSegmentA = analyzeSegmentStatisticalReliability(segmentAData);

    expect(resultSegmentA.sampleSize).toBe(1);
    expect(resultSegmentA.reliabilityLevel).toBe("insufficient");
    expect(resultSegmentA.confidenceScore).toBe(0);
    expect(resultSegmentA.warningMessage).toMatch(/サンプルサイズが不足/);
    expect(resultSegmentA.canUseForAnalysis).toBe(false);

    // セグメントB: n=2
    const segmentBData = {
      segmentId: "seg_002",
      segmentName: "共働き配偶者_35代_子1人",
      samples: [
        {
          userId: "user_b1",
          foodExpense: 55000,
          nutritionScore: 80,
          satisfactionScore: 4.0,
        },
        {
          userId: "user_b2",
          foodExpense: 60000,
          nutritionScore: 82,
          satisfactionScore: 4.2,
        },
      ],
    };

    const resultSegmentB = analyzeSegmentStatisticalReliability(segmentBData);

    expect(resultSegmentB.sampleSize).toBe(2);
    expect(resultSegmentB.reliabilityLevel).toBe("insufficient");
    expect(resultSegmentB.confidenceScore).toBe(0);
    expect(resultSegmentB.warningMessage).toMatch(/統計的信頼度が低い/);
    expect(resultSegmentB.canUseForAnalysis).toBe(false);

    // 分析結果レポート検証
    const reportSegmentA = {
      segmentId: resultSegmentA.segmentId,
      sampleSize: resultSegmentA.sampleSize,
      reliabilityLevel: resultSegmentA.reliabilityLevel,
      note: `極小サンプルサイズ(n=${resultSegmentA.sampleSize})のため信頼度が不十分です`,
    };

    expect(reportSegmentA.sampleSize).toBe(1);
    expect(reportSegmentA.reliabilityLevel).toBe("insufficient");
    expect(reportSegmentA.note).toMatch(/極小サンプルサイズ/);

    const reportSegmentB = {
      segmentId: resultSegmentB.segmentId,
      sampleSize: resultSegmentB.sampleSize,
      reliabilityLevel: resultSegmentB.reliabilityLevel,
      note: `極小サンプルサイズ(n=${resultSegmentB.sampleSize})のため信頼度が不十分です`,
    };

    expect(reportSegmentB.sampleSize).toBe(2);
    expect(reportSegmentB.reliabilityLevel).toBe("insufficient");
    expect(reportSegmentB.note).toMatch(/極小サンプルサイズ/);

    // 警告メッセージ表示確認
    expect(resultSegmentA.warningMessage).toContain("不足");
    expect(resultSegmentB.warningMessage).toContain("低い");
  });
});