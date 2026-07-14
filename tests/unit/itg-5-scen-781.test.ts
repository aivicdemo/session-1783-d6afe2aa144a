import { determineMonthlyVerificationEligibility } from '../../src/logic/it-7-2-1';

describe('月次検証タイミング判定機能', () => {
  // SCEN-781: [edge] 月次検証タイミング判定機能 - 当月1日と5日の境界値でも検証実行可否判定が正確に実行される
  test('当月1日から4日までは検証実行可能、5日以降は不可と判定される', () => {
    // 当月1日 00:00:00 - 検証実行可能
    const month_1_start = new Date('2024-01-01T00:00:00Z');
    const result_1_start = determineMonthlyVerificationEligibility(month_1_start);
    expect(result_1_start).toEqual({
      eligible: true,
      message: '検証実行可能',
    });

    // 当月1日 23:59:59 - 検証実行可能
    const month_1_end = new Date('2024-01-01T23:59:59Z');
    const result_1_end = determineMonthlyVerificationEligibility(month_1_end);
    expect(result_1_end).toEqual({
      eligible: true,
      message: '検証実行可能',
    });

    // 当月4日 23:59:59 - 検証実行可能
    const month_4_end = new Date('2024-01-04T23:59:59Z');
    const result_4_end = determineMonthlyVerificationEligibility(month_4_end);
    expect(result_4_end).toEqual({
      eligible: true,
      message: '検証実行可能',
    });

    // 当月5日 00:00:00 - 検証実行不可
    const month_5_start = new Date('2024-01-05T00:00:00Z');
    const result_5_start = determineMonthlyVerificationEligibility(month_5_start);
    expect(result_5_start).toEqual({
      eligible: false,
      message: '検証実行不可',
    });

    // 当月5日 23:59:59 - 検証実行不可
    const month_5_end = new Date('2024-01-05T23:59:59Z');
    const result_5_end = determineMonthlyVerificationEligibility(month_5_end);
    expect(result_5_end).toEqual({
      eligible: false,
      message: '検証実行不可',
    });
  });
});