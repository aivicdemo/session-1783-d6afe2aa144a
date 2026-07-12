import { accumulateFamilyMemberDishPreferences } from "../../src/logic/it-2";

describe("食事評価データの蓄積・管理機能", () => {
  // SCEN-358: [normal] 食事評価データ蓄積機能 - 家族成員ごと・料理ごとの嗜好パターンが献立生成ロジックに学習可能な形式で保持される
  test("家族成員ごと・料理ごとの嗜好パターンデータが構造化形式で蓄積・更新され、機械学習に利用可能な形式で保持される", () => {
    // 初期状態：家族成員A、Bと料理1～3を登録
    const familyMembers = [
      { id: "member_a", name: "成員A", age: 35 },
      { id: "member_b", name: "成員B", age: 32 },
    ];

    const dishes = [
      { id: "dish_1", name: "料理1" },
      { id: "dish_2", name: "料理2" },
      { id: "dish_3", name: "料理3" },
    ];

    // 第1回の食事評価：成員ごとに異なる5段階評価を入力
    const firstRoundEvaluations = [
      { memberId: "member_a", dishId: "dish_1", satisfactionScore: 5, completionDegree: 1.0, timestamp: "2024-01-15T19:00:00Z" },
      { memberId: "member_a", dishId: "dish_2", satisfactionScore: 3, completionDegree: 0.8, timestamp: "2024-01-15T19:00:00Z" },
      { memberId: "member_a", dishId: "dish_3", satisfactionScore: 4, completionDegree: 0.9, timestamp: "2024-01-15T19:00:00Z" },
      { memberId: "member_b", dishId: "dish_1", satisfactionScore: 2, completionDegree: 0.5, timestamp: "2024-01-15T19:00:00Z" },
      { memberId: "member_b", dishId: "dish_2", satisfactionScore: 4, completionDegree: 0.95, timestamp: "2024-01-15T19:00:00Z" },
      { memberId: "member_b", dishId: "dish_3", satisfactionScore: 3, completionDegree: 0.7, timestamp: "2024-01-15T19:00:00Z" },
    ];

    // 第1回の蓄積：成員ごと・料理ごとの嗜好パターンを構造化形式で保持
    let accumulatedPreferences = accumulateFamilyMemberDishPreferences({
      familyMembers,
      dishes,
      evaluations: firstRoundEvaluations,
      previousAccumulation: null,
    });

    // 確認1：成員Aは料理1を高く評価、成員Bは料理1を低く評価という相互に異なるパターンが構造化形式で保持されている
    expect(accumulatedPreferences).toEqual({
      memberDishPreferences: [
        {
          memberId: "member_a",
          memberName: "成員A",
          dishId: "dish_1",
          dishName: "料理1",
          evaluationCount: 1,
          averageSatisfactionScore: 5.0,
          normalizedSatisfactionScore: 1.0,
          averageCompletionDegree: 1.0,
          confidenceScore: 0.4,
          preferenceVector: { satisfaction: 1.0, completion: 1.0, consistency: 0.4 },
        },
        {
          memberId: "member_a",
          memberName: "成員A",
          dishId: "dish_2",
          dishName: "料理2",
          evaluationCount: 1,
          averageSatisfactionScore: 3.0,
          normalizedSatisfactionScore: 0.5,
          averageCompletionDegree: 0.8,
          confidenceScore: 0.4,
          preferenceVector: { satisfaction: 0.5, completion: 0.8, consistency: 0.4 },
        },
        {
          memberId: "member_a",
          memberName: "成員A",
          dishId: "dish_3",
          dishName: "料理3",
          evaluationCount: 1,
          averageSatisfactionScore: 4.0,
          normalizedSatisfactionScore: 0.75,
          averageCompletionDegree: 0.9,
          confidenceScore: 0.4,
          preferenceVector: { satisfaction: 0.75, completion: 0.9, consistency: 0.4 },
        },
        {
          memberId: "member_b",
          memberName: "成員B",
          dishId: "dish_1",
          dishName: "料理1",
          evaluationCount: 1,
          averageSatisfactionScore: 2.0,
          normalizedSatisfactionScore: 0.25,
          averageCompletionDegree: 0.5,
          confidenceScore: 0.4,
          preferenceVector: { satisfaction: 0.25, completion: 0.5, consistency: 0.4 },
        },
        {
          memberId: "member_b",
          memberName: "成員B",
          dishId: "dish_2",
          dishName: "料理2",
          evaluationCount: 1,
          averageSatisfactionScore: 4.0,
          normalizedSatisfactionScore: 0.75,
          averageCompletionDegree: 0.95,
          confidenceScore: 0.4,
          preferenceVector: { satisfaction: 0.75, completion: 0.95, consistency: 0.4 },
        },
        {
          memberId: "member_b",
          memberName: "成員B",
          dishId: "dish_3",
          dishName: "料理3",
          evaluationCount: 1,
          averageSatisfactionScore: 3.0,
          normalizedSatisfactionScore: 0.5,
          averageCompletionDegree: 0.7,
          confidenceScore: 0.4,
          preferenceVector: { satisfaction: 0.5, completion: 0.7, consistency: 0.4 },
        },
      ],
      memberPreferenceProfiles: [
        {
          memberId: "member_a",
          memberName: "成員A",
          preferredDishes: ["dish_1", "dish_3", "dish_2"],
          dislikedDishes: [],
          topPreferenceScore: 1.0,
          averagePreferenceScore: 0.75,
          evaluationCountByMember: 3,
        },
        {
          memberId: "member_b",
          memberName: "成員B",
          preferredDishes: ["dish_2", "dish_3", "dish_1"],
          dislikedDishes: [],
          topPreferenceScore: 0.75,
          averagePreferenceScore: 0.5,
          evaluationCountByMember: 3,
        },
      ],
      aggregatedMetrics: {
        totalEvaluations: 6,
        uniqueMemberCount: 2,
        uniqueDishCount: 3,
        lastUpdatedAt: "2024-01-15T19:00:00Z",
        dataQualityScore: 1.0,
      },
    });

    // 確認2：蓄積されたデータから献立生成ロジック対応のベクトル形式で抽出可能
    const learningFormat = accumulatedPreferences.memberDishPreferences.map(
      (pref) => ({
        memberId: pref.memberId,
        dishId: pref.dishId,
        preferenceVector: pref.preferenceVector,
        confidence: pref.confidenceScore,
      })
    );

    expect(learningFormat).toEqual([
      {
        memberId: "member_a",
        dishId: "dish_1",
        preferenceVector: { satisfaction: 1.0, completion: 1.0, consistency: 0.4 },
        confidence: 0.4,
      },
      {
        memberId: "member_a",
        dishId: "dish_2",
        preferenceVector: { satisfaction: 0.5, completion: 0.8, consistency: 0.4 },
        confidence: 0.4,
      },
      {
        memberId: "member_a",
        dishId: "dish_3",
        preferenceVector: { satisfaction: 0.75, completion: 0.9, consistency: 0.4 },
        confidence: 0.4,
      },
      {
        memberId: "member_b",
        dishId: "dish_1",
        preferenceVector: { satisfaction: 0.25, completion: 0.5, consistency: 0.4 },
        confidence: 0.4,
      },
      {
        memberId: "member_b",
        dishId: "dish_2",
        preferenceVector: { satisfaction: 0.75, completion: 0.95, consistency: 0.4 },
        confidence: 0.4,
      },
      {
        memberId: "member_b",
        dishId: "dish_3",
        preferenceVector: { satisfaction: 0.5, completion: 0.7, consistency: 0.4 },
        confidence: 0.4,
      },
    ]);

    // 第2回の食事評価：複数回の評価を追加入力
    const secondRoundEvaluations = [
      { memberId: "member_a", dishId: "dish_1", satisfactionScore: 5, completionDegree: 1.0, timestamp: "2024-01-22T19:00:00Z" },
      { memberId: "member_a", dishId: "dish_2", satisfactionScore: 4, completionDegree: 0.85, timestamp: "2024-01-22T19:00:00Z" },
      { memberId: "member_b", dishId: "dish_1", satisfactionScore: 2, completionDegree: 0.6, timestamp: "2024-01-22T19:00:00Z" },
      { memberId: "member_b", dishId: "dish_2", satisfactionScore: 5, completionDegree: 1.0, timestamp: "2024-01-22T19:00:00Z" },
    ];

    const allEvaluations = [...firstRoundEvaluations, ...secondRoundEvaluations];

    // 第2回の蓄積：嗜好パターンデータが累積・更新され、信頼度が向上
    accumulatedPreferences = accumulateFamilyMemberDishPreferences({
      familyMembers,
      dishes,
      evaluations: allEvaluations,
      previousAccumulation: accumulatedPreferences,
    });

    // 確認3：複数回の評価により、成員ごと・料理ごとのパターンが累積・更新され、信頼度が向上している
    const member_a_dish_1_updated = accumulatedPreferences.memberDishPreferences.find(
      (pref) => pref.memberId === "member_a" && pref.dishId === "dish_1"
    );
    expect(member_a_dish_1_updated).toEqual({
      memberId: "member_a",
      memberName: "成員A",
      dishId: "dish_1",
      dishName: "料理1",
      evaluationCount: 2,
      averageSatisfactionScore: 5.0,
      normalizedSatisfactionScore: 1.0,
      averageCompletionDegree: 1.0,
      confidenceScore: 0.6,
      preferenceVector: { satisfaction: 1.0, completion: 1.0, consistency: 0.6 },
    });

    const member_b_dish_1_updated = accumulatedPreferences.memberDishPreferences.find(
      (pref) => pref.memberId === "member_b" && pref.dishId === "dish_1"
    );
    expect(member_b_dish_1_updated).toEqual({
      memberId: "member_b",
      memberName: "成員B",
      dishId: "dish_1",
      dishName: "料理1",
      evaluationCount: 2,
      averageSatisfactionScore: 2.0,
      normalizedSatisfactionScore: 0.25,
      averageCompletionDegree: 0.55,
      confidenceScore: 0.6,
      preferenceVector: { satisfaction: 0.25, completion: 0.55, consistency: 0.6 },
    });

    // 確認4：成員Aは料理1を一貫して高く評価、成員Bは一貫して低く評価という相互に異なるパターンが維持される
    const member_a_profile = accumulatedPreferences.memberPreferenceProfiles.find(
      (prof) => prof.memberId === "member_a"
    );
    expect(member_a_profile?.topPreferenceScore).toBe(1.0);

    const member_b_profile = accumulatedPreferences.memberPreferenceProfiles.find(
      (prof) => prof.memberId === "member_b"
    );
    expect(member_b_profile?.preferredDishes[0]).toBe("dish_2");

    // 確認5：集計メトリクスが正しく更新される
    expect(accumulatedPreferences.aggregatedMetrics).toEqual({
      totalEvaluations: 10,
      uniqueMemberCount: 2,
      uniqueDishCount: 3,
      lastUpdatedAt: "2024-01-22T19:00:00Z",
      dataQualityScore: 1.0,
    });

    // 確認6：学習可能な形式が保持され、成員ごとに異なるパターンが区別される
    const memberADishPreferences = accumulatedPreferences.memberDishPreferences.filter(
      (pref) => pref.memberId === "member_a"
    );
    const memberBDishPreferences = accumulatedPreferences.memberDishPreferences.filter(
      (pref) => pref.memberId === "member_b"
    );

    expect(memberADishPreferences.length).toBe(3);
    expect(memberBDishPreferences.length).toBe(3);

    // 成員Aと成員Bの料理1に対する嗜好が相互に異なることを確認
    const aPrefersDish1 = memberADishPreferences.find((pref) => pref.dishId === "dish_1");
    const bPrefersDish1 = memberBDishPreferences.find((pref) => pref.dishId === "dish_1");
    expect(aPrefersDish1?.normalizedSatisfactionScore).toBeGreaterThan(
      bPrefersDish1?.normalizedSatisfactionScore || 0
    );
  });
});