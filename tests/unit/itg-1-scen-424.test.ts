import { detectAnomalousEvaluations } from '../../src/logic/it-3';

describe('食事評価データを献立生成ロジックに反映させる機能', () => {
  // SCEN-424
  test('満足度スコアが10など極端な値である場合、異常値として自動検出され除外される', () => {
    const testEvaluations = [
      {
        evaluationId: 'eval-001',
        userId: 'user-001',
        familyMemberId: 'member-001',
        mealId: 'meal-001',
        satisfactionScore: 5,
        completionRate: 100,
        requestContent: 'もっと野菜を増やしてほしい',
        createdAt: new Date('2024-01-15T10:00:00Z'),
      },
      {
        evaluationId: 'eval-002',
        userId: 'user-001',
        familyMemberId: 'member-002',
        mealId: 'meal-001',
        satisfactionScore: 10,
        completionRate: 95,
        requestContent: '',
        createdAt: new Date('2024-01-15T11:00:00Z'),
      },
      {
        evaluationId: 'eval-003',
        userId: 'user-001',
        familyMemberId: 'member-001',
        mealId: 'meal-002',
        satisfactionScore: 3,
        completionRate: 80,
        requestContent: 'もう一度作ってほしい',
        createdAt: new Date('2024-01-15T12:00:00Z'),
      },
      {
        evaluationId: 'eval-004',
        userId: 'user-001',
        familyMemberId: 'member-003',
        mealId: 'meal-002',
        satisfactionScore: 10,
        completionRate: 100,
        requestContent: '',
        createdAt: new Date('2024-01-15T13:00:00Z'),
      },
    ];

    const result = detectAnomalousEvaluations(testEvaluations);

    expect(result.anomalousEvaluationIds).toContain('eval-002');
    expect(result.anomalousEvaluationIds).toContain('eval-004');
    expect(result.anomalousEvaluationIds).not.toContain('eval-001');
    expect(result.anomalousEvaluationIds).not.toContain('eval-003');
    expect(result.anomalousEvaluationIds.length).toBe(2);

    expect(result.cleanEvaluationIds).toContain('eval-001');
    expect(result.cleanEvaluationIds).toContain('eval-003');
    expect(result.cleanEvaluationIds).not.toContain('eval-002');
    expect(result.cleanEvaluationIds).not.toContain('eval-004');
    expect(result.cleanEvaluationIds.length).toBe(2);

    expect(result.isExcludedFromMealGeneration).toBe(true);
    expect(result.anomalousCount).toBe(2);
    expect(result.cleanCount).toBe(2);
  });
});