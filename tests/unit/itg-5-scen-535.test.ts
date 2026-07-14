import { detectConstraintChangesWithDuplicateAllergy } from '../../src/logic/it-7-2-1';

describe('献立生成の成功率・調理時間短縮度・ユーザー満足度スコアなどの行動指標を週次で自動集計し、アルゴリズム改善前後の効果差を定量比較するダッシュボード機能', () => {
  // SCEN-535
  test('アレルギー情報に重複エントリがある場合にエラーを返す', () => {
    const duplicate_allergy_input = {
      user_id: 'user_001',
      family_member_id: 'member_001',
      allergy_items: [
        {
          allergen_name: '卵',
          allergen_id: 'allg_001',
          severity_level: 'high',
          added_at: new Date('2024-01-15T10:00:00Z'),
        },
        {
          allergen_name: '卵',
          allergen_id: 'allg_001',
          severity_level: 'high',
          added_at: new Date('2024-01-15T10:05:00Z'),
        },
      ],
      timestamp: new Date('2024-01-15T10:10:00Z'),
      change_source: 'dashboard_form',
    };

    expect(() => detectConstraintChangesWithDuplicateAllergy(duplicate_allergy_input)).toThrow(/重複/);
  });
});