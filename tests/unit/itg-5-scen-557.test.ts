import { aggregateWeeklyMetrics } from "../../src/logic/it-7-2-1";

describe("IT-7-2-1: 週次行動指標集計と改善前後効果比較", () => {
  // SCEN-557: 同一料理に対する複数の異なる評価データが、家族成員ごとに正しく区別されて蓄積される
  test("should correctly segregate and accumulate distinct meal ratings by family member, updating preference profiles independently", () => {
    // テストデータ準備：同一料理（カレーライス）に対する複数の異なる評価データ
    const mealName = "カレーライス";
    const mealId = "meal-curry-001";

    const memberA = {
      memberId: "member-a-001",
      memberName: "Aさん",
      age: 35,
      gender: "male",
    };

    const memberB = {
      memberId: "member-b-002",
      memberName: "Bさん",
      age: 32,
      gender: "female",
    };

    const memberC = {
      memberId: "member-c-003",
      memberName: "Cさん",
      age: 8,
      gender: "male",
    };

    // 家族成員A、B、Cのユーザーコンテキストを初期化
    const evaluationRecords = [
      {
        memberId: memberA.memberId,
        mealId: mealId,
        mealName: mealName,
        evaluationScore: 5,
        completionRate: 100,
        mealDate: "2024-01-08",
        timestamp: "2024-01-08T19:30:00Z",
      },
      {
        memberId: memberB.memberId,
        mealId: mealId,
        mealName: mealName,
        evaluationScore: 2,
        completionRate: 60,
        mealDate: "2024-01-08",
        timestamp: "2024-01-08T19:45:00Z",
      },
      {
        memberId: memberC.memberId,
        mealId: mealId,
        mealName: mealName,
        evaluationScore: 4,
        completionRate: 95,
        mealDate: "2024-01-08",
        timestamp: "2024-01-08T20:00:00Z",
      },
    ];

    // 週次データ集計を実行：同一料理に対する複数評価データ
    const aggregationInput = {
      evaluations: evaluationRecords,
      weekStartDate: "2024-01-08",
      weekEndDate: "2024-01-14",
    };

    const result = aggregateWeeklyMetrics(aggregationInput);

    // 各家族成員ごとの評価データが正しく分離・区別されているか確認
    expect(result.memberEvaluationProfiles).toBeDefined();
    expect(result.memberEvaluationProfiles.length).toBe(3);

    // 家族成員Aのプロフィール検証：評価スコア5（美味しい）
    const memberAProfile = result.memberEvaluationProfiles.find(
      (p) => p.memberId === memberA.memberId
    );
    expect(memberAProfile).toBeDefined();
    expect(memberAProfile.memberId).toBe(memberA.memberId);
    expect(memberAProfile.mealEvaluations).toBeDefined();

    const memberAMealEval = memberAProfile.mealEvaluations.find(
      (m) => m.mealId === mealId
    );
    expect(memberAMealEval).toBeDefined();
    expect(memberAMealEval.evaluationScore).toBe(5);
    expect(memberAMealEval.completionRate).toBe(100);
    expect(memberAMealEval.evaluationCount).toBe(1);

    // 家族成員Bのプロフィール検証：評価スコア2（美味しくない）
    const memberBProfile = result.memberEvaluationProfiles.find(
      (p) => p.memberId === memberB.memberId
    );
    expect(memberBProfile).toBeDefined();
    expect(memberBProfile.memberId).toBe(memberB.memberId);

    const memberBMealEval = memberBProfile.mealEvaluations.find(
      (m) => m.mealId === mealId
    );
    expect(memberBMealEval).toBeDefined();
    expect(memberBMealEval.evaluationScore).toBe(2);
    expect(memberBMealEval.completionRate).toBe(60);
    expect(memberBMealEval.evaluationCount).toBe(1);

    // 家族成員Cのプロフィール検証：評価スコア4（まあまあ）
    const memberCProfile = result.memberEvaluationProfiles.find(
      (p) => p.memberId === memberC.memberId
    );
    expect(memberCProfile).toBeDefined();
    expect(memberCProfile.memberId).toBe(memberC.memberId);

    const memberCMealEval = memberCProfile.mealEvaluations.find(
      (m) => m.mealId === mealId
    );
    expect(memberCMealEval).toBeDefined();
    expect(memberCMealEval.evaluationScore).toBe(4);
    expect(memberCMealEval.completionRate).toBe(95);
    expect(memberCMealEval.evaluationCount).toBe(1);

    // 各成員の評価データが独立して管理されていることを確認
    expect(memberAMealEval.evaluationScore).not.toBe(
      memberBMealEval.evaluationScore
    );
    expect(memberBMealEval.evaluationScore).not.toBe(
      memberCMealEval.evaluationScore
    );
    expect(memberAMealEval.evaluationScore).not.toBe(
      memberCMealEval.evaluationScore
    );

    // 嗜好学習エンジンが各成員の個別プロフィールを正しく更新しているか検証
    expect(result.preferenceProfiles).toBeDefined();
    expect(result.preferenceProfiles.length).toBe(3);

    // 家族成員Aの推奨メニューにおけるカレーライスの順位確認
    const memberAPreference = result.preferenceProfiles.find(
      (p) => p.memberId === memberA.memberId
    );
    expect(memberAPreference).toBeDefined();
    expect(memberAPreference.recommendedMeals).toBeDefined();

    const memberACarryRank = memberAPreference.recommendedMeals.findIndex(
      (m) => m.mealId === mealId
    );
    expect(memberACarryRank).toBeGreaterThanOrEqual(0);
    expect(memberACarryRank).toBeLessThanOrEqual(2);

    // 家族成員Bの推奨メニューにおけるカレーライスの順位確認：低順位
    const memberBPreference = result.preferenceProfiles.find(
      (p) => p.memberId === memberB.memberId
    );
    expect(memberBPreference).toBeDefined();
    expect(memberBPreference.recommendedMeals).toBeDefined();

    const memberBCarryRank = memberBPreference.recommendedMeals.findIndex(
      (m) => m.mealId === mealId
    );
    expect(memberBCarryRank).toBeGreaterThanOrEqual(0);

    // 家族成員Aと家族成員Bのカレーライスの推奨順位が異なることを確認
    expect(memberACarryRank).not.toBe(memberBCarryRank);

    // 家族成員Cの推奨メニューにおけるカレーライスの順位確認：中程度
    const memberCPreference = result.preferenceProfiles.find(
      (p) => p.memberId === memberC.memberId
    );
    expect(memberCPreference).toBeDefined();
    expect(memberCPreference.recommendedMeals).toBeDefined();

    const memberCCarryRank = memberCPreference.recommendedMeals.findIndex(
      (m) => m.mealId === mealId
    );
    expect(memberCCarryRank).toBeGreaterThanOrEqual(0);

    // 集計結果の整合性確認：全体的な週次メトリクス
    expect(result.weeklyMetrics).toBeDefined();
    expect(result.weeklyMetrics.totalEvaluationRecords).toBe(3);
    expect(result.weeklyMetrics.averageEvaluationScore).toBe(
      (5 + 2 + 4) / 3
    );
    expect(result.weeklyMetrics.averageCompletionRate).toBe(
      (100 + 60 + 95) / 3
    );

    // 成員ごとの統計情報検証
    expect(result.memberStatistics).toBeDefined();
    expect(result.memberStatistics.length).toBe(3);

    const memberAStats = result.memberStatistics.find(
      (s) => s.memberId === memberA.memberId
    );
    expect(memberAStats.averageEvaluationScore).toBe(5);
    expect(memberAStats.evaluationRecordCount).toBe(1);

    const memberBStats = result.memberStatistics.find(
      (s) => s.memberId === memberB.memberId
    );
    expect(memberBStats.averageEvaluationScore).toBe(2);
    expect(memberBStats.evaluationRecordCount).toBe(1);

    const memberCStats = result.memberStatistics.find(
      (s) => s.memberId === memberC.memberId
    );
    expect(memberCStats.averageEvaluationScore).toBe(4);
    expect(memberCStats.evaluationRecordCount).toBe(1);

    // 最終確認：結果オブジェクトの構造と完全性
    expect(result).toHaveProperty("memberEvaluationProfiles");
    expect(result).toHaveProperty("preferenceProfiles");
    expect(result).toHaveProperty("weeklyMetrics");
    expect(result).toHaveProperty("memberStatistics");
    expect(result.timestamp).toBeDefined();
    expect(result.weekPeriod.startDate).toBe("2024-01-08");
    expect(result.weekPeriod.endDate).toBe("2024-01-14");
  });
});