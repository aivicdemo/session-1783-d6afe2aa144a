import { calculateImprovementPriorityScore } from "../../src/logic/it-8-1-1-1";

describe("改善課題優先度スコアリング - 全軸同一値の場合", () => {
  test("SCEN-213: すべての軸スコアが同一値の場合、総合優先度スコアが正確に計算される", () => {
    // すべての軸スコアを同一値（5.0）に設定
    const userPainScore = 5.0;
    const marketOpportunityScore = 5.0;
    const implementationDifficultyScore = 5.0;

    // 各軸の重み係数を定義
    const userPainWeight = 0.4;
    const marketOpportunityWeight = 0.35;
    const implementationDifficultyWeight = 0.25;

    // 改善課題オブジェクトを構築
    const improvementProposal = {
      proposalId: "IMP-001",
      title: "栄養バランス最適化アルゴリズム改善",
      userPainScore,
      marketOpportunityScore,
      implementationDifficultyScore,
      userPainWeight,
      marketOpportunityWeight,
      implementationDifficultyWeight,
    };

    // 総合優先度スコア計算関数を実行
    const result = calculateImprovementPriorityScore(improvementProposal);

    // 期待値: (5.0 * 0.4) + (5.0 * 0.35) + (5.0 * 0.25) = 2.0 + 1.75 + 1.25 = 5.0
    const expectedScore = 5.0;

    // 計算結果が数値型で返されることを確認
    expect(typeof result).toBe("number");

    // 計算結果が期待される値と一致することを検証
    expect(result).toBe(expectedScore);

    // NaN、無限大などの異常値が返されていないことを確認
    expect(Number.isNaN(result)).toBe(false);
    expect(Number.isFinite(result)).toBe(true);

    // 計算ロジックが全軸を正確に加味していることをアサート
    // 各軸の計算が正確に行われ、重み係数が適切に適用されていることを確認
    const manualCalculation =
      userPainScore * userPainWeight +
      marketOpportunityScore * marketOpportunityWeight +
      implementationDifficultyScore * implementationDifficultyWeight;

    expect(result).toBe(manualCalculation);
  });
});