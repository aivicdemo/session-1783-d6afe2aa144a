import { classifyMealRejectionReasons } from '../../src/logic/it-8-1-2-1';

describe('Meal Rejection Reason Auto-Classification', () => {
  // SCEN-265: [edge] 献立却下修正理由自動分類機能 - 複合的な却下理由（栄養バランス不適切かつ調理時間超過）が複数カテゴリに正確に分類される
  test('should accurately classify composite rejection reasons into multiple categories with valid confidence scores', () => {
    // 初期化
    const rejectionReasonText = '栄養バランスが不適切であり、かつ調理時間が制限時間を30分超過している';
    
    // 分類処理を実行
    const classificationResult = classifyMealRejectionReasons(rejectionReasonText);
    
    // 返却された分類結果の配列長を検証
    expect(classificationResult.classifications.length).toBeGreaterThanOrEqual(2);
    
    // 分類結果に「栄養バランス不適切」カテゴリが含まれていることを確認
    const nutritionBalanceCategory = classificationResult.classifications.find(
      (item) => item.category === '栄養バランス不適切'
    );
    expect(nutritionBalanceCategory).toBeDefined();
    expect(nutritionBalanceCategory?.category).toBe('栄養バランス不適切');
    
    // 分類結果に「調理時間超過」カテゴリが含まれていることを確認
    const cookingTimeCategory = classificationResult.classifications.find(
      (item) => item.category === '調理時間超過'
    );
    expect(cookingTimeCategory).toBeDefined();
    expect(cookingTimeCategory?.category).toBe('調理時間超過');
    
    // 各カテゴリの信頼度スコアが0以上1以下であることを検証
    classificationResult.classifications.forEach((classification) => {
      expect(classification.confidenceScore).toBeGreaterThanOrEqual(0);
      expect(classification.confidenceScore).toBeLessThanOrEqual(1);
    });
    
    // 複数カテゴリの信頼度の合計が1.0を超えないことを確認
    const totalConfidenceScore = classificationResult.classifications.reduce(
      (sum, item) => sum + item.confidenceScore,
      0
    );
    expect(totalConfidenceScore).toBeLessThanOrEqual(1.0);
    
    // 分類結果が重複なく、かつ両カテゴリが同時に存在することを最終確認
    const categorySet = new Set(classificationResult.classifications.map((item) => item.category));
    expect(categorySet.size).toBe(classificationResult.classifications.length);
    expect(categorySet.has('栄養バランス不適切')).toBe(true);
    expect(categorySet.has('調理時間超過')).toBe(true);
    
    // 返却結果の整合性を確認
    expect(classificationResult.inputText).toBe(rejectionReasonText);
    expect(classificationResult.isComposite).toBe(true);
    expect(classificationResult.anomalyDetected).toBe(false);
  });
});