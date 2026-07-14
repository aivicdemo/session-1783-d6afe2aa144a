import { classifyRejectReason } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-916: [normal] 却下修正理由の自動カテゴリ分類機能 - 献立却下理由テキストが事前定義カテゴリに正しく自動分類される
  test('献立却下理由テキストが事前定義カテゴリに正しく自動分類される', () => {
    // 正常系: 各カテゴリに対応した典型的なテキストサンプル
    const sampleReasons = [
      {
        text: '栄養バランスが悪い',
        expectedCategory: '栄養不足',
      },
      {
        text: 'たんぱく質が足りていない',
        expectedCategory: '栄養不足',
      },
      {
        text: 'カルシウムの量が少ない',
        expectedCategory: '栄養不足',
      },
      {
        text: 'エビがない',
        expectedCategory: '食材不足',
      },
      {
        text: '玉ねぎを入手できない',
        expectedCategory: '食材不足',
      },
      {
        text: '牛乳が品切れ',
        expectedCategory: '食材不足',
      },
      {
        text: '子どものピーナッツアレルギーに対応していない',
        expectedCategory: 'アレルギー対応',
      },
      {
        text: 'えび・かに対応がない',
        expectedCategory: 'アレルギー対応',
      },
      {
        text: 'グルテンフリー対応ではない',
        expectedCategory: 'アレルギー対応',
      },
      {
        text: '予算を超えている',
        expectedCategory: 'コスト超過',
      },
      {
        text: '食費が高すぎる',
        expectedCategory: 'コスト超過',
      },
      {
        text: '1食500円以上かかる',
        expectedCategory: 'コスト超過',
      },
      {
        text: '調理に2時間かかる',
        expectedCategory: '調理時間超過',
      },
      {
        text: 'この献立は30分では作れない',
        expectedCategory: '調理時間超過',
      },
      {
        text: '準備と後片付けで1時間必要',
        expectedCategory: '調理時間超過',
      },
      {
        text: '家族が食べたくないと言っている',
        expectedCategory: '家族好み未反映',
      },
      {
        text: '子どもが嫌いなメニュー',
        expectedCategory: '家族好み未反映',
      },
      {
        text: 'このレシピは以前失敗した',
        expectedCategory: '家族好み未反映',
      },
    ];

    // 各サンプルテキストを分類し、正しいカテゴリに分類されるか検証
    const classificationResults: Array<{
      text: string;
      expectedCategory: string;
      actualCategory: string;
      isCorrect: boolean;
    }> = [];

    sampleReasons.forEach(({ text, expectedCategory }) => {
      const result = classifyRejectReason(text);
      const isCorrect = result.category === expectedCategory;
      classificationResults.push({
        text,
        expectedCategory,
        actualCategory: result.category,
        isCorrect,
      });
    });

    // すべての分類が正しいことを確認
    classificationResults.forEach(({ text, expectedCategory, actualCategory }) => {
      expect(actualCategory).toBe(expectedCategory);
    });

    // 正確度が100%であることを確認
    const correctCount = classificationResults.filter((r) => r.isCorrect).length;
    const accuracy = (correctCount / classificationResults.length) * 100;
    expect(accuracy).toBe(100);

    // 境界値テスト: 曖昧な表現
    const ambiguousReasons = [
      {
        text: 'よくない',
        expectedPossibleCategories: ['栄養不足', '家族好み未反映'],
      },
      {
        text: 'もっと良いものがある',
        expectedPossibleCategories: ['家族好み未反映', '栄養不足'],
      },
      {
        text: '高い気がする',
        expectedPossibleCategories: ['コスト超過', '家族好み未反映'],
      },
    ];

    ambiguousReasons.forEach(({ text, expectedPossibleCategories }) => {
      const result = classifyRejectReason(text);
      expect(expectedPossibleCategories).toContain(result.category);
    });

    // エラーハンドリング: 空文字列
    expect(() => {
      classifyRejectReason('');
    }).toThrow(/理由/);

    // エラーハンドリング: null
    expect(() => {
      classifyRejectReason(null as any);
    }).toThrow(/理由/);

    // エラーハンドリング: undefined
    expect(() => {
      classifyRejectReason(undefined as any);
    }).toThrow(/理由/);

    // エラーハンドリング: 数字のみ
    expect(() => {
      classifyRejectReason('12345');
    }).toThrow(/理由/);

    // エラーハンドリング: 非常に長い文字列（異常な入力）
    const veryLongText = 'あ'.repeat(10000);
    expect(() => {
      classifyRejectReason(veryLongText);
    }).toThrow(/理由/);

    // 分類結果が構造化データとして正しい形式で返されることを確認
    const validResult = classifyRejectReason('栄養が不足している');
    expect(validResult).toHaveProperty('category');
    expect(validResult).toHaveProperty('confidence');
    expect(validResult).toHaveProperty('timestamp');
    expect(typeof validResult.category).toBe('string');
    expect(typeof validResult.confidence).toBe('number');
    expect(validResult.confidence).toBeGreaterThanOrEqual(0);
    expect(validResult.confidence).toBeLessThanOrEqual(100);

    // 複数カテゴリに該当する可能性のあるテキストが最も適切なカテゴリに分類されることを確認
    const multiCategoryReasons = [
      {
        text: '栄養が足りなくて値段も高い',
        mostLikelyCategory: '栄養不足', // または 'コスト超過'（最初にマッチしたカテゴリ）
      },
      {
        text: 'アレルギー対応で時間がかかる',
        mostLikelyCategory: 'アレルギー対応', // または '調理時間超過'
      },
    ];

    multiCategoryReasons.forEach(({ text }) => {
      const result = classifyRejectReason(text);
      // 少なくとも定義済みカテゴリのいずれかに分類されることを確認
      const validCategories = [
        '栄養不足',
        '食材不足',
        'アレルギー対応',
        'コスト超過',
        '調理時間超過',
        '家族好み未反映',
      ];
      expect(validCategories).toContain(result.category);
    });

    // 分類結果が非同期で正しく返されることを確認（永続化準備）
    const persistenceResult = classifyRejectReason('予算超過');
    expect(persistenceResult).toBeDefined();
    expect(persistenceResult.category).toBe('コスト超過');
    expect(persistenceResult.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });
});