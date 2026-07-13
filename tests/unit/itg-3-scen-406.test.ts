import { determineMealPolicy } from '../../src/logic/it-1-br-3-2-1';

describe('Purchase Record and Monthly Food Cost Reduction Effect Analysis', () => {
  // SCEN-406: [error] 献立方針決定ロジック - 栄養摂取データと食費実績の分析結果が不完全な場合、デフォルト方針が適用される
  test('should apply default meal policy when nutrition intake data or food cost performance data is incomplete', () => {
    const incompleteNutritionData = {
      userId: 'user_001',
      familyMemberId: 'member_001',
      month: '2024-01',
      proteinGrams: null,
      fatGrams: 45,
      carbohydrateGrams: 250,
      fiberGrams: undefined,
      calciumMg: 800,
      ironMg: 12,
      vitaminAMcg: 700,
      vitaminCMg: 90,
      achievementRate: null,
    };

    const incompleteFoodCostData = {
      userId: 'user_001',
      month: '2024-01',
      budgetAmount: 50000,
      actualAmount: undefined,
      categoryExpense: {
        vegetables: 12000,
        meat: null,
        fish: 8000,
        dairy: 6000,
        grains: 5000,
      },
      exceedanceAmount: NaN,
      exceedanceRatio: null,
    };

    const incompletePolicyAnalysis = {
      nutritionData: incompleteNutritionData,
      costData: incompleteFoodCostData,
      analysisTimestamp: '2024-01-31T23:59:59Z',
    };

    const warnings: string[] = [];
    const originalWarn = console.warn;
    console.warn = (msg: string) => {
      warnings.push(msg);
    };

    const result = determineMealPolicy(incompletePolicyAnalysis);

    console.warn = originalWarn;

    expect(result).toEqual({
      userId: 'user_001',
      policyType: 'default',
      nutritionBalanceFocus: 'balanced',
      priceRange: 'moderate',
      foodCategories: ['vegetables', 'meat', 'fish', 'dairy', 'grains'],
      priorityOrder: [
        { category: 'vegetables', priority: 1 },
        { category: 'grains', priority: 2 },
        { category: 'dairy', priority: 3 },
        { category: 'fish', priority: 4 },
        { category: 'meat', priority: 5 },
      ],
      costOptimization: 'standard',
      timelineWeeks: 4,
      appliedDate: '2024-01-31T23:59:59Z',
      dataIntegrityWarning: true,
    });

    expect(result.policyType).toBe('default');
    expect(result.nutritionBalanceFocus).toBe('balanced');
    expect(result.priceRange).toBe('moderate');
    expect(result.costOptimization).toBe('standard');
    expect(result.dataIntegrityWarning).toBe(true);
    expect(result.foodCategories).toHaveLength(5);
    expect(result.priorityOrder).toHaveLength(5);

    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings.some((w) => w.includes('栄養摂取データ'))).toBe(true);
    expect(warnings.some((w) => w.includes('食費実績データ'))).toBe(true);
  });
});