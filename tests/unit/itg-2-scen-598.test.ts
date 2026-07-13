import { classifyMenuRejectionReason } from '../../src/logic/it-1-br-2-1-1-1';

describe('献立却下修正理由の自動分類 - 複数カテゴリ対応', () => {
  // SCEN-598
  test('複数カテゴリに該当する却下理由が入力された場合に最も適切なカテゴリに一意に分類される', () => {
    // パターン1: 栄養バランス不適切 + 調理時間超過（栄養を優先）
    const result1 = classifyMenuRejectionReason({
      rejectionReason: 'タンパク質が不足しており、かつ塩分も高すぎる。また調理に60分もかかる',
      availableCategories: [
        { id: 1, name: '栄養バランス不適切', priority: 1 },
        { id: 2, name: '調理時間超過', priority: 2 },
        { id: 3, name: '食材制限漏れ', priority: 3 },
        { id: 4, name: '家族好み未反映', priority: 4 }
      ]
    });
    expect(result1.classifiedCategoryId).toBe(1);
    expect(result1.classifiedCategoryName).toBe('栄養バランス不適切');
    expect(Array.isArray(result1.matchedCategoryIds)).toBe(true);
    expect(result1.matchedCategoryIds).toContain(1);
    expect(result1.matchedCategoryIds).toContain(2);
    expect(result1.confidence).toBeGreaterThan(0.7);

    // パターン2: 食材制限漏れ + 家族好み未反映（食材制限を優先）
    const result2 = classifyMenuRejectionReason({
      rejectionReason: 'アレルギーのある食材が含まれており、子どもも食べたくないと言っている',
      availableCategories: [
        { id: 1, name: '栄養バランス不適切', priority: 1 },
        { id: 2, name: '調理時間超過', priority: 2 },
        { id: 3, name: '食材制限漏れ', priority: 3 },
        { id: 4, name: '家族好み未反映', priority: 4 }
      ]
    });
    expect(result2.classifiedCategoryId).toBe(3);
    expect(result2.classifiedCategoryName).toBe('食材制限漏れ');
    expect(result2.matchedCategoryIds).toContain(3);
    expect(result2.matchedCategoryIds).toContain(4);

    // パターン3: 調理時間超過 + 栄養バランス不適切（栄養を優先）
    const result3 = classifyMenuRejectionReason({
      rejectionReason: '準備に90分かかるし、栄養バランスも悪い',
      availableCategories: [
        { id: 1, name: '栄養バランス不適切', priority: 1 },
        { id: 2, name: '調理時間超過', priority: 2 },
        { id: 3, name: '食材制限漏れ', priority: 3 },
        { id: 4, name: '家族好み未反映', priority: 4 }
      ]
    });
    expect(result3.classifiedCategoryId).toBe(1);
    expect(result3.classifiedCategoryName).toBe('栄養バランス不適切');
    expect(result3.matchedCategoryIds).toContain(1);
    expect(result3.matchedCategoryIds).toContain(2);

    // パターン4: 3つ以上のカテゴリに該当する場合（優先度が最も高い1つを選択）
    const result4 = classifyMenuRejectionReason({
      rejectionReason: '栄養が不足していて、調理に時間がかかり、子どもが嫌がる食材も入っている。卵アレルギーなのに卵が入っていた',
      availableCategories: [
        { id: 1, name: '栄養バランス不適切', priority: 1 },
        { id: 2, name: '調理時間超過', priority: 2 },
        { id: 3, name: '食材制限漏れ', priority: 3 },
        { id: 4, name: '家族好み未反映', priority: 4 }
      ]
    });
    expect(result4.classifiedCategoryId).toBe(3);
    expect(result4.classifiedCategoryName).toBe('食材制限漏れ');
    expect(result4.matchedCategoryIds.length).toBeGreaterThanOrEqual(3);
    expect(result4.matchedCategoryIds.length).toBeLessThanOrEqual(4);

    // パターン5: 曖昧な表現で複数カテゴリに該当する場合
    const result5 = classifyMenuRejectionReason({
      rejectionReason: 'この献立は親子そろって好みじゃなくて、準備も大変です',
      availableCategories: [
        { id: 1, name: '栄養バランス不適切', priority: 1 },
        { id: 2, name: '調理時間超過', priority: 2 },
        { id: 3, name: '食材制限漏れ', priority: 3 },
        { id: 4, name: '家族好み未反映', priority: 4 }
      ]
    });
    expect(result5.classifiedCategoryId).toBe(4);
    expect(result5.classifiedCategoryName).toBe('家族好み未反映');
    expect(result5.matchedCategoryIds).toContain(4);
    expect(result5.matchedCategoryIds).toContain(2);

    // 統一性検証: 同じ入力に対して常に同じカテゴリが分類される
    const result5_duplicate = classifyMenuRejectionReason({
      rejectionReason: 'この献立は親子そろって好みじゃなくて、準備も大変です',
      availableCategories: [
        { id: 1, name: '栄養バランス不適切', priority: 1 },
        { id: 2, name: '調理時間超過', priority: 2 },
        { id: 3, name: '食材制限漏れ', priority: 3 },
        { id: 4, name: '家族好み未反映', priority: 4 }
      ]
    });
    expect(result5_duplicate.classifiedCategoryId).toBe(result5.classifiedCategoryId);
    expect(result5_duplicate.classifiedCategoryName).toBe(result5.classifiedCategoryName);

    // エラーケース: 利用可能なカテゴリがない場合
    expect(() => {
      classifyMenuRejectionReason({
        rejectionReason: 'テスト理由',
        availableCategories: []
      });
    }).toThrow(/カテゴリ/);

    // エラーケース: 却下理由が空文字列の場合
    expect(() => {
      classifyMenuRejectionReason({
        rejectionReason: '',
        availableCategories: [
          { id: 1, name: '栄養バランス不適切', priority: 1 }
        ]
      });
    }).toThrow(/理由/);

    // エラーケース: priorityが重複している場合
    expect(() => {
      classifyMenuRejectionReason({
        rejectionReason: 'テスト理由',
        availableCategories: [
          { id: 1, name: '栄養バランス不適切', priority: 1 },
          { id: 2, name: '調理時間超過', priority: 1 }
        ]
      });
    }).toThrow(/優先度/);
  });
});