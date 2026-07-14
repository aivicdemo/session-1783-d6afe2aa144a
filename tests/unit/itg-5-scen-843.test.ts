import {
  validateMenuRuleChanges,
} from "../../src/logic/it-7-2-1";

describe("Menu Rule Change Integrity Validation", () => {
  test("SCEN-843: Automated consistency validation when updated rule specification is reflected in menu generation logic", () => {
    // Input: Previous rule specification (before update)
    const previousRuleSpec = {
      ruleVersionId: "RULE-v1.0",
      effectiveDate: "2024-01-01T00:00:00Z",
      nutritionStandards: {
        calories: { min: 1800, max: 2200 },
        protein: { min: 50, max: 100 },
        fat: { min: 50, max: 80 },
        carbohydrates: { min: 200, max: 300 },
      },
      seasonalPriority: {
        spring: ["spinach", "bamboo_shoot", "pea"],
        summer: ["cucumber", "eggplant", "tomato"],
        autumn: ["sweet_potato", "mushroom", "chestnut"],
        winter: ["cabbage", "radish", "carrot"],
      },
      discountThreshold: 0.15,
      updatedAt: "2024-01-01T00:00:00Z",
    };

    // Input: Updated rule specification (new rules)
    const updatedRuleSpec = {
      ruleVersionId: "RULE-v1.1",
      effectiveDate: "2024-02-01T00:00:00Z",
      nutritionStandards: {
        calories: { min: 1900, max: 2300 },
        protein: { min: 60, max: 110 },
        fat: { min: 45, max: 75 },
        carbohydrates: { min: 210, max: 310 },
      },
      seasonalPriority: {
        spring: ["spinach", "bamboo_shoot", "pea", "spring_onion"],
        summer: ["cucumber", "eggplant", "tomato", "okra"],
        autumn: ["sweet_potato", "mushroom", "chestnut", "ginkgo"],
        winter: ["cabbage", "radish", "carrot", "daikon_radish"],
      },
      discountThreshold: 0.2,
      updatedAt: "2024-02-01T00:00:00Z",
    };

    // Input: Past menu proposals generated under previous rule
    const pastMenuProposals = [
      {
        menuProposalId: "MENU-001",
        generatedAt: "2024-01-15T10:00:00Z",
        ruleVersionApplied: "RULE-v1.0",
        nutrients: {
          calories: 2050,
          protein: 75,
          fat: 65,
          carbohydrates: 250,
        },
        selectedIngredients: [
          "chicken_breast",
          "spinach",
          "brown_rice",
          "olive_oil",
        ],
        userRejectionReason: null,
      },
      {
        menuProposalId: "MENU-002",
        generatedAt: "2024-01-18T11:30:00Z",
        ruleVersionApplied: "RULE-v1.0",
        nutrients: {
          calories: 1950,
          protein: 65,
          fat: 58,
          carbohydrates: 260,
        },
        selectedIngredients: [
          "salmon",
          "broccoli",
          "white_rice",
          "butter",
        ],
        userRejectionReason: null,
      },
    ];

    // Input: Family meal evaluation data
    const familyMealEvaluations = [
      {
        menuProposalId: "MENU-001",
        evaluationDate: "2024-01-16T19:00:00Z",
        satisfactionScore: 8.5,
        completionRate: 0.95,
        feedback: "Very satisfied with nutrition balance",
        familyMemberId: "FAMILY-001",
      },
      {
        menuProposalId: "MENU-002",
        evaluationDate: "2024-01-19T19:30:00Z",
        satisfactionScore: 7.8,
        completionRate: 0.88,
        feedback: "Good protein content",
        familyMemberId: "FAMILY-001",
      },
    ];

    // Execute: Run automated validation
    const validationResult = validateMenuRuleChanges({
      previousRuleSpec,
      updatedRuleSpec,
      pastMenuProposals,
      familyMealEvaluations,
    });

    // Assert: Verify that updated rule spec is correctly loaded
    expect(validationResult.ruleSpecStatus).toBe("loaded");
    expect(validationResult.updatedRuleVersionId).toBe("RULE-v1.1");

    // Assert: Verify contradiction detection with past menu proposals
    expect(validationResult.contradictionCheck.status).toBe("completed");
    expect(validationResult.contradictionCheck.contradictionsFound).toBe(0);
    expect(validationResult.contradictionCheck.totalProposalsChecked).toBe(2);
    expect(validationResult.contradictionCheck.passedProposals).toEqual([
      "MENU-001",
      "MENU-002",
    ]);

    // Assert: Verify nutrition standard compliance
    expect(validationResult.nutritionComplianceCheck.status).toBe("completed");
    expect(validationResult.nutritionComplianceCheck.violationsDetected).toBe(
      0
    );
    expect(validationResult.nutritionComplianceCheck.checkedProposals).toBe(2);

    // Assert: Verify compliance details for each menu proposal
    expect(
      validationResult.nutritionComplianceCheck.proposalCompliance
    ).toEqual([
      {
        menuProposalId: "MENU-001",
        compliant: true,
        violations: [],
      },
      {
        menuProposalId: "MENU-002",
        compliant: true,
        violations: [],
      },
    ]);

    // Assert: Verify family meal evaluation consistency
    expect(validationResult.evaluationConsistencyCheck.status).toBe(
      "completed"
    );
    expect(validationResult.evaluationConsistencyCheck.inconsistenciesFound).toBe(
      0
    );
    expect(
      validationResult.evaluationConsistencyCheck.evaluatedMenuProposals
    ).toBe(2);

    // Assert: Verify evaluation consistency details
    expect(
      validationResult.evaluationConsistencyCheck.consistencyDetails
    ).toEqual([
      {
        menuProposalId: "MENU-001",
        evaluatedAt: "2024-01-16T19:00:00Z",
        satisfactionScore: 8.5,
        ruleCompliance: true,
        remark: null,
      },
      {
        menuProposalId: "MENU-002",
        evaluatedAt: "2024-01-19T19:30:00Z",
        satisfactionScore: 7.8,
        ruleCompliance: true,
        remark: null,
      },
    ]);

    // Assert: Verify validation report generation
    expect(validationResult.validationReport.status).toBe("generated");
    expect(validationResult.validationReport.totalValidationSteps).toBe(3);
    expect(validationResult.validationReport.completedSteps).toBe(3);
    expect(validationResult.validationReport.failedSteps).toBe(0);

    // Assert: Verify all validation steps completed successfully
    expect(validationResult.validationReport.validationStepResults).toEqual([
      {
        stepName: "contradiction_detection",
        status: "passed",
        duration: expect.any(Number),
      },
      {
        stepName: "nutrition_compliance",
        status: "passed",
        duration: expect.any(Number),
      },
      {
        stepName: "evaluation_consistency",
        status: "passed",
        duration: expect.any(Number),
      },
    ]);

    // Assert: Verify audit logging
    expect(validationResult.auditLog.ruleUpdateRecorded).toBe(true);
    expect(validationResult.auditLog.previousRuleVersionId).toBe("RULE-v1.0");
    expect(validationResult.auditLog.newRuleVersionId).toBe("RULE-v1.1");
    expect(validationResult.auditLog.validationInitiatedAt).toBeDefined();
    expect(validationResult.auditLog.validationCompletedAt).toBeDefined();

    // Assert: Verify overall validation result
    expect(validationResult.overallValidationResult).toBe("passed");
    expect(validationResult.hasIssues).toBe(false);
  });
});