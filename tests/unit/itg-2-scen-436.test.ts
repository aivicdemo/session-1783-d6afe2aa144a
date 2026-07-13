import { calculateNutritionAchievementAndGapAnalysis } from '../../src/logic/it-1-br-2-1-1-1';

describe('食費超過要因分析機能 - 異常値処理', () => {
  test('SCEN-436: 購入単価が0円・負の値・異常値の場合、分析結果が正確に処理される', () => {
    // Precondition: 栄養管理・分析ダッシュボードシステムにログイン済み
    // Trigger: 食費超過要因分析機能で異常な購入単価データを入力
    // Expected: 異常値を適切にフィルタリング・警告し、有効データのみで分析を継続

    // テストデータ: 異常値を含む食材購入記録
    const foodPurchaseRecords = [
      {
        foodId: 'F001',
        foodName: '鶏肉（通常）',
        unitPrice: 200, // 正常値
        quantity: 5,
        totalCost: 1000,
        purchaseDate: '2024-01-15',
      },
      {
        foodId: 'F002',
        foodName: '豚肉（0円異常値）',
        unitPrice: 0, // 0円異常値
        quantity: 3,
        totalCost: 0,
        purchaseDate: '2024-01-15',
      },
      {
        foodId: 'F003',
        foodName: '牛肉（正常値）',
        unitPrice: 300,
        quantity: 2,
        totalCost: 600,
        purchaseDate: '2024-01-15',
      },
      {
        foodId: 'F004',
        foodName: '魚（負の値異常値）',
        unitPrice: -100, // 負の値異常値
        quantity: 4,
        totalCost: -400,
        purchaseDate: '2024-01-15',
      },
      {
        foodId: 'F005',
        foodName: '野菜（極端に大きい異常値）',
        unitPrice: 999999999, // 異常に大きい値
        quantity: 1,
        totalCost: 999999999,
        purchaseDate: '2024-01-15',
      },
    ];

    // テストデータ: 月次予算と栄養目標
    const monthlyBudget = 5000;
    const nutritionTargets = {
      protein: 150,
      carbohydrate: 300,
      fat: 70,
      calcium: 1000,
      iron: 15,
    };

    // テストデータ: 実績栄養摂取量（有効食材のみで構成）
    const actualNutritionIntake = {
      protein: 140,
      carbohydrate: 280,
      fat: 65,
      calcium: 900,
      iron: 12,
    };

    // 関数実行
    const analysisResult = calculateNutritionAchievementAndGapAnalysis({
      foodPurchaseRecords,
      monthlyBudget,
      nutritionTargets,
      actualNutritionIntake,
    });

    // Assertion 1: 返却結果がオブジェクト型であること
    expect(typeof analysisResult).toBe('object');
    expect(analysisResult).not.toBeNull();

    // Assertion 2: 異常値検出結果が含まれていること
    expect(analysisResult.abnormalValueDetection).toBeDefined();

    // Assertion 3: 0円の食材が警告対象として検出されていること
    const zeroUnitPriceWarnings = analysisResult.abnormalValueDetection.filter(
      (warning: any) => warning.foodId === 'F002'
    );
    expect(zeroUnitPriceWarnings.length).toBeGreaterThan(0);
    expect(zeroUnitPriceWarnings[0]).toHaveProperty('severity', 'warning');
    expect(zeroUnitPriceWarnings[0]).toHaveProperty('message');
    expect(zeroUnitPriceWarnings[0].message).toMatch(/単価/);

    // Assertion 4: 負の値の食材がエラーとして検出されていること
    const negativeUnitPriceErrors = analysisResult.abnormalValueDetection.filter(
      (error: any) => error.foodId === 'F004'
    );
    expect(negativeUnitPriceErrors.length).toBeGreaterThan(0);
    expect(negativeUnitPriceErrors[0]).toHaveProperty('severity', 'error');
    expect(negativeUnitPriceErrors[0].message).toMatch(/負数/);

    // Assertion 5: 異常に大きい値の食材がエラーとして検出されていること
    const extremeValueErrors = analysisResult.abnormalValueDetection.filter(
      (error: any) => error.foodId === 'F005'
    );
    expect(extremeValueErrors.length).toBeGreaterThan(0);
    expect(extremeValueErrors[0]).toHaveProperty('severity', 'error');
    expect(extremeValueErrors[0].message).toMatch(/異常値/);

    // Assertion 6: フィルタリング後の有効な食材のみで分析されていること
    const validFoodRecords = analysisResult.validFoodRecords;
    expect(validFoodRecords.length).toBe(2); // F001（正常）と F003（正常）のみ
    expect(validFoodRecords.every((record: any) => record.unitPrice > 0)).toBe(true);
    expect(
      validFoodRecords.every((record: any) => record.unitPrice < 10000000)
    ).toBe(true);

    // Assertion 7: 有効データのみを使用した総食費計算が正確であること
    // F001: 200 * 5 = 1000, F003: 300 * 2 = 600
    const expectedValidTotalCost = 1600;
    expect(analysisResult.validTotalCost).toBe(expectedValidTotalCost);

    // Assertion 8: 予算超過判定が正確に計算されていること（有効データのみに基づく）
    // validTotalCost: 1600, monthlyBudget: 5000
    // 超過: false, 削減余地: 3400
    expect(analysisResult.budgetOverageFlag).toBe(false);
    expect(analysisResult.budgetRemainAmount).toBe(3400);

    // Assertion 9: 栄養摂取達成度が百分率で正確に計算されていること
    const proteinAchievementRate = (140 / 150) * 100;
    const carbohydrateAchievementRate = (280 / 300) * 100;
    const fatAchievementRate = (65 / 70) * 100;
    const calciumAchievementRate = (900 / 1000) * 100;
    const ironAchievementRate = (12 / 15) * 100;

    expect(analysisResult.nutritionAchievementRates.protein).toBeCloseTo(
      proteinAchievementRate,
      2
    );
    expect(analysisResult.nutritionAchievementRates.carbohydrate).toBeCloseTo(
      carbohydrateAchievementRate,
      2
    );
    expect(analysisResult.nutritionAchievementRates.fat).toBeCloseTo(
      fatAchievementRate,
      2
    );
    expect(analysisResult.nutritionAchievementRates.calcium).toBeCloseTo(
      calciumAchievementRate,
      2
    );
    expect(analysisResult.nutritionAchievementRates.iron).toBeCloseTo(
      ironAchievementRate,
      2
    );

    // Assertion 10: 栄養ギャップ（不足量）が正確に計算されていること
    expect(analysisResult.nutritionGaps.protein).toBe(10); // 150 - 140
    expect(analysisResult.nutritionGaps.carbohydrate).toBe(20); // 300 - 280
    expect(analysisResult.nutritionGaps.fat).toBe(5); // 70 - 65
    expect(analysisResult.nutritionGaps.calcium).toBe(100); // 1000 - 900
    expect(analysisResult.nutritionGaps.iron).toBe(3); // 15 - 12

    // Assertion 11: 栄養ギャップを達成度順に優先度付けした結果が含まれていること
    expect(analysisResult.prioritizedGaps).toBeDefined();
    expect(Array.isArray(analysisResult.prioritizedGaps)).toBe(true);
    expect(analysisResult.prioritizedGaps.length).toBeGreaterThan(0);

    // Assertion 12: 優先度付けが達成度の低い順になっていること
    const achievementRates = analysisResult.prioritizedGaps.map(
      (gap: any) => gap.achievementRate
    );
    for (let i = 1; i < achievementRates.length; i++) {
      expect(achievementRates[i - 1]).toBeLessThanOrEqual(achievementRates[i]);
    }

    // Assertion 13: 異常値処理ログに詳細情報が記録されていること
    expect(analysisResult.processingLog).toBeDefined();
    expect(Array.isArray(analysisResult.processingLog)).toBe(true);
    expect(analysisResult.processingLog.length).toBeGreaterThanOrEqual(3); // 少なくとも3件の異常値

    // Assertion 14: 各ログエントリにタイムスタンプとメッセージが含まれていること
    analysisResult.processingLog.forEach((logEntry: any) => {
      expect(logEntry).toHaveProperty('timestamp');
      expect(logEntry).toHaveProperty('message');
      expect(logEntry).toHaveProperty('severity');
    });

    // Assertion 15: 信頼性スコアが計算されていること
    expect(analysisResult.trustworthyScore).toBeDefined();
    expect(typeof analysisResult.trustworthyScore).toBe('number');
    expect(analysisResult.trustworthyScore).toBeGreaterThanOrEqual(0);
    expect(analysisResult.trustworthyScore).toBeLessThanOrEqual(100);

    // Assertion 16: 異常値が多い場合、信頼性スコアが低下していること
    // 異常値が3件あるため、信頼性スコアは低めになるべき
    // 信頼性スコア = (有効食材数 / 総食材数) * 100
    const expectedTrustworthyScore = (2 / 5) * 100; // = 40
    expect(analysisResult.trustworthyScore).toBeCloseTo(expectedTrustworthyScore, 0);

    // Assertion 17: 結果が有効なデータのみで構成されていることを確認
    expect(analysisResult.analysisStatus).toBe('completed_with_warnings');

    // Assertion 18: ユーザーへの通知メッセージが生成されていること
    expect(analysisResult.userNotification).toBeDefined();
    expect(typeof analysisResult.userNotification).toBe('string');
    expect(analysisResult.userNotification.length).toBeGreaterThan(0);

    // Assertion 19: 通知メッセージに異常値の存在が明記されていること
    expect(analysisResult.userNotification).toMatch(/異常値/);

    // Assertion 20: 通知メッセージに有効データのみで分析したことが明記されていること
    expect(analysisResult.userNotification).toMatch(/有効/);
  });
});