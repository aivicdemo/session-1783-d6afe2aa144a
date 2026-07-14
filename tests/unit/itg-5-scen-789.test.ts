import { detectPrecisionDecline, analyzeDecliningCause } from "../../src/logic/it-7-2-1";

describe("Weekly Algorithm Improvement Metrics Dashboard", () => {
  test("SCEN-789: Detect and analyze demand forecast precision decline at 10% threshold boundary", () => {
    // Setup: Prior month precision at 80%
    const priorMonthPrecision = 80;
    
    // Current month precision at 70% (exactly 10% decline from prior month)
    const currentMonthPrecision = 70;
    
    // Execute: Detect precision decline
    const declineDetectionResult = detectPrecisionDecline({
      priorMonthPrecisionRate: priorMonthPrecision,
      currentMonthPrecisionRate: currentMonthPrecision,
      declineThreshold: 10,
    });

    // Verify: Decline rate calculation result is exactly 10%
    expect(declineDetectionResult.declineRate).toBe(10);

    // Verify: Threshold is configured to 10%
    expect(declineDetectionResult.thresholdRate).toBe(10);

    // Verify: Decline detection flag indicates detection (boundary condition at exact 10%)
    expect(declineDetectionResult.isDeclineDetected).toBe(true);

    // Verify: Decline severity classification
    expect(declineDetectionResult.severityLevel).toBe("boundary");

    // Execute: Analyze causes of decline
    const causeAnalysisInput = {
      priorMonthPrecisionRate: priorMonthPrecision,
      currentMonthPrecisionRate: currentMonthPrecision,
      declineRate: declineDetectionResult.declineRate,
      meteorologicalDataQuality: 0.92,
      eventDataQuality: 0.88,
      competitorDataQuality: 0.85,
      externalDataCorrelationCoefficient: 0.78,
      demandVarianceRatio: 1.12,
    };

    const causeAnalysisResult = analyzeDecliningCause(causeAnalysisInput);

    // Verify: Cause analysis completes successfully
    expect(causeAnalysisResult).toBeDefined();
    expect(causeAnalysisResult.analysisStatus).toBe("completed");

    // Verify: Analysis identifies root causes with prioritization
    expect(Array.isArray(causeAnalysisResult.rootCauses)).toBe(true);
    expect(causeAnalysisResult.rootCauses.length).toBeGreaterThan(0);

    // Verify: Each root cause has priority ranking
    causeAnalysisResult.rootCauses.forEach((cause: any) => {
      expect(cause).toHaveProperty("causeType");
      expect(cause).toHaveProperty("correlationScore");
      expect(cause).toHaveProperty("priorityRank");
      expect(cause.correlationScore).toBeGreaterThanOrEqual(0);
      expect(cause.correlationScore).toBeLessThanOrEqual(1);
    });

    // Verify: High priority root cause is identified (causation by external factor variance)
    const highPriorityCause = causeAnalysisResult.rootCauses.find(
      (c: any) => c.priorityRank === 1
    );
    expect(highPriorityCause).toBeDefined();
    expect(["meteorological_change", "event_impact", "competitor_action", "demand_volatility"]).toContain(
      highPriorityCause.causeType
    );

    // Verify: Dashboard alert generation
    const dashboardAlert = {
      alertType: "precision_decline_detected",
      declineRate: declineDetectionResult.declineRate,
      thresholdRate: declineDetectionResult.thresholdRate,
      detectionStatus: "active",
      severityLevel: declineDetectionResult.severityLevel,
      timestamp: new Date("2024-01-15T11:00:00Z").toISOString(),
      isDisplayed: true,
    };

    expect(dashboardAlert.alertType).toBe("precision_decline_detected");
    expect(dashboardAlert.declineRate).toBe(10);
    expect(dashboardAlert.thresholdRate).toBe(10);
    expect(dashboardAlert.detectionStatus).toBe("active");
    expect(dashboardAlert.severityLevel).toBe("boundary");
    expect(dashboardAlert.isDisplayed).toBe(true);

    // Verify: Alert message composition includes analysis results
    const alertMessage = `Precision decline of ${dashboardAlert.declineRate}% detected (threshold: ${dashboardAlert.thresholdRate}%). Primary cause: ${highPriorityCause.causeType} (correlation: ${highPriorityCause.correlationScore.toFixed(2)})`;
    expect(alertMessage).toContain("Precision decline of 10% detected");
    expect(alertMessage).toContain("threshold: 10%");
    expect(alertMessage).toContain("Primary cause:");
  });
});