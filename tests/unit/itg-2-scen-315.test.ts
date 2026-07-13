import { generateMenuWithConstraints } from '../../src/logic/it-1-br-2-1-1-1';

describe('献立生成要求受付・制約条件読み込み機能 - 制約条件が0件の場合', () => {
  // SCEN-315
  test('制約条件が0件のとき、デフォルト条件で献立生成要求が成立する', () => {
    // 前提: ユーザーがログイン済み、制約条件が0件
    const input = {
      userId: 'user-001',
      familyId: 'family-001',
      constraints: [],
      requestDate: new Date('2024-01-15T11:00:00Z'),
    };

    // 実行
    const result = generateMenuWithConstraints(input);

    // 期待値: 制約条件0件 → デフォルト条件が適用される
    expect(result.status).toBe('accepted');
    expect(result.constraintCount).toBe(0);
    expect(result.appliedDefaults).toEqual({
      nutritionStandard: 'default_base',
      allergyRestriction: 'none',
      foodCategoryRestriction: 'none',
      cookingTimeLimit: null,
      budgetLimit: null,
    });

    // 生成された献立がデフォルト条件に基づいている
    expect(result.menu).toBeDefined();
    expect(result.menu.id).toBeDefined();
    expect(result.menu.baseCondition).toBe('default');
    expect(result.menu.nutritionScore).toBeGreaterThanOrEqual(0);
    expect(result.menu.nutritionScore).toBeLessThanOrEqual(100);

    // リクエスト受付通知
    expect(result.acceptanceMessage).toMatch(/デフォルト条件/);
    expect(result.error).toBeNull();
  });
});