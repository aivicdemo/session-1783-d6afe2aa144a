import { aggregateMealEvaluationData } from '../../src/logic/it-2';

describe('家族成員の食事評価データの蓄積・管理機能', () => {
  // SCEN-420
  test('食事評価データが1件のみ存在する場合、集約データとして正常に出力される', () => {
    const singleMealEvaluation = {
      mealEvaluationId: 'eval-001',
      familyMemberId: 'member-001',
      mealId: 'meal-2024-01-15-dinner',
      satisfactionScore: 4,
      completionRate: 95,
      requestContent: 'もっと塩辛くしてほしい',
      evaluatedAt: new Date('2024-01-15T19:30:00Z'),
    };

    const aggregationResult = aggregateMealEvaluationData([singleMealEvaluation]);

    expect(aggregationResult).toBeDefined();
    expect(typeof aggregationResult).toBe('object');

    expect(aggregationResult.totalRecords).toBe(1);
    expect(aggregationResult.averageSatisfactionScore).toBe(4);
    expect(aggregationResult.averageCompletionRate).toBe(95);

    expect(aggregationResult.evaluations).toBeDefined();
    expect(Array.isArray(aggregationResult.evaluations)).toBe(true);
    expect(aggregationResult.evaluations.length).toBe(1);

    expect(aggregationResult.evaluations[0].mealEvaluationId).toBe('eval-001');
    expect(aggregationResult.evaluations[0].familyMemberId).toBe('member-001');
    expect(aggregationResult.evaluations[0].mealId).toBe('meal-2024-01-15-dinner');
    expect(aggregationResult.evaluations[0].satisfactionScore).toBe(4);
    expect(aggregationResult.evaluations[0].completionRate).toBe(95);
    expect(aggregationResult.evaluations[0].requestContent).toBe('もっと塩辛くしてほしい');
    expect(aggregationResult.evaluations[0].evaluatedAt).toEqual(new Date('2024-01-15T19:30:00Z'));

    expect(aggregationResult.requestList).toBeDefined();
    expect(Array.isArray(aggregationResult.requestList)).toBe(true);
    expect(aggregationResult.requestList.length).toBe(1);
    expect(aggregationResult.requestList[0]).toBe('もっと塩辛くしてほしい');

    expect(aggregationResult.aggregatedAt).toBeDefined();
    expect(typeof aggregationResult.aggregatedAt).toBe('object');
  });
});