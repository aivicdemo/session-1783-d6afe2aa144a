import { detectConflictPatterns } from '../../src/logic/it-1-br-4-2-1';

describe('食事制限条件の変更時に過去献立との抵触検出機能', () => {
  // SCEN-476: [error] 抵触パターンの妥当性判定と献立生成反映 - 無効な判定ステータス値が入力された場合、エラーを発生させる
  test('無効な判定ステータス値が入力された場合、エラーを発生させる', () => {
    const pastMenus = [
      {
        menu_id: 1,
        menu_name: '鶏肉と卵の親子丼',
        details: [
          { ingredient_name: '鶏肉', allergen_flag: false },
          { ingredient_name: '卵', allergen_flag: true }
        ]
      }
    ];

    const newRestriction = {
      restriction_id: 101,
      restriction_name: '卵アレルギー',
      restricted_ingredients: ['卵']
    };

    // null ステータス値でエラーを検証
    expect(() =>
      detectConflictPatterns(pastMenus, newRestriction, null as any)
    ).toThrow(/判定ステータス/);

    // undefined ステータス値でエラーを検証
    expect(() =>
      detectConflictPatterns(pastMenus, newRestriction, undefined as any)
    ).toThrow(/判定ステータス/);

    // 空文字列ステータス値でエラーを検証
    expect(() =>
      detectConflictPatterns(pastMenus, newRestriction, '')
    ).toThrow(/判定ステータス/);

    // 予期しない文字列ステータス値でエラーを検証
    expect(() =>
      detectConflictPatterns(pastMenus, newRestriction, 'invalid_status')
    ).toThrow(/判定ステータス/);
  });
});