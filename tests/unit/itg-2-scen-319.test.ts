import { evaluateAllergyChangePriority } from '../../src/logic/it-1-br-2-1-1-1';

describe('食事制限・アレルギー情報の変更検出・優先度判定機能', () => {
  // SCEN-319
  test('アレルギー情報の変更がない場合、優先度判定結果が「変更なし」を返す', () => {
    const current_allergen_list = [
      { allergen_id: 'allg_001', allergen_name: '卵', allergen_code: 'EGG' },
      { allergen_id: 'allg_002', allergen_name: '乳製品', allergen_code: 'DAIRY' }
    ];

    const previous_allergen_list = [
      { allergen_id: 'allg_001', allergen_name: '卵', allergen_code: 'EGG' },
      { allergen_id: 'allg_002', allergen_name: '乳製品', allergen_code: 'DAIRY' }
    ];

    const evaluation_timestamp = new Date('2024-01-15T11:00:00Z');

    const result = evaluateAllergyChangePriority({
      current_allergen_list,
      previous_allergen_list,
      evaluation_timestamp,
      user_id: 'user_001'
    });

    expect(result.change_status).toBe('no_change');
    expect(result.is_modified).toBe(false);
    expect(result.priority_score).toBe(0);
    expect(result.system_log_message).toMatch(/アレルギー情報に変更がないため/);
    expect(result.added_allergens).toEqual([]);
    expect(result.removed_allergens).toEqual([]);
    expect(result.allergen_count_current).toBe(2);
    expect(result.allergen_count_previous).toBe(2);
  });
});