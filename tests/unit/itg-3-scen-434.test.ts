import { validateSeasonalAndDayOfWeekTrend } from "../../src/logic/it-1-br-3-2-1";

describe("購入実績の記録と月次食費削減効果の自動集計・分析機能", () => {
  // SCEN-434: [normal] 季節変動・曜日別購買傾向の承認判定 - 季節変動・曜日別購買傾向データが完全で、承認判定が正常に実行される
  test("should approve seasonal and day-of-week trend when data is complete and patterns are detected", () => {
    // 過去12ヶ月間の完全な季節変動データ
    const seasonalData = [
      {
        month: 1,
        season: "winter",
        totalAmount: 45000,
        itemCount: 28,
        frequency: 4,
      },
      {
        month: 2,
        season: "winter",
        totalAmount: 42000,
        itemCount: 26,
        frequency: 4,
      },
      {
        month: 3,
        season: "spring",
        totalAmount: 38000,
        itemCount: 25,
        frequency: 4,
      },
      {
        month: 4,
        season: "spring",
        totalAmount: 36000,
        itemCount: 23,
        frequency: 4,
      },
      {
        month: 5,
        season: "spring",
        totalAmount: 35000,
        itemCount: 22,
        frequency: 4,
      },
      {
        month: 6,
        season: "summer",
        totalAmount: 32000,
        itemCount: 20,
        frequency: 4,
      },
      {
        month: 7,
        season: "summer",
        totalAmount: 31000,
        itemCount: 19,
        frequency: 4,
      },
      {
        month: 8,
        season: "summer",
        totalAmount: 33000,
        itemCount: 21,
        frequency: 4,
      },
      {
        month: 9,
        season: "autumn",
        totalAmount: 37000,
        itemCount: 24,
        frequency: 4,
      },
      {
        month: 10,
        season: "autumn",
        totalAmount: 40000,
        itemCount: 26,
        frequency: 4,
      },
      {
        month: 11,
        season: "autumn",
        totalAmount: 43000,
        itemCount: 28,
        frequency: 4,
      },
      {
        month: 12,
        season: "winter",
        totalAmount: 48000,
        itemCount: 30,
        frequency: 4,
      },
    ];

    // 曜日別購買傾向データ（月曜日～日曜日）
    const dayOfWeekData = [
      {
        dayOfWeek: 1,
        dayName: "Monday",
        avgAmount: 5200,
        frequency: 4.2,
        peakHour: 19,
        isWeekday: true,
      },
      {
        dayOfWeek: 2,
        dayName: "Tuesday",
        avgAmount: 5100,
        frequency: 4.0,
        peakHour: 19,
        isWeekday: true,
      },
      {
        dayOfWeek: 3,
        dayName: "Wednesday",
        avgAmount: 5050,
        frequency: 3.9,
        peakHour: 19,
        isWeekday: true,
      },
      {
        dayOfWeek: 4,
        dayName: "Thursday",
        avgAmount: 5150,
        frequency: 4.1,
        peakHour: 19,
        isWeekday: true,
      },
      {
        dayOfWeek: 5,
        dayName: "Friday",
        avgAmount: 5300,
        frequency: 4.3,
        peakHour: 18,
        isWeekday: true,
      },
      {
        dayOfWeek: 6,
        dayName: "Saturday",
        avgAmount: 6800,
        frequency: 5.2,
        peakHour: 14,
        isWeekday: false,
      },
      {
        dayOfWeek: 7,
        dayName: "Sunday",
        avgAmount: 6500,
        frequency: 5.0,
        peakHour: 15,
        isWeekday: false,
      },
    ];

    const analysisStartDate = new Date("2023-01-01T00:00:00Z");
    const analysisEndDate = new Date("2023-12-31T23:59:59Z");

    // 承認判定ロジックを実行
    const result = validateSeasonalAndDayOfWeekTrend({
      seasonalData,
      dayOfWeekData,
      analysisStartDate,
      analysisEndDate,
    });

    // 承認判定ステータスが『承認』であることを確認
    expect(result.approvalStatus).toBe("approved");

    // データの完全性チェック結果が true であることを確認
    expect(result.dataCompleteness).toBe(true);

    // 季節パターン検出結果の確認：4つの季節が検出されていることを確認
    expect(result.detectedSeasonPatterns).toHaveLength(4);
    expect(result.detectedSeasonPatterns).toContain("winter");
    expect(result.detectedSeasonPatterns).toContain("spring");
    expect(result.detectedSeasonPatterns).toContain("summer");
    expect(result.detectedSeasonPatterns).toContain("autumn");

    // 曜日別パターン検出結果の確認：平日・休日の差異が検出されていることを確認
    expect(result.detectedDayOfWeekPatterns).toContain("weekday");
    expect(result.detectedDayOfWeekPatterns).toContain("weekend");

    // 平日の平均購買額が正確に計算されていることを確認（月火水木金の平均）
    const weekdayAvg = (5200 + 5100 + 5050 + 5150 + 5300) / 5;
    expect(result.weekdayAverageAmount).toBe(5160);

    // 休日の平均購買額が正確に計算されていることを確認（土日の平均）
    const weekendAvg = (6800 + 6500) / 2;
    expect(result.weekendAverageAmount).toBe(6650);

    // 休日購買額が平日購買額より高いことを確認（差異検出）
    expect(result.weekendAverageAmount).toBeGreaterThan(
      result.weekdayAverageAmount
    );

    // 推奨購買計画が生成されていることを確認
    expect(result.recommendedPurchasePlan).toBeDefined();
    expect(result.recommendedPurchasePlan.avgMonthlyBudget).toBeDefined();
    expect(result.recommendedPurchasePlan.avgMonthlyBudget).toBeGreaterThan(0);

    // 推奨購買計画の月間予算計算：12ヶ月の合計 / 12
    const totalYearlyAmount = seasonalData.reduce(
      (sum, month) => sum + month.totalAmount,
      0
    );
    const expectedMonthlyAvg = totalYearlyAmount / 12;
    expect(result.recommendedPurchasePlan.avgMonthlyBudget).toBe(
      Math.round(expectedMonthlyAvg)
    );

    // 季節別の推奨購買額が生成されていることを確認
    expect(result.recommendedPurchasePlan.seasonalBudgets).toBeDefined();
    expect(result.recommendedPurchasePlan.seasonalBudgets).toHaveProperty(
      "winter"
    );
    expect(result.recommendedPurchasePlan.seasonalBudgets).toHaveProperty(
      "spring"
    );
    expect(result.recommendedPurchasePlan.seasonalBudgets).toHaveProperty(
      "summer"
    );
    expect(result.recommendedPurchasePlan.seasonalBudgets).toHaveProperty(
      "autumn"
    );

    // 曜日別の推奨購買パターンが生成されていることを確認
    expect(result.recommendedPurchasePlan.dayOfWeekPatterns).toBeDefined();
    expect(
      result.recommendedPurchasePlan.dayOfWeekPatterns.weekdayRecommendation
    ).toBeDefined();
    expect(
      result.recommendedPurchasePlan.dayOfWeekPatterns.weekendRecommendation
    ).toBeDefined();

    // 承認判定の詳細ログが記録されていることを確認
    expect(result.approvalLog).toBeDefined();
    expect(result.approvalLog.analysisStartDate).toBe(analysisStartDate);
    expect(result.approvalLog.analysisEndDate).toBe(analysisEndDate);

    // 検出パターン数が正確に記録されていることを確認
    expect(result.approvalLog.detectedPatternCount).toBe(6); // 4つの季節 + 平日/休日 = 6パターン

    // 承認判定日時がタイムスタンプとして記録されていることを確認
    expect(result.approvalLog.approvalTimestamp).toBeDefined();
    expect(typeof result.approvalLog.approvalTimestamp).toBe("object");
    expect(result.approvalLog.approvalTimestamp).toBeInstanceOf(Date);

    // 承認判定の根拠がメッセージとして記録されていることを確認
    expect(result.approvalLog.approvalReason).toBeDefined();
    expect(result.approvalLog.approvalReason).toContain("complete");

    // 全体的な判定結果が一貫していることを確認
    expect(result.approvalStatus).toBe("approved");
    expect(result.dataCompleteness).toBe(true);
    expect(result.detectedSeasonPatterns.length).toBeGreaterThan(0);
    expect(result.detectedDayOfWeekPatterns.length).toBeGreaterThan(0);
  });
});