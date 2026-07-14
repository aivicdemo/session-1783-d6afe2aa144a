import { detectPastMenuViolations } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-539: [error] 過去献立制限抵触検出機能 - 制限条件が無効な形式の場合にエラーを返す
  test('SCEN-539: 無効な形式の制限条件でエラーを返す', () => {
    // 無効な形式: 不正なJSON
    expect(() => {
      detectPastMenuViolations({
        userId: 'user_001',
        restrictionCondition: '{invalid json',
        pastMenuHistoryLimit: 30,
      });
    }).toThrow(/形式/);

    // 無効な形式: 空文字列
    expect(() => {
      detectPastMenuViolations({
        userId: 'user_001',
        restrictionCondition: '',
        pastMenuHistoryLimit: 30,
      });
    }).toThrow(/形式/);

    // 無効な形式: 特殊文字のみ
    expect(() => {
      detectPastMenuViolations({
        userId: 'user_001',
        restrictionCondition: '!@#$%^&*()',
        pastMenuHistoryLimit: 30,
      });
    }).toThrow(/形式/);

    // 無効な形式: nullまたはundefined
    expect(() => {
      detectPastMenuViolations({
        userId: 'user_001',
        restrictionCondition: null as any,
        pastMenuHistoryLimit: 30,
      });
    }).toThrow(/形式/);

    // 有効な形式: 正しいJSON構造でエラーが発生しないことを確認
    const validResult = detectPastMenuViolations({
      userId: 'user_001',
      restrictionCondition: JSON.stringify({
        allergens: ['egg', 'milk'],
        dietaryRestrictions: ['vegetarian'],
      }),
      pastMenuHistoryLimit: 30,
    });

    // 正常系では結果オブジェクトが返されること
    expect(validResult).toBeDefined();
    expect(validResult).toHaveProperty('violatedMenus');
    expect(Array.isArray(validResult.violatedMenus)).toBe(true);
    expect(validResult).toHaveProperty('violationCount');
    expect(typeof validResult.violationCount).toBe('number');
    expect(validResult.violationCount).toBeGreaterThanOrEqual(0);
  });
});