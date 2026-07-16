import {
  generateImprovementProposal,
} from "../../src/logic/it-8-1-1-1";

describe("Improvement Proposal Generation - Comprehensive KPI and Impact Analysis", () => {
  // SCEN-215
  test("should generate improvement proposal document with implementation estimate, expected effects, and KPI contribution accurately", () => {
    // Arrange: Test data - user pain analysis results and KPI contribution data
    const painAnalysisResults = {
      painFactorId: "pf_001",
      painCategoryName: "cooking_time_constraint",
      occurrenceFrequency: 87,
      impactDegree: 95,
      affectedUserSegments: ["stay_at_home_fathers_30s", "stay_at_home_fathers_40s"],
      relatedConstraintTypes: ["cooking_time", "meal_preference"],
    };

    const kpiContributionData = {
      kpiMetricId: "kpi_001",
      metricName: "meal_generation_success_rate",
      currentValue: 72,
      targetValue: 85,
      improvementPotential: 13,
      userImpactScore: 8.5,
    };

    const competitiveDifferentiationData = {
      competitorAlignmentGap: 35,
      differentiationPotential: "high",
      marketRelevanceScore: 9.2,
    };

    const implementationEstimateData = {
      estimateId: "est_001",
      effortHours: 120,
      riskLevel: "medium",
      technicalComplexityScore: 7,
      estimatedDeliveryDays: 14,
    };

    const expectedImpactData = {
      impactMetrics: {
        successRateImprovement: 13,
        cookingTimeReductionMinutes: 15,
        userSatisfactionScoreImprovement: 2.8,
        estimatedAdoptionRate: 0.68,
      },
      timelineToRealization: "within_4_weeks",
      affectedUserCount: 12500,
    };

    // Act: Execute improvement proposal generation
    const generatedProposal = generateImprovementProposal({
      painAnalysis: painAnalysisResults,
      kpiContribution: kpiContributionData,
      competitiveDifferentiation: competitiveDifferentiationData,
      implementationEstimate: implementationEstimateData,
      expectedImpact: expectedImpactData,
      proposalTimestamp: new Date("2024-01-15T11:00:00Z"),
    });

    // Assert: Verify proposal document structure
    expect(generatedProposal).toBeDefined();
    expect(generatedProposal).toHaveProperty("proposalId");
    expect(generatedProposal).toHaveProperty("documentTitle");
    expect(generatedProposal).toHaveProperty("createdAt");

    // Assert: Verify implementation estimate section
    expect(generatedProposal).toHaveProperty("implementationEstimate");
    expect(generatedProposal.implementationEstimate).toEqual({
      effortHours: 120,
      riskLevel: "medium",
      technicalComplexityScore: 7,
      estimatedDeliveryDays: 14,
      estimateId: "est_001",
    });

    // Assert: Verify expected effects section
    expect(generatedProposal).toHaveProperty("expectedEffects");
    expect(generatedProposal.expectedEffects).toEqual({
      successRateImprovement: 13,
      cookingTimeReductionMinutes: 15,
      userSatisfactionScoreImprovement: 2.8,
      estimatedAdoptionRate: 0.68,
      timelineToRealization: "within_4_weeks",
      affectedUserCount: 12500,
    });

    // Assert: Verify KPI contribution section
    expect(generatedProposal).toHaveProperty("kpiContribution");
    expect(generatedProposal.kpiContribution).toEqual({
      metricName: "meal_generation_success_rate",
      currentValue: 72,
      targetValue: 85,
      improvementPotential: 13,
      userImpactScore: 8.5,
      kpiContributionScore: 110.5, // (85 - 72) + 8.5 + (9.2 * 10) structured formula
    });

    // Assert: Verify pain analysis integration
    expect(generatedProposal).toHaveProperty("painAnalysisSummary");
    expect(generatedProposal.painAnalysisSummary).toEqual({
      painCategoryName: "cooking_time_constraint",
      occurrenceFrequency: 87,
      impactDegree: 95,
      affectedUserSegments: ["stay_at_home_fathers_30s", "stay_at_home_fathers_40s"],
    });

    // Assert: Verify competitive differentiation
    expect(generatedProposal).toHaveProperty("competitiveDifferentiation");
    expect(generatedProposal.competitiveDifferentiation).toEqual({
      competitorAlignmentGap: 35,
      differentiationPotential: "high",
      marketRelevanceScore: 9.2,
    });

    // Assert: Verify input data consistency
    expect(generatedProposal.implementationEstimate.effortHours).toBe(120);
    expect(generatedProposal.expectedEffects.successRateImprovement).toBe(13);
    expect(generatedProposal.kpiContribution.currentValue).toBe(72);
    expect(generatedProposal.kpiContribution.targetValue).toBe(85);
    expect(generatedProposal.expectedEffects.cookingTimeReductionMinutes).toBe(15);
    expect(generatedProposal.expectedEffects.affectedUserCount).toBe(12500);

    // Assert: Verify document format specifications
    expect(generatedProposal.documentTitle).toMatch(/improvement.proposal/i);
    expect(generatedProposal.createdAt).toEqual(new Date("2024-01-15T11:00:00Z"));
    expect(generatedProposal.proposalId).toMatch(/^prop_/);

    // Assert: Verify all required sections are present
    const requiredSections = [
      "proposalId",
      "documentTitle",
      "createdAt",
      "implementationEstimate",
      "expectedEffects",
      "kpiContribution",
      "painAnalysisSummary",
      "competitiveDifferentiation",
    ];
    requiredSections.forEach((section) => {
      expect(Object.keys(generatedProposal)).toContain(section);
    });

    // Assert: Verify proposal was generated successfully
    expect(generatedProposal.proposalId).toBeDefined();
    expect(generatedProposal.proposalId.length).toBeGreaterThan(0);
    expect(typeof generatedProposal.implementationEstimate.effortHours).toBe("number");
    expect(typeof generatedProposal.expectedEffects.successRateImprovement).toBe(
      "number"
    );
    expect(typeof generatedProposal.kpiContribution.userImpactScore).toBe("number");
  });
});