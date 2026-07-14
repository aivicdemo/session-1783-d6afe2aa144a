import { assignExternalDataTrustScore } from '../../src/logic/it-7-2-1';

describe('外部要因データ信頼度スコア付与・採用判定機能', () => {
  // SCEN-804
  test('気象・イベント・競合施策データに信頼度スコア（0-100）を付与し、採用判定基準に基づいて予測モデル入力可否が自動判定される', () => {
    // 気象データ（信頼度スコア高）
    const weatherDataHigh = {
      data_type: 'weather',
      source: 'meteorological_agency',
      precipitation_mm: 15.5,
      temperature_celsius: 22.3,
      humidity_percent: 65,
      recorded_at: '2024-01-15T10:00:00Z',
      data_quality_flags: {
        sensor_status: 'operational',
        calibration_status: 'valid',
        missing_values: 0
      }
    };

    // 気象データ（信頼度スコア低 - センサー故障）
    const weatherDataLow = {
      data_type: 'weather',
      source: 'third_party_vendor',
      precipitation_mm: 8.2,
      temperature_celsius: 18.5,
      humidity_percent: 55,
      recorded_at: '2024-01-15T09:30:00Z',
      data_quality_flags: {
        sensor_status: 'maintenance',
        calibration_status: 'expired',
        missing_values: 2
      }
    };

    // イベントデータ（信頼度スコア高）
    const eventDataHigh = {
      data_type: 'event',
      source: 'official_calendar',
      event_type: 'seasonal_festival',
      event_name: 'New Year Festival',
      expected_impact_level: 'high',
      coverage_region: 'nationwide',
      confidence_source_flags: {
        multi_source_confirmed: true,
        historical_validation: true,
        lead_time_days: 30
      },
      scheduled_date: '2024-01-20'
    };

    // イベントデータ（信頼度スコア低 - 予測情報）
    const eventDataLow = {
      data_type: 'event',
      source: 'user_submission',
      event_type: 'local_event',
      event_name: 'Unconfirmed Local Festival',
      expected_impact_level: 'low',
      coverage_region: 'local',
      confidence_source_flags: {
        multi_source_confirmed: false,
        historical_validation: false,
        lead_time_days: 3
      },
      scheduled_date: '2024-01-18'
    };

    // 競合施策データ（信頼度スコア高）
    const competitorDataHigh = {
      data_type: 'competitor_strategy',
      source: 'competitor_official_site',
      strategy_type: 'promotion',
      discount_rate_percent: 25,
      affected_categories: ['dairy', 'vegetables'],
      campaign_start_date: '2024-01-15',
      campaign_end_date: '2024-01-22',
      verification_flags: {
        source_verified: true,
        price_tracked: true,
        inventory_impact_observed: true
      }
    };

    // 競合施策データ（信頼度スコア低 - 未確認情報）
    const competitorDataLow = {
      data_type: 'competitor_strategy',
      source: 'social_media_rumor',
      strategy_type: 'price_strategy',
      discount_rate_percent: 15,
      affected_categories: ['meat'],
      campaign_start_date: '2024-01-16',
      campaign_end_date: '2024-01-19',
      verification_flags: {
        source_verified: false,
        price_tracked: false,
        inventory_impact_observed: false
      }
    };

    const adoption_threshold = 70;

    const resultWeatherHigh = assignExternalDataTrustScore(
      weatherDataHigh,
      adoption_threshold
    );
    const resultWeatherLow = assignExternalDataTrustScore(
      weatherDataLow,
      adoption_threshold
    );
    const resultEventHigh = assignExternalDataTrustScore(
      eventDataHigh,
      adoption_threshold
    );
    const resultEventLow = assignExternalDataTrustScore(
      eventDataLow,
      adoption_threshold
    );
    const resultCompetitorHigh = assignExternalDataTrustScore(
      competitorDataHigh,
      adoption_threshold
    );
    const resultCompetitorLow = assignExternalDataTrustScore(
      competitorDataLow,
      adoption_threshold
    );

    // 気象データ高信頼度：スコア 85, 採用判定 true
    expect(resultWeatherHigh.trust_score).toBe(85);
    expect(resultWeatherHigh.trust_score).toBeGreaterThanOrEqual(0);
    expect(resultWeatherHigh.trust_score).toBeLessThanOrEqual(100);
    expect(resultWeatherHigh.adoption_judgment).toBe(true);
    expect(resultWeatherHigh.adoption_reason).toBe('信頼度スコア(85)が採用基準(70)以上のため採用対象');

    // 気象データ低信頼度：スコア 42, 採用判定 false
    expect(resultWeatherLow.trust_score).toBe(42);
    expect(resultWeatherLow.trust_score).toBeGreaterThanOrEqual(0);
    expect(resultWeatherLow.trust_score).toBeLessThanOrEqual(100);
    expect(resultWeatherLow.adoption_judgment).toBe(false);
    expect(resultWeatherLow.adoption_reason).toBe('信頼度スコア(42)が採用基準(70)未満のため不採用');

    // イベントデータ高信頼度：スコア 78, 採用判定 true
    expect(resultEventHigh.trust_score).toBe(78);
    expect(resultEventHigh.trust_score).toBeGreaterThanOrEqual(0);
    expect(resultEventHigh.trust_score).toBeLessThanOrEqual(100);
    expect(resultEventHigh.adoption_judgment).toBe(true);
    expect(resultEventHigh.adoption_reason).toBe('信頼度スコア(78)が採用基準(70)以上のため採用対象');

    // イベントデータ低信頼度：スコア 38, 採用判定 false
    expect(resultEventLow.trust_score).toBe(38);
    expect(resultEventLow.trust_score).toBeGreaterThanOrEqual(0);
    expect(resultEventLow.trust_score).toBeLessThanOrEqual(100);
    expect(resultEventLow.adoption_judgment).toBe(false);
    expect(resultEventLow.adoption_reason).toBe('信頼度スコア(38)が採用基準(70)未満のため不採用');

    // 競合施策データ高信頼度：スコア 82, 採用判定 true
    expect(resultCompetitorHigh.trust_score).toBe(82);
    expect(resultCompetitorHigh.trust_score).toBeGreaterThanOrEqual(0);
    expect(resultCompetitorHigh.trust_score).toBeLessThanOrEqual(100);
    expect(resultCompetitorHigh.adoption_judgment).toBe(true);
    expect(resultCompetitorHigh.adoption_reason).toBe('信頼度スコア(82)が採用基準(70)以上のため採用対象');

    // 競合施策データ低信頼度：スコア 35, 採用判定 false
    expect(resultCompetitorLow.trust_score).toBe(35);
    expect(resultCompetitorLow.trust_score).toBeGreaterThanOrEqual(0);
    expect(resultCompetitorLow.trust_score).toBeLessThanOrEqual(100);
    expect(resultCompetitorLow.adoption_judgment).toBe(false);
    expect(resultCompetitorLow.adoption_reason).toBe('信頼度スコア(35)が採用基準(70)未満のため不採用');

    // ダッシュボード表示用データセット生成
    const dashboard_results = [
      resultWeatherHigh,
      resultWeatherLow,
      resultEventHigh,
      resultEventLow,
      resultCompetitorHigh,
      resultCompetitorLow
    ];

    // 採用対象データの検証
    const adopted_data = dashboard_results.filter(
      (r) => r.adoption_judgment === true
    );
    expect(adopted_data).toHaveLength(3);
    expect(adopted_data.every((r) => r.trust_score >= 70)).toBe(true);

    // 不採用データの検証
    const rejected_data = dashboard_results.filter(
      (r) => r.adoption_judgment === false
    );
    expect(rejected_data).toHaveLength(3);
    expect(rejected_data.every((r) => r.trust_score < 70)).toBe(true);

    // 閾値境界値テスト：スコア 70 ちょうどは採用対象
    const borderlineData = {
      data_type: 'weather',
      source: 'meteorological_agency',
      precipitation_mm: 10.0,
      temperature_celsius: 20.0,
      humidity_percent: 60,
      recorded_at: '2024-01-15T12:00:00Z',
      data_quality_flags: {
        sensor_status: 'operational',
        calibration_status: 'valid',
        missing_values: 0
      }
    };

    const resultBorderline = assignExternalDataTrustScore(
      borderlineData,
      70
    );
    expect(resultBorderline.trust_score).toBe(70);
    expect(resultBorderline.adoption_judgment).toBe(true);
    expect(resultBorderline.adoption_reason).toBe('信頼度スコア(70)が採用基準(70)以上のため採用対象');

    // スコア範囲外チェック
    dashboard_results.forEach((result) => {
      expect(result.trust_score).toBeGreaterThanOrEqual(0);
      expect(result.trust_score).toBeLessThanOrEqual(100);
      expect(typeof result.adoption_judgment).toBe('boolean');
      expect(typeof result.adoption_reason).toBe('string');
    });
  });
});