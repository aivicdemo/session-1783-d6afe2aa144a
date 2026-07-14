import { detectAndProcessAnomalies } from '../../src/logic/it-7-2-1';

describe('献立生成の成功率・調理時間短縮度・ユーザー満足度スコアなどの行動指標を週次で自動集計し、アルゴリズム改善前後の効果差を定量比較するダッシュボード機能', () => {
  // SCEN-898: [normal] ユーザーデータの欠損値・異常値検出と除外処理 - 定義された閾値を逸脱する異常値が自動検出され、信頼性警告付きで補正されるまたは除外される
  test('異常値検出と補正・除外処理により、信頼性警告付きで正常データセットを生成する', () => {
    // テストデータセット準備：正常値、欠損値、閾値逸脱の異常値を含む
    const rawDataset = [
      {
        user_id: 'user001',
        meal_generation_success_rate: 85.5,
        cooking_time_reduction_degree: 12.3,
        user_satisfaction_score: 4.2,
        recorded_at: '2024-01-15T09:00:00Z',
      },
      {
        user_id: 'user002',
        meal_generation_success_rate: null, // 欠損値
        cooking_time_reduction_degree: 8.5,
        user_satisfaction_score: 3.8,
        recorded_at: '2024-01-15T10:00:00Z',
      },
      {
        user_id: 'user003',
        meal_generation_success_rate: 150.0, // 閾値逸脱（0-100%の範囲外）
        cooking_time_reduction_degree: 5.2,
        user_satisfaction_score: 4.5,
        recorded_at: '2024-01-15T11:00:00Z',
      },
      {
        user_id: 'user004',
        meal_generation_success_rate: 78.0,
        cooking_time_reduction_degree: -999.0, // 閾値逸脱（負値の異常値）
        user_satisfaction_score: 3.5,
        recorded_at: '2024-01-15T12:00:00Z',
      },
      {
        user_id: 'user005',
        meal_generation_success_rate: 92.1,
        cooking_time_reduction_degree: 15.7,
        user_satisfaction_score: 5.5, // 閾値逸脱（0-5.0の範囲外）
        recorded_at: '2024-01-15T13:00:00Z',
      },
    ];

    // 異常値検出ルールと閾値パラメータを定義
    const anomaly_thresholds = {
      meal_generation_success_rate: { min: 0, max: 100, allow_null: false },
      cooking_time_reduction_degree: { min: 0, max: 500, allow_null: true },
      user_satisfaction_score: { min: 0, max: 5.0, allow_null: false },
    };

    const anomaly_handling_strategy = 'exclude'; // 'exclude' または 'impute'

    // 異常値検出処理を実行
    const result = detectAndProcessAnomalies(
      rawDataset,
      anomaly_thresholds,
      anomaly_handling_strategy
    );

    // 検出された異常値のリストを取得・検証
    expect(result.detected_anomalies).toHaveLength(4); // user002, user003, user004, user005

    // 各異常値について信頼性警告メッセージが生成されていることを確認
    const anomaly_user002 = result.detected_anomalies.find(
      (a) => a.user_id === 'user002'
    );
    expect(anomaly_user002).toBeDefined();
    expect(anomaly_user002?.anomaly_type).toBe('missing_value');
    expect(anomaly_user002?.field_name).toBe('meal_generation_success_rate');
    expect(anomaly_user002?.confidence_warning).toMatch(/欠損値/);

    const anomaly_user003 = result.detected_anomalies.find(
      (a) => a.user_id === 'user003'
    );
    expect(anomaly_user003).toBeDefined();
    expect(anomaly_user003?.anomaly_type).toBe('out_of_bounds');
    expect(anomaly_user003?.field_name).toBe('meal_generation_success_rate');
    expect(anomaly_user003?.actual_value).toBe(150.0);
    expect(anomaly_user003?.confidence_warning).toMatch(/閾値逸脱/);

    const anomaly_user004 = result.detected_anomalies.find(
      (a) => a.user_id === 'user004'
    );
    expect(anomaly_user004).toBeDefined();
    expect(anomaly_user004?.anomaly_type).toBe('out_of_bounds');
    expect(anomaly_user004?.field_name).toBe('cooking_time_reduction_degree');
    expect(anomaly_user004?.actual_value).toBe(-999.0);
    expect(anomaly_user004?.confidence_warning).toMatch(/異常値/);

    const anomaly_user005 = result.detected_anomalies.find(
      (a) => a.user_id === 'user005'
    );
    expect(anomaly_user005).toBeDefined();
    expect(anomaly_user005?.anomaly_type).toBe('out_of_bounds');
    expect(anomaly_user005?.field_name).toBe('user_satisfaction_score');
    expect(anomaly_user005?.actual_value).toBe(5.5);
    expect(anomaly_user005?.confidence_warning).toMatch(/範囲外/);

    // 異常値補正・除外処理が実行され、処理後のデータセットを検証
    expect(result.processed_dataset).toHaveLength(1); // 正常値のみ（user001）
    expect(result.processed_dataset[0].user_id).toBe('user001');
    expect(result.processed_dataset[0].meal_generation_success_rate).toBe(85.5);
    expect(result.processed_dataset[0].cooking_time_reduction_degree).toBe(12.3);
    expect(result.processed_dataset[0].user_satisfaction_score).toBe(4.2);

    // 処理後のデータセットが正常値のみで構成されていることを確認
    result.processed_dataset.forEach((record) => {
      expect(record.meal_generation_success_rate).toBeGreaterThanOrEqual(0);
      expect(record.meal_generation_success_rate).toBeLessThanOrEqual(100);
      expect(record.cooking_time_reduction_degree).toBeGreaterThanOrEqual(0);
      expect(record.user_satisfaction_score).toBeGreaterThanOrEqual(0);
      expect(record.user_satisfaction_score).toBeLessThanOrEqual(5.0);
    });

    // 処理ログに警告情報が記録されていることを確認
    expect(result.processing_log).toBeDefined();
    expect(result.processing_log.total_records_input).toBe(5);
    expect(result.processing_log.total_anomalies_detected).toBe(4);
    expect(result.processing_log.total_records_output).toBe(1);
    expect(result.processing_log.processing_timestamp).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
    );
    expect(result.processing_log.anomaly_summary).toEqual({
      missing_value_count: 1,
      out_of_bounds_count: 3,
    });

    // 信頼性警告がダッシュボード表示可能な形式で生成されていることを確認
    expect(result.dashboard_display_data).toBeDefined();
    expect(result.dashboard_display_data.data_quality_score).toBeLessThan(100); // 異常があるため満点未満
    expect(result.dashboard_display_data.data_quality_score).toBeGreaterThanOrEqual(0);
    expect(result.dashboard_display_data.confidence_warnings).toHaveLength(4);
    expect(result.dashboard_display_data.confidence_warnings[0]).toMatch(
      /user_id|warning|anomaly/i
    );

    // 処理戦略が正しく適用されたことを確認
    expect(result.processing_strategy_applied).toBe('exclude');
  });
});