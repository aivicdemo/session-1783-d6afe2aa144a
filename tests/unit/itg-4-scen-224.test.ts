import { determineForecastAnalysisTiming } from "../../src/logic/it-1-br-6-2-1";

describe("需要予測精度検証ダッシュボード：予測値と実績値の照合・乖離分析機能", () => {
  // SCEN-224: [error] 分析タイミング判定機能 - 月曜日以外の日時では分析タイミングが判定されない
  test("月曜日以外の日時では分析タイミングが判定されない", () => {
    // 火曜日（dayOfWeek = 2）でのテスト
    const tuesdayDate = new Date("2024-01-16T09:00:00Z"); // 2024-01-16は火曜日
    const tuesdayResult = determineForecastAnalysisTiming(tuesdayDate);
    expect(tuesdayResult.isAnalysisTiming).toBe(false);
    expect(tuesdayResult.timingType).toBeNull();

    // 水曜日（dayOfWeek = 3）でのテスト
    const wednesdayDate = new Date("2024-01-17T09:00:00Z"); // 2024-01-17は水曜日
    const wednesdayResult = determineForecastAnalysisTiming(wednesdayDate);
    expect(wednesdayResult.isAnalysisTiming).toBe(false);
    expect(wednesdayResult.timingType).toBeNull();

    // 日曜日（dayOfWeek = 0）でのテスト
    const sundayDate = new Date("2024-01-14T09:00:00Z"); // 2024-01-14は日曜日
    const sundayResult = determineForecastAnalysisTiming(sundayDate);
    expect(sundayResult.isAnalysisTiming).toBe(false);
    expect(sundayResult.timingType).toBeNull();

    // 月曜日（dayOfWeek = 1）09:00でのテスト（対照：タイミング判定される）
    const mondayDate = new Date("2024-01-15T09:00:00Z"); // 2024-01-15は月曜日
    const mondayResult = determineForecastAnalysisTiming(mondayDate);
    expect(mondayResult.isAnalysisTiming).toBe(true);
    expect(mondayResult.timingType).toBe("weekly");

    // 月初1日（dayOfWeek問わず）09:00でのテスト（対照：タイミング判定される）
    const monthlyDate = new Date("2024-02-01T09:00:00Z"); // 2024-02-01は月初
    const monthlyResult = determineForecastAnalysisTiming(monthlyDate);
    expect(monthlyResult.isAnalysisTiming).toBe(true);
    expect(monthlyResult.timingType).toBe("monthly");
  });
});