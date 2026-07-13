import { fetchMock } from 'jest-fetch-mock';
import {
  fetchExternalDataSourcesWithFallback,
} from '../../src/logic/it-1-br-6-2-1-1';

fetchMock.enableMocks();

describe('外部要因データ自動取得・統合機能', () => {
  // SCEN-460
  test('複数の外部データソースのうち1つが取得失敗した場合に取得可能なデータのみで統合処理が継続される', async () => {
    fetchMock.resetMocks();

    // スーパーAからの取得成功（在庫データ）
    fetchMock.mockResponseOnce(
      JSON.stringify({
        supermarket_id: 'super_a',
        supermarket_name: 'スーパーA',
        inventory_data: [
          {
            ingredient_id: 'ingr_001',
            ingredient_name: '牛乳',
            stock_quantity: 50,
            unit: 'L',
            last_updated: '2024-12-20T10:00:00Z',
          },
          {
            ingredient_id: 'ingr_002',
            ingredient_name: 'パン',
            stock_quantity: 120,
            unit: '本',
            last_updated: '2024-12-20T10:00:00Z',
          },
        ],
      }),
      { status: 200 }
    );

    // スーパーBからの取得失敗（ネットワークエラー）
    fetchMock.mockRejectOnce(new Error('Network timeout'));

    // スーパーCからの取得成功（価格データ）
    fetchMock.mockResponseOnce(
      JSON.stringify({
        supermarket_id: 'super_c',
        supermarket_name: 'スーパーC',
        price_data: [
          {
            ingredient_id: 'ingr_001',
            ingredient_name: '牛乳',
            unit_price: 198,
            currency: 'JPY',
            discount_rate: 0.1,
            last_updated: '2024-12-20T09:30:00Z',
          },
          {
            ingredient_id: 'ingr_003',
            ingredient_name: 'チーズ',
            unit_price: 450,
            currency: 'JPY',
            discount_rate: 0,
            last_updated: '2024-12-20T09:30:00Z',
          },
        ],
      }),
      { status: 200 }
    );

    const data_source_configs = [
      {
        source_id: 'super_a',
        source_name: 'スーパーA',
        endpoint: 'https://api.super-a.com/inventory',
        data_type: 'inventory',
        timeout_ms: 5000,
      },
      {
        source_id: 'super_b',
        source_name: 'スーパーB',
        endpoint: 'https://api.super-b.com/inventory',
        data_type: 'inventory',
        timeout_ms: 5000,
      },
      {
        source_id: 'super_c',
        source_name: 'スーパーC',
        endpoint: 'https://api.super-c.com/prices',
        data_type: 'price',
        timeout_ms: 5000,
      },
    ];

    const result = await fetchExternalDataSourcesWithFallback(
      data_source_configs
    );

    // 期待値: 2つのデータソースから正常に取得でき、1つのエラーは記録されること
    expect(result).toBeDefined();
    expect(result.success_count).toBe(2);
    expect(result.failure_count).toBe(1);
    expect(result.total_sources).toBe(3);

    // スーパーAのデータが含まれることを確認
    expect(result.integrated_data).toEqual(
      expect.objectContaining({
        inventory: expect.arrayContaining([
          expect.objectContaining({
            supermarket_id: 'super_a',
            ingredient_id: 'ingr_001',
            stock_quantity: 50,
          }),
          expect.objectContaining({
            supermarket_id: 'super_a',
            ingredient_id: 'ingr_002',
            stock_quantity: 120,
          }),
        ]),
      })
    );

    // スーパーCの価格データが含まれることを確認
    expect(result.integrated_data).toEqual(
      expect.objectContaining({
        prices: expect.arrayContaining([
          expect.objectContaining({
            supermarket_id: 'super_c',
            ingredient_id: 'ingr_001',
            unit_price: 198,
            discount_rate: 0.1,
          }),
          expect.objectContaining({
            supermarket_id: 'super_c',
            ingredient_id: 'ingr_003',
            unit_price: 450,
          }),
        ]),
      })
    );

    // エラーログに失敗したスーパーBが記録されていることを確認
    expect(result.error_logs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source_id: 'super_b',
          source_name: 'スーパーB',
          error_type: 'network_error',
          error_message: expect.stringMatching(/timeout|network/i),
          timestamp: expect.any(String),
        }),
      ])
    );

    // 処理結果の統計値を確認
    expect(result.integrated_data_count).toBe(5); // スーパーA(2件) + スーパーC(2件) = 4件のデータ
    expect(result.integration_status).toBe('partial_success');

    // 統合処理の実行結果が成功（部分成功）であることを確認
    expect(result.is_processing_continued).toBe(true);
    expect(result.system_status).toBe('operational');
  });
});