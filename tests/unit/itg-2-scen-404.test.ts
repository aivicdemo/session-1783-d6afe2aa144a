import { detectConflictingMenuPatterns } from '../../src/logic/it-1-br-2-1-1-1';

describe('ユーザー食事記録と栄養摂取量の推移データダッシュボード', () => {
  // SCEN-404
  test('過去献立データが空の場合、検出結果は空一覧として返される', () => {
    const userId = 'user-001';
    const familyMemberId = 'family-001';
    const newRestriction = {
      restrictionId: 'rest-001',
      type: 'allergen',
      ingredient: 'peanut',
      addedAt: '2024-01-15T10:00:00Z',
    };
    const pastMenus = [];

    const result = detectConflictingMenuPatterns({
      userId,
      familyMemberId,
      newRestriction,
      pastMenus,
    });

    expect(result).toEqual({
      detectedPatterns: [],
      totalCount: 0,
      hasConflict: false,
      message: '検出結果がありません',
    });
    expect(Array.isArray(result.detectedPatterns)).toBe(true);
    expect(result.totalCount).toBe(0);
    expect(result.hasConflict).toBe(false);
  });
});