import { detectOutliersAndValidateQuality } from '../../src/logic/it-3';

describe('食事評価データを献立生成ロジックに反映させる機能', () => {
  test('SCEN-706: 外れ値検出・品質検証機能 - 行動指標データから外れ値が自動検出され除外される', () => {
    // 正常な行動指標データ
    const normalIndicatorA = {
      userId: 'user-a',
      cookingTimeMinutes: 30,
      nutritionScorePoints: 85,
      satisfactionScore: 4,
      completionRate: 0.95,
      timestamp: '2024-01-15T18:30:00Z',
    };

    const normalIndicatorB = {
      userId: 'user-a',
      cookingTimeMinutes: 45,
      nutritionScorePoints: 78,
      satisfactionScore: 4,
      completionRate: 0.90,
      timestamp: '2024-01-16T19:00:00Z',
    };

    const normalIndicatorC = {
      userId: 'user-b',
      cookingTimeMinutes: 35,
      nutritionScorePoints: 82,
      satisfactionScore: 5,
      completionRate: 1.0,
      timestamp: '2024-01-17T18:45:00Z',
    };

    // 外れ値データ（明らかに異常）
    const outlierIndicatorD = {
      userId: 'user-b',
      cookingTimeMinutes: 300, // 異常に高い調理時間
      nutritionScorePoints: 82,
      satisfactionScore: 3,
      completionRate: 0.50,
      timestamp: '2024-01-18T20:00:00Z',
    };

    const outlierIndicatorE = {
      userId: 'user-c',
      cookingTimeMinutes: 50,
      nutritionScorePoints: -50, // 負の値は許容範囲外
      satisfactionScore: 1,
      completionRate: 0.30,
      timestamp: '2024-01-19T18:30:00Z',
    };

    const outlierIndicatorF = {
      userId: 'user-c',
      cookingTimeMinutes: 20,
      nutritionScorePoints: 999, // 許容範囲外の極端な値
      satisfactionScore: 5,
      completionRate: 0.80,
      timestamp: '2024-01-20T19:15:00Z',
    };

    // テストデータセット
    const indicatorDataset = [
      normalIndicatorA,
      normalIndicatorB,
      normalIndicatorC,
      outlierIndicatorD,
      outlierIndicatorE,
      outlierIndicatorF,
    ];

    // 品質検証機能を実行
    const validationResult = detectOutliersAndValidateQuality(indicatorDataset);

    // 期待結果：外れ値検出
    expect(validationResult.isValid).toBe(false);
    expect(validationResult.detectedOutliers.length).toBe(3);

    // 外れ値判定の詳細検証
    const outlierIndices = validationResult.detectedOutliers.map(
      (outlier: any) => outlier.index
    );
    expect(outlierIndices).toEqual([3, 4, 5]);

    // 外れ値の理由を確認
    const outlierD = validationResult.detectedOutliers.find(
      (outlier: any) => outlier.index === 3
    );
    expect(outlierD.reasons).toContain('cookingTimeMinutes_exceeds_threshold');

    const outlierE = validationResult.detectedOutliers.find(
      (outlier: any) => outlier.index === 4
    );
    expect(outlierE.reasons).toContain('nutritionScorePoints_negative_value');

    const outlierF = validationResult.detectedOutliers.find(
      (outlier: any) => outlier.index === 5
    );
    expect(outlierF.reasons).toContain('nutritionScorePoints_exceeds_maximum');

    // 保持されるべきデータ（正常範囲）の確認
    const retainedData = validationResult.retainedIndicators;
    expect(retainedData.length).toBe(3);
    expect(retainedData[0].userId).toBe('user-a');
    expect(retainedData[0].cookingTimeMinutes).toBe(30);
    expect(retainedData[0].nutritionScorePoints).toBe(85);

    expect(retainedData[1].userId).toBe('user-a');
    expect(retainedData[1].cookingTimeMinutes).toBe(45);
    expect(retainedData[1].nutritionScorePoints).toBe(78);

    expect(retainedData[2].userId).toBe('user-b');
    expect(retainedData[2].cookingTimeMinutes).toBe(35);
    expect(retainedData[2].nutritionScorePoints).toBe(82);

    // 除外されたデータの確認
    const excludedData = validationResult.excludedIndicators;
    expect(excludedData.length).toBe(3);
    expect(excludedData[0].cookingTimeMinutes).toBe(300);
    expect(excludedData[1].nutritionScorePoints).toBe(-50);
    expect(excludedData[2].nutritionScorePoints).toBe(999);

    // 品質スコア検証
    expect(validationResult.qualityScore).toBe(50); // 3/6 = 50%

    // 献立生成ロジックの入力データセット検証
    const inputDataForMenuGeneration = validationResult.retainedIndicators;
    expect(inputDataForMenuGeneration.every((indicator: any) => {
      return (
        indicator.cookingTimeMinutes >= 15 &&
        indicator.cookingTimeMinutes <= 120 &&
        indicator.nutritionScorePoints >= 0 &&
        indicator.nutritionScorePoints <= 100 &&
        indicator.satisfactionScore >= 1 &&
        indicator.satisfactionScore <= 5 &&
        indicator.completionRate >= 0 &&
        indicator.completionRate <= 1
      );
    })).toBe(true);

    // レポート生成の確認
    expect(validationResult.report).toBeDefined();
    expect(validationResult.report.totalRecords).toBe(6);
    expect(validationResult.report.validRecords).toBe(3);
    expect(validationResult.report.outlierRecords).toBe(3);
    expect(validationResult.report.generatedAt).toBeDefined();
  });
});