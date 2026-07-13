import { validatePredictionAccuracyAndDetermineFocus } from '../../src/logic/it-1-br-2-1-1-1';

describe('ユーザー食事記録と栄養摂取量の推移分析・栄養基準ロジック検証', () => {
  // SCEN-555
  test('需要予測精度改善判定機能 - 乖離率が閾値を超えたとき改善実施判定と改善対象機能が返される', () => {
    // 初期化: 予測データと実績データを準備
    const predictionData = {
      predictedDemand: 100,
      predictedNutrients: {
        calories: 2000,
        protein: 50,
        carbohydrates: 250,
        fat: 65,
      },
    };

    const actualData = {
      actualDemand: 145,
      actualNutrients: {
        calories: 2300,
        protein: 55,
        carbohydrates: 290,
        fat: 75,
      },
    };

    // 乖離率の閾値を設定（15%）
    const divergenceThreshold = 0.15;

    // 乖離率を計算: (|実績 - 予測| / 予測) × 100
    // 需要乖離率: (|145 - 100| / 100) = 0.45 = 45% > 15% 閾値超過
    // カロリー乖離率: (|2300 - 2000| / 2000) = 0.15 = 15% = 15% 閾値到達
    // たんぱく質乖離率: (|55 - 50| / 50) = 0.1 = 10% < 15% 基準内
    // 炭水化物乖離率: (|290 - 250| / 250) = 0.16 = 16% > 15% 閾値超過
    // 脂質乖離率: (|75 - 65| / 65) = 0.1538... = 15.38% > 15% 閾値超過

    const focusAreas = [
      {
        area: 'demand_forecast_model',
        divergenceRate: 0.45,
        priority: 'high',
      },
      {
        area: 'carbohydrate_nutrient_calibration',
        divergenceRate: 0.16,
        priority: 'medium',
      },
      {
        area: 'fat_nutrient_calibration',
        divergenceRate: 0.1538,
        priority: 'medium',
      },
      {
        area: 'calorie_nutrient_calibration',
        divergenceRate: 0.15,
        priority: 'low',
      },
    ];

    // 改善判定機能を実行
    const result = validatePredictionAccuracyAndDetermineFocus({
      predictionData,
      actualData,
      divergenceThreshold,
    });

    // 改善実施判定フラグがtrueで返されることを確認
    expect(result.shouldImplementImprovement).toBe(true);

    // 改善対象機能の配列が返されることを確認
    expect(Array.isArray(result.improvementFocusAreas)).toBe(true);
    expect(result.improvementFocusAreas.length).toBeGreaterThan(0);

    // 最高優先度（high）の改善対象が含まれていることを確認
    expect(result.improvementFocusAreas).toContainEqual(
      expect.objectContaining({
        area: expect.stringContaining('demand_forecast_model'),
        priority: 'high',
      })
    );

    // 需要予測モデルが最も高い乖離率を持つことを確認
    const demandItem = result.improvementFocusAreas.find(
      (item) => item.area === 'demand_forecast_model'
    );
    expect(demandItem).toBeDefined();
    expect(demandItem?.divergenceRate).toBe(0.45);

    // 改善対象機能が乖離率でソートされていることを確認
    for (let i = 0; i < result.improvementFocusAreas.length - 1; i++) {
      expect(result.improvementFocusAreas[i].divergenceRate).toBeGreaterThanOrEqual(
        result.improvementFocusAreas[i + 1].divergenceRate
      );
    }

    // 全体的なレスポンス構造の確認
    expect(result).toEqual(
      expect.objectContaining({
        shouldImplementImprovement: true,
        improvementFocusAreas: expect.any(Array),
        analysisTimestamp: expect.any(String),
        totalDivergenceSeverityScore: expect.any(Number),
      })
    );

    // 総合乖離度スコアが閾値超過を反映していることを確認
    // (45% + 16% + 15.38% + 15%) / 4 = 22.845% の平均乖離度
    expect(result.totalDivergenceSeverityScore).toBeGreaterThan(0.15);
  });
});