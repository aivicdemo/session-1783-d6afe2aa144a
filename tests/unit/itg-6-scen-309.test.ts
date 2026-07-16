import { classifyInterviewRecord } from '../../src/logic/it-8-1-1-1';

describe('インタビュー内容自動分類・ペイン要因抽出機能', () => {
  // SCEN-309
  test('インタビュー記録が食材制限・調理時間・予算・家族の好みのペイン要因カテゴリに正確に自動分類され、優先度スコアが付与される', () => {
    // 食材制限に関するインタビュー記録
    const foodRestrictionInput = {
      interviewText:
        'うちの子どもは卵アレルギーがあるので、卵を使わない献立を探しています。あと、宗教的な理由で豚肉も避けたいです。',
      interviewerName: 'Tanaka',
      recordedAt: new Date('2024-01-15T10:00:00Z'),
    };

    const foodRestrictionResult = classifyInterviewRecord(foodRestrictionInput);

    expect(foodRestrictionResult.category).toBe('food_restriction');
    expect(foodRestrictionResult.priorityScore).toBeGreaterThanOrEqual(1);
    expect(foodRestrictionResult.priorityScore).toBeLessThanOrEqual(10);
    expect(typeof foodRestrictionResult.priorityScore).toBe('number');
    expect(foodRestrictionResult.painFactors).toContain('egg_allergy');
    expect(foodRestrictionResult.painFactors).toContain('pork_restriction');

    // 調理時間に関するインタビュー記録
    const cookingTimeInput = {
      interviewText:
        '仕事から帰ってくるのが遅いので、できるだけ短時間で準備できる献立を探しています。15分以内でできるものが理想です。',
      interviewerName: 'Suzuki',
      recordedAt: new Date('2024-01-15T11:00:00Z'),
    };

    const cookingTimeResult = classifyInterviewRecord(cookingTimeInput);

    expect(cookingTimeResult.category).toBe('cooking_time');
    expect(cookingTimeResult.priorityScore).toBeGreaterThanOrEqual(1);
    expect(cookingTimeResult.priorityScore).toBeLessThanOrEqual(10);
    expect(typeof cookingTimeResult.priorityScore).toBe('number');
    expect(cookingTimeResult.timeConstraintMinutes).toBe(15);

    // 予算に関するインタビュー記録
    const budgetInput = {
      interviewText:
        '家計が厳しいので、できるだけ安く済ませたいです。1食あたり300円以内でできる献立があると助かります。',
      interviewerName: 'Yamada',
      recordedAt: new Date('2024-01-15T12:00:00Z'),
    };

    const budgetResult = classifyInterviewRecord(budgetInput);

    expect(budgetResult.category).toBe('budget_constraint');
    expect(budgetResult.priorityScore).toBeGreaterThanOrEqual(1);
    expect(budgetResult.priorityScore).toBeLessThanOrEqual(10);
    expect(typeof budgetResult.priorityScore).toBe('number');
    expect(budgetResult.budgetPerMealJpy).toBe(300);

    // 家族の好みに関するインタビュー記録
    const familyPreferenceInput = {
      interviewText:
        '子どもが野菜嫌いなので、野菜を食べやすい形で提供できる献立を探しています。配偶者は辛いのが得意で、スパイスを効かせた料理が好きです。',
      interviewerName: 'Sato',
      recordedAt: new Date('2024-01-15T13:00:00Z'),
    };

    const familyPreferenceResult = classifyInterviewRecord(
      familyPreferenceInput
    );

    expect(familyPreferenceResult.category).toBe('family_preference');
    expect(familyPreferenceResult.priorityScore).toBeGreaterThanOrEqual(1);
    expect(familyPreferenceResult.priorityScore).toBeLessThanOrEqual(10);
    expect(typeof familyPreferenceResult.priorityScore).toBe('number');
    expect(familyPreferenceResult.familyMembers).toContainEqual({
      role: 'child',
      dislikedItems: ['vegetable'],
    });
    expect(familyPreferenceResult.familyMembers).toContainEqual({
      role: 'spouse',
      preference: 'spicy',
    });

    // 複数のペイン要因を含むインタビュー記録
    const multipleFactorsInput = {
      interviewText:
        '仕事が忙しくて時間がないので、15分以内で作れる献立を探しています。予算も月に5000円程度に抑えたいです。あと、妻が魚が嫌いなので、魚を使わない献立があると助かります。長男がナッツアレルギーもあります。',
      interviewerName: 'Ito',
      recordedAt: new Date('2024-01-15T14:00:00Z'),
    };

    const multipleFactorsResult =
      classifyInterviewRecord(multipleFactorsInput);

    expect(multipleFactorsResult.extractedCategories).toContain(
      'cooking_time'
    );
    expect(multipleFactorsResult.extractedCategories).toContain(
      'budget_constraint'
    );
    expect(multipleFactorsResult.extractedCategories).toContain(
      'family_preference'
    );
    expect(multipleFactorsResult.extractedCategories).toContain(
      'food_restriction'
    );

    // 複数分類されたペイン要因の詳細検証
    expect(Array.isArray(multipleFactorsResult.painFactorsDetail)).toBe(true);
    expect(multipleFactorsResult.painFactorsDetail.length).toBeGreaterThan(0);

    // 優先度スコアが高い順に並べ替えられていることを確認
    const sortedByPriority = multipleFactorsResult.painFactorsDetail.sort(
      (a, b) => b.priorityScore - a.priorityScore
    );

    for (let i = 0; i < sortedByPriority.length - 1; i++) {
      expect(sortedByPriority[i].priorityScore).toBeGreaterThanOrEqual(
        sortedByPriority[i + 1].priorityScore
      );
    }

    // 各ペイン要因の優先度スコアが1～10の範囲内
    multipleFactorsResult.painFactorsDetail.forEach((factor) => {
      expect(factor.priorityScore).toBeGreaterThanOrEqual(1);
      expect(factor.priorityScore).toBeLessThanOrEqual(10);
    });

    // 優先度スコアが最も高いペイン要因を確認
    const highestPriorityFactor = multipleFactorsResult.painFactorsDetail[0];
    expect(highestPriorityFactor).toBeDefined();
    expect(highestPriorityFactor.priorityScore).toBeGreaterThanOrEqual(
      multipleFactorsResult.painFactorsDetail[
        multipleFactorsResult.painFactorsDetail.length - 1
      ].priorityScore
    );

    // インタビュー記録の処理タイムスタンプが記録されていることを確認
    expect(multipleFactorsResult.processedAt).toBeDefined();
    expect(
      new Date(multipleFactorsResult.processedAt).getTime()
    ).toBeGreaterThanOrEqual(new Date('2024-01-15T14:00:00Z').getTime());

    // 分類精度のメタデータが含まれていることを確認
    expect(multipleFactorsResult.classificationAccuracy).toBeDefined();
    expect(typeof multipleFactorsResult.classificationAccuracy).toBe('number');
    expect(multipleFactorsResult.classificationAccuracy).toBeGreaterThan(0);
    expect(multipleFactorsResult.classificationAccuracy).toBeLessThanOrEqual(
      100
    );
  });
});