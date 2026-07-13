import {
  calculateNutrientIntakeTransitionData,
} from "../../src/logic/it-1-br-2-1-1-1";

describe("栄養摂取量の推移データ集計・表示ダッシュボード", () => {
  // SCEN-464: [normal] 推移データ表示機能 - 栄養摂取量の推移データが日次・週次・月次の集計単位ごとに正しく表示される
  test("should aggregate and display nutrient intake transition data correctly for daily, weekly, and monthly aggregation units", () => {
    // Precondition: ユーザーが栄養管理・分析ダッシュボードにログイン済み、
    // 1週間以上の食事記録データが蓄積されている状態

    // 日次集計単位でのテスト
    const dailyInput = {
      userId: "user-001",
      nutrientId: "nutrient-protein",
      aggregationUnit: "daily" as const,
      startDate: new Date("2024-01-15T00:00:00Z"),
      endDate: new Date("2024-01-21T23:59:59Z"),
    };

    const dailyResult = calculateNutrientIntakeTransitionData(dailyInput);

    // 日次集計データが正しく返されることを確認
    expect(dailyResult).toEqual(
      expect.objectContaining({
        nutrientId: "nutrient-protein",
        aggregationUnit: "daily",
        dataPoints: expect.arrayContaining([
          expect.objectContaining({
            date: "2024-01-15",
            intakeAmount: expect.any(Number),
            unit: "g",
          }),
          expect.objectContaining({
            date: "2024-01-16",
            intakeAmount: expect.any(Number),
            unit: "g",
          }),
          expect.objectContaining({
            date: "2024-01-17",
            intakeAmount: expect.any(Number),
            unit: "g",
          }),
          expect.objectContaining({
            date: "2024-01-18",
            intakeAmount: expect.any(Number),
            unit: "g",
          }),
          expect.objectContaining({
            date: "2024-01-19",
            intakeAmount: expect.any(Number),
            unit: "g",
          }),
          expect.objectContaining({
            date: "2024-01-20",
            intakeAmount: expect.any(Number),
            unit: "g",
          }),
          expect.objectContaining({
            date: "2024-01-21",
            intakeAmount: expect.any(Number),
            unit: "g",
          }),
        ]),
      })
    );

    // 日次データポイント数が正確であることを確認
    expect(dailyResult.dataPoints).toHaveLength(7);

    // 日次集計値が具体的に正しく計算されていることを確認
    // 例: 2024-01-15の摂取量が65g であると想定
    const day1Data = dailyResult.dataPoints.find(
      (dp) => dp.date === "2024-01-15"
    );
    expect(day1Data).toBeDefined();
    expect(day1Data?.intakeAmount).toBe(65);
    expect(day1Data?.unit).toBe("g");

    // 週次集計単位でのテスト
    const weeklyInput = {
      userId: "user-001",
      nutrientId: "nutrient-protein",
      aggregationUnit: "weekly" as const,
      startDate: new Date("2024-01-08T00:00:00Z"),
      endDate: new Date("2024-01-28T23:59:59Z"),
    };

    const weeklyResult = calculateNutrientIntakeTransitionData(weeklyInput);

    // 週次集計データが正しく返されることを確認
    expect(weeklyResult).toEqual(
      expect.objectContaining({
        nutrientId: "nutrient-protein",
        aggregationUnit: "weekly",
        dataPoints: expect.arrayContaining([
          expect.objectContaining({
            weekStartDate: "2024-01-08",
            weekEndDate: "2024-01-14",
            intakeAmount: expect.any(Number),
            unit: "g",
          }),
          expect.objectContaining({
            weekStartDate: "2024-01-15",
            weekEndDate: "2024-01-21",
            intakeAmount: expect.any(Number),
            unit: "g",
          }),
          expect.objectContaining({
            weekStartDate: "2024-01-22",
            weekEndDate: "2024-01-28",
            intakeAmount: expect.any(Number),
            unit: "g",
          }),
        ]),
      })
    );

    // 週次データポイント数が正確であることを確認（3週間分）
    expect(weeklyResult.dataPoints).toHaveLength(3);

    // 週次集計値が具体的に正しく計算されていることを確認
    // 例: 2024-01-15～2024-01-21 週の合計摂取量が 455g であると想定（65*7日）
    const week2Data = weeklyResult.dataPoints.find(
      (dp) => dp.weekStartDate === "2024-01-15"
    );
    expect(week2Data).toBeDefined();
    expect(week2Data?.intakeAmount).toBe(455);
    expect(week2Data?.unit).toBe("g");

    // 月次集計単位でのテスト
    const monthlyInput = {
      userId: "user-001",
      nutrientId: "nutrient-protein",
      aggregationUnit: "monthly" as const,
      startDate: new Date("2024-01-01T00:00:00Z"),
      endDate: new Date("2024-03-31T23:59:59Z"),
    };

    const monthlyResult = calculateNutrientIntakeTransitionData(monthlyInput);

    // 月次集計データが正しく返されることを確認
    expect(monthlyResult).toEqual(
      expect.objectContaining({
        nutrientId: "nutrient-protein",
        aggregationUnit: "monthly",
        dataPoints: expect.arrayContaining([
          expect.objectContaining({
            month: "2024-01",
            intakeAmount: expect.any(Number),
            unit: "g",
          }),
          expect.objectContaining({
            month: "2024-02",
            intakeAmount: expect.any(Number),
            unit: "g",
          }),
          expect.objectContaining({
            month: "2024-03",
            intakeAmount: expect.any(Number),
            unit: "g",
          }),
        ]),
      })
    );

    // 月次データポイント数が正確であることを確認（3ヶ月分）
    expect(monthlyResult.dataPoints).toHaveLength(3);

    // 月次集計値が具体的に正しく計算されていることを確認
    // 例: 2024-01月の総摂取量が 1950g であると想定（65*30日）
    const jan2024Data = monthlyResult.dataPoints.find(
      (dp) => dp.month === "2024-01"
    );
    expect(jan2024Data).toBeDefined();
    expect(jan2024Data?.intakeAmount).toBe(1950);
    expect(jan2024Data?.unit).toBe("g");

    // 集計単位の切り替え時にデータが正常に更新されることを確認
    // 日次→週次の切り替え検証
    const switchToWeeklyInput = {
      userId: "user-001",
      nutrientId: "nutrient-protein",
      aggregationUnit: "weekly" as const,
      startDate: new Date("2024-01-15T00:00:00Z"),
      endDate: new Date("2024-01-21T23:59:59Z"),
    };

    const switchedResult = calculateNutrientIntakeTransitionData(
      switchToWeeklyInput
    );

    // 切り替え後のデータ構造が正確に変更されていることを確認
    expect(switchedResult.aggregationUnit).toBe("weekly");
    expect(switchedResult.dataPoints[0]).toHaveProperty("weekStartDate");
    expect(switchedResult.dataPoints[0]).toHaveProperty("weekEndDate");
    expect(switchedResult.dataPoints[0]).not.toHaveProperty("date");

    // グラフプロット用の正しいデータ形状を確認
    // 日次データの場合
    const dailyChartData = dailyResult.dataPoints.map((dp) => ({
      x: dp.date,
      y: dp.intakeAmount,
    }));
    expect(dailyChartData).toHaveLength(7);
    expect(dailyChartData[0]).toEqual({ x: "2024-01-15", y: 65 });

    // 週次データの場合
    const weeklyChartData = weeklyResult.dataPoints.map((dp) => ({
      x: `${dp.weekStartDate}-${dp.weekEndDate}`,
      y: dp.intakeAmount,
    }));
    expect(weeklyChartData).toHaveLength(3);
    expect(weeklyChartData[1]).toEqual({
      x: "2024-01-15-2024-01-21",
      y: 455,
    });

    // 月次データの場合
    const monthlyChartData = monthlyResult.dataPoints.map((dp) => ({
      x: dp.month,
      y: dp.intakeAmount,
    }));
    expect(monthlyChartData).toHaveLength(3);
    expect(monthlyChartData[0]).toEqual({ x: "2024-01", y: 1950 });

    // データの連続性を確認
    dailyResult.dataPoints.forEach((dataPoint, index) => {
      if (index > 0) {
        expect(dataPoint.intakeAmount).toBeGreaterThanOrEqual(0);
      }
    });

    // 全集計単位でのデータ値が Number 型で正確に計算されていることを確認
    dailyResult.dataPoints.forEach((dp) => {
      expect(typeof dp.intakeAmount).toBe("number");
      expect(dp.intakeAmount).toBeGreaterThanOrEqual(0);
      expect(Number.isNaN(dp.intakeAmount)).toBe(false);
    });

    weeklyResult.dataPoints.forEach((dp) => {
      expect(typeof dp.intakeAmount).toBe("number");
      expect(dp.intakeAmount).toBeGreaterThanOrEqual(0);
      expect(Number.isNaN(dp.intakeAmount)).toBe(false);
    });

    monthlyResult.dataPoints.forEach((dp) => {
      expect(typeof dp.intakeAmount).toBe("number");
      expect(dp.intakeAmount).toBeGreaterThanOrEqual(0);
      expect(Number.isNaN(dp.intakeAmount)).toBe(false);
    });

    // ユーザーID と栄養素ID が正確に保持されていることを確認
    expect(dailyResult.userId).toBe("user-001");
    expect(weeklyResult.userId).toBe("user-001");
    expect(monthlyResult.userId).toBe("user-001");
    expect(dailyResult.nutrientId).toBe("nutrient-protein");
    expect(weeklyResult.nutrientId).toBe("nutrient-protein");
    expect(monthlyResult.nutrientId).toBe("nutrient-protein");

    // 単位が一貫していることを確認
    expect(dailyResult.dataPoints.every((dp) => dp.unit === "g")).toBe(true);
    expect(weeklyResult.dataPoints.every((dp) => dp.unit === "g")).toBe(true);
    expect(monthlyResult.dataPoints.every((dp) => dp.unit === "g")).toBe(true);
  });
});