import { validateMonthlyDemandForecastCycle } from '../../src/logic/it-1-br-3-2-1';

describe('購入実績の記録と月次食費削減効果の自動集計・分析機能', () => {
  // SCEN-468
  test('月次需要予測検証サイクル統合実行機能 - 予測データ件数がゼロ件の場合に空データセット判定で適切な警告メッセージとともに検証が進行される', () => {
    const forecastData: any[] = [];
    const actualData = [
      {
        actual_demand_id: 1,
        category_id: 101,
        quantity: 50,
        recorded_at: new Date('2024-01-15T10:00:00Z'),
      },
      {
        actual_demand_id: 2,
        category_id: 102,
        quantity: 75,
        recorded_at: new Date('2024-01-15T11:00:00Z'),
      },
    ];
    const verification_cycle_id = 'CYCLE_2024_01';

    const result = validateMonthlyDemandForecastCycle({
      forecast_records: forecastData,
      actual_records: actualData,
      cycle_id: verification_cycle_id,
      execution_timestamp: new Date('2024-01-15T12:00:00Z'),
    });

    // 空データセット判定が正しく行われることを確認
    expect(result.is_empty_dataset).toBe(true);

    // 警告メッセージが適切に生成されることを確認
    expect(result.warning_message).toMatch(/予測データが見つかりません/);

    // 警告レベルが設定されていることを確認
    expect(result.warning_level).toBe('warning');

    // 検証プロセスが中断されず継続することを確認
    expect(result.process_continued).toBe(true);

    // 検証サイクルが完了したことを確認
    expect(result.verification_completed).toBe(true);

    // 処理結果ログが記録されていることを確認
    expect(result.processing_log).toBeDefined();
    expect(result.processing_log.length).toBeGreaterThan(0);

    // 空データセット関連のログエントリが存在することを確認
    const empty_dataset_log = result.processing_log.find(
      (log: any) => log.log_type === 'empty_dataset_detected'
    );
    expect(empty_dataset_log).toBeDefined();
    expect(empty_dataset_log.cycle_id).toBe('CYCLE_2024_01');

    // 検証完了ログが記録されていることを確認
    const completion_log = result.processing_log.find(
      (log: any) => log.log_type === 'cycle_completion'
    );
    expect(completion_log).toBeDefined();
    expect(completion_log.status).toBe('completed');

    // 予測データ件数がゼロ件で記録されていることを確認
    expect(result.forecast_record_count).toBe(0);

    // 実績データ件数が正しく記録されていることを確認
    expect(result.actual_record_count).toBe(2);

    // エラーフラグが立っていないことを確認（警告であってエラーではない）
    expect(result.is_error).toBe(false);

    // サイクル ID が正しく保持されていることを確認
    expect(result.cycle_id).toBe('CYCLE_2024_01');

    // 実行タイムスタンプが記録されていることを確認
    expect(result.execution_timestamp).toEqual(
      new Date('2024-01-15T12:00:00Z')
    );
  });
});