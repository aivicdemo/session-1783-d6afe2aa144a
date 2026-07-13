import { describe, test, expect } from "@jest/globals";
import {
  calculateMonthlyAnalysisCycleSchedule,
  validateCutoffDateConsistency,
  aggregateDataByCutoffDate,
  getNextCycleStartDate,
} from "../../src/logic/it-1-br-2-1-1-1";

describe("Monthly analysis cycle scheduling with custom cutoff date", () => {
  // SCEN-445
  test("should calculate monthly analysis cycle schedule based on specified cutoff date instead of month-end date", () => {
    // Precondition: User logged in to nutrition management dashboard
    // and opened monthly analysis cycle settings screen
    const userId = "user_001";
    const cutoffDate = 20; // Custom cutoff date (not month-end 31)
    const monthlyAnalysisStartDate = new Date("2024-02-21T00:00:00Z"); // Day after cutoff
    const previousMonthDataStartDate = new Date("2024-01-21T00:00:00Z");
    const previousMonthDataEndDate = new Date("2024-02-20T23:59:59Z");

    // Action: Save schedule with cutoff date = 20
    const scheduleConfig = {
      userId,
      cutoffDate,
      cycleType: "monthly" as const,
      effectiveFromMonth: new Date("2024-02-01T00:00:00Z"),
    };

    // Verify: System calculates schedule based on cutoff date (20), not month-end (31)
    const calculatedSchedule = calculateMonthlyAnalysisCycleSchedule(
      scheduleConfig
    );

    expect(calculatedSchedule.cutoffDate).toBe(20);
    expect(calculatedSchedule.cycleName).toBe("2024-02");
    expect(new Date(calculatedSchedule.dataCollectionEndDate)).toEqual(
      previousMonthDataEndDate
    );
    expect(new Date(calculatedSchedule.dataCollectionStartDate)).toEqual(
      previousMonthDataStartDate
    );

    // Verify: Next cycle start date is set to cutoff date + 1
    const nextCycleStartDate = getNextCycleStartDate(
      new Date("2024-02-20T23:59:59Z"),
      20
    );
    expect(nextCycleStartDate).toEqual(monthlyAnalysisStartDate);

    // Verify: Previous month data is aggregated only up to cutoff date (2024-02-20)
    const aggregatedData = aggregateDataByCutoffDate({
      userId,
      startDate: new Date("2024-01-21T00:00:00Z"),
      endDate: new Date("2024-02-20T23:59:59Z"),
      cutoffDate: 20,
    });

    expect(aggregatedData.periodStart).toEqual(
      new Date("2024-01-21T00:00:00Z")
    );
    expect(aggregatedData.periodEnd).toEqual(
      new Date("2024-02-20T23:59:59Z")
    );
    expect(aggregatedData.dataPoints).toBeGreaterThanOrEqual(0);

    // Verify: Multiple months follow same cutoff date rule consistently
    const marchSchedule = calculateMonthlyAnalysisCycleSchedule({
      userId,
      cutoffDate,
      cycleType: "monthly" as const,
      effectiveFromMonth: new Date("2024-03-01T00:00:00Z"),
    });

    expect(marchSchedule.cutoffDate).toBe(20);
    expect(
      new Date(marchSchedule.dataCollectionEndDate).getDate()
    ).toEqual(20);

    const aprilSchedule = calculateMonthlyAnalysisCycleSchedule({
      userId,
      cutoffDate,
      cycleType: "monthly" as const,
      effectiveFromMonth: new Date("2024-04-01T00:00:00Z"),
    });

    expect(aprilSchedule.cutoffDate).toBe(20);
    expect(
      new Date(aprilSchedule.dataCollectionEndDate).getDate()
    ).toEqual(20);

    // Verify: Cutoff date consistency across all calculated schedules
    const isConsistent = validateCutoffDateConsistency([
      calculatedSchedule,
      marchSchedule,
      aprilSchedule,
    ]);

    expect(isConsistent).toBe(true);
  });
});