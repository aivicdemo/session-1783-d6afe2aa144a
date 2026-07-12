import { detectCorruptedMealEvaluationData } from '../../src/logic/it-1-br-4-2-1';

describe('食事制限条件の変更時に過去献立との抵触検出機能', () => {
  // SCEN-584
  test('[error] ルール変更の自動検証 - 食事評価データが破損している場合、検証エラーが発生し開発チームに通知される', () => {
    const corruptedMealEvaluationData = {
      mealEvaluationId: 'eval-001',
      familyMemberId: 'member-001',
      mealId: 'meal-001',
      satisfactionScore: null,
      completionRate: NaN,
      requestText: undefined,
      timestamp: 'invalid-date-string'
    };

    const validMealEvaluationData = {
      mealEvaluationId: 'eval-002',
      familyMemberId: 'member-002',
      mealId: 'meal-002',
      satisfactionScore: 5,
      completionRate: 100,
      requestText: 'More vegetables please',
      timestamp: '2024-01-15T18:30:00Z'
    };

    const evaluationDataset = [validMealEvaluationData, corruptedMealEvaluationData];

    const result = detectCorruptedMealEvaluationData(evaluationDataset);

    expect(result.hasError).toBe(true);
    expect(result.corruptedRecordCount).toBe(1);
    expect(result.corruptedRecords).toContainEqual(
      expect.objectContaining({
        mealEvaluationId: 'eval-001',
        errorType: '破損'
      })
    );
    expect(result.errorMessage).toMatch(/破損/);
    expect(result.notificationSent).toBe(true);
    expect(result.developmentTeamNotified).toBe(true);
    expect(result.errorLogRecorded).toBe(true);
    expect(() => {
      detectCorruptedMealEvaluationData([corruptedMealEvaluationData]);
    }).toThrow(/破損/);
  });
});