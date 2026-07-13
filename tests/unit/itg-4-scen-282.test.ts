import { generatePredictionAccuracyImprovementProposal } from '../../src/logic/it-3-br-6-3-3';

describe('予測精度低下要因の可視化ダッシュボード', () => {
  // SCEN-282
  test('要因抽出データが不完全な場合、提案書生成エラーが発生し処理が中止される', () => {
    // 準備: 不完全な要因抽出データ（必須フィールドが欠落）
    const incomplete_factor_data_missing_accuracy_impact = {
      factor_id: 'FAC-001',
      factor_name: '天候パターン変化',
      // accuracy_impact_rate は必須だが欠落
      implementation_difficulty_score: 65,
      external_factor_type: 'weather',
      data_quality_score: 85,
      priority_matrix_position: 'high_impact_medium_difficulty',
    };

    // 実行: 不完全なデータで提案書生成を試みる
    expect(() =>
      generatePredictionAccuracyImprovementProposal([
        incomplete_factor_data_missing_accuracy_impact,
      ])
    ).toThrow(/精度影響度/);
  });

  test('要因抽出データが不完全な場合、実装難易度スコアが欠落していることを検知してエラー発生', () => {
    const incomplete_factor_data_missing_difficulty = {
      factor_id: 'FAC-002',
      factor_name: 'イベント情報連携',
      accuracy_impact_rate: 18.5,
      // implementation_difficulty_score は必須だが欠落
      external_factor_type: 'event',
      data_quality_score: 90,
      priority_matrix_position: 'medium_impact_high_difficulty',
    };

    expect(() =>
      generatePredictionAccuracyImprovementProposal([
        incomplete_factor_data_missing_difficulty,
      ])
    ).toThrow(/実装難易度/);
  });

  test('要因抽出データが不完全な場合、要因タイプが欠落していることを検知してエラー発生', () => {
    const incomplete_factor_data_missing_type = {
      factor_id: 'FAC-003',
      factor_name: '競合店舗施策',
      accuracy_impact_rate: 22.3,
      implementation_difficulty_score: 45,
      // external_factor_type は必須だが欠落
      data_quality_score: 75,
      priority_matrix_position: 'high_impact_low_difficulty',
    };

    expect(() =>
      generatePredictionAccuracyImprovementProposal([
        incomplete_factor_data_missing_type,
      ])
    ).toThrow(/要因タイプ/);
  });

  test('複数の要因データが混在し、1件が不完全な場合、処理が中止される', () => {
    const valid_factor_data = {
      factor_id: 'FAC-004',
      factor_name: '季節変動',
      accuracy_impact_rate: 35.2,
      implementation_difficulty_score: 30,
      external_factor_type: 'seasonal',
      data_quality_score: 92,
      priority_matrix_position: 'high_impact_low_difficulty',
    };

    const incomplete_factor_data_mixed = {
      factor_id: 'FAC-005',
      factor_name: '曜日別パターン',
      accuracy_impact_rate: 15.8,
      // implementation_difficulty_score 欠落
      external_factor_type: 'weekday_pattern',
      data_quality_score: 88,
      priority_matrix_position: 'medium_impact_medium_difficulty',
    };

    expect(() =>
      generatePredictionAccuracyImprovementProposal([
        valid_factor_data,
        incomplete_factor_data_mixed,
      ])
    ).toThrow(/実装難易度/);
  });

  test('要因データが空配列の場合、処理を中止してエラー発生', () => {
    expect(() =>
      generatePredictionAccuracyImprovementProposal([])
    ).toThrow(/要因データ/);
  });

  test('要因データがnullの場合、処理を中止してエラー発生', () => {
    expect(() =>
      generatePredictionAccuracyImprovementProposal(null as any)
    ).toThrow(/要因データ/);
  });

  test('データ品質スコアが欠落している場合、提案書生成エラーが発生', () => {
    const incomplete_factor_data_missing_quality = {
      factor_id: 'FAC-006',
      factor_name: '外部データソース品質',
      accuracy_impact_rate: 12.5,
      implementation_difficulty_score: 55,
      external_factor_type: 'data_quality',
      // data_quality_score は必須だが欠落
      priority_matrix_position: 'low_impact_high_difficulty',
    };

    expect(() =>
      generatePredictionAccuracyImprovementProposal([
        incomplete_factor_data_missing_quality,
      ])
    ).toThrow(/品質スコア/);
  });

  test('完全なデータが正常に処理されて提案書が生成される', () => {
    const valid_factor_data_set = [
      {
        factor_id: 'FAC-007',
        factor_name: '天候パターン変化',
        accuracy_impact_rate: 28.5,
        implementation_difficulty_score: 62,
        external_factor_type: 'weather',
        data_quality_score: 88,
        priority_matrix_position: 'high_impact_medium_difficulty',
      },
      {
        factor_id: 'FAC-008',
        factor_name: 'イベント情報',
        accuracy_impact_rate: 18.2,
        implementation_difficulty_score: 35,
        external_factor_type: 'event',
        data_quality_score: 91,
        priority_matrix_position: 'medium_impact_low_difficulty',
      },
    ];

    const result = generatePredictionAccuracyImprovementProposal(
      valid_factor_data_set
    );

    expect(result).toBeDefined();
    expect(result.proposal_id).toBeDefined();
    expect(result.proposal_id).toMatch(/^PROP-/);
    expect(result.generated_at).toBeDefined();
    expect(result.total_factors_analyzed).toBe(2);
    expect(result.high_priority_factors).toBeGreaterThanOrEqual(0);
    expect(result.proposal_status).toBe('completed');
    expect(Array.isArray(result.prioritized_factors)).toBe(true);
    expect(result.prioritized_factors.length).toBe(2);
  });

  test('提案書の優先度マトリクス配置が正確に計算される', () => {
    const factor_data_for_matrix = [
      {
        factor_id: 'FAC-009',
        factor_name: 'テスト要因1',
        accuracy_impact_rate: 40.0,
        implementation_difficulty_score: 30,
        external_factor_type: 'test',
        data_quality_score: 95,
        priority_matrix_position: 'high_impact_low_difficulty',
      },
    ];

    const result = generatePredictionAccuracyImprovementProposal(factor_data_for_matrix);

    expect(result.prioritized_factors[0].factor_name).toBe('テスト要因1');
    expect(result.prioritized_factors[0].accuracy_impact_rate).toBe(40.0);
    expect(result.prioritized_factors[0].implementation_difficulty_score).toBe(30);
    expect(result.prioritized_factors[0].priority_rank).toBe(1);
  });
});