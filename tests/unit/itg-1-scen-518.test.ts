import { detectDashboardDataIntegrityError } from '../../src/logic/it-3';

describe('食事評価データを献立生成ロジックに反映させる機能', () => {
  // SCEN-518: [error] ダッシュボード自動更新機能 - 購入記録とダッシュボード集計結果に乖離がある場合、データ整合性エラーを検出する
  test('購入記録とダッシュボード集計結果の乖離を検出し、エラーメッセージとエラーログを記録する', () => {
    const purchase_record_ingredient_a = {
      ingredient_id: 'INGR-001',
      ingredient_name: '食材A',
      quantity: 10,
      unit_price: 100,
      total_amount: 1000,
      purchase_timestamp: new Date('2024-01-15T10:00:00Z'),
    };

    const dashboard_aggregation_result_ingredient_a = {
      ingredient_id: 'INGR-001',
      ingredient_name: '食材A',
      quantity: 8,
      total_amount: 800,
      last_updated: new Date('2024-01-15T09:30:00Z'),
    };

    const result = detectDashboardDataIntegrityError(
      purchase_record_ingredient_a,
      dashboard_aggregation_result_ingredient_a,
      new Date('2024-01-15T11:00:00Z')
    );

    expect(result.has_integrity_error).toBe(true);
    expect(result.error_message).toMatch(/データ整合性エラー/);
    expect(result.error_message).toMatch(/食材A/);
    expect(result.error_message).toMatch(/集計結果/);
    expect(result.error_message).toMatch(/購入記録/);
    expect(result.error_message).toMatch(/一致/);

    expect(result.quantity_discrepancy).toBe(2);
    expect(result.amount_discrepancy).toBe(200);

    expect(result.error_log).toBeDefined();
    expect(result.error_log.detection_timestamp).toEqual(
      new Date('2024-01-15T11:00:00Z')
    );
    expect(result.error_log.ingredient_id).toBe('INGR-001');
    expect(result.error_log.ingredient_name).toBe('食材A');
    expect(result.error_log.purchase_record_quantity).toBe(10);
    expect(result.error_log.purchase_record_amount).toBe(1000);
    expect(result.error_log.dashboard_quantity).toBe(8);
    expect(result.error_log.dashboard_amount).toBe(800);
    expect(result.error_log.difference_content).toEqual({
      quantity_diff: 2,
      amount_diff: 200,
    });
    expect(result.error_log.impact_scope).toMatch(/ダッシュボード/);

    expect(result.should_halt_dashboard_update).toBe(true);
    expect(result.admin_notification_required).toBe(true);
    expect(result.admin_notification_content).toBeDefined();
    expect(result.admin_notification_content).toMatch(/データ整合性エラー/);
    expect(result.admin_notification_content).toMatch(/食材A/);
    expect(result.admin_notification_content).toMatch(/2024-01-15T11:00:00Z/);
  });
});