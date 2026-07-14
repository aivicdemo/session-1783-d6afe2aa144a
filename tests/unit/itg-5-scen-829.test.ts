import { classifyRejectionReason } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類機能', () => {
  // SCEN-829: 定義されていないカテゴリに該当する却下理由が入力された場合、エラーが返却されるか新規カテゴリとして登録される
  test('should throw error or register new category when undefined category is provided', () => {
    const predefinedCategories = [
      '栄養バランス不適切',
      '家族好み未反映',
      '調理時間超過',
      '食材制限漏れ',
    ];

    const rejectionReason = '新しい理由カテゴリ';
    const rejectionData = {
      rejectionReasonText: rejectionReason,
      rejectionReasonId: 'rejection_001',
      userId: 'user_123',
      menuId: 'menu_456',
      timestamp: new Date('2024-01-15T11:00:00Z'),
    };

    const definedCategories = {
      '栄養バランス不適切': { id: 'cat_001', name: '栄養バランス不適切', priority: 1 },
      '家族好み未反映': { id: 'cat_002', name: '家族好み未反映', priority: 2 },
      '調理時間超過': { id: 'cat_003', name: '調理時間超過', priority: 3 },
      '食材制限漏れ': { id: 'cat_004', name: '食材制限漏れ', priority: 4 },
    };

    // Test pattern 1: 未定義カテゴリ入力時にエラーが返却される場合
    try {
      const result = classifyRejectionReason(
        rejectionData,
        definedCategories,
        false
      );

      // エラーが発生しなかった場合、新規カテゴリとして登録された状態
      expect(result).toHaveProperty('action');
      expect(result.action).toBe('register_new_category');
      expect(result).toHaveProperty('categoryName');
      expect(result.categoryName).toBe('新しい理由カテゴリ');
      expect(result).toHaveProperty('rejectionReasonId');
      expect(result.rejectionReasonId).toBe('rejection_001');
      expect(result).toHaveProperty('isNewCategory');
      expect(result.isNewCategory).toBe(true);
      expect(result).toHaveProperty('classificationStatus');
      expect(result.classificationStatus).toBe('pending_approval');
    } catch (error) {
      // エラーが発生した場合、未定義カテゴリに関するエラーメッセージが含まれていること
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toMatch(/未定義|カテゴリ|定義されていない/);
    }
  });

  test('should classify rejection reason when category is predefined', () => {
    const rejectionData = {
      rejectionReasonText: '調理に時間がかかりすぎた',
      rejectionReasonId: 'rejection_002',
      userId: 'user_123',
      menuId: 'menu_789',
      timestamp: new Date('2024-01-15T12:30:00Z'),
    };

    const definedCategories = {
      '栄養バランス不適切': { id: 'cat_001', name: '栄養バランス不適切', priority: 1 },
      '家族好み未反映': { id: 'cat_002', name: '家族好み未反映', priority: 2 },
      '調理時間超過': { id: 'cat_003', name: '調理時間超過', priority: 3 },
      '食材制限漏れ': { id: 'cat_004', name: '食材制限漏れ', priority: 4 },
    };

    const result = classifyRejectionReason(
      rejectionData,
      definedCategories,
      true
    );

    expect(result).toHaveProperty('action');
    expect(result.action).toBe('classify_to_existing_category');
    expect(result).toHaveProperty('categoryId');
    expect(result.categoryId).toBe('cat_003');
    expect(result).toHaveProperty('categoryName');
    expect(result.categoryName).toBe('調理時間超過');
    expect(result).toHaveProperty('rejectionReasonId');
    expect(result.rejectionReasonId).toBe('rejection_002');
    expect(result).toHaveProperty('isNewCategory');
    expect(result.isNewCategory).toBe(false);
    expect(result).toHaveProperty('classificationStatus');
    expect(result.classificationStatus).toBe('classified');
    expect(result).toHaveProperty('matchConfidence');
    expect(typeof result.matchConfidence).toBe('number');
    expect(result.matchConfidence).toBeGreaterThanOrEqual(0);
    expect(result.matchConfidence).toBeLessThanOrEqual(100);
  });

  test('should handle empty rejection reason text', () => {
    const rejectionData = {
      rejectionReasonText: '',
      rejectionReasonId: 'rejection_003',
      userId: 'user_123',
      menuId: 'menu_999',
      timestamp: new Date('2024-01-15T13:00:00Z'),
    };

    const definedCategories = {
      '栄養バランス不適切': { id: 'cat_001', name: '栄養バランス不適切', priority: 1 },
      '家族好み未反映': { id: 'cat_002', name: '家族好み未反映', priority: 2 },
      '調理時間超過': { id: 'cat_003', name: '調理時間超過', priority: 3 },
      '食材制限漏れ': { id: 'cat_004', name: '食材制限漏れ', priority: 4 },
    };

    expect(() => classifyRejectionReason(
      rejectionData,
      definedCategories,
      true
    )).toThrow(/却下理由|テキスト|空|入力/);
  });

  test('should maintain system integrity when new category is registered', () => {
    const rejectionData = {
      rejectionReasonText: '複合的な問題が発生',
      rejectionReasonId: 'rejection_004',
      userId: 'user_456',
      menuId: 'menu_111',
      timestamp: new Date('2024-01-15T14:15:00Z'),
    };

    const definedCategories = {
      '栄養バランス不適切': { id: 'cat_001', name: '栄養バランス不適切', priority: 1 },
      '家族好み未反映': { id: 'cat_002', name: '家族好み未反映', priority: 2 },
      '調理時間超過': { id: 'cat_003', name: '調理時間超過', priority: 3 },
      '食材制限漏れ': { id: 'cat_004', name: '食材制限漏れ', priority: 4 },
    };

    try {
      const result = classifyRejectionReason(
        rejectionData,
        definedCategories,
        false
      );

      if (result.action === 'register_new_category') {
        // 新規カテゴリ登録時、システム整合性を検証
        expect(result).toHaveProperty('rejectionReasonId');
        expect(result.rejectionReasonId).toBe('rejection_004');
        expect(result).toHaveProperty('categoryName');
        expect(typeof result.categoryName).toBe('string');
        expect(result.categoryName.length).toBeGreaterThan(0);
        expect(result).toHaveProperty('userId');
        expect(result.userId).toBe('user_456');
        expect(result).toHaveProperty('menuId');
        expect(result.menuId).toBe('menu_111');
        expect(result).toHaveProperty('timestamp');
        expect(result.timestamp).toEqual(new Date('2024-01-15T14:15:00Z'));
        expect(result).toHaveProperty('isNewCategory');
        expect(result.isNewCategory).toBe(true);
        expect(result).toHaveProperty('classificationStatus');
        expect(['pending_approval', 'pending_review']).toContain(result.classificationStatus);
      }
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toMatch(/未定義|カテゴリ|登録|定義/);
    }
  });
});