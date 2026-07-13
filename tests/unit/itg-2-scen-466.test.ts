import { describe, test, expect } from "@jest/globals";
import { getTransitionDataAggregation } from "../../src/logic/it-1-br-2-1-1-1";

describe("推移データ表示機能", () => {
  test("SCEN-466: 集計データが0件の場合に適切な空状態表示がなされる", () => {
    // Arrange
    const aggregation_period_start = new Date("2024-01-01T00:00:00Z");
    const aggregation_period_end = new Date("2024-01-07T23:59:59Z");
    const user_id = "user_20240101_empty";
    const nutrient_items = ["protein", "carbohydrate", "fat", "calcium"];

    // Act
    const result = getTransitionDataAggregation({
      user_id: user_id,
      aggregation_period_start: aggregation_period_start,
      aggregation_period_end: aggregation_period_end,
      nutrient_items: nutrient_items,
    });

    // Assert: 集計データが0件の場合、空状態オブジェクトが返される
    expect(result).toEqual({
      is_empty: true,
      data_count: 0,
      message: "データがありません",
      guidance: "検索条件を変更してください",
      chart_display: false,
      table_display: false,
      nutrients: [],
      aggregated_values: [],
    });

    // Assert: 空状態フラグが true
    expect(result.is_empty).toBe(true);

    // Assert: データ件数が 0
    expect(result.data_count).toBe(0);

    // Assert: ユーザーに分かりやすいメッセージが設定される
    expect(result.message).toBe("データがありません");
    expect(result.guidance).toBe("検索条件を変更してください");

    // Assert: グラフが表示されない
    expect(result.chart_display).toBe(false);

    // Assert: テーブルが表示されない
    expect(result.table_display).toBe(false);

    // Assert: 栄養素配列が空
    expect(result.nutrients.length).toBe(0);

    // Assert: 集計値配列が空
    expect(result.aggregated_values.length).toBe(0);

    // Assert: エラーフラグが存在しない（正常な空状態）
    expect(result).not.toHaveProperty("error_code");
    expect(result).not.toHaveProperty("error_message");
  });
});