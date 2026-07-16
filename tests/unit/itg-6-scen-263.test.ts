import { classifyMenuModificationReasons } from '../../src/logic/it-8-1-2-1';

describe('献立却下修正理由自動分類機能', () => {
  // SCEN-263
  test('献立却下修正履歴から4つのカテゴリに正確に自動分類される', () => {
    const testMenuModifications = [
      {
        menuModificationId: 'mod_001',
        userId: 'user_001',
        menuId: 'menu_001',
        rejectionReason: 'タンパク質が足りない、野菜が少ない',
        createdAt: '2024-01-15T09:00:00Z',
      },
      {
        menuModificationId: 'mod_002',
        userId: 'user_001',
        menuId: 'menu_002',
        rejectionReason: '子どもが嫌いな食材が入っている',
        createdAt: '2024-01-15T10:00:00Z',
      },
      {
        menuModificationId: 'mod_003',
        userId: 'user_001',
        menuId: 'menu_003',
        rejectionReason: '調理に50分かかる、もっと簡単にしてほしい',
        createdAt: '2024-01-15T11:00:00Z',
      },
      {
        menuModificationId: 'mod_004',
        userId: 'user_001',
        menuId: 'menu_004',
        rejectionReason: 'ナッツアレルギーの対応が漏れている',
        createdAt: '2024-01-15T12:00:00Z',
      },
      {
        menuModificationId: 'mod_005',
        userId: 'user_001',
        menuId: 'menu_005',
        rejectionReason: 'カルシウム不足、栄養バランスが悪い',
        createdAt: '2024-01-15T13:00:00Z',
      },
      {
        menuModificationId: 'mod_006',
        userId: 'user_001',
        menuId: 'menu_006',
        rejectionReason: '家族が好きなメニューじゃない',
        createdAt: '2024-01-15T14:00:00Z',
      },
      {
        menuModificationId: 'mod_007',
        userId: 'user_001',
        menuId: 'menu_007',
        rejectionReason: '調理時間が長すぎる',
        createdAt: '2024-01-15T15:00:00Z',
      },
      {
        menuModificationId: 'mod_008',
        userId: 'user_001',
        menuId: 'menu_008',
        rejectionReason: 'グルテンフリー対応が足りない',
        createdAt: '2024-01-15T16:00:00Z',
      },
    ];

    const classificationResult = classifyMenuModificationReasons(testMenuModifications);

    expect(classificationResult.nutritionalImbalance).toEqual([
      expect.objectContaining({
        menuModificationId: 'mod_001',
        rejectionReason: 'タンパク質が足りない、野菜が少ない',
        category: 'nutritionalImbalance',
      }),
      expect.objectContaining({
        menuModificationId: 'mod_005',
        rejectionReason: 'カルシウム不足、栄養バランスが悪い',
        category: 'nutritionalImbalance',
      }),
    ]);
    expect(classificationResult.nutritionalImbalance.length).toBe(2);

    expect(classificationResult.familyPreferenceNotReflected).toEqual([
      expect.objectContaining({
        menuModificationId: 'mod_002',
        rejectionReason: '子どもが嫌いな食材が入っている',
        category: 'familyPreferenceNotReflected',
      }),
      expect.objectContaining({
        menuModificationId: 'mod_006',
        rejectionReason: '家族が好きなメニューじゃない',
        category: 'familyPreferenceNotReflected',
      }),
    ]);
    expect(classificationResult.familyPreferenceNotReflected.length).toBe(2);

    expect(classificationResult.cookingTimeExceeded).toEqual([
      expect.objectContaining({
        menuModificationId: 'mod_003',
        rejectionReason: '調理に50分かかる、もっと簡単にしてほしい',
        category: 'cookingTimeExceeded',
      }),
      expect.objectContaining({
        menuModificationId: 'mod_007',
        rejectionReason: '調理時間が長すぎる',
        category: 'cookingTimeExceeded',
      }),
    ]);
    expect(classificationResult.cookingTimeExceeded.length).toBe(2);

    expect(classificationResult.dietaryRestrictionMissed).toEqual([
      expect.objectContaining({
        menuModificationId: 'mod_004',
        rejectionReason: 'ナッツアレルギーの対応が漏れている',
        category: 'dietaryRestrictionMissed',
      }),
      expect.objectContaining({
        menuModificationId: 'mod_008',
        rejectionReason: 'グルテンフリー対応が足りない',
        category: 'dietaryRestrictionMissed',
      }),
    ]);
    expect(classificationResult.dietaryRestrictionMissed.length).toBe(2);

    const totalClassifiedCount =
      classificationResult.nutritionalImbalance.length +
      classificationResult.familyPreferenceNotReflected.length +
      classificationResult.cookingTimeExceeded.length +
      classificationResult.dietaryRestrictionMissed.length;

    expect(totalClassifiedCount).toBe(testMenuModifications.length);

    const allCategoriesRepresented = [
      classificationResult.nutritionalImbalance.length > 0,
      classificationResult.familyPreferenceNotReflected.length > 0,
      classificationResult.cookingTimeExceeded.length > 0,
      classificationResult.dietaryRestrictionMissed.length > 0,
    ].every((represented) => represented === true);

    expect(allCategoriesRepresented).toBe(true);

    const misclassifiedItems = testMenuModifications.filter((original) => {
      const found = classificationResult.nutritionalImbalance
        .concat(classificationResult.familyPreferenceNotReflected)
        .concat(classificationResult.cookingTimeExceeded)
        .concat(classificationResult.dietaryRestrictionMissed)
        .find(
          (classified) =>
            classified.menuModificationId === original.menuModificationId &&
            classified.userId === original.userId &&
            classified.menuId === original.menuId &&
            classified.rejectionReason === original.rejectionReason &&
            classified.createdAt === original.createdAt
        );
      return !found;
    });

    expect(misclassifiedItems.length).toBe(0);
  });
});