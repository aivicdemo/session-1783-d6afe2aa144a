import { aggregateFunctionUsagePatterns } from "../../src/logic/it-7-2-1";

describe("機能別使用パターン分析機能 - 週次集計ダッシュボード", () => {
  // SCEN-598: [normal] 機能別の使用頻度・離脱ポイント・競合差別化根拠を定量化し、ダッシュボード表示用に集計できる
  test("should aggregate function usage patterns with frequency, churn rate, and competitive differentiation score", () => {
    const functionUsageLogs = [
      {
        functionId: "F001",
        functionName: "献立自動生成",
        usageCount: 150,
        sessionDurationSeconds: 45000,
        churnUserCount: 8,
        totalUserCount: 100,
        uniqueSessionCount: 150,
      },
      {
        functionId: "F002",
        functionName: "栄養分析ダッシュボード",
        usageCount: 320,
        sessionDurationSeconds: 96000,
        churnUserCount: 12,
        totalUserCount: 100,
        uniqueSessionCount: 320,
      },
      {
        functionId: "F003",
        functionName: "食費管理",
        usageCount: 85,
        sessionDurationSeconds: 25500,
        churnUserCount: 28,
        totalUserCount: 100,
        uniqueSessionCount: 85,
      },
      {
        functionId: "F004",
        functionName: "買い物リスト生成",
        usageCount: 210,
        sessionDurationSeconds: 63000,
        churnUserCount: 15,
        totalUserCount: 100,
        uniqueSessionCount: 210,
      },
    ];

    const aggregationWeekStartDate = new Date("2024-01-15T00:00:00Z");
    const aggregationWeekEndDate = new Date("2024-01-21T23:59:59Z");

    const result = aggregateFunctionUsagePatterns({
      functionUsageLogs,
      aggregationWeekStartDate,
      aggregationWeekEndDate,
    });

    // 使用頻度集計: 各機能の合計使用回数が正確に計算されていることを確認
    expect(result.functionMetrics.length).toBe(4);

    const metricsMap = new Map(
      result.functionMetrics.map((m) => [m.functionId, m])
    );

    const f001Metric = metricsMap.get("F001");
    expect(f001Metric?.usageFrequency).toBe(150);
    expect(f001Metric?.functionName).toBe("献立自動生成");

    const f002Metric = metricsMap.get("F002");
    expect(f002Metric?.usageFrequency).toBe(320);
    expect(f002Metric?.functionName).toBe("栄養分析ダッシュボード");

    const f003Metric = metricsMap.get("F003");
    expect(f003Metric?.usageFrequency).toBe(85);
    expect(f003Metric?.functionName).toBe("食費管理");

    const f004Metric = metricsMap.get("F004");
    expect(f004Metric?.usageFrequency).toBe(210);
    expect(f004Metric?.functionName).toBe("買い物リスト生成");

    // 離脱ポイント分析: 離脱ユーザー数と離脱率が正確に計算されていることを確認
    // 離脱率 = (churnUserCount / totalUserCount) * 100
    expect(f001Metric?.churnRate).toBe(8);
    expect(f002Metric?.churnRate).toBe(12);
    expect(f003Metric?.churnRate).toBe(28);
    expect(f004Metric?.churnRate).toBe(15);

    // 競合差別化根拠の集計: 機能ごとの独自性スコア（使用頻度と離脱率の逆関数に基づく）
    // 独自性スコア = (使用頻度 / 総セッション数) * (100 - 離脱率) * 10
    // 総セッション数 = 765 (150+320+85+210)
    const totalSessions = 765;

    // F001: (150 / 765) * (100 - 8) * 10 = 0.196078 * 92 * 10 = 18.04
    const f001DifferentiationScore =
      (f001Metric!.usageFrequency / totalSessions) *
      (100 - f001Metric!.churnRate) *
      10;
    expect(f001DifferentiationScore).toBeCloseTo(18.04, 1);

    // F002: (320 / 765) * (100 - 12) * 10 = 0.418301 * 88 * 10 = 36.81
    const f002DifferentiationScore =
      (f002Metric!.usageFrequency / totalSessions) *
      (100 - f002Metric!.churnRate) *
      10;
    expect(f002DifferentiationScore).toBeCloseTo(36.81, 1);

    // F003: (85 / 765) * (100 - 28) * 10 = 0.111111 * 72 * 10 = 8.0
    const f003DifferentiationScore =
      (f003Metric!.usageFrequency / totalSessions) *
      (100 - f003Metric!.churnRate) *
      10;
    expect(f003DifferentiationScore).toBeCloseTo(8.0, 1);

    // F004: (210 / 765) * (100 - 15) * 10 = 0.274509 * 85 * 10 = 23.33
    const f004DifferentiationScore =
      (f004Metric!.usageFrequency / totalSessions) *
      (100 - f004Metric!.churnRate) *
      10;
    expect(f004DifferentiationScore).toBeCloseTo(23.33, 1);

    expect(f001Metric?.differentiationScore).toBeCloseTo(18.04, 1);
    expect(f002Metric?.differentiationScore).toBeCloseTo(36.81, 1);
    expect(f003Metric?.differentiationScore).toBeCloseTo(8.0, 1);
    expect(f004Metric?.differentiationScore).toBeCloseTo(23.33, 1);

    // ダッシュボード表示用フォーマット検証
    expect(result.dashboardFormat).toBeDefined();
    expect(result.dashboardFormat.weekStartDate).toBe("2024-01-15");
    expect(result.dashboardFormat.weekEndDate).toBe("2024-01-21");
    expect(result.dashboardFormat.totalFunctionsAnalyzed).toBe(4);
    expect(result.dashboardFormat.totalUsageSessions).toBe(765);

    // ダッシュボード表示用データ検証
    expect(result.dashboardFormat.functionRankings).toBeDefined();
    expect(result.dashboardFormat.functionRankings.length).toBe(4);

    // 使用頻度でソート確認（降順）
    const sortedByUsage = result.dashboardFormat.functionRankings.sort(
      (a, b) => b.usageFrequency - a.usageFrequency
    );
    expect(sortedByUsage[0].functionId).toBe("F002");
    expect(sortedByUsage[1].functionId).toBe("F004");
    expect(sortedByUsage[2].functionId).toBe("F001");
    expect(sortedByUsage[3].functionId).toBe("F003");

    // 各機能の離脱率が正確に百分率で表示されていることを確認
    const f002Ranking = result.dashboardFormat.functionRankings.find(
      (r) => r.functionId === "F002"
    );
    expect(f002Ranking?.churnRatePercent).toBe(12);

    // セッション平均時間計算: sessionDurationSeconds / uniqueSessionCount
    // F001: 45000 / 150 = 300秒
    expect(f001Metric?.averageSessionDurationSeconds).toBe(300);

    // F002: 96000 / 320 = 300秒
    expect(f002Metric?.averageSessionDurationSeconds).toBe(300);

    // F003: 25500 / 85 = 300秒
    expect(f003Metric?.averageSessionDurationSeconds).toBe(300);

    // F004: 63000 / 210 = 300秒
    expect(f004Metric?.averageSessionDurationSeconds).toBe(300);

    // ダッシュボードフォーマットにエラーが含まれていないことを確認
    expect(result.dashboardFormat.errors).toBe(undefined);
    expect(result.dashboardFormat.warnings).toBe(undefined);

    // 複数機能データが並列して正確に集計されていることを確認
    expect(result.aggregationStatus).toBe("completed");
    expect(result.processedFunctionCount).toBe(4);
    expect(result.failedFunctionCount).toBe(0);

    // 集計結果全体の構造検証
    expect(result).toHaveProperty("functionMetrics");
    expect(result).toHaveProperty("dashboardFormat");
    expect(result).toHaveProperty("aggregationStatus");
    expect(result).toHaveProperty("processedFunctionCount");
    expect(result).toHaveProperty("failedFunctionCount");
    expect(result).toHaveProperty("aggregationCompletedAt");

    // 集計完了タイムスタンプが有効であることを確認
    const completedAt = new Date(result.aggregationCompletedAt);
    expect(completedAt.getTime()).toBeGreaterThan(0);
  });
});