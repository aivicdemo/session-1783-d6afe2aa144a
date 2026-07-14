import { describe, test, expect, beforeEach } from '@jest/globals';
import { validateAlgorithmImprovement } from '../../src/logic/it-7-2-1';

describe('アルゴリズム改善検証ダッシュボード - 週次効果比較機能', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-643
  test('改善内容が事前定義検証基準をすべて満たす場合、承認可否が正と判定される', () => {
    const improvementProposal = {
      proposal_id: 'ALGO-IMP-2024-001',
      algorithm_version_before: 'v2.1.0',
      algorithm_version_after: 'v2.2.0',
      description: '栄養バランスロジック改善 - カルシウム摂取量判定精度向上',
      implementation_date: '2024-01-15',
      target_metrics: {
        success_rate_improvement_percent: 6.5,
        cooking_time_reduction_percent: 3.2,
        satisfaction_score_improvement: 0.6,
      },
      validation_criteria: {
        min_success_rate_improvement: 5.0,
        min_cooking_time_reduction: 2.0,
        min_satisfaction_score_improvement: 0.5,
      },
      nutritionist_approval: true,
      technical_feasibility_score: 85,
      user_impact_score: 78,
    };

    const result = validateAlgorithmImprovement(improvementProposal);

    expect(result.is_approved).toBe(true);
    expect(result.approval_reason).toBe('承認可能');
    expect(result.validation_status).toBe('OK');
    expect(result.success_rate_meets_criteria).toBe(true);
    expect(result.cooking_time_meets_criteria).toBe(true);
    expect(result.satisfaction_score_meets_criteria).toBe(true);
    expect(result.nutritionist_approval_status).toBe('approved');
    expect(result.estimated_effect_score).toBeGreaterThan(75);
    expect(result.implementation_recommended).toBe(true);
  });
});