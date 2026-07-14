// SCEN-793: [error] 外部要因データ自動取得・統合機能 - 複数の外部データソースのうち1つが接続失敗した場合、例外処理により部分的なデータ統合が行われる

import { aggregateExternalDataWithFallback } from '../../src/logic/it-7-2-1';

const fetchMock = require('jest-fetch-mock');

describe('外部要因データ自動取得・統合機能', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  test('複数の外部データソースのうち1つが接続失敗した場合、部分的なデータ統合が行われる', async () => {
    // SCEN-793

    const weather_data = {
      source_id: 'weather_api',
      date: '2024-01-15',
      temperature: 15.5,
      humidity: 65,
      status: 'success',
    };

    const event_data = {
      source_id: 'event_api',
      date: '2024-01-15',
      event_type: 'holiday',
      event_name: '成人の日',
      status: 'success',
    };

    const competitor_data = {
      source_id: 'competitor_api',
      date: '2024-01-15',
      campaign_type: 'discount',
      discount_rate: 20,
      status: 'success',
    };

    // 気象データソースのレスポンス（成功）
    fetchMock.mockResponseOnce(JSON.stringify(weather_data), { status: 200 });

    // イベント情報データソースのレスポンス（接続失敗：タイムアウト）
    fetchMock.mockRejectOnce(new Error('Network timeout'));

    // 競合店舗施策データソースのレスポンス（成功）
    fetchMock.mockResponseOnce(JSON.stringify(competitor_data), {
      status: 200,
    });

    const external_data_sources = [
      {
        source_id: 'weather_api',
        url: 'https://api.weather.example.com/forecast',
        timeout_ms: 5000,
      },
      {
        source_id: 'event_api',
        url: 'https://api.event.example.com/events',
        timeout_ms: 5000,
      },
      {
        source_id: 'competitor_api',
        url: 'https://api.competitor.example.com/campaigns',
        timeout_ms: 5000,
      },
    ];

    const result = await aggregateExternalDataWithFallback(
      external_data_sources
    );

    // 接続成功したデータのみが統合されていることを確認
    expect(result.integrated_data).toEqual([weather_data, competitor_data]);

    // 失敗したデータソースが記録されていることを確認
    expect(result.failed_sources).toHaveLength(1);
    expect(result.failed_sources[0]).toEqual({
      source_id: 'event_api',
      error_reason: 'Network timeout',
    });

    // 統合状態が部分成功（partial_success）であることを確認
    expect(result.aggregation_status).toBe('partial_success');

    // 統計情報の確認
    expect(result.statistics).toEqual({
      total_sources: 3,
      successful_sources: 2,
      failed_sources: 1,
      success_rate: (2 / 3) * 100,
    });

    // エラーログにエラー詳細が記録されていることを確認
    expect(result.error_log).toHaveLength(1);
    expect(result.error_log[0]).toEqual({
      source_id: 'event_api',
      timestamp: expect.any(String),
      error_message: 'Network timeout',
      error_type: 'connection_error',
    });

    // ダッシュボード表示用データが正しく構成されていることを確認
    expect(result.dashboard_display).toEqual({
      data: [weather_data, competitor_data],
      warning_message:
        '1 source failed to connect. Showing data from 2 available sources.',
      failed_source_list: ['event_api'],
      is_partial_data: true,
    });

    // システムが停止していないことを確認（結果が返されている）
    expect(result).toBeDefined();
    expect(result.integrated_data).toBeTruthy();
  });
});