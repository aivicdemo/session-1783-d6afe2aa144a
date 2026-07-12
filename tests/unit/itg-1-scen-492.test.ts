import { generateMealPlanWithDefaultSegment } from "../../src/logic/it-1-1-1";

describe("段階的アルゴリズム展開と効果検証 - デフォルトセグメント配信", () => {
  test("SCEN-492: 段階的ロールアウト対象ユーザーセグメントが指定されていない場合、デフォルトセグメントに配信される", () => {
    const algorithmConfig = {
      algorithmVersionId: "algo_v2_improved",
      versionName: "献立生成アルゴリズム v2.0（改善版）",
      targetSegments: [],
      deploymentStrategy: "staged_rollout",
      defaultSegmentId: "DEFAULT_SEGMENT",
      isActive: true,
      createdAt: new Date("2024-01-15T09:00:00Z"),
    };

    const testUsers = [
      {
        userId: "user_001",
        familyId: "family_001",
        age: 42,
        householdSize: 4,
        dietaryRestrictions: [],
        allergies: [],
        segmentAssignment: null,
      },
      {
        userId: "user_002",
        familyId: "family_002",
        age: 38,
        householdSize: 3,
        dietaryRestrictions: ["vegetarian"],
        allergies: ["peanut"],
        segmentAssignment: null,
      },
      {
        userId: "user_003",
        familyId: "family_003",
        age: 45,
        householdSize: 5,
        dietaryRestrictions: [],
        allergies: ["shellfish", "egg"],
        segmentAssignment: null,
      },
    ];

    const familyMealHistory = [
      {
        mealId: "meal_001",
        userId: "user_001",
        date: new Date("2024-01-08T19:00:00Z"),
        rating: 4,
        completionRate: 95,
        feedback: "美味しかった",
      },
      {
        mealId: "meal_002",
        userId: "user_002",
        date: new Date("2024-01-09T18:30:00Z"),
        rating: 3,
        completionRate: 80,
        feedback: "普通",
      },
      {
        mealId: "meal_003",
        userId: "user_003",
        date: new Date("2024-01-10T19:15:00Z"),
        rating: 5,
        completionRate: 100,
        feedback: "家族全員大好き",
      },
    ];

    const mealPlanGenerationRequests = [
      {
        requestId: "req_gen_001",
        userId: "user_001",
        timestamp: new Date("2024-01-15T10:00:00Z"),
        requestType: "manual",
      },
      {
        requestId: "req_gen_002",
        userId: "user_002",
        timestamp: new Date("2024-01-15T10:05:00Z"),
        requestType: "manual",
      },
      {
        requestId: "req_gen_003",
        userId: "user_003",
        timestamp: new Date("2024-01-15T10:10:00Z"),
        requestType: "manual",
      },
    ];

    const generationResults = generateMealPlanWithDefaultSegment(
      algorithmConfig,
      testUsers,
      familyMealHistory,
      mealPlanGenerationRequests
    );

    expect(generationResults).toBeDefined();
    expect(generationResults.processedCount).toBe(3);
    expect(generationResults.successCount).toBe(3);
    expect(generationResults.errorCount).toBe(0);

    expect(generationResults.mealPlans).toHaveLength(3);

    generationResults.mealPlans.forEach((mealPlan) => {
      expect(mealPlan.appliedAlgorithmVersionId).toBe("algo_v2_improved");
      expect(mealPlan.appliedSegmentId).toBe("DEFAULT_SEGMENT");
      expect(mealPlan.segmentWasExplicitlyAssigned).toBe(false);
      expect(mealPlan.generatedDishes).toBeDefined();
      expect(Array.isArray(mealPlan.generatedDishes)).toBe(true);
    });

    const user001Result = generationResults.mealPlans.find(
      (mp) => mp.userId === "user_001"
    );
    expect(user001Result).toBeDefined();
    expect(user001Result?.appliedSegmentId).toBe("DEFAULT_SEGMENT");
    expect(user001Result?.appliedAlgorithmVersionId).toBe("algo_v2_improved");

    const user002Result = generationResults.mealPlans.find(
      (mp) => mp.userId === "user_002"
    );
    expect(user002Result).toBeDefined();
    expect(user002Result?.appliedSegmentId).toBe("DEFAULT_SEGMENT");
    expect(user002Result?.appliedAlgorithmVersionId).toBe("algo_v2_improved");

    const user003Result = generationResults.mealPlans.find(
      (mp) => mp.userId === "user_003"
    );
    expect(user003Result).toBeDefined();
    expect(user003Result?.appliedSegmentId).toBe("DEFAULT_SEGMENT");
    expect(user003Result?.appliedAlgorithmVersionId).toBe("algo_v2_improved");

    expect(generationResults.executionLog).toBeDefined();
    expect(Array.isArray(generationResults.executionLog)).toBe(true);
    expect(generationResults.executionLog.length).toBeGreaterThan(0);

    const defaultSegmentLogs = generationResults.executionLog.filter(
      (log) => log.appliedSegmentId === "DEFAULT_SEGMENT"
    );
    expect(defaultSegmentLogs.length).toBe(3);

    defaultSegmentLogs.forEach((log) => {
      expect(log.algorithmVersionId).toBe("algo_v2_improved");
      expect(log.status).toBe("success");
      expect(log.timestamp).toBeDefined();
      expect(log.mealGeneratedSuccessfully).toBe(true);
    });

    const consistencyCheck = generationResults.mealPlans.every(
      (mp) => mp.appliedSegmentId === "DEFAULT_SEGMENT"
    );
    expect(consistencyCheck).toBe(true);

    expect(generationResults.deploymentMetrics).toBeDefined();
    expect(generationResults.deploymentMetrics.totalUsersProcessed).toBe(3);
    expect(generationResults.deploymentMetrics.usersAssignedToDefaultSegment).toBe(
      3
    );
    expect(
      generationResults.deploymentMetrics.usersAssignedToTargetedSegments
    ).toBe(0);
  });
});