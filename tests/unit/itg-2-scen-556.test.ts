import { validateDivergenceAnalysisResult } from '../../src/logic/it-1-br-2-1-1-1';

describe('需要予測精度改善判定機能 - 乖離分析結果バリデーション', () => {
  // SCEN-556
  test('不正な形式の乖離分析結果データが入力されたときはエラーになる', () => {
    // ハッピーパス: 正常な形式のデータ
    const validDivergenceResult = {
      prediction_id: 'pred_001',
      predicted_demand: 100,
      actual_demand: 95,
      divergence_rate: 5.0,
      divergence_category: 'weather_impact',
      analysis_date: '2024-01-15',
      confidence_score: 0.92,
    };
    
    expect(validateDivergenceAnalysisResult(validDivergenceResult)).toBe(true);

    // エラーケース 1: 必須フィールドが欠落している（prediction_id が missing）
    const missingFieldData = {
      predicted_demand: 100,
      actual_demand: 95,
      divergence_rate: 5.0,
      divergence_category: 'weather_impact',
      analysis_date: '2024-01-15',
      confidence_score: 0.92,
    };
    
    expect(() => validateDivergenceAnalysisResult(missingFieldData)).toThrow(/prediction_id/);

    // エラーケース 2: データ型が不正である（predicted_demand が string）
    const invalidTypeData = {
      prediction_id: 'pred_002',
      predicted_demand: '100',
      actual_demand: 95,
      divergence_rate: 5.0,
      divergence_category: 'weather_impact',
      analysis_date: '2024-01-15',
      confidence_score: 0.92,
    };
    
    expect(() => validateDivergenceAnalysisResult(invalidTypeData)).toThrow(/predicted_demand/);

    // エラーケース 3: JSON ではないテキストが入力される
    const invalidJsonText = 'This is not valid JSON format';
    
    expect(() => validateDivergenceAnalysisResult(invalidJsonText as any)).toThrow(/JSON/);

    // エラーケース 4: 必須フィールドが複数欠落している
    const multipleFieldsMissing = {
      predicted_demand: 100,
      divergence_rate: 5.0,
    };
    
    expect(() => validateDivergenceAnalysisResult(multipleFieldsMissing)).toThrow(/required/);

    // エラーケース 5: divergence_rate が負の値（業務的に不正）
    const negativeRateData = {
      prediction_id: 'pred_003',
      predicted_demand: 100,
      actual_demand: 95,
      divergence_rate: -5.0,
      divergence_category: 'weather_impact',
      analysis_date: '2024-01-15',
      confidence_score: 0.92,
    };
    
    expect(() => validateDivergenceAnalysisResult(negativeRateData)).toThrow(/divergence_rate/);

    // エラーケース 6: confidence_score が範囲外（0 ～ 1 の範囲外）
    const outOfRangeConfidenceData = {
      prediction_id: 'pred_004',
      predicted_demand: 100,
      actual_demand: 95,
      divergence_rate: 5.0,
      divergence_category: 'weather_impact',
      analysis_date: '2024-01-15',
      confidence_score: 1.5,
    };
    
    expect(() => validateDivergenceAnalysisResult(outOfRangeConfidenceData)).toThrow(/confidence_score/);

    // エラーケース 7: analysis_date が ISO 8601 形式ではない
    const invalidDateFormatData = {
      prediction_id: 'pred_005',
      predicted_demand: 100,
      actual_demand: 95,
      divergence_rate: 5.0,
      divergence_category: 'weather_impact',
      analysis_date: '2024/01/15',
      confidence_score: 0.92,
    };
    
    expect(() => validateDivergenceAnalysisResult(invalidDateFormatData)).toThrow(/analysis_date/);

    // エラーケース 8: null が渡される
    expect(() => validateDivergenceAnalysisResult(null as any)).toThrow(/format/);

    // エラーケース 9: undefined が渡される
    expect(() => validateDivergenceAnalysisResult(undefined as any)).toThrow(/format/);

    // エラーケース 10: empty object が渡される
    expect(() => validateDivergenceAnalysisResult({} as any)).toThrow(/required/);
  });
});