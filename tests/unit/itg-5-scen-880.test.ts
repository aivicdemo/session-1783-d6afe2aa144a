import { calculateCompositeAlgorithmImprovementScore } from "../../src/logic/it-7-2-1";

describe("献立生成アルゴリズム改善の複合効果評価", () => {
  test("SCEN-880: 改善前後で一部指標が悪化した場合に複合効果として評価される", () => {
    // Arrange: 改善前のアルゴリズム指標
    const preImprovementMetrics = {
      accuracy_percentage: 95,
      processing_time_ms: 100,
      memory_usage_mb: 500,
    };

    // Arrange: 改善後のアルゴリズム指標
    const postImprovementMetrics = {
      accuracy_percentage: 97,
      processing_time_ms: 150,
      memory_usage_mb: 480,
    };

    // Arrange: 指標の重要度重み（精度60%、処理速度20%、メモリ20%）
    const metricWeights = {
      accuracy: 0.6,
      processing_time: 0.2,
      memory_usage: 0.2,
    };

    // Act: 複合効果スコアを計算
    const result = calculateCompositeAlgorithmImprovementScore(
      preImprovementMetrics,
      postImprovementMetrics,
      metricWeights
    );

    // Assert: 個別指標の変動を確認
    expect(result.individual_metrics.accuracy_change_percentage).toBe(2);
    expect(result.individual_metrics.processing_time_change_percentage).toBe(
      50
    );
    expect(result.individual_metrics.memory_usage_change_percentage).toBe(-4);

    // Assert: 各指標の改善/悪化判定を確認
    expect(result.individual_metrics.accuracy_improved).toBe(true);
    expect(result.individual_metrics.processing_time_deteriorated).toBe(true);
    expect(result.individual_metrics.memory_usage_improved).toBe(true);

    // Assert: 複合効果スコアが計算されていることを確認（0-100スケール）
    expect(result.composite_score).toBeGreaterThanOrEqual(0);
    expect(result.composite_score).toBeLessThanOrEqual(100);
    expect(typeof result.composite_score).toBe("number");

    // Assert: 複合効果評価が計算されていることを確認
    expect(result.overall_evaluation).toMatch(/改善|許容可能/);

    // Assert: 加重スコアが正確に計算されていることを確認
    // 精度改善: (97-95)/95 * 100 * 0.6 = 1.263
    // 処理速度悪化: (150-100)/100 * 100 * 0.2 = 10 (悪化)
    // メモリ改善: (500-480)/500 * 100 * 0.2 = 0.8
    // 複合スコア計算: 60 + (-10) + 20 = 70
    expect(result.composite_score).toBeCloseTo(70, 1);

    // Assert: 改善指標の効果が強調されていることを確認
    expect(result.positive_contributions).toContain("accuracy");
    expect(result.positive_contributions).toContain("memory_usage");

    // Assert: 悪化指標が記録されていることを確認
    expect(result.negative_contributions).toContain("processing_time");

    // Assert: 判定根拠として複数指標の相関関係が説明されていることを確認
    expect(result.evaluation_rationale).toMatch(/精度|accuracy/);
    expect(result.evaluation_rationale).toMatch(/メモリ|memory/);
    expect(result.evaluation_rationale).length.toBeGreaterThan(20);

    // Assert: 最終判定が「改善」または「許容可能な改善」であることを確認
    expect(["改善", "許容可能な改善"]).toContain(result.overall_evaluation);
  });
});