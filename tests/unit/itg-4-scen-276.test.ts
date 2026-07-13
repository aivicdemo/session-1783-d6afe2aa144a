import { determineExternalFactorAdoption } from '../../src/logic/it-3-br-6-3-3';

describe('予測精度低下要因の可視化ダッシュボード', () => {
  // SCEN-276
  test('外部要因データ信頼度スコア付与・採用判定 - 信頼度スコアが採用閾値以上のデータのみ採用される', () => {
    // テストデータ: 信頼度スコア70、65、60、55、50の5つの外部要因データ
    const external_factor_data = [
      {
        factor_id: 'ef_001',
        factor_type: 'weather',
        factor_name: '気象パターン_A',
        confidence_score: 70,
        data_source: 'weather_api_001',
        collection_timestamp: '2024-01-15T09:00:00Z',
      },
      {
        factor_id: 'ef_002',
        factor_type: 'event',
        factor_name: 'イベント_B',
        confidence_score: 65,
        data_source: 'event_source_001',
        collection_timestamp: '2024-01-15T09:00:00Z',
      },
      {
        factor_id: 'ef_003',
        factor_type: 'competitor',
        factor_name: '競合施策_C',
        confidence_score: 60,
        data_source: 'competitor_api_001',
        collection_timestamp: '2024-01-15T09:00:00Z',
      },
      {
        factor_id: 'ef_004',
        factor_type: 'weather',
        factor_name: '気象パターン_D',
        confidence_score: 55,
        data_source: 'weather_api_001',
        collection_timestamp: '2024-01-15T09:00:00Z',
      },
      {
        factor_id: 'ef_005',
        factor_type: 'event',
        factor_name: 'イベント_E',
        confidence_score: 50,
        data_source: 'event_source_001',
        collection_timestamp: '2024-01-15T09:00:00Z',
      },
    ];

    // 予測モデルの採用閾値を60に設定
    const adoption_threshold = 60;

    // 5つの外部要因データを予測モデルに入力し、採用判定を実行
    const result = determineExternalFactorAdoption({
      external_factors: external_factor_data,
      threshold: adoption_threshold,
    });

    // 採用されたデータの検証: スコア60以上のデータ（ef_001、ef_002、ef_003）が採用される
    expect(result.adopted_factors).toHaveLength(3);
    expect(result.adopted_factors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          factor_id: 'ef_001',
          confidence_score: 70,
          adoption_status: 'adopted',
        }),
        expect.objectContaining({
          factor_id: 'ef_002',
          confidence_score: 65,
          adoption_status: 'adopted',
        }),
        expect.objectContaining({
          factor_id: 'ef_003',
          confidence_score: 60,
          adoption_status: 'adopted',
        }),
      ])
    );

    // 除外されたデータの検証: スコア60未満のデータ（ef_004、ef_005）が除外される
    expect(result.rejected_factors).toHaveLength(2);
    expect(result.rejected_factors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          factor_id: 'ef_004',
          confidence_score: 55,
          adoption_status: 'rejected',
          rejection_reason: 'confidence_score_below_threshold',
        }),
        expect.objectContaining({
          factor_id: 'ef_005',
          confidence_score: 50,
          adoption_status: 'rejected',
          rejection_reason: 'confidence_score_below_threshold',
        }),
      ])
    );

    // 予測結果が採用されたデータのみを使用して生成されたことを検証
    expect(result.prediction_model_input_factors).toHaveLength(3);
    expect(result.prediction_model_input_factors.map((f: any) => f.factor_id)).toEqual(
      expect.arrayContaining(['ef_001', 'ef_002', 'ef_003'])
    );

    // ログに採用判定の結果が記録されていることを検証
    expect(result.adoption_judgment_log).toBeDefined();
    expect(result.adoption_judgment_log.total_input_factors).toBe(5);
    expect(result.adoption_judgment_log.adopted_count).toBe(3);
    expect(result.adoption_judgment_log.rejected_count).toBe(2);
    expect(result.adoption_judgment_log.adoption_threshold).toBe(60);
    expect(result.adoption_judgment_log.judgment_timestamp).toBeDefined();

    // 採用判定サマリー検証
    expect(result.adoption_summary).toEqual({
      adoption_rate: 0.6,
      threshold_applied: 60,
      model_ready: true,
    });
  });
});