import { classifyInterviewContent } from '../../src/logic/it-1-br-1783670064270-1-1-1';

describe('インタビュー内容自動分類機能', () => {
  test('SCEN-648: 複数のペイン要因カテゴリに該当する記録が複数カテゴリに分類される', () => {
    // 入力：複数のペイン要因を含むインタビュー記録
    const interviewInput = {
      userId: 'user_speciality_001',
      interviewText: '仕事が忙しくて、疲れて、気分が落ち込んでいる',
      timestamp: new Date('2024-01-15T14:30:00Z'),
    };

    // 期待される分類結果：複数カテゴリに該当
    const expectedCategories = [
      {
        categoryId: 'pain_work_stress',
        categoryName: '仕事ストレス',
        matchConfidenceScore: 85,
        isSelected: true,
      },
      {
        categoryId: 'pain_fatigue',
        categoryName: '疲労',
        matchConfidenceScore: 90,
        isSelected: true,
      },
      {
        categoryId: 'pain_mental_health',
        categoryName: 'メンタルヘルス',
        matchConfidenceScore: 78,
        isSelected: true,
      },
    ];

    // 実行：分類ロジックを実行
    const classificationResult = classifyInterviewContent({
      interviewId: 'interview_20240115_001',
      userId: interviewInput.userId,
      interviewContent: interviewInput.interviewText,
      processedAt: interviewInput.timestamp,
    });

    // 検証 1: 戻り値の構造が正しいこと
    expect(classificationResult).toHaveProperty('classifiedCategories');
    expect(classificationResult).toHaveProperty('totalCategoriesMatched');
    expect(classificationResult).toHaveProperty('classificationConfidenceScore');
    expect(classificationResult).toHaveProperty('savedToDatabaseFlag');

    // 検証 2: 分類されたカテゴリ数が期待値と一致すること
    expect(classificationResult.totalCategoriesMatched).toBe(3);

    // 検証 3: 各カテゴリが正しく分類されていること
    expect(classificationResult.classifiedCategories).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          categoryId: 'pain_work_stress',
          categoryName: '仕事ストレス',
          isSelected: true,
        }),
        expect.objectContaining({
          categoryId: 'pain_fatigue',
          categoryName: '疲労',
          isSelected: true,
        }),
        expect.objectContaining({
          categoryId: 'pain_mental_health',
          categoryName: 'メンタルヘルス',
          isSelected: true,
        }),
      ])
    );

    // 検証 4: 各カテゴリの信頼度スコアが妥当な範囲内であること
    classificationResult.classifiedCategories.forEach(
      (category: {
        matchConfidenceScore: number;
        categoryId: string;
      }) => {
        expect(category.matchConfidenceScore).toBeGreaterThanOrEqual(0);
        expect(category.matchConfidenceScore).toBeLessThanOrEqual(100);
      }
    );

    // 検証 5: 全体の分類信頼度スコアが計算されていること
    expect(classificationResult.classificationConfidenceScore).toBe(
      Math.round((85 + 90 + 78) / 3)
    );

    // 検証 6: データベースに保存されたフラグが true であること
    expect(classificationResult.savedToDatabaseFlag).toBe(true);

    // 検証 7: 分類結果が UI 画面表示用フォーマットで返されていること
    expect(classificationResult.classifiedCategories).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          categoryId: expect.any(String),
          categoryName: expect.any(String),
          matchConfidenceScore: expect.any(Number),
          isSelected: expect.any(Boolean),
        }),
      ])
    );

    // 検証 8: すべての該当カテゴリが選択状態（true）であること
    const allCategoriesSelected = classificationResult.classifiedCategories.every(
      (category: { isSelected: boolean }) => category.isSelected === true
    );
    expect(allCategoriesSelected).toBe(true);

    // 検証 9: 不適切な分類がないこと（例：食材制限など無関係なカテゴリが含まれていないこと）
    const invalidCategories = classificationResult.classifiedCategories.filter(
      (category: { categoryId: string }) =>
        [
          'pain_ingredient_restriction',
          'pain_cooking_time',
          'pain_budget',
        ].includes(category.categoryId)
    );
    expect(invalidCategories.length).toBe(0);

    // 検証 10: 分類結果に日時情報が含まれていること
    expect(classificationResult).toHaveProperty('classifiedTimestamp');
    expect(classificationResult.classifiedTimestamp).toBe(
      interviewInput.timestamp
    );
  });
});