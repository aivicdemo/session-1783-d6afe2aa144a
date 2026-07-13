import { classifyMenuRejectionReason } from '../../src/logic/it-1-br-2-1-1-1';

describe('献立却下・修正理由の自動カテゴリ分類', () => {
  // SCEN-358
  test('献立却下理由テキストが事前定義カテゴリに正しく分類される', () => {
    // テスト用の献立却下理由テキスト（各カテゴリに対応）
    const nutritionText = 'タンパク質が不足している';
    const allergyText = '豚肉を使用しているが、提供先が豚肉禁止';
    const costText = '材料費が予算を20%超過している';
    const ambiguousText = '対応が必要';

    // 第1件目：栄養関連テキスト
    const nutritionResult = classifyMenuRejectionReason(nutritionText);
    expect(nutritionResult.category).toBe('栄養バランス不良');
    expect(nutritionResult.confidence).toBeGreaterThanOrEqual(0.95);
    expect(nutritionResult.rejectionReasonText).toBe(nutritionText);

    // 第2件目：食材・アレルギー関連テキスト
    const allergyResult = classifyMenuRejectionReason(allergyText);
    expect(['アレルギー対応', '食材不適切']).toContain(allergyResult.category);
    expect(allergyResult.confidence).toBeGreaterThanOrEqual(0.95);
    expect(allergyResult.rejectionReasonText).toBe(allergyText);

    // 第3件目：コスト関連テキスト
    const costResult = classifyMenuRejectionReason(costText);
    expect(costResult.category).toBe('コスト超過');
    expect(costResult.confidence).toBeGreaterThanOrEqual(0.95);
    expect(costResult.rejectionReasonText).toBe(costText);

    // 第4件目：曖昧なテキスト
    const ambiguousResult = classifyMenuRejectionReason(ambiguousText);
    expect(['その他', '未分類']).toContain(ambiguousResult.category);
    expect(ambiguousResult.rejectionReasonText).toBe(ambiguousText);

    // 分類結果の正確性検証：4件中3件が高い信頼度で分類される
    const allResults = [
      nutritionResult,
      allergyResult,
      costResult,
      ambiguousResult,
    ];
    const highConfidenceCount = allResults.filter(
      (r) => r.confidence >= 0.95,
    ).length;
    const accuracyRate = highConfidenceCount / allResults.length;
    expect(accuracyRate).toBeGreaterThanOrEqual(0.75);

    // カテゴリが事前定義リストに含まれることを確認
    const predefinedCategories = [
      '栄養バランス不良',
      '食材不適切',
      'アレルギー対応',
      'コスト超過',
      '調理困難',
      'その他',
      '未分類',
    ];
    allResults.forEach((result) => {
      expect(predefinedCategories).toContain(result.category);
    });

    // 保存対象のメタデータが正しく設定されることを確認
    expect(nutritionResult.classificationTimestamp).toBeDefined();
    expect(typeof nutritionResult.classificationTimestamp).toBe('string');
    expect(nutritionResult.classificationMethod).toBe('automatic');
  });
});