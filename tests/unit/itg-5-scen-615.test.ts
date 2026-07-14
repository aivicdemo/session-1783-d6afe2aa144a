import { describe, test, expect, beforeEach } from "@jest/globals";
import {
  calculateAlgorithmComparisonMetrics,
  generateValidationListWithWarnings,
} from "../../src/logic/it-7-2-1";

describe("IT-7-2-1: Algorithm Improvement Quantitative Comparison and Priority Assignment", () => {
  // SCEN-615: [edge] 複数改善案の定量比較・優先度付け機能 - 改善案が1件のみの場合、比較対象なしとして検証リストに警告フラグが付される

  test("SCEN-615: Single improvement proposal should generate validation list with no-comparison warning flag", () => {
    // Precondition: User is logged in and project is created
    const projectId = "proj-2024-001";
    const userId = "user-househusband-001";

    // Single improvement proposal (only 1 item, no comparison pairs)
    const improvementProposals = [
      {
        proposalId: "proposal-001",
        algorithmVersionId: "algo-v2-001",
        proposalName: "栄養バランス計算式改善",
        businessValue: 85,
        technicalDifficulty: 60,
        userImpactScore: 75,
        implementationDaysEstimate: 8,
        expectedAccuracyImprovement: 4.5,
        expectedSatisfactionImprovement: 0.3,
      },
    ];

    // Execute quantitative comparison and priority assignment
    const comparisonMetrics = calculateAlgorithmComparisonMetrics(
      improvementProposals
    );

    // Generate validation list with warnings
    const validationList = generateValidationListWithWarnings(
      projectId,
      userId,
      improvementProposals,
      comparisonMetrics
    );

    // Assertions
    // 1. Validation list should be returned (not error)
    expect(validationList).toBeDefined();
    expect(typeof validationList).toBe("object");

    // 2. Validation list should contain the single proposal
    expect(validationList.proposals).toHaveLength(1);
    expect(validationList.proposals[0].proposalId).toBe("proposal-001");

    // 3. Warning flag should be set to true
    expect(validationList.proposals[0].hasWarning).toBe(true);
    expect(validationList.proposals[0].warningFlag).toBe(true);

    // 4. Warning message should indicate no comparison target
    expect(validationList.proposals[0].warningMessage).toMatch(/比較対象/);
    expect(validationList.proposals[0].warningMessage).toMatch(/ありません/);

    // 5. Warning type should be NO_COMPARISON_TARGET
    expect(validationList.proposals[0].warningType).toBe(
      "NO_COMPARISON_TARGET"
    );

    // 6. Overall validation list status should be WARNING (not ERROR)
    expect(validationList.status).toBe("WARNING");

    // 7. Comparison metrics should reflect single proposal state
    expect(comparisonMetrics.totalProposalCount).toBe(1);
    expect(comparisonMetrics.comparisonPairCount).toBe(0);
    expect(comparisonMetrics.canPerformComparison).toBe(false);

    // 8. Proposal should retain original properties (no modification due to warning)
    expect(validationList.proposals[0].businessValue).toBe(85);
    expect(validationList.proposals[0].technicalDifficulty).toBe(60);
    expect(validationList.proposals[0].userImpactScore).toBe(75);

    // 9. Warning message should be specific about single proposal scenario
    expect(validationList.proposals[0].warningMessage).toMatch(
      /1件のみ|複数の比較が必要|最低2件/i
    );

    // 10. System should not throw error and should complete normally
    expect(validationList.errorStatus).toBe(false);
    expect(validationList.isProcessedSuccessfully).toBe(true);

    // 11. Priority calculation should still be available but marked as incomplete
    expect(validationList.proposals[0].priorityScore).toBeDefined();
    expect(
      validationList.proposals[0].priorityAssignmentComplete
    ).toBeFalsy();

    // 12. Display flag should indicate warning state for UI rendering
    expect(validationList.proposals[0].shouldDisplayWarningIcon).toBe(true);
  });
});