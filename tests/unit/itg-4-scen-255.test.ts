import { determineMonthlyVerificationTiming } from "../../src/logic/it-1-br-6-2-1";

describe("需要予測精度検証ダッシュボード：月次検証タイミング判定機能", () => {
  // SCEN-255: [normal] 月次検証タイミング判定機能 - 当月1日から5日のアクセスで前月の予測精度検証実行が必要と判定される
  test("当月1日から5日のアクセスで前月の予測精度検証実行が必要と判定され、6日以降では不要と判定される", () => {
    const base_year = 2024;
    const base_month = 2;

    // 当月1日のアクセス: 前月予測精度検証実行が必要
    const result_day_1 = determineMonthlyVerificationTiming(
      new Date(`${base_year}-${String(base_month).padStart(2, "0")}-01T09:00:00Z`),
      {
        previous_month_forecast_data_exists: true,
        previous_month_actual_demand_data_exists: true,
      }
    );
    expect(result_day_1).toBe(true);

    // 当月2日のアクセス: 前月予測精度検証実行が必要
    const result_day_2 = determineMonthlyVerificationTiming(
      new Date(`${base_year}-${String(base_month).padStart(2, "0")}-02T09:00:00Z`),
      {
        previous_month_forecast_data_exists: true,
        previous_month_actual_demand_data_exists: true,
      }
    );
    expect(result_day_2).toBe(true);

    // 当月3日のアクセス: 前月予測精度検証実行が必要
    const result_day_3 = determineMonthlyVerificationTiming(
      new Date(`${base_year}-${String(base_month).padStart(2, "0")}-03T09:00:00Z`),
      {
        previous_month_forecast_data_exists: true,
        previous_month_actual_demand_data_exists: true,
      }
    );
    expect(result_day_3).toBe(true);

    // 当月4日のアクセス: 前月予測精度検証実行が必要
    const result_day_4 = determineMonthlyVerificationTiming(
      new Date(`${base_year}-${String(base_month).padStart(2, "0")}-04T09:00:00Z`),
      {
        previous_month_forecast_data_exists: true,
        previous_month_actual_demand_data_exists: true,
      }
    );
    expect(result_day_4).toBe(true);

    // 当月5日のアクセス: 前月予測精度検証実行が必要
    const result_day_5 = determineMonthlyVerificationTiming(
      new Date(`${base_year}-${String(base_month).padStart(2, "0")}-05T09:00:00Z`),
      {
        previous_month_forecast_data_exists: true,
        previous_month_actual_demand_data_exists: true,
      }
    );
    expect(result_day_5).toBe(true);

    // 当月6日のアクセス: 前月予測精度検証実行が不要
    const result_day_6 = determineMonthlyVerificationTiming(
      new Date(`${base_year}-${String(base_month).padStart(2, "0")}-06T09:00:00Z`),
      {
        previous_month_forecast_data_exists: true,
        previous_month_actual_demand_data_exists: true,
      }
    );
    expect(result_day_6).toBe(false);

    // 前月データが存在しない場合は1日～5日でも検証不要
    const result_no_data = determineMonthlyVerificationTiming(
      new Date(`${base_year}-${String(base_month).padStart(2, "0")}-01T09:00:00Z`),
      {
        previous_month_forecast_data_exists: false,
        previous_month_actual_demand_data_exists: true,
      }
    );
    expect(result_no_data).toBe(false);

    // 前月実績データが存在しない場合は1日～5日でも検証不要
    const result_no_actual = determineMonthlyVerificationTiming(
      new Date(`${base_year}-${String(base_month).padStart(2, "0")}-01T09:00:00Z`),
      {
        previous_month_forecast_data_exists: true,
        previous_month_actual_demand_data_exists: false,
      }
    );
    expect(result_no_actual).toBe(false);
  });
});