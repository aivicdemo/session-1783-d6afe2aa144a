import { analyzeMonthlyFoodExpenseExcessByNutrient } from '../../src/logic/it-1-br-2-1-1-1';

describe('食費超過要因分析機能', () => {
  // SCEN-433: [normal] 月次食費超過要因が献立の食材構成と購入単価変動に分解され、カテゴリ別に可視化される
  test('月次食費超過要因分析：献立食材構成と購入単価変動による超過要因をカテゴリ別に分解・可視化', () => {
    // 前提: 月次の献立実績データと食費実績データがシステムに蓄積されている
    const monthlyDataInput = {
      userId: 'user-001',
      targetYearMonth: '2024-01',
      budgetLimit: 50000,
      actualExpense: 56000,
      mealRecords: [
        {
          mealId: 'meal-001',
          date: '2024-01-08',
          dishName: '鶏肉のグリル',
          nutrients: {
            protein: 35,
            carbohydrate: 45,
            fat: 12,
          },
          plannedCost: 980,
          actualCost: 1200,
          ingredients: [
            { ingredientId: 'ing-001', name: '鶏胸肉', plannedPrice: 600, actualPrice: 750, unit: 'g', quantity: 200 },
            { ingredientId: 'ing-002', name: '塩', plannedPrice: 50, actualPrice: 50, unit: 'g', quantity: 5 },
            { ingredientId: 'ing-003', name: 'オリーブオイル', plannedPrice: 100, actualPrice: 150, unit: 'ml', quantity: 30 },
            { ingredientId: 'ing-004', name: 'ニンニク', plannedPrice: 50, actualPrice: 80, unit: 'g', quantity: 10 },
            { ingredientId: 'ing-005', name: '玉ねぎ', plannedPrice: 100, actualPrice: 100, unit: 'g', quantity: 150 },
          ],
        },
        {
          mealId: 'meal-002',
          date: '2024-01-15',
          dishName: '鮭のムニエル',
          nutrients: {
            protein: 28,
            carbohydrate: 38,
            fat: 18,
          },
          plannedCost: 1280,
          actualCost: 1580,
          ingredients: [
            { ingredientId: 'ing-006', name: '鮭', plannedPrice: 800, actualPrice: 1000, unit: 'g', quantity: 180 },
            { ingredientId: 'ing-007', name: '小麦粉', plannedPrice: 50, actualPrice: 50, unit: 'g', quantity: 20 },
            { ingredientId: 'ing-008', name: 'バター', plannedPrice: 150, actualPrice: 200, unit: 'g', quantity: 30 },
            { ingredientId: 'ing-009', name: 'レモン', plannedPrice: 100, actualPrice: 150, unit: '個', quantity: 1 },
            { ingredientId: 'ing-010', name: 'ブロッコリー', plannedPrice: 180, actualPrice: 180, unit: 'g', quantity: 150 },
          ],
        },
        {
          mealId: 'meal-003',
          date: '2024-01-22',
          dishName: 'カレーライス',
          nutrients: {
            protein: 18,
            carbohydrate: 72,
            fat: 15,
          },
          plannedCost: 750,
          actualCost: 980,
          ingredients: [
            { ingredientId: 'ing-011', name: '豚肉', plannedPrice: 350, actualPrice: 450, unit: 'g', quantity: 200 },
            { ingredientId: 'ing-012', name: '米', plannedPrice: 150, actualPrice: 150, unit: 'g', quantity: 300 },
            { ingredientId: 'ing-013', name: 'カレー粉', plannedPrice: 80, actualPrice: 120, unit: 'g', quantity: 15 },
            { ingredientId: 'ing-014', name: 'ニンジン', plannedPrice: 100, actualPrice: 150, unit: 'g', quantity: 100 },
            { ingredientId: 'ing-015', name: 'ジャガイモ', plannedPrice: 100, actualPrice: 100, unit: 'g', quantity: 200 },
          ],
        },
      ],
      purchaseRecords: [
        {
          purchaseId: 'pur-001',
          date: '2024-01-07',
          ingredientId: 'ing-001',
          ingredientName: '鶏胸肉',
          plannedUnitPrice: 3.0,
          actualUnitPrice: 3.75,
          quantity: 200,
          category: 'protein',
        },
        {
          purchaseId: 'pur-002',
          date: '2024-01-14',
          ingredientId: 'ing-006',
          ingredientName: '鮭',
          plannedUnitPrice: 4.44,
          actualUnitPrice: 5.56,
          quantity: 180,
          category: 'protein',
        },
        {
          purchaseId: 'pur-003',
          date: '2024-01-21',
          ingredientId: 'ing-011',
          ingredientName: '豚肉',
          plannedUnitPrice: 1.75,
          actualUnitPrice: 2.25,
          quantity: 200,
          category: 'protein',
        },
        {
          purchaseId: 'pur-004',
          date: '2024-01-12',
          ingredientId: 'ing-008',
          ingredientName: 'バター',
          plannedUnitPrice: 5.0,
          actualUnitPrice: 6.67,
          quantity: 30,
          category: 'fat',
        },
        {
          purchaseId: 'pur-005',
          date: '2024-01-20',
          ingredientId: 'ing-012',
          ingredientName: '米',
          plannedUnitPrice: 0.5,
          actualUnitPrice: 0.5,
          quantity: 300,
          category: 'carbohydrate',
        },
      ],
    };

    // 実行: 月次食費超過要因分析機能を呼び出す
    const analysisResult = analyzeMonthlyFoodExpenseExcessByNutrient(monthlyDataInput);

    // 期待値計算:
    // 総超過額 = 56000 - 50000 = 6000 円
    // 献立食材構成による超過（各食の計画価格と実際価格の差）:
    // meal-001: 1200 - 980 = 220
    // meal-002: 1580 - 1280 = 300
    // meal-003: 980 - 750 = 230
    // 小計: 220 + 300 + 230 = 750 円
    //
    // 購入単価変動による超過（単価変動 × 購入量）:
    // protein 超過: (3.75-3.0)×200 + (5.56-4.44)×180 + (2.25-1.75)×200 = 150 + 201.6 + 100 = 451.6 ≈ 452 円
    // fat 超過: (6.67-5.0)×30 = 50.1 ≈ 50 円
    // carbohydrate 超過: (0.5-0.5)×300 = 0 円
    // 小計: 452 + 50 + 0 = 502 円
    //
    // 誤差調整: 6000 - 750 - 502 = 4748 円（分類不可な変動・複合要因など）
    //
    // カテゴリ別分解:
    // protein: 超過額 = 452 + (35+28+18)×10 = 452 + 810 = 1262 円（栄養値ベース推定）
    // carbohydrate: 超過額 = 0 + (45+38+72)×5 = 0 + 775 = 775 円
    // fat: 超過額 = 50 + (12+18+15)×8 = 50 + 360 = 410 円
    // その他: 残余 = 6000 - 1262 - 775 - 410 = 3553 円

    // 検証 1: 総超過額の確認
    expect(analysisResult.totalExcessAmount).toBe(6000);

    // 検証 2: 献立食材構成による超過要因の分解確認
    expect(analysisResult.excessByMealComposition).toBeDefined();
    expect(analysisResult.excessByMealComposition.totalCompositionExcess).toBeCloseTo(750, 0);
    expect(analysisResult.excessByMealComposition.breakdownByMeal).toHaveLength(3);
    expect(analysisResult.excessByMealComposition.breakdownByMeal[0]).toEqual({
      mealId: 'meal-001',
      mealName: '鶏肉のグリル',
      excessAmount: 220,
      date: '2024-01-08',
    });
    expect(analysisResult.excessByMealComposition.breakdownByMeal[1]).toEqual({
      mealId: 'meal-002',
      mealName: '鮭のムニエル',
      excessAmount: 300,
      date: '2024-01-15',
    });
    expect(analysisResult.excessByMealComposition.breakdownByMeal[2]).toEqual({
      mealId: 'meal-003',
      mealName: 'カレーライス',
      excessAmount: 230,
      date: '2024-01-22',
    });

    // 検証 3: 購入単価変動による超過要因の分解確認
    expect(analysisResult.excessByPriceVariation).toBeDefined();
    expect(analysisResult.excessByPriceVariation.totalPriceVariationExcess).toBeCloseTo(502, 0);
    expect(analysisResult.excessByPriceVariation.byNutrientCategory).toBeDefined();
    expect(analysisResult.excessByPriceVariation.byNutrientCategory.protein).toBeCloseTo(452, 0);
    expect(analysisResult.excessByPriceVariation.byNutrientCategory.fat).toBeCloseTo(50, 0);
    expect(analysisResult.excessByPriceVariation.byNutrientCategory.carbohydrate).toBeCloseTo(0, 0);

    // 検証 4: カテゴリ別超過要因の分類確認
    expect(analysisResult.excessByNutrientCategory).toBeDefined();
    expect(analysisResult.excessByNutrientCategory.protein).toEqual({
      category: 'protein',
      categoryName: 'タンパク質',
      totalExcessAmount: 1262,
      percentage: 21.03,
      composition: 810,
      priceVariation: 452,
    });
    expect(analysisResult.excessByNutrientCategory.carbohydrate).toEqual({
      category: 'carbohydrate',
      categoryName: '炭水化物',
      totalExcessAmount: 775,
      percentage: 12.92,
      composition: 775,
      priceVariation: 0,
    });
    expect(analysisResult.excessByNutrientCategory.fat).toEqual({
      category: 'fat',
      categoryName: '脂質',
      totalExcessAmount: 410,
      percentage: 6.83,
      composition: 360,
      priceVariation: 50,
    });
    expect(analysisResult.excessByNutrientCategory.other).toEqual({
      category: 'other',
      categoryName: 'その他要因',
      totalExcessAmount: 3553,
      percentage: 59.22,
      composition: 0,
      priceVariation: 0,
    });

    // 検証 5: グラフ・チャート化データの確認
    expect(analysisResult.visualization).toBeDefined();
    expect(analysisResult.visualization.chartData).toBeDefined();
    expect(analysisResult.visualization.chartData).toHaveLength(4);
    expect(analysisResult.visualization.chartData[0]).toEqual({
      label: 'タンパク質',
      value: 1262,
      percentage: 21.03,
      color: '#FF6B6B',
    });
    expect(analysisResult.visualization.chartData[1]).toEqual({
      label: '炭水化物',
      value: 775,
      percentage: 12.92,
      color: '#4ECDC4',
    });
    expect(analysisResult.visualization.chartData[2]).toEqual({
      label: '脂質',
      value: 410,
      percentage: 6.83,
      color: '#FFE66D',
    });
    expect(analysisResult.visualization.chartData[3]).toEqual({
      label: 'その他要因',
      value: 3553,
      percentage: 59.22,
      color: '#95A5A6',
    });

    // 検証 6: 詳細ドリルダウン用データ確認
    expect(analysisResult.detailsByCategory).toBeDefined();
    expect(analysisResult.detailsByCategory.protein).toBeDefined();
    expect(analysisResult.detailsByCategory.protein.ingredientPriceVariations).toHaveLength(3);
    expect(analysisResult.detailsByCategory.protein.ingredientPriceVariations[0]).toEqual({
      ingredientId: 'ing-001',
      ingredientName: '鶏胸肉',
      plannedUnitPrice: 3.0,
      actualUnitPrice: 3.75,
      quantity: 200,
      excessAmount: 150,
    });
    expect(analysisResult.detailsByCategory.protein.ingredientPriceVariations[1]).toEqual({
      ingredientId: 'ing-006',
      ingredientName: '鮭',
      plannedUnitPrice: 4.44,
      actualUnitPrice: 5.56,
      quantity: 180,
      excessAmount: 201.6,
    });
    expect(analysisResult.detailsByCategory.protein.ingredientPriceVariations[2]).toEqual({
      ingredientId: 'ing-011',
      ingredientName: '豚肉',
      plannedUnitPrice: 1.75,
      actualUnitPrice: 2.25,
      quantity: 200,
      excessAmount: 100,
    });

    // 検証 7: 複数月比較対応データ構造確認
    expect(analysisResult.metadata).toBeDefined();
    expect(analysisResult.metadata).toEqual({
      userId: 'user-001',
      yearMonth: '2024-01',
      budgetLimit: 50000,
      actualExpense: 56000,
      generatedAt: expect.any(String),
    });

    // 検証 8: カテゴリ別の詳細情報へのアクセス確認
    expect(analysisResult.excessByNutrientCategory.protein.category).toBe('protein');
    expect(analysisResult.excessByNutrientCategory.carbohydrate.category).toBe('carbohydrate');
    expect(analysisResult.excessByNutrientCategory.fat.category).toBe('fat');
    expect(analysisResult.detailsByCategory.protein).toBeDefined();
    expect(analysisResult.detailsByCategory.carbohydrate).toBeDefined();
    expect(analysisResult.detailsByCategory.fat).toBeDefined();

    // 検証 9: 超過要因の正確な分解確認（合計チェック）
    const sumOfCategories =
      analysisResult.excessByNutrientCategory.protein.totalExcessAmount +
      analysisResult.excessByNutrientCategory.carbohydrate.totalExcessAmount +
      analysisResult.excessByNutrientCategory.fat.totalExcessAmount +
      analysisResult.excessByNutrientCategory.other.totalExcessAmount;
    expect(sumOfCategories).toBeCloseTo(6000, 0);

    // 検証 10: パーセンテージ合計が100%であることを確認
    const sumOfPercentages =
      analysisResult.excessByNutrientCategory.protein.percentage +
      analysisResult.excessByNutrientCategory.carbohydrate.percentage +
      analysisResult.excessByNutrientCategory.fat.percentage +
      analysisResult.excessByNutrientCategory.other.percentage;
    expect(sumOfPercentages).toBeCloseTo(100, 1);
  });
});