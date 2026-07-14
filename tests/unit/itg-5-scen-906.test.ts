import { categorizeRejectReason } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類', () => {
  // SCEN-906
  test('定義されたカテゴリに該当しないテキスト理由は「その他」カテゴリに分類される', () => {
    // 定義されたカテゴリ一覧
    const definedCategories = [
      '栄養バランス不適切',
      '家族好み未反映',
      '調理時間超過',
      '食材制限漏れ',
      '予算超過',
      '食材在庫不足'
    ];

    // テスト入力: 定義されたカテゴリに該当しないテキスト理由
    const undefinedReason = '色が悪い理由で好まない';

    // 実行
    const result = categorizeRejectReason(undefinedReason, definedCategories);

    // 期待値: 『その他』カテゴリに分類される
    expect(result.category).toBe('その他');
    expect(result.confidence).toBe(0);
    expect(result.originalText).toBe(undefinedReason);
    expect(result.classifiedAt).toBeDefined();

    // 複数の未定義理由をテスト
    const testCases = [
      '見た目が気に入らない',
      'なんか変な匂いがした',
      'ランダムな理由テキスト',
      '定義にない理由'
    ];

    testCases.forEach((reasonText) => {
      const classifyResult = categorizeRejectReason(reasonText, definedCategories);
      expect(classifyResult.category).toBe('その他');
      expect(classifyResult.confidence).toBe(0);
    });

    // 定義されたカテゴリに該当する理由は正しく分類される（念のため検証）
    const validReasons = [
      { text: 'タンパク質が少ないと思う', expectedCategory: '栄養バランス不適切' },
      { text: '子どもが大嫌いな野菜が入っている', expectedCategory: '家族好み未反映' },
      { text: '調理に1時間かかりすぎる', expectedCategory: '調理時間超過' },
      { text: 'エビアレルギーが入っていた', expectedCategory: '食材制限漏れ' },
      { text: '食材が高すぎる', expectedCategory: '予算超過' },
      { text: 'にんじんが冷蔵庫にない', expectedCategory: '食材在庫不足' }
    ];

    validReasons.forEach(({ text, expectedCategory }) => {
      const validResult = categorizeRejectReason(text, definedCategories);
      expect(validResult.category).toBe(expectedCategory);
      expect(validResult.confidence).toBeGreaterThan(0);
    });
  });
});