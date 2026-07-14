import { generateWeeklyReport } from "../../src/logic/it-7-2-1";

describe("週次集計・ダッシュボード機能", () => {
  // SCEN-593
  test("過去データが存在しない場合、前週比較が不可能であることを適切に通知できる", () => {
    const currentWeekData = {
      weekStartDate: "2024-01-15",
      weekEndDate: "2024-01-21",
      mealPlanGenerationSuccessRate: 92,
      cookingTimeShorteningDegree: 15,
      userSatisfactionScore: 8.5,
      completionRate: 88,
      rejectionRate: 8,
    };

    const previousWeekData = null;

    const result = generateWeeklyReport({
      currentWeekData,
      previousWeekData,
    });

    expect(result.status).toBe("success");
    expect(result.reportData.currentWeek).toEqual({
      weekStartDate: "2024-01-15",
      weekEndDate: "2024-01-21",
      mealPlanGenerationSuccessRate: 92,
      cookingTimeShorteningDegree: 15,
      userSatisfactionScore: 8.5,
      completionRate: 88,
      rejectionRate: 8,
    });

    expect(result.reportData.comparisonSection).toEqual({
      isComparable: false,
      message: "前週のデータが存在しないため比較できません",
      reason: "初回レポート生成またはデータ欠落",
    });

    expect(result.reportData.comparisonMetrics).toBeNull();

    expect(result.reportData.statussByMetric).toEqual({
      mealPlanGenerationSuccessRate: {
        value: 92,
        status: "active",
        comparison: null,
      },
      cookingTimeShorteningDegree: {
        value: 15,
        status: "active",
        comparison: null,
      },
      userSatisfactionScore: {
        value: 8.5,
        status: "active",
        comparison: null,
      },
      completionRate: {
        value: 88,
        status: "active",
        comparison: null,
      },
      rejectionRate: {
        value: 8,
        status: "active",
        comparison: null,
      },
    });

    expect(result.uiElements.comparisonSectionDisabled).toBe(true);
    expect(result.uiElements.comparisonSectionVisible).toBe(false);
    expect(result.uiElements.notificationMessage).toBe(
      "前週のデータが存在しないため比較できません"
    );
    expect(result.uiElements.notificationSeverity).toBe("info");
  });
});