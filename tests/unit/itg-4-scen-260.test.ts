import { extractUnifiedDemandForecastData } from '../../src/logic/it-2-br-6-3-2';

describe('需要予測データ統一フォーマット抽出機能', () => {
  // SCEN-260
  test('ユーザー購買実績と在庫変動データを統一フォーマットで抽出できる', async () => {
    // テストデータベースにユーザー購買実績データを10件登録
    const purchase_records = [
      { product_id: 'P001', purchase_datetime: '2024-01-15T10:00:00Z', quantity: 5, amount: 1500 },
      { product_id: 'P002', purchase_datetime: '2024-01-15T11:30:00Z', quantity: 3, amount: 900 },
      { product_id: 'P003', purchase_datetime: '2024-01-16T09:00:00Z', quantity: 2, amount: 800 },
      { product_id: 'P004', purchase_datetime: '2024-01-16T14:00:00Z', quantity: 4, amount: 1200 },
      { product_id: 'P005', purchase_datetime: '2024-01-17T08:30:00Z', quantity: 1, amount: 500 },
      { product_id: 'P006', purchase_datetime: '2024-01-17T15:00:00Z', quantity: 6, amount: 1800 },
      { product_id: 'P007', purchase_datetime: '2024-01-18T10:00:00Z', quantity: 3, amount: 1200 },
      { product_id: 'P008', purchase_datetime: '2024-01-18T16:00:00Z', quantity: 2, amount: 600 },
      { product_id: 'P009', purchase_datetime: '2024-01-19T09:30:00Z', quantity: 4, amount: 1600 },
      { product_id: 'P010', purchase_datetime: '2024-01-19T13:00:00Z', quantity: 5, amount: 2000 },
    ];

    // テストデータベースに在庫変動データを10件登録
    const inventory_changes = [
      { product_id: 'P001', change_datetime: '2024-01-15T10:15:00Z', quantity_before: 100, quantity_after: 95, change_reason: 'sale' },
      { product_id: 'P002', change_datetime: '2024-01-15T11:45:00Z', quantity_before: 80, quantity_after: 77, change_reason: 'sale' },
      { product_id: 'P003', change_datetime: '2024-01-16T09:15:00Z', quantity_before: 50, quantity_after: 48, change_reason: 'sale' },
      { product_id: 'P004', change_datetime: '2024-01-16T14:30:00Z', quantity_before: 120, quantity_after: 116, change_reason: 'sale' },
      { product_id: 'P005', change_datetime: '2024-01-17T08:45:00Z', quantity_before: 30, quantity_after: 29, change_reason: 'sale' },
      { product_id: 'P006', change_datetime: '2024-01-17T15:30:00Z', quantity_before: 75, quantity_after: 69, change_reason: 'sale' },
      { product_id: 'P007', change_datetime: '2024-01-18T10:30:00Z', quantity_before: 90, quantity_after: 87, change_reason: 'sale' },
      { product_id: 'P008', change_datetime: '2024-01-18T16:15:00Z', quantity_before: 60, quantity_after: 58, change_reason: 'sale' },
      { product_id: 'P009', change_datetime: '2024-01-19T09:45:00Z', quantity_before: 110, quantity_after: 106, change_reason: 'sale' },
      { product_id: 'P010', change_datetime: '2024-01-19T13:30:00Z', quantity_before: 140, quantity_after: 135, change_reason: 'sale' },
    ];

    // 需要予測データ統一フォーマット抽出機能を実行
    const extracted_data = await extractUnifiedDemandForecastData(purchase_records, inventory_changes);

    // 抽出されたデータが統一フォーマット（JSON形式）であることを確認
    expect(typeof extracted_data).toBe('object');
    expect(Array.isArray(extracted_data)).toBe(true);

    // 抽出データに必須フィールド（商品ID、日時、数量、データタイプ）が全て含まれていることを確認
    extracted_data.forEach((record: any) => {
      expect(record).toHaveProperty('product_id');
      expect(record).toHaveProperty('datetime');
      expect(record).toHaveProperty('quantity');
      expect(record).toHaveProperty('data_type');
    });

    // 購買実績データが正しくマッピングされていることをサンプル3件で検証
    const purchase_mapped = extracted_data.filter((r: any) => r.data_type === 'purchase');
    expect(purchase_mapped.length).toBeGreaterThanOrEqual(3);
    expect(purchase_mapped[0].product_id).toBe('P001');
    expect(purchase_mapped[0].datetime).toBe('2024-01-15T10:00:00Z');
    expect(purchase_mapped[0].quantity).toBe(5);
    expect(purchase_mapped[0].data_type).toBe('purchase');
    expect(purchase_mapped[1].product_id).toBe('P002');
    expect(purchase_mapped[1].quantity).toBe(3);
    expect(purchase_mapped[2].product_id).toBe('P003');
    expect(purchase_mapped[2].quantity).toBe(2);

    // 在庫変動データが正しくマッピングされていることをサンプル3件で検証
    const inventory_mapped = extracted_data.filter((r: any) => r.data_type === 'inventory');
    expect(inventory_mapped.length).toBeGreaterThanOrEqual(3);
    expect(inventory_mapped[0].product_id).toBe('P001');
    expect(inventory_mapped[0].datetime).toBe('2024-01-15T10:15:00Z');
    expect(inventory_mapped[0].quantity).toBe(95);
    expect(inventory_mapped[0].data_type).toBe('inventory');
    expect(inventory_mapped[1].product_id).toBe('P002');
    expect(inventory_mapped[1].quantity).toBe(77);
    expect(inventory_mapped[2].product_id).toBe('P003');
    expect(inventory_mapped[2].quantity).toBe(48);

    // 抽出データの日時がISO 8601形式であることを確認
    extracted_data.forEach((record: any) => {
      const iso_8601_regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
      expect(record.datetime).toMatch(iso_8601_regex);
    });

    // 抽出データの数量が数値型であることを確認
    extracted_data.forEach((record: any) => {
      expect(typeof record.quantity).toBe('number');
      expect(Number.isInteger(record.quantity)).toBe(true);
    });

    // 抽出データ件数が元データ件数（20件）と一致することを確認
    expect(extracted_data.length).toBe(20);
    expect(purchase_mapped.length).toBe(10);
    expect(inventory_mapped.length).toBe(10);
  });
});