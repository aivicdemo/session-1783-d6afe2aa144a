import { generateShoppingList } from '../../src/logic/it-1-br-3-2-1';

describe('購入実績の記録と月次食費削減効果の自動集計・分析機能', () => {
  // SCEN-442: [normal] SLA超過時の遅延対応と暫定処理
  test('買い物リスト生成SLA超過時、遅延ログ記録と暫定栄養検証が自動実行される', async () => {
    const user_id = 'user_001';
    const family_member_id = 'member_001';
    const sla_seconds = 5;
    const elapsed_seconds = 8;
    const trace_id = 'trace_20240115_001';

    const user_profile = {
      user_id,
      age: 35,
      gender: 'M',
      activity_level: 1.5,
    };

    const nutrition_target = {
      calorie_daily: 2000,
      protein_g: 50,
      fat_g: 65,
      carbohydrate_g: 280,
    };

    const monthly_budget_yen = 50000;

    const shopping_list_request = {
      user_id,
      family_member_id,
      trace_id,
      sla_seconds,
      user_profile,
      nutrition_target,
      monthly_budget_yen,
      items_count: 20,
    };

    const mock_start_time = new Date('2024-01-15T10:00:00Z');
    const mock_sla_exceeded_time = new Date(
      mock_start_time.getTime() + elapsed_seconds * 1000
    );

    const result = await generateShoppingList(shopping_list_request, {
      start_time: mock_start_time,
      current_time: mock_sla_exceeded_time,
    });

    // (1) 遅延ログにはタイムスタンプ、超過時間、トレースIDが記録される
    expect(result.delay_log).toBeDefined();
    expect(result.delay_log.timestamp).toBe('2024-01-15T10:00:08Z');
    expect(result.delay_log.exceeded_seconds).toBe(3);
    expect(result.delay_log.trace_id).toBe(trace_id);
    expect(result.delay_log.user_id).toBe(user_id);

    // (2) 暫定的な栄養バランス検証が自動実行され、最小限の栄養要件充足状況が検証される
    expect(result.provisional_validation).toBeDefined();
    expect(result.provisional_validation.is_provisional).toBe(true);
    expect(result.provisional_validation.calorie_fulfillment_percent).toBeGreaterThanOrEqual(
      0
    );
    expect(result.provisional_validation.calorie_fulfillment_percent).toBeLessThanOrEqual(100);
    expect(result.provisional_validation.protein_fulfillment_percent).toBeGreaterThanOrEqual(0);
    expect(result.provisional_validation.protein_fulfillment_percent).toBeLessThanOrEqual(100);
    expect(result.provisional_validation.fat_fulfillment_percent).toBeGreaterThanOrEqual(0);
    expect(result.provisional_validation.fat_fulfillment_percent).toBeLessThanOrEqual(100);
    expect(result.provisional_validation.carbohydrate_fulfillment_percent).toBeGreaterThanOrEqual(
      0
    );
    expect(result.provisional_validation.carbohydrate_fulfillment_percent).toBeLessThanOrEqual(
      100
    );
    expect(result.provisional_validation.validation_method).toBe('provisional');

    // (3) ユーザーには暫定的な買い物リストと栄養検証結果が返却され、完全処理の状態を示すフラグまたはステータスが付与される
    expect(result.shopping_list).toBeDefined();
    expect(Array.isArray(result.shopping_list.items)).toBe(true);
    expect(result.shopping_list.items.length).toBeGreaterThan(0);
    expect(result.shopping_list.status).toBe('provisional');
    expect(result.shopping_list.is_complete).toBe(false);
    expect(result.shopping_list.completion_flag).toBe('incomplete_sla_exceeded');
    expect(result.shopping_list.trace_id).toBe(trace_id);

    // 各買い物リストアイテムに必要な属性が存在することを確認
    result.shopping_list.items.forEach((item: any) => {
      expect(item.item_id).toBeDefined();
      expect(item.item_name).toBeDefined();
      expect(item.quantity).toBeGreaterThan(0);
      expect(item.unit_price_yen).toBeGreaterThan(0);
      expect(item.category).toBeDefined();
    });

    // 全体の総金額が月次予算以内であることを確認
    const total_cost_yen = result.shopping_list.items.reduce(
      (sum: number, item: any) => sum + item.quantity * item.unit_price_yen,
      0
    );
    expect(total_cost_yen).toBeLessThanOrEqual(monthly_budget_yen);

    // 暫定検証結果の総合スコアが計算されていることを確認
    expect(result.provisional_validation.overall_fulfillment_percent).toBeGreaterThanOrEqual(0);
    expect(result.provisional_validation.overall_fulfillment_percent).toBeLessThanOrEqual(100);

    // 遅延ログ記録のタイムスタンプが正確であることを確認
    const delay_log_timestamp = new Date(result.delay_log.timestamp);
    expect(delay_log_timestamp.getTime()).toBe(mock_sla_exceeded_time.getTime());
  });
});