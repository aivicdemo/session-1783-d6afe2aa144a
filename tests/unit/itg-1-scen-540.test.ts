import { filterAndValidateExpenseData } from "../../src/logic/it-1-br-4-2-1";

describe("食事制限条件の変更時に過去献立との抵触検出機能", () => {
  // SCEN-540: [normal] 異常値・欠損値フィルタリング機能 - 食費実績データ内の異常値が検出された場合、正常データのみが次段階分析ロジックに渡される
  test("should filter out anomalies and missing values from expense data", () => {
    const mixedExpenseData = [
      {
        id: 1,
        date: "2024-01-15",
        amount: 5000,
        category: "vegetables",
        status: "valid",
      },
      {
        id: 2,
        date: "2024-01-16",
        amount: -1000,
        category: "meat",
        status: "valid",
      },
      {
        id: 3,
        date: "2024-01-17",
        amount: 999999999,
        category: "fish",
        status: "valid",
      },
      {
        id: 4,
        date: "2024-01-18",
        amount: null,
        category: "dairy",
        status: "valid",
      },
      {
        id: 5,
        date: "2024-01-19",
        amount: 3500,
        category: "fruits",
        status: "valid",
      },
      {
        id: 6,
        date: "2024-01-20",
        amount: undefined,
        category: "grains",
        status: "valid",
      },
      {
        id: 7,
        date: "2024-01-21",
        amount: 2800,
        category: "eggs",
        status: "valid",
      },
      {
        id: 8,
        date: "2024-01-22",
        amount: 0,
        category: "condiments",
        status: "valid",
      },
    ];

    const result = filterAndValidateExpenseData(mixedExpenseData);

    expect(result.validData).toEqual([
      {
        id: 1,
        date: "2024-01-15",
        amount: 5000,
        category: "vegetables",
        status: "valid",
      },
      {
        id: 5,
        date: "2024-01-19",
        amount: 3500,
        category: "fruits",
        status: "valid",
      },
      {
        id: 7,
        date: "2024-01-21",
        amount: 2800,
        category: "eggs",
        status: "valid",
      },
    ]);

    expect(result.invalidData).toEqual([
      {
        id: 2,
        date: "2024-01-16",
        amount: -1000,
        category: "meat",
        reason: "negative_amount",
      },
      {
        id: 3,
        date: "2024-01-17",
        amount: 999999999,
        category: "fish",
        reason: "extreme_value",
      },
      {
        id: 4,
        date: "2024-01-18",
        amount: null,
        category: "dairy",
        reason: "missing_value",
      },
      {
        id: 6,
        date: "2024-01-20",
        amount: undefined,
        category: "grains",
        reason: "missing_value",
      },
      {
        id: 8,
        date: "2024-01-22",
        amount: 0,
        category: "condiments",
        reason: "zero_amount",
      },
    ]);

    expect(result.validCount).toBe(3);
    expect(result.invalidCount).toBe(5);
    expect(result.filteringCompletedAt).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
    );
    expect(result.isReadyForNextAnalysis).toBe(true);
  });
});