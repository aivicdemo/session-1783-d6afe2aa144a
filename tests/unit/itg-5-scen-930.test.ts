import { calculateCookingTimeReductionMetrics } from "../../src/logic/it-7-2-1";

describe("献立生成アルゴリズムの週次成功率・調理時間・満足度集計と改善前後比較", () => {
  test("SCEN-930: セグメント別調理時間短縮実現度分析 - 差分と達成度パーセンテージが正確に計算される", () => {
    // セグメント1: 目標60分、実績45分 → 差分15分、達成度25%
    const segment1Input = {
      segmentId: "seg_001",
      segmentName: "30代_2人家族_制限なし",
      targetCookingTimeMinutes: 60,
      actualCookingTimeMinutes: 45,
    };

    const segment1Result = calculateCookingTimeReductionMetrics(segment1Input);
    expect(segment1Result.timeDifferenceMinutes).toBe(15);
    expect(segment1Result.achievementPercentage).toBe(25);

    // セグメント2: 目標40分、実績40分 → 差分0分、達成度0%
    const segment2Input = {
      segmentId: "seg_002",
      segmentName: "40代_3人家族_アレルギーあり",
      targetCookingTimeMinutes: 40,
      actualCookingTimeMinutes: 40,
    };

    const segment2Result = calculateCookingTimeReductionMetrics(segment2Input);
    expect(segment2Result.timeDifferenceMinutes).toBe(0);
    expect(segment2Result.achievementPercentage).toBe(0);

    // セグメント3: 目標50分、実績30分 → 差分20分、達成度40%
    const segment3Input = {
      segmentId: "seg_003",
      segmentName: "50代_4人家族_栄養制限あり",
      targetCookingTimeMinutes: 50,
      actualCookingTimeMinutes: 30,
    };

    const segment3Result = calculateCookingTimeReductionMetrics(segment3Input);
    expect(segment3Result.timeDifferenceMinutes).toBe(20);
    expect(segment3Result.achievementPercentage).toBe(40);

    // セグメント4: 目標55分、実績55分 → 差分0分、達成度0%
    const segment4Input = {
      segmentId: "seg_004",
      segmentName: "35代_2人家族_調理時間制限",
      targetCookingTimeMinutes: 55,
      actualCookingTimeMinutes: 55,
    };

    const segment4Result = calculateCookingTimeReductionMetrics(segment4Input);
    expect(segment4Result.timeDifferenceMinutes).toBe(0);
    expect(segment4Result.achievementPercentage).toBe(0);

    // セグメント5: 目標100分、実績50分 → 差分50分、達成度50%
    const segment5Input = {
      segmentId: "seg_005",
      segmentName: "45代_5人家族_複数制限",
      targetCookingTimeMinutes: 100,
      actualCookingTimeMinutes: 50,
    };

    const segment5Result = calculateCookingTimeReductionMetrics(segment5Input);
    expect(segment5Result.timeDifferenceMinutes).toBe(50);
    expect(segment5Result.achievementPercentage).toBe(50);

    // 実績が目標を超過した場合: 目標30分、実績45分 → 達成度は100%以下（-50%）に制限
    const segment6Input = {
      segmentId: "seg_006",
      segmentName: "28代_1人世帯",
      targetCookingTimeMinutes: 30,
      actualCookingTimeMinutes: 45,
    };

    const segment6Result = calculateCookingTimeReductionMetrics(segment6Input);
    expect(segment6Result.timeDifferenceMinutes).toBe(-15);
    expect(segment6Result.achievementPercentage).toBeLessThanOrEqual(100);
    expect(segment6Result.achievementPercentage).toBeGreaterThanOrEqual(0);

    // 複数セグメントの一貫性検証: すべてのセグメントで達成度が0～100%範囲内
    const allSegments = [
      segment1Result,
      segment2Result,
      segment3Result,
      segment4Result,
      segment5Result,
      segment6Result,
    ];

    allSegments.forEach((segment) => {
      expect(segment.achievementPercentage).toBeGreaterThanOrEqual(0);
      expect(segment.achievementPercentage).toBeLessThanOrEqual(100);
      expect(typeof segment.timeDifferenceMinutes).toBe("number");
      expect(typeof segment.achievementPercentage).toBe("number");
    });

    // 計算式の整合性確認: 達成度 = (差分 / 目標) × 100
    const segment7Input = {
      segmentId: "seg_007",
      segmentName: "32代_2人家族_通常",
      targetCookingTimeMinutes: 80,
      actualCookingTimeMinutes: 20,
    };

    const segment7Result = calculateCookingTimeReductionMetrics(segment7Input);
    const expectedDifference = 80 - 20;
    const expectedAchievement = Math.min(
      100,
      Math.max(0, (expectedDifference / 80) * 100)
    );

    expect(segment7Result.timeDifferenceMinutes).toBe(expectedDifference);
    expect(segment7Result.achievementPercentage).toBe(expectedAchievement);
  });
});