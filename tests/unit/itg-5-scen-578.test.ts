import { categorizeMealRejectReasons } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計', () => {
  // SCEN-578: [normal] 献立却下修正理由の自動カテゴリ分類機能 - 失敗パターン集計により、改善優先度が正確に可視化される
  test('should classify meal rejection reasons automatically and calculate improvement priority scores accurately', () => {
    // Prepare test dataset with 50+ rejection reasons
    const rejectReasonsDataset = [
      // Nutritional imbalance category (15 occurrences)
      { id: 1, reason_text: 'たんぱく質が足りない', user_id: 'user001', timestamp: '2024-01-15T10:00:00Z' },
      { id: 2, reason_text: 'タンパク質が不足している', user_id: 'user002', timestamp: '2024-01-15T11:00:00Z' },
      { id: 3, reason_text: 'ビタミンが不足', user_id: 'user003', timestamp: '2024-01-15T12:00:00Z' },
      { id: 4, reason_text: '野菜が少ない', user_id: 'user004', timestamp: '2024-01-15T13:00:00Z' },
      { id: 5, reason_text: 'カロリーが高すぎる', user_id: 'user005', timestamp: '2024-01-15T14:00:00Z' },
      { id: 6, reason_text: '栄養バランスが悪い', user_id: 'user006', timestamp: '2024-01-15T15:00:00Z' },
      { id: 7, reason_text: '塩分が多すぎる', user_id: 'user007', timestamp: '2024-01-15T16:00:00Z' },
      { id: 8, reason_text: '糖質が高い', user_id: 'user008', timestamp: '2024-01-15T17:00:00Z' },
      { id: 9, reason_text: '食物繊維が足りない', user_id: 'user009', timestamp: '2024-01-15T18:00:00Z' },
      { id: 10, reason_text: 'たんぱく質が少ない', user_id: 'user010', timestamp: '2024-01-16T10:00:00Z' },
      { id: 11, reason_text: 'ミネラル不足', user_id: 'user011', timestamp: '2024-01-16T11:00:00Z' },
      { id: 12, reason_text: '栄養が偏っている', user_id: 'user012', timestamp: '2024-01-16T12:00:00Z' },
      { id: 13, reason_text: 'ビタミンD不足', user_id: 'user013', timestamp: '2024-01-16T13:00:00Z' },
      { id: 14, reason_text: '鉄分不足', user_id: 'user014', timestamp: '2024-01-16T14:00:00Z' },
      { id: 15, reason_text: 'カルシウムが不足', user_id: 'user015', timestamp: '2024-01-16T15:00:00Z' },

      // Family preference not reflected category (18 occurrences)
      { id: 16, reason_text: '子どもが嫌いな食材が入っている', user_id: 'user016', timestamp: '2024-01-16T16:00:00Z' },
      { id: 17, reason_text: '家族の好みに合わない', user_id: 'user017', timestamp: '2024-01-16T17:00:00Z' },
      { id: 18, reason_text: '妻が嫌いな野菜が含まれている', user_id: 'user018', timestamp: '2024-01-16T18:00:00Z' },
      { id: 19, reason_text: '子どもが食べない料理', user_id: 'user019', timestamp: '2024-01-17T10:00:00Z' },
      { id: 20, reason_text: 'リクエストした食材が入っていない', user_id: 'user020', timestamp: '2024-01-17T11:00:00Z' },
      { id: 21, reason_text: '家族の好みに合わない料理', user_id: 'user021', timestamp: '2024-01-17T12:00:00Z' },
      { id: 22, reason_text: '同じ料理ばかりで飽きた', user_id: 'user022', timestamp: '2024-01-17T13:00:00Z' },
      { id: 23, reason_text: 'リクエスト料理が入っていない', user_id: 'user023', timestamp: '2024-01-17T14:00:00Z' },
      { id: 24, reason_text: 'この食材が嫌い', user_id: 'user024', timestamp: '2024-01-17T15:00:00Z' },
      { id: 25, reason_text: '家族の嗜好を反映していない', user_id: 'user025', timestamp: '2024-01-17T16:00:00Z' },
      { id: 26, reason_text: '子どもが好きな料理がない', user_id: 'user026', timestamp: '2024-01-17T17:00:00Z' },
      { id: 27, reason_text: '毎週同じメニューで飽きた', user_id: 'user027', timestamp: '2024-01-17T18:00:00Z' },
      { id: 28, reason_text: 'リクエストした料理が含まれていない', user_id: 'user028', timestamp: '2024-01-18T10:00:00Z' },
      { id: 29, reason_text: '家族が嫌いな組み合わせ', user_id: 'user029', timestamp: '2024-01-18T11:00:00Z' },
      { id: 30, reason_text: '好みの献立ではない', user_id: 'user030', timestamp: '2024-01-18T12:00:00Z' },
      { id: 31, reason_text: '子どもの好きな食材が少ない', user_id: 'user031', timestamp: '2024-01-18T13:00:00Z' },
      { id: 32, reason_text: '特定食材アレルギー対応が不正確', user_id: 'user032', timestamp: '2024-01-18T14:00:00Z' },
      { id: 33, reason_text: 'リクエスト食材が反映されていない', user_id: 'user033', timestamp: '2024-01-18T15:00:00Z' },

      // Cooking time exceeded category (12 occurrences)
      { id: 34, reason_text: '調理時間が長すぎる', user_id: 'user034', timestamp: '2024-01-18T16:00:00Z' },
      { id: 35, reason_text: '30分以内に調理できない', user_id: 'user035', timestamp: '2024-01-18T17:00:00Z' },
      { id: 36, reason_text: '準備時間が多すぎる', user_id: 'user036', timestamp: '2024-01-18T18:00:00Z' },
      { id: 37, reason_text: '調理が複雑', user_id: 'user037', timestamp: '2024-01-19T10:00:00Z' },
      { id: 38, reason_text: '朝の調理時間に間に合わない', user_id: 'user038', timestamp: '2024-01-19T11:00:00Z' },
      { id: 39, reason_text: '時間がかかりすぎる料理', user_id: 'user039', timestamp: '2024-01-19T12:00:00Z' },
      { id: 40, reason_text: '下準備に時間がかかる', user_id: 'user040', timestamp: '2024-01-19T13:00:00Z' },
      { id: 41, reason_text: '45分以上かかる献立', user_id: 'user041', timestamp: '2024-01-19T14:00:00Z' },
      { id: 42, reason_text: '夜間調理時間が不足', user_id: 'user042', timestamp: '2024-01-19T15:00:00Z' },
      { id: 43, reason_text: '仕込みに時間がかかる', user_id: 'user043', timestamp: '2024-01-19T16:00:00Z' },
      { id: 44, reason_text: 'クッキング時間が長い', user_id: 'user044', timestamp: '2024-01-19T17:00:00Z' },
      { id: 45, reason_text: '予定時間を超えている', user_id: 'user045', timestamp: '2024-01-19T18:00:00Z' },

      // Food material restriction miss category (8 occurrences)
      { id: 46, reason_text: 'アレルギー食材が入っている', user_id: 'user046', timestamp: '2024-01-20T10:00:00Z' },
      { id: 47, reason_text: 'エビアレルギーが反映されていない', user_id: 'user047', timestamp: '2024-01-20T11:00:00Z' },
      { id: 48, reason_text: '乳製品不可が無視されている', user_id: 'user048', timestamp: '2024-01-20T12:00:00Z' },
      { id: 49, reason_text: '制限食材が含まれている', user_id: 'user049', timestamp: '2024-01-20T13:00:00Z' },
      { id: 50, reason_text: '豚肉を避けてほしいのに入っている', user_id: 'user050', timestamp: '2024-01-20T14:00:00Z' },
      { id: 51, reason_text: '制限条件が反映されていない', user_id: 'user051', timestamp: '2024-01-20T15:00:00Z' },
      { id: 52, reason_text: 'グルテンフリー対応が不正確', user_id: 'user052', timestamp: '2024-01-20T16:00:00Z' },
      { id: 53, reason_text: 'ナッツアレルギーが無視されている', user_id: 'user053', timestamp: '2024-01-20T17:00:00Z' },
    ];

    // Execute automatic categorization logic
    const result = categorizeMealRejectReasons(rejectReasonsDataset);

    // Verify categorization results structure
    expect(result).toHaveProperty('categories');
    expect(result).toHaveProperty('failurePatternAggregation');
    expect(result).toHaveProperty('improvementPriorityScores');

    // Verify nutritional imbalance category classification (15 items)
    const nutritionalCategory = result.categories.find(
      (cat: any) => cat.category_name === 'nutritional_imbalance'
    );
    expect(nutritionalCategory).toBeDefined();
    expect(nutritionalCategory.classified_reasons).toHaveLength(15);
    expect(nutritionalCategory.occurrence_count).toBe(15);

    // Verify family preference not reflected category classification (18 items)
    const preferenceCategory = result.categories.find(
      (cat: any) => cat.category_name === 'family_preference_not_reflected'
    );
    expect(preferenceCategory).toBeDefined();
    expect(preferenceCategory.classified_reasons).toHaveLength(18);
    expect(preferenceCategory.occurrence_count).toBe(18);

    // Verify cooking time exceeded category classification (12 items)
    const cookingTimeCategory = result.categories.find(
      (cat: any) => cat.category_name === 'cooking_time_exceeded'
    );
    expect(cookingTimeCategory).toBeDefined();
    expect(cookingTimeCategory.classified_reasons).toHaveLength(12);
    expect(cookingTimeCategory.occurrence_count).toBe(12);

    // Verify food material restriction miss category classification (8 items)
    const restrictionCategory = result.categories.find(
      (cat: any) => cat.category_name === 'food_material_restriction_miss'
    );
    expect(restrictionCategory).toBeDefined();
    expect(restrictionCategory.classified_reasons).toHaveLength(8);
    expect(restrictionCategory.occurrence_count).toBe(8);

    // Verify total classified reasons count
    const totalClassifiedCount = result.categories.reduce(
      (sum: number, cat: any) => sum + cat.occurrence_count,
      0
    );
    expect(totalClassifiedCount).toBe(53);

    // Verify failure pattern aggregation structure
    expect(result.failurePatternAggregation).toHaveProperty('total_samples');
    expect(result.failurePatternAggregation.total_samples).toBe(53);
    expect(result.failurePatternAggregation).toHaveProperty('patterns_by_category');
    expect(Array.isArray(result.failurePatternAggregation.patterns_by_category)).toBe(true);

    // Define impact weight for each category
    const categoryImpactWeight: { [key: string]: number } = {
      nutritional_imbalance: 0.8,
      family_preference_not_reflected: 1.0,
      cooking_time_exceeded: 0.9,
      food_material_restriction_miss: 1.2,
    };

    // Calculate expected improvement priority scores
    // Priority Score = (occurrence_count / total_samples) * 100 * impact_weight
    const expected_nutritional_score =
      (15 / 53) * 100 * categoryImpactWeight['nutritional_imbalance'];
    const expected_preference_score =
      (18 / 53) * 100 * categoryImpactWeight['family_preference_not_reflected'];
    const expected_cooking_time_score =
      (12 / 53) * 100 * categoryImpactWeight['cooking_time_exceeded'];
    const expected_restriction_score =
      (8 / 53) * 100 * categoryImpactWeight['food_material_restriction_miss'];

    // Verify improvement priority scores are calculated accurately
    expect(result.improvementPriorityScores).toHaveLength(4);

    // Verify scores are sorted in descending order (highest priority first)
    for (let i = 0; i < result.improvementPriorityScores.length - 1; i++) {
      expect(result.improvementPriorityScores[i].priority_score).toBeGreaterThanOrEqual(
        result.improvementPriorityScores[i + 1].priority_score
      );
    }

    // Verify top 3 improvement priorities match actual failure frequency
    const top3Categories = result.improvementPriorityScores.slice(0, 3);
    expect(top3Categories[0].category_name).toBe('family_preference_not_reflected');
    expect(Math.round(top3Categories[0].priority_score * 100) / 100).toBe(
      Math.round(expected_preference_score * 100) / 100
    );

    expect(top3Categories[1].category_name).toBe('food_material_restriction_miss');
    expect(Math.round(top3Categories[1].priority_score * 100) / 100).toBe(
      Math.round(expected_restriction_score * 100) / 100
    );

    expect(top3Categories[2].category_name).toBe('cooking_time_exceeded');
    expect(Math.round(top3Categories[2].priority_score * 100) / 100).toBe(
      Math.round(expected_cooking_time_score * 100) / 100
    );

    // Verify exact score calculations with multiple patterns
    const preference_pattern = result.failurePatternAggregation.patterns_by_category.find(
      (pat: any) => pat.category_name === 'family_preference_not_reflected'
    );
    expect(preference_pattern.occurrence_count).toBe(18);
    expect(preference_pattern.frequency_percentage).toBe(
      Math.round((18 / 53) * 10000) / 100
    );

    const nutritional_pattern = result.failurePatternAggregation.patterns_by_category.find(
      (pat: any) => pat.category_name === 'nutritional_imbalance'
    );
    expect(nutritional_pattern.occurrence_count).toBe(15);
    expect(nutritional_pattern.frequency_percentage).toBe(
      Math.round((15 / 53) * 10000) / 100
    );

    // Verify visualization elements accurately represent priority levels
    expect(result.improvementPriorityScores[0]).toHaveProperty('visualization_level');
    expect(result.improvementPriorityScores[0].visualization_level).toBe('critical');

    expect(result.improvementPriorityScores[1]).toHaveProperty('visualization_level');
    expect(['high', 'critical']).toContain(result.improvementPriorityScores[1].visualization_level);

    expect(result.improvementPriorityScores[3]).toHaveProperty('visualization_level');
    expect(['low', 'medium']).toContain(result.improvementPriorityScores[3].visualization_level);

    // Verify relative ranking relationship within same category is maintained
    const all_nutritional_reasons = result.categories.find(
      (cat: any) => cat.category_name === 'nutritional_imbalance'
    ).classified_reasons;
    expect(all_nutritional_reasons.length).toBe(15);
    expect(all_nutritional_reasons.every((reason: any) => reason.category_name === 'nutritional_imbalance')).toBe(
      true
    );

    // Verify that aggregation maintains data integrity
    const total_from_categories = result.categories.reduce(
      (sum: number, cat: any) => sum + cat.classified_reasons.length,
      0
    );
    expect(total_from_categories).toBe(53);
  });
});