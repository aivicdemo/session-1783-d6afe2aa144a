import { aggregateMonthlyCost } from '../../src/logic/it-1-br-2-1-1-1';

describe('月次食費実績と栄養摂取状況の分析・家計方針調整 - 月次食費集計', () => {
  // SCEN-390: [error] 月次食費集計機能 - 購入記録が存在しない場合にエラーハンドリングされる
  test('購入記録が存在しない月度を指定した場合、適切なエラーメッセージが表示される', () => {
    const user_id = 'user_001';
    const year_month = '2024-01';
    const purchase_records: Array<{
      id: string;
      user_id: string;
      purchase_date: string;
      amount: number;
      food_item_id: string;
      quantity: number;
      unit_price: number;
    }> = [];

    expect(() =>
      aggregateMonthlyCost({
        user_id,
        year_month,
        purchase_records,
      })
    ).toThrow(/購入記録/);
  });

  test('購入記録が存在する月度を指定した場合、月次集計が正常に完了する', () => {
    const user_id = 'user_001';
    const year_month = '2024-01';
    const purchase_records = [
      {
        id: 'purchase_001',
        user_id: 'user_001',
        purchase_date: '2024-01-05',
        amount: 1500,
        food_item_id: 'item_001',
        quantity: 2,
        unit_price: 750,
      },
      {
        id: 'purchase_002',
        user_id: 'user_001',
        purchase_date: '2024-01-12',
        amount: 2000,
        food_item_id: 'item_002',
        quantity: 1,
        unit_price: 2000,
      },
      {
        id: 'purchase_003',
        user_id: 'user_001',
        purchase_date: '2024-01-20',
        amount: 3000,
        food_item_id: 'item_003',
        quantity: 3,
        unit_price: 1000,
      },
    ];

    const result = aggregateMonthlyCost({
      user_id,
      year_month,
      purchase_records,
    });

    expect(result).toEqual({
      user_id: 'user_001',
      year_month: '2024-01',
      total_amount: 6500,
      purchase_count: 3,
      average_purchase_amount: 2167,
      max_purchase_amount: 3000,
      min_purchase_amount: 1500,
      aggregated_at: expect.any(String),
    });
  });

  test('複数のユーザーの購入記録を混在させた場合、指定ユーザーのデータのみが集計される', () => {
    const user_id = 'user_001';
    const year_month = '2024-01';
    const purchase_records = [
      {
        id: 'purchase_001',
        user_id: 'user_001',
        purchase_date: '2024-01-05',
        amount: 1000,
        food_item_id: 'item_001',
        quantity: 1,
        unit_price: 1000,
      },
      {
        id: 'purchase_002',
        user_id: 'user_002',
        purchase_date: '2024-01-10',
        amount: 2000,
        food_item_id: 'item_002',
        quantity: 1,
        unit_price: 2000,
      },
      {
        id: 'purchase_003',
        user_id: 'user_001',
        purchase_date: '2024-01-15',
        amount: 1500,
        food_item_id: 'item_003',
        quantity: 1,
        unit_price: 1500,
      },
    ];

    const result = aggregateMonthlyCost({
      user_id,
      year_month,
      purchase_records,
    });

    expect(result.total_amount).toBe(2500);
    expect(result.purchase_count).toBe(2);
  });

  test('指定月と異なる月の購入記録が混在する場合、該当月のデータのみが集計される', () => {
    const user_id = 'user_001';
    const year_month = '2024-01';
    const purchase_records = [
      {
        id: 'purchase_001',
        user_id: 'user_001',
        purchase_date: '2024-01-05',
        amount: 1000,
        food_item_id: 'item_001',
        quantity: 1,
        unit_price: 1000,
      },
      {
        id: 'purchase_002',
        user_id: 'user_001',
        purchase_date: '2024-02-10',
        amount: 2000,
        food_item_id: 'item_002',
        quantity: 1,
        unit_price: 2000,
      },
      {
        id: 'purchase_003',
        user_id: 'user_001',
        purchase_date: '2024-01-20',
        amount: 1500,
        food_item_id: 'item_003',
        quantity: 1,
        unit_price: 1500,
      },
    ];

    const result = aggregateMonthlyCost({
      user_id,
      year_month,
      purchase_records,
    });

    expect(result.total_amount).toBe(2500);
    expect(result.purchase_count).toBe(2);
  });
});