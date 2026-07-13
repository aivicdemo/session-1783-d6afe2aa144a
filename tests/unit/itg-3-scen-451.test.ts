import { verifyDemandForecastValidationTiming } from '../../src/logic/it-1-br-3-2-1';

describe('購入実績の記録と月次食費削減効果の自動集計・分析機能', () => {
  // SCEN-451: [edge] 需要予測精度検証の実行判定 - 当月5日の終了時刻が境界値として指定された場合、その時刻直前の検証確認は実行対象、直後は対象外と判定される
  test('当月5日の終了時刻を境界値として、直前は実行対象、直後と完全一致は対象外と判定される', () => {
    const boundary_date_str = '2024-01-05T23:59:59Z';
    const boundary_date = new Date(boundary_date_str);

    // テストケース1: 境界値の直前時刻（2024-01-05T23:59:58Z）で検証確認の実行判定
    const before_boundary_str = '2024-01-05T23:59:58Z';
    const before_boundary = new Date(before_boundary_str);
    const result_before = verifyDemandForecastValidationTiming({
      current_time: before_boundary,
      boundary_time: boundary_date,
    });
    expect(result_before).toBe('executable');

    // テストケース2: 境界値の直後時刻（2024-01-06T00:00:00Z）で検証確認の実行判定
    const after_boundary_str = '2024-01-06T00:00:00Z';
    const after_boundary = new Date(after_boundary_str);
    const result_after = verifyDemandForecastValidationTiming({
      current_time: after_boundary,
      boundary_time: boundary_date,
    });
    expect(result_after).toBe('not_executable');

    // テストケース3: 境界値と完全に一致する時刻（2024-01-05T23:59:59Z）で検証確認の実行判定
    const exact_boundary_str = '2024-01-05T23:59:59Z';
    const exact_boundary = new Date(exact_boundary_str);
    const result_exact = verifyDemandForecastValidationTiming({
      current_time: exact_boundary,
      boundary_time: boundary_date,
    });
    expect(result_exact).toBe('not_executable');
  });
});