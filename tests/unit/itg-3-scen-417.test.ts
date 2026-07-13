import { determineAnalysisTiming } from "../../src/logic/it-1-br-3-2-1";

describe("Purchase Records and Monthly Food Cost Reduction Analysis", () => {
  test("SCEN-417: Analysis timing determination - weekly analysis executes exactly once at Monday 09:00", () => {
    const base_monday = new Date("2024-01-08T00:00:00Z");

    // Pre-condition: Initialize system and mock current time
    const analysis_logs: Array<{ timestamp: string; analysis_type: string }> =
      [];

    // Step 1: Set system time to Monday 08:59
    const time_before_trigger = new Date("2024-01-08T08:59:00Z");
    const result_before = determineAnalysisTiming(
      time_before_trigger,
      analysis_logs
    );

    // Verify: Weekly analysis should NOT execute at 08:59
    expect(result_before.should_execute_weekly).toBe(false);
    expect(result_before.analysis_type).toBeNull();
    expect(analysis_logs).toHaveLength(0);

    // Step 2: Advance system time to Monday 09:00
    const time_at_trigger = new Date("2024-01-08T09:00:00Z");
    const result_at = determineAnalysisTiming(time_at_trigger, analysis_logs);

    // Verify: Weekly analysis should execute at 09:00
    expect(result_at.should_execute_weekly).toBe(true);
    expect(result_at.analysis_type).toBe("weekly");

    // Step 3: Log should be recorded with Monday 09:00 timestamp
    analysis_logs.push({
      timestamp: time_at_trigger.toISOString(),
      analysis_type: "weekly",
    });
    expect(analysis_logs).toHaveLength(1);
    expect(analysis_logs[0].timestamp).toBe("2024-01-08T09:00:00Z");
    expect(analysis_logs[0].analysis_type).toBe("weekly");

    // Step 4: Advance time to Monday 09:01
    const time_after_trigger = new Date("2024-01-08T09:01:00Z");
    const result_after = determineAnalysisTiming(
      time_after_trigger,
      analysis_logs
    );

    // Verify: No duplicate execution within same week
    expect(result_after.should_execute_weekly).toBe(false);
    expect(result_after.analysis_type).toBeNull();
    expect(analysis_logs).toHaveLength(1);

    // Step 5: Verify no re-trigger on same Monday
    const time_later_same_monday = new Date("2024-01-08T15:00:00Z");
    const result_later = determineAnalysisTiming(
      time_later_same_monday,
      analysis_logs
    );

    expect(result_later.should_execute_weekly).toBe(false);
    expect(analysis_logs).toHaveLength(1);

    // Step 6: Verify next Monday 09:00 would trigger again (different week)
    const next_monday = new Date("2024-01-15T09:00:00Z");
    const result_next_week = determineAnalysisTiming(
      next_monday,
      analysis_logs
    );

    expect(result_next_week.should_execute_weekly).toBe(true);
    expect(result_next_week.analysis_type).toBe("weekly");
  });
});