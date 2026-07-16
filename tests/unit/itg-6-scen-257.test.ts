import { analyzeMenuGenerationSuccessRateComparison } from '../../src/logic/it-1-br-8-2-2-1';

describe('献立生成成功率の改善効果定量比較・優先度決定', () => {
  // SCEN-257
  test('改善前後のデータが欠落している場合、比較処理がエラーで中断される', () => {
    // ケース1: 改善前のデータセットで必須項目（成功数）が欠落
    const before_data_missing_success_count = {
      success_count: undefined,
      total_attempts: 100,
      period_start: '2024-01-01',
      period_end: '2024-01-31',
    };
    const after_data_normal_1 = {
      success_count: 85,
      total_attempts: 100,
      period_start: '2024-02-01',
      period_end: '2024-02-29',
    };

    expect(() =>
      analyzeMenuGenerationSuccessRateComparison(
        before_data_missing_success_count,
        after_data_normal_1
      )
    ).toThrow(/成功数/);

    // ケース2: 改善前のデータセットで必須項目（総試行数）が欠落
    const before_data_missing_attempts = {
      success_count: 75,
      total_attempts: undefined,
      period_start: '2024-01-01',
      period_end: '2024-01-31',
    };

    expect(() =>
      analyzeMenuGenerationSuccessRateComparison(
        before_data_missing_attempts,
        after_data_normal_1
      )
    ).toThrow(/試行数/);

    // ケース3: 改善後のデータセットで必須項目（成功数）が欠落
    const before_data_normal = {
      success_count: 75,
      total_attempts: 100,
      period_start: '2024-01-01',
      period_end: '2024-01-31',
    };
    const after_data_missing_success_count = {
      success_count: undefined,
      total_attempts: 100,
      period_start: '2024-02-01',
      period_end: '2024-02-29',
    };

    expect(() =>
      analyzeMenuGenerationSuccessRateComparison(
        before_data_normal,
        after_data_missing_success_count
      )
    ).toThrow(/成功数/);

    // ケース4: 改善後のデータセットで必須項目（総試行数）が欠落
    const after_data_missing_attempts = {
      success_count: 85,
      total_attempts: undefined,
      period_start: '2024-02-01',
      period_end: '2024-02-29',
    };

    expect(() =>
      analyzeMenuGenerationSuccessRateComparison(
        before_data_normal,
        after_data_missing_attempts
      )
    ).toThrow(/試行数/);

    // ケース5: 改善前後の両データセットで複数の必須項目が欠落
    const before_data_missing_multiple = {
      success_count: undefined,
      total_attempts: undefined,
      period_start: '2024-01-01',
      period_end: '2024-01-31',
    };
    const after_data_missing_multiple = {
      success_count: undefined,
      total_attempts: 100,
      period_start: '2024-02-01',
      period_end: '2024-02-29',
    };

    expect(() =>
      analyzeMenuGenerationSuccessRateComparison(
        before_data_missing_multiple,
        after_data_missing_multiple
      )
    ).toThrow(/成功数/);

    // ケース6: 正常なデータセットで処理が正常に完了
    const before_data_valid = {
      success_count: 75,
      total_attempts: 100,
      period_start: '2024-01-01',
      period_end: '2024-01-31',
    };
    const after_data_valid = {
      success_count: 85,
      total_attempts: 100,
      period_start: '2024-02-01',
      period_end: '2024-02-29',
    };

    const result = analyzeMenuGenerationSuccessRateComparison(
      before_data_valid,
      after_data_valid
    );

    // 改善前成功率: 75 / 100 = 0.75
    // 改善後成功率: 85 / 100 = 0.85
    // 改善度: (0.85 - 0.75) / 0.75 * 100 = 13.33%
    expect(result).toEqual({
      before_success_rate: 0.75,
      after_success_rate: 0.85,
      improvement_percentage: expect.closeTo(13.33, 0.1),
      status: 'completed',
      error_message: null,
    });

    // ケース7: 改善前のデータセットで期間情報が欠落
    const before_data_missing_period = {
      success_count: 75,
      total_attempts: 100,
      period_start: undefined,
      period_end: '2024-01-31',
    };

    expect(() =>
      analyzeMenuGenerationSuccessRateComparison(
        before_data_missing_period,
        after_data_valid
      )
    ).toThrow(/期間/);

    // ケース8: 改善後のデータセットで期間情報が欠落
    const after_data_missing_period = {
      success_count: 85,
      total_attempts: 100,
      period_start: '2024-02-01',
      period_end: undefined,
    };

    expect(() =>
      analyzeMenuGenerationSuccessRateComparison(
        before_data_valid,
        after_data_missing_period
      )
    ).toThrow(/期間/);

    // ケース9: 成功数が負の値の場合
    const before_data_negative_success = {
      success_count: -5,
      total_attempts: 100,
      period_start: '2024-01-01',
      period_end: '2024-01-31',
    };

    expect(() =>
      analyzeMenuGenerationSuccessRateComparison(
        before_data_negative_success,
        after_data_valid
      )
    ).toThrow(/成功数/);

    // ケース10: 成功数が総試行数を超える場合
    const before_data_invalid_count = {
      success_count: 150,
      total_attempts: 100,
      period_start: '2024-01-01',
      period_end: '2024-01-31',
    };

    expect(() =>
      analyzeMenuGenerationSuccessRateComparison(
        before_data_invalid_count,
        after_data_valid
      )
    ).toThrow(/成功数/);
  });
});