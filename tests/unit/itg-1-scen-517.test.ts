import { describe, test, expect, beforeEach } from "@jest/globals";
import { calculateMonthlyCostTotal } from "../../src/logic/it-3";

describe("食事評価データを献立生成ロジックに反映させる機能", () => {
  // SCEN-517: [edge] ダッシュボード自動更新機能 - 食費実績がない月の場合、ダッシュボードが0円と表示される
  test("食費実績がない月の場合、食費合計が0円として計算される", () => {
    const userId = "user_001";
    const year = 2024;
    const month = 3;
    const purchaseRecords: Array<{
      id: string;
      userId: string;
      purchaseDate: string;
      amount: number;
    }> = [];

    const result = calculateMonthlyCostTotal({
      userId,
      year,
      month,
      purchaseRecords,
    });

    expect(result).toEqual({
      totalCost: 0,
      currencyCode: "JPY",
      hasData: false,
      month: 3,
      year: 2024,
    });
    expect(result.totalCost).toBe(0);
  });

  test("複数の食費実績がある月の場合、合計金額が正しく計算される", () => {
    const userId = "user_001";
    const year = 2024;
    const month = 3;
    const purchaseRecords = [
      {
        id: "purchase_001",
        userId: "user_001",
        purchaseDate: "2024-03-05",
        amount: 3500,
      },
      {
        id: "purchase_002",
        userId: "user_001",
        purchaseDate: "2024-03-12",
        amount: 2800,
      },
      {
        id: "purchase_003",
        userId: "user_001",
        purchaseDate: "2024-03-20",
        amount: 4200,
      },
    ];

    const result = calculateMonthlyCostTotal({
      userId,
      year,
      month,
      purchaseRecords,
    });

    expect(result).toEqual({
      totalCost: 10500,
      currencyCode: "JPY",
      hasData: true,
      month: 3,
      year: 2024,
    });
    expect(result.totalCost).toBe(10500);
  });

  test("指定月以外の購入記録は集計対象から除外される", () => {
    const userId = "user_001";
    const year = 2024;
    const month = 3;
    const purchaseRecords = [
      {
        id: "purchase_001",
        userId: "user_001",
        purchaseDate: "2024-02-28",
        amount: 5000,
      },
      {
        id: "purchase_002",
        userId: "user_001",
        purchaseDate: "2024-03-10",
        amount: 3000,
      },
      {
        id: "purchase_003",
        userId: "user_001",
        purchaseDate: "2024-04-01",
        amount: 4000,
      },
    ];

    const result = calculateMonthlyCostTotal({
      userId,
      year,
      month,
      purchaseRecords,
    });

    expect(result.totalCost).toBe(3000);
    expect(result.hasData).toBe(true);
  });

  test("単一の食費実績がある月の場合、その金額が合計として計算される", () => {
    const userId = "user_002";
    const year = 2024;
    const month = 5;
    const purchaseRecords = [
      {
        id: "purchase_001",
        userId: "user_002",
        purchaseDate: "2024-05-15",
        amount: 6500,
      },
    ];

    const result = calculateMonthlyCostTotal({
      userId,
      year,
      month,
      purchaseRecords,
    });

    expect(result.totalCost).toBe(6500);
    expect(result.hasData).toBe(true);
  });

  test("異なるユーザーの購入記録は指定ユーザーの集計に含まれない", () => {
    const userId = "user_001";
    const year = 2024;
    const month = 3;
    const purchaseRecords = [
      {
        id: "purchase_001",
        userId: "user_001",
        purchaseDate: "2024-03-10",
        amount: 2000,
      },
      {
        id: "purchase_002",
        userId: "user_002",
        purchaseDate: "2024-03-10",
        amount: 5000,
      },
      {
        id: "purchase_003",
        userId: "user_001",
        purchaseDate: "2024-03-20",
        amount: 3000,
      },
    ];

    const result = calculateMonthlyCostTotal({
      userId,
      year,
      month,
      purchaseRecords,
    });

    expect(result.totalCost).toBe(5000);
  });

  test("無効なユーザーIDが指定された場合、エラーがスローされる", () => {
    expect(() =>
      calculateMonthlyCostTotal({
        userId: "",
        year: 2024,
        month: 3,
        purchaseRecords: [],
      })
    ).toThrow(/ユーザーID/);
  });

  test("無効な月が指定された場合、エラーがスローされる", () => {
    expect(() =>
      calculateMonthlyCostTotal({
        userId: "user_001",
        year: 2024,
        month: 13,
        purchaseRecords: [],
      })
    ).toThrow(/月/);
  });

  test("無効な年が指定された場合、エラーがスローされる", () => {
    expect(() =>
      calculateMonthlyCostTotal({
        userId: "user_001",
        year: 1900,
        month: 3,
        purchaseRecords: [],
      })
    ).toThrow(/年/);
  });

  test("大量の食費実績がある場合でも正確に集計される", () => {
    const userId = "user_001";
    const year = 2024;
    const month = 3;
    const purchaseRecords = Array.from({ length: 30 }, (_, i) => ({
      id: `purchase_${i + 1}`,
      userId: "user_001",
      purchaseDate: `2024-03-${String((i % 28) + 1).padStart(2, "0")}`,
      amount: 1000 + i * 100,
    }));

    const result = calculateMonthlyCostTotal({
      userId,
      year,
      month,
      purchaseRecords,
    });

    const expected = Array.from({ length: 30 }, (_, i) => 1000 + i * 100).reduce(
      (sum, val) => sum + val,
      0
    );
    expect(result.totalCost).toBe(expected);
    expect(result.hasData).toBe(true);
  });

  test("小数点を含む金額が正しく集計される", () => {
    const userId = "user_001";
    const year = 2024;
    const month = 3;
    const purchaseRecords = [
      {
        id: "purchase_001",
        userId: "user_001",
        purchaseDate: "2024-03-05",
        amount: 1500.5,
      },
      {
        id: "purchase_002",
        userId: "user_001",
        purchaseDate: "2024-03-10",
        amount: 2300.25,
      },
      {
        id: "purchase_003",
        userId: "user_001",
        purchaseDate: "2024-03-15",
        amount: 3200.75,
      },
    ];

    const result = calculateMonthlyCostTotal({
      userId,
      year,
      month,
      purchaseRecords,
    });

    expect(result.totalCost).toBe(7001.5);
  });

  test("負の金額が含まれる場合、返金として適切に処理される", () => {
    const userId = "user_001";
    const year = 2024;
    const month = 3;
    const purchaseRecords = [
      {
        id: "purchase_001",
        userId: "user_001",
        purchaseDate: "2024-03-05",
        amount: 5000,
      },
      {
        id: "purchase_002",
        userId: "user_001",
        purchaseDate: "2024-03-10",
        amount: -1000,
      },
    ];

    const result = calculateMonthlyCostTotal({
      userId,
      year,
      month,
      purchaseRecords,
    });

    expect(result.totalCost).toBe(4000);
  });

  test("ダッシュボード自動更新で食費実績がない月が0円と表示される", () => {
    const userId = "user_dashboard_test";
    const year = 2024;
    const month = 2;
    const purchaseRecords: Array<{
      id: string;
      userId: string;
      purchaseDate: string;
      amount: number;
    }> = [];

    const dashboardData = calculateMonthlyCostTotal({
      userId,
      year,
      month,
      purchaseRecords,
    });

    expect(dashboardData.totalCost).toBe(0);
    expect(dashboardData.hasData).toBe(false);
    expect(dashboardData.month).toBe(2);
    expect(dashboardData.year).toBe(2024);
  });
});