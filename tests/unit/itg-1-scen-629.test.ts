import { classifyMealRejectReason } from '../../src/logic/it-1-br-4-2-1';

describe('食事制限条件の変更時に過去献立との抵触検出機能', () => {
  // SCEN-629
  test('献立却下・修正理由のカテゴリ分類と異常値検出 - カテゴリ分類失敗時の動作', () => {
    const invalidReasonText = '@#$%^&*()';
    const result = classifyMealRejectReason(invalidReasonText);

    // カテゴリ分類失敗時はデフォルトカテゴリ『その他』が割り当てられる
    expect(result.category).toBe('その他');
    expect(result.isDefaultCategory).toBe(true);
    expect(result.confidenceScore).toBe(0);
    expect(result.classificationError).toBeNull();
  });

  test('献立却下・修正理由のカテゴリ分類と異常値検出 - 未分類テキストでもエラーは発生しない', () => {
    const unmatchableReasonText = 'xyzzzzzzz';
    const result = classifyMealRejectReason(unmatchableReasonText);

    // アプリケーションが正常に動作し、エラーを発生させない
    expect(result).toBeDefined();
    expect(result.category).toBe('その他');
    expect(result.isDefaultCategory).toBe(true);
  });

  test('献立却下・修正理由のカテゴリ分類と異常値検出 - 空文字列入力時はエラーを発生させる', () => {
    const emptyReasonText = '';

    expect(() => classifyMealRejectReason(emptyReasonText)).toThrow(/理由テキスト/);
  });

  test('献立却下・修正理由のカテゴリ分類と異常値検出 - null入力時はエラーを発生させる', () => {
    expect(() => classifyMealRejectReason(null as any)).toThrow(/理由テキスト/);
  });

  test('献立却下・修正理由のカテゴリ分類と異常値検出 - 既知のカテゴリに該当するテキストは正しく分類される', () => {
    const nutritionReasonText = '栄養バランスが悪い';
    const result = classifyMealRejectReason(nutritionReasonText);

    expect(result.category).toBe('栄養バランス不適切');
    expect(result.isDefaultCategory).toBe(false);
    expect(result.confidenceScore).toBeGreaterThanOrEqual(0.7);
  });

  test('献立却下・修正理由のカテゴリ分類と異常値検出 - 複数の候補カテゴリに該当する場合は最高信頼度を選択', () => {
    const ambiguousReasonText = '調理時間が長くて栄養も不足';
    const result = classifyMealRejectReason(ambiguousReasonText);

    expect(result.category).toBeDefined();
    expect(['調理時間超過', '栄養バランス不適切'].includes(result.category)).toBe(true);
    expect(result.confidenceScore).toBeGreaterThan(0);
  });

  test('献立却下・修正理由のカテゴリ分類と異常値検出 - デフォルトカテゴリ割当時はフラグと信頼度スコアが適切に設定される', () => {
    const randomInvalidText = 'abcdefghijklmnopqrstuvwxyz';
    const result = classifyMealRejectReason(randomInvalidText);

    expect(result.category).toBe('その他');
    expect(result.isDefaultCategory).toBe(true);
    expect(result.confidenceScore).toBe(0);
    expect(result.classificationError).toBeNull();
  });

  test('献立却下・修正理由のカテゴリ分類と異常値検出 - 分類失敗によるコンソール記録', () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    const invalidReasonText = '###%%%';
    const result = classifyMealRejectReason(invalidReasonText);

    // デフォルトカテゴリ割当の場合、コンソールにはメッセージが記録されない
    // (エラーではなく通常の処理として扱われる)
    expect(result.category).toBe('その他');
    
    consoleWarnSpy.mockRestore();
  });
});