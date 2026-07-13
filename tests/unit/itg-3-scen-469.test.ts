import { evaluateExternalFactorTrustworthiness } from '../../src/logic/it-1-br-6-2-1-1';

describe('外部要因データの信頼度スコア付与・採用判定', () => {
  // SCEN-469
  test('気象データに信頼度スコア85を付与し採用判定基準80以上を満たすため予測モデル入力候補として選定される', () => {
    const external_factor_data = {
      data_source_id: 'weather_001',
      data_source_type: 'weather',
      data_source_name: '気象データソース',
      collected_at: '2024-01-15T10:00:00Z',
      temperature: 15.5,
      humidity: 72,
      precipitation: 0.5,
    };

    const adoption_criteria_threshold = 80;

    const trustworthiness_score = 85;

    const result = evaluateExternalFactorTrustworthiness({
      external_factor_data,
      trustworthiness_score,
      adoption_criteria_threshold,
    });

    expect(result.data_source_id).toBe('weather_001');
    expect(result.data_source_type).toBe('weather');
    expect(result.assigned_trustworthiness_score).toBe(85);
    expect(result.adoption_criteria_threshold).toBe(80);
    expect(result.meets_adoption_criteria).toBe(true);
    expect(result.is_selected_for_prediction_model_input).toBe(true);
    expect(result.adoption_decision).toBe('ADOPTED');
  });
});