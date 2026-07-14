import { classifyMealRejectionReasons } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-885: [normal] 献立却下修正理由の自動カテゴリ分類 - 複数の理由要素を含む却下修正データが主要カテゴリで優先分類される
  test('複数の理由要素を含む却下修正データが優先度ルールに基づいて主要カテゴリに分類される', () => {
    const rejection_reason_text =
      '栄養バランスが不足しており、特にタンパク質が足りません。また食材コストが予算を超えてしまい、調理に必要な工数も45分かかってしまい予定より15分超過しています。';

    const result = classifyMealRejectionReasons({
      rejection_reason_text,
      user_id: 'user_001',
      meal_plan_id: 'meal_plan_001',
      rejection_timestamp: new Date('2024-12-10T18:30:00Z'),
    });

    // 主要カテゴリが「栄養」であることを検証（優先度最高）
    expect(result.primary_category).toBe('nutrition');

    // 副要素として「予算」と「調理時間」が記録されていることを確認
    expect(result.secondary_categories).toContain('budget');
    expect(result.secondary_categories).toContain('cooking_time');

    // 副要素の個数が正確であることを検証
    expect(result.secondary_categories.length).toBe(2);

    // 分類根拠テキストが記録されていることを確認
    expect(result.classification_reason).toBeDefined();
    expect(typeof result.classification_reason).toBe('string');
    expect(result.classification_reason.length).toBeGreaterThan(0);

    // 優先度ルールが正しく適用されていることを検証
    // 優先度順: 栄養 > 予算 > 調理時間 > 家族好み > 食材制限
    expect(result.priority_score).toBeDefined();
    expect(typeof result.priority_score).toBe('number');
    expect(result.priority_score).toBeGreaterThanOrEqual(0);
    expect(result.priority_score).toBeLessThanOrEqual(100);

    // 分類タイムスタンプが設定されていることを確認
    expect(result.classified_timestamp).toBeDefined();
    expect(result.classified_timestamp instanceof Date).toBe(true);

    // 複数の理由要素を含むことを示すフラグが立っていることを確認
    expect(result.multi_element_detected).toBe(true);

    // 分類の信頼度スコアが記録されていることを検証
    expect(result.confidence_score).toBeDefined();
    expect(typeof result.confidence_score).toBe('number');
    expect(result.confidence_score).toBeGreaterThan(0.7);
  });
});