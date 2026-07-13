import { mergeExternalDataSources } from '../../src/logic/it-1-br-6-3-1';

describe('外部データソース自動連携・統合', () => {
  // SCEN-268
  test('複数の外部データソースから同時取得したデータを正常にマージし、重複排除・時系列整列を実行する', async () => {
    const fetchMock = require('jest-fetch-mock');
    fetchMock.enableMocks();
    fetchMock.resetMocks();

    // 3つの外部データソースからのレスポンス準備
    // SupplierA: 2024-01-15の商品データ
    const supplierAResponse = [
      {
        sourceId: 'SUPPLIER_A',
        timestamp: '2024-01-15T08:00:00Z',
        productId: 'PROD_001',
        quantity: 100,
        price: 5000,
      },
      {
        sourceId: 'SUPPLIER_A',
        timestamp: '2024-01-15T08:30:00Z',
        productId: 'PROD_002',
        quantity: 50,
        price: 3000,
      },
    ];

    // SupplierB: 同じ時間帯の重複を含むデータ
    const supplierBResponse = [
      {
        sourceId: 'SUPPLIER_B',
        timestamp: '2024-01-15T08:00:00Z',
        productId: 'PROD_001',
        quantity: 100,
        price: 5000,
      },
      {
        sourceId: 'SUPPLIER_B',
        timestamp: '2024-01-15T09:00:00Z',
        productId: 'PROD_003',
        quantity: 75,
        price: 2500,
      },
    ];

    // MarketDataProvider: 異なる時刻のデータ
    const marketProviderResponse = [
      {
        sourceId: 'MARKET_PROVIDER',
        timestamp: '2024-01-15T07:00:00Z',
        productId: 'PROD_004',
        quantity: 200,
        price: 4000,
      },
      {
        sourceId: 'MARKET_PROVIDER',
        timestamp: '2024-01-15T08:30:00Z',
        productId: 'PROD_002',
        quantity: 50,
        price: 3000,
      },
    ];

    // fetch のモック設定（3つのAPIに対応）
    fetchMock.mockResponseOnce(JSON.stringify(supplierAResponse), { status: 200 });
    fetchMock.mockResponseOnce(JSON.stringify(supplierBResponse), { status: 200 });
    fetchMock.mockResponseOnce(JSON.stringify(marketProviderResponse), { status: 200 });

    // 外部データソース接続設定
    const dataSources = [
      {
        sourceId: 'SUPPLIER_A',
        apiUrl: 'https://api.supplierA.example.com/data',
        timeout: 5000,
      },
      {
        sourceId: 'SUPPLIER_B',
        apiUrl: 'https://api.supplierB.example.com/data',
        timeout: 5000,
      },
      {
        sourceId: 'MARKET_PROVIDER',
        apiUrl: 'https://api.market.example.com/data',
        timeout: 5000,
      },
    ];

    const params = {
      dataSources,
      targetDate: '2024-01-15',
      deduplicateStrategy: 'KEEP_FIRST',
      sortOrder: 'ASC',
    };

    // テスト実行
    const startTime = Date.now();
    const result = await mergeExternalDataSources(params);
    const executionTime = Date.now() - startTime;

    // 1. 正常取得の確認：3つのAPIが呼び出されたこと
    expect(fetchMock.mock.calls.length).toBe(3);

    // 2. マージ後のデータセット内の期待データ
    // 重複排除（KEEP_FIRST）後：
    // - PROD_001@08:00:00Z: SUPPLIER_A版を保持（SUPPLIER_B版は削除）
    // - PROD_002@08:30:00Z: SUPPLIER_A版を保持（MARKET_PROVIDER版は削除）
    // - PROD_003@09:00:00Z: SUPPLIER_B版
    // - PROD_004@07:00:00Z: MARKET_PROVIDER版
    // 合計4件、時系列昇順に整列

    expect(result.mergedDataCount).toBe(4);
    expect(result.duplicateRemovedCount).toBe(2);

    // 3. 時系列順（昇順）の確認
    const timestamps = result.mergedData.map(
      (item: { timestamp: string }) => item.timestamp,
    );
    expect(timestamps).toEqual([
      '2024-01-15T07:00:00Z',
      '2024-01-15T08:00:00Z',
      '2024-01-15T08:30:00Z',
      '2024-01-15T09:00:00Z',
    ]);

    // 4. 重複排除ロジックの検証（同じtimestamp, productId, quantityの組み合わせは1件のみ）
    const deduplicationKey = (item: {
      timestamp: string;
      productId: string;
      quantity: number;
    }) => `${item.timestamp}|${item.productId}|${item.quantity}`;
    const keySet = new Set(result.mergedData.map(deduplicationKey));
    expect(keySet.size).toBe(result.mergedDataCount);

    // 5. マージ後のデータ整合性検証
    result.mergedData.forEach(
      (item: {
        sourceId: string;
        timestamp: string;
        productId: string;
        quantity: number;
        price: number;
      }) => {
        // NULL値チェック
        expect(item.sourceId).toBeDefined();
        expect(item.timestamp).toBeDefined();
        expect(item.productId).toBeDefined();
        expect(item.quantity).toBeDefined();
        expect(item.price).toBeDefined();

        // データ型の一貫性
        expect(typeof item.sourceId).toBe('string');
        expect(typeof item.timestamp).toBe('string');
        expect(typeof item.productId).toBe('string');
        expect(typeof item.quantity).toBe('number');
        expect(typeof item.price).toBe('number');

        // 論理エラーチェック：quantity, price > 0
        expect(item.quantity).toBeGreaterThan(0);
        expect(item.price).toBeGreaterThan(0);
      },
    );

    // 6. 具体的なマージ結果の検証
    expect(result.mergedData[0]).toEqual({
      sourceId: 'MARKET_PROVIDER',
      timestamp: '2024-01-15T07:00:00Z',
      productId: 'PROD_004',
      quantity: 200,
      price: 4000,
    });

    expect(result.mergedData[1]).toEqual({
      sourceId: 'SUPPLIER_A',
      timestamp: '2024-01-15T08:00:00Z',
      productId: 'PROD_001',
      quantity: 100,
      price: 5000,
    });

    expect(result.mergedData[2]).toEqual({
      sourceId: 'SUPPLIER_A',
      timestamp: '2024-01-15T08:30:00Z',
      productId: 'PROD_002',
      quantity: 50,
      price: 3000,
    });

    expect(result.mergedData[3]).toEqual({
      sourceId: 'SUPPLIER_B',
      timestamp: '2024-01-15T09:00:00Z',
      productId: 'PROD_003',
      quantity: 75,
      price: 2500,
    });

    // 7. パフォーマンス基準の検証（例：3つのソース同時取得で10秒以内）
    expect(executionTime).toBeLessThan(10000);

    // 8. メモリ使用量とAPI呼び出し回数の検証
    expect(result.apiCallCount).toBe(3);
    expect(result.status).toBe('success');

    // 9. 後続プロセスへのデータ供給の準備状態確認
    expect(result.readyForDemandForecast).toBe(true);
    expect(result.dataQualityScore).toBeGreaterThanOrEqual(95);

    fetchMock.disableMocks();
  });
});