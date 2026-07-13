import { validateDietaryRestriction } from '../../src/logic/it-1-br-2-1-1-1';

describe('食事記録と栄養摂取量の推移データ集計ダッシュボード機能', () => {
  // SCEN-402: [edge] 食事制限条件入力検証機能 - 過去献立が存在しない新規ユーザーの場合、抵触検出なしで条件を受け入れる
  test('SCEN-402: 過去献立が存在しない新規ユーザーの食事制限条件入力検証', async () => {
    // Arrange: 新規ユーザーで過去献立データが存在しない状態
    const userId = 'user_new_20240101';
    const userPastMenus: any[] = [];
    const dietaryRestriction = {
      allergens: ['egg', 'peanut'],
      nutritionRestriction: 'low-sodium',
      cookingTimeLimit: 30,
    };

    // Act: 食事制限条件を入力・検証
    const result = await validateDietaryRestriction({
      userId,
      pastMenus: userPastMenus,
      restriction: dietaryRestriction,
    });

    // Assert: 新規ユーザーは抵触検出スキップされ、条件が受け入れられることを確認
    expect(result.status).toBe(200);
    expect(result.isValid).toBe(true);
    expect(result.conflictDetected).toBe(false);
    expect(result.conflictingMenus).toEqual([]);
    expect(result.savedRestriction).toEqual({
      userId,
      allergens: ['egg', 'peanut'],
      nutritionRestriction: 'low-sodium',
      cookingTimeLimit: 30,
      createdAt: expect.stringMatching(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/),
    });
    expect(result.message).toMatch(/正常に保存されました/);
  });
});