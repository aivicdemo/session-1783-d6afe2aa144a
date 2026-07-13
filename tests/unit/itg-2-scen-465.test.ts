import { detectNutritionAnomalies } from '../../src/logic/it-1-br-2-1-1-1';

describe('ユーザーの食事記録と栄養摂取量の推移データを自動集計し、栄養項目別の達成度と改善ギャップを可視化するダッシュボード機能', () => {
  test('SCEN-465: [normal] 推移データ表示機能 - 異常値が自動検出され栄養士に通知される', () => {
    // 【precondition】
    // - 月次または四半期ごとの栄養基準ロジック検証タイミングが到来し、
    //   ユーザーの食事記録データが収集・集計されている状態
    // - 異常値検出ルール（カロリー摂取量が通常の±20%以上、
    //   タンパク質が推奨値の50%以下など）が定義されている

    // 【基準値・推奨値の定義】
    const recommendedCalories = 2000; // kcal/日
    const recommendedProtein = 50; // g/日
    const recommendedFat = 70; // g/日
    const recommendedCarbs = 225; // g/日

    // 正常範囲：推奨値の±20%
    const calorieAnomalyLowerBound = recommendedCalories * 0.8; // 1600 kcal
    const calorieAnomalyUpperBound = recommendedCalories * 1.2; // 2400 kcal

    // タンパク質異常：推奨値の50%以下
    const proteinAnomalyThreshold = recommendedProtein * 0.5; // 25 g

    // 【異常値を含むテストデータ】
    const nutritionData = [
      {
        date: '2024-01-15',
        calories: 1500, // 正常（1600～2400の範囲内）
        protein: 45, // 正常（25g以上）
        fat: 65, // 正常
        carbs: 220, // 正常
      },
      {
        date: '2024-01-16',
        calories: 2900, // 異常（2400を超過、推奨値の145%）
        protein: 20, // 異常（25g以下、推奨値の40%）
        fat: 85, // 正常
        carbs: 240, // 正常
      },
      {
        date: '2024-01-17',
        calories: 1400, // 異常（1600未満、推奨値の70%）
        protein: 48, // 正常
        fat: 72, // 正常
        carbs: 215, // 正常
      },
      {
        date: '2024-01-18',
        calories: 2050, // 正常（1600～2400の範囲内）
        protein: 52, // 正常
        fat: 69, // 正常
        carbs: 228, // 正常
      },
    ];

    // 【trigger】
    // プロダクトマネージャーが分析ダッシュボードにアクセスし、
    // 栄養摂取量の推移データを確認する操作を開始したとき

    const result = detectNutritionAnomalies({
      nutritionData,
      recommendedCalories,
      recommendedProtein,
      recommendedFat,
      recommendedCarbs,
      calorieTolerancePercent: 20,
      proteinLowerThresholdPercent: 50,
    });

    // 【outcome - assertion 1】
    // システムが異常値を正確に自動検出し、栄養士に対して通知が送信される
    // 異常値の詳細情報が含まれていること

    // 異常検出結果の検証
    expect(result.anomaliesDetected).toBe(true);
    expect(result.anomalies).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          date: '2024-01-16',
          anomalyType: 'EXCESS_CALORIES',
          detectedValue: 2900,
          recommendedValue: recommendedCalories,
          deviationPercent: 45,
        }),
        expect.objectContaining({
          date: '2024-01-16',
          anomalyType: 'LOW_PROTEIN',
          detectedValue: 20,
          recommendedValue: recommendedProtein,
          deviationPercent: -60,
        }),
        expect.objectContaining({
          date: '2024-01-17',
          anomalyType: 'LOW_CALORIES',
          detectedValue: 1400,
          recommendedValue: recommendedCalories,
          deviationPercent: -30,
        }),
      ])
    );

    // 異常値の個数が正確に3件であること
    expect(result.anomalies.length).toBe(3);

    // 【outcome - assertion 2】
    // 栄養士へ通知がトリガーされたことを確認
    expect(result.notificationTriggered).toBe(true);

    // 【outcome - assertion 3】
    // 通知に異常値の詳細情報が含まれていることを確認
    expect(result.notificationPayload).toEqual(
      expect.objectContaining({
        nutritionistId: expect.any(String),
        subject: expect.stringContaining('栄養摂取異常'),
        detectionTimestamp: expect.any(String),
        anomalySummary: expect.objectContaining({
          totalAnomalies: 3,
          criticalCount: expect.any(Number),
          warningCount: expect.any(Number),
        }),
        anomalyDetails: expect.arrayContaining([
          expect.objectContaining({
            date: expect.any(String),
            anomalyType: expect.any(String),
            detectedValue: expect.any(Number),
            recommendedValue: expect.any(Number),
            severity: expect.stringMatching(/^(CRITICAL|WARNING)$/),
          }),
        ]),
      })
    );

    // 【outcome - assertion 4】
    // 通知内容に全異常値の詳細が含まれていること
    const notificationAnomalies = result.notificationPayload.anomalyDetails;
    expect(notificationAnomalies.length).toBe(3);

    // 2024-01-16 カロリー超過
    const calorieExcess = notificationAnomalies.find(
      (a: any) =>
        a.date === '2024-01-16' && a.anomalyType === 'EXCESS_CALORIES'
    );
    expect(calorieExcess).toEqual(
      expect.objectContaining({
        detectedValue: 2900,
        recommendedValue: 2000,
        severity: 'CRITICAL',
      })
    );

    // 2024-01-16 タンパク質不足
    const proteinLow = notificationAnomalies.find(
      (a: any) =>
        a.date === '2024-01-16' && a.anomalyType === 'LOW_PROTEIN'
    );
    expect(proteinLow).toEqual(
      expect.objectContaining({
        detectedValue: 20,
        recommendedValue: 50,
        severity: 'CRITICAL',
      })
    );

    // 2024-01-17 カロリー不足
    const calorieDeficit = notificationAnomalies.find(
      (a: any) =>
        a.date === '2024-01-17' && a.anomalyType === 'LOW_CALORIES'
    );
    expect(calorieDeficit).toEqual(
      expect.objectContaining({
        detectedValue: 1400,
        recommendedValue: 2000,
        severity: 'WARNING',
      })
    );

    // 【outcome - assertion 5】
    // 正常データが異常値としてフラグされていないこと
    const normalDates = ['2024-01-15', '2024-01-18'];
    for (const normalDate of normalDates) {
      const hasAnomaly = notificationAnomalies.some(
        (a: any) => a.date === normalDate
      );
      expect(hasAnomaly).toBe(false);
    }

    // 【outcome - assertion 6】
    // 画面表示用のハイライト情報が生成されていること
    expect(result.highlightData).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          date: '2024-01-16',
          highlightLevel: 'HIGH',
          alertCount: 2,
        }),
        expect.objectContaining({
          date: '2024-01-17',
          highlightLevel: 'MEDIUM',
          alertCount: 1,
        }),
      ])
    );

    // 【outcome - assertion 7】
    // 通知の送信が記録されていること（監査ログ）
    expect(result.auditLog).toEqual(
      expect.objectContaining({
        eventType: 'ANOMALY_DETECTED_AND_NOTIFIED',
        timestamp: expect.any(String),
        detectionCount: 3,
        notificationSentTo: expect.any(String),
        status: 'SUCCESS',
      })
    );
  });
});