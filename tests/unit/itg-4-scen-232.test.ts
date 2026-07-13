import { validateDivergenceAnalysisData } from '../../src/logic/it-1-br-6-2-1';

describe('需要予測精度検証ダッシュボード：予測値と実績値の照合・乖離分析機能', () => {
  // SCEN-232
  test('乖離分析データが不完全な場合、改善判定がエラーとなる', () => {
    // ハッピーパス: 完全なデータでは成功
    const complete_data = {
      prediction_value: 1500,
      actual_value: 1420,
      category_id: 'CAT-001',
      period_date: '2024-01-15',
    };
    const result_complete = validateDivergenceAnalysisData(complete_data);
    expect(result_complete.is_valid).toBe(true);
    expect(result_complete.divergence_rate).toBe(-5.33);
    expect(result_complete.error_message).toBe('');

    // エラーケース1: 予測値が欠落
    const missing_prediction = {
      prediction_value: undefined,
      actual_value: 1420,
      category_id: 'CAT-001',
      period_date: '2024-01-15',
    };
    expect(() => validateDivergenceAnalysisData(missing_prediction)).toThrow(
      /予測値/
    );

    // エラーケース2: 実績値が欠落
    const missing_actual = {
      prediction_value: 1500,
      actual_value: undefined,
      category_id: 'CAT-001',
      period_date: '2024-01-15',
    };
    expect(() => validateDivergenceAnalysisData(missing_actual)).toThrow(
      /実績値/
    );

    // エラーケース3: カテゴリIDが欠落
    const missing_category = {
      prediction_value: 1500,
      actual_value: 1420,
      category_id: undefined,
      period_date: '2024-01-15',
    };
    expect(() => validateDivergenceAnalysisData(missing_category)).toThrow(
      /カテゴリ/
    );

    // エラーケース4: 期間日付が欠落
    const missing_period = {
      prediction_value: 1500,
      actual_value: 1420,
      category_id: 'CAT-001',
      period_date: undefined,
    };
    expect(() => validateDivergenceAnalysisData(missing_period)).toThrow(
      /期間/
    );

    // エラーケース5: 予測値が null
    const null_prediction = {
      prediction_value: null,
      actual_value: 1420,
      category_id: 'CAT-001',
      period_date: '2024-01-15',
    };
    expect(() => validateDivergenceAnalysisData(null_prediction)).toThrow(
      /予測値/
    );

    // エラーケース6: 実績値が 0 未満（ビジネスルール上不可）
    const negative_actual = {
      prediction_value: 1500,
      actual_value: -100,
      category_id: 'CAT-001',
      period_date: '2024-01-15',
    };
    expect(() => validateDivergenceAnalysisData(negative_actual)).toThrow(
      /実績値/
    );

    // エラーケース7: 複数項目が欠落している場合
    const multiple_missing = {
      prediction_value: undefined,
      actual_value: undefined,
      category_id: 'CAT-001',
      period_date: '2024-01-15',
    };
    expect(() => validateDivergenceAnalysisData(multiple_missing)).toThrow(
      /予測値/
    );

    // ハッピーパス: 乖離率が正確に計算される（精度低下判定の10%閾値との連携）
    const precision_test_data = {
      prediction_value: 1000,
      actual_value: 900,
      category_id: 'CAT-002',
      period_date: '2024-01-20',
    };
    const result_precision = validateDivergenceAnalysisData(precision_test_data);
    expect(result_precision.is_valid).toBe(true);
    expect(result_precision.divergence_rate).toBe(-10.0);
    expect(result_precision.requires_improvement_analysis).toBe(true);
  });
});