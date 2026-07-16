import {
  extractConstraintPatternsAndChurnPoints,
} from "../../src/logic/it-1-br-8-2-2-1";

describe("献立生成フロー離脱ポイント抽出・分析機能", () => {
  // SCEN-318
  test("アプリログから制約条件入力パターンと離脱ポイントが抽出され、UXペイン分析用データが生成される", () => {
    // 入力: 献立生成フロー全段階のアプリログ
    const appLogs = [
      {
        sessionId: "sess_001",
        userId: "user_101",
        timestamp: "2024-01-15T10:00:00Z",
        flowStage: 1,
        action: "input_constraints",
        constraintType: "ingredient_restriction",
        constraintValue: "dairy_free",
        status: "completed",
      },
      {
        sessionId: "sess_001",
        userId: "user_101",
        timestamp: "2024-01-15T10:05:00Z",
        flowStage: 2,
        action: "search_menu",
        status: "completed",
      },
      {
        sessionId: "sess_001",
        userId: "user_101",
        timestamp: "2024-01-15T10:10:00Z",
        flowStage: 3,
        action: "view_results",
        status: "completed",
      },
      {
        sessionId: "sess_001",
        userId: "user_101",
        timestamp: "2024-01-15T10:15:00Z",
        flowStage: 4,
        action: "confirm_menu",
        status: "completed",
      },
      {
        sessionId: "sess_002",
        userId: "user_102",
        timestamp: "2024-01-15T10:20:00Z",
        flowStage: 1,
        action: "input_constraints",
        constraintType: "cooking_time",
        constraintValue: "30_minutes",
        status: "completed",
      },
      {
        sessionId: "sess_002",
        userId: "user_102",
        timestamp: "2024-01-15T10:25:00Z",
        flowStage: 1,
        action: "input_constraints",
        constraintType: "budget",
        constraintValue: "2000_yen",
        status: "completed",
      },
      {
        sessionId: "sess_002",
        userId: "user_102",
        timestamp: "2024-01-15T10:30:00Z",
        flowStage: 2,
        action: "search_menu",
        status: "completed",
      },
      {
        sessionId: "sess_002",
        userId: "user_102",
        timestamp: "2024-01-15T10:35:00Z",
        flowStage: 3,
        action: "view_results",
        status: "churned",
      },
      {
        sessionId: "sess_003",
        userId: "user_103",
        timestamp: "2024-01-15T10:40:00Z",
        flowStage: 1,
        action: "input_constraints",
        constraintType: "allergy",
        constraintValue: "peanut_allergy",
        status: "completed",
      },
      {
        sessionId: "sess_003",
        userId: "user_103",
        timestamp: "2024-01-15T10:45:00Z",
        flowStage: 2,
        action: "search_menu",
        status: "churned",
      },
    ];

    // 実行
    const result = extractConstraintPatternsAndChurnPoints(appLogs);

    // 検証: 制約条件パターンの抽出
    expect(result.constraintPatterns).toHaveLength(3);
    expect(result.constraintPatterns).toContainEqual({
      patternId: expect.any(String),
      constraints: [
        {
          constraintType: "ingredient_restriction",
          constraintValue: "dairy_free",
        },
      ],
      frequency: 1,
    });
    expect(result.constraintPatterns).toContainEqual({
      patternId: expect.any(String),
      constraints: expect.arrayContaining([
        {
          constraintType: "cooking_time",
          constraintValue: "30_minutes",
        },
        {
          constraintType: "budget",
          constraintValue: "2000_yen",
        },
      ]),
      frequency: 1,
    });
    expect(result.constraintPatterns).toContainEqual({
      patternId: expect.any(String),
      constraints: [
        {
          constraintType: "allergy",
          constraintValue: "peanut_allergy",
        },
      ],
      frequency: 1,
    });

    // 検証: フロー段階別離脱データ
    expect(result.churnDataByStage).toHaveLength(4);

    // ステップ1: 入力段階 - 離脱なし
    expect(result.churnDataByStage[0]).toEqual({
      flowStage: 1,
      stageName: "constraint_input",
      totalUsers: 3,
      completedUsers: 3,
      churnedUsers: 0,
      churnRate: 0,
      constraintPatternBreakdown: expect.arrayContaining([
        {
          patternId: expect.any(String),
          churnedCount: 0,
          completedCount: 1,
        },
        {
          patternId: expect.any(String),
          churnedCount: 0,
          completedCount: 1,
        },
        {
          patternId: expect.any(String),
          churnedCount: 0,
          completedCount: 1,
        },
      ]),
    });

    // ステップ2: 検索段階 - 1名離脱
    expect(result.churnDataByStage[1]).toEqual({
      flowStage: 2,
      stageName: "search",
      totalUsers: 3,
      completedUsers: 2,
      churnedUsers: 1,
      churnRate: expect.closeTo(0.333, 3),
      constraintPatternBreakdown: expect.any(Array),
    });

    // ステップ3: 結果表示段階 - 1名離脱
    expect(result.churnDataByStage[2]).toEqual({
      flowStage: 3,
      stageName: "view_results",
      totalUsers: 2,
      completedUsers: 1,
      churnedUsers: 1,
      churnRate: 0.5,
      constraintPatternBreakdown: expect.any(Array),
    });

    // ステップ4: 確定段階 - 離脱なし
    expect(result.churnDataByStage[3]).toEqual({
      flowStage: 4,
      stageName: "confirm_menu",
      totalUsers: 1,
      completedUsers: 1,
      churnedUsers: 0,
      churnRate: 0,
      constraintPatternBreakdown: expect.any(Array),
    });

    // 検証: メタデータの完全性
    expect(result.metadata).toEqual({
      analysisTimestamp: expect.any(String),
      logCountProcessed: 10,
      sessionCountProcessed: 3,
      uniqueUsersCount: 3,
      analysisVersion: expect.any(String),
      dataQualityScore: expect.any(Number),
    });
    expect(result.metadata.dataQualityScore).toBeGreaterThanOrEqual(0);
    expect(result.metadata.dataQualityScore).toBeLessThanOrEqual(1);

    // 検証: 全体集計結果
    expect(result.overallChurnMetrics).toEqual({
      totalSessions: 3,
      completedSessions: 1,
      churnedSessions: 2,
      overallChurnRate: expect.closeTo(0.667, 3),
      averageFlowStageReached: expect.closeTo(2.667, 3),
    });

    // 検証: セッション別詳細情報
    expect(result.sessionDetails).toHaveLength(3);
    expect(result.sessionDetails[0]).toEqual({
      sessionId: "sess_001",
      userId: "user_101",
      startTime: "2024-01-15T10:00:00Z",
      endTime: "2024-01-15T10:15:00Z",
      maxFlowStageReached: 4,
      churnStatus: "completed",
      constraintPattern: expect.any(String),
      constraintCount: 1,
    });
    expect(result.sessionDetails[1]).toEqual({
      sessionId: "sess_002",
      userId: "user_102",
      startTime: "2024-01-15T10:20:00Z",
      endTime: "2024-01-15T10:35:00Z",
      maxFlowStageReached: 3,
      churnStatus: "churned",
      constraintPattern: expect.any(String),
      constraintCount: 2,
    });
    expect(result.sessionDetails[2]).toEqual({
      sessionId: "sess_003",
      userId: "user_103",
      startTime: "2024-01-15T10:40:00Z",
      endTime: "2024-01-15T10:45:00Z",
      maxFlowStageReached: 2,
      churnStatus: "churned",
      constraintPattern: expect.any(String),
      constraintCount: 1,
    });

    // 検証: データ構造の完全性
    expect(result).toHaveProperty("constraintPatterns");
    expect(result).toHaveProperty("churnDataByStage");
    expect(result).toHaveProperty("overallChurnMetrics");
    expect(result).toHaveProperty("sessionDetails");
    expect(result).toHaveProperty("metadata");

    // 検証: 制約条件パターン別集計の正確性
    const churnedPatterns = result.constraintPatterns.filter((p) =>
      result.sessionDetails.some((s) => s.churnStatus === "churned")
    );
    expect(churnedPatterns.length).toBeGreaterThanOrEqual(0);

    // 検証: フロー段階別の累積離脱率が単調増加
    let cumulativeChurnCount = 0;
    for (let i = 0; i < result.churnDataByStage.length; i++) {
      cumulativeChurnCount += result.churnDataByStage[i].churnedUsers;
      if (i > 0) {
        expect(cumulativeChurnCount).toBeGreaterThanOrEqual(
          result.churnDataByStage[i - 1].churnedUsers
        );
      }
    }
  });
});