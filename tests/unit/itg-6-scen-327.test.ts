import { verifyDifferentiationAxis } from "../../src/logic/it-8-1-1-1";

describe("ユーザーインタビュー記録と利用ログからペイン要因を抽出し優先度マトリクスを生成", () => {
  test("SCEN-327: [edge] 対応度ギャップがちょうど30の境界値でペイン要因が差別化軸として認定される", () => {
    // テストデータ: 対応度ギャップが正確に30となる競合アプリとの比較シナリオ
    const painFactorId = "pf_food_restriction_001";
    const painFactorName = "食材制限対応";
    const ownAppResponseScore = 85; // 自社アプリの対応度スコア
    const competitorAppResponseScore = 55; // 競合アプリの対応度スコア
    // ギャップ = 85 - 55 = 30 (境界値)

    const differentiationThreshold = 30; // 差別化軸の最小閾値

    const testInput = {
      painFactorId,
      painFactorName,
      ownAppResponseScore,
      competitorAppResponseScore,
      differentiationThreshold,
    };

    // 差別化軸検証機能の判定ロジックを実行
    const result = verifyDifferentiationAxis(testInput);

    // 返却されたペイン要因の認定ステータスを確認
    expect(result).toEqual({
      painFactorId: "pf_food_restriction_001",
      painFactorName: "食材制限対応",
      ownAppResponseScore: 85,
      competitorAppResponseScore: 55,
      responseGap: 30,
      status: "QUALIFIED",
      judgmentLog:
        "対応度ギャップ=30は差別化軸の最小閾値を満たす",
      qualificationReason: "差別化軸として認定",
      timestamp: expect.any(String),
    });

    // 認定理由に『対応度ギャップ30』が境界値として記録されていることを検証
    expect(result.status).toBe("QUALIFIED");
    expect(result.responseGap).toBe(30);
    expect(result.judgmentLog).toMatch(/対応度ギャップ=30/);
    expect(result.judgmentLog).toMatch(/最小閾値/);
  });
});