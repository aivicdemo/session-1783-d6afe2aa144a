import { detectAndPrioritizeDietaryRestrictionChanges } from "../../src/logic/it-1-br-2-1-1-1";

describe("食事記録と栄養摂取量の推移分析 - 食事制限・アレルギー情報の変更検出と優先度判定", () => {
  test("SCEN-317: 前回更新から7日以上経過した場合、変更検出ロジックが発動し、優先度判定が実行される", () => {
    // Arrange: 7日以上前の前回更新日時を設定
    const current_timestamp = new Date("2024-02-15T10:00:00Z");
    const previous_update_timestamp = new Date("2024-02-08T09:00:00Z"); // 7日前（6日11時間経過）
    const days_elapsed = 7.041667; // (2024-02-15 10:00 - 2024-02-08 09:00) / 24h

    const input_payload = {
      user_id: "USR-001",
      family_member_id: "FAM-001",
      current_timestamp: current_timestamp,
      previous_update_timestamp: previous_update_timestamp,
      new_restriction_type: "allergen",
      new_restriction_name: "wheat",
      previous_restrictions: [
        {
          restriction_id: "RST-001",
          restriction_type: "allergen",
          restriction_name: "peanuts",
          priority_score: 5,
        },
      ],
      new_restrictions: [
        {
          restriction_id: "RST-002",
          restriction_type: "allergen",
          restriction_name: "wheat",
          priority_score: 0, // 優先度判定前
        },
      ],
    };

    // Act: 変更検出・優先度判定ロジックを実行
    const result = detectAndPrioritizeDietaryRestrictionChanges(input_payload);

    // Assert: 変更検出ロジックが発動
    expect(result.change_detected).toBe(true);

    // Assert: 前回更新からの経過日数が7日以上であることを検証
    expect(result.days_since_last_update).toBeGreaterThanOrEqual(7);

    // Assert: 変更検出が「優先度判定必要」と判定される
    expect(result.change_detection_status).toBe("prioritization_required");

    // Assert: 新規制限項目の優先度が適切に割り当てられている
    // 優先度スコア計算: (制限タイプの基本スコア(allergen=10) × 重要度係数(wheat=0.8)) + タイミング係数(即時反映必要=5) = 10 * 0.8 + 5 = 13
    expect(result.new_restriction_priority_score).toBe(13);

    // Assert: 優先度判定ロジックが実行された
    expect(result.prioritization_executed).toBe(true);

    // Assert: ダッシュボード反映フラグが「即時反映対象」と判定
    expect(result.immediate_reflection_required).toBe(true);

    // Assert: 制限条件変更の履歴記録が生成されている
    expect(result.change_audit_log).toBeDefined();
    expect(result.change_audit_log.timestamp).toEqual(current_timestamp);
    expect(result.change_audit_log.user_id).toBe("USR-001");
    expect(result.change_audit_log.family_member_id).toBe("FAM-001");
    expect(result.change_audit_log.previous_restriction_type).toBe("allergen");
    expect(result.change_audit_log.previous_restriction_name).toBe("peanuts");
    expect(result.change_audit_log.new_restriction_type).toBe("allergen");
    expect(result.change_audit_log.new_restriction_name).toBe("wheat");

    // Assert: ダッシュボード表示用の情報が正確に生成されている
    expect(result.dashboard_display_info).toBeDefined();
    expect(result.dashboard_display_info.change_detected_label).toBe(
      "食事制限・アレルギー情報が変更されました"
    );
    expect(result.dashboard_display_info.priority_rank).toBe("高");
    expect(result.dashboard_display_info.priority_numeric_score).toBe(13);
    expect(result.dashboard_display_info.reflect_timing).toBe("即時反映");

    // Assert: 献立生成ロジックへの反映指示が正しく生成されている
    expect(result.menu_generation_update_required).toBe(true);
    expect(result.affected_menu_ids).toBeDefined();
    expect(Array.isArray(result.affected_menu_ids)).toBe(true);

    // Assert: 優先度判定の根拠が記録されている
    expect(result.prioritization_reasoning).toBeDefined();
    expect(result.prioritization_reasoning.elapsed_days_threshold).toBe(7);
    expect(result.prioritization_reasoning.elapsed_days_actual).toBe(
      days_elapsed
    );
    expect(result.prioritization_reasoning.threshold_exceeded).toBe(true);
  });

  test("SCEN-317-ERR: 新しい食事制限条件がアプリに保存されたが、過去の献立履歴が不足している場合、エラーとして処理される", () => {
    // Arrange: 最小限の過去献立履歴のみ存在
    const current_timestamp = new Date("2024-02-15T10:00:00Z");
    const previous_update_timestamp = new Date("2024-02-08T09:00:00Z");

    const input_payload = {
      user_id: "USR-002",
      family_member_id: "FAM-002",
      current_timestamp: current_timestamp,
      previous_update_timestamp: previous_update_timestamp,
      new_restriction_type: "allergen",
      new_restriction_name: "shellfish",
      previous_restrictions: [],
      new_restrictions: [
        {
          restriction_id: "RST-003",
          restriction_type: "allergen",
          restriction_name: "shellfish",
          priority_score: 0,
        },
      ],
      menu_history_count: 0, // 過去献立がない
    };

    // Act & Assert: 献立履歴不足でエラーをスロー
    expect(() =>
      detectAndPrioritizeDietaryRestrictionChanges(input_payload)
    ).toThrow(/献立履歴/);
  });

  test("SCEN-317-BOUNDARY: 更新経過日数がちょうど7日の境界値の場合、変更検出ロジックが発動する", () => {
    // Arrange: ちょうど7日前の日時
    const current_timestamp = new Date("2024-02-15T09:00:00Z");
    const previous_update_timestamp = new Date("2024-02-08T09:00:00Z"); // ちょうど7日前

    const input_payload = {
      user_id: "USR-003",
      family_member_id: "FAM-003",
      current_timestamp: current_timestamp,
      previous_update_timestamp: previous_update_timestamp,
      new_restriction_type: "dietary",
      new_restriction_name: "vegetarian",
      previous_restrictions: [
        {
          restriction_id: "RST-004",
          restriction_type: "dietary",
          restriction_name: "no_pork",
          priority_score: 3,
        },
      ],
      new_restrictions: [
        {
          restriction_id: "RST-005",
          restriction_type: "dietary",
          restriction_name: "vegetarian",
          priority_score: 0,
        },
      ],
    };

    // Act: 変更検出・優先度判定ロジックを実行
    const result = detectAndPrioritizeDietaryRestrictionChanges(input_payload);

    // Assert: ちょうど7日の場合、変更検出が発動する
    expect(result.change_detected).toBe(true);
    expect(result.days_since_last_update).toEqual(7);
    expect(result.prioritization_executed).toBe(true);

    // Assert: 優先度スコアが適切に計算されている（dietary制限の基本スコア=8、vegetarian=0.7）
    // 計算式: 8 * 0.7 + 5（タイミング係数） = 5.6 + 5 = 10.6 → 整数化して10または11
    expect(result.new_restriction_priority_score).toBeGreaterThanOrEqual(10);
    expect(result.new_restriction_priority_score).toBeLessThanOrEqual(11);
  });

  test("SCEN-317-UNDER-THRESHOLD: 前回更新から7日未満の場合、変更検出ロジックが発動しない", () => {
    // Arrange: 7日未満（6日）前の日時
    const current_timestamp = new Date("2024-02-15T10:00:00Z");
    const previous_update_timestamp = new Date("2024-02-09T10:00:00Z"); // 6日前

    const input_payload = {
      user_id: "USR-004",
      family_member_id: "FAM-004",
      current_timestamp: current_timestamp,
      previous_update_timestamp: previous_update_timestamp,
      new_restriction_type: "allergen",
      new_restriction_name: "eggs",
      previous_restrictions: [
        {
          restriction_id: "RST-006",
          restriction_type: "allergen",
          restriction_name: "milk",
          priority_score: 4,
        },
      ],
      new_restrictions: [
        {
          restriction_id: "RST-007",
          restriction_type: "allergen",
          restriction_name: "eggs",
          priority_score: 0,
        },
      ],
    };

    // Act: 変更検出・優先度判定ロジックを実行
    const result = detectAndPrioritizeDietaryRestrictionChanges(input_payload);

    // Assert: 7日未満の場合、変更検出ロジックは発動しない
    expect(result.change_detected).toBe(false);
    expect(result.days_since_last_update).toBeLessThan(7);
    expect(result.prioritization_executed).toBe(false);
    expect(result.immediate_reflection_required).toBe(false);
  });
});