import { classifyMealRejectReason } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の分類と失敗パターン特定', () => {
  // SCEN-697: [normal] 献立却下修正理由の自動カテゴリ分類 - 複数カテゴリに該当する理由について優先度に基づいて単一カテゴリに分類する
  test('複数カテゴリに該当する理由が優先度ルールに基づいて単一カテゴリに分類される', () => {
    // テストデータ: 複数のカテゴリに該当する献立却下修正理由
    // 「栄養バランスが悪く、調理時間が長すぎる」 → 栄養（優先度1）と調理時間（優先度4）に該当
    // → 優先度ルールに従い、優先度1である「栄養」に分類されるべき
    const multiCategoryReason = {
      reasonText: '栄養バランスが悪く、調理時間が長すぎるので、この献立は却下します',
      reasonId: 'reason_001',
      rejectionTimestamp: new Date('2024-02-15T18:30:00Z'),
    };

    // 自動カテゴリ分類ロジックにテストデータを入力
    const classificationResult = classifyMealRejectReason(multiCategoryReason);

    // 複数カテゴリに該当する理由が、優先度の最も高いカテゴリに分類されたことを検証
    // 栄養（優先度1）が最優先度のため、カテゴリは 'nutrition' となる
    expect(classificationResult.primaryCategory).toBe('nutrition');

    // 分類結果が単一のカテゴリのみを示していることを確認
    expect(classificationResult.categories).toHaveLength(1);
    expect(classificationResult.categories[0]).toBe('nutrition');

    // 該当する複数カテゴリが詳細情報に含まれることを確認
    expect(classificationResult.matchedCategories).toContain('nutrition');
    expect(classificationResult.matchedCategories).toContain('cookingTime');

    // 優先度順序が正しく適用されていることをアサーションで検証
    // 優先度スコア: nutrition=1, cookingTime=4 → nutrition が選択される
    expect(classificationResult.priorityScore).toBe(1);

    // 分類根拠のキーワードが記録されていることを確認
    expect(classificationResult.keywordsMatched).toContain('栄養バランス');
    expect(classificationResult.keywordsMatched).toContain('調理時間');

    // 分類処理の実行ステータスを確認
    expect(classificationResult.status).toBe('classified');
    expect(classificationResult.confidence).toBeGreaterThanOrEqual(0.8);
  });
});