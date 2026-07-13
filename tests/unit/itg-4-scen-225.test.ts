import { determineAnalysisTimingForMonthly } from '../../src/logic/it-1-br-6-2-1';

describe('需要予測精度検証ダッシュボード：分析タイミング判定機能', () => {
  // SCEN-225: [edge] 分析タイミング判定機能 - 月初日以外で月次分析タイミングが誤判定されない
  test('月初日以外では月次分析タイミングがfalseと判定され、月初日のみtrueと判定される', () => {
    // 月初日以外（2月15日）でのテスト
    const feb_15_2024 = new Date('2024-02-15T09:00:00Z');
    const result_feb_15 = determineAnalysisTimingForMonthly({
      current_datetime: feb_15_2024,
    });
    expect(result_feb_15).toBe(false);

    // 同じ月の末日に近い日付（2月28日）でのテスト
    const feb_28_2024 = new Date('2024-02-28T09:00:00Z');
    const result_feb_28 = determineAnalysisTimingForMonthly({
      current_datetime: feb_28_2024,
    });
    expect(result_feb_28).toBe(false);

    // 月初日（3月1日）でのテスト
    const mar_01_2024 = new Date('2024-03-01T09:00:00Z');
    const result_mar_01 = determineAnalysisTimingForMonthly({
      current_datetime: mar_01_2024,
    });
    expect(result_mar_01).toBe(true);

    // 別の月の初日（1月1日）でのテスト
    const jan_01_2024 = new Date('2024-01-01T09:00:00Z');
    const result_jan_01 = determineAnalysisTimingForMonthly({
      current_datetime: jan_01_2024,
    });
    expect(result_jan_01).toBe(true);

    // 別の月の非初日（1月15日）でのテスト
    const jan_15_2024 = new Date('2024-01-15T09:00:00Z');
    const result_jan_15 = determineAnalysisTimingForMonthly({
      current_datetime: jan_15_2024,
    });
    expect(result_jan_15).toBe(false);

    // 月初日だが異なる時刻（深夜0時）でのテスト - 月初日であればtrueと判定されるべき
    const apr_01_2024_midnight = new Date('2024-04-01T00:00:00Z');
    const result_apr_01_midnight = determineAnalysisTimingForMonthly({
      current_datetime: apr_01_2024_midnight,
    });
    expect(result_apr_01_midnight).toBe(true);

    // 月初日だが異なる時刻（23時）でのテスト
    const apr_01_2024_late = new Date('2024-04-01T23:59:59Z');
    const result_apr_01_late = determineAnalysisTimingForMonthly({
      current_datetime: apr_01_2024_late,
    });
    expect(result_apr_01_late).toBe(true);
  });
});