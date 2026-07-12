import { extractFilteredMetricsData } from "../../src/logic/it-3";

describe("食事評価データを献立生成ロジックに反映させる機能", () => {
  // SCEN-711
  test("調理時間短縮度スコアが0の境界値データが正しくフィルタリングされる", () => {
    const test_data = [
      {
        user_id: "user_001",
        meal_plan_id: "plan_001",
        cooking_time_reduction_score: 0,
        satisfaction_score: 4.5,
        completion_rate: 0.95,
        timestamp: "2024-01-15T19:00:00Z",
      },
      {
        user_id: "user_002",
        meal_plan_id: "plan_002",
        cooking_time_reduction_score: 0,
        satisfaction_score: 4.0,
        completion_rate: 0.88,
        timestamp: "2024-01-16T19:00:00Z",
      },
      {
        user_id: "user_003",
        meal_plan_id: "plan_003",
        cooking_time_reduction_score: -5,
        satisfaction_score: 3.5,
        completion_rate: 0.80,
        timestamp: "2024-01-17T19:00:00Z",
      },
      {
        user_id: "user_004",
        meal_plan_id: "plan_004",
        cooking_time_reduction_score: 15,
        satisfaction_score: 4.8,
        completion_rate: 0.98,
        timestamp: "2024-01-18T19:00:00Z",
      },
      {
        user_id: "user_005",
        meal_plan_id: "plan_005",
        cooking_time_reduction_score: 0,
        satisfaction_score: 3.2,
        completion_rate: 0.75,
        timestamp: "2024-01-19T19:00:00Z",
      },
    ];

    const filter_condition = {
      cooking_time_reduction_score: 0,
    };

    const result = extractFilteredMetricsData(test_data, filter_condition);

    expect(result.data).toHaveLength(3);

    expect(result.data).toEqual([
      {
        user_id: "user_001",
        meal_plan_id: "plan_001",
        cooking_time_reduction_score: 0,
        satisfaction_score: 4.5,
        completion_rate: 0.95,
        timestamp: "2024-01-15T19:00:00Z",
      },
      {
        user_id: "user_002",
        meal_plan_id: "plan_002",
        cooking_time_reduction_score: 0,
        satisfaction_score: 4.0,
        completion_rate: 0.88,
        timestamp: "2024-01-16T19:00:00Z",
      },
      {
        user_id: "user_005",
        meal_plan_id: "plan_005",
        cooking_time_reduction_score: 0,
        satisfaction_score: 3.2,
        completion_rate: 0.75,
        timestamp: "2024-01-19T19:00:00Z",
      },
    ]);

    const has_negative_score = result.data.some(
      (item) => item.cooking_time_reduction_score < 0
    );
    expect(has_negative_score).toBe(false);

    const has_positive_score = result.data.some(
      (item) => item.cooking_time_reduction_score > 0
    );
    expect(has_positive_score).toBe(false);

    expect(result.total_count).toBe(3);

    result.data.forEach((item) => {
      expect(item.cooking_time_reduction_score).toBe(0);
    });
  });
});