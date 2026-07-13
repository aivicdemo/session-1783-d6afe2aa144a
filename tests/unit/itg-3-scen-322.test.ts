import { calculateConstraintPriority } from '../../src/logic/it-1-br-3-2-1';

describe('購入実績の記録と月次食費削減効果の自動集計・分析機能', () => {
  // SCEN-322
  test('制約条件の優先度判定機能 - 優先度判定時に過去の献立データが存在しない場合にも優先度が正常に計算される', () => {
    const emptyMealHistory: any[] = [];
    
    const constraintSet = {
      budgetLimit: 5000,
      nutritionBalance: true,
      allergyResponse: true,
      cookingTimeLimit: 60,
    };

    const priorityResult1 = calculateConstraintPriority(
      constraintSet,
      emptyMealHistory
    );

    expect(priorityResult1).toBeDefined();
    expect(Array.isArray(priorityResult1.priorityList)).toBe(true);
    expect(priorityResult1.priorityList.length).toBe(4);

    priorityResult1.priorityList.forEach((item: any) => {
      expect(typeof item.constraintName).toBe('string');
      expect(typeof item.priorityScore).toBe('number');
      expect(item.priorityScore).toBeGreaterThanOrEqual(0);
      expect(item.priorityScore).toBeLessThanOrEqual(100);
    });

    const priorityOrder1 = priorityResult1.priorityList.map(
      (item: any) => item.constraintName
    );
    expect(priorityOrder1).toEqual(['allergyResponse', 'nutritionBalance', 'cookingTimeLimit', 'budgetLimit']);

    const priorityResult2 = calculateConstraintPriority(
      constraintSet,
      emptyMealHistory
    );
    expect(priorityResult2.priorityList).toEqual(priorityResult1.priorityList);

    const priorityResult3 = calculateConstraintPriority(
      constraintSet,
      emptyMealHistory
    );
    expect(priorityResult3.priorityList[0].priorityScore).toBe(95);
    expect(priorityResult3.priorityList[1].priorityScore).toBe(85);
    expect(priorityResult3.priorityList[2].priorityScore).toBe(70);
    expect(priorityResult3.priorityList[3].priorityScore).toBe(75);

    expect(priorityResult3.totalConstraintCount).toBe(4);
    expect(priorityResult3.hasHistoricalData).toBe(false);
  });
});