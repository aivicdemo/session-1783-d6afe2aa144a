import { detectConstraintChange } from '../../src/logic/it-7-2-1';

describe('献立生成の週次行動指標自動集計と改善効果定量比較', () => {
  // SCEN-533
  test('前回更新から7日以上経過した場合に変更検出が発火する', () => {
    const currentDateTime = new Date('2024-06-15T09:00:00Z');
    const lastUpdateDateTime = new Date('2024-06-08T09:00:00Z');
    
    const constraintCondition = {
      userId: 'user-001',
      familyId: 'family-001',
      allergyItems: ['egg', 'milk'],
      dietaryRestrictions: ['vegetarian'],
      cookingTimeLimit: 30,
      budgetLimit: 3000,
      lastUpdateDate: lastUpdateDateTime,
      createdAt: new Date('2024-05-01T10:00:00Z')
    };

    const elapsedDays = Math.floor(
      (currentDateTime.getTime() - constraintCondition.lastUpdateDate.getTime()) / 
      (1000 * 60 * 60 * 24)
    );

    expect(elapsedDays).toBe(7);

    const result = detectConstraintChange(constraintCondition, currentDateTime);

    expect(result.isDetected).toBe(true);
    expect(result.priorityScore).toBeGreaterThanOrEqual(0);
    expect(result.priorityScore).toBeLessThanOrEqual(100);
    expect(result.priorityRank).toMatch(/^(high|medium|low)$/);
    expect(result.detectionTimestamp).toEqual(currentDateTime);
    expect(result.elapsedDays).toBe(7);
    expect(result.lastUpdateDate).toEqual(lastUpdateDateTime);
    expect(result.needsImmediateReflection).toBe(true);
  });
});