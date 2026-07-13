import { evaluateExternalFactorTrustworthiness } from '../../src/logic/it-3-br-6-3-3';

describe('予測精度低下要因の可視化ダッシュボード', () => {
  // SCEN-277: [edge] 外部要因データ信頼度スコア付与・採用判定 - 信頼度スコアがちょうど採用閾値である場合、採用判定が正確に実行される
  test('should adopt external factor data when trustworthiness score equals adoption threshold', () => {
    const adoption_threshold = 0.75;
    const external_factor_data = {
      id: 'EXT_WEATHER_001',
      factor_type: 'weather',
      data_value: 'rainy',
      data_date: '2024-01-15',
      source: 'weather_api',
      trustworthiness_score: 0.75,
    };

    const adoption_decision_result = evaluateExternalFactorTrustworthiness(
      external_factor_data,
      adoption_threshold
    );

    expect(adoption_decision_result.adoption_status).toBe('adopted');
    expect(adoption_decision_result.trustworthiness_score).toBe(0.75);
    expect(adoption_decision_result.is_adopted).toBe(true);
    expect(adoption_decision_result.external_factor_id).toBe('EXT_WEATHER_001');
    expect(adoption_decision_result.adoption_timestamp).toMatch(
      /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/
    );
    expect(adoption_decision_result.system_log_entry).toContain('adoption_decision');
    expect(adoption_decision_result.inventory_forecast_impact).toBe(true);
  });

  test('should reject external factor data when trustworthiness score is below adoption threshold', () => {
    const adoption_threshold = 0.75;
    const external_factor_data = {
      id: 'EXT_EVENT_002',
      factor_type: 'event',
      data_value: 'sale_campaign',
      data_date: '2024-01-20',
      source: 'event_info',
      trustworthiness_score: 0.74,
    };

    const adoption_decision_result = evaluateExternalFactorTrustworthiness(
      external_factor_data,
      adoption_threshold
    );

    expect(adoption_decision_result.adoption_status).toBe('rejected');
    expect(adoption_decision_result.trustworthiness_score).toBe(0.74);
    expect(adoption_decision_result.is_adopted).toBe(false);
    expect(adoption_decision_result.external_factor_id).toBe('EXT_EVENT_002');
    expect(adoption_decision_result.inventory_forecast_impact).toBe(false);
  });

  test('should adopt external factor data when trustworthiness score exceeds adoption threshold', () => {
    const adoption_threshold = 0.75;
    const external_factor_data = {
      id: 'EXT_COMPETITOR_003',
      factor_type: 'competitor_strategy',
      data_value: 'price_reduction',
      data_date: '2024-01-22',
      source: 'competitor_data',
      trustworthiness_score: 0.95,
    };

    const adoption_decision_result = evaluateExternalFactorTrustworthiness(
      external_factor_data,
      adoption_threshold
    );

    expect(adoption_decision_result.adoption_status).toBe('adopted');
    expect(adoption_decision_result.trustworthiness_score).toBe(0.95);
    expect(adoption_decision_result.is_adopted).toBe(true);
    expect(adoption_decision_result.external_factor_id).toBe('EXT_COMPETITOR_003');
    expect(adoption_decision_result.inventory_forecast_impact).toBe(true);
  });

  test('should throw error when external_factor_data is missing required fields', () => {
    const adoption_threshold = 0.75;
    const incomplete_external_factor_data = {
      id: 'EXT_MISSING_004',
      factor_type: 'weather',
    };

    expect(() =>
      evaluateExternalFactorTrustworthiness(
        incomplete_external_factor_data as any,
        adoption_threshold
      )
    ).toThrow(/信頼度/);
  });

  test('should throw error when adoption_threshold is invalid', () => {
    const invalid_threshold = 1.5;
    const external_factor_data = {
      id: 'EXT_INVALID_005',
      factor_type: 'weather',
      data_value: 'sunny',
      data_date: '2024-01-25',
      source: 'weather_api',
      trustworthiness_score: 0.80,
    };

    expect(() =>
      evaluateExternalFactorTrustworthiness(external_factor_data, invalid_threshold)
    ).toThrow(/閾値/);
  });
});