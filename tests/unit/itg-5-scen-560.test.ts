import { aggregateAndValidateMealFeedback } from "../../src/logic/it-7-2-1";

describe("蓄積評価データの献立生成ロジック反映機能 - 矛盾検出と警告生成", () => {
  test("SCEN-560: 同一料理への極端に異なる評価が検出された場合、警告が生成され、献立生成ロジックは継続実行される", () => {
    // Arrange: 同一料理に対する矛盾した評価データを準備
    const contradictory_feedback_data = [
      {
        meal_id: "meal_A_001",
        dish_name: "トマトスープ",
        evaluation_score: 9.5,
        completion_rate: 95,
        user_id: "user_001",
        family_member_id: "member_001",
        recorded_at: "2024-01-08T18:30:00Z",
      },
      {
        meal_id: "meal_A_001",
        dish_name: "トマトスープ",
        evaluation_score: 1.0,
        completion_rate: 10,
        user_id: "user_001",
        family_member_id: "member_002",
        recorded_at: "2024-01-09T18:30:00Z",
      },
      {
        meal_id: "meal_A_001",
        dish_name: "トマトスープ",
        evaluation_score: 8.2,
        completion_rate: 85,
        user_id: "user_001",
        family_member_id: "member_003",
        recorded_at: "2024-01-10T18:30:00Z",
      },
    ];

    const meal_generation_config = {
      nutrition_constraints: {
        protein_min_g: 50,
        calcium_min_mg: 600,
      },
      family_restrictions: [
        { restriction_type: "allergy", ingredient: "egg" },
        { restriction_type: "dietary", item: "gluten_free" },
      ],
      budget_limit_yen: 3000,
      cooking_time_limit_minutes: 60,
    };

    // Act: 蓄積評価データの献立生成ロジック反映機能を呼び出す
    const result = aggregateAndValidateMealFeedback(
      contradictory_feedback_data,
      meal_generation_config
    );

    // Assert: 警告が正しく生成されたか検証
    expect(result.warnings).toBeDefined();
    expect(Array.isArray(result.warnings)).toBe(true);
    expect(result.warnings.length).toBeGreaterThanOrEqual(1);

    const contradiction_warning = result.warnings.find(
      (w: {
        level?: string;
        message?: string;
        dish_name?: string;
        evaluation_score_range?: { min: number; max: number };
      }) => w.dish_name === "トマトスープ"
    );

    expect(contradiction_warning).toBeDefined();
    expect(contradiction_warning.level).toBe("WARNING");
    expect(contradiction_warning.message).toMatch(/矛盾した評価データが検出されました/);
    expect(contradiction_warning.message).toMatch(/トマトスープ/);
    expect(contradiction_warning.evaluation_score_range).toEqual({
      min: 1.0,
      max: 9.5,
    });

    // Assert: ログに警告が正しく記録されているか検証
    expect(result.warning_log).toBeDefined();
    expect(result.warning_log).toContain("トマトスープ");
    expect(result.warning_log).toMatch(/WARNING/);
    expect(result.warning_log).toMatch(/1\.0.*9\.5/);

    // Assert: システムエラーが発生していないことを確認
    expect(result.system_error_occurred).toBe(false);
    expect(result.error_message).toBeNull();

    // Assert: 献立生成ロジックが継続実行されていることを確認
    expect(result.meal_generation_logic_executed).toBe(true);
    expect(result.generated_meal_candidates).toBeDefined();
    expect(Array.isArray(result.generated_meal_candidates)).toBe(true);
    expect(result.generated_meal_candidates.length).toBeGreaterThan(0);

    // Assert: 生成された献立が制約条件を満たしていることを確認
    result.generated_meal_candidates.forEach(
      (candidate: {
        nutrition_satisfied: boolean;
        restrictions_satisfied: boolean;
        budget_satisfied: boolean;
        cooking_time_satisfied: boolean;
      }) => {
        expect(candidate.nutrition_satisfied).toBe(true);
        expect(candidate.restrictions_satisfied).toBe(true);
        expect(candidate.budget_satisfied).toBe(true);
        expect(candidate.cooking_time_satisfied).toBe(true);
      }
    );

    // Assert: フィードバック集計が正常に完了していることを確認
    expect(result.aggregated_feedback_stats).toBeDefined();
    expect(result.aggregated_feedback_stats.total_feedback_records).toBe(3);
    expect(result.aggregated_feedback_stats.average_evaluation_score).toBe(
      (9.5 + 1.0 + 8.2) / 3
    );
    expect(result.aggregated_feedback_stats.average_completion_rate).toBe(
      (95 + 10 + 85) / 3
    );

    // Assert: 処理が完了したステータスであることを確認
    expect(result.processing_status).toBe("COMPLETED_WITH_WARNINGS");
    expect(result.timestamp).toBeDefined();
  });
});