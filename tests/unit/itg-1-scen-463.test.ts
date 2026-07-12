import { validateMealRestriction } from '../../src/logic/it-1-br-4-2-1';

describe('食事制限条件の変更時に過去献立との抵触検出機能', () => {
  // SCEN-463
  test('[error] 食事制限条件の入力妥当性判定機能 - 最大長を超える食事制限条件テキストは不妥当と判定される', () => {
    const maxCharLimit = 255;
    const invalidInput = 'a'.repeat(maxCharLimit + 1);
    
    expect(() => {
      validateMealRestriction(invalidInput);
    }).toThrow(/最大文字数/);
  });

  test('[success] 最大長以内の食事制限条件テキストは妥当と判定される', () => {
    const validInput = 'グルテン不可、ナッツアレルギー対応';
    
    const result = validateMealRestriction(validInput);
    
    expect(result).toBe(true);
  });

  test('[success] 正確に最大長の食事制限条件テキストは妥当と判定される', () => {
    const maxCharLimit = 255;
    const boundaryInput = 'a'.repeat(maxCharLimit);
    
    const result = validateMealRestriction(boundaryInput);
    
    expect(result).toBe(true);
  });

  test('[error] 空文字列は不妥当と判定される', () => {
    const emptyInput = '';
    
    expect(() => {
      validateMealRestriction(emptyInput);
    }).toThrow(/必須/);
  });

  test('[error] null入力は不妥当と判定される', () => {
    expect(() => {
      validateMealRestriction(null as any);
    }).toThrow(/入力値/);
  });

  test('[error] undefined入力は不妥当と判定される', () => {
    expect(() => {
      validateMealRestriction(undefined as any);
    }).toThrow(/入力値/);
  });

  test('[success] スペースと句読点を含む食事制限条件テキストは妥当と判定される', () => {
    const validInput = 'アレルギー: 卵、牛乳。調理時間制限: 30分以内';
    
    const result = validateMealRestriction(validInput);
    
    expect(result).toBe(true);
  });

  test('[error] 数値型入力は不妥当と判定される', () => {
    expect(() => {
      validateMealRestriction(12345 as any);
    }).toThrow(/入力値/);
  });
});