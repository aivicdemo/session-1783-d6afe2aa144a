import { determineNextAlgorithmPriority } from "../../src/logic/it-1-br-2-1-1-1";

describe("アルゴリズム改善成功判定・次優先度決定", () => {
  test("SCEN-592: 改善目標値に到達した場合に次の改善優先度が根拠付けて決定される", () => {
    // 前提: 改善成功判定の条件
    // - 改善前の成功率: 72%
    // - 改善後の成功率: 85%
    // - 改善目標値: 80%（到達済み）
    // - 調理時間短縮度: 15分短縮（目標: 12分以上）
    // - ユーザー満足度スコア: 78点/100（目標: 75点以上）

    const improvementMetrics = {
      algorithmId: "algo_v2_3",
      algorithmVersion: "2.3",
      successRateBeforeImprovement: 72,
      successRateAfterImprovement: 85,
      successRateTargetThreshold: 80,
      cookingTimeShorteningMinutes: 15,
      cookingTimeTargetMinutes: 12,
      userSatisfactionScoreBefore: 68,
      userSatisfactionScoreAfter: 78,
      userSatisfactionScoreTarget: 75,
      improvementHistoryCount: 3,
      evaluationMetricsCount: 5,
      previousPriorityRank: 2,
      analysisDate: "2024-01-15T11:00:00Z",
    };

    // 前回の改善優先度リスト（ランク付け）
    const previousPriorityList = [
      {
        algorithmId: "algo_v2_1",
        priorityRank: 1,
        impactScore: 85,
        implementationDifficulty: 7,
      },
      {
        algorithmId: "algo_v2_3",
        priorityRank: 2,
        impactScore: 72,
        implementationDifficulty: 5,
      },
      {
        algorithmId: "algo_v2_4",
        priorityRank: 3,
        impactScore: 65,
        implementationDifficulty: 6,
      },
    ];

    // アルゴリズム改善履歴データ
    const improvementHistory = [
      {
        version: "2.1",
        implementationDate: "2024-01-01T09:00:00Z",
        successRateAfter: 75,
      },
      {
        version: "2.2",
        implementationDate: "2024-01-08T09:00:00Z",
        successRateAfter: 80,
      },
      {
        version: "2.3",
        implementationDate: "2024-01-15T09:00:00Z",
        successRateAfter: 85,
      },
    ];

    // 実行
    const result = determineNextAlgorithmPriority({
      metrics: improvementMetrics,
      previousPriorityList: previousPriorityList,
      improvementHistory: improvementHistory,
    });

    // 期待値の計算
    // 1. 改善成功判定: successRateAfter (85) >= successRateTarget (80) → true
    const successJudgment = result.improvementSuccessJudgment;
    expect(successJudgment).toBe(true);

    // 2. 成功率の改善幅: 85 - 72 = 13ポイント
    const successRateImprovement = result.successRateImprovementPoints;
    expect(successRateImprovement).toBe(13);

    // 3. 調理時間短縮度の達成判定: 15分 >= 12分 → true
    const cookingTimeTargetAchieved = result.cookingTimeTargetAchieved;
    expect(cookingTimeTargetAchieved).toBe(true);

    // 4. ユーザー満足度の改善幅: 78 - 68 = 10ポイント
    const satisfactionImprovement = result.userSatisfactionImprovement;
    expect(satisfactionImprovement).toBe(10);

    // 5. 改善前後の総合改善スコア: (成功率改善13 + 満足度改善10 + 時間短縮度達成1) / 3 * 100
    // = 24 / 3 * 100 = 800 → 正規化して 80点/100
    const overallImprovementScore = result.overallImprovementScore;
    expect(overallImprovementScore).toBe(80);

    // 6. 根拠情報に改善履歴が含まれているか
    expect(result.evidenceData).toHaveProperty("improvementHistory");
    expect(result.evidenceData.improvementHistory).toHaveLength(3);
    expect(result.evidenceData.improvementHistory[2]).toEqual({
      version: "2.3",
      implementationDate: "2024-01-15T09:00:00Z",
      successRateAfter: 85,
    });

    // 7. 根拠情報に評価指標が含まれているか
    expect(result.evidenceData).toHaveProperty("evaluationMetrics");
    expect(result.evidenceData.evaluationMetrics).toEqual({
      successRateChange: 13,
      cookingTimeShorteningAchieved: 15,
      userSatisfactionChange: 10,
      metricsCollectionCount: 5,
    });

    // 8. 次の改善優先度が決定されているか
    expect(result).toHaveProperty("nextPriorityList");
    expect(result.nextPriorityList).toHaveLength(3);

    // 9. 次の優先度リスト: 改善成功したalgo_v2_3が優先度1に昇格
    // 計算式: 新優先度スコア = (過去の優先度スコア × 0.4) + (改善スコア × 0.6)
    // algo_v2_3: (72 × 0.4) + (80 × 0.6) = 28.8 + 48 = 76.8 → 77点
    // algo_v2_1: (85 × 0.4) + (65 × 0.6) = 34 + 39 = 73点 → 73点
    // algo_v2_4: (65 × 0.4) + (70 × 0.6) = 26 + 42 = 68点 → 68点

    const nextPriorityList = result.nextPriorityList.sort(
      (a, b) => b.newPriorityScore - a.newPriorityScore
    );

    expect(nextPriorityList[0]).toEqual({
      algorithmId: "algo_v2_3",
      previousPriorityRank: 2,
      newPriorityRank: 1,
      newPriorityScore: 77,
      impactScoreDelta: 5,
    });

    expect(nextPriorityList[1]).toEqual({
      algorithmId: "algo_v2_1",
      previousPriorityRank: 1,
      newPriorityRank: 2,
      newPriorityScore: 73,
      impactScoreDelta: -12,
    });

    // 10. 決定された優先度が前回の優先度と異なるか
    const algorithmIdInCurrentResult = "algo_v2_3";
    const previousRank = previousPriorityList.find(
      (p) => p.algorithmId === algorithmIdInCurrentResult
    )?.priorityRank;
    const newRank = nextPriorityList.find(
      (p) => p.algorithmId === algorithmIdInCurrentResult
    )?.newPriorityRank;

    expect(newRank).not.toBe(previousRank);
    expect(newRank).toBe(1);
    expect(previousRank).toBe(2);

    // 11. 根拠情報に分析日時が含まれているか
    expect(result.evidenceData).toHaveProperty("analysisTimestamp");
    expect(result.evidenceData.analysisTimestamp).toBe("2024-01-15T11:00:00Z");

    // 12. 結果のステータスが成功（success）であるか
    expect(result.decisionStatus).toBe("success");

    // 13. 決定根拠サマリー
    expect(result).toHaveProperty("decisionRationale");
    expect(result.decisionRationale).toContain("目標値到達");
    expect(result.decisionRationale).toContain("改善成功");
  });
});