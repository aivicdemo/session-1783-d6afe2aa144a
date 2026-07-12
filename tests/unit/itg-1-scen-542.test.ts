import { describe, test, expect, beforeEach, afterEach } from "@jest/globals";
import { filterAnomalousData } from "../../src/logic/it-1-br-4-2-1";

describe("食事制限条件の変更時に過去献立との抵触検出機能", () => {
  let consoleErrorSpy: jest.SpyInstance;
  let errorLogBuffer: Array<{ message: string; timestamp: string }>;

  beforeEach(() => {
    errorLogBuffer = [];
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation((msg) => {
      errorLogBuffer.push({
        message: String(msg),
        timestamp: new Date().toISOString(),
      });
    });
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  // SCEN-542
  test("全データが異常値の場合でも処理が失敗せずエラーハンドリングされる", () => {
    const allAnomalousDataset = [
      {
        menuId: null,
        satisfactionScore: undefined,
        completionRate: "invalid",
        requestText: null,
      },
      {
        menuId: -999,
        satisfactionScore: 6,
        completionRate: -0.5,
        requestText: NaN,
      },
      {
        menuId: undefined,
        satisfactionScore: null,
        completionRate: null,
        requestText: undefined,
      },
      {
        menuId: "not-a-number",
        satisfactionScore: {},
        completionRate: [],
        requestText: 12345,
      },
      {
        menuId: 0,
        satisfactionScore: -100,
        completionRate: 150,
        requestText: "",
      },
    ];

    let result: {
      validRecords: number;
      filteredRecords: Array<Record<string, unknown>>;
      errorCode: string;
      errorMessage: string;
      applicationContinues: boolean;
    };
    let exceptionThrown = false;

    try {
      result = filterAnomalousData(allAnomalousDataset);
    } catch {
      exceptionThrown = true;
    }

    expect(exceptionThrown).toBe(false);

    expect(result).toBeDefined();
    expect(result.validRecords).toBe(0);
    expect(Array.isArray(result.filteredRecords)).toBe(true);
    expect(result.filteredRecords.length).toBe(0);

    expect(result.errorCode).toBe("ALL_DATA_ANOMALOUS");
    expect(result.errorMessage).toMatch(/異常値/);

    expect(result.applicationContinues).toBe(true);

    expect(errorLogBuffer.length).toBeGreaterThan(0);
    expect(errorLogBuffer[0].message).toMatch(/異常値/);
    expect(errorLogBuffer[0].timestamp).toBeTruthy();
  });
});