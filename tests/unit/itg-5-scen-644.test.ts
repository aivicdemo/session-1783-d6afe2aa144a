import { validateAlgorithmImprovement } from '../../src/logic/it-7-2-1';

describe('アルゴリズム改善検証基準判定機能', () => {
  // SCEN-644
  test('改善内容が1つ以上の検証基準を満たさない場合、承認が否と判定される', () => {
    const improvementData = {
      algorithmVersionId: 'v2.1.0',
      improvedAtTimestamp: new Date('2024-01-15T10:00:00Z'),
      improvementDescription: 'アレルギー制限ロジックの強化',
      validationCriteria: [
        {
          criteriaId: 'nutrition_accuracy',
          criteriaName: '栄養精度基準',
          targetThreshold: 85,
          actualValue: 88,
          isPass: true,
        },
        {
          criteriaId: 'user_satisfaction',
          criteriaName: 'ユーザー満足度基準',
          targetThreshold: 75,
          actualValue: 72,
          isPass: false,
        },
        {
          criteriaId: 'cooking_time_reduction',
          criteriaName: '調理時間短縮基準',
          targetThreshold: 80,
          actualValue: 82,
          isPass: true,
        },
        {
          criteriaId: 'allergy_handling',
          criteriaName: 'アレルギー対応基準',
          targetThreshold: 90,
          actualValue: 85,
          isPass: false,
        },
      ],
    };

    const result = validateAlgorithmImprovement(improvementData);

    expect(result.approvalStatus).toBe('否');
    expect(result.failedCriteria).toHaveLength(2);
    expect(result.failedCriteria).toContainEqual({
      criteriaId: 'user_satisfaction',
      criteriaName: 'ユーザー満足度基準',
      targetThreshold: 75,
      actualValue: 72,
      gap: -3,
    });
    expect(result.failedCriteria).toContainEqual({
      criteriaId: 'allergy_handling',
      criteriaName: 'アレルギー対応基準',
      targetThreshold: 90,
      actualValue: 85,
      gap: -5,
    });
    expect(result.passedCriteria).toHaveLength(2);
    expect(result.totalCriteriaCount).toBe(4);
    expect(result.passCriteriaCount).toBe(2);
    expect(result.failCriteriaCount).toBe(2);
    expect(result.approvalReason).toContain('ユーザー満足度基準');
    expect(result.approvalReason).toContain('アレルギー対応基準');
    expect(typeof result.validationTimestamp).toBe('string');
  });
});