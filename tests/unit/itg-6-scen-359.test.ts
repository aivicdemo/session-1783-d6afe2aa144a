import { extractAndAggregateSegmentUsagePatterns } from "../../src/logic/it-1-br-8-2-2-1";

describe("機能別使用頻度・離脱ポイント自動抽出・分析機能", () => {
  // SCEN-359
  test("セグメント別利用パターンデータ抽出・集計機能 - セグメント分類基準に基づいて各セグメントの利用パターンデータが集計期間と粒度に基づいて抽出・集計される", () => {
    // セグメント分類基準の定義
    const segmentationCriteria = {
      ageGroup: ["20-30", "31-40", "41-50"],
      usageFrequency: ["high", "medium", "low"],
      purchaseAmount: ["high", "medium", "low"],
    };

    // セグメント定義
    const segments = [
      {
        segmentId: "seg_001",
        name: "高頻度利用者・高額購買",
        criteria: {
          ageGroup: "20-30",
          usageFrequency: "high",
          purchaseAmount: "high",
        },
      },
      {
        segmentId: "seg_002",
        name: "低頻度利用者",
        criteria: {
          ageGroup: "31-40",
          usageFrequency: "low",
          purchaseAmount: "medium",
        },
      },
      {
        segmentId: "seg_003",
        name: "高額購買者",
        criteria: {
          ageGroup: "41-50",
          usageFrequency: "medium",
          purchaseAmount: "high",
        },
      },
    ];

    // 利用ログデータ（入力）
    const usageLogData = [
      // seg_001 のユーザー
      {
        userId: "user_001",
        segmentId: "seg_001",
        date: "2024-01-01",
        usageCount: 5,
        avgUsageTimeMinutes: 45,
        purchaseCount: 3,
        purchaseAmountYen: 15000,
      },
      {
        userId: "user_002",
        segmentId: "seg_001",
        date: "2024-01-02",
        usageCount: 6,
        avgUsageTimeMinutes: 50,
        purchaseCount: 2,
        purchaseAmountYen: 12000,
      },
      {
        userId: "user_001",
        segmentId: "seg_001",
        date: "2024-01-03",
        usageCount: 4,
        avgUsageTimeMinutes: 40,
        purchaseCount: 2,
        purchaseAmountYen: 10000,
      },
      // seg_002 のユーザー
      {
        userId: "user_003",
        segmentId: "seg_002",
        date: "2024-01-01",
        usageCount: 1,
        avgUsageTimeMinutes: 15,
        purchaseCount: 0,
        purchaseAmountYen: 0,
      },
      {
        userId: "user_004",
        segmentId: "seg_002",
        date: "2024-01-02",
        usageCount: 1,
        avgUsageTimeMinutes: 10,
        purchaseCount: 1,
        purchaseAmountYen: 5000,
      },
      // seg_003 のユーザー
      {
        userId: "user_005",
        segmentId: "seg_003",
        date: "2024-01-01",
        usageCount: 3,
        avgUsageTimeMinutes: 35,
        purchaseCount: 4,
        purchaseAmountYen: 25000,
      },
      {
        userId: "user_005",
        segmentId: "seg_003",
        date: "2024-01-02",
        usageCount: 3,
        avgUsageTimeMinutes: 40,
        purchaseCount: 3,
        purchaseAmountYen: 20000,
      },
    ];

    // 集計期間と粒度
    const aggregationPeriod = {
      startDate: "2024-01-01",
      endDate: "2024-01-03",
      granularity: "daily", // daily, weekly, monthly
    };

    const aggregationLevel = "segment"; // user, segment, category

    // 関数実行
    const result = extractAndAggregateSegmentUsagePatterns({
      segmentationCriteria,
      segments,
      usageLogData,
      aggregationPeriod,
      aggregationLevel,
    });

    // 期待結果の検証
    expect(result).toBeDefined();
    expect(result.success).toBe(true);

    // セグメント数の確認
    expect(result.aggregatedData).toBeDefined();
    expect(result.aggregatedData.length).toBe(3);

    // seg_001 の検証
    const seg001 = result.aggregatedData.find(
      (s: any) => s.segmentId === "seg_001"
    );
    expect(seg001).toBeDefined();
    expect(seg001.segmentName).toBe("高頻度利用者・高額購買");
    expect(seg001.uniqueUserCount).toBe(2); // user_001, user_002
    expect(seg001.totalUsageCount).toBe(15); // 5+6+4
    expect(seg001.totalPurchaseCount).toBe(7); // 3+2+2
    expect(seg001.totalPurchaseAmountYen).toBe(37000); // 15000+12000+10000
    expect(seg001.avgUsageTimeMinutes).toBeCloseTo(45, 1); // (45+50+40)/3 ≈ 45

    // seg_002 の検証
    const seg002 = result.aggregatedData.find(
      (s: any) => s.segmentId === "seg_002"
    );
    expect(seg002).toBeDefined();
    expect(seg002.segmentName).toBe("低頻度利用者");
    expect(seg002.uniqueUserCount).toBe(2); // user_003, user_004
    expect(seg002.totalUsageCount).toBe(2); // 1+1
    expect(seg002.totalPurchaseCount).toBe(1); // 0+1
    expect(seg002.totalPurchaseAmountYen).toBe(5000); // 0+5000
    expect(seg002.avgUsageTimeMinutes).toBeCloseTo(12.5, 1); // (15+10)/2 = 12.5

    // seg_003 の検証
    const seg003 = result.aggregatedData.find(
      (s: any) => s.segmentId === "seg_003"
    );
    expect(seg003).toBeDefined();
    expect(seg003.segmentName).toBe("高額購買者");
    expect(seg003.uniqueUserCount).toBe(1); // user_005
    expect(seg003.totalUsageCount).toBe(6); // 3+3
    expect(seg003.totalPurchaseCount).toBe(7); // 4+3
    expect(seg003.totalPurchaseAmountYen).toBe(45000); // 25000+20000
    expect(seg003.avgUsageTimeMinutes).toBeCloseTo(37.5, 1); // (35+40)/2 = 37.5

    // 日別集計データの確認（granularity: daily）
    expect(result.dailyBreakdown).toBeDefined();
    expect(result.dailyBreakdown.length).toBeGreaterThan(0);

    // 重複・漏れがないことの確認
    const allDataPoints = result.dailyBreakdown.reduce(
      (sum: number, day: any) => {
        return (
          sum +
          day.segments.reduce(
            (segSum: number, seg: any) => segSum + seg.dataPointCount,
            0
          )
        );
      },
      0
    );
    expect(allDataPoints).toBe(usageLogData.length); // 入力データ数と一致

    // セグメント間での重複確認
    const userSegmentPairs = new Set<string>();
    result.dailyBreakdown.forEach((dayData: any) => {
      dayData.segments.forEach((segData: any) => {
        segData.users.forEach((userId: string) => {
          const pair = `${userId}_${segData.segmentId}`;
          expect(userSegmentPairs.has(pair)).toBe(false); // 同一ユーザー・セグメント組み合わせは1回のみ
          userSegmentPairs.add(pair);
        });
      });
    });

    // メタデータの確認
    expect(result.metadata).toBeDefined();
    expect(result.metadata.aggregationPeriod.startDate).toBe("2024-01-01");
    expect(result.metadata.aggregationPeriod.endDate).toBe("2024-01-03");
    expect(result.metadata.aggregationLevel).toBe("segment");
    expect(result.metadata.granularity).toBe("daily");
    expect(result.metadata.totalRecordsProcessed).toBe(usageLogData.length);
  });
});