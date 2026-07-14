import { calculateConstraintPriority } from '../../src/logic/it-7-2-1';

describe('献立生成アルゴリズムの成功率・調理時間短縮度・ユーザー満足度スコアなどの行動指標を週次で自動集計', () => {
  // SCEN-655
  test('複数制限条件が2件ちょうどの場合に優先度付与と処理順序が正しく決定される', () => {
    const constraintA = {
      id: 'constraint_A',
      type: 'allergen',
      name: 'アレルギー対応',
      priority: 1,
      isActive: true,
      createdAt: new Date('2024-01-15T10:00:00Z'),
    };

    const constraintB = {
      id: 'constraint_B',
      type: 'dietaryRestriction',
      name: '食事制限対応',
      priority: 2,
      isActive: true,
      createdAt: new Date('2024-01-15T10:00:00Z'),
    };

    const constraints = [constraintA, constraintB];

    const result = calculateConstraintPriority(constraints);

    expect(result).toEqual({
      totalConstraints: 2,
      processedConstraints: [
        {
          id: 'constraint_A',
          type: 'allergen',
          name: 'アレルギー対応',
          priority: 1,
          isActive: true,
          createdAt: new Date('2024-01-15T10:00:00Z'),
          processingOrder: 1,
        },
        {
          id: 'constraint_B',
          type: 'dietaryRestriction',
          name: '食事制限対応',
          priority: 2,
          isActive: true,
          createdAt: new Date('2024-01-15T10:00:00Z'),
          processingOrder: 2,
        },
      ],
      executionSequence: ['constraint_A', 'constraint_B'],
      hasErrors: false,
      errorMessage: null,
    });

    expect(result.totalConstraints).toBe(2);
    expect(result.processedConstraints.length).toBe(2);
    expect(result.processedConstraints[0].priority).toBe(1);
    expect(result.processedConstraints[1].priority).toBe(2);
    expect(result.executionSequence[0]).toBe('constraint_A');
    expect(result.executionSequence[1]).toBe('constraint_B');
    expect(result.hasErrors).toBe(false);
    expect(result.errorMessage).toBeNull();
  });
});