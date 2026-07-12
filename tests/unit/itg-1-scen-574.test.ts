import { calculateIngredientsSeasonalPriorityScores } from "../../src/logic/it-3";

describe("食事評価データを献立生成ロジックに反映させる機能", () => {
  // SCEN-574: [normal] 季節食材・割引商品の優先度スコア計算 - 販売期間外の食材は優先度スコアが0に設定される
  test("販売期間外の食材は優先度スコア0、販売期間内は正の値を返す", () => {
    // 現在日時を 2024-06-15 に固定（春キャベツの販売期間 3月～5月 は外、冬大根の販売期間 11月～2月 も外）
    const currentDate = new Date("2024-06-15T00:00:00Z");

    // 季節食材マスタデータの入力
    const ingredients = [
      {
        ingredient_id: "ing_001",
        ingredient_name: "春キャベツ",
        season_start_month: 3,
        season_end_month: 5,
        base_priority_score: 80,
      },
      {
        ingredient_id: "ing_002",
        ingredient_name: "冬大根",
        season_start_month: 11,
        season_end_month: 2,
        base_priority_score: 75,
      },
      {
        ingredient_id: "ing_003",
        ingredient_name: "夏トマト",
        season_start_month: 6,
        season_end_month: 8,
        base_priority_score: 85,
      },
    ];

    // 割引情報（販売期間内のトマトに割引あり）
    const discountData = [
      {
        ingredient_id: "ing_003",
        discount_rate: 0.2,
        discount_start_date: "2024-06-01",
        discount_end_date: "2024-06-30",
      },
    ];

    // 期待結果の計算
    // 春キャベツ: 販売期間外（6月は3-5月範囲外） → スコア 0
    // 冬大根: 販売期間外（6月は11月-2月範囲外、年越しシーズンのみ有効） → スコア 0
    // 夏トマト: 販売期間内（6月は6-8月範囲内）＆割引対象（20%割引） → スコア 85 × (1 + 0.2) = 102
    const expectedResult = [
      {
        ingredient_id: "ing_001",
        ingredient_name: "春キャベツ",
        priority_score: 0,
      },
      {
        ingredient_id: "ing_002",
        ingredient_name: "冬大根",
        priority_score: 0,
      },
      {
        ingredient_id: "ing_003",
        ingredient_name: "夏トマト",
        priority_score: 102,
      },
    ];

    const result = calculateIngredientsSeasonalPriorityScores(
      ingredients,
      discountData,
      currentDate
    );

    // 全食材の優先度スコアを検証
    expect(result).toHaveLength(3);

    // 春キャベツ：販売期間外 → スコア 0
    expect(result[0]).toEqual({
      ingredient_id: "ing_001",
      ingredient_name: "春キャベツ",
      priority_score: 0,
    });

    // 冬大根：販売期間外 → スコア 0
    expect(result[1]).toEqual({
      ingredient_id: "ing_002",
      ingredient_name: "冬大根",
      priority_score: 0,
    });

    // 夏トマト：販売期間内 + 割引対象 → スコア 102
    expect(result[2]).toEqual({
      ingredient_id: "ing_003",
      ingredient_name: "夏トマト",
      priority_score: 102,
    });

    // 販売期間外の食材がすべてスコア 0 であることを確認
    const out_of_season_count = result.filter(
      (r) => r.priority_score === 0
    ).length;
    expect(out_of_season_count).toBe(2);

    // 販売期間内の食材はすべて正の値を持つことを確認
    const in_season = result.filter((r) => r.priority_score > 0);
    expect(in_season).toHaveLength(1);
    expect(in_season[0].priority_score).toBeGreaterThan(0);
  });
});