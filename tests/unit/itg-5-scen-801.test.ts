import { calculateDemandForecastAccuracy } from '../../src/logic/it-7-2-1';

describe('月次需要予測検証フロー自動実行機能', () => {
  // SCEN-801
  test('月末検証開始宣言から予測値・実績値照合、精度計算、外部要因分析を経て改善提案書が作成される', () => {
    // 前提: 月次需要予測検証フローが開始され、当月の予測値・実績値データが揃っている状態
    const forecast_data = [
      { product_id: 'P001', predicted_demand: 100, date: '2024-01-15' },
      { product_id: 'P002', predicted_demand: 150, date: '2024-01-15' },
      { product_id: 'P003', predicted_demand: 80, date: '2024-01-15' },
    ];

    const actual_data = [
      { product_id: 'P001', actual_demand: 98, date: '2024-01-15' },
      { product_id: 'P002', actual_demand: 155, date: '2024-01-15' },
      { product_id: 'P003', actual_demand: 75, date: '2024-01-15' },
    ];

    const external_factors = [
      { factor_type: 'weather', value: 'sunny', correlation: 0.35 },
      { factor_type: 'event', value: 'sale', correlation: 0.62 },
      { factor_type: 'trend', value: 'rising', correlation: 0.28 },
    ];

    // 発生条件: 月末検証開始宣言ボタンをクリックし、検証フロー自動実行が開始される
    const verification_request = {
      verification_type: 'monthly',
      forecast_data: forecast_data,
      actual_data: actual_data,
      external_factors: external_factors,
      verification_date: new Date('2024-01-31T23:59:59Z'),
    };

    // 結果: 予測値・実績値照合、精度計算、外部要因分析が自動実行され、改善提案書が生成される
    const result = calculateDemandForecastAccuracy(verification_request);

    // 期待値検証: 精度指標が正確に計算されていること
    // MAPE計算: ((|98-100|/100 + |155-150|/150 + |75-80|/80) / 3) * 100
    // = ((0.02 + 0.0333 + 0.0625) / 3) * 100 = 5.194%
    expect(result.accuracy_metrics.mape).toBeCloseTo(5.194, 1);

    // MAE計算: (|98-100| + |155-150| + |75-80|) / 3 = (2 + 5 + 5) / 3 = 4
    expect(result.accuracy_metrics.mae).toBe(4);

    // RMSE計算: sqrt(((98-100)^2 + (155-150)^2 + (75-80)^2) / 3)
    // = sqrt((4 + 25 + 25) / 3) = sqrt(18) = 4.243
    expect(result.accuracy_metrics.rmse).toBeCloseTo(4.243, 1);

    // 外部要因分析結果が包含されていることを確認
    expect(result.external_factor_analysis).toBeDefined();
    expect(result.external_factor_analysis.length).toBe(3);
    expect(result.external_factor_analysis[0].factor_type).toBe('weather');
    expect(result.external_factor_analysis[0].correlation).toBe(0.35);

    // 改善提案書が生成されていることを確認
    expect(result.improvement_proposal).toBeDefined();
    expect(result.improvement_proposal.document_format).toBe('pdf');
    expect(result.improvement_proposal.contains_forecast_data).toBe(true);
    expect(result.improvement_proposal.contains_actual_data).toBe(true);
    expect(result.improvement_proposal.contains_accuracy_metrics).toBe(true);
    expect(result.improvement_proposal.contains_analysis_results).toBe(true);

    // ダウンロード可能状態が確認されることを確認
    expect(result.improvement_proposal.download_available).toBe(true);
    expect(result.improvement_proposal.download_link).toBeDefined();
    expect(typeof result.improvement_proposal.download_link).toBe('string');

    // ステータスが完了状態に更新されていることを確認
    expect(result.verification_status).toBe('completed');
    expect(result.verification_status_timestamp).toBeDefined();

    // 精度低下判定が実施されることを確認
    expect(result.accuracy_threshold_met).toBe(true);

    // 全処理が正常に完了していることを確認
    expect(result.process_steps_completed).toEqual([
      'forecast_data_loaded',
      'actual_data_loaded',
      'values_reconciliation',
      'accuracy_calculation',
      'external_factor_analysis',
      'improvement_proposal_generation',
    ]);
  });
});