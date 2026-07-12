import { calculatePredictionAccuracyImprovementPriority } from "../../src/logic/it-3";

describe("食事評価データを献立生成ロジックに反映させる機能", () => {
  // SCEN-532
  test("需要予測精度改善判定機能 - 改善対象機能の優先度が乖離率の大きさに応じて正しく決定される", () => {
    // テスト用の予測データセット：乖離率 0%, 10%, 25%, 50%, 75%
    const divergence_rate_0_percent = {
      predicted_value: 100,
      actual_value: 100,
      divergence_rate: 0,
    };

    const divergence_rate_10_percent = {
      predicted_value: 100,
      actual_value: 110,
      divergence_rate: 10,
    };

    const divergence_rate_25_percent = {
      predicted_value: 100,
      actual_value: 125,
      divergence_rate: 25,
    };

    const divergence_rate_50_percent = {
      predicted_value: 100,
      actual_value: 150,
      divergence_rate: 50,
    };

    const divergence_rate_75_percent = {
      predicted_value: 100,
      actual_value: 175,
      divergence_rate: 75,
    };

    // 各パターンで改善対象機能の優先度を確認
    const priority_at_0_percent = calculatePredictionAccuracyImprovementPriority(
      divergence_rate_0_percent
    );

    const priority_at_10_percent =
      calculatePredictionAccuracyImprovementPriority(
        divergence_rate_10_percent
      );

    const priority_at_25_percent =
      calculatePredictionAccuracyImprovementPriority(
        divergence_rate_25_percent
      );

    const priority_at_50_percent =
      calculatePredictionAccuracyImprovementPriority(
        divergence_rate_50_percent
      );

    const priority_at_75_percent =
      calculatePredictionAccuracyImprovementPriority(
        divergence_rate_75_percent
      );

    // 乖離率0%では優先度が最も低い
    expect(priority_at_0_percent.priority_score).toBe(0);

    // 乖離率10%では優先度が上昇
    expect(priority_at_10_percent.priority_score).toBe(10);

    // 乖離率25%では優先度がさらに上昇
    expect(priority_at_25_percent.priority_score).toBe(25);

    // 乖離率50%では優先度がさらに上昇
    expect(priority_at_50_percent.priority_score).toBe(50);

    // 乖離率75%では優先度が最も高い
    expect(priority_at_75_percent.priority_score).toBe(75);

    // 優先度が乖離率と正の相関関係にあることを検証
    expect(priority_at_0_percent.priority_score).toBeLessThan(
      priority_at_10_percent.priority_score
    );
    expect(priority_at_10_percent.priority_score).toBeLessThan(
      priority_at_25_percent.priority_score
    );
    expect(priority_at_25_percent.priority_score).toBeLessThan(
      priority_at_50_percent.priority_score
    );
    expect(priority_at_50_percent.priority_score).toBeLessThan(
      priority_at_75_percent.priority_score
    );

    // 優先度の決定ロジックが正しく機能していることを確認
    expect(priority_at_0_percent).toEqual({
      divergence_rate: 0,
      priority_score: 0,
      improvement_level: "none",
    });

    expect(priority_at_10_percent).toEqual({
      divergence_rate: 10,
      priority_score: 10,
      improvement_level: "low",
    });

    expect(priority_at_25_percent).toEqual({
      divergence_rate: 25,
      priority_score: 25,
      improvement_level: "medium",
    });

    expect(priority_at_50_percent).toEqual({
      divergence_rate: 50,
      priority_score: 50,
      improvement_level: "high",
    });

    expect(priority_at_75_percent).toEqual({
      divergence_rate: 75,
      priority_score: 75,
      improvement_level: "critical",
    });
  });
});