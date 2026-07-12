import { compareSegmentCookingTimeReduction } from "../../src/logic/it-2";

describe("家族成員の食事評価データの蓄積・管理機能", () => {
  // SCEN-686
  test("調理時間短縮実現度セグメント別比較機能 - セグメント別の調理時間データが欠損している場合にエラーが返される", () => {
    const segments = [
      {
        segmentId: "seg_001",
        segmentName: "20代_小家族",
        targetCookingMinutes: 30,
        actualCookingMinutes: 28,
      },
      {
        segmentId: "seg_002",
        segmentName: "30代_中家族",
        targetCookingMinutes: 45,
        actualCookingMinutes: null,
      },
      {
        segmentId: "seg_003",
        segmentName: "40代_大家族",
        targetCookingMinutes: 60,
        actualCookingMinutes: 55,
      },
    ];

    const errorResult = (() => {
      try {
        return compareSegmentCookingTimeReduction({
          segments,
          comparisonPeriodStartDate: "2024-01-01",
          comparisonPeriodEndDate: "2024-01-31",
        });
      } catch (error) {
        return error;
      }
    })();

    expect(() =>
      compareSegmentCookingTimeReduction({
        segments,
        comparisonPeriodStartDate: "2024-01-01",
        comparisonPeriodEndDate: "2024-01-31",
      })
    ).toThrow(/調理時間データ/);

    const segmentWithoutTarget = [
      {
        segmentId: "seg_004",
        segmentName: "50代_単身",
        targetCookingMinutes: null,
        actualCookingMinutes: 25,
      },
      {
        segmentId: "seg_005",
        segmentName: "20代_夫婦",
        targetCookingMinutes: 35,
        actualCookingMinutes: 32,
      },
    ];

    expect(() =>
      compareSegmentCookingTimeReduction({
        segments: segmentWithoutTarget,
        comparisonPeriodStartDate: "2024-02-01",
        comparisonPeriodEndDate: "2024-02-28",
      })
    ).toThrow(/目標値/);

    const emptySegments: typeof segments = [];

    expect(() =>
      compareSegmentCookingTimeReduction({
        segments: emptySegments,
        comparisonPeriodStartDate: "2024-03-01",
        comparisonPeriodEndDate: "2024-03-31",
      })
    ).toThrow(/セグメント/);

    const validSegments = [
      {
        segmentId: "seg_006",
        segmentName: "30代_小家族",
        targetCookingMinutes: 40,
        actualCookingMinutes: 35,
      },
      {
        segmentId: "seg_007",
        segmentName: "40代_中家族",
        targetCookingMinutes: 50,
        actualCookingMinutes: 47,
      },
    ];

    const result = compareSegmentCookingTimeReduction({
      segments: validSegments,
      comparisonPeriodStartDate: "2024-01-01",
      comparisonPeriodEndDate: "2024-01-31",
    });

    expect(result).toEqual({
      success: true,
      comparisonResults: [
        {
          segmentId: "seg_006",
          segmentName: "30代_小家族",
          targetCookingMinutes: 40,
          actualCookingMinutes: 35,
          reductionMinutes: 5,
          reductionPercentage: 12.5,
        },
        {
          segmentId: "seg_007",
          segmentName: "40代_中家族",
          targetCookingMinutes: 50,
          actualCookingMinutes: 47,
          reductionMinutes: 3,
          reductionPercentage: 6,
        },
      ],
      comparisonPeriod: {
        startDate: "2024-01-01",
        endDate: "2024-01-31",
      },
    });

    const partialDataSegments = [
      {
        segmentId: "seg_008",
        segmentName: "25歳_新婚",
        targetCookingMinutes: 30,
        actualCookingMinutes: 28,
      },
      {
        segmentId: "seg_009",
        segmentName: "35歳_子供1人",
        targetCookingMinutes: 45,
        actualCookingMinutes: undefined,
      },
    ];

    expect(() =>
      compareSegmentCookingTimeReduction({
        segments: partialDataSegments,
        comparisonPeriodStartDate: "2024-04-01",
        comparisonPeriodEndDate: "2024-04-30",
      })
    ).toThrow(/調理時間/);
  });
});