import { classifyMealRejectionReason } from '../../src/logic/it-1-br-3-2-1';

describe('Purchase Record and Monthly Food Cost Reduction Analysis', () => {
  // SCEN-362
  test('should automatically classify meal rejection reason text into predefined categories with 95% accuracy', () => {
    // Test case 1: Nutrition balance category
    const result_nutrition = classifyMealRejectionReason('塩分が多すぎる');
    expect(result_nutrition).toEqual({
      text: '塩分が多すぎる',
      category: '栄養バランス',
      confidence: expect.any(Number)
    });
    expect(result_nutrition.confidence).toBeGreaterThanOrEqual(0.95);

    // Test case 2: Budget category
    const result_budget = classifyMealRejectionReason('予算を超えている');
    expect(result_budget).toEqual({
      text: '予算を超えている',
      category: '予算',
      confidence: expect.any(Number)
    });
    expect(result_budget.confidence).toBeGreaterThanOrEqual(0.95);

    // Test case 3: Allergy category
    const result_allergy = classifyMealRejectionReason('アレルギーのため食べられない');
    expect(result_allergy).toEqual({
      text: 'アレルギーのため食べられない',
      category: 'アレルギー',
      confidence: expect.any(Number)
    });
    expect(result_allergy.confidence).toBeGreaterThanOrEqual(0.95);

    // Test case 4: Preference category
    const result_preference = classifyMealRejectionReason('子どもが嫌いな野菜が入っている');
    expect(result_preference).toEqual({
      text: '子どもが嫌いな野菜が入っている',
      category: '嗜好',
      confidence: expect.any(Number)
    });
    expect(result_preference.confidence).toBeGreaterThanOrEqual(0.95);

    // Test case 5: Cooking time category
    const result_cooking_time = classifyMealRejectionReason('調理時間が長すぎて準備できない');
    expect(result_cooking_time).toEqual({
      text: '調理時間が長すぎて準備できない',
      category: '調理時間',
      confidence: expect.any(Number)
    });
    expect(result_cooking_time.confidence).toBeGreaterThanOrEqual(0.95);

    // Test case 6: Multiple sequential inputs with consistent classification accuracy
    const test_inputs = [
      { text: '糖分が高い', expected_category: '栄養バランス' },
      { text: '値段が高すぎる', expected_category: '予算' },
      { text: 'アレルギー対応してない', expected_category: 'アレルギー' },
      { text: '誰も食べたくないと言った', expected_category: '嗜好' },
      { text: 'フライパンがない', expected_category: '調理時間' }
    ];

    const classification_results = test_inputs.map(input => 
      classifyMealRejectionReason(input.text)
    );

    // Verify all results match expected categories
    classification_results.forEach((result, index) => {
      expect(result.category).toBe(test_inputs[index].expected_category);
      expect(result.confidence).toBeGreaterThanOrEqual(0.95);
    });

    // Verify overall classification accuracy is 95% or higher
    const correct_classifications = classification_results.filter(
      (result, index) => result.category === test_inputs[index].expected_category
    ).length;
    const overall_accuracy = correct_classifications / test_inputs.length;
    expect(overall_accuracy).toBeGreaterThanOrEqual(0.95);
  });
});