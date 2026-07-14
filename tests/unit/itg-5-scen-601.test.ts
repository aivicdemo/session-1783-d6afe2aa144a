import { classifyAndAggregateMenuRejectReasons } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動分類・集計機能', () => {
  // SCEN-601
  test('献立却下修正理由を自動分類し、失敗パターン別に集計できる', () => {
    const sampleReasons = [
      { id: 1, reason: '栄養バランスが偏っている', timestamp: '2024-01-15T10:00:00Z' },
      { id: 2, reason: '栄養価が不十分', timestamp: '2024-01-15T10:15:00Z' },
      { id: 3, reason: '家族が好きな食材が入っていない', timestamp: '2024-01-15T10:30:00Z' },
      { id: 4, reason: '調理時間が60分を超える', timestamp: '2024-01-15T10:45:00Z' },
      { id: 5, reason: '材料が冷蔵庫にない', timestamp: '2024-01-15T11:00:00Z' },
      { id: 6, reason: '栄養の偏り', timestamp: '2024-01-15T11:15:00Z' },
      { id: 7, reason: '調理工程が複雑すぎる', timestamp: '2024-01-15T11:30:00Z' },
      { id: 8, reason: '', timestamp: '2024-01-15T11:45:00Z' },
      { id: 9, reason: '予算を超えている', timestamp: '2024-01-15T12:00:00Z' },
      { id: 10, reason: '子どもが嫌いな食材が含まれている', timestamp: '2024-01-15T12:15:00Z' },
    ];

    const result = classifyAndAggregateMenuRejectReasons(sampleReasons);

    expect(result).toBeDefined();
    expect(typeof result).toBe('object');

    expect(result.totalCount).toBe(10);

    expect(result.categories).toBeDefined();
    expect(Array.isArray(result.categories)).toBe(true);

    const nutritionCategory = result.categories.find(
      (cat: { name: string; count: number }) => cat.name === '栄養バランス'
    );
    expect(nutritionCategory).toBeDefined();
    expect(nutritionCategory.count).toBe(2);

    const preferenceCategory = result.categories.find(
      (cat: { name: string; count: number }) => cat.name === '家族の好み'
    );
    expect(preferenceCategory).toBeDefined();
    expect(preferenceCategory.count).toBe(2);

    const cookingTimeCategory = result.categories.find(
      (cat: { name: string; count: number }) => cat.name === '調理時間'
    );
    expect(cookingTimeCategory).toBeDefined();
    expect(cookingTimeCategory.count).toBe(2);

    const ingredientAvailabilityCategory = result.categories.find(
      (cat: { name: string; count: number }) => cat.name === '食材在庫'
    );
    expect(ingredientAvailabilityCategory).toBeDefined();
    expect(ingredientAvailabilityCategory.count).toBe(1);

    const budgetCategory = result.categories.find(
      (cat: { name: string; count: number }) => cat.name === '予算'
    );
    expect(budgetCategory).toBeDefined();
    expect(budgetCategory.count).toBe(1);

    const unclassifiedCategory = result.categories.find(
      (cat: { name: string; count: number }) => cat.name === '未分類'
    );
    expect(unclassifiedCategory).toBeDefined();
    expect(unclassifiedCategory.count).toBe(2);

    const categoryCountSum = result.categories.reduce(
      (sum: number, cat: { name: string; count: number }) => sum + cat.count,
      0
    );
    expect(categoryCountSum).toBe(result.totalCount);

    expect(result.failurePatterns).toBeDefined();
    expect(Array.isArray(result.failurePatterns)).toBe(true);
    expect(result.failurePatterns.length).toBeGreaterThan(0);

    result.failurePatterns.forEach(
      (pattern: { category: string; count: number; percentage: number }) => {
        expect(typeof pattern.category).toBe('string');
        expect(typeof pattern.count).toBe('number');
        expect(typeof pattern.percentage).toBe('number');
        expect(pattern.count).toBeGreaterThanOrEqual(0);
        expect(pattern.percentage).toBeGreaterThanOrEqual(0);
        expect(pattern.percentage).toBeLessThanOrEqual(100);
      }
    );

    const nutritionPercentage =
      (nutritionCategory.count / result.totalCount) * 100;
    const nutritionPattern = result.failurePatterns.find(
      (p: { category: string }) => p.category === '栄養バランス'
    );
    expect(nutritionPattern.percentage).toBeCloseTo(nutritionPercentage, 1);

    expect(result.classificationDetails).toBeDefined();
    expect(Array.isArray(result.classificationDetails)).toBe(true);
    expect(result.classificationDetails.length).toBe(10);

    result.classificationDetails.forEach(
      (detail: { originalId: number; reason: string; category: string }) => {
        expect(typeof detail.originalId).toBe('number');
        expect(typeof detail.reason).toBe('string');
        expect(typeof detail.category).toBe('string');
        const originalEntry = sampleReasons.find((r) => r.id === detail.originalId);
        expect(originalEntry).toBeDefined();
      }
    );

    const allCategories = result.categories.map(
      (cat: { name: string }) => cat.name
    );
    result.classificationDetails.forEach(
      (detail: { category: string }) => {
        expect(allCategories).toContain(detail.category);
      }
    );
  });
});