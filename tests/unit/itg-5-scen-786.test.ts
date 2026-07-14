import { describe, test, expect, beforeEach } from "@jest/globals";
import { calculateDemandForecastAccuracy } from "../../src/logic/it-7-2-1";

describe("需要予測精度計算機能", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-786
  test("実績データが欠落している場合にエラーを発生させ計算を中止する", () => {
    // 実績データが部分的に欠落した入力データセット
    const incompleteDataset = {
      forecastValues: [100, 120, 110, 130, 125],
      actualValues: [105, null, 115, undefined, 128],
      forecastDates: [
        "2024-01-01",
        "2024-01-02",
        "2024-01-03",
        "2024-01-04",
        "2024-01-05",
      ],
    };

    // エラー発生を確認
    expect(() => {
      calculateDemandForecastAccuracy(incompleteDataset);
    }).toThrow(/実績データ/);
  });

  // SCEN-786: 実績値すべてが欠落している場合
  test("実績値がすべて欠落している場合はエラーを発生させる", () => {
    const allMissingActualData = {
      forecastValues: [100, 120, 110, 130, 125],
      actualValues: [],
      forecastDates: [
        "2024-01-01",
        "2024-01-02",
        "2024-01-03",
        "2024-01-04",
        "2024-01-05",
      ],
    };

    expect(() => {
      calculateDemandForecastAccuracy(allMissingActualData);
    }).toThrow(/実績データ/);
  });

  // SCEN-786: 予測値と実績値の配列長が不一致の場合
  test("予測値と実績値の配列長が不一致の場合はエラーを発生させる", () => {
    const mismatchedLengthData = {
      forecastValues: [100, 120, 110, 130, 125],
      actualValues: [105, 115, 120],
      forecastDates: [
        "2024-01-01",
        "2024-01-02",
        "2024-01-03",
        "2024-01-04",
        "2024-01-05",
      ],
    };

    expect(() => {
      calculateDemandForecastAccuracy(mismatchedLengthData);
    }).toThrow(/実績データ/);
  });

  // SCEN-786: 正常系 - すべてのデータが揃っている場合
  test("すべての必須実績データが揃っている場合は計算を実行し精度値を返す", () => {
    const completeDataset = {
      forecastValues: [100, 120, 110, 130, 125],
      actualValues: [105, 118, 115, 128, 130],
      forecastDates: [
        "2024-01-01",
        "2024-01-02",
        "2024-01-03",
        "2024-01-04",
        "2024-01-05",
      ],
    };

    const result = calculateDemandForecastAccuracy(completeDataset);

    expect(result).toHaveProperty("accuracy");
    expect(result).toHaveProperty("divergence");
    expect(result).toHaveProperty("categoryErrors");
    expect(typeof result.accuracy).toBe("number");
    expect(result.accuracy).toBeGreaterThanOrEqual(0);
    expect(result.accuracy).toBeLessThanOrEqual(100);
  });

  // SCEN-786: 実績データが null を含む場合
  test("実績データに null が含まれている場合はエラーを発生させる", () => {
    const dataWithNull = {
      forecastValues: [100, 120, 110],
      actualValues: [105, null, 115],
      forecastDates: ["2024-01-01", "2024-01-02", "2024-01-03"],
    };

    expect(() => {
      calculateDemandForecastAccuracy(dataWithNull);
    }).toThrow(/実績データ/);
  });

  // SCEN-786: 実績データが undefined を含む場合
  test("実績データに undefined が含まれている場合はエラーを発生させる", () => {
    const dataWithUndefined = {
      forecastValues: [100, 120, 110],
      actualValues: [105, 118, undefined],
      forecastDates: ["2024-01-01", "2024-01-02", "2024-01-03"],
    };

    expect(() => {
      calculateDemandForecastAccuracy(dataWithUndefined);
    }).toThrow(/実績データ/);
  });

  // SCEN-786: 実績データが空の場合
  test("実績データが空配列の場合はエラーを発生させる", () => {
    const emptyActualData = {
      forecastValues: [100, 120, 110, 130, 125],
      actualValues: [],
      forecastDates: [
        "2024-01-01",
        "2024-01-02",
        "2024-01-03",
        "2024-01-04",
        "2024-01-05",
      ],
    };

    expect(() => {
      calculateDemandForecastAccuracy(emptyActualData);
    }).toThrow(/実績データ/);
  });

  // SCEN-786: 実績データオブジェクトが undefined の場合
  test("実績データがすべて欠落した場合はエラーを発生させる", () => {
    const noActualDataField = {
      forecastValues: [100, 120, 110],
      actualValues: undefined,
      forecastDates: ["2024-01-01", "2024-01-02", "2024-01-03"],
    };

    expect(() => {
      calculateDemandForecastAccuracy(noActualDataField);
    }).toThrow(/実績データ/);
  });
});