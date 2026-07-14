import { filterAnomalousAndMissingData } from "../../src/logic/it-7-2-1";

describe("献立生成アルゴリズム成功率・調理時間短縮度・ユーザー満足度スコアの週次自動集計", () => {
  // SCEN-765: [edge] 異常値・欠損値フィルタリング機能 - 全件が異常値・欠損値である場合、分析対象データが0件となりエラーが返される
  test("should return error when all records are anomalous or have missing values", () => {
    const input_records = [
      {
        user_id: "user_001",
        meal_plan_id: null, // 欠損値
        success_rate: -5, // 異常値（負の値）
        cooking_time_minutes: 9999, // 異常値（不合理な値）
        user_satisfaction_score: null, // 欠損値
        recorded_at: "2024-01-15T10:00:00Z",
      },
      {
        user_id: "user_002",
        meal_plan_id: "plan_002",
        success_rate: undefined, // 欠損値
        cooking_time_minutes: -120, // 異常値（負の値）
        user_satisfaction_score: 150, // 異常値（スコア範囲外）
        recorded_at: "2024-01-15T11:00:00Z",
      },
      {
        user_id: null, // 欠損値
        meal_plan_id: "plan_003",
        success_rate: 250, // 異常値（100%を超過）
        cooking_time_minutes: null, // 欠損値
        user_satisfaction_score: -10, // 異常値（負の値）
        recorded_at: "2024-01-15T12:00:00Z",
      },
    ];

    const result = filterAnomalousAndMissingData(input_records);

    expect(result.valid_records.length).toBe(0);
    expect(result.error_code).toBe("INSUFFICIENT_DATA");
    expect(result.error_message).toMatch(/有効なデータが存在しません|分析対象データが不足しています/);
    expect(result.filtered_record_count).toBe(0);
    expect(result.anomalous_record_count).toBe(3);
  });
});