import { validateSeasonalRuleSpecification } from '../../src/logic/it-7-2-1';

describe('献立生成アルゴリズムの季節ルール実装機能 - ルール矛盾検出エラーハンドリング', () => {
  // SCEN-826: [error] 献立生成アルゴリズム季節ルール実装機能 - ルール仕様書に矛盾する季節パターンが含まれている場合、実装時にコンフリクトが検出されエラーが返却される
  test('矛盾する季節パターン（同一食材の異なる栄養価設定・重複期間）が検出され、具体的なコンフリクト詳細を含むエラーメッセージが返却される', () => {
    const conflictingRuleSpec = {
      ruleName: '2024年Q2季節ルール仕様書',
      version: '1.2.3',
      seasonalPatterns: [
        {
          patternId: 'SP-001',
          foodName: 'トマト',
          season: 'spring',
          seasonStartDate: '2024-03-21',
          seasonEndDate: '2024-06-20',
          nutritionValues: {
            caloriesPer100g: 18,
            proteinPercentage: 8.5,
            fiberPercentage: 12.0,
          },
          priority: 85,
        },
        {
          patternId: 'SP-002',
          foodName: 'トマト',
          season: 'autumn',
          seasonStartDate: '2024-09-23',
          seasonEndDate: '2024-12-21',
          nutritionValues: {
            caloriesPer100g: 22,
            proteinPercentage: 7.2,
            fiberPercentage: 10.5,
          },
          priority: 78,
        },
        {
          patternId: 'SP-003',
          foodName: 'トマト',
          season: 'summer',
          seasonStartDate: '2024-06-01',
          seasonEndDate: '2024-09-30',
          nutritionValues: {
            caloriesPer100g: 18,
            proteinPercentage: 8.5,
            fiberPercentage: 12.0,
          },
          priority: 92,
        },
        {
          patternId: 'SP-004',
          foodName: 'キュウリ',
          season: 'spring',
          seasonStartDate: '2024-03-01',
          seasonEndDate: '2024-05-31',
          nutritionValues: {
            caloriesPer100g: 16,
            proteinPercentage: 6.0,
            fiberPercentage: 2.2,
          },
          priority: 72,
        },
        {
          patternId: 'SP-005',
          foodName: 'キュウリ',
          season: 'spring-summer-overlap',
          seasonStartDate: '2024-05-15',
          seasonEndDate: '2024-07-15',
          nutritionValues: {
            caloriesPer100g: 16,
            proteinPercentage: 6.0,
            fiberPercentage: 2.2,
          },
          priority: 68,
        },
      ],
      discountThresholds: {
        normalDiscount: 10,
        seasonalDiscount: 25,
        bulkDiscount: 15,
      },
      createdAt: '2024-03-01T08:00:00Z',
      updatedAt: '2024-03-15T14:30:00Z',
    };

    expect(() => validateSeasonalRuleSpecification(conflictingRuleSpec)).toThrow(
      /矛盾検出/
    );

    let errorThrown: Error | null = null;
    try {
      validateSeasonalRuleSpecification(conflictingRuleSpec);
    } catch (error) {
      errorThrown = error as Error;
    }

    expect(errorThrown).not.toBeNull();
    expect(errorThrown?.message).toMatch(/コンフリクト/);
    expect(errorThrown?.message).toMatch(/SP-/);
    expect((errorThrown as any).errorCode).toBe('SEASONAL_RULE_CONFLICT');
    expect((errorThrown as any).conflictDetails).toHaveLength(2);
    expect((errorThrown as any).conflictDetails[0]).toEqual(
      expect.objectContaining({
        conflictType: 'nutrition_mismatch',
        foodName: 'トマト',
        affectedPatternIds: ['SP-001', 'SP-002', 'SP-003'],
        description: expect.stringMatching(/同一食材.*栄養価設定.*矛盾/),
      })
    );
    expect((errorThrown as any).conflictDetails[1]).toEqual(
      expect.objectContaining({
        conflictType: 'overlapping_season_period',
        foodName: 'キュウリ',
        affectedPatternIds: ['SP-004', 'SP-005'],
        description: expect.stringMatching(/重複する季節期間/),
      })
    );
    expect((errorThrown as any).severity).toBe('critical');
    expect((errorThrown as any).timestamp).toBeDefined();
    expect((errorThrown as any).ruleVersion).toBe('1.2.3');
  });
});