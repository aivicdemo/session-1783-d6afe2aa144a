import { scoreMenuProposalsWithSupplierData } from '../../src/logic/it-1-br-2-1-1-1';

const fetchMock = require('jest-fetch-mock');

describe('流通業者在庫・価格データ連携による献立案スコアリング', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // SCEN-365
  test('流通業者APIが無応答の場合、30秒のタイムアウト後に適切なエラー処理が実行される', async () => {
    const menuProposals = [
      {
        proposal_id: 'prop_001',
        dishes: [
          {
            dish_id: 'dish_001',
            name: 'サーモン焼き',
            ingredients: [
              { ingredient_id: 'ing_001', name: 'サーモン', quantity: 150 },
              { ingredient_id: 'ing_002', name: '塩', quantity: 5 },
            ],
          },
        ],
      },
    ];

    const supplierApiConfig = {
      endpoint: 'https://api.supplier.example.com/inventory',
      timeout_ms: 30000,
      max_retries: 2,
    };

    // APIが無応答をシミュレート
    fetchMock.mockImplementationOnce(
      () =>
        new Promise(() => {
          // 意図的に resolve/reject しない（永遠に待機）
        })
    );

    const result_promise = scoreMenuProposalsWithSupplierData(
      menuProposals,
      supplierApiConfig
    );

    // 30秒のタイムアウトまで進める
    jest.advanceTimersByTime(30000);

    const result = await result_promise;

    // エラーハンドラが実行され、ユーザー向けエラーメッセージが返される
    expect(result.success).toBe(false);
    expect(result.error_code).toBe('SUPPLIER_API_TIMEOUT');
    expect(result.user_message).toBe(
      '流通業者データの取得に失敗しました。しばらく後にお試しください'
    );

    // システムログに詳細なエラー情報が記録されている
    expect(result.system_log).toBeDefined();
    expect(result.system_log.error_type).toBe('APIタイムアウト');
    expect(result.system_log.timeout_ms).toBe(30000);
    expect(result.system_log.retry_count).toBe(2);
    expect(result.system_log.api_endpoint).toBe(
      'https://api.supplier.example.com/inventory'
    );
    expect(result.system_log.timestamp).toBeDefined();

    // 献立案スコアリング機能が正常な状態に復帰している
    expect(result.system_state).toBe('RECOVERED');
    expect(result.proposals_state).toBe('READY_FOR_RETRY');

    // APIが呼び出されたことを確認
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.supplier.example.com/inventory',
      expect.objectContaining({
        method: 'POST',
        timeout: 30000,
      })
    );
  });
});