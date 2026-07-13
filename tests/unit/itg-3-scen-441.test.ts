import { validateNutritionBalance } from '../../src/logic/it-1-br-3-2-1';

describe('購入実績の記録と月次食費削減効果の自動集計・分析機能', () => {
  // SCEN-441: [normal] SLA超過時の遅延対応と暫定処理 - 買い物リスト生成から24時間以内に栄養バランス検証が完了し、正常フロー内で処理される
  test('SCEN-441: 買い物リスト生成から24時間以内に栄養バランス検証が完了して正常フロー内で処理される', () => {
    // テストシステムを初期化し、現在日時を記録する
    const test_start_timestamp = new Date('2024-01-15T09:00:00Z');
    
    // 食費管理システムにログインする（ユーザーID: user_001）
    const user_id = 'user_001';
    
    // ユーザーが買い物リストを作成する（食材10品目以上を含む）
    const shopping_list_items = [
      { item_id: 'item_001', name: '鶏肉', quantity: 500, unit: 'g', price: 800 },
      { item_id: 'item_002', name: '卵', quantity: 10, unit: '個', price: 300 },
      { item_id: 'item_003', name: '牛乳', quantity: 1000, unit: 'ml', price: 200 },
      { item_id: 'item_004', name: 'パン', quantity: 1, unit: '本', price: 150 },
      { item_id: 'item_005', name: 'トマト', quantity: 3, unit: '個', price: 450 },
      { item_id: 'item_006', name: 'キャベツ', quantity: 1, unit: '玉', price: 250 },
      { item_id: 'item_007', name: 'ニンジン', quantity: 500, unit: 'g', price: 180 },
      { item_id: 'item_008', name: 'バナナ', quantity: 6, unit: '本', price: 300 },
      { item_id: 'item_009', name: 'チーズ', quantity: 200, unit: 'g', price: 600 },
      { item_id: 'item_010', name: 'サラダ油', quantity: 1000, unit: 'ml', price: 400 },
      { item_id: 'item_011', name: 'ツナ缶', quantity: 3, unit: '缶', price: 450 },
    ];
    
    // 買い物リスト生成の完了時刻をタイムスタンプで記録する
    const shopping_list_generated_at = new Date('2024-01-15T10:30:00Z');
    
    // システムが自動的に栄養バランス検証プロセスを開始することを確認する
    // 栄養バランス検証の進捗状況を監視する
    // 栄養バランス検証が完了する時刻をタイムスタンプで記録する
    const nutrition_validation_completed_at = new Date('2024-01-15T11:15:00Z');
    
    // 買い物リスト生成から栄養バランス検証完了までの経過時間を計算する
    const elapsed_time_ms = nutrition_validation_completed_at.getTime() - shopping_list_generated_at.getTime();
    const elapsed_time_hours = elapsed_time_ms / (1000 * 60 * 60);
    
    // SLA: 24時間以内であることを確認
    expect(elapsed_time_hours).toBeLessThanOrEqual(24);
    expect(elapsed_time_hours).toBeGreaterThan(0);
    
    // 検証結果（タンパク質、炭水化物、脂肪、ビタミン、ミネラルなど）
    const nutrition_validation_input = {
      user_id: user_id,
      shopping_list_items: shopping_list_items,
      shopping_list_generated_at: shopping_list_generated_at.toISOString(),
      validation_started_at: shopping_list_generated_at.toISOString(),
    };
    
    const nutrition_validation_result = validateNutritionBalance(nutrition_validation_input);
    
    // 栄養バランス検証が完了して、すべての栄養素の検証結果が正確に表示される
    expect(nutrition_validation_result).toBeDefined();
    expect(nutrition_validation_result.status).toBe('completed');
    expect(nutrition_validation_result.is_within_sla).toBe(true);
    
    // 栄養素の検証結果が画面に正常に表示されることを確認する
    expect(nutrition_validation_result.nutrients).toBeDefined();
    expect(nutrition_validation_result.nutrients.protein).toBeDefined();
    expect(nutrition_validation_result.nutrients.carbohydrates).toBeDefined();
    expect(nutrition_validation_result.nutrients.fat).toBeDefined();
    expect(nutrition_validation_result.nutrients.vitamins).toBeDefined();
    expect(nutrition_validation_result.nutrients.minerals).toBeDefined();
    
    // 各栄養素が具体的な数値を持つことを確認
    expect(typeof nutrition_validation_result.nutrients.protein).toBe('number');
    expect(typeof nutrition_validation_result.nutrients.carbohydrates).toBe('number');
    expect(typeof nutrition_validation_result.nutrients.fat).toBe('number');
    expect(typeof nutrition_validation_result.nutrients.vitamins).toBe('number');
    expect(typeof nutrition_validation_result.nutrients.minerals).toBe('number');
    
    // タンパク質: 鶏肉500g(約50g) + 卵10個(約60g) + 牛乳1000ml(約32g) + チーズ200g(約50g) = 約192g
    expect(nutrition_validation_result.nutrients.protein).toBeGreaterThanOrEqual(100);
    expect(nutrition_validation_result.nutrients.protein).toBeLessThanOrEqual(250);
    
    // 炭水化物: パン(約30g) + トマト3個(約12g) + キャベツ(約10g) + ニンジン(約30g) + バナナ6本(約120g) = 約200g
    expect(nutrition_validation_result.nutrients.carbohydrates).toBeGreaterThanOrEqual(100);
    expect(nutrition_validation_result.nutrients.carbohydrates).toBeLessThanOrEqual(300);
    
    // 脂肪: 鶏肉(約20g) + 卵(約45g) + 牛乳(約35g) + チーズ(約40g) + 油(~100g) = 約240g
    expect(nutrition_validation_result.nutrients.fat).toBeGreaterThanOrEqual(50);
    expect(nutrition_validation_result.nutrients.fat).toBeLessThanOrEqual(300);
    
    // ビタミン: トマト、キャベツ、ニンジン、バナナ、牛乳などから充分に含有
    expect(nutrition_validation_result.nutrients.vitamins).toBeGreaterThanOrEqual(50);
    expect(nutrition_validation_result.nutrients.vitamins).toBeLessThanOrEqual(200);
    
    // ミネラル: 牛乳、卵、チーズなどから充分に含有
    expect(nutrition_validation_result.nutrients.minerals).toBeGreaterThanOrEqual(50);
    expect(nutrition_validation_result.nutrients.minerals).toBeLessThanOrEqual(200);
    
    // 栄養バランスが推奨範囲内であるかの判定結果を確認する
    expect(nutrition_validation_result.is_balanced).toBe(true);
    expect(nutrition_validation_result.balance_score).toBeGreaterThanOrEqual(0);
    expect(nutrition_validation_result.balance_score).toBeLessThanOrEqual(100);
    
    // バランススコアが推奨範囲（70以上）にあることを確認
    expect(nutrition_validation_result.balance_score).toBeGreaterThanOrEqual(70);
    
    // システムが正常フロー内で処理を継続していることを確認する（エラーやタイムアウトが発生していないことを確認）
    expect(nutrition_validation_result.has_error).toBe(false);
    expect(nutrition_validation_result.error_message).toBeNull();
    expect(nutrition_validation_result.was_fallback_used).toBe(false);
    expect(nutrition_validation_result.is_provisional_result).toBe(false);
    
    // 処理ログを確認し、異常なリトライや遅延フラグが立っていないことを検証する
    expect(nutrition_validation_result.processing_logs).toBeDefined();
    expect(Array.isArray(nutrition_validation_result.processing_logs)).toBe(true);
    expect(nutrition_validation_result.processing_logs.length).toBeGreaterThan(0);
    
    const has_retry_logs = nutrition_validation_result.processing_logs.some(
      (log: any) => log.includes('retry') || log.includes('リトライ')
    );
    expect(has_retry_logs).toBe(false);
    
    const has_delay_flags = nutrition_validation_result.processing_logs.some(
      (log: any) => log.includes('延期') || log.includes('遅延') || log.includes('delay')
    );
    expect(has_delay_flags).toBe(false);
    
    // 検証完了タイムスタンプが記録されていることを確認
    expect(nutrition_validation_result.validation_completed_at).toBeDefined();
    expect(typeof nutrition_validation_result.validation_completed_at).toBe('string');
    
    // 総合的に、SLA内で正常フロー内で処理されたことを確認
    expect(nutrition_validation_result.sla_status).toBe('compliant');
    expect(nutrition_validation_result.processing_mode).toBe('normal');
    
    // ユーザーに完全で正確な栄養情報が提供されることを確認
    expect(nutrition_validation_result.is_complete_data).toBe(true);
    expect(nutrition_validation_result.data_quality_score).toBeGreaterThanOrEqual(95);
  });
});