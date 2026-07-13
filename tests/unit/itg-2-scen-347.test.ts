import { calculateNutritionAchievementDegree } from '../../src/logic/it-1-br-2-1-1-1';

describe('栄養項目別達成度計算と改善ギャップの優先度付け可視化', () => {
  // SCEN-347
  test('達成度が100%を超える栄養項目について、超過分が正確に計算され表示される', () => {
    // テストデータ: 複数の栄養項目で推奨値と実績値を定義
    const nutritionItemsProtein = {
      itemName: 'タンパク質',
      recommendedValue: 100,
      actualValue: 150,
      unit: 'g'
    };

    const nutritionItemsCalcium = {
      itemName: 'カルシウム',
      recommendedValue: 800,
      actualValue: 1200,
      unit: 'mg'
    };

    const nutritionItemsVitaminC = {
      itemName: 'ビタミンC',
      recommendedValue: 100,
      actualValue: 250,
      unit: 'mg'
    };

    // タンパク質の達成度計算
    const resultProtein = calculateNutritionAchievementDegree(
      nutritionItemsProtein.recommendedValue,
      nutritionItemsProtein.actualValue
    );

    // 期待値: 150g / 100g × 100 = 150%
    expect(resultProtein.achievementDegreePercentage).toBe(150);
    // 超過分: 150g - 100g = 50g
    expect(resultProtein.excessAmount).toBe(50);
    expect(resultProtein.itemName).toBe('タンパク質');

    // カルシウムの達成度計算
    const resultCalcium = calculateNutritionAchievementDegree(
      nutritionItemsCalcium.recommendedValue,
      nutritionItemsCalcium.actualValue
    );

    // 期待値: 1200mg / 800mg × 100 = 150%
    expect(resultCalcium.achievementDegreePercentage).toBe(150);
    // 超過分: 1200mg - 800mg = 400mg
    expect(resultCalcium.excessAmount).toBe(400);
    expect(resultCalcium.itemName).toBe('カルシウム');

    // ビタミンCの達成度計算
    const resultVitaminC = calculateNutritionAchievementDegree(
      nutritionItemsVitaminC.recommendedValue,
      nutritionItemsVitaminC.actualValue
    );

    // 期待値: 250mg / 100mg × 100 = 250%
    expect(resultVitaminC.achievementDegreePercentage).toBe(250);
    // 超過分: 250mg - 100mg = 150mg
    expect(resultVitaminC.excessAmount).toBe(150);
    expect(resultVitaminC.itemName).toBe('ビタミンC');

    // 改善ギャップの優先度付けテスト
    const allResults = [resultProtein, resultCalcium, resultVitaminC];
    const prioritizedResults = allResults.sort(
      (a, b) => b.achievementDegreePercentage - a.achievementDegreePercentage
    );

    // ビタミンC（250%）が最優先
    expect(prioritizedResults[0].itemName).toBe('ビタミンC');
    expect(prioritizedResults[0].achievementDegreePercentage).toBe(250);

    // タンパク質とカルシウムが同じ150%で並ぶ
    expect(prioritizedResults[1].achievementDegreePercentage).toBe(150);
    expect(prioritizedResults[2].achievementDegreePercentage).toBe(150);

    // 100%を超えている項目が正しく分類される
    const excessiveItems = allResults.filter(
      (item) => item.achievementDegreePercentage > 100
    );
    expect(excessiveItems.length).toBe(3);

    // 各項目が改善ギャップの視覚的分類の「超過」カテゴリに正しく配置されることを確認
    excessiveItems.forEach((item) => {
      expect(item.status).toBe('超過');
      expect(item.visualIndicator).toBe('over');
    });

    // 推奨値を基準とした達成度が100を超える場合、ダッシュボード上で超過を示す色分けが適用される
    const dashboardItem = {
      itemName: resultVitaminC.itemName,
      achievementDegree: resultVitaminC.achievementDegreePercentage,
      excessAmount: resultVitaminC.excessAmount,
      displayColor: resultVitaminC.achievementDegreePercentage > 100 ? 'red' : 'green'
    };

    expect(dashboardItem.displayColor).toBe('red');
    expect(dashboardItem.achievementDegree).toBe(250);
    expect(dashboardItem.excessAmount).toBe(150);
  });
});