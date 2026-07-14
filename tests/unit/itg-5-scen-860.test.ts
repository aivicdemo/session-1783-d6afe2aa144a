import { classifyAndAggregateMenuRejectionReasons } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-860: [normal] 失敗パターン分類・集計機能 - 献立却下修正理由が栄養バランス・家族好み未反映・調理時間超過・食材制限漏れなどのカテゴリに正常に分類される
  test('should correctly classify menu rejection reasons into categories and aggregate counts', () => {
    const rejectionReasons = [
      {
        rejection_id: 'REJ001',
        user_id: 'USR001',
        menu_id: 'MENU001',
        reason_text: '栄養バランス不足です。タンパク質が足りません。',
        timestamp: '2024-01-15T10:30:00Z',
      },
      {
        rejection_id: 'REJ002',
        user_id: 'USR001',
        menu_id: 'MENU002',
        reason_text: '家族好みが反映されていない。子どもが好まない食材が多い。',
        timestamp: '2024-01-15T11:00:00Z',
      },
      {
        rejection_id: 'REJ003',
        user_id: 'USR001',
        menu_id: 'MENU003',
        reason_text: '調理時間が超過している。平日は30分で調理できない。',
        timestamp: '2024-01-15T11:30:00Z',
      },
      {
        rejection_id: 'REJ004',
        user_id: 'USR001',
        menu_id: 'MENU004',
        reason_text: '食材制限が漏れている。子どもが卵アレルギーなのに卵を使っている。',
        timestamp: '2024-01-15T12:00:00Z',
      },
      {
        rejection_id: 'REJ005',
        user_id: 'USR001',
        menu_id: 'MENU005',
        reason_text: 'タンパク質不足で栄養バランスが良くない。',
        timestamp: '2024-01-15T12:30:00Z',
      },
      {
        rejection_id: 'REJ006',
        user_id: 'USR002',
        menu_id: 'MENU006',
        reason_text: '子どもの好きな食材が含まれていない。家族好みに合わない。',
        timestamp: '2024-01-15T13:00:00Z',
      },
      {
        rejection_id: 'REJ007',
        user_id: 'USR002',
        menu_id: 'MENU007',
        reason_text: '調理に1時間かかる。調理時間超過している。',
        timestamp: '2024-01-15T13:30:00Z',
      },
      {
        rejection_id: 'REJ008',
        user_id: 'USR002',
        menu_id: 'MENU008',
        reason_text: '妻がナッツアレルギーなのに見落とされている。食材制限漏れ。',
        timestamp: '2024-01-15T14:00:00Z',
      },
    ];

    const result = classifyAndAggregateMenuRejectionReasons(rejectionReasons);

    // 期待される分類結果
    expect(result).toEqual({
      classifications: [
        {
          rejection_id: 'REJ001',
          reason_text: '栄養バランス不足です。タンパク質が足りません。',
          category: 'nutrition_balance',
          confidence_score: expect.any(Number),
        },
        {
          rejection_id: 'REJ002',
          reason_text: '家族好みが反映されていない。子どもが好まない食材が多い。',
          category: 'family_preference_not_reflected',
          confidence_score: expect.any(Number),
        },
        {
          rejection_id: 'REJ003',
          reason_text: '調理時間が超過している。平日は30分で調理できない。',
          category: 'cooking_time_exceeded',
          confidence_score: expect.any(Number),
        },
        {
          rejection_id: 'REJ004',
          reason_text: '食材制限が漏れている。子どもが卵アレルギーなのに卵を使っている。',
          category: 'ingredient_restriction_missing',
          confidence_score: expect.any(Number),
        },
        {
          rejection_id: 'REJ005',
          reason_text: 'タンパク質不足で栄養バランスが良くない。',
          category: 'nutrition_balance',
          confidence_score: expect.any(Number),
        },
        {
          rejection_id: 'REJ006',
          reason_text: '子どもの好きな食材が含まれていない。家族好みに合わない。',
          category: 'family_preference_not_reflected',
          confidence_score: expect.any(Number),
        },
        {
          rejection_id: 'REJ007',
          reason_text: '調理に1時間かかる。調理時間超過している。',
          category: 'cooking_time_exceeded',
          confidence_score: expect.any(Number),
        },
        {
          rejection_id: 'REJ008',
          reason_text: '妻がナッツアレルギーなのに見落とされている。食材制限漏れ。',
          category: 'ingredient_restriction_missing',
          confidence_score: expect.any(Number),
        },
      ],
      aggregation: {
        nutrition_balance: {
          count: 2,
          percentage: 25.0,
          rejection_ids: ['REJ001', 'REJ005'],
        },
        family_preference_not_reflected: {
          count: 2,
          percentage: 25.0,
          rejection_ids: ['REJ002', 'REJ006'],
        },
        cooking_time_exceeded: {
          count: 2,
          percentage: 25.0,
          rejection_ids: ['REJ003', 'REJ007'],
        },
        ingredient_restriction_missing: {
          count: 2,
          percentage: 25.0,
          rejection_ids: ['REJ004', 'REJ008'],
        },
      },
      total_count: 8,
      processing_timestamp: expect.any(String),
    });

    // 詳細な集計検証
    expect(result.aggregation.nutrition_balance.count).toBe(2);
    expect(result.aggregation.family_preference_not_reflected.count).toBe(2);
    expect(result.aggregation.cooking_time_exceeded.count).toBe(2);
    expect(result.aggregation.ingredient_restriction_missing.count).toBe(2);
    expect(result.total_count).toBe(8);

    // 各カテゴリのパーセンテージ検証（全体が100%）
    const totalPercentage =
      result.aggregation.nutrition_balance.percentage +
      result.aggregation.family_preference_not_reflected.percentage +
      result.aggregation.cooking_time_exceeded.percentage +
      result.aggregation.ingredient_restriction_missing.percentage;
    expect(totalPercentage).toBe(100.0);

    // 分類結果の正確性検証
    const nutritionClassifications = result.classifications.filter(
      (c) => c.category === 'nutrition_balance'
    );
    expect(nutritionClassifications.length).toBe(2);
    expect(nutritionClassifications.map((c) => c.rejection_id)).toEqual([
      'REJ001',
      'REJ005',
    ]);

    const preferenceClassifications = result.classifications.filter(
      (c) => c.category === 'family_preference_not_reflected'
    );
    expect(preferenceClassifications.length).toBe(2);
    expect(preferenceClassifications.map((c) => c.rejection_id)).toEqual([
      'REJ002',
      'REJ006',
    ]);

    const cookingTimeClassifications = result.classifications.filter(
      (c) => c.category === 'cooking_time_exceeded'
    );
    expect(cookingTimeClassifications.length).toBe(2);
    expect(cookingTimeClassifications.map((c) => c.rejection_id)).toEqual([
      'REJ003',
      'REJ007',
    ]);

    const restrictionClassifications = result.classifications.filter(
      (c) => c.category === 'ingredient_restriction_missing'
    );
    expect(restrictionClassifications.length).toBe(2);
    expect(restrictionClassifications.map((c) => c.rejection_id)).toEqual([
      'REJ004',
      'REJ008',
    ]);

    // 信頼度スコアが有効な範囲内（0～1）であることを検証
    result.classifications.forEach((classification) => {
      expect(classification.confidence_score).toBeGreaterThanOrEqual(0);
      expect(classification.confidence_score).toBeLessThanOrEqual(1);
    });

    // 処理タイムスタンプが ISO 8601 形式であることを検証
    expect(result.processing_timestamp).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
    );
  });
});