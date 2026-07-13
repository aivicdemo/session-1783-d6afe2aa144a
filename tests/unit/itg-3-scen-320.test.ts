import { detectConstraintPriority } from '../../src/logic/it-1-br-3-2-1';

describe('Purchase Record and Monthly Food Cost Reduction Effect Analysis', () => {
  // SCEN-320
  test('should detect constraint priority equally for restriction info older than 7 days and newly entered restriction', () => {
    const baselineDate = new Date('2024-01-15T10:00:00Z');
    const sevenDaysAgoDate = new Date('2024-01-08T10:00:00Z');
    const currentDate = new Date('2024-01-15T10:00:00Z');

    const olderRestrictionInfo = {
      restrictionId: 'rest_001',
      userId: 'user_123',
      restrictionType: 'allergy',
      restrictionValue: 'peanut',
      createdAt: sevenDaysAgoDate,
      updatedAt: sevenDaysAgoDate,
      isActive: true,
    };

    const newRestrictionInfo = {
      restrictionId: 'rest_002',
      userId: 'user_123',
      restrictionType: 'calorie',
      restrictionValue: 'max_2000kcal',
      createdAt: currentDate,
      updatedAt: currentDate,
      isActive: true,
    };

    const olderPriority = detectConstraintPriority(olderRestrictionInfo, currentDate);
    const newPriority = detectConstraintPriority(newRestrictionInfo, currentDate);

    expect(olderPriority.priorityLevel).toBe(newPriority.priorityLevel);
    expect(olderPriority.priorityLevel).toBe(1);
    expect(newPriority.priorityLevel).toBe(1);
    expect(olderPriority.isEffective).toBe(true);
    expect(newPriority.isEffective).toBe(true);
    expect(olderPriority.weightInAlgorithm).toBeCloseTo(newPriority.weightInAlgorithm, 2);
  });
});