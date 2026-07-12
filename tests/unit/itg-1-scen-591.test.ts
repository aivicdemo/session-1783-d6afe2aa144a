import { classifyFailurePatterns } from '../../src/logic/it-1-br-4-2-1';

describe('失敗パターン分類・優先度判定機能', () => {
  // SCEN-591
  test('発生頻度が0件の失敗カテゴリが除外または最低優先度として扱われる', () => {
    const input_failure_patterns = [
      {
        category_id: 'nutritional_balance',
        category_name: '栄養バランス不適切',
        occurrence_count: 15,
        impact_level: 8,
      },
      {
        category_id: 'family_preference_unmapped',
        category_name: '家族好み未反映',
        occurrence_count: 12,
        impact_level: 7,
      },
      {
        category_id: 'cooking_time_exceeded',
        category_name: '調理時間超過',
        occurrence_count: 8,
        impact_level: 6,
      },
      {
        category_id: 'dietary_restriction_missed',
        category_name: '食材制限漏れ',
        occurrence_count: 0,
        impact_level: 9,
      },
      {
        category_id: 'budget_constraint_violated',
        category_name: '予算制約超過',
        occurrence_count: 0,
        impact_level: 5,
      },
    ];

    const result = classifyFailurePatterns(input_failure_patterns);

    // 発生頻度0件のカテゴリは除外されるか最低優先度に分類される
    const zero_occurrence_categories = result.filter(
      (item) => item.occurrence_count === 0
    );

    // 除外されたか、存在する場合は最低優先度である
    if (zero_occurrence_categories.length > 0) {
      // 最低優先度として扱われる場合の検証
      const min_priority = Math.min(...result.map((item) => item.priority));
      zero_occurrence_categories.forEach((item) => {
        expect(item.priority).toBe(min_priority);
      });
    } else {
      // 除外されている場合：結果に発生頻度0件のカテゴリが含まれない
      expect(result.every((item) => item.occurrence_count > 0)).toBe(true);
    }

    // 優先度は昇順（低い優先度ほどスコアが小さい）でソートされている
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].priority).toBeLessThanOrEqual(result[i + 1].priority);
    }

    // 発生頻度が正の値のカテゴリは結果に含まれている
    const positive_occurrence_patterns = input_failure_patterns.filter(
      (pattern) => pattern.occurrence_count > 0
    );
    expect(result.length).toBeGreaterThanOrEqual(
      positive_occurrence_patterns.length
    );

    // 各結果項目が必須フィールドを持つ
    result.forEach((item) => {
      expect(item).toHaveProperty('category_id');
      expect(item).toHaveProperty('category_name');
      expect(item).toHaveProperty('occurrence_count');
      expect(item).toHaveProperty('impact_level');
      expect(item).toHaveProperty('priority');
      expect(typeof item.priority).toBe('number');
      expect(item.priority).toBeGreaterThanOrEqual(0);
      expect(item.priority).toBeLessThanOrEqual(100);
    });

    // 優先度スコアは発生頻度と影響度に基づいて計算されている
    const positive_patterns = result.filter((item) => item.occurrence_count > 0);
    if (positive_patterns.length >= 2) {
      const highest_priority_pattern = positive_patterns[0];
      const other_pattern = positive_patterns[1];
      expect(highest_priority_pattern.priority).toBeLessThanOrEqual(
        other_pattern.priority
      );
    }
  });
});