import { calculateNutrientAchievementRate } from '../../src/logic/it-2';

describe('栄養分析ダッシュボード表示機能', () => {
  test('SCEN-365: 実績値がゼロの場合、達成度は0%と表示される', () => {
    // Setup: テストデータとして、すべての栄養素の実績値を0に設定
    const nutrientData = [
      {
        nutrientId: 'protein',
        nutrientName: 'タンパク質',
        targetValue: 60,
        targetUnit: 'g',
        actualValue: 0,
        actualUnit: 'g',
      },
      {
        nutrientId: 'carbs',
        nutrientName: '炭水化物',
        targetValue: 300,
        targetUnit: 'g',
        actualValue: 0,
        actualUnit: 'g',
      },
      {
        nutrientId: 'fat',
        nutrientName: '脂質',
        targetValue: 65,
        targetUnit: 'g',
        actualValue: 0,
        actualUnit: 'g',
      },
      {
        nutrientId: 'calcium',
        nutrientName: 'カルシウム',
        targetValue: 800,
        targetUnit: 'mg',
        actualValue: 0,
        actualUnit: 'mg',
      },
      {
        nutrientId: 'iron',
        nutrientName: '鉄',
        targetValue: 8,
        targetUnit: 'mg',
        actualValue: 0,
        actualUnit: 'mg',
      },
    ];

    // Execute: ダッシュボード達成度計算を実行
    const achievementRates = nutrientData.map((nutrient) =>
      calculateNutrientAchievementRate({
        targetValue: nutrient.targetValue,
        actualValue: nutrient.actualValue,
      })
    );

    // Verify: すべての栄養素について達成度が0%であることを確認
    expect(achievementRates).toEqual([0, 0, 0, 0, 0]);

    // Verify: 各栄養素の詳細表示内容を確認
    const dashboardDisplay = nutrientData.map((nutrient, index) => ({
      nutrientName: nutrient.nutrientName,
      achievementPercentage: achievementRates[index],
      targetValue: nutrient.targetValue,
      actualValue: nutrient.actualValue,
      progressBarFillPercentage: achievementRates[index],
    }));

    // Verify: ダッシュボード表示データが正しい構造を持つことを確認
    dashboardDisplay.forEach((display) => {
      expect(display.achievementPercentage).toBe(0);
      expect(display.progressBarFillPercentage).toBe(0);
      expect(display.actualValue).toBe(0);
      expect(typeof display.nutrientName).toBe('string');
      expect(typeof display.targetValue).toBe('number');
    });

    // Verify: グラフレンダリング用データが0%で正しく生成されることを確認
    const chartData = {
      labels: nutrientData.map((n) => n.nutrientName),
      datasets: [
        {
          label: '達成度',
          data: achievementRates,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    };

    expect(chartData.datasets[0].data).toEqual([0, 0, 0, 0, 0]);
    expect(chartData.labels.length).toBe(5);
  });
});