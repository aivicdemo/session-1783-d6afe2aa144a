import { judgeAlgorithmImprovement } from "../../src/logic/it-3";

describe("食事評価データを献立生成ロジックに反映させる機能", () => {
  test("SCEN-437: アルゴリズム改善度判定機能 - 改善度が最小閾値未満の場合、改善されていないことを判定できる", () => {
    // Arrange: 最小閾値を5%に設定し、改善度が4%（最小閾値未満）のテストケースを準備
    const min_threshold_percent = 5;
    const improvement_degree_percent = 4;

    // Act: 改善度判定関数に改善度4%を入力
    const result = judgeAlgorithmImprovement({
      improvement_degree_percent,
      min_threshold_percent,
    });

    // Assert: 戻り値が「改善されていない」を示す結果が返されることを検証
    expect(result).toBe(false);

    // 追加検証: 改善度がちょうど閾値の場合（5%）は改善されていると判定
    const result_at_threshold = judgeAlgorithmImprovement({
      improvement_degree_percent: 5,
      min_threshold_percent,
    });
    expect(result_at_threshold).toBe(true);

    // 追加検証: 改善度が閾値を超える場合（6%）は改善されていると判定
    const result_above_threshold = judgeAlgorithmImprovement({
      improvement_degree_percent: 6,
      min_threshold_percent,
    });
    expect(result_above_threshold).toBe(true);

    // 追加検証: 改善度がゼロの場合は改善されていないと判定
    const result_zero = judgeAlgorithmImprovement({
      improvement_degree_percent: 0,
      min_threshold_percent,
    });
    expect(result_zero).toBe(false);
  });
});