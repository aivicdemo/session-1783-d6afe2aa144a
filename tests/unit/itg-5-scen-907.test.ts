import { classifyRejectModifyReason } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類', () => {
  // SCEN-907
  test('空文字列またはNULLの理由テキストに対する分類処理でエラーが発生する', () => {
    // 空文字列のケース
    expect(() => classifyRejectModifyReason('')).toThrow(/理由/);

    // NULL値のケース
    expect(() => classifyRejectModifyReason(null as any)).toThrow(/理由/);

    // 空白のみを含む文字列のケース
    expect(() => classifyRejectModifyReason('   ')).toThrow(/理由/);

    // 有効な理由テキストの場合は分類が成功する
    const validReason = '栄養バランスが悪い';
    const result = classifyRejectModifyReason(validReason);
    expect(result).toEqual({
      category: '栄養',
      confidence: expect.any(Number),
      originalText: validReason,
    });

    // 別の有効な理由テキストの場合
    const cookingTimeReason = '調理時間が長すぎる';
    const cookingResult = classifyRejectModifyReason(cookingTimeReason);
    expect(cookingResult).toEqual({
      category: '調理時間',
      confidence: expect.any(Number),
      originalText: cookingTimeReason,
    });

    // 予算関連の理由テキスト
    const budgetReason = '食費が予算を超過している';
    const budgetResult = classifyRejectModifyReason(budgetReason);
    expect(budgetResult).toEqual({
      category: '予算',
      confidence: expect.any(Number),
      originalText: budgetReason,
    });

    // 好み関連の理由テキスト
    const preferenceReason = 'みんなの好みに合わない';
    const preferenceResult = classifyRejectModifyReason(preferenceReason);
    expect(preferenceResult).toEqual({
      category: '好み',
      confidence: expect.any(Number),
      originalText: preferenceReason,
    });

    // 食材制限関連の理由テキスト
    const restrictionReason = 'アレルギー食材が含まれている';
    const restrictionResult = classifyRejectModifyReason(restrictionReason);
    expect(restrictionResult).toEqual({
      category: '食材制限',
      confidence: expect.any(Number),
      originalText: restrictionReason,
    });

    // 在庫関連の理由テキスト
    const inventoryReason = '必要な食材が在庫に無い';
    const inventoryResult = classifyRejectModifyReason(inventoryReason);
    expect(inventoryResult).toEqual({
      category: '食材在庫',
      confidence: expect.any(Number),
      originalText: inventoryReason,
    });
  });
});