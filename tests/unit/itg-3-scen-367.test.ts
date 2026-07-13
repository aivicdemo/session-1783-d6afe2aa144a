import { fetchOptimalMenuWithFallback } from '../../src/logic/it-1-br-6-2-1-1';

const fetchMock = require('jest-fetch-mock');

describe('流通業者在庫・価格データ連携インターフェース', () => {
  test('SCEN-367: API タイムアウト時のフォールバック処理が正常に動作する', async () => {
    fetchMock.resetMocks();

    const user_id = 'user_001';
    const family_ids = ['fam_001', 'fam_002'];
    const menu_generation_id = 'gen_20240115_001';
    const api_timeout_ms = 500;
    const cache_data = {
      items: [
        {
          ingredient_id: 'ing_001',
          ingredient_name: 'トマト',
          distributor_id: 'dist_001',
          current_price: 150,
          stock_qty: 45,
          is_seasonal: true,
          discount_rate: 0.0,
          last_updated_at: '2024-01-14T15:30:00Z',
        },
        {
          ingredient_id: 'ing_002',
          ingredient_name: 'ニンジン',
          distributor_id: 'dist_002',
          current_price: 120,
          stock_qty: 38,
          is_seasonal: true,
          discount_rate: 0.1,
          last_updated_at: '2024-01-14T14:00:00Z',
        },
      ],
      cache_retrieved_at: '2024-01-14T16:00:00Z',
    };
    const default_prices = {
      ing_001: 160,
      ing_002: 130,
    };

    // API がタイムアウトするように設定（遅延 > タイムアウト値）
    fetchMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve(
              new Response(JSON.stringify({ error: 'Request timeout' }), {
                status: 504,
              })
            );
          }, api_timeout_ms + 200) // タイムアウト値を超えて遅延
          ;
        })
    );

    const result = await fetchOptimalMenuWithFallback({
      user_id,
      family_ids,
      menu_generation_id,
      api_timeout_ms,
      cache_data,
      default_prices,
    });

    // フォールバック処理が実行されたことを確認
    expect(result.is_fallback_used).toBe(true);
    expect(result.fallback_source).toBe('cache');

    // キャッシュデータから献立最適化が実行されていることを確認
    expect(result.optimized_menu).toBeDefined();
    expect(result.optimized_menu.items).toHaveLength(2);
    expect(result.optimized_menu.items[0].ingredient_id).toBe('ing_001');
    expect(result.optimized_menu.items[0].ingredient_name).toBe('トマト');
    expect(result.optimized_menu.items[0].current_price).toBe(150);
    expect(result.optimized_menu.items[0].stock_qty).toBe(45);
    expect(result.optimized_menu.items[1].ingredient_id).toBe('ing_002');
    expect(result.optimized_menu.items[1].ingredient_name).toBe('ニンジン');
    expect(result.optimized_menu.items[1].current_price).toBe(120);
    expect(result.optimized_menu.items[1].discount_rate).toBe(0.1);

    // ユーザー通知メッセージが生成されていることを確認
    expect(result.notification_message).toBeDefined();
    expect(result.notification_message).toMatch(/キャッシュ/);
    expect(result.notification_message).toMatch(/使用/);

    // エラーログに記録されていることを確認
    expect(result.error_log).toBeDefined();
    expect(result.error_log).toMatch(/タイムアウト/);
    expect(result.error_log).toMatch(/フォールバック/);

    // エラーハンドリングが適切に動作し、システムが正常終了していることを確認
    expect(result.error_occurred).toBe(true);
    expect(result.error_type).toBe('api_timeout');
    expect(result.system_crashed).toBe(false);

    // メニュー生成IDが保持されていることを確認
    expect(result.menu_generation_id).toBe(menu_generation_id);
  });
});