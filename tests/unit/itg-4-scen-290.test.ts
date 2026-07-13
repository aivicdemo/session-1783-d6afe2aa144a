import { correlateExternalFactorsWithPredictionErrors } from "../../src/logic/it-2-br-6-3-2";

describe("外部データと実績需要の相関分析・変数抽出機能", () => {
  // SCEN-290: [edge] 予測精度低下要因と外部要因の相関判定 - 相関係数が正確に閾値と一致する境界値の場合に関連付けられる
  test("相関係数が閾値と正確に一致するとき、予測精度低下要因と外部要因が関連付けられる", () => {
    const correlation_threshold = 0.7;

    // ケース1: 相関係数 = 閾値（境界値・正確に一致）
    const test_data_exact_match = {
      prediction_error_id: "err_001",
      external_factor_id: "ext_001",
      correlation_coefficient: 0.7,
      threshold: correlation_threshold,
    };

    const result_exact_match = correlateExternalFactorsWithPredictionErrors(
      test_data_exact_match
    );

    expect(result_exact_match.is_correlated).toBe(true);
    expect(result_exact_match.correlation_coefficient).toBe(0.7);
    expect(result_exact_match.threshold_comparison).toBe("equal");
    expect(result_exact_match.linked_pairs).toEqual([
      {
        prediction_error_id: "err_001",
        external_factor_id: "ext_001",
        correlation_coefficient: 0.7,
      },
    ]);

    // ケース2: 相関係数 = 閾値 - 0.0001（閾値より小さい）
    const test_data_below_threshold = {
      prediction_error_id: "err_002",
      external_factor_id: "ext_002",
      correlation_coefficient: 0.6999,
      threshold: correlation_threshold,
    };

    const result_below_threshold = correlateExternalFactorsWithPredictionErrors(
      test_data_below_threshold
    );

    expect(result_below_threshold.is_correlated).toBe(false);
    expect(result_below_threshold.correlation_coefficient).toBe(0.6999);
    expect(result_below_threshold.threshold_comparison).toBe("below");
    expect(result_below_threshold.linked_pairs).toEqual([]);

    // ケース3: 相関係数 = 閾値 + 0.0001（閾値より大きい）
    const test_data_above_threshold = {
      prediction_error_id: "err_003",
      external_factor_id: "ext_003",
      correlation_coefficient: 0.7001,
      threshold: correlation_threshold,
    };

    const result_above_threshold = correlateExternalFactorsWithPredictionErrors(
      test_data_above_threshold
    );

    expect(result_above_threshold.is_correlated).toBe(true);
    expect(result_above_threshold.correlation_coefficient).toBe(0.7001);
    expect(result_above_threshold.threshold_comparison).toBe("above");
    expect(result_above_threshold.linked_pairs).toEqual([
      {
        prediction_error_id: "err_003",
        external_factor_id: "ext_003",
        correlation_coefficient: 0.7001,
      },
    ]);
  });
});