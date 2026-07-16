import { analyzeExcessCost } from '../../src/logic/common';

describe('共通', () => {
  // SCEN-368
  test('月次食費超過分析機能 - 月末の食費実績が予算上限を超過した場合、超過要因が食材構成と購入単価に分解される', () => {
    const budgetLimit = 50000;
    const actualExpense = 55000;
    const excessAmount = 5000;

    const purchaseRecords = [
      {
        ingredientId: 'ing_001',
        ingredientName: '鶏肉',
        quantityPlanned: 2000,
        quantityActual: 2400,
        unitPricePlanned: 10,
        unitPriceActual: 11,
      },
      {
        ingredientId: 'ing_002',
        ingredientName: '野菜',
        quantityPlanned: 3000,
        quantityActual: 3300,
        unitPricePlanned: 5,
        unitPriceActual: 5.5,
      },
      {
        ingredientId: 'ing_003',
        ingredientName: '調味料',
        quantityPlanned: 1000,
        quantityActual: 1000,
        unitPricePlanned: 8,
        unitPriceActual: 8,
      },
    ];

    const result = analyzeExcessCost({
      budgetLimit,
      actualExpense,
      purchaseRecords,
    });

    expect(result.totalExcess).toBe(5000);
    expect(result.excessByComposition).toBe(3300);
    expect(result.excessByUnitPrice).toBe(1700);
    expect(
      result.excessByComposition + result.excessByUnitPrice
    ).toBe(5000);
    expect(result.excessByComposition + result.excessByUnitPrice).toBe(
      result.totalExcess
    );

    expect(result.breakdownDetails).toEqual(
      expect.objectContaining({
        composition: expect.objectContaining({
          amount: 3300,
          percentage: 66,
        }),
        unitPrice: expect.objectContaining({
          amount: 1700,
          percentage: 34,
        }),
      })
    );

    expect(result.breakdownDetails.ingredients).toHaveLength(3);

    const chickenDetail = result.breakdownDetails.ingredients.find(
      (ing) => ing.ingredientId === 'ing_001'
    );
    expect(chickenDetail).toEqual(
      expect.objectContaining({
        ingredientId: 'ing_001',
        ingredientName: '鶏肉',
        excessByComposition: 400,
        excessByUnitPrice: 400,
        totalExcessForIngredient: 800,
      })
    );

    const vegetableDetail = result.breakdownDetails.ingredients.find(
      (ing) => ing.ingredientId === 'ing_002'
    );
    expect(vegetableDetail).toEqual(
      expect.objectContaining({
        ingredientId: 'ing_002',
        ingredientName: '野菜',
        excessByComposition: 1500,
        excessByUnitPrice: 1650,
        totalExcessForIngredient: 3150,
      })
    );

    const seasoningDetail = result.breakdownDetails.ingredients.find(
      (ing) => ing.ingredientId === 'ing_003'
    );
    expect(seasoningDetail).toEqual(
      expect.objectContaining({
        ingredientId: 'ing_003',
        ingredientName: '調味料',
        excessByComposition: 0,
        excessByUnitPrice: 0,
        totalExcessForIngredient: 0,
      })
    );

    const totalCompositionSum = result.breakdownDetails.ingredients.reduce(
      (sum, ing) => sum + ing.excessByComposition,
      0
    );
    const totalUnitPriceSum = result.breakdownDetails.ingredients.reduce(
      (sum, ing) => sum + ing.excessByUnitPrice,
      0
    );

    expect(totalCompositionSum).toBe(3300);
    expect(totalUnitPriceSum).toBe(1700);
  });
});