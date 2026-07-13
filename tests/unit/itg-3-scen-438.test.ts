import { filterAnomalousExpenseData } from '../../src/logic/it-1-br-3-2-1';

describe('購入実績の記録と月次食費削減効果の自動集計・分析機能', () => {
  // SCEN-438
  test('異常値・欠損値の自動フィルタリング - 異常値・欠損値が検出された場合、フィルタリング結果と隔離されたデータがログに正確に記録される', () => {
    const test_timestamp = '2024-01-15T11:00:00Z';
    const test_data = [
      {
        expense_id: 'EXP001',
        user_id: 'USR001',
        purchase_date: '2024-01-15',
        amount: 1500,
        category: '野菜',
        item_name: 'トマト',
      },
      {
        expense_id: 'EXP002',
        user_id: 'USR001',
        purchase_date: '2024-01-15',
        amount: 2300,
        category: '肉',
        item_name: '牛肉',
      },
      {
        expense_id: 'EXP003',
        user_id: 'USR001',
        purchase_date: '2024-01-15',
        amount: -500,
        category: '魚',
        item_name: 'サーモン',
      },
      {
        expense_id: 'EXP004',
        user_id: 'USR001',
        purchase_date: '2024-01-15',
        amount: null,
        category: '卵',
        item_name: '卵',
      },
      {
        expense_id: 'EXP005',
        user_id: 'USR001',
        purchase_date: '2024-01-15',
        amount: 999999999,
        category: '乳製品',
        item_name: 'チーズ',
      },
      {
        expense_id: 'EXP006',
        user_id: 'USR001',
        purchase_date: '2024-01-15',
        amount: undefined,
        category: 'パン',
        item_name: 'パン',
      },
      {
        expense_id: 'EXP007',
        user_id: 'USR001',
        purchase_date: '2024-01-15',
        amount: 0,
        category: '飲料',
        item_name: 'オレンジジュース',
      },
      {
        expense_id: 'EXP008',
        user_id: 'USR001',
        purchase_date: '2024-01-15',
        amount: 1800,
        category: 'お菓子',
        item_name: 'クッキー',
      },
    ];

    const result = filterAnomalousExpenseData({
      expenses: test_data,
      execution_timestamp: test_timestamp,
      negative_amount_threshold: 0,
      max_amount_threshold: 100000,
    });

    expect(result.filtering_executed_at).toBe(test_timestamp);
    expect(result.total_input_records).toBe(8);
    expect(result.normal_records_count).toBe(4);
    expect(result.isolated_records_count).toBe(4);
    expect(result.filtering_rate).toBe(50);

    expect(result.normal_data).toEqual([
      {
        expense_id: 'EXP001',
        user_id: 'USR001',
        purchase_date: '2024-01-15',
        amount: 1500,
        category: '野菜',
        item_name: 'トマト',
      },
      {
        expense_id: 'EXP002',
        user_id: 'USR001',
        purchase_date: '2024-01-15',
        amount: 2300,
        category: '肉',
        item_name: '牛肉',
      },
      {
        expense_id: 'EXP008',
        user_id: 'USR001',
        purchase_date: '2024-01-15',
        amount: 1800,
        category: 'お菓子',
        item_name: 'クッキー',
      },
      {
        expense_id: 'EXP007',
        user_id: 'USR001',
        purchase_date: '2024-01-15',
        amount: 0,
        category: '飲料',
        item_name: 'オレンジジュース',
      },
    ]);

    expect(result.isolated_data.length).toBe(4);

    const isolated_by_id = result.isolated_data.reduce(
      (acc: Record<string, any>, rec: any) => {
        acc[rec.expense_id] = rec;
        return acc;
      },
      {}
    );

    expect(isolated_by_id['EXP003']).toEqual({
      expense_id: 'EXP003',
      user_id: 'USR001',
      purchase_date: '2024-01-15',
      amount: -500,
      category: '魚',
      item_name: 'サーモン',
      anomaly_reason: '負の金額',
      anomaly_value: -500,
    });

    expect(isolated_by_id['EXP004']).toEqual({
      expense_id: 'EXP004',
      user_id: 'USR001',
      purchase_date: '2024-01-15',
      amount: null,
      category: '卵',
      item_name: '卵',
      anomaly_reason: 'null値',
      anomaly_value: null,
    });

    expect(isolated_by_id['EXP005']).toEqual({
      expense_id: 'EXP005',
      user_id: 'USR001',
      purchase_date: '2024-01-15',
      amount: 999999999,
      category: '乳製品',
      item_name: 'チーズ',
      anomaly_reason: '極端に大きい金額',
      anomaly_value: 999999999,
    });

    expect(isolated_by_id['EXP006']).toEqual({
      expense_id: 'EXP006',
      user_id: 'USR001',
      purchase_date: '2024-01-15',
      amount: undefined,
      category: 'パン',
      item_name: 'パン',
      anomaly_reason: 'undefined値',
      anomaly_value: undefined,
    });

    expect(result.summary_log).toEqual({
      filtering_timestamp: test_timestamp,
      total_input_count: 8,
      normal_count: 4,
      isolated_count: 4,
      filtering_percentage: 50,
      status: 'completed',
      has_duplicates: false,
      has_missing_records: false,
    });

    expect(result.separation_integrity).toBe(true);
    expect(result.log_completeness).toBe(true);
  });
});