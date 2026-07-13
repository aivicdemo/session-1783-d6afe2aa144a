import { detectSLAOverage, executeNutritionBalanceVerification } from '../../src/logic/it-1-br-6-2-1';

describe('需要予測精度検証ダッシュボード：予測値と実績値の照合・乖離分析機能', () => {
  // SCEN-246: [normal] SLA遅延検知・代替処理機能 - 栄養バランス検証開始時に24時間SLAを超過していることを検知できる
  test('should detect SLA overage beyond 24 hours and trigger fallback processing', () => {
    // ========== 前置条件: 栄養バランス検証機能の初期化 ==========
    const verification_id = 'nutrition_check_001';
    const user_id = 'user_12345';
    const meal_list_id = 'meal_list_20240115';
    
    // ========== 処理開始時刻を24時間以上前に設定 ==========
    // 基準時刻: 2024-01-16T10:00:00Z
    // 開始時刻: 2024-01-14T09:00:00Z (2日以上前 = 48時間以上前)
    const check_start_time = new Date('2024-01-14T09:00:00Z');
    const current_time = new Date('2024-01-16T10:00:00Z');
    const sla_threshold_ms = 24 * 60 * 60 * 1000; // 24時間をミリ秒に変換 = 86400000ms

    // ========== SLA超過判定ロジック実行 ==========
    const time_elapsed_ms = current_time.getTime() - check_start_time.getTime();
    // 計算: 2024-01-16T10:00:00Z - 2024-01-14T09:00:00Z = 1日25時間 = 48時間 = 172800000ms
    const is_sla_overaged = time_elapsed_ms > sla_threshold_ms;

    // ========== SLA超過検知関数を実行 ==========
    const sla_detection_result = detectSLAOverage({
      verification_id,
      user_id,
      meal_list_id,
      check_start_time,
      current_time,
      sla_threshold_hours: 24
    });

    // ========== SLA超過が検知されたことを確認 ==========
    expect(is_sla_overaged).toBe(true);
    expect(sla_detection_result.is_overaged).toBe(true);
    expect(sla_detection_result.time_elapsed_hours).toBe(48 + 1 / 60); // 48時間1分
    
    // ========== アラート生成処理が実行されたことを確認 ==========
    expect(sla_detection_result.alert_generated).toBe(true);
    expect(sla_detection_result.alert_message).toMatch(/SLA|遅延|超過/);
    expect(sla_detection_result.alert_severity).toBe('warning');
    
    // ========== アラートログに記録されていることを確認 ==========
    expect(sla_detection_result.alert_timestamp).toEqual(new Date('2024-01-16T10:00:00Z'));
    expect(sla_detection_result.verification_id).toBe(verification_id);

    // ========== 代替処理（フェイルオーバー）の起動条件を確認 ==========
    expect(sla_detection_result.fallback_triggered).toBe(true);
    expect(sla_detection_result.fallback_type).toBe('provisional_nutrition_validation');

    // ========== 代替処理を実行して検証 ==========
    const fallback_result = executeNutritionBalanceVerification({
      verification_id,
      user_id,
      meal_list_id,
      use_fallback: true,
      fallback_mode: 'provisional',
      check_start_time,
      current_time
    });

    // ========== 代替処理が正常に実行されたことをログで検証 ==========
    expect(fallback_result.status).toBe('completed');
    expect(fallback_result.processing_mode).toBe('fallback');
    expect(fallback_result.fallback_executed).toBe(true);
    expect(fallback_result.system_log).toMatch(/フェイルオーバー実行|Fallback executed/);

    // ========== 栄養バランス検証の結果が代替処理による値で更新されていることを確認 ==========
    const expected_protein_min = 50; // 暫定栄養バランス基準値（例）
    const expected_carbs_min = 150;
    const expected_fat_max = 70;
    
    expect(fallback_result.validation_result.protein_grams).toBeGreaterThanOrEqual(expected_protein_min);
    expect(fallback_result.validation_result.carbohydrates_grams).toBeGreaterThanOrEqual(expected_carbs_min);
    expect(fallback_result.validation_result.fat_grams).toBeLessThanOrEqual(expected_fat_max);
    
    // ========== 代替処理由来フラグが設定されていることを確認 ==========
    expect(fallback_result.validation_result.is_provisional).toBe(true);
    expect(fallback_result.validation_result.fallback_source).toBe('provisional_nutrition_validation');

    // ========== システムログに遅延検知とフェイルオーバー実行の両方が記録されていることを確認 ==========
    const system_log = fallback_result.system_log;
    expect(system_log).toMatch(/SLA遅延検知|SLA overage detected/);
    expect(system_log).toMatch(/フェイルオーバー実行|Fallback processing initiated/);
    
    // ========== ログレコードの時系列が正しいことを確認 ==========
    expect(fallback_result.log_timestamp).toEqual(new Date('2024-01-16T10:00:00Z'));
    expect(fallback_result.detection_timestamp).toEqual(sla_detection_result.alert_timestamp);
    expect(fallback_result.fallback_completion_timestamp).toBeDefined();
    expect(fallback_result.fallback_completion_timestamp.getTime()).toBeGreaterThanOrEqual(
      fallback_result.log_timestamp.getTime()
    );

    // ========== 次ステップへの進行が継続されていることを確認 ==========
    expect(fallback_result.proceed_to_next_step).toBe(true);
    expect(fallback_result.next_step_handler).toBe('demand_analysis');
  });
});