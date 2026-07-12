import { validateAndAcceptFoodRestriction } from '../../src/logic/it-1-br-4-2-1';

describe('食事制限条件の変更時に過去献立との抵触検出機能', () => {
  // SCEN-462: [edge] 食事制限条件の入力妥当性判定機能 - 最大長の食事制限条件テキストが正常に受け入れられる
  test('最大長（255文字）の食事制限条件テキストが正常に受け入れられる', () => {
    const maxLengthText = 'a'.repeat(255);
    const userId = 'user-001';
    const familyMemberId = 'member-001';

    const result = validateAndAcceptFoodRestriction({
      userId,
      familyMemberId,
      restrictionText: maxLengthText,
    });

    expect(result.isAccepted).toBe(true);
    expect(result.restrictionText).toBe(maxLengthText);
    expect(result.restrictionText.length).toBe(255);
    expect(result.errorMessage).toBeNull();
    expect(result.status).toBe('accepted');
  });

  test('256文字を超える食事制限条件テキストが却下される', () => {
    const overLengthText = 'a'.repeat(256);
    const userId = 'user-001';
    const familyMemberId = 'member-001';

    expect(() =>
      validateAndAcceptFoodRestriction({
        userId,
        familyMemberId,
        restrictionText: overLengthText,
      })
    ).toThrow(/最大長/);
  });

  test('空文字列の食事制限条件テキストが却下される', () => {
    const userId = 'user-001';
    const familyMemberId = 'member-001';

    expect(() =>
      validateAndAcceptFoodRestriction({
        userId,
        familyMemberId,
        restrictionText: '',
      })
    ).toThrow(/必須/);
  });

  test('null の食事制限条件テキストが却下される', () => {
    const userId = 'user-001';
    const familyMemberId = 'member-001';

    expect(() =>
      validateAndAcceptFoodRestriction({
        userId,
        familyMemberId,
        restrictionText: null as any,
      })
    ).toThrow(/必須/);
  });

  test('通常の長さの食事制限条件テキストが正常に受け入れられる', () => {
    const normalText = '乳製品不可';
    const userId = 'user-001';
    const familyMemberId = 'member-001';

    const result = validateAndAcceptFoodRestriction({
      userId,
      familyMemberId,
      restrictionText: normalText,
    });

    expect(result.isAccepted).toBe(true);
    expect(result.restrictionText).toBe(normalText);
    expect(result.status).toBe('accepted');
    expect(result.errorMessage).toBeNull();
  });

  test('特殊文字を含む食事制限条件テキストが正常に受け入れられる', () => {
    const specialCharText = 'アレルギー: ピーナッツ、えび、蟹（危険）';
    const userId = 'user-001';
    const familyMemberId = 'member-001';

    const result = validateAndAcceptFoodRestriction({
      userId,
      familyMemberId,
      restrictionText: specialCharText,
    });

    expect(result.isAccepted).toBe(true);
    expect(result.restrictionText).toBe(specialCharText);
    expect(result.status).toBe('accepted');
  });

  test('ユーザーIDが不正な場合、妥当性判定が失敗する', () => {
    const normalText = '乳製品不可';
    const invalidUserId = '';
    const familyMemberId = 'member-001';

    expect(() =>
      validateAndAcceptFoodRestriction({
        userId: invalidUserId,
        familyMemberId,
        restrictionText: normalText,
      })
    ).toThrow(/ユーザーID/);
  });

  test('ファミリーメンバーIDが不正な場合、妥当性判定が失敗する', () => {
    const normalText = '乳製品不可';
    const userId = 'user-001';
    const invalidFamilyMemberId = '';

    expect(() =>
      validateAndAcceptFoodRestriction({
        userId,
        familyMemberId: invalidFamilyMemberId,
        restrictionText: normalText,
      })
    ).toThrow(/ファミリーメンバーID/);
  });

  test('複数の制限条件をセミコロン区切りで入力した場合、正常に受け入れられる', () => {
    const multipleRestrictions = '卵不可;乳製品不可;ナッツ類不可';
    const userId = 'user-001';
    const familyMemberId = 'member-001';

    const result = validateAndAcceptFoodRestriction({
      userId,
      familyMemberId,
      restrictionText: multipleRestrictions,
    });

    expect(result.isAccepted).toBe(true);
    expect(result.restrictionText).toBe(multipleRestrictions);
    expect(result.status).toBe('accepted');
  });

  test('先頭・末尾の空白を含む食事制限条件テキストがトリムされて受け入れられる', () => {
    const textWithSpaces = '  乳製品不可  ';
    const userId = 'user-001';
    const familyMemberId = 'member-001';

    const result = validateAndAcceptFoodRestriction({
      userId,
      familyMemberId,
      restrictionText: textWithSpaces,
    });

    expect(result.isAccepted).toBe(true);
    expect(result.restrictionText).toBe('乳製品不可');
    expect(result.status).toBe('accepted');
  });

  test('数値のみの食事制限条件テキストが受け入れられる', () => {
    const numericText = '123';
    const userId = 'user-001';
    const familyMemberId = 'member-001';

    const result = validateAndAcceptFoodRestriction({
      userId,
      familyMemberId,
      restrictionText: numericText,
    });

    expect(result.isAccepted).toBe(true);
    expect(result.restrictionText).toBe(numericText);
  });
});