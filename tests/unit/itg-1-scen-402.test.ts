import { detectAndClassifyMenuRejectReasons } from "../../src/logic/it-1-br-4-2-1";

describe("食事制限条件の変更時に過去献立との抵触検出機能", () => {
  // SCEN-402
  test("ユーザーが献立案を却下・修正した際、離脱ポイントと入力パターンからペイン要因が自動分類される", () => {
    const userRejectionsAndModifications = [
      {
        menuId: "menu_001",
        actionType: "reject",
        reason: "栄養バランスが悪い",
        timestamp: "2024-01-15T10:30:00Z",
        detailsProvided: true,
      },
      {
        menuId: "menu_002",
        actionType: "modify",
        reason: "カロリーが高すぎる",
        timestamp: "2024-01-15T10:45:00Z",
        detailsProvided: true,
      },
    ];

    const result = detectAndClassifyMenuRejectReasons(
      userRejectionsAndModifications
    );

    expect(result).toEqual({
      classifiedPainFactors: [
        {
          detectionSource: "reject",
          originalReason: "栄養バランスが悪い",
          classifiedCategory: "栄養バランス",
          painFactorId: "pain_nutrition_balance",
          frequency: 1,
          priority: "high",
        },
        {
          detectionSource: "modify",
          originalReason: "カロリーが高すぎる",
          classifiedCategory: "カロリー管理",
          painFactorId: "pain_calorie_control",
          frequency: 1,
          priority: "high",
        },
      ],
      priorityMatrix: {
        highFrequency_highImpact: [
          {
            painFactorId: "pain_nutrition_balance",
            categoryName: "栄養バランス",
            occurrenceCount: 1,
            impactScore: 85,
            userSegmentAffected: "専業主夫層",
          },
          {
            painFactorId: "pain_calorie_control",
            categoryName: "カロリー管理",
            occurrenceCount: 1,
            impactScore: 80,
            userSegmentAffected: "専業主夫層",
          },
        ],
        mediumFrequency_highImpact: [],
        highFrequency_lowImpact: [],
        lowFrequency_lowImpact: [],
      },
      detectionSummary: {
        totalRejectionsCount: 1,
        totalModificationsCount: 1,
        totalClassifiedPainFactors: 2,
        analysisTimestamp: "2024-01-15T10:45:00Z",
        dataQualityScore: 1.0,
      },
    });

    expect(result.classifiedPainFactors).toHaveLength(2);
    expect(result.classifiedPainFactors[0].classifiedCategory).toBe(
      "栄養バランス"
    );
    expect(result.classifiedPainFactors[1].classifiedCategory).toBe(
      "カロリー管理"
    );
    expect(
      result.priorityMatrix.highFrequency_highImpact
    ).toHaveLength(2);
    expect(result.detectionSummary.totalClassifiedPainFactors).toBe(2);
    expect(result.detectionSummary.dataQualityScore).toBe(1.0);
  });
});