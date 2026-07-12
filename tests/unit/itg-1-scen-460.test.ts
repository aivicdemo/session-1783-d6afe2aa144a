import { validateDietaryRestriction } from '../../src/logic/it-1-br-4-2-1';

describe('食事制限条件の変更時に過去献立との抵触検出機能', () => {
  // SCEN-460: [error] 食事制限条件の入力妥当性判定機能 - 不妥当な形式の食事制限条件は修正を促すエラーが返される
  test('不妥当な形式の食事制限条件はエラーメッセージを返す、正しい形式は受け付ける', () => {
    // 不妥当な形式: 特殊文字のみ
    expect(() => validateDietaryRestriction('!!!@@@###')).toThrow(/アレルギー情報/);

    // 不妥当な形式: 空文字列
    expect(() => validateDietaryRestriction('')).toThrow(/入力必須/);

    // 不妥当な形式: 長さ制限超過（例：1000文字超）
    const tooLongRestriction = 'a'.repeat(1001);
    expect(() => validateDietaryRestriction(tooLongRestriction)).toThrow(/最大文字数/);

    // 不妥当な形式: 改行のみ
    expect(() => validateDietaryRestriction('\n\n\n')).toThrow(/入力必須/);

    // 不妥当な形式: 許可されない文字を含む（例：制御文字）
    expect(() => validateDietaryRestriction('egg\x00allergy')).toThrow(/文字形式/);

    // 正しい形式: 英数字とカンマで構成
    const validRestriction1 = 'egg,milk,peanut';
    const result1 = validateDietaryRestriction(validRestriction1);
    expect(result1).toEqual({
      isValid: true,
      restriction: 'egg,milk,peanut',
      errorMessage: null
    });

    // 正しい形式: 単一アレルギー
    const validRestriction2 = 'shrimp';
    const result2 = validateDietaryRestriction(validRestriction2);
    expect(result2).toEqual({
      isValid: true,
      restriction: 'shrimp',
      errorMessage: null
    });

    // 正しい形式: スペース区切り（トリミング処理が行われる）
    const validRestriction3 = 'egg, milk, peanut';
    const result3 = validateDietaryRestriction(validRestriction3);
    expect(result3).toEqual({
      isValid: true,
      restriction: 'egg,milk,peanut',
      errorMessage: null
    });

    // 正しい形式: 日本語カタカナ（許可される場合）
    const validRestriction4 = 'アレルギー,牛乳,ピーナッツ';
    const result4 = validateDietaryRestriction(validRestriction4);
    expect(result4).toEqual({
      isValid: true,
      restriction: 'アレルギー,牛乳,ピーナッツ',
      errorMessage: null
    });

    // 不妥当な形式: 先頭・末尾にカンマ
    expect(() => validateDietaryRestriction(',egg,milk,')).toThrow(/カンマ位置/);

    // 不妥当な形式: 連続カンマ
    expect(() => validateDietaryRestriction('egg,,milk')).toThrow(/連続カンマ/);
  });
});