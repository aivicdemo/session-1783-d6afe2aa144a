import { analyzeMenuGenerationFailurePatterns } from '../../src/logic/it-8-1-1-1';

describe('献立生成失敗パターン分類・影響度分析', () => {
  // SCEN-245
  test('複数の失敗パターンデータから栄養バランス・家族好み未反映・調理時間超過・食材制限漏れなどのカテゴリに自動分類され、各カテゴリの発生頻度と改善優先度が算出される', () => {
    // テストデータ: 複数の献立生成失敗パターン（最小10件以上）
    const failure_patterns = [
      {
        failure_id: 'fail_001',
        user_id: 'user_001',
        menu_id: 'menu_001',
        rejection_reason: '栄養バランスが偏っている。もっとタンパク質を増やしてほしい',
        rejection_timestamp: '2024-01-15T10:00:00Z',
        impact_score: 8,
      },
      {
        failure_id: 'fail_002',
        user_id: 'user_002',
        menu_id: 'menu_002',
        rejection_reason: '家族が嫌いな食材が含まれている。子どもが納豆を食べない',
        rejection_timestamp: '2024-01-15T10:15:00Z',
        impact_score: 7,
      },
      {
        failure_id: 'fail_003',
        user_id: 'user_003',
        menu_id: 'menu_003',
        rejection_reason: '調理時間が45分で、30分以内という要望に対応していない',
        rejection_timestamp: '2024-01-15T10:30:00Z',
        impact_score: 9,
      },
      {
        failure_id: 'fail_004',
        user_id: 'user_004',
        menu_id: 'menu_004',
        rejection_reason: '子どものピーナッツアレルギーを入力したはずなのに、ピーナッツが使われた',
        rejection_timestamp: '2024-01-15T10:45:00Z',
        impact_score: 10,
      },
      {
        failure_id: 'fail_005',
        user_id: 'user_001',
        menu_id: 'menu_005',
        rejection_reason: '栄養バランスが取れていない。野菜をもっと増やしてほしい',
        rejection_timestamp: '2024-01-15T11:00:00Z',
        impact_score: 7,
      },
      {
        failure_id: 'fail_006',
        user_id: 'user_002',
        menu_id: 'menu_006',
        rejection_reason: '夫が嫌いなニンジンが含まれている',
        rejection_timestamp: '2024-01-15T11:15:00Z',
        impact_score: 6,
      },
      {
        failure_id: 'fail_007',
        user_id: 'user_005',
        menu_id: 'menu_007',
        rejection_reason: '調理時間が50分で、40分以内の制限を超えている',
        rejection_timestamp: '2024-01-15T11:30:00Z',
        impact_score: 8,
      },
      {
        failure_id: 'fail_008',
        user_id: 'user_003',
        menu_id: 'menu_008',
        rejection_reason: '妻が卵アレルギーなので卵を使わない献立にしてほしい。しかし卵が入っている',
        rejection_timestamp: '2024-01-15T11:45:00Z',
        impact_score: 9,
      },
      {
        failure_id: 'fail_009',
        user_id: 'user_006',
        menu_id: 'menu_009',
        rejection_reason: 'その他の理由で却下',
        rejection_timestamp: '2024-01-15T12:00:00Z',
        impact_score: 3,
      },
      {
        failure_id: 'fail_010',
        user_id: 'user_004',
        menu_id: 'menu_010',
        rejection_reason: '栄養バランスと調理時間の両方の問題がある。栄養が不十分で時間も30分超える',
        rejection_timestamp: '2024-01-15T12:15:00Z',
        impact_score: 8,
      },
      {
        failure_id: 'fail_011',
        user_id: 'user_001',
        menu_id: 'menu_011',
        rejection_reason: '家族の好みに合っていない。もっと和食にしてほしい',
        rejection_timestamp: '2024-01-15T12:30:00Z',
        impact_score: 5,
      },
      {
        failure_id: 'fail_012',
        user_id: 'user_005',
        menu_id: 'menu_012',
        rejection_reason: '乳製品アレルギーの家族がいるのに、チーズを使ったパスタが提案された',
        rejection_timestamp: '2024-01-15T12:45:00Z',
        impact_score: 9,
      },
    ];

    // 分類処理を実行
    const result = analyzeMenuGenerationFailurePatterns(failure_patterns);

    // 検証1: 結果の基本構造を確認
    expect(result).toBeDefined();
    expect(Array.isArray(result.categories)).toBe(true);
    expect(result.total_patterns).toBe(12);
    expect(result.analyzed_timestamp).toBeDefined();

    // 検証2: 各カテゴリの分類と発生頻度
    // 栄養バランス未反映: fail_001, fail_005, fail_010 = 3件
    // 家族好み未反映: fail_002, fail_006, fail_011 = 3件
    // 調理時間超過: fail_003, fail_007 = 2件
    // 食材制限漏れ: fail_004, fail_008, fail_012 = 3件
    // その他: fail_009 = 1件
    const nutrition_category = result.categories.find((cat: any) => cat.category_name === 'nutrition_imbalance');
    expect(nutrition_category).toBeDefined();
    expect(nutrition_category.failure_count).toBe(3);
    expect(nutrition_category.affected_patterns).toContain('fail_001');
    expect(nutrition_category.affected_patterns).toContain('fail_005');
    expect(nutrition_category.affected_patterns).toContain('fail_010');

    const preference_category = result.categories.find((cat: any) => cat.category_name === 'family_preference_mismatch');
    expect(preference_category).toBeDefined();
    expect(preference_category.failure_count).toBe(3);
    expect(preference_category.affected_patterns).toContain('fail_002');
    expect(preference_category.affected_patterns).toContain('fail_006');
    expect(preference_category.affected_patterns).toContain('fail_011');

    const cooking_time_category = result.categories.find((cat: any) => cat.category_name === 'cooking_time_exceeded');
    expect(cooking_time_category).toBeDefined();
    expect(cooking_time_category.failure_count).toBe(2);
    expect(cooking_time_category.affected_patterns).toContain('fail_003');
    expect(cooking_time_category.affected_patterns).toContain('fail_007');

    const allergen_category = result.categories.find((cat: any) => cat.category_name === 'allergen_restriction_missed');
    expect(allergen_category).toBeDefined();
    expect(allergen_category.failure_count).toBe(3);
    expect(allergen_category.affected_patterns).toContain('fail_004');
    expect(allergen_category.affected_patterns).toContain('fail_008');
    expect(allergen_category.affected_patterns).toContain('fail_012');

    const other_category = result.categories.find((cat: any) => cat.category_name === 'other');
    expect(other_category).toBeDefined();
    expect(other_category.failure_count).toBe(1);
    expect(other_category.affected_patterns).toContain('fail_009');

    // 検証3: 改善優先度スコアが算出されていることを確認
    result.categories.forEach((cat: any) => {
      expect(cat.priority_score).toBeDefined();
      expect(typeof cat.priority_score).toBe('number');
      expect(cat.priority_score).toBeGreaterThanOrEqual(0);
      expect(cat.priority_score).toBeLessThanOrEqual(100);
    });

    // 検証4: 平均影響度スコアを確認
    // nutrition_imbalance: (8 + 7 + 8) / 3 = 7.67
    expect(nutrition_category.avg_impact_score).toBeCloseTo(7.67, 1);
    // family_preference_mismatch: (7 + 6 + 5) / 3 = 6.0
    expect(preference_category.avg_impact_score).toBeCloseTo(6.0, 1);
    // cooking_time_exceeded: (9 + 8) / 2 = 8.5
    expect(cooking_time_category.avg_impact_score).toBeCloseTo(8.5, 1);
    // allergen_restriction_missed: (10 + 9 + 9) / 3 = 9.33
    expect(allergen_category.avg_impact_score).toBeCloseTo(9.33, 1);
    // other: 3 / 1 = 3.0
    expect(other_category.avg_impact_score).toBe(3.0);

    // 検証5: 優先度スコアの計算方式確認
    // priority_score = (failure_count / total_patterns) * 40 + (avg_impact_score / 10) * 60
    // nutrition_imbalance: (3 / 12) * 40 + (7.67 / 10) * 60 = 10 + 46.02 = 56.02
    expect(nutrition_category.priority_score).toBeCloseTo(56.02, 1);
    // allergen_restriction_missed: (3 / 12) * 40 + (9.33 / 10) * 60 = 10 + 55.98 = 65.98
    expect(allergen_category.priority_score).toBeCloseTo(65.98, 1);
    // cooking_time_exceeded: (2 / 12) * 40 + (8.5 / 10) * 60 = 6.67 + 51 = 57.67
    expect(cooking_time_category.priority_score).toBeCloseTo(57.67, 1);
    // family_preference_mismatch: (3 / 12) * 40 + (6.0 / 10) * 60 = 10 + 36 = 46.0
    expect(preference_category.priority_score).toBe(46.0);
    // other: (1 / 12) * 40 + (3.0 / 10) * 60 = 3.33 + 18 = 21.33
    expect(other_category.priority_score).toBeCloseTo(21.33, 1);

    // 検証6: 優先度スコアが高い順にソートされていることを確認
    const sorted_categories = result.categories;
    for (let i = 0; i < sorted_categories.length - 1; i++) {
      expect(sorted_categories[i].priority_score).toBeGreaterThanOrEqual(sorted_categories[i + 1].priority_score);
    }

    // 検証7: 最も優先度が高いのは allergen_restriction_missed（65.98）であることを確認
    expect(sorted_categories[0].category_name).toBe('allergen_restriction_missed');
    expect(sorted_categories[0].priority_score).toBeCloseTo(65.98, 1);

    // 検証8: JSON形式での出力を確認
    const json_output = JSON.stringify(result);
    expect(typeof json_output).toBe('string');
    expect(json_output).toContain('nutrition_imbalance');
    expect(json_output).toContain('family_preference_mismatch');
    expect(json_output).toContain('cooking_time_exceeded');
    expect(json_output).toContain('allergen_restriction_missed');
    expect(json_output).toContain('priority_score');

    // 検証9: エッジケース - 複数カテゴリに該当するパターン（fail_010）の処理
    // fail_010は「栄養バランスと調理時間の両方の問題」なので、複数分類として扱われることを確認
    expect(nutrition_category.affected_patterns).toContain('fail_010');
    expect(cooking_time_category.affected_patterns).toContain('fail_010');

    // 検証10: 全失敗パターンが何らかのカテゴリに分類されていることを確認
    const all_classified_patterns = new Set();
    result.categories.forEach((cat: any) => {
      cat.affected_patterns.forEach((pattern: string) => {
        all_classified_patterns.add(pattern);
      });
    });
    expect(all_classified_patterns.size).toBeGreaterThanOrEqual(failure_patterns.length - 1); // -1は複数分類の可能性

    // 検証11: 結果がTimestampを持ち、ISO形式であることを確認
    expect(result.analyzed_timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);

    // 検証12: カテゴリ数が5以上であることを確認（事前定義カテゴリ）
    expect(result.categories.length).toBeGreaterThanOrEqual(5);
  });
});