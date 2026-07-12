import { detectNutritionConflictAndNotify } from "../../src/logic/it-1-br-4-2-1";

describe("食事制限条件の変更時に過去献立との抵触検出機能", () => {
  // SCEN-582: [normal] ルール変更の自動検証 - 検証で栄養基準抵触が検出された場合、開発チームに通知され実装前に停止される
  test("should detect nutrition conflict, notify development team, and halt rule implementation when validation fails", async () => {
    // Arrange: 既存の献立データと新しいルール変更を準備
    const existing_meal_id = "meal_001";
    const existing_nutrition_protein_g = 75;
    const existing_nutrition_carb_g = 250;
    const existing_nutrition_fat_g = 60;
    const existing_nutrition_fiber_g = 25;

    const new_rule_min_protein_g = 90;
    const new_rule_max_carb_g = 180;
    const new_rule_min_fiber_g = 30;

    const conflict_detection_result = {
      has_conflict: true,
      conflict_type: "nutrition_standard",
      conflicting_field: "carbohydrate",
      existing_value: existing_nutrition_carb_g,
      new_limit: new_rule_max_carb_g,
      conflict_severity: "high",
      affected_meal_count: 42,
      affected_meal_ids: ["meal_001", "meal_002", "meal_003"],
    };

    const notification_payload = {
      recipient_type: "development_team",
      notification_type: "rule_validation_failure",
      severity_level: "high",
      rule_change_id: "rule_change_20240115_001",
      detected_conflicts: [
        {
          conflict_id: "conflict_001",
          meal_id: existing_meal_id,
          conflict_type: conflict_detection_result.conflict_type,
          conflicting_field: conflict_detection_result.conflicting_field,
          existing_value: conflict_detection_result.existing_value,
          new_limit: conflict_detection_result.new_limit,
          severity: conflict_detection_result.conflict_severity,
        },
      ],
      affected_meal_count: conflict_detection_result.affected_meal_count,
      affected_meal_ids: conflict_detection_result.affected_meal_ids,
      recommendation: "halt_implementation",
      timestamp: "2024-01-15T10:30:00Z",
    };

    const input_rule_change = {
      rule_change_id: "rule_change_20240115_001",
      change_type: "nutrition_standard_update",
      new_rules: {
        min_protein_g: new_rule_min_protein_g,
        max_carb_g: new_rule_max_carb_g,
        min_fiber_g: new_rule_min_fiber_g,
      },
      validation_enabled: true,
      affected_past_meals: [
        {
          meal_id: existing_meal_id,
          current_nutrition: {
            protein_g: existing_nutrition_protein_g,
            carb_g: existing_nutrition_carb_g,
            fat_g: existing_nutrition_fat_g,
            fiber_g: existing_nutrition_fiber_g,
          },
        },
      ],
    };

    // Act: ルール変更の自動検証と通知プロセスを実行
    const result = await detectNutritionConflictAndNotify(input_rule_change);

    // Assert: 栄養基準抵触が検出されたことを確認
    expect(result.validation_status).toBe("failed");
    expect(result.has_nutrition_conflict).toBe(true);

    // Assert: 検出された抵触の詳細を確認
    expect(result.detected_conflicts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          conflict_type: "nutrition_standard",
          conflicting_field: "carbohydrate",
          existing_value: existing_nutrition_carb_g,
          new_limit: new_rule_max_carb_g,
          severity: "high",
        }),
      ])
    );

    // Assert: 影響を受ける献立の数が正しく計算されたことを確認
    expect(result.affected_meal_count).toBe(42);
    expect(result.affected_meal_ids).toContain(existing_meal_id);

    // Assert: 開発チームへの通知が送信されたことを確認
    expect(result.notification_sent).toBe(true);
    expect(result.notification_recipients).toEqual(
      expect.arrayContaining(["development_team"])
    );

    // Assert: 通知ペイロードに抵触の詳細が含まれていることを確認
    expect(result.notification_payload).toEqual(
      expect.objectContaining({
        notification_type: "rule_validation_failure",
        severity_level: "high",
        rule_change_id: "rule_change_20240115_001",
        affected_meal_count: 42,
      })
    );
    expect(result.notification_payload.detected_conflicts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          conflict_type: "nutrition_standard",
          conflicting_field: "carbohydrate",
          severity: "high",
        }),
      ])
    );

    // Assert: ルール変更の実装が停止されたことを確認
    expect(result.implementation_status).toBe("halted");
    expect(result.implementation_blocked).toBe(true);

    // Assert: エラーステータスが返されていることを確認
    expect(result.error_code).toBe("NUTRITION_CONFLICT_DETECTED");
    expect(result.error_message).toMatch(/nutrition.*conflict/i);

    // Assert: ルール変更が本番環境に反映されないことを確認
    expect(result.deployed_to_production).toBe(false);
    expect(result.deployment_halted_reason).toBe("validation_failed");

    // Assert: 検証ログが記録されていることを確認
    expect(result.validation_log).toBeDefined();
    expect(result.validation_log.validation_timestamp).toBe(
      "2024-01-15T10:30:00Z"
    );
    expect(result.validation_log.validation_result).toBe("failed");
    expect(result.validation_log.conflict_detection_enabled).toBe(true);
  });
});