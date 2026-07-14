import { classifyImprovementProposal } from '../../src/logic/it-7-2-1';

describe('献立生成アルゴリズム改善提案の分類と失敗パターン紐付け', () => {
  // SCEN-910: 定義されたタイプに該当しない改善提案が入力された場合、分類エラーが発生し処理が中断される
  test('undefined improvement proposal type should throw classification error', () => {
    const invalidProposal = {
      proposal_id: 'prop_001',
      proposal_type: 'undefined_type',
      description: 'Improve recommendation algorithm',
      failure_pattern_id: 'fp_101',
      business_value_score: 85,
      technical_difficulty_score: 60,
      user_impact_score: 90,
    };

    expect(() => classifyImprovementProposal(invalidProposal)).toThrow(/有効なタイプ/);
  });

  test('proposal with valid type should be classified successfully', () => {
    const validProposal = {
      proposal_id: 'prop_002',
      proposal_type: 'performance_improvement',
      description: 'Optimize nutritional balance calculation',
      failure_pattern_id: 'fp_102',
      business_value_score: 80,
      technical_difficulty_score: 50,
      user_impact_score: 85,
    };

    const result = classifyImprovementProposal(validProposal);

    expect(result).toEqual({
      proposal_id: 'prop_002',
      proposal_type: 'performance_improvement',
      classification_status: 'classified',
      failure_pattern_id: 'fp_102',
      classified_at: expect.any(String),
      total_priority_score: 71.67,
    });
  });

  test('proposal with empty string type should throw classification error', () => {
    const emptyTypeProposal = {
      proposal_id: 'prop_003',
      proposal_type: '',
      description: 'Add constraint validation',
      failure_pattern_id: 'fp_103',
      business_value_score: 75,
      technical_difficulty_score: 45,
      user_impact_score: 88,
    };

    expect(() => classifyImprovementProposal(emptyTypeProposal)).toThrow(/有効なタイプ/);
  });

  test('proposal with null type should throw classification error', () => {
    const nullTypeProposal = {
      proposal_id: 'prop_004',
      proposal_type: null,
      description: 'Enhance allergy handling',
      failure_pattern_id: 'fp_104',
      business_value_score: 90,
      technical_difficulty_score: 65,
      user_impact_score: 92,
    };

    expect(() => classifyImprovementProposal(nullTypeProposal)).toThrow(/有効なタイプ/);
  });

  test('proposal with bug_fix type should be classified successfully', () => {
    const bugFixProposal = {
      proposal_id: 'prop_005',
      proposal_type: 'bug_fix',
      description: 'Fix budget constraint overflow',
      failure_pattern_id: 'fp_105',
      business_value_score: 95,
      technical_difficulty_score: 40,
      user_impact_score: 88,
    };

    const result = classifyImprovementProposal(bugFixProposal);

    expect(result).toEqual({
      proposal_id: 'prop_005',
      proposal_type: 'bug_fix',
      classification_status: 'classified',
      failure_pattern_id: 'fp_105',
      classified_at: expect.any(String),
      total_priority_score: 81.0,
    });
  });

  test('proposal with feature_addition type should be classified successfully', () => {
    const featureProposal = {
      proposal_id: 'prop_006',
      proposal_type: 'feature_addition',
      description: 'Add meal satisfaction feedback loop',
      failure_pattern_id: 'fp_106',
      business_value_score: 88,
      technical_difficulty_score: 72,
      user_impact_score: 91,
    };

    const result = classifyImprovementProposal(featureProposal);

    expect(result).toEqual({
      proposal_id: 'prop_006',
      proposal_type: 'feature_addition',
      classification_status: 'classified',
      failure_pattern_id: 'fp_106',
      classified_at: expect.any(String),
      total_priority_score: 82.33,
    });
  });

  test('proposal with invalid special character type should throw classification error', () => {
    const specialCharProposal = {
      proposal_id: 'prop_007',
      proposal_type: '!@#$%^&*()',
      description: 'Test special characters',
      failure_pattern_id: 'fp_107',
      business_value_score: 70,
      technical_difficulty_score: 50,
      user_impact_score: 80,
    };

    expect(() => classifyImprovementProposal(specialCharProposal)).toThrow(/有効なタイプ/);
  });

  test('proposal with numeric type should throw classification error', () => {
    const numericTypeProposal = {
      proposal_id: 'prop_008',
      proposal_type: '12345',
      description: 'Numeric type test',
      failure_pattern_id: 'fp_108',
      business_value_score: 60,
      technical_difficulty_score: 55,
      user_impact_score: 75,
    };

    expect(() => classifyImprovementProposal(numericTypeProposal)).toThrow(/有効なタイプ/);
  });
});