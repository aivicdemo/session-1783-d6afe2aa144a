import { categorizeAndAggregateFailurePatterns } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-920: [normal] 失敗パターン集計機能 - 分類された却下修正理由から失敗パターンが特定され改善提案に反映される
  test('should identify failure patterns from categorized rejection reasons and generate improvement proposals', () => {
    // 準備: 複数の却下修正理由データ（分類済み）
    const categorized_rejection_data = [
      { reason_id: 'r001', category: 'nutritional_balance', timestamp: '2024-01-15T10:00:00Z', user_id: 'u001' },
      { reason_id: 'r002', category: 'nutritional_balance', timestamp: '2024-01-15T10:15:00Z', user_id: 'u001' },
      { reason_id: 'r003', category: 'nutritional_balance', timestamp: '2024-01-15T10:30:00Z', user_id: 'u002' },
      { reason_id: 'r004', category: 'cooking_time_exceeded', timestamp: '2024-01-15T11:00:00Z', user_id: 'u003' },
      { reason_id: 'r005', category: 'cooking_time_exceeded', timestamp: '2024-01-15T11:15:00Z', user_id: 'u003' },
      { reason_id: 'r006', category: 'cooking_time_exceeded', timestamp: '2024-01-15T11:30:00Z', user_id: 'u004' },
      { reason_id: 'r007', category: 'family_preference_not_reflected', timestamp: '2024-01-15T12:00:00Z', user_id: 'u005' },
      { reason_id: 'r008', category: 'family_preference_not_reflected', timestamp: '2024-01-15T12:15:00Z', user_id: 'u005' },
      { reason_id: 'r009', category: 'family_preference_not_reflected', timestamp: '2024-01-15T12:30:00Z', user_id: 'u006' },
      { reason_id: 'r010', category: 'food_restriction_missed', timestamp: '2024-01-15T13:00:00Z', user_id: 'u007' },
    ];

    // 実行: 失敗パターン集計機能
    const result = categorizeAndAggregateFailurePatterns(categorized_rejection_data);

    // 検証 1: 失敗パターンが正確に特定されている
    expect(result.failure_patterns).toBeDefined();
    expect(Array.isArray(result.failure_patterns)).toBe(true);
    expect(result.failure_patterns.length).toBe(4);

    // 検証 2: 各パターンの集計が正確
    const nutritional_balance_pattern = result.failure_patterns.find(
      (p: any) => p.pattern_category === 'nutritional_balance'
    );
    expect(nutritional_balance_pattern).toBeDefined();
    expect(nutritional_balance_pattern.occurrence_count).toBe(3);
    expect(nutritional_balance_pattern.frequency_percentage).toBe(30);

    const cooking_time_pattern = result.failure_patterns.find(
      (p: any) => p.pattern_category === 'cooking_time_exceeded'
    );
    expect(cooking_time_pattern).toBeDefined();
    expect(cooking_time_pattern.occurrence_count).toBe(3);
    expect(cooking_time_pattern.frequency_percentage).toBe(30);

    const family_preference_pattern = result.failure_patterns.find(
      (p: any) => p.pattern_category === 'family_preference_not_reflected'
    );
    expect(family_preference_pattern).toBeDefined();
    expect(family_preference_pattern.occurrence_count).toBe(3);
    expect(family_preference_pattern.frequency_percentage).toBe(30);

    const food_restriction_pattern = result.failure_patterns.find(
      (p: any) => p.pattern_category === 'food_restriction_missed'
    );
    expect(food_restriction_pattern).toBeDefined();
    expect(food_restriction_pattern.occurrence_count).toBe(1);
    expect(food_restriction_pattern.frequency_percentage).toBe(10);

    // 検証 3: 改善提案が自動生成されている
    expect(result.improvement_proposals).toBeDefined();
    expect(Array.isArray(result.improvement_proposals)).toBe(true);
    expect(result.improvement_proposals.length).toBeGreaterThanOrEqual(4);

    // 検証 4: 栄養バランスパターンに対応した改善提案
    const nutritional_proposal = result.improvement_proposals.find(
      (p: any) => p.pattern_category === 'nutritional_balance'
    );
    expect(nutritional_proposal).toBeDefined();
    expect(nutritional_proposal.proposal_type).toBe('algorithm_modification');
    expect(nutritional_proposal.description).toMatch(/栄養|nutrition|balance/i);
    expect(nutritional_proposal.priority_score).toBeGreaterThanOrEqual(0);
    expect(nutritional_proposal.priority_score).toBeLessThanOrEqual(100);

    // 検証 5: 調理時間超過パターンに対応した改善提案
    const cooking_time_proposal = result.improvement_proposals.find(
      (p: any) => p.pattern_category === 'cooking_time_exceeded'
    );
    expect(cooking_time_proposal).toBeDefined();
    expect(cooking_time_proposal.proposal_type).toBe('parameter_adjustment');
    expect(cooking_time_proposal.description).toMatch(/調理時間|cooking_time|timeout/i);
    expect(cooking_time_proposal.priority_score).toBeGreaterThanOrEqual(0);
    expect(cooking_time_proposal.priority_score).toBeLessThanOrEqual(100);

    // 検証 6: 家族の好み未反映パターンに対応した改善提案
    const family_preference_proposal = result.improvement_proposals.find(
      (p: any) => p.pattern_category === 'family_preference_not_reflected'
    );
    expect(family_preference_proposal).toBeDefined();
    expect(family_preference_proposal.proposal_type).toBe('algorithm_modification');
    expect(family_preference_proposal.description).toMatch(/好み|preference|taste|feedback/i);
    expect(family_preference_proposal.priority_score).toBeGreaterThanOrEqual(0);
    expect(family_preference_proposal.priority_score).toBeLessThanOrEqual(100);

    // 検証 7: 食材制限漏れパターンに対応した改善提案
    const food_restriction_proposal = result.improvement_proposals.find(
      (p: any) => p.pattern_category === 'food_restriction_missed'
    );
    expect(food_restriction_proposal).toBeDefined();
    expect(['algorithm_modification', 'parameter_adjustment', 'new_feature']).toContain(
      food_restriction_proposal.proposal_type
    );
    expect(food_restriction_proposal.description).toMatch(/食材制限|restriction|allergy|constraint/i);

    // 検証 8: 改善提案が優先度順に整理されている
    const proposal_priorities = result.improvement_proposals.map((p: any) => p.priority_score);
    const is_sorted_desc = proposal_priorities.every(
      (val: number, i: number) => i === 0 || proposal_priorities[i - 1] >= val
    );
    expect(is_sorted_desc).toBe(true);

    // 検証 9: 各パターンに失敗原因分析が含まれている
    result.failure_patterns.forEach((pattern: any) => {
      expect(pattern.root_cause_hypothesis).toBeDefined();
      expect(typeof pattern.root_cause_hypothesis).toBe('string');
      expect(pattern.root_cause_hypothesis.length).toBeGreaterThan(0);
      expect(pattern.affected_user_count).toBeGreaterThanOrEqual(1);
    });

    // 検証 10: 集計結果に集計期間情報が含まれている
    expect(result.aggregation_period).toBeDefined();
    expect(result.aggregation_period.start_date).toBe('2024-01-15T10:00:00Z');
    expect(result.aggregation_period.end_date).toBe('2024-01-15T13:00:00Z');
    expect(result.total_rejection_count).toBe(10);

    // 検証 11: 改善提案に根拠となるパターンデータが紐付けられている
    result.improvement_proposals.forEach((proposal: any) => {
      expect(proposal.supporting_failure_pattern).toBeDefined();
      expect(proposal.supporting_failure_pattern.occurrence_count).toBeGreaterThanOrEqual(1);
      expect(proposal.supporting_failure_pattern.frequency_percentage).toBeGreaterThan(0);
      expect(proposal.supporting_failure_pattern.frequency_percentage).toBeLessThanOrEqual(100);
    });

    // 検証 12: 改善提案に実装難度と推定効果が含まれている
    result.improvement_proposals.forEach((proposal: any) => {
      expect(proposal.implementation_difficulty).toBeDefined();
      expect(['low', 'medium', 'high']).toContain(proposal.implementation_difficulty);
      expect(proposal.estimated_improvement_rate).toBeGreaterThanOrEqual(0);
      expect(proposal.estimated_improvement_rate).toBeLessThanOrEqual(100);
    });

    // 検証 13: 複数ユーザーにまたがるパターンが正しく集計されている
    expect(nutritional_balance_pattern.affected_user_count).toBe(2);
    expect(cooking_time_pattern.affected_user_count).toBe(2);
    expect(family_preference_pattern.affected_user_count).toBe(2);
    expect(food_restriction_pattern.affected_user_count).toBe(1);

    // 検証 14: 最優先改善提案が出力に含まれている
    expect(result.top_priority_proposal).toBeDefined();
    expect(result.top_priority_proposal.priority_score).toBeGreaterThanOrEqual(
      Math.max(...result.improvement_proposals.map((p: any) => p.priority_score))
    );
  });
});