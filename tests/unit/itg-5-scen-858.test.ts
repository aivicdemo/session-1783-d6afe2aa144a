import { calculateAlgorithmEffectComparison } from '../../src/logic/it-7-2-1';

describe('献立生成アルゴリズム改善効果の定量比較ダッシュボード', () => {
  // SCEN-858
  test('改善前データが存在しない場合に比較不可エラーが返却される', () => {
    const improvement_after_data = {
      success_rate: 0.85,
      cooking_time_reduction_degree: 0.12,
      user_satisfaction_score: 4.2,
      measurement_date: '2024-01-22T09:00:00Z',
      sample_size: 150,
    };

    const comparison_input = {
      before_metrics: null,
      after_metrics: improvement_after_data,
      comparison_type: 'quantitative_diff',
    };

    expect(() =>
      calculateAlgorithmEffectComparison(comparison_input)
    ).toThrow(/改善前データ/);
  });
});