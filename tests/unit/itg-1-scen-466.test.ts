import { detectDietaryRestrictionConflicts } from '../../src/logic/it-1-br-4-2-1';

describe('食事制限条件の変更時に過去献立との抵触検出機能', () => {
  // SCEN-466: [edge] 複数食事制限条件の優先度自動判定機能 - 抵触リスク同一の制限条件は入力順序で優先度が決定される
  test('抵触リスク度数が同一の複数食事制限条件は入力順序に従って優先度が決定される', () => {
    const restrictionA = {
      id: 'restriction-a',
      name: '制限条件A',
      conflictRiskScore: 5,
      inputOrder: 1,
      inputTimestamp: new Date('2024-01-15T10:00:00Z'),
    };

    const restrictionB = {
      id: 'restriction-b',
      name: '制限条件B',
      conflictRiskScore: 5,
      inputOrder: 2,
      inputTimestamp: new Date('2024-01-15T10:05:00Z'),
    };

    const restrictionC = {
      id: 'restriction-c',
      name: '制限条件C',
      conflictRiskScore: 5,
      inputOrder: 3,
      inputTimestamp: new Date('2024-01-15T10:10:00Z'),
    };

    const pastMenuHistory = [
      {
        menuId: 'menu-001',
        dishName: '牛丼',
        ingredients: ['牛肉', '玉ねぎ'],
        createdAt: new Date('2024-01-10T19:00:00Z'),
      },
      {
        menuId: 'menu-002',
        dishName: 'サラダ',
        ingredients: ['レタス', 'トマト'],
        createdAt: new Date('2024-01-12T19:00:00Z'),
      },
    ];

    // 初回実行：A → B → C の順序で入力
    const initialResult = detectDietaryRestrictionConflicts([
      restrictionA,
      restrictionB,
      restrictionC,
    ], pastMenuHistory);

    expect(initialResult.prioritizedRestrictions.length).toBe(3);
    expect(initialResult.prioritizedRestrictions[0].id).toBe('restriction-a');
    expect(initialResult.prioritizedRestrictions[1].id).toBe('restriction-b');
    expect(initialResult.prioritizedRestrictions[2].id).toBe('restriction-c');

    // 再度実行：C → B → A の順序で入力（入力順序を逆にする）
    const restrictionCReversed = {
      ...restrictionC,
      inputOrder: 1,
      inputTimestamp: new Date('2024-01-15T11:00:00Z'),
    };

    const restrictionBReversed = {
      ...restrictionB,
      inputOrder: 2,
      inputTimestamp: new Date('2024-01-15T11:05:00Z'),
    };

    const restrictionAReversed = {
      ...restrictionA,
      inputOrder: 3,
      inputTimestamp: new Date('2024-01-15T11:10:00Z'),
    };

    const reversedResult = detectDietaryRestrictionConflicts([
      restrictionCReversed,
      restrictionBReversed,
      restrictionAReversed,
    ], pastMenuHistory);

    expect(reversedResult.prioritizedRestrictions.length).toBe(3);
    expect(reversedResult.prioritizedRestrictions[0].id).toBe('restriction-c');
    expect(reversedResult.prioritizedRestrictions[1].id).toBe('restriction-b');
    expect(reversedResult.prioritizedRestrictions[2].id).toBe('restriction-a');
  });
});