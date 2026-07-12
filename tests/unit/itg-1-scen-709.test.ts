import { extractDashboardDataset } from "../../src/logic/it-3";

describe("食事評価データを献立生成ロジックに反映させる機能", () => {
  // SCEN-709: [normal] 品質検証済みデータ抽出機能 - 品質検証をパスしたセグメント別行動指標のみがダッシュボード表示用データセットとして抽出される
  test("品質検証をパスしたセグメント別行動指標のみがダッシュボード表示用データセットとして抽出される", () => {
    const inputSegmentMetrics = [
      {
        segmentId: "seg_001",
        segmentName: "年代30代_家族4人_制限あり",
        mealGenerationSuccessRate: 87.5,
        cookingTimeReductionDegree: 92.3,
        userSatisfactionScore: 8.2,
        qualityValidationStatus: "passed",
        validationTimestamp: "2024-01-15T10:30:00Z",
      },
      {
        segmentId: "seg_002",
        segmentName: "年代40代_家族3人_制限なし",
        mealGenerationSuccessRate: 76.0,
        cookingTimeReductionDegree: 85.5,
        userSatisfactionScore: 7.5,
        qualityValidationStatus: "failed",
        validationTimestamp: "2024-01-15T10:25:00Z",
      },
      {
        segmentId: "seg_003",
        segmentName: "年代50代_家族2人_制限あり",
        mealGenerationSuccessRate: 91.2,
        cookingTimeReductionDegree: 88.7,
        userSatisfactionScore: 8.9,
        qualityValidationStatus: "passed",
        validationTimestamp: "2024-01-15T10:35:00Z",
      },
      {
        segmentId: "seg_004",
        segmentName: "年代20代_家族5人_制限あり",
        mealGenerationSuccessRate: 65.3,
        cookingTimeReductionDegree: 72.1,
        userSatisfactionScore: 6.8,
        qualityValidationStatus: "unvalidated",
        validationTimestamp: null,
      },
      {
        segmentId: "seg_005",
        segmentName: "年代35代_家族3人_制限なし",
        mealGenerationSuccessRate: 84.6,
        cookingTimeReductionDegree: 90.2,
        userSatisfactionScore: 8.1,
        qualityValidationStatus: "passed",
        validationTimestamp: "2024-01-15T10:40:00Z",
      },
    ];

    const result = extractDashboardDataset(inputSegmentMetrics);

    expect(result).toEqual({
      totalInputRecords: 5,
      passedValidationRecords: 3,
      failedValidationRecords: 1,
      unvalidatedRecords: 1,
      dashboardDataset: [
        {
          segmentId: "seg_001",
          segmentName: "年代30代_家族4人_制限あり",
          mealGenerationSuccessRate: 87.5,
          cookingTimeReductionDegree: 92.3,
          userSatisfactionScore: 8.2,
          qualityValidationStatus: "passed",
          validationTimestamp: "2024-01-15T10:30:00Z",
        },
        {
          segmentId: "seg_003",
          segmentName: "年代50代_家族2人_制限あり",
          mealGenerationSuccessRate: 91.2,
          cookingTimeReductionDegree: 88.7,
          userSatisfactionScore: 8.9,
          qualityValidationStatus: "passed",
          validationTimestamp: "2024-01-15T10:35:00Z",
        },
        {
          segmentId: "seg_005",
          segmentName: "年代35代_家族3人_制限なし",
          mealGenerationSuccessRate: 84.6,
          cookingTimeReductionDegree: 90.2,
          userSatisfactionScore: 8.1,
          qualityValidationStatus: "passed",
          validationTimestamp: "2024-01-15T10:40:00Z",
        },
      ],
      extractedAt: "2024-01-15T11:00:00Z",
    });

    expect(result.dashboardDataset.length).toBe(3);
    expect(result.dashboardDataset.every((record) => record.qualityValidationStatus === "passed")).toBe(true);
    expect(result.dashboardDataset.every((record) => record.validationTimestamp !== null)).toBe(true);
    expect(result.dashboardDataset.some((record) => record.qualityValidationStatus === "failed")).toBe(false);
    expect(result.dashboardDataset.some((record) => record.qualityValidationStatus === "unvalidated")).toBe(false);
  });
});