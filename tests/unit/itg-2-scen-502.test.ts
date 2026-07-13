import { generateNutritionVerificationReport } from '../../src/logic/it-1-br-2-1-2-1';

describe('栄養基準ロジック改善提案の優先度付けと開発チーム提出 - 検証結果レポート生成', () => {
  test('SCEN-502: 改善実装前後の栄養データから削減率を正確に計算してレポートに表示する', () => {
    // 改善実装前の基準データ
    const preImplementationData = {
      calories: 2500,
      protein: 75,
      carbohydrates: 325,
      fat: 83,
      fiber: 25,
      sodium: 2300,
    };

    // 改善実装後の測定データ
    const postImplementationData = {
      calories: 2200,
      protein: 82,
      carbohydrates: 280,
      fat: 73,
      fiber: 28,
      sodium: 2100,
    };

    // レポート生成入力
    const reportInput = {
      preImplementationData,
      postImplementationData,
      enableReductionRateCalculation: true,
      reportGenerationTimestamp: new Date('2024-01-15T14:30:00Z'),
    };

    // 関数実行
    const generatedReport = generateNutritionVerificationReport(reportInput);

    // 期待値を計算式に基づいて計算
    // 削減率 = (改善前 - 改善後) / 改善前 × 100
    const expectedCaloriesReductionRate = Math.round(
      ((preImplementationData.calories - postImplementationData.calories) /
        preImplementationData.calories) *
        100 *
        100
    ) / 100; // 小数点以下2桁で丸め: 12%

    const expectedProteinReductionRate = Math.round(
      ((postImplementationData.protein - preImplementationData.protein) /
        preImplementationData.protein) *
        100 *
        100
    ) / 100; // 小数点以下2桁で丸め: -9.33%

    const expectedCarbohydratesReductionRate = Math.round(
      ((preImplementationData.carbohydrates -
        postImplementationData.carbohydrates) /
        preImplementationData.carbohydrates) *
        100 *
        100
    ) / 100; // 小数点以下2桁で丸め: 13.85%

    const expectedFatReductionRate = Math.round(
      ((preImplementationData.fat - postImplementationData.fat) /
        preImplementationData.fat) *
        100 *
        100
    ) / 100; // 小数点以下2桁で丸め: 12.05%

    const expectedFiberReductionRate = Math.round(
      ((postImplementationData.fiber - preImplementationData.fiber) /
        preImplementationData.fiber) *
        100 *
        100
    ) / 100; // 小数点以下2桁で丸め: -12%

    const expectedSodiumReductionRate = Math.round(
      ((preImplementationData.sodium - postImplementationData.sodium) /
        preImplementationData.sodium) *
        100 *
        100
    ) / 100; // 小数点以下2桁で丸め: 8.7%

    // レポートが存在すること
    expect(generatedReport).toBeDefined();

    // レポートが削減率計算結果を含むこと
    expect(generatedReport.reductionRates).toBeDefined();

    // カロリー削減率が正確に計算されていること（12%）
    expect(generatedReport.reductionRates.calories).toBe(12);

    // タンパク質削減率が正確に計算されていること（-9.33%、増加）
    expect(generatedReport.reductionRates.protein).toBe(-9.33);

    // 炭水化物削減率が正確に計算されていること（13.85%）
    expect(generatedReport.reductionRates.carbohydrates).toBe(13.85);

    // 脂質削減率が正確に計算されていること（12.05%）
    expect(generatedReport.reductionRates.fat).toBe(12.05);

    // 食物繊維削減率が正確に計算されていること（-12%、増加）
    expect(generatedReport.reductionRates.fiber).toBe(-12);

    // ナトリウム削減率が正確に計算されていること（8.7%）
    expect(generatedReport.reductionRates.sodium).toBe(8.7);

    // 複数の栄養指標が個別に計算されていること
    expect(Object.keys(generatedReport.reductionRates).length).toBe(6);

    // 改善実装前後のデータがレポートに保持されていること
    expect(generatedReport.preImplementationData).toEqual(preImplementationData);
    expect(generatedReport.postImplementationData).toEqual(postImplementationData);

    // レポートが削減率計算が有効であることを示すフラグを保持していること
    expect(generatedReport.reductionRateCalculationEnabled).toBe(true);

    // レポート生成タイムスタンプが正確に記録されていること
    expect(generatedReport.generatedAt).toEqual(
      new Date('2024-01-15T14:30:00Z')
    );

    // すべての削減率が百分率形式で表示されていること（0-100の数値、または負の数）
    Object.values(generatedReport.reductionRates).forEach((rate) => {
      expect(typeof rate).toBe('number');
      expect(rate).toBeGreaterThanOrEqual(-100);
      expect(rate).toBeLessThanOrEqual(200);
    });

    // 小数点以下の桁数が適切に制限されていること（最大2桁）
    Object.values(generatedReport.reductionRates).forEach((rate) => {
      const decimalPlaces = (rate.toString().split('.')[1] || '').length;
      expect(decimalPlaces).toBeLessThanOrEqual(2);
    });

    // データ整合性: 改善前後のデータキーが一致していること
    expect(Object.keys(generatedReport.preImplementationData).sort()).toEqual(
      Object.keys(generatedReport.postImplementationData).sort()
    );

    // データ整合性: 削減率計算対象の栄養指標がすべてレポートに含まれていること
    const nutritionMetrics = Object.keys(preImplementationData);
    nutritionMetrics.forEach((metric) => {
      expect(generatedReport.reductionRates).toHaveProperty(metric);
    });
  });
});