import { validateQualityGate } from "../../src/logic/it-1-1-1";

describe("品質ゲート判定機能 - 境界値判定", () => {
  test("SCEN-597: 改善案が定量指標の境界値を満たす場合、正確に合格判定される", () => {
    // 前提: 献立自動生成アプリの品質ゲート判定機能にアクセス可能
    // 手順: 改善案の定量指標を合格閾値と同じ値に設定して判定実行

    // ケース1: 合格閾値 80.0 と完全に一致する場合 → 合格
    const improvement_pass_exact = {
      improvement_id: "IMP-001",
      metric_value: 80.0,
      pass_threshold: 80.0,
    };
    const result_exact = validateQualityGate(improvement_pass_exact);
    expect(result_exact).toEqual({
      improvement_id: "IMP-001",
      passed: true,
      metric_value: 80.0,
      threshold: 80.0,
      reason: "合格",
    });

    // ケース2: 閾値直前の値 79.9 を設定した場合 → 不合格
    const improvement_fail_below = {
      improvement_id: "IMP-002",
      metric_value: 79.9,
      pass_threshold: 80.0,
    };
    const result_below = validateQualityGate(improvement_fail_below);
    expect(result_below).toEqual({
      improvement_id: "IMP-002",
      passed: false,
      metric_value: 79.9,
      threshold: 80.0,
      reason: "不合格",
    });

    // ケース3: 閾値を超える値 80.1 を設定した場合 → 合格
    const improvement_pass_above = {
      improvement_id: "IMP-003",
      metric_value: 80.1,
      pass_threshold: 80.0,
    };
    const result_above = validateQualityGate(improvement_pass_above);
    expect(result_above).toEqual({
      improvement_id: "IMP-003",
      passed: true,
      metric_value: 80.1,
      threshold: 80.0,
      reason: "合格",
    });

    // ケース4: 異なる閾値（50.0）での境界値判定 → 50.0 は合格
    const improvement_pass_boundary_50 = {
      improvement_id: "IMP-004",
      metric_value: 50.0,
      pass_threshold: 50.0,
    };
    const result_50_exact = validateQualityGate(
      improvement_pass_boundary_50
    );
    expect(result_50_exact).toEqual({
      improvement_id: "IMP-004",
      passed: true,
      metric_value: 50.0,
      threshold: 50.0,
      reason: "合格",
    });

    // ケース5: 異なる閾値（50.0）での直前値 → 49.9 は不合格
    const improvement_fail_boundary_50 = {
      improvement_id: "IMP-005",
      metric_value: 49.9,
      pass_threshold: 50.0,
    };
    const result_50_below = validateQualityGate(improvement_fail_boundary_50);
    expect(result_50_below).toEqual({
      improvement_id: "IMP-005",
      passed: false,
      metric_value: 49.9,
      threshold: 50.0,
      reason: "不合格",
    });

    // ケース6: 異なる閾値（50.0）での超過値 → 50.1 は合格
    const improvement_pass_boundary_50_above = {
      improvement_id: "IMP-006",
      metric_value: 50.1,
      pass_threshold: 50.0,
    };
    const result_50_above = validateQualityGate(
      improvement_pass_boundary_50_above
    );
    expect(result_50_above).toEqual({
      improvement_id: "IMP-006",
      passed: true,
      metric_value: 50.1,
      threshold: 50.0,
      reason: "合格",
    });

    // ケース7: 無効な改善IDが空文字列の場合 → エラー
    expect(() => {
      validateQualityGate({
        improvement_id: "",
        metric_value: 80.0,
        pass_threshold: 80.0,
      });
    }).toThrow(/改善ID/);

    // ケース8: メトリクス値が負の値の場合 → エラー
    expect(() => {
      validateQualityGate({
        improvement_id: "IMP-008",
        metric_value: -10.0,
        pass_threshold: 80.0,
      });
    }).toThrow(/メトリクス/);

    // ケース9: 閾値が負の値の場合 → エラー
    expect(() => {
      validateQualityGate({
        improvement_id: "IMP-009",
        metric_value: 80.0,
        pass_threshold: -5.0,
      });
    }).toThrow(/閾値/);
  });
});