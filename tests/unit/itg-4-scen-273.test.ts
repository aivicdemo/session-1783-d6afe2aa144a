import { extractCorrelationVariables } from '../../src/logic/it-2-br-6-3-2';

describe('外部要因との相関分析・変数抽出', () => {
  // SCEN-273
  test('相関係数がちょうど有意水準の境界値である場合、正確に採用判定される', () => {
    // テストデータセット準備: 外部要因と需要データの相関係数が有意水準0.05での境界値となるペア
    // n=30の場合、r=±0.361が5%有意水準の境界値だが、ここでは簡略化してr=±0.195を境界値として検証
    const testDataset = [
      {
        external_factor: 'temperature',
        demand_correlation: 0.195, // ちょうど境界値
        sample_size: 30,
        confidence_level: 0.05,
      },
      {
        external_factor: 'rainfall',
        demand_correlation: -0.195, // ちょうど負の境界値
        sample_size: 30,
        confidence_level: 0.05,
      },
      {
        external_factor: 'humidity',
        demand_correlation: 0.196, // 境界値を僅かに上回る
        sample_size: 30,
        confidence_level: 0.05,
      },
      {
        external_factor: 'wind_speed',
        demand_correlation: 0.194, // 境界値を僅かに下回る
        sample_size: 30,
        confidence_level: 0.05,
      },
      {
        external_factor: 'uv_index',
        demand_correlation: -0.196, // 負の側で境界値を僅かに超える
        sample_size: 30,
        confidence_level: 0.05,
      },
      {
        external_factor: 'air_pressure',
        demand_correlation: -0.194, // 負の側で境界値を僅かに下回る
        sample_size: 30,
        confidence_level: 0.05,
      },
    ];

    // 相関分析モジュール初期化、有意水準0.05に設定
    const result = extractCorrelationVariables({
      dataset: testDataset,
      significance_level: 0.05,
      boundary_threshold: 0.195,
    });

    // 相関係数がちょうど境界値（r=±0.195）である変数ペアの採用判定結果を確認
    expect(result.adopted_variables).toContainEqual(
      expect.objectContaining({
        external_factor: 'temperature',
        demand_correlation: 0.195,
        adoption_decision: true,
        adoption_reason: 'boundary_threshold_met',
      })
    );

    expect(result.adopted_variables).toContainEqual(
      expect.objectContaining({
        external_factor: 'rainfall',
        demand_correlation: -0.195,
        adoption_decision: true,
        adoption_reason: 'boundary_threshold_met',
      })
    );

    // 相関係数が境界値を僅かに上回るペア（r=0.196）の採用判定結果を確認
    expect(result.adopted_variables).toContainEqual(
      expect.objectContaining({
        external_factor: 'humidity',
        demand_correlation: 0.196,
        adoption_decision: true,
        adoption_reason: 'exceeds_threshold',
      })
    );

    // 相関係数が境界値を僅かに超える負の側（r=-0.196）の採用判定結果を確認
    expect(result.adopted_variables).toContainEqual(
      expect.objectContaining({
        external_factor: 'uv_index',
        demand_correlation: -0.196,
        adoption_decision: true,
        adoption_reason: 'exceeds_threshold',
      })
    );

    // 相関係数が境界値を僅かに下回るペア（r=0.194）の採用判定結果を確認
    expect(result.rejected_variables).toContainEqual(
      expect.objectContaining({
        external_factor: 'wind_speed',
        demand_correlation: 0.194,
        adoption_decision: false,
        rejection_reason: 'below_threshold',
      })
    );

    // 相関係数が負の側で境界値を僅かに下回るペア（r=-0.194）の採用判定結果を確認
    expect(result.rejected_variables).toContainEqual(
      expect.objectContaining({
        external_factor: 'air_pressure',
        demand_correlation: -0.194,
        adoption_decision: false,
        rejection_reason: 'below_threshold',
      })
    );

    // 採用/非採用の判定ログおよび統計値を検証
    expect(result.adoption_statistics).toEqual({
      total_variables: 6,
      adopted_count: 4,
      rejected_count: 2,
      adoption_rate: 0.6667,
    });

    // 採用判定根拠がシステムログに明確に記録されていることを確認
    expect(result.decision_logs).toContainEqual(
      expect.objectContaining({
        external_factor: 'temperature',
        correlation_value: 0.195,
        threshold_value: 0.195,
        decision: 'adopted',
        log_timestamp: expect.any(String),
        justification: 'correlation_equals_boundary_threshold',
      })
    );

    expect(result.decision_logs).toContainEqual(
      expect.objectContaining({
        external_factor: 'wind_speed',
        correlation_value: 0.194,
        threshold_value: 0.195,
        decision: 'rejected',
        log_timestamp: expect.any(String),
        justification: 'correlation_below_boundary_threshold',
      })
    );

    // 境界値での判定が一貫性を持つことを確認
    const boundary_adopted = result.adopted_variables.filter(
      (v) => Math.abs(v.demand_correlation) >= 0.195
    );
    const boundary_rejected = result.rejected_variables.filter(
      (v) => Math.abs(v.demand_correlation) < 0.195
    );

    expect(boundary_adopted.length).toBe(4);
    expect(boundary_rejected.length).toBe(2);

    // 浮動小数点の丸め誤差を考慮した正確な比較判定がなされることを確認
    const precision_check = result.precision_validation;
    expect(precision_check.floating_point_tolerance).toBe(0.0001);
    expect(precision_check.all_comparisons_within_tolerance).toBe(true);
  });
});