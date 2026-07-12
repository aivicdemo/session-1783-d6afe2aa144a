import { calculateMenuEvaluationScore } from "../../src/logic/it-1-br-1783670064270-1-1-1";

describe("複数制約条件の充足度判定", () => {
  test("SCEN-347: 一部の制約条件のみ満たす献立案は総合スコアが正しく低下して評価される", () => {
    // すべての制約条件を満たす献立案
    const perfectMenu = {
      calorieScore: 100,
      sodiumScore: 100,
      allergenScore: 100,
      cookingTimeScore: 100,
    };

    // 一部の制約条件のみを満たす献立案（カロリーとアレルゲンは満たすが、塩分と調理時間を超える）
    const partialMenu = {
      calorieScore: 100,
      sodiumScore: 40,
      allergenScore: 100,
      cookingTimeScore: 50,
    };

    // 計算結果
    const perfectMenuScore = calculateMenuEvaluationScore(perfectMenu);
    const partialMenuScore = calculateMenuEvaluationScore(partialMenu);

    // すべての制約条件を満たす献立案のスコア期待値
    // 4つすべての制約が満たされているため、平均値 = (100 + 100 + 100 + 100) / 4 = 100
    expect(perfectMenuScore).toBe(100);

    // 一部の制約条件のみを満たす献立案のスコア期待値
    // 平均値 = (100 + 40 + 100 + 50) / 4 = 290 / 4 = 72.5
    expect(partialMenuScore).toBe(72.5);

    // 一部条件のみ満たす献立案のスコアが、すべて満たす献立案より低いことを確認
    expect(partialMenuScore).toBeLessThan(perfectMenuScore);

    // スコアが0～100の範囲内に正規化されていることを確認
    expect(perfectMenuScore).toBeGreaterThanOrEqual(0);
    expect(perfectMenuScore).toBeLessThanOrEqual(100);
    expect(partialMenuScore).toBeGreaterThanOrEqual(0);
    expect(partialMenuScore).toBeLessThanOrEqual(100);

    // さらに低い充足度の献立案をテスト（1つの制約のみ満たす場合）
    const minimalMenu = {
      calorieScore: 100,
      sodiumScore: 0,
      allergenScore: 0,
      cookingTimeScore: 0,
    };

    const minimalMenuScore = calculateMenuEvaluationScore(minimalMenu);

    // 期待値 = (100 + 0 + 0 + 0) / 4 = 25
    expect(minimalMenuScore).toBe(25);

    // スコアの段階的低下が正しく計算されていることを確認
    expect(perfectMenuScore).toBeGreaterThan(partialMenuScore);
    expect(partialMenuScore).toBeGreaterThan(minimalMenuScore);

    // 段階的な低下幅が正しいことを確認
    // perfectMenuScore - partialMenuScore = 100 - 72.5 = 27.5
    expect(perfectMenuScore - partialMenuScore).toBe(27.5);

    // partialMenuScore - minimalMenuScore = 72.5 - 25 = 47.5
    expect(partialMenuScore - minimalMenuScore).toBe(47.5);
  });
});