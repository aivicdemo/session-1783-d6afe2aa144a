import { validateAndClassifyTechnicalFeasibility } from '../../src/logic/it-8-1-1-1';

describe('ユーザーインタビュー記録と利用ログから食材制限・調理時間制限・予算制約の発生頻度と影響度を自動抽出・分類し、優先度マトリクスを生成・可視化する機能', () => {
  // SCEN-222: [error] 技術実現性検証・分類機能 - 提案データが不完全またはシステムが検証基準を保持していない場合、エラーハンドリングが正常に実行される
  test('提案データが不完全な場合、エラーハンドリングが適切に実行される', () => {
    // 必須フィールドが欠落した不完全な提案データ（ユーザーペイン情報なし）
    const incomplete_proposal_data = {
      proposal_id: 'prop_001',
      proposal_title: 'アルゴリズム修正案',
      // user_pain_info は意図的に欠落
      implementation_difficulty: 'medium',
      expected_effect: 'high',
      kpi_contribution_degree: 75,
    };

    // 不完全な提案データでシステムを実行した場合、エラーをスロー
    expect(() => {
      validateAndClassifyTechnicalFeasibility(incomplete_proposal_data);
    }).toThrow(/ユーザーペイン/);
  });

  test('検証基準データが不在の状態でエラーハンドリングが正常に動作する', () => {
    const valid_proposal_data = {
      proposal_id: 'prop_002',
      proposal_title: 'パラメータ調整案',
      user_pain_info: {
        pain_category: 'cooking_time_constraint',
        frequency: 45,
        impact_degree: 82,
      },
      implementation_difficulty: 'low',
      expected_effect: 'medium',
      kpi_contribution_degree: 60,
    };

    // 検証基準データなしの状態でシステムを実行
    expect(() => {
      validateAndClassifyTechnicalFeasibility(valid_proposal_data, null);
    }).toThrow(/検証基準/);
  });

  test('検証基準が空オブジェクトの場合、エラーハンドリングが正常に動作する', () => {
    const valid_proposal_data = {
      proposal_id: 'prop_003',
      proposal_title: '新機能追加案',
      user_pain_info: {
        pain_category: 'budget_constraint',
        frequency: 38,
        impact_degree: 71,
      },
      implementation_difficulty: 'high',
      expected_effect: 'high',
      kpi_contribution_degree: 85,
    };

    const empty_validation_criteria = {};

    // 空の検証基準でシステムを実行
    expect(() => {
      validateAndClassifyTechnicalFeasibility(valid_proposal_data, empty_validation_criteria);
    }).toThrow(/検証基準/);
  });

  test('提案データの必須フィールド proposal_id が欠落した場合、エラーハンドリングが正常に動作する', () => {
    const missing_proposal_id = {
      // proposal_id は意図的に欠落
      proposal_title: 'アルゴリズム修正案',
      user_pain_info: {
        pain_category: 'food_restriction',
        frequency: 52,
        impact_degree: 88,
      },
      implementation_difficulty: 'medium',
      expected_effect: 'high',
      kpi_contribution_degree: 72,
    };

    expect(() => {
      validateAndClassifyTechnicalFeasibility(missing_proposal_id);
    }).toThrow(/提案ID/);
  });

  test('提案データの必須フィールド implementation_difficulty が欠落した場合、エラーハンドリングが正常に動作する', () => {
    const missing_implementation_difficulty = {
      proposal_id: 'prop_004',
      proposal_title: 'パラメータ調整案',
      user_pain_info: {
        pain_category: 'cooking_time_constraint',
        frequency: 40,
        impact_degree: 75,
      },
      // implementation_difficulty は意図的に欠落
      expected_effect: 'medium',
      kpi_contribution_degree: 65,
    };

    expect(() => {
      validateAndClassifyTechnicalFeasibility(missing_implementation_difficulty);
    }).toThrow(/実装難度/);
  });

  test('検証基準が無効な値である場合、エラーハンドリングが正常に動作する', () => {
    const valid_proposal_data = {
      proposal_id: 'prop_005',
      proposal_title: '新機能追加案',
      user_pain_info: {
        pain_category: 'budget_constraint',
        frequency: 35,
        impact_degree: 68,
      },
      implementation_difficulty: 'low',
      expected_effect: 'high',
      kpi_contribution_degree: 78,
    };

    const invalid_validation_criteria = 'invalid_string';

    expect(() => {
      validateAndClassifyTechnicalFeasibility(valid_proposal_data, invalid_validation_criteria);
    }).toThrow(/検証基準/);
  });

  test('正常な提案データと有効な検証基準で実行した場合、技術実現性の分類結果を正常に返す', () => {
    const valid_proposal_data = {
      proposal_id: 'prop_006',
      proposal_title: 'アルゴリズム修正案',
      user_pain_info: {
        pain_category: 'food_restriction',
        frequency: 50,
        impact_degree: 85,
      },
      implementation_difficulty: 'low',
      expected_effect: 'high',
      kpi_contribution_degree: 80,
    };

    const valid_validation_criteria = {
      feasibility_threshold_low: 60,
      feasibility_threshold_high: 80,
      implementation_difficulty_max_score: 10,
      expected_effect_max_score: 10,
    };

    const result = validateAndClassifyTechnicalFeasibility(
      valid_proposal_data,
      valid_validation_criteria,
    );

    expect(result).toHaveProperty('proposal_id');
    expect(result.proposal_id).toBe('prop_006');
    expect(result).toHaveProperty('feasibility_classification');
    expect(['implementable', 'conditional_implementation', 'not_implementable']).toContain(
      result.feasibility_classification,
    );
    expect(result).toHaveProperty('feasibility_score');
    expect(typeof result.feasibility_score).toBe('number');
    expect(result.feasibility_score).toBeGreaterThanOrEqual(0);
    expect(result.feasibility_score).toBeLessThanOrEqual(100);
    expect(result).toHaveProperty('validation_timestamp');
    expect(result.validation_timestamp).toBeDefined();
  });

  test('複数の必須フィールド欠落がある場合、最初の欠落フィールドに対してエラーをスロー', () => {
    const multiple_missing_fields = {
      // proposal_id 欠落
      // proposal_title 欠落
      user_pain_info: {
        pain_category: 'cooking_time_constraint',
        frequency: 45,
        impact_degree: 80,
      },
      // implementation_difficulty 欠落
      expected_effect: 'high',
      kpi_contribution_degree: 75,
    };

    expect(() => {
      validateAndClassifyTechnicalFeasibility(multiple_missing_fields);
    }).toThrow(/提案ID|提案タイトル|実装難度/);
  });

  test('user_pain_info内の必須フィールド pain_category が欠落した場合、エラーハンドリングが正常に動作する', () => {
    const invalid_pain_info = {
      proposal_id: 'prop_007',
      proposal_title: 'パラメータ調整案',
      user_pain_info: {
        // pain_category は意図的に欠落
        frequency: 40,
        impact_degree: 72,
      },
      implementation_difficulty: 'medium',
      expected_effect: 'medium',
      kpi_contribution_degree: 62,
    };

    expect(() => {
      validateAndClassifyTechnicalFeasibility(invalid_pain_info);
    }).toThrow(/ペイン要因/);
  });

  test('user_pain_info内の必須フィールド frequency が欠落した場合、エラーハンドリングが正常に動作する', () => {
    const invalid_pain_info = {
      proposal_id: 'prop_008',
      proposal_title: '新機能追加案',
      user_pain_info: {
        pain_category: 'budget_constraint',
        // frequency は意図的に欠落
        impact_degree: 68,
      },
      implementation_difficulty: 'high',
      expected_effect: 'high',
      kpi_contribution_degree: 82,
    };

    expect(() => {
      validateAndClassifyTechnicalFeasibility(invalid_pain_info);
    }).toThrow(/発生頻度|頻度/);
  });

  test('user_pain_info内の必須フィールド impact_degree が欠落した場合、エラーハンドリングが正常に動作する', () => {
    const invalid_pain_info = {
      proposal_id: 'prop_009',
      proposal_title: 'アルゴリズム修正案',
      user_pain_info: {
        pain_category: 'food_restriction',
        frequency: 48,
        // impact_degree は意図的に欠落
      },
      implementation_difficulty: 'low',
      expected_effect: 'high',
      kpi_contribution_degree: 76,
    };

    expect(() => {
      validateAndClassifyTechnicalFeasibility(invalid_pain_info);
    }).toThrow(/影響度/);
  });

  test('提案データが null である場合、エラーハンドリングが正常に動作する', () => {
    const null_proposal_data = null;
    const valid_validation_criteria = {
      feasibility_threshold_low: 60,
      feasibility_threshold_high: 80,
      implementation_difficulty_max_score: 10,
      expected_effect_max_score: 10,
    };

    expect(() => {
      validateAndClassifyTechnicalFeasibility(null_proposal_data, valid_validation_criteria);
    }).toThrow(/提案/);
  });

  test('提案データが undefined である場合、エラーハンドリングが正常に動作する', () => {
    const undefined_proposal_data = undefined;
    const valid_validation_criteria = {
      feasibility_threshold_low: 60,
      feasibility_threshold_high: 80,
      implementation_difficulty_max_score: 10,
      expected_effect_max_score: 10,
    };

    expect(() => {
      validateAndClassifyTechnicalFeasibility(undefined_proposal_data, valid_validation_criteria);
    }).toThrow(/提案/);
  });

  test('frequency が無効な値（負数）である場合、エラーハンドリングが正常に動作する', () => {
    const invalid_frequency = {
      proposal_id: 'prop_010',
      proposal_title: 'パラメータ調整案',
      user_pain_info: {
        pain_category: 'cooking_time_constraint',
        frequency: -5, // 無効な負数
        impact_degree: 75,
      },
      implementation_difficulty: 'medium',
      expected_effect: 'medium',
      kpi_contribution_degree: 68,
    };

    expect(() => {
      validateAndClassifyTechnicalFeasibility(invalid_frequency);
    }).toThrow(/発生頻度|頻度/);
  });

  test('impact_degree が無効な値（100を超える数値）である場合、エラーハンドリングが正常に動作する', () => {
    const invalid_impact_degree = {
      proposal_id: 'prop_011',
      proposal_title: '新機能追加案',
      user_pain_info: {
        pain_category: 'budget_constraint',
        frequency: 42,
        impact_degree: 150, // 無効な値：100超過
      },
      implementation_difficulty: 'high',
      expected_effect: 'high',
      kpi_contribution_degree: 81,
    };

    expect(() => {
      validateAndClassifyTechnicalFeasibility(invalid_impact_degree);
    }).toThrow(/影響度/);
  });

  test('kpi_contribution_degree が無効な値（負数）である場合、エラーハンドリングが正常に動作する', () => {
    const invalid_kpi_contribution = {
      proposal_id: 'prop_012',
      proposal_title: 'アルゴリズム修正案',
      user_pain_info: {
        pain_category: 'food_restriction',
        frequency: 55,
        impact_degree: 88,
      },
      implementation_difficulty: 'low',
      expected_effect: 'high',
      kpi_contribution_degree: -10, // 無効な負数
    };

    expect(() => {
      validateAndClassifyTechnicalFeasibility(invalid_kpi_contribution);
    }).toThrow(/KPI/);
  });

  test('implementation_difficulty が無効な値である場合、エラーハンドリングが正常に動作する', () => {
    const invalid_implementation_difficulty = {
      proposal_id: 'prop_013',
      proposal_title: 'パラメータ調整案',
      user_pain_info: {
        pain_category: 'cooking_time_constraint',
        frequency: 38,
        impact_degree: 70,
      },
      implementation_difficulty: 'extremely_high', // 無効な値
      expected_effect: 'medium',
      kpi_contribution_degree: 64,
    };

    expect(() => {
      validateAndClassifyTechnicalFeasibility(invalid_implementation_difficulty);
    }).toThrow(/実装難度/);
  });

  test('expected_effect が無効な値である場合、エラーハンドリングが正常に動作する', () => {
    const invalid_expected_effect = {
      proposal_id: 'prop_014',
      proposal_title: '新機能追加案',
      user_pain_info: {
        pain_category: 'budget_constraint',
        frequency: 41,
        impact_degree: 74,
      },
      implementation_difficulty: 'high',
      expected_effect: 'ultra_high', // 無効な値
      kpi_contribution_degree: 79,
    };

    expect(() => {
      validateAndClassifyTechnicalFeasibility(invalid_expected_effect);
    }).toThrow(/期待効果|効果/);
  });

  test('pain_category が無効な値である場合、エラーハンドリングが正常に動作する', () => {
    const invalid_pain_category = {
      proposal_id: 'prop_015',
      proposal_title: 'アルゴリズム修正案',
      user_pain_info: {
        pain_category: 'unknown_constraint', // 無効なカテゴリ
        frequency: 46,
        impact_degree: 83,
      },
      implementation_difficulty: 'low',
      expected_effect: 'high',
      kpi_contribution_degree: 77,
    };

    expect(() => {
      validateAndClassifyTechnicalFeasibility(invalid_pain_category);
    }).toThrow(/ペイン要因|カテゴリ/);
  });

  test('エラーハンドリング後、システムが安全な状態に復帰する（連続呼び出しでも動作する）', () => {
    const first_invalid_proposal = {
      proposal_id: 'prop_016',
      // proposal_title 欠落
      user_pain_info: {
        pain_category: 'food_restriction',
        frequency: 50,
        impact_degree: 80,
      },
      implementation_difficulty: 'medium',
      expected_effect: 'high',
      kpi_contribution_degree: 72,
    };

    const valid_proposal = {
      proposal_id: 'prop_017',
      proposal_title: 'パラメータ調整案',
      user_pain_info: {
        pain_category: 'cooking_time_constraint',
        frequency: 43,
        impact_degree: 76,
      },
      implementation_difficulty: 'low',
      expected_effect: 'medium',
      kpi_contribution_degree: 65,
    };

    const valid_validation_criteria = {
      feasibility_threshold_low: 60,
      feasibility_threshold_high: 80,
      implementation_difficulty_max_score: 10,
      expected_effect_max_score: 10,
    };

    // 最初のエラー呼び出し
    expect(() => {
      validateAndClassifyTechnicalFeasibility(first_invalid_proposal);
    }).toThrow(/提案タイトル/);

    // エラー後、有効なデータでの呼び出しが正常に動作することを確認
    const result = validateAndClassifyTechnicalFeasibility(valid_proposal, valid_validation_criteria);
    expect(result).toHaveProperty('proposal_id');
    expect(result.proposal_id).toBe('prop_017');
    expect(result).toHaveProperty('feasibility_classification');
  });
});