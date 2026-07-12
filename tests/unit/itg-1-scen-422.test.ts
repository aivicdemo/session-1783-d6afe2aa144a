import { aggregateFamilyMealEvaluations } from '../../src/logic/it-2';

describe('家族成員の食事評価データ集約機能', () => {
  // SCEN-422
  test('破損・不完全な評価データが存在する場合、エラーを検出して正常なデータのみを集約する', () => {
    const mealId = 'meal-001';
    const evaluationDataset = [
      {
        familyMemberId: 'member-001',
        memberName: '母親',
        satisfactionScore: 4,
        completionRate: 0.9,
        request: 'もっと塩辛くしてほしい',
        evaluatedAt: '2024-01-15T19:30:00Z',
      },
      {
        familyMemberId: 'member-002',
        memberName: '父親',
        satisfactionScore: null,
        completionRate: 0.7,
        request: 'ご飯の量を増やしてほしい',
        evaluatedAt: '2024-01-15T19:31:00Z',
      },
      {
        familyMemberId: 'member-003',
        memberName: '子ども',
        satisfactionScore: 5,
        completionRate: 1.0,
        request: 'デザートがおいしかった',
        evaluatedAt: 'invalid-date-format',
      },
      {
        familyMemberId: 'member-004',
        memberName: '祖母',
        satisfactionScore: 3,
        completionRate: 0.8,
        request: '健康的でよかった',
        evaluatedAt: '2024-01-15T19:32:00Z',
      },
    ];

    const result = aggregateFamilyMealEvaluations({
      mealId,
      evaluationDataset,
    });

    expect(result.hasError).toBe(true);
    expect(result.errorDetails).toHaveLength(2);

    const nullScoreError = result.errorDetails.find(
      (e) => e.familyMemberId === 'member-002'
    );
    expect(nullScoreError).toBeDefined();
    expect(nullScoreError?.errorType).toBe('満足度スコア');
    expect(nullScoreError?.memberName).toBe('父親');
    expect(nullScoreError?.issue).toMatch(/null|存在しない/);

    const invalidDateError = result.errorDetails.find(
      (e) => e.familyMemberId === 'member-003'
    );
    expect(invalidDateError).toBeDefined();
    expect(invalidDateError?.errorType).toBe('評価日時');
    expect(invalidDateError?.memberName).toBe('子ども');
    expect(invalidDateError?.issue).toMatch(/日付形式|不正/);

    expect(result.validAggregation).toEqual({
      mealId: 'meal-001',
      aggregatedCount: 2,
      averageSatisfactionScore: 3.5,
      averageCompletionRate: 0.9,
      memberEvaluations: [
        {
          familyMemberId: 'member-001',
          memberName: '母親',
          satisfactionScore: 4,
          completionRate: 0.9,
          request: 'もっと塩辛くしてほしい',
          evaluatedAt: '2024-01-15T19:30:00Z',
        },
        {
          familyMemberId: 'member-004',
          memberName: '祖母',
          satisfactionScore: 3,
          completionRate: 0.8,
          request: '健康的でよかった',
          evaluatedAt: '2024-01-15T19:32:00Z',
        },
      ],
    });

    expect(result.errorLog).toMatch(/破損|不完全/);
    expect(result.errorLog).toContain('member-002');
    expect(result.errorLog).toContain('member-003');

    expect(result.userNotification).toBeDefined();
    expect(result.userNotification?.message).toMatch(/エラーが検出されました/);
    expect(result.userNotification?.affectedMembers).toEqual([
      'member-002',
      'member-003',
    ]);
    expect(result.userNotification?.processingStatus).toBe('partial_success');
  });
});