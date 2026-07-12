import { calculatePriorityScore } from "../../src/logic/it-3";

describe("季節食材・割引商品の優先度スコア計算", () => {
  // SCEN-573: [edge] 季節食材・割引商品の優先度スコア計算 - 割引率が閾値ちょうどの場合、正しく優先度判定される
  test("割引率が閾値ちょうど（20%）の場合、優先度判定ロジックが正しく機能する", () => {
    // ①閾値ちょうど（20%）の割引商品（季節食材フラグ: true）
    const seasonal_discount_threshold = {
      product_id: "P001",
      product_name: "春キャベツ",
      discount_rate: 20.0,
      is_seasonal: true,
      stock_availability: 0.95,
    };

    // ②閾値ちょうど（20%）の割引商品（季節食材フラグ: false）
    const non_seasonal_discount_threshold = {
      product_id: "P002",
      product_name: "通年キャベツ",
      discount_rate: 20.0,
      is_seasonal: false,
      stock_availability: 0.95,
    };

    // ③閾値未満（19.9%）の割引商品（季節食材フラグ: true）
    const seasonal_below_threshold = {
      product_id: "P003",
      product_name: "春ニンジン",
      discount_rate: 19.9,
      is_seasonal: true,
      stock_availability: 0.95,
    };

    // ④閾値以上（25%）の割引商品（季節食材フラグ: false）
    const high_discount_non_seasonal = {
      product_id: "P004",
      product_name: "通年ニンジン",
      discount_rate: 25.0,
      is_seasonal: false,
      stock_availability: 0.90,
    };

    // 優先度スコア計算実行
    const score_seasonal_threshold = calculatePriorityScore(
      seasonal_discount_threshold
    );
    const score_non_seasonal_threshold = calculatePriorityScore(
      non_seasonal_discount_threshold
    );
    const score_seasonal_below = calculatePriorityScore(
      seasonal_below_threshold
    );
    const score_high_discount = calculatePriorityScore(
      high_discount_non_seasonal
    );

    // ①商品が『割引対象』として正しく判定される（割引率≥20%）
    // 季節食材フラグ: true, 割引率: 20%, 在庫充足度: 0.95
    // 基本スコア: 20 * 1.0（割引係数）+ 95（在庫充足度100倍）= 115
    // 季節食材ボーナス: 115 * 0.15（季節食材加算率15%）= 17.25
    // 最終スコア: 115 + 17.25 = 132.25
    expect(score_seasonal_threshold).toBeCloseTo(132.25, 2);

    // ①商品が『割引対象』として正しく判定される（割引率≥20%, 季節食材フラグ: false）
    // 基本スコア: 20 * 1.0 + 95 = 115
    // 季節食材ボーナスなし
    // 最終スコア: 115
    expect(score_non_seasonal_threshold).toBeCloseTo(115, 2);

    // ②季節食材フラグがtrueの場合、基本スコアに季節食材ボーナスが加算される
    // 割引率が閾値未満（19.9%）でも季節食材フラグがtrueなら加算
    // 基本スコア: 19.9 * 0.95（割引係数<1）+ 95 = 95 + 18.905 = 113.905
    // 季節食材ボーナス: 113.905 * 0.15 = 17.0857...
    // 最終スコア: 113.905 + 17.0857 = 130.99...
    expect(score_seasonal_below).toBeCloseTo(130.99, 1);

    // ③割引率20%の商品と19.9%の商品でスコア評価が異なる
    // 20% with 季節食材: 132.25
    // 19.9% with 季節食材: 130.99
    // スコアが異なり、且つ20%の方が高い
    expect(score_seasonal_threshold).toBeGreaterThan(score_seasonal_below);
    expect(score_seasonal_threshold).not.toEqual(score_seasonal_below);

    // ①割引率20%（季節食材なし）と割引率25%（季節食材なし）
    // 20% non-seasonal: 115
    // 25% non-seasonal: 25 * 1.0 + 90（0.90 * 100）= 115
    // 同点だが、在庫充足度差により異なるケースも確認
    expect(score_high_discount).toBeCloseTo(115, 2);

    // ④計算結果が数値型で返却され、NaNやnullが含まれていない
    expect(typeof score_seasonal_threshold).toBe("number");
    expect(typeof score_non_seasonal_threshold).toBe("number");
    expect(typeof score_seasonal_below).toBe("number");
    expect(typeof score_high_discount).toBe("number");

    expect(Number.isNaN(score_seasonal_threshold)).toBe(false);
    expect(Number.isNaN(score_non_seasonal_threshold)).toBe(false);
    expect(Number.isNaN(score_seasonal_below)).toBe(false);
    expect(Number.isNaN(score_high_discount)).toBe(false);

    expect(score_seasonal_threshold).not.toBeNull();
    expect(score_non_seasonal_threshold).not.toBeNull();
    expect(score_seasonal_below).not.toBeNull();
    expect(score_high_discount).not.toBeNull();

    // ②季節食材フラグによるスコア差
    // 同じ割引率・在庫充足度でも季節食材フラグで差が出ることを確認
    const score_diff_seasonal =
      score_seasonal_threshold - score_non_seasonal_threshold;
    expect(score_diff_seasonal).toBeCloseTo(17.25, 2); // 季節食材ボーナス
    expect(score_diff_seasonal).toBeGreaterThan(0);
  });
});