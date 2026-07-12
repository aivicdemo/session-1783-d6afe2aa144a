import { validateAndClassifyRejectionReason } from '../../src/logic/it-1-br-4-2-1';

describe('食事制限条件の変更時に過去献立との抵触検出機能', () => {
  // SCEN-619
  test('献立却下・修正理由の入力検証 - 必須項目チェック: 理由テキストが入力された場合にチェック通過し、カテゴリ分類処理へ渡される', () => {
    const input_reason_text = '栄養バランスが合わない';
    const input_menu_id = 'menu_20240115_001';
    const input_user_id = 'user_12345';
    const input_timestamp = new Date('2024-01-15T11:00:00Z');

    const result = validateAndClassifyRejectionReason({
      reason_text: input_reason_text,
      menu_id: input_menu_id,
      user_id: input_user_id,
      timestamp: input_timestamp,
    });

    expect(result.is_valid).toBe(true);
    expect(result.error_message).toBe('');
    expect(result.category).toBe('nutrition_imbalance');
    expect(result.reason_text_passed_to_classification).toBe(input_reason_text);
    expect(result.menu_id).toBe(input_menu_id);
    expect(result.user_id).toBe(input_user_id);
    expect(result.classification_invoked).toBe(true);
  });
});