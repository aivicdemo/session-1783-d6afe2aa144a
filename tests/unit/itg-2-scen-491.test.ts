import { generateStructuredImprovementProposal } from '../../src/logic/it-1-br-2-1-2-1';

describe('栄養士からの改善提案優先度付け管理 - 構造化フォーマット生成エラーハンドリング', () => {
  // SCEN-491: [error] 改善提案構造化フォーマット生成 - 優先度マッピングにない優先度値が入力された場合にエラーを返す
  test('should throw error when invalid priority value is provided', () => {
    const invalid_priority_proposal = {
      proposal_id: 'PROP-2024-001',
      title: '栄養基準ロジック改善',
      description: 'タンパク質推奨量の基準値を20%引き上げる',
      impact_range: ['protein', 'user_segment_working_couple'],
      business_value_score: 8,
      technical_difficulty_score: 6,
      user_impact_score: 7,
      priority: 'INVALID'
    };

    expect(() => generateStructuredImprovementProposal(invalid_priority_proposal)).toThrow(/優先度/);
  });

  test('should throw error when priority is numeric string not in mapping', () => {
    const numeric_invalid_priority = {
      proposal_id: 'PROP-2024-002',
      title: '食事制限ロジック改善',
      description: 'アレルギー検出精度向上',
      impact_range: ['allergy', 'user_segment_househusband'],
      business_value_score: 9,
      technical_difficulty_score: 4,
      user_impact_score: 8,
      priority: '9'
    };

    expect(() => generateStructuredImprovementProposal(numeric_invalid_priority)).toThrow(/優先度/);
  });

  test('should throw error when priority is null', () => {
    const null_priority_proposal = {
      proposal_id: 'PROP-2024-003',
      title: '調理時間短縮ロジック改善',
      description: 'AIベース調理時間予測精度向上',
      impact_range: ['cooking_time', 'user_segment_househusband'],
      business_value_score: 7,
      technical_difficulty_score: 5,
      user_impact_score: 8,
      priority: null
    };

    expect(() => generateStructuredImprovementProposal(null_priority_proposal)).toThrow(/優先度/);
  });

  test('should throw error when priority is undefined', () => {
    const undefined_priority_proposal = {
      proposal_id: 'PROP-2024-004',
      title: '予算制約ロジック改善',
      description: '食費削減提案精度向上',
      impact_range: ['budget', 'user_segment_working_couple'],
      business_value_score: 6,
      technical_difficulty_score: 7,
      user_impact_score: 6,
      priority: undefined
    };

    expect(() => generateStructuredImprovementProposal(undefined_priority_proposal)).toThrow(/優先度/);
  });

  test('should throw error when priority is empty string', () => {
    const empty_priority_proposal = {
      proposal_id: 'PROP-2024-005',
      title: '栄養バランス検証ロジック改善',
      description: '週次栄養達成度スコア計算改善',
      impact_range: ['nutrition_balance'],
      business_value_score: 8,
      technical_difficulty_score: 3,
      user_impact_score: 9,
      priority: ''
    };

    expect(() => generateStructuredImprovementProposal(empty_priority_proposal)).toThrow(/優先度/);
  });

  test('should throw error when priority contains invalid enum value URGENT_PLUS', () => {
    const enum_invalid_priority = {
      proposal_id: 'PROP-2024-006',
      title: '献立生成アルゴリズム改善',
      description: 'マルチ制約最適化アルゴリズム導入',
      impact_range: ['menu_generation', 'user_segment_househusband'],
      business_value_score: 9,
      technical_difficulty_score: 8,
      user_impact_score: 9,
      priority: 'URGENT_PLUS'
    };

    expect(() => generateStructuredImprovementProposal(enum_invalid_priority)).toThrow(/優先度/);
  });

  test('should throw error when priority value does not match valid mapping (XLOW)', () => {
    const xlow_priority = {
      proposal_id: 'PROP-2024-007',
      title: 'UI微調整',
      description: 'ボタン位置調整',
      impact_range: ['ui'],
      business_value_score: 2,
      technical_difficulty_score: 1,
      user_impact_score: 1,
      priority: 'XLOW'
    };

    expect(() => generateStructuredImprovementProposal(xlow_priority)).toThrow(/優先度/);
  });

  test('should return valid structured format when priority is HIGH', () => {
    const valid_high_priority = {
      proposal_id: 'PROP-2024-008',
      title: '栄養基準ロジック改善',
      description: 'タンパク質推奨量基準値向上',
      impact_range: ['protein', 'user_segment_working_couple'],
      business_value_score: 8,
      technical_difficulty_score: 6,
      user_impact_score: 7,
      priority: 'HIGH'
    };

    const result = generateStructuredImprovementProposal(valid_high_priority);

    expect(result).toEqual({
      proposal_id: 'PROP-2024-008',
      title: '栄養基準ロジック改善',
      description: 'タンパク質推奨量基準値向上',
      impact_range: ['protein', 'user_segment_working_couple'],
      business_value_score: 8,
      technical_difficulty_score: 6,
      user_impact_score: 7,
      priority: 'HIGH',
      priority_numeric_value: 3,
      total_priority_score: 21,
      formatted_timestamp: expect.any(String),
      notification_target: 'DEVELOPMENT_TEAM'
    });
  });

  test('should return valid structured format when priority is MEDIUM', () => {
    const valid_medium_priority = {
      proposal_id: 'PROP-2024-009',
      title: '食事制限ロジック改善',
      description: 'アレルギー検出精度向上',
      impact_range: ['allergy', 'user_segment_househusband'],
      business_value_score: 6,
      technical_difficulty_score: 4,
      user_impact_score: 5,
      priority: 'MEDIUM'
    };

    const result = generateStructuredImprovementProposal(valid_medium_priority);

    expect(result).toEqual({
      proposal_id: 'PROP-2024-009',
      title: '食事制限ロジック改善',
      description: 'アレルギー検出精度向上',
      impact_range: ['allergy', 'user_segment_househusband'],
      business_value_score: 6,
      technical_difficulty_score: 4,
      user_impact_score: 5,
      priority: 'MEDIUM',
      priority_numeric_value: 2,
      total_priority_score: 15,
      formatted_timestamp: expect.any(String),
      notification_target: 'DEVELOPMENT_TEAM'
    });
  });

  test('should return valid structured format when priority is LOW', () => {
    const valid_low_priority = {
      proposal_id: 'PROP-2024-010',
      title: '調理時間短縮ロジック改善',
      description: 'AI調理時間予測精度向上',
      impact_range: ['cooking_time'],
      business_value_score: 4,
      technical_difficulty_score: 5,
      user_impact_score: 3,
      priority: 'LOW'
    };

    const result = generateStructuredImprovementProposal(valid_low_priority);

    expect(result).toEqual({
      proposal_id: 'PROP-2024-010',
      title: '調理時間短縮ロジック改善',
      description: 'AI調理時間予測精度向上',
      impact_range: ['cooking_time'],
      business_value_score: 4,
      technical_difficulty_score: 5,
      user_impact_score: 3,
      priority: 'LOW',
      priority_numeric_value: 1,
      total_priority_score: 12,
      formatted_timestamp: expect.any(String),
      notification_target: 'DEVELOPMENT_TEAM'
    });
  });

  test('should calculate total_priority_score correctly as sum of all scores multiplied by priority_numeric_value', () => {
    const scoring_proposal = {
      proposal_id: 'PROP-2024-011',
      title: 'テストシナリオ',
      description: 'スコア計算検証',
      impact_range: ['test'],
      business_value_score: 5,
      technical_difficulty_score: 3,
      user_impact_score: 4,
      priority: 'MEDIUM'
    };

    const result = generateStructuredImprovementProposal(scoring_proposal);

    // MEDIUM = priority_numeric_value: 2
    // total_priority_score = (5 + 3 + 4) * 2 = 12 * 2 = 24
    expect(result.priority_numeric_value).toBe(2);
    expect(result.total_priority_score).toBe(24);
  });

  test('should include ISO formatted timestamp in structured output', () => {
    const timestamp_proposal = {
      proposal_id: 'PROP-2024-012',
      title: 'タイムスタンプ検証',
      description: 'ISO形式確認',
      impact_range: ['test'],
      business_value_score: 7,
      technical_difficulty_score: 4,
      user_impact_score: 6,
      priority: 'HIGH'
    };

    const result = generateStructuredImprovementProposal(timestamp_proposal);

    expect(result.formatted_timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/);
  });

  test('should always set notification_target to DEVELOPMENT_TEAM', () => {
    const notification_proposal = {
      proposal_id: 'PROP-2024-013',
      title: '通知対象検証',
      description: '開発チーム通知確認',
      impact_range: ['test'],
      business_value_score: 6,
      technical_difficulty_score: 5,
      user_impact_score: 5,
      priority: 'LOW'
    };

    const result = generateStructuredImprovementProposal(notification_proposal);

    expect(result.notification_target).toBe('DEVELOPMENT_TEAM');
  });

  test('should throw error when priority is object instead of string', () => {
    const object_priority = {
      proposal_id: 'PROP-2024-014',
      title: '型検証',
      description: 'オブジェクト優先度エラー',
      impact_range: ['test'],
      business_value_score: 5,
      technical_difficulty_score: 5,
      user_impact_score: 5,
      priority: { level: 'HIGH' }
    };

    expect(() => generateStructuredImprovementProposal(object_priority as any)).toThrow(/優先度/);
  });

  test('should throw error when priority is array instead of string', () => {
    const array_priority = {
      proposal_id: 'PROP-2024-015',
      title: '配列型優先度',
      description: '配列優先度エラー',
      impact_range: ['test'],
      business_value_score: 5,
      technical_difficulty_score: 5,
      user_impact_score: 5,
      priority: ['HIGH']
    };

    expect(() => generateStructuredImprovementProposal(array_priority as any)).toThrow(/優先度/);
  });

  test('should throw error when priority is whitespace-only string', () => {
    const whitespace_priority = {
      proposal_id: 'PROP-2024-016',
      title: 'スペース優先度',
      description: 'ホワイトスペースのみ優先度',
      impact_range: ['test'],
      business_value_score: 5,
      technical_difficulty_score: 5,
      user_impact_score: 5,
      priority: '   '
    };

    expect(() => generateStructuredImprovementProposal(whitespace_priority)).toThrow(/優先度/);
  });

  test('should throw error when priority has valid mapping key but different case (high instead of HIGH)', () => {
    const case_mismatch_priority = {
      proposal_id: 'PROP-2024-017',
      title: 'ケース不一致',
      description: '小文字優先度',
      impact_range: ['test'],
      business_value_score: 8,
      technical_difficulty_score: 6,
      user_impact_score: 7,
      priority: 'high'
    };

    expect(() => generateStructuredImprovementProposal(case_mismatch_priority)).toThrow(/優先度/);
  });
});