import { fetchActualDemandData } from '../../src/logic/it-1-br-6-2-1-1';

const fetchMock = require('jest-fetch-mock');

describe('食材流通業者・スーパーの在庫・価格データ連携インターフェース - 実績データ取得', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  // SCEN-453
  test('外部連携APIが応答しない場合に適切なエラーハンドリングと部分データ取得が実行される', async () => {
    const request_timestamp = '2024-01-15T11:00:00Z';
    const target_month = '2024-01';
    const api_endpoints = [
      { provider_id: 'super_01', url: 'https://api.super-01.example.com/sales' },
      { provider_id: 'distributor_01', url: 'https://api.distributor-01.example.com/inventory' },
      { provider_id: 'super_02', url: 'https://api.super-02.example.com/stock' }
    ];

    // super_01: 正常レスポンス
    fetchMock.mockResponseOnce(
      JSON.stringify({
        provider_id: 'super_01',
        data: [
          { item_code: 'IT_001', sales_count: 150, sale_date: '2024-01-15' }
        ],
        status: 'success'
      }),
      { status: 200 }
    );

    // distributor_01: タイムアウト（エラー）
    fetchMock.mockRejectOnce(new Error('Connection timeout'));

    // super_02: 正常レスポンス
    fetchMock.mockResponseOnce(
      JSON.stringify({
        provider_id: 'super_02',
        data: [
          { item_code: 'IT_002', stock_quantity: 300, update_time: '2024-01-15T10:30:00Z' }
        ],
        status: 'success'
      }),
      { status: 200 }
    );

    const result = await fetchActualDemandData({
      request_timestamp,
      target_month,
      api_endpoints,
      timeout_ms: 5000
    });

    // エラーハンドリング: 応答しないAPIは除外され、利用可能データのみを収集
    expect(result.status).toBe('partial');
    expect(result.success_count).toBe(2);
    expect(result.failed_count).toBe(1);
    expect(result.total_endpoints).toBe(3);

    // 部分的なデータセット構成: 応答可能な2つのプロバイダーのデータのみ
    expect(result.dataset.length).toBe(2);
    expect(result.dataset).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          provider_id: 'super_01',
          data: expect.arrayContaining([
            expect.objectContaining({ item_code: 'IT_001', sales_count: 150 })
          ])
        }),
        expect.objectContaining({
          provider_id: 'super_02',
          data: expect.arrayContaining([
            expect.objectContaining({ item_code: 'IT_002', stock_quantity: 300 })
          ])
        })
      ])
    );

    // エラーログ記録の確認
    expect(result.error_log).toBeDefined();
    expect(result.error_log.length).toBe(1);
    expect(result.error_log[0]).toMatchObject({
      provider_id: 'distributor_01',
      error_message: expect.stringMatching(/timeout|connection/i),
      timestamp: expect.any(String)
    });

    // ユーザー通知ステータスの確認
    expect(result.user_notification).toBeDefined();
    expect(result.user_notification.partial_data_flag).toBe(true);
    expect(result.user_notification.message).toMatch(/部分的|一部の|利用可能/);
    expect(result.user_notification.affected_providers).toEqual(['distributor_01']);

    // システム継続性の確認
    expect(result.system_continue_enabled).toBe(true);
  });
});