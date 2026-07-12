import { anonymizeExpiredMealEvaluationData } from "../../src/logic/it-2";

describe("食事評価データ保持期間管理機能", () => {
  // SCEN-441
  test("保持期間ポリシーに基づいてデータを匿名化できる", () => {
    const retentionDays = 30;
    const currentDate = new Date("2024-02-15T10:00:00Z");

    const mealEvaluationData = [
      {
        id: "eval_001",
        userId: "user_123",
        userName: "太郎",
        mealId: "meal_A",
        satisfactionScore: 5,
        completionRate: 100,
        requestComment: "とても美味しかった",
        registeredAt: new Date("2024-01-01T09:00:00Z"),
      },
      {
        id: "eval_002",
        userId: "user_123",
        userName: "太郎",
        mealId: "meal_B",
        satisfactionScore: 4,
        completionRate: 80,
        requestComment: "次も食べたい",
        registeredAt: new Date("2024-01-20T14:00:00Z"),
      },
      {
        id: "eval_003",
        userId: "user_123",
        userName: "太郎",
        mealId: "meal_C",
        satisfactionScore: 3,
        completionRate: 60,
        requestComment: "塩辛かった",
        registeredAt: new Date("2024-02-10T11:30:00Z"),
      },
    ];

    const policy = {
      retentionDays: retentionDays,
      anonymizeExpiredData: true,
    };

    const result = anonymizeExpiredMealEvaluationData({
      evaluationData: mealEvaluationData,
      policy: policy,
      currentDate: currentDate,
    });

    expect(result.anonymized.length).toBe(2);

    const anonymizedEval001 = result.anonymized.find(
      (d: { id: string }) => d.id === "eval_001"
    );
    expect(anonymizedEval001.userId).toBe(null);
    expect(anonymizedEval001.userName).toBe(null);
    expect(anonymizedEval001.satisfactionScore).toBe(5);
    expect(anonymizedEval001.completionRate).toBe(100);
    expect(anonymizedEval001.requestComment).toBe("とても美味しかった");

    const anonymizedEval002 = result.anonymized.find(
      (d: { id: string }) => d.id === "eval_002"
    );
    expect(anonymizedEval002.userId).toBe(null);
    expect(anonymizedEval002.userName).toBe(null);
    expect(anonymizedEval002.satisfactionScore).toBe(4);
    expect(anonymizedEval002.completionRate).toBe(80);
    expect(anonymizedEval002.requestComment).toBe("次も食べたい");

    expect(result.retained.length).toBe(1);

    const retainedEval003 = result.retained.find(
      (d: { id: string }) => d.id === "eval_003"
    );
    expect(retainedEval003.userId).toBe("user_123");
    expect(retainedEval003.userName).toBe("太郎");
    expect(retainedEval003.satisfactionScore).toBe(3);
    expect(retainedEval003.completionRate).toBe(60);
    expect(retainedEval003.requestComment).toBe("塩辛かった");
  });
});