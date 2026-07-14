import { convertOverdueEvaluationToUnsubmitted } from '../../src/logic/it-7-2-1';

describe('食事評価入力期限管理機能', () => {
  // SCEN-635
  test('入力期限を24時間以上超過した評価データが未入力扱いに変換される', () => {
    const now = new Date('2024-01-15T10:00:00Z');
    const deadlineExceededByOneHour = new Date('2024-01-14T08:59:00Z');

    const mealEvaluationWithExpiredDeadline = {
      evaluationId: 'eval-001',
      familyMemberId: 'member-001',
      mealDate: '2024-01-14',
      submissionDeadline: deadlineExceededByOneHour,
      status: 'pending',
      satisfactionScore: null,
      completionRate: null,
      requestText: null,
    };

    const result = convertOverdueEvaluationToUnsubmitted(
      mealEvaluationWithExpiredDeadline,
      now,
    );

    expect(result.status).toBe('unsubmitted');
    expect(result.evaluationId).toBe('eval-001');
    expect(result.familyMemberId).toBe('member-001');
    expect(result.mealDate).toBe('2024-01-14');
    expect(result.satisfactionScore).toBeNull();
    expect(result.completionRate).toBeNull();
    expect(result.requestText).toBeNull();
  });
});