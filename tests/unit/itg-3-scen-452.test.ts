import { fetchActualInventoryAndSalesData } from '../../src/logic/it-1-br-6-2-1-1';

const fetchMock = require('jest-fetch-mock');

describe('食材流通業者・スーパーの在庫・価格データ連携インターフェース', () => {
  // SCEN-452: [normal] 実績データ取得・データセット構成機能
  test('指定期間・カテゴリ・店舗単位でスーパー・流通業者の在庫変動・売上実績が正常に取得される', async () => {
    fetchMock.enableMocks();
    fetchMock.resetMocks();

    // テストデータ: 期間条件
    const period_1_start = '2024-01-01';
    const period_1_end = '2024-01-31';
    const period_2_start = '2024-02-01';
    const period_2_end = '2024-02-29';

    // テストデータ: カテゴリ
    const category_vegetables = '野菜';
    const category_fruits = '果物';
    const category_meat = '肉類';
    const category_dairy = '乳製品';

    // テストデータ: 店舗
    const store_a = 'スーパーA';
    const store_b = 'スーパーB';
    const distributor_c = '流通業者C';

    // 期間1（1月）、野菜、スーパーAの在庫変動データ
    const inventory_change_jan_veg_a = {
      period_start: period_1_start,
      period_end: period_1_end,
      category: category_vegetables,
      store_name: store_a,
      initial_stock: 1000,
      inbound_quantity: 500,
      outbound_quantity: 600,
      current_stock: 900,
    };

    // 期間1（1月）、野菜、スーパーAの売上実績データ
    const sales_jan_veg_a = {
      period_start: period_1_start,
      period_end: period_1_end,
      category: category_vegetables,
      store_name: store_a,
      sales_quantity: 600,
      sales_amount: 3600,
      transaction_date: '2024-01-15',
    };

    // 期間1（1月）、野菜、スーパーBの在庫変動データ
    const inventory_change_jan_veg_b = {
      period_start: period_1_start,
      period_end: period_1_end,
      category: category_vegetables,
      store_name: store_b,
      initial_stock: 800,
      inbound_quantity: 400,
      outbound_quantity: 450,
      current_stock: 750,
    };

    // 期間1（1月）、野菜、スーパーBの売上実績データ
    const sales_jan_veg_b = {
      period_start: period_1_start,
      period_end: period_1_end,
      category: category_vegetables,
      store_name: store_b,
      sales_quantity: 450,
      sales_amount: 2250,
      transaction_date: '2024-01-16',
    };

    // 期間1（1月）、肉類、流通業者Cの在庫変動データ
    const inventory_change_jan_meat_c = {
      period_start: period_1_start,
      period_end: period_1_end,
      category: category_meat,
      store_name: distributor_c,
      initial_stock: 2000,
      inbound_quantity: 800,
      outbound_quantity: 1200,
      current_stock: 1600,
    };

    // 期間1（1月）、肉類、流通業者Cの売上実績データ
    const sales_jan_meat_c = {
      period_start: period_1_start,
      period_end: period_1_end,
      category: category_meat,
      store_name: distributor_c,
      sales_quantity: 1200,
      sales_amount: 7200,
      transaction_date: '2024-01-20',
    };

    // 期間2（2月）、乳製品、スーパーAの在庫変動データ
    const inventory_change_feb_dairy_a = {
      period_start: period_2_start,
      period_end: period_2_end,
      category: category_dairy,
      store_name: store_a,
      initial_stock: 500,
      inbound_quantity: 300,
      outbound_quantity: 250,
      current_stock: 550,
    };

    // 期間2（2月）、乳製品、スーパーAの売上実績データ
    const sales_feb_dairy_a = {
      period_start: period_2_start,
      period_end: period_2_end,
      category: category_dairy,
      store_name: store_a,
      sales_quantity: 250,
      sales_amount: 1250,
      transaction_date: '2024-02-10',
    };

    // 期間2（2月）、果物、スーパーBの在庫変動データ
    const inventory_change_feb_fruit_b = {
      period_start: period_2_start,
      period_end: period_2_end,
      category: category_fruits,
      store_name: store_b,
      initial_stock: 600,
      inbound_quantity: 350,
      outbound_quantity: 400,
      current_stock: 550,
    };

    // 期間2（2月）、果物、スーパーBの売上実績データ
    const sales_feb_fruit_b = {
      period_start: period_2_start,
      period_end: period_2_end,
      category: category_fruits,
      store_name: store_b,
      sales_quantity: 400,
      sales_amount: 2000,
      transaction_date: '2024-02-14',
    };

    // API レスポンスデータセット
    const mock_inventory_response = [
      inventory_change_jan_veg_a,
      inventory_change_jan_veg_b,
      inventory_change_jan_meat_c,
      inventory_change_feb_dairy_a,
      inventory_change_feb_fruit_b,
    ];

    const mock_sales_response = [
      sales_jan_veg_a,
      sales_jan_veg_b,
      sales_jan_meat_c,
      sales_feb_dairy_a,
      sales_feb_fruit_b,
    ];

    // Mock レスポンス: 在庫変動データ API
    fetchMock.mockResponseOnce(JSON.stringify(mock_inventory_response), {
      status: 200,
    });

    // Mock レスポンス: 売上実績データ API
    fetchMock.mockResponseOnce(JSON.stringify(mock_sales_response), {
      status: 200,
    });

    // 実績データ取得関数を呼び出し: 期間1（1月）、野菜カテゴリ、スーパーA
    const result_period1_veg_a = await fetchActualInventoryAndSalesData({
      period_start: period_1_start,
      period_end: period_1_end,
      category: category_vegetables,
      store_name: store_a,
    });

    // 期待値: 期間1、野菜、スーパーAのデータのみが取得されること
    expect(result_period1_veg_a).toEqual({
      inventory: [inventory_change_jan_veg_a],
      sales: [sales_jan_veg_a],
      dataset_summary: {
        total_inventory_records: 1,
        total_sales_records: 1,
        period_start: period_1_start,
        period_end: period_1_end,
        category: category_vegetables,
        store_name: store_a,
        total_inbound: 500,
        total_outbound: 600,
        total_sales_quantity: 600,
        total_sales_amount: 3600,
      },
    });

    // Mock リセット
    fetchMock.resetMocks();

    // Mock レスポンス: 期間2（2月）、乳製品、スーパーA
    fetchMock.mockResponseOnce(JSON.stringify(mock_inventory_response), {
      status: 200,
    });
    fetchMock.mockResponseOnce(JSON.stringify(mock_sales_response), {
      status: 200,
    });

    // 期間2（2月）、乳製品、スーパーAの実績データを取得
    const result_period2_dairy_a = await fetchActualInventoryAndSalesData({
      period_start: period_2_start,
      period_end: period_2_end,
      category: category_dairy,
      store_name: store_a,
    });

    // 期待値: 期間2、乳製品、スーパーAのデータのみが取得されること
    expect(result_period2_dairy_a).toEqual({
      inventory: [inventory_change_feb_dairy_a],
      sales: [sales_feb_dairy_a],
      dataset_summary: {
        total_inventory_records: 1,
        total_sales_records: 1,
        period_start: period_2_start,
        period_end: period_2_end,
        category: category_dairy,
        store_name: store_a,
        total_inbound: 300,
        total_outbound: 250,
        total_sales_quantity: 250,
        total_sales_amount: 1250,
      },
    });

    // Mock リセット
    fetchMock.resetMocks();

    // Mock レスポンス: 肉類、流通業者C
    fetchMock.mockResponseOnce(JSON.stringify(mock_inventory_response), {
      status: 200,
    });
    fetchMock.mockResponseOnce(JSON.stringify(mock_sales_response), {
      status: 200,
    });

    // 期間1（1月）、肉類、流通業者Cの実績データを取得
    const result_period1_meat_c = await fetchActualInventoryAndSalesData({
      period_start: period_1_start,
      period_end: period_1_end,
      category: category_meat,
      store_name: distributor_c,
    });

    // 期待値: 期間1、肉類、流通業者Cのデータのみが取得されること
    expect(result_period1_meat_c).toEqual({
      inventory: [inventory_change_jan_meat_c],
      sales: [sales_jan_meat_c],
      dataset_summary: {
        total_inventory_records: 1,
        total_sales_records: 1,
        period_start: period_1_start,
        period_end: period_1_end,
        category: category_meat,
        store_name: distributor_c,
        total_inbound: 800,
        total_outbound: 1200,
        total_sales_quantity: 1200,
        total_sales_amount: 7200,
      },
    });

    // Mock リセット
    fetchMock.resetMocks();

    // Mock レスポンス: 複数店舗・複数カテゴリのデータ取得テスト（スーパーB全カテゴリ、期間1）
    fetchMock.mockResponseOnce(JSON.stringify(mock_inventory_response), {
      status: 200,
    });
    fetchMock.mockResponseOnce(JSON.stringify(mock_sales_response), {
      status: 200,
    });

    // スーパーB、期間1（1月）の実績データを取得
    const result_period1_all_cat_b = await fetchActualInventoryAndSalesData({
      period_start: period_1_start,
      period_end: period_1_end,
      category: null,
      store_name: store_b,
    });

    // 期待値: 期間1、スーパーBのすべてのカテゴリデータが取得されること
    const inventory_period1_b = [inventory_change_jan_veg_b];
    const sales_period1_b = [sales_jan_veg_b];
    expect(result_period1_all_cat_b.inventory).toEqual(inventory_period1_b);
    expect(result_period1_all_cat_b.sales).toEqual(sales_period1_b);
    expect(result_period1_all_cat_b.dataset_summary.total_inbound).toBe(400);
    expect(result_period1_all_cat_b.dataset_summary.total_outbound).toBe(450);
    expect(result_period1_all_cat_b.dataset_summary.total_sales_quantity).toBe(450);
    expect(result_period1_all_cat_b.dataset_summary.total_sales_amount).toBe(2250);

    // Mock リセット
    fetchMock.resetMocks();

    // Mock レスポンス: 在庫変動データと売上実績データの紐付けテスト
    fetchMock.mockResponseOnce(JSON.stringify(mock_inventory_response), {
      status: 200,
    });
    fetchMock.mockResponseOnce(JSON.stringify(mock_sales_response), {
      status: 200,
    });

    const result_linkage_test = await fetchActualInventoryAndSalesData({
      period_start: period_1_start,
      period_end: period_1_end,
      category: category_vegetables,
      store_name: store_a,
    });

    // 期待値: 在庫変動データと売上実績データが同じ期間・カテゴリ・店舗で正しく紐付けられていることを検証
    expect(result_linkage_test.inventory.length).toBe(1);
    expect(result_linkage_test.sales.length).toBe(1);
    expect(result_linkage_test.inventory[0].period_start).toBe(
      result_linkage_test.sales[0].period_start
    );
    expect(result_linkage_test.inventory[0].period_end).toBe(
      result_linkage_test.sales[0].period_end
    );
    expect(result_linkage_test.inventory[0].category).toBe(
      result_linkage_test.sales[0].category
    );
    expect(result_linkage_test.inventory[0].store_name).toBe(
      result_linkage_test.sales[0].store_name
    );

    // Mock リセット
    fetchMock.resetMocks();

    // Mock レスポンス: 計算値の精度テスト（複数レコード集計）
    fetchMock.mockResponseOnce(JSON.stringify(mock_inventory_response), {
      status: 200,
    });
    fetchMock.mockResponseOnce(JSON.stringify(mock_sales_response), {
      status: 200,
    });

    // 期間1（1月）、野菜、全店舗のデータを取得
    const result_aggregation = await fetchActualInventoryAndSalesData({
      period_start: period_1_start,
      period_end: period_1_end,
      category: category_vegetables,
      store_name: null,
    });

    // 期待値: 複数店舗のデータが正しく集計されていること
    expect(result_aggregation.inventory).toEqual([
      inventory_change_jan_veg_a,
      inventory_change_jan_veg_b,
    ]);
    expect(result_aggregation.sales).toEqual([sales_jan_veg_a, sales_jan_veg_b]);

    // 合計値の検証: inbound (500 + 400 = 900)
    expect(result_aggregation.dataset_summary.total_inbound).toBe(900);
    // 合計値の検証: outbound (600 + 450 = 1050)
    expect(result_aggregation.dataset_summary.total_outbound).toBe(1050);
    // 合計値の検証: sales_quantity (600 + 450 = 1050)
    expect(result_aggregation.dataset_summary.total_sales_quantity).toBe(1050);
    // 合計値の検証: sales_amount (3600 + 2250 = 5850)
    expect(result_aggregation.dataset_summary.total_sales_amount).toBe(5850);

    // Mock リセット
    fetchMock.resetMocks();

    // Mock レスポンス: 期間による絞り込みテスト
    fetchMock.mockResponseOnce(JSON.stringify(mock_inventory_response), {
      status: 200,
    });
    fetchMock.mockResponseOnce(JSON.stringify(mock_sales_response), {
      status: 200,
    });

    // 期間2（2月）のデータを取得
    const result_period2_filter = await fetchActualInventoryAndSalesData({
      period_start: period_2_start,
      period_end: period_2_end,
      category: null,
      store_name: null,
    });

    // 期待値: 期間2のデータのみが取得されること
    const expected_inventory_period2 = [
      inventory_change_feb_dairy_a,
      inventory_change_feb_fruit_b,
    ];
    const expected_sales_period2 = [sales_feb_dairy_a, sales_feb_fruit_b];

    expect(result_period2_filter.inventory).toEqual(expected_inventory_period2);
    expect(result_period2_filter.sales).toEqual(expected_sales_period2);
    expect(result_period2_filter.dataset_summary.period_start).toBe(period_2_start);
    expect(result_period2_filter.dataset_summary.period_end).toBe(period_2_end);
  });
});