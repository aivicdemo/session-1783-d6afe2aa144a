import { determineDemandAnalysisTiming } from "../../src/logic/it-2";

describe("Family Member Meal Evaluation Data Accumulation and Management", () => {
  test("SCEN-523: Monthly analysis timing is correctly determined at 09:00 on the first day of each month", () => {
    // Arrange: Set system time to the first day of the month at 09:00
    const monthlyTimingDate = new Date("2024-02-01T09:00:00Z");

    // Act: Execute the analysis timing determination function
    const result = determineDemandAnalysisTiming(monthlyTimingDate);

    // Assert: Verify that monthly analysis flag is true
    expect(result.isMonthlyAnalysisTiming).toBe(true);

    // Assert: Verify that analysis type is 'monthly'
    expect(result.analysisType).toBe("monthly");

    // Assert: Verify that scheduled analysis execution date/time is correctly recorded
    expect(result.scheduledAnalysisDateTime).toEqual(
      new Date("2024-02-01T09:00:00Z")
    );

    // Assert: Verify that weekly analysis flag is false (since this is monthly timing)
    expect(result.isWeeklyAnalysisTiming).toBe(false);
  });
});