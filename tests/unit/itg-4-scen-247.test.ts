import { detectSlaExceedanceAndExecuteFallback } from "../../src/logic/it-1-br-6-2-1";

describe("需要予測精度検証ダッシュボード：SLA遅延検知・代替処理機能", () => {
  // SCEN-247
  test("SLA超過時に暫定的な栄養バランス検証を自動実行し次ステップに進行させる", () => {
    // Precondition: プロダクトマネージャーが買い物リスト生成データの収集指示を出した状態
    // Trigger: 専業主夫が生成された買い物リストを確認し、栄養バランス検証が開始される時点で、
    //          前のステップからの経過時間が事前に定めたSLA（例：30秒）を超過した場合
    // Outcome: 遅延を検知し、代替処理として暫定的な栄養バランス検証を自動実行し、
    //          次ステップへの進行を継続。遅延ログを記録し、ステークホルダーに通知

    // Setup: SLA遅延検知テスト用パラメータ
    const slaThresholdMs = 30000; // SLA閾値：30秒
    const processStartTime = new Date("2024-01-15T09:00:00Z");
    const currentTime = new Date("2024-01-15T09:00:35Z"); // 35秒経過 → SLA超過
    const elapsedTimeMs = currentTime.getTime() - processStartTime.getTime(); // 35000ms

    // Setup: 栄養バランス検証対象の商品データセット（1000件以上）
    const products = Array.from({ length: 1050 }, (_, i) => ({
      product_id: `prod_${String(i + 1).padStart(4, "0")}`,
      product_name: `商品_${i + 1}`,
      category: ["野菜", "タンパク質", "炭水化物", "脂質"][i % 4],
      nutritional_value: {
        calories: 50 + (i % 200),
        protein_g: 2 + (i % 20),
        carbs_g: 5 + (i % 30),
        fat_g: 1 + (i % 10),
      },
      purchase_history_count: 1 + (i % 100),
    }));

    // Setup: 栄養バランス検証処理入力
    const nutritionVerificationInput = {
      user_id: "user_001",
      verification_start_time: processStartTime,
      current_time: currentTime,
      sla_threshold_ms: slaThresholdMs,
      product_data: products,
      shopping_list_id: "shop_list_001",
      family_members: [
        { member_id: "fm_001", age: 35, gender: "M", allergy_ids: [] },
        { member_id: "fm_002", age: 32, gender: "F", allergy_ids: [] },
        { member_id: "fm_003", age: 8, gender: "M", allergy_ids: ["allergen_001"] },
      ],
    };

    // Execute: SLA超過検知・代替処理の実行
    const result = detectSlaExceedanceAndExecuteFallback(nutritionVerificationInput);

    // Assert 1: SLA超過が検知されたか
    expect(result.sla_exceeded).toBe(true);
    expect(result.elapsed_time_ms).toBe(35000);
    expect(result.elapsed_time_ms).toBeGreaterThan(slaThresholdMs);

    // Assert 2: 暫定的な栄養バランス検証が自動トリガーされたか
    expect(result.fallback_nutrition_verification_triggered).toBe(true);
    expect(result.fallback_verification_status).toBe("EXECUTED");

    // Assert 3: 暫定検証の実行情報が記録されているか
    expect(result.fallback_verification_start_time).toBeDefined();
    expect(result.fallback_verification_start_time).toEqual(
      new Date("2024-01-15T09:00:35Z")
    );
    expect(result.fallback_verification_execution_mode).toBe("SIMPLIFIED");

    // Assert 4: 暫定検証が完了し、その結果が次ステップに正常に引き継がれているか
    expect(result.fallback_verification_result).toBeDefined();
    expect(result.fallback_verification_result.verification_completed).toBe(true);
    expect(result.fallback_verification_result.estimated_nutrition_balance).toBeDefined();

    // Assert 5: 暫定検証の栄養バランス計算結果（簡易版）
    // 簡易版では、商品の栄養価を統計的に集計
    expect(result.fallback_verification_result.estimated_nutrition_balance).toEqual({
      estimated_avg_calories: expect.any(Number),
      estimated_avg_protein_g: expect.any(Number),
      estimated_avg_carbs_g: expect.any(Number),
      estimated_avg_fat_g: expect.any(Number),
      sample_size: 1050,
    });

    // Assert 6: 次ステップ（在庫最適化処理）への引き継ぎが成功したか
    expect(result.next_step_handoff).toBeDefined();
    expect(result.next_step_handoff.status).toBe("READY_FOR_NEXT_STEP");
    expect(result.next_step_handoff.next_process_type).toBe("INVENTORY_OPTIMIZATION");
    expect(result.next_step_handoff.passed_nutrition_data).toBeDefined();

    // Assert 7: 次ステップの処理が予定通り進行し、エラーが発生していないか
    expect(result.next_step_handoff.errors).toEqual([]);
    expect(result.next_step_handoff.process_continuation_allowed).toBe(true);

    // Assert 8: システムログに代替処理の実行記録が正確に記録されているか
    expect(result.system_log_entries).toBeDefined();
    expect(result.system_log_entries.length).toBeGreaterThan(0);

    // Assert 9: SLA超過検知ログが存在するか
    const slaExceedanceLog = result.system_log_entries.find(
      (log) => log.event_type === "SLA_EXCEEDED"
    );
    expect(slaExceedanceLog).toBeDefined();
    expect(slaExceedanceLog.timestamp).toEqual(new Date("2024-01-15T09:00:35Z"));
    expect(slaExceedanceLog.severity).toBe("WARNING");
    expect(slaExceedanceLog.message).toMatch(/SLA/);

    // Assert 10: 暫定処理実行ログが存在するか
    const fallbackExecutionLog = result.system_log_entries.find(
      (log) => log.event_type === "FALLBACK_VERIFICATION_EXECUTED"
    );
    expect(fallbackExecutionLog).toBeDefined();
    expect(fallbackExecutionLog.severity).toBe("INFO");
    expect(fallbackExecutionLog.message).toMatch(/暫定/);

    // Assert 11: 次ステップハンドオフログが存在するか
    const handoffLog = result.system_log_entries.find(
      (log) => log.event_type === "NEXT_STEP_HANDOFF"
    );
    expect(handoffLog).toBeDefined();
    expect(handoffLog.severity).toBe("INFO");

    // Assert 12: 代替処理の詳細情報が記録されているか
    expect(result.fallback_execution_details).toBeDefined();
    expect(result.fallback_execution_details.original_sla_threshold_ms).toBe(30000);
    expect(result.fallback_execution_details.actual_elapsed_ms).toBe(35000);
    expect(result.fallback_execution_details.sla_overage_ms).toBe(5000);
    expect(result.fallback_execution_details.fallback_mode).toBe("SIMPLIFIED");
    expect(result.fallback_execution_details.data_sampling_rate).toBe(1.0);

    // Assert 13: ステークホルダー通知情報が記録されているか
    expect(result.stakeholder_notification).toBeDefined();
    expect(result.stakeholder_notification.should_notify).toBe(true);
    expect(result.stakeholder_notification.notification_type).toBe("SLA_DELAY_DETECTED");
    expect(result.stakeholder_notification.recipients).toContain("product_manager");
    expect(result.stakeholder_notification.recipients).toContain("development_team");

    // Assert 14: 処理フロー全体の状態が「正常進行」か
    expect(result.process_flow_status).toBe("CONTINUING_WITH_FALLBACK");
    expect(result.flow_interruption).toBe(false);
  });
});