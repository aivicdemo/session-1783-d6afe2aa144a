import { approvePurchaseListAndLinkToExpenseSystem } from '../../src/logic/it-1-br-6-2-1';

describe('需要予測精度検証ダッシュボード：予測値と実績値の照合・乖離分析機能', () => {
  // SCEN-226: [normal] 買い物リスト承認却下判定機能 - 買い物リストが承認された場合、食費管理システムへの連携が指示される
  test('買い物リストが承認された場合、食費管理システムへの連携指示が正常に発行され、買い物リストの内容が正確に送信されること', () => {
    const purchase_list_id = 'pl_001';
    const status = 'approved';
    const items = [
      {
        item_id: 'item_001',
        item_name: 'トマト',
        quantity: 3,
        unit_price: 150,
        total_price: 450,
      },
      {
        item_id: 'item_002',
        item_name: '玉ねぎ',
        quantity: 2,
        unit_price: 120,
        total_price: 240,
      },
      {
        item_id: 'item_003',
        item_name: '鶏肉',
        quantity: 1,
        unit_price: 800,
        total_price: 800,
      },
    ];
    const budget_limit = 2000;
    const total_amount = 1490;
    const user_id = 'user_123';
    const approval_date = new Date('2024-01-15T10:30:00Z');

    const result = approvePurchaseListAndLinkToExpenseSystem({
      purchase_list_id,
      status,
      items,
      budget_limit,
      total_amount,
      user_id,
      approval_date,
    });

    // 連携指示が発行されたことを確認
    expect(result.is_linked).toBe(true);

    // 連携指示に含まれるデータが正確であることを確認
    expect(result.linked_purchase_list_id).toBe('pl_001');
    expect(result.linked_user_id).toBe('user_123');
    expect(result.linked_total_amount).toBe(1490);
    expect(result.linked_budget_limit).toBe(2000);

    // 連携指示に含まれる商品情報が正確に転送されていることを確認
    expect(result.linked_items).toHaveLength(3);
    expect(result.linked_items[0]).toEqual({
      item_id: 'item_001',
      item_name: 'トマト',
      quantity: 3,
      unit_price: 150,
      total_price: 450,
    });
    expect(result.linked_items[1]).toEqual({
      item_id: 'item_002',
      item_name: '玉ねぎ',
      quantity: 2,
      unit_price: 120,
      total_price: 240,
    });
    expect(result.linked_items[2]).toEqual({
      item_id: 'item_003',
      item_name: '鶏肉',
      quantity: 1,
      unit_price: 800,
      total_price: 800,
    });

    // 食費管理システム側でのデータ受信ログが記録されたことを確認
    expect(result.expense_system_log).toBeDefined();
    expect(result.expense_system_log.linked_at).toBeDefined();
    expect(result.expense_system_log.status_code).toBe(200);
    expect(result.expense_system_log.message).toMatch(/連携成功/);

    // 連携ステータスが確定状態であることを確認
    expect(result.link_status).toBe('completed');
  });
});