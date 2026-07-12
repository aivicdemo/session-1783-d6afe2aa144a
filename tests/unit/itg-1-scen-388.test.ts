import { calculateCorrelationCoefficients } from '../../src/logic/it-3';

describe('食事評価データを献立生成ロジックに反映させる機能', () => {
  // SCEN-388
  test('[normal] 需要予測精度検証機能 - 外部データ（気象・イベント・競合施策）と実績需要の相関係数が正常に計算される', () => {
    // テストデータ準備: 過去3ヶ月分（90日分）
    const weatherData = [
      { date: '2024-01-01', temperature: 5.2, precipitation: 0, humidity: 65 },
      { date: '2024-01-02', temperature: 6.1, precipitation: 2.5, humidity: 68 },
      { date: '2024-01-03', temperature: 4.8, precipitation: 0, humidity: 62 },
      { date: '2024-01-04', temperature: 7.3, precipitation: 5.0, humidity: 70 },
      { date: '2024-01-05', temperature: 8.5, precipitation: 0, humidity: 60 },
      { date: '2024-01-06', temperature: 9.2, precipitation: 1.2, humidity: 63 },
      { date: '2024-01-07', temperature: 10.1, precipitation: 0, humidity: 58 },
      { date: '2024-01-08', temperature: 11.3, precipitation: 3.0, humidity: 65 },
      { date: '2024-01-09', temperature: 12.5, precipitation: 0, humidity: 55 },
      { date: '2024-01-10', temperature: 13.7, precipitation: 0.5, humidity: 60 },
      { date: '2024-01-11', temperature: 14.2, precipitation: 0, humidity: 52 },
      { date: '2024-01-12', temperature: 15.1, precipitation: 2.0, humidity: 61 },
      { date: '2024-01-13', temperature: 14.8, precipitation: 0, humidity: 58 },
      { date: '2024-01-14', temperature: 13.5, precipitation: 1.5, humidity: 64 },
      { date: '2024-01-15', temperature: 12.9, precipitation: 0, humidity: 59 },
      { date: '2024-01-16', temperature: 11.2, precipitation: 4.0, humidity: 67 },
      { date: '2024-01-17', temperature: 10.5, precipitation: 0, humidity: 61 },
      { date: '2024-01-18', temperature: 9.8, precipitation: 0.8, humidity: 63 },
      { date: '2024-01-19', temperature: 8.1, precipitation: 0, humidity: 57 },
      { date: '2024-01-20', temperature: 7.3, precipitation: 2.3, humidity: 66 },
      { date: '2024-01-21', temperature: 6.5, precipitation: 0, humidity: 60 },
      { date: '2024-01-22', temperature: 5.8, precipitation: 1.0, humidity: 62 },
      { date: '2024-01-23', temperature: 6.2, precipitation: 0, humidity: 58 },
      { date: '2024-01-24', temperature: 7.1, precipitation: 0.5, humidity: 64 },
      { date: '2024-01-25', temperature: 8.3, precipitation: 0, humidity: 59 },
      { date: '2024-01-26', temperature: 9.5, precipitation: 3.5, humidity: 68 },
      { date: '2024-01-27', temperature: 10.2, precipitation: 0, humidity: 61 },
      { date: '2024-01-28', temperature: 11.4, precipitation: 1.2, humidity: 63 },
      { date: '2024-01-29', temperature: 12.1, precipitation: 0, humidity: 56 },
      { date: '2024-01-30', temperature: 13.3, precipitation: 0.3, humidity: 60 },
      { date: '2024-02-01', temperature: 14.5, precipitation: 0, humidity: 53 },
      { date: '2024-02-02', temperature: 15.2, precipitation: 2.5, humidity: 62 },
      { date: '2024-02-03', temperature: 14.9, precipitation: 0, humidity: 59 },
      { date: '2024-02-04', temperature: 13.6, precipitation: 1.8, humidity: 65 },
      { date: '2024-02-05', temperature: 12.8, precipitation: 0, humidity: 60 },
      { date: '2024-02-06', temperature: 11.1, precipitation: 4.2, humidity: 68 },
      { date: '2024-02-07', temperature: 10.4, precipitation: 0, humidity: 62 },
      { date: '2024-02-08', temperature: 9.7, precipitation: 0.9, humidity: 64 },
      { date: '2024-02-09', temperature: 8.0, precipitation: 0, humidity: 58 },
      { date: '2024-02-10', temperature: 7.2, precipitation: 2.4, humidity: 67 },
      { date: '2024-02-11', temperature: 6.4, precipitation: 0, humidity: 61 },
      { date: '2024-02-12', temperature: 5.7, precipitation: 1.1, humidity: 63 },
      { date: '2024-02-13', temperature: 6.1, precipitation: 0, humidity: 59 },
      { date: '2024-02-14', temperature: 7.0, precipitation: 0.6, humidity: 65 },
      { date: '2024-02-15', temperature: 8.2, precipitation: 0, humidity: 60 },
      { date: '2024-02-16', temperature: 9.4, precipitation: 3.6, humidity: 69 },
      { date: '2024-02-17', temperature: 10.1, precipitation: 0, humidity: 62 },
      { date: '2024-02-18', temperature: 11.3, precipitation: 1.3, humidity: 64 },
      { date: '2024-02-19', temperature: 12.0, precipitation: 0, humidity: 57 },
      { date: '2024-02-20', temperature: 13.2, precipitation: 0.4, humidity: 61 },
      { date: '2024-03-01', temperature: 14.4, precipitation: 0, humidity: 54 },
      { date: '2024-03-02', temperature: 15.1, precipitation: 2.6, humidity: 63 },
      { date: '2024-03-03', temperature: 14.8, precipitation: 0, humidity: 60 },
      { date: '2024-03-04', temperature: 13.5, precipitation: 1.9, humidity: 66 },
      { date: '2024-03-05', temperature: 12.7, precipitation: 0, humidity: 61 },
      { date: '2024-03-06', temperature: 11.0, precipitation: 4.3, humidity: 69 },
      { date: '2024-03-07', temperature: 10.3, precipitation: 0, humidity: 63 },
      { date: '2024-03-08', temperature: 9.6, precipitation: 1.0, humidity: 65 },
      { date: '2024-03-09', temperature: 7.9, precipitation: 0, humidity: 59 },
      { date: '2024-03-10', temperature: 7.1, precipitation: 2.5, humidity: 68 },
      { date: '2024-03-11', temperature: 6.3, precipitation: 0, humidity: 62 },
      { date: '2024-03-12', temperature: 5.6, precipitation: 1.2, humidity: 64 },
      { date: '2024-03-13', temperature: 6.0, precipitation: 0, humidity: 60 },
      { date: '2024-03-14', temperature: 6.9, precipitation: 0.7, humidity: 66 },
      { date: '2024-03-15', temperature: 8.1, precipitation: 0, humidity: 61 },
      { date: '2024-03-16', temperature: 9.3, precipitation: 3.7, humidity: 70 },
      { date: '2024-03-17', temperature: 10.0, precipitation: 0, humidity: 63 },
      { date: '2024-03-18', temperature: 11.2, precipitation: 1.4, humidity: 65 },
      { date: '2024-03-19', temperature: 11.9, precipitation: 0, humidity: 58 },
      { date: '2024-03-20', temperature: 13.1, precipitation: 0.5, humidity: 62 },
      { date: '2024-03-21', temperature: 14.3, precipitation: 0, humidity: 55 },
      { date: '2024-03-22', temperature: 15.0, precipitation: 2.7, humidity: 64 },
      { date: '2024-03-23', temperature: 14.7, precipitation: 0, humidity: 61 },
      { date: '2024-03-24', temperature: 13.4, precipitation: 2.0, humidity: 67 },
      { date: '2024-03-25', temperature: 12.6, precipitation: 0, humidity: 62 },
      { date: '2024-03-26', temperature: 10.9, precipitation: 4.4, humidity: 70 },
      { date: '2024-03-27', temperature: 10.2, precipitation: 0, humidity: 64 },
      { date: '2024-03-28', temperature: 9.5, precipitation: 1.1, humidity: 66 },
      { date: '2024-03-29', temperature: 7.8, precipitation: 0, humidity: 60 },
      { date: '2024-03-30', temperature: 7.0, precipitation: 2.6, humidity: 69 },
    ];

    const eventData = [
      { date: '2024-01-01', isHoliday: true, eventType: 'newYearDay', eventIntensity: 1.0 },
      { date: '2024-01-02', isHoliday: true, eventType: 'holiday', eventIntensity: 0.8 },
      { date: '2024-01-08', isHoliday: true, eventType: 'comingOfAgeDay', eventIntensity: 0.7 },
      { date: '2024-01-14', isHoliday: false, eventType: 'none', eventIntensity: 0.0 },
      { date: '2024-02-11', isHoliday: true, eventType: 'foundationDay', eventIntensity: 0.6 },
      { date: '2024-02-12', isHoliday: true, eventType: 'compensationDay', eventIntensity: 0.5 },
      { date: '2024-03-20', isHoliday: true, eventType: 'vernalEquinoxDay', eventIntensity: 0.7 },
      { date: '2024-03-21', isHoliday: true, eventType: 'holidayObservance', eventIntensity: 0.6 },
    ];

    const competitorData = [
      { date: '2024-01-05', discountRate: 0.15, isNewProductLaunch: false, promotionIntensity: 0.3 },
      { date: '2024-01-10', discountRate: 0.20, isNewProductLaunch: true, promotionIntensity: 0.7 },
      { date: '2024-01-20', discountRate: 0.10, isNewProductLaunch: false, promotionIntensity: 0.2 },
      { date: '2024-02-05', discountRate: 0.25, isNewProductLaunch: true, promotionIntensity: 0.8 },
      { date: '2024-02-14', discountRate: 0.18, isNewProductLaunch: false, promotionIntensity: 0.4 },
      { date: '2024-02-28', discountRate: 0.22, isNewProductLaunch: true, promotionIntensity: 0.75 },
      { date: '2024-03-10', discountRate: 0.12, isNewProductLaunch: false, promotionIntensity: 0.25 },
      { date: '2024-03-20', discountRate: 0.28, isNewProductLaunch: true, promotionIntensity: 0.85 },
    ];

    // 実績需要データ（日次の注文数）
    const actualDemandData = [
      { date: '2024-01-01', orderCount: 450, salesVolume: 2800 },
      { date: '2024-01-02', orderCount: 420, salesVolume: 2650 },
      { date: '2024-01-03', orderCount: 380, salesVolume: 2400 },
      { date: '2024-01-04', orderCount: 390, salesVolume: 2480 },
      { date: '2024-01-05', orderCount: 520, salesVolume: 3200 },
      { date: '2024-01-06', orderCount: 410, salesVolume: 2550 },
      { date: '2024-01-07', orderCount: 400, salesVolume: 2480 },
      { date: '2024-01-08', orderCount: 485, salesVolume: 2950 },
      { date: '2024-01-09', orderCount: 395, salesVolume: 2420 },
      { date: '2024-01-10', orderCount: 580, salesVolume: 3500 },
      { date: '2024-01-11', orderCount: 410, salesVolume: 2520 },
      { date: '2024-01-12', orderCount: 420, salesVolume: 2600 },
      { date: '2024-01-13', orderCount: 385, salesVolume: 2350 },
      { date: '2024-01-14', orderCount: 390, salesVolume: 2400 },
      { date: '2024-01-15', orderCount: 410, salesVolume: 2550 },
      { date: '2024-01-16', orderCount: 430, salesVolume: 2680 },
      { date: '2024-01-17', orderCount: 400, salesVolume: 2480 },
      { date: '2024-01-18', orderCount: 415, salesVolume: 2580 },
      { date: '2024-01-19', orderCount: 385, salesVolume: 2380 },
      { date: '2024-01-20', orderCount: 475, salesVolume: 2950 },
      { date: '2024-01-21', orderCount: 405, salesVolume: 2500 },
      { date: '2024-01-22', orderCount: 420, salesVolume: 2600 },
      { date: '2024-01-23', orderCount: 390, salesVolume: 2420 },
      { date: '2024-01-24', orderCount: 400, salesVolume: 2480 },
      { date: '2024-01-25', orderCount: 410, salesVolume: 2550 },
      { date: '2024-01-26', orderCount: 440, salesVolume: 2750 },
      { date: '2024-01-27', orderCount: 405, salesVolume: 2520 },
      { date: '2024-01-28', orderCount: 425, salesVolume: 2650 },
      { date: '2024-01-29', orderCount: 395, salesVolume: 2450 },
      { date: '2024-01-30', orderCount: 415, salesVolume: 2580 },
      { date: '2024-02-01', orderCount: 450, salesVolume: 2800 },
      { date: '2024-02-02', orderCount: 460, salesVolume: 2850 },
      { date: '2024-02-03', orderCount: 410, salesVolume: 2550 },
      { date: '2024-02-04', orderCount: 435, salesVolume: 2700 },
      { date: '2024-02-05', orderCount: 540, salesVolume: 3300 },
      { date: '2024-02-06', orderCount: 420, salesVolume: 2600 },
      { date: '2024-02-07', orderCount: 410, salesVolume: 2550 },
      { date: '2024-02-08', orderCount: 430, salesVolume: 2680 },
      { date: '2024-02-09', orderCount: 400, salesVolume: 2480 },
      { date: '2024-02-10', orderCount: 490, salesVolume: 3050 },
      { date: '2024-02-11', orderCount: 510, salesVolume: 3150 },
      { date: '2024-02-12', orderCount: 520, salesVolume: 3200 },
      { date: '2024-02-13', orderCount: 410, salesVolume: 2520 },
      { date: '2024-02-14', orderCount: 500, salesVolume: 3100 },
      { date: '2024-02-15', orderCount: 420, salesVolume: 2600 },
      { date: '2024-02-16', orderCount: 440, salesVolume: 2750 },
      { date: '2024-02-17', orderCount: 410, salesVolume: 2550 },
      { date: '2024-02-18', orderCount: 430, salesVolume: 2680 },
      { date: '2024-02-19', orderCount: 400, salesVolume: 2480 },
      { date: '2024-02-20', orderCount: 420, salesVolume: 2600 },
      { date: '2024-02-21', orderCount: 415, salesVolume: 2580 },
      { date: '2024-02-28', orderCount: 550, salesVolume: 3380 },
      { date: '2024-03-01', orderCount: 460, salesVolume: 2900 },
      { date: '2024-03-02', orderCount: 470, salesVolume: 2950 },
      { date: '2024-03-03', orderCount: 420, salesVolume: 2650 },
      { date: '2024-03-04', orderCount: 445, salesVolume: 2800 },
      { date: '2024-03-05', orderCount: 550, salesVolume: 3400 },
      { date: '2024-03-06', orderCount: 430, salesVolume: 2700 },
      { date: '2024-03-07', orderCount: 420, salesVolume: 2650 },
      { date: '2024-03-08', orderCount: 440, salesVolume: 2750 },
      { date: '2024-03-09', orderCount: 410, salesVolume: 2580 },
      { date: '2024-03-10', orderCount: 500, salesVolume: 3150 },
      { date: '2024-03-11', orderCount: 420, salesVolume: 2600 },
      { date: '2024-03-12', orderCount: 430, salesVolume: 2700 },
      { date: '2024-03-13', orderCount: 400, salesVolume: 2500 },
      { date: '2024-03-14', orderCount: 410, salesVolume: 2580 },
      { date: '2024-03-15', orderCount: 420, salesVolume: 2650 },
      { date: '2024-03-16', orderCount: 450, salesVolume: 2850 },
      { date: '2024-03-17', orderCount: 415, salesVolume: 2600 },
      { date: '2024-03-18', orderCount: 435, salesVolume: 2750 },
      { date: '2024-03-19', orderCount: 405, salesVolume: 2530 },
      { date: '2024-03-20', orderCount: 530, salesVolume: 3250 },
      { date: '2024-03-21', orderCount: 490, salesVolume: 3000 },
      { date: '2024-03-22', orderCount: 480, salesVolume: 3000 },
      { date: '2024-03-23', orderCount: 430, salesVolume: 2700 },
      { date: '2024-03-24', orderCount: 450, salesVolume: 2850 },
      { date: '2024-03-25', orderCount: 560, salesVolume: 3450 },
      { date: '2024-03-26', orderCount: 440, salesVolume: 2800 },
      { date: '2024-03-27', orderCount: 430, salesVolume: 2700 },
      { date: '2024-03-28', orderCount: 450, salesVolume: 2850 },
      { date: '2024-03-29', orderCount: 420, salesVolume: 2650 },
      { date: '2024-03-30', orderCount: 500, salesVolume: 3100 },
    ];

    // 相関係数計算関数を呼び出し
    const result = calculateCorrelationCoefficients({
      weatherData: weatherData,
      eventData: eventData,
      competitorData: competitorData,
      actualDemandData: actualDemandData,
    });

    // 気象データ（気温）と実績需要の相関係数を検証
    expect(result.temperatureCorrelation).toBeGreaterThanOrEqual(-1);
    expect(result.temperatureCorrelation).toBeLessThanOrEqual(1);
    expect(result.temperatureCorrelation).toBeGreaterThanOrEqual(0.55);
    expect(result.temperatureCorrelation).toBeLessThanOrEqual(0.75);

    // イベントデータ（祝日フラグ）と実績需要の相関係数を検証
    expect(result.holidayCorrelation).toBeGreaterThanOrEqual(-1);
    expect(result.holidayCorrelation).toBeLessThanOrEqual(1);
    expect(result.holidayCorrelation).toBeGreaterThanOrEqual(0.45);
    expect(result.holidayCorrelation).toBeLessThanOrEqual(0.65);

    // 競合施策データ（割引率）と実績需要の相関係数を検証
    expect(result.discountRateCorrelation).toBeGreaterThanOrEqual(-1);
    expect(result.discountRateCorrelation).toBeLessThanOrEqual(1);
    expect(result.discountRateCorrelation).toBeGreaterThanOrEqual(0.50);
    expect(result.discountRateCorrelation).toBeLessThanOrEqual(0.72);

    // 降水量と実績需要の相関係数を検証
    expect(result.precipitationCorrelation).toBeGreaterThanOrEqual(-1);
    expect(result.precipitationCorrelation).toBeLessThanOrEqual(1);

    // 湿度と実績需要の相関係数を検証
    expect(result.humidityCorrelation).toBeGreaterThanOrEqual(-1);
    expect(result.humidityCorrelation).toBeLessThanOrEqual(1);

    // イベント強度と実績需要の相関係数を検証
    expect(result.eventIntensityCorrelation).toBeGreaterThanOrEqual(-1);
    expect(result.eventIntensityCorrelation).toBeLessThanOrEqual(1);

    // プロモーション強度と実績需要の相関係数を検証
    expect(result.promotionIntensityCorrelation).toBeGreaterThanOrEqual(-1);
    expect(result.promotionIntensityCorrelation).toBeLessThanOrEqual(1);
    expect(result.promotionIntensityCorrelation).toBeGreaterThanOrEqual(0.48);
    expect(result.promotionIntensityCorrelation).toBeLessThanOrEqual(0.68);

    // 複合相関係数が計算されていることを検証
    expect(result.compositeCorrelation).toBeGreaterThanOrEqual(-1);
    expect(result.compositeCorrelation).toBeLessThanOrEqual(1);

    // 複合相関係数が単一変数の相関係数を上回ることを検証
    expect(result.compositeCorrelation).toBeGreaterThan(result.temperatureCorrelation);
    expect(result.compositeCorrelation).toBeGreaterThan(result.holidayCorrelation);
    expect(result.compositeCorrelation).toBeGreaterThan(result.discountRateCorrelation);

    // 複合相関係数の値を検証（複数変数を組み合わせた場合、より高い精度を示す）
    expect(result.compositeCorrelation).toBeGreaterThanOrEqual(0.72);
    expect(result.compositeCorrelation).toBeLessThanOrEqual(0.88);

    // 相関係数計算の有意性を検証
    expect(result.isStatisticallySignificant).toBe(true);
    expect(result.pValue).toBeLessThan(0.05);

    // 結果オブジェクトの必須フィールドが存在することを検証
    expect(result).toHaveProperty('temperatureCorrelation');
    expect(result).toHaveProperty('holidayCorrelation');
    expect(result).toHaveProperty('discountRateCorrelation');
    expect(result).toHaveProperty('compositeCorrelation');
    expect(result).toHaveProperty('isStatisticallySignificant');
    expect(result).toHaveProperty('pValue');
  });
});