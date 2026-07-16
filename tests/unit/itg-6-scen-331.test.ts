import { validateDocumentQualityChecklist } from '../../src/logic/it-8-1-1-1';

describe('Document Quality Checklist Validation', () => {
  test('SCEN-331: [error] ドキュメント品質チェック機能 - チェックリスト必須項目が1つでも欠落している場合にエラーが発生する', () => {
    // 必須項目の定義
    const required_items = [
      'pain_factor_priority_matrix',
      'pain_factor_frequency',
      'pain_factor_impact_degree',
      'competitive_differentiation_gap',
      'differentiation_axis_justification',
      'target_segment_identification',
    ];

    // ケース1: すべての必須項目が入力されている場合（成功パス）
    const valid_checklist = {
      pain_factor_priority_matrix: true,
      pain_factor_frequency: true,
      pain_factor_impact_degree: true,
      competitive_differentiation_gap: true,
      differentiation_axis_justification: true,
      target_segment_identification: true,
    };

    const valid_result = validateDocumentQualityChecklist(valid_checklist);
    expect(valid_result.is_valid).toBe(true);
    expect(valid_result.error_message).toBe('');
    expect(valid_result.missing_items).toEqual([]);

    // ケース2: 1つの必須項目が欠落している場合（エラーパス）
    const missing_one_item_checklist = {
      pain_factor_priority_matrix: false,
      pain_factor_frequency: true,
      pain_factor_impact_degree: true,
      competitive_differentiation_gap: true,
      differentiation_axis_justification: true,
      target_segment_identification: true,
    };

    const missing_one_result = validateDocumentQualityChecklist(missing_one_item_checklist);
    expect(missing_one_result.is_valid).toBe(false);
    expect(missing_one_result.error_message).toMatch(/必須項目が未入力です/);
    expect(missing_one_result.missing_items).toContain('pain_factor_priority_matrix');
    expect(missing_one_result.missing_items.length).toBe(1);

    // ケース3: 複数の必須項目が欠落している場合（エラーパス）
    const missing_multiple_items_checklist = {
      pain_factor_priority_matrix: false,
      pain_factor_frequency: false,
      pain_factor_impact_degree: true,
      competitive_differentiation_gap: true,
      differentiation_axis_justification: false,
      target_segment_identification: true,
    };

    const missing_multiple_result = validateDocumentQualityChecklist(missing_multiple_items_checklist);
    expect(missing_multiple_result.is_valid).toBe(false);
    expect(missing_multiple_result.error_message).toMatch(/必須項目が未入力です/);
    expect(missing_multiple_result.missing_items).toContain('pain_factor_priority_matrix');
    expect(missing_multiple_result.missing_items).toContain('pain_factor_frequency');
    expect(missing_multiple_result.missing_items).toContain('differentiation_axis_justification');
    expect(missing_multiple_result.missing_items.length).toBe(3);

    // ケース4: すべての必須項目が欠落している場合（エラーパス）
    const all_missing_checklist = {
      pain_factor_priority_matrix: false,
      pain_factor_frequency: false,
      pain_factor_impact_degree: false,
      competitive_differentiation_gap: false,
      differentiation_axis_justification: false,
      target_segment_identification: false,
    };

    const all_missing_result = validateDocumentQualityChecklist(all_missing_checklist);
    expect(all_missing_result.is_valid).toBe(false);
    expect(all_missing_result.error_message).toMatch(/必須項目が未入力です/);
    expect(all_missing_result.missing_items.length).toBe(6);
    expect(all_missing_result.missing_items).toEqual(required_items);

    // ケース5: null/undefined 入力に対するエラーハンドリング
    expect(() => validateDocumentQualityChecklist(null as any)).toThrow(/必須項目/);
    expect(() => validateDocumentQualityChecklist(undefined as any)).toThrow(/必須項目/);

    // ケース6: 空のオブジェクト入力に対するエラーハンドリング
    const empty_checklist = {};
    const empty_result = validateDocumentQualityChecklist(empty_checklist);
    expect(empty_result.is_valid).toBe(false);
    expect(empty_result.error_message).toMatch(/必須項目が未入力です/);
    expect(empty_result.missing_items.length).toBe(6);
  });
});