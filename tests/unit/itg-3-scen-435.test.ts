import { approvePurchaseTrendData } from '../../src/logic/it-1-br-3-2-1';

describe('購入実績の記録と月次食費削減効果の自動集計・分析機能', () => {
  // SCEN-435
  test('季節変動・曜日別購買傾向の承認判定 - 必須フィールド欠損時にエラーを返す', () => {
    // ハッピーパス: 全必須フィールド揃った場合は成功
    const validData = {
      date: '2024-01-15',
      dayOfWeek: 'Monday',
      seasonCategory: 'winter',
      purchaseAmount: 5000,
      productCategory: 'vegetables',
    };
    const validResult = approvePurchaseTrendData(validData);
    expect(validResult).toEqual({
      approved: true,
      status: 200,
      message: '承認完了',
    });

    // エラーケース1: date 欠損
    const missingDate = {
      dayOfWeek: 'Monday',
      seasonCategory: 'winter',
      purchaseAmount: 5000,
      productCategory: 'vegetables',
    };
    expect(() => approvePurchaseTrendData(missingDate)).toThrow(/必須フィールド/);

    // エラーケース2: dayOfWeek 欠損
    const missingDayOfWeek = {
      date: '2024-01-15',
      seasonCategory: 'winter',
      purchaseAmount: 5000,
      productCategory: 'vegetables',
    };
    expect(() => approvePurchaseTrendData(missingDayOfWeek)).toThrow(/必須フィールド/);

    // エラーケース3: seasonCategory 欠損
    const missingSeasonCategory = {
      date: '2024-01-15',
      dayOfWeek: 'Monday',
      purchaseAmount: 5000,
      productCategory: 'vegetables',
    };
    expect(() => approvePurchaseTrendData(missingSeasonCategory)).toThrow(/必須フィールド/);

    // エラーケース4: purchaseAmount 欠損
    const missingPurchaseAmount = {
      date: '2024-01-15',
      dayOfWeek: 'Monday',
      seasonCategory: 'winter',
      productCategory: 'vegetables',
    };
    expect(() => approvePurchaseTrendData(missingPurchaseAmount)).toThrow(/必須フィールド/);

    // エラーケース5: productCategory 欠損
    const missingProductCategory = {
      date: '2024-01-15',
      dayOfWeek: 'Monday',
      seasonCategory: 'winter',
      purchaseAmount: 5000,
    };
    expect(() => approvePurchaseTrendData(missingProductCategory)).toThrow(/必須フィールド/);

    // エラーケース6: 複数フィールド欠損
    const multipleFieldsMissing = {
      date: '2024-01-15',
      seasonCategory: 'winter',
    };
    expect(() => approvePurchaseTrendData(multipleFieldsMissing)).toThrow(/必須フィールド/);

    // エラーケース7: null 値を含む
    const nullFieldData = {
      date: '2024-01-15',
      dayOfWeek: null,
      seasonCategory: 'winter',
      purchaseAmount: 5000,
      productCategory: 'vegetables',
    };
    expect(() => approvePurchaseTrendData(nullFieldData)).toThrow(/必須フィールド/);

    // エラーケース8: 空文字列を含む
    const emptyFieldData = {
      date: '2024-01-15',
      dayOfWeek: '',
      seasonCategory: 'winter',
      purchaseAmount: 5000,
      productCategory: 'vegetables',
    };
    expect(() => approvePurchaseTrendData(emptyFieldData)).toThrow(/必須フィールド/);

    // エラーケース9: undefined 値を含む
    const undefinedFieldData = {
      date: '2024-01-15',
      dayOfWeek: undefined,
      seasonCategory: 'winter',
      purchaseAmount: 5000,
      productCategory: 'vegetables',
    };
    expect(() => approvePurchaseTrendData(undefinedFieldData)).toThrow(/必須フィールド/);

    // エラーケース10: purchaseAmount が 0 以下
    const invalidPurchaseAmount = {
      date: '2024-01-15',
      dayOfWeek: 'Monday',
      seasonCategory: 'winter',
      purchaseAmount: 0,
      productCategory: 'vegetables',
    };
    expect(() => approvePurchaseTrendData(invalidPurchaseAmount)).toThrow(/購入金額/);

    // エラーケース11: purchaseAmount が負数
    const negativePurchaseAmount = {
      date: '2024-01-15',
      dayOfWeek: 'Monday',
      seasonCategory: 'winter',
      purchaseAmount: -1000,
      productCategory: 'vegetables',
    };
    expect(() => approvePurchaseTrendData(negativePurchaseAmount)).toThrow(/購入金額/);

    // エラーケース12: date フォーマットが不正
    const invalidDateFormat = {
      date: '2024/01/15',
      dayOfWeek: 'Monday',
      seasonCategory: 'winter',
      purchaseAmount: 5000,
      productCategory: 'vegetables',
    };
    expect(() => approvePurchaseTrendData(invalidDateFormat)).toThrow(/日付形式/);

    // エラーケース13: dayOfWeek が不正な値
    const invalidDayOfWeek = {
      date: '2024-01-15',
      dayOfWeek: 'InvalidDay',
      seasonCategory: 'winter',
      purchaseAmount: 5000,
      productCategory: 'vegetables',
    };
    expect(() => approvePurchaseTrendData(invalidDayOfWeek)).toThrow(/曜日/);

    // エラーケース14: seasonCategory が不正な値
    const invalidSeasonCategory = {
      date: '2024-01-15',
      dayOfWeek: 'Monday',
      seasonCategory: 'invalid_season',
      purchaseAmount: 5000,
      productCategory: 'vegetables',
    };
    expect(() => approvePurchaseTrendData(invalidSeasonCategory)).toThrow(/季節区分/);
  });
});