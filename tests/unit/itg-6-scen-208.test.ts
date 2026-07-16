import { mergeAndDeduplicateImprovementIssues } from '../../src/logic/it-8-1-1-1';

describe('ユーザーインタビュー記録と利用ログから食材制限・調理時間制限・予算制約を自動抽出・分類し優先度マトリクスを生成', () => {
  test('SCEN-208: 改善課題リスト統合・重複排除機能 - 各改善課題に影響範囲が正確に付与される', () => {
    // テストデータ: 異なる栄養項目を含む改善課題3件
    const issuesWithNutrients = [
      {
        issue_id: 'ISS-001',
        title: 'タンパク質の栄養基準を強化',
        description: 'タンパク質不足が検出されたため基準を上方修正',
        nutrient_items: ['protein'],
        user_segments: ['segment_20s_male'],
        dietary_restriction_types: ['no_restriction'],
        impact_frequency: 125,
        impact_severity: 8,
      },
      {
        issue_id: 'ISS-002',
        title: '脂質バランスの改善',
        description: '脂質比率の最適化が必要',
        nutrient_items: ['fat'],
        user_segments: ['segment_40s_female'],
        dietary_restriction_types: ['no_restriction'],
        impact_frequency: 98,
        impact_severity: 7,
      },
      {
        issue_id: 'ISS-003',
        title: '炭水化物の割合調整',
        description: '炭水化物摂取量の調整ロジックを改善',
        nutrient_items: ['carbohydrate'],
        user_segments: ['segment_60plus'],
        dietary_restriction_types: ['no_restriction'],
        impact_frequency: 87,
        impact_severity: 6,
      },
    ];

    // テストデータ: 異なるユーザーセグメントを含む改善課題3件
    const issuesWithSegments = [
      {
        issue_id: 'ISS-004',
        title: '20代男性向け献立生成改善',
        description: '20代男性の好み反映の改善',
        nutrient_items: ['protein', 'fat'],
        user_segments: ['segment_20s_male'],
        dietary_restriction_types: ['no_restriction'],
        impact_frequency: 142,
        impact_severity: 8,
      },
      {
        issue_id: 'ISS-005',
        title: '40代女性向け栄養バランス改善',
        description: '40代女性の栄養バランス改善',
        nutrient_items: ['mineral', 'vitamin'],
        user_segments: ['segment_40s_female'],
        dietary_restriction_types: ['no_restriction'],
        impact_frequency: 110,
        impact_severity: 7,
      },
      {
        issue_id: 'ISS-006',
        title: '60代以上向け調理時間短縮',
        description: '60代以上の調理時間短縮要求対応',
        nutrient_items: ['fiber'],
        user_segments: ['segment_60plus'],
        dietary_restriction_types: ['no_restriction'],
        impact_frequency: 95,
        impact_severity: 8,
      },
    ];

    // テストデータ: 異なる食事制限タイプを含む改善課題3件
    const issuesWithDietaryRestrictions = [
      {
        issue_id: 'ISS-007',
        title: 'ベジタリアン対応の強化',
        description: 'ベジタリアンユーザー向けの献立オプション拡充',
        nutrient_items: ['protein', 'vitamin_b12'],
        user_segments: ['segment_20s_male', 'segment_40s_female'],
        dietary_restriction_types: ['vegetarian'],
        impact_frequency: 156,
        impact_severity: 9,
      },
      {
        issue_id: 'ISS-008',
        title: 'グルテンフリー対応実装',
        description: 'グルテンフリー食材の自動抽出ロジック追加',
        nutrient_items: ['carbohydrate', 'fiber'],
        user_segments: ['segment_40s_female'],
        dietary_restriction_types: ['gluten_free'],
        impact_frequency: 134,
        impact_severity: 8,
      },
      {
        issue_id: 'ISS-009',
        title: '制限なしユーザー向け多様性強化',
        description: '制限のないユーザー向けの献立バリエーション増加',
        nutrient_items: ['all'],
        user_segments: ['segment_60plus'],
        dietary_restriction_types: ['no_restriction'],
        impact_frequency: 112,
        impact_severity: 6,
      },
    ];

    // すべての改善課題を統合
    const all_issues = [
      ...issuesWithNutrients,
      ...issuesWithSegments,
      ...issuesWithDietaryRestrictions,
    ];

    // 改善課題リスト統合・重複排除機能を実行
    const mergeResult = mergeAndDeduplicateImprovementIssues(all_issues);

    // 期待値: 重複排除後は9件がそのまま返される（この入力では完全な重複がないため）
    expect(mergeResult.deduplicated_issues.length).toBe(9);

    // 検証1: 各改善課題に栄養項目が正確に付与されているか確認
    const nutrient_items_result = mergeResult.deduplicated_issues.filter(
      (issue) => issuesWithNutrients.some((orig) => orig.issue_id === issue.issue_id)
    );
    expect(nutrient_items_result[0].nutrient_items).toEqual(['protein']);
    expect(nutrient_items_result[1].nutrient_items).toEqual(['fat']);
    expect(nutrient_items_result[2].nutrient_items).toEqual(['carbohydrate']);

    // 検証2: 各改善課題に付与されたユーザーセグメントを検証
    const segment_result = mergeResult.deduplicated_issues.filter(
      (issue) => issuesWithSegments.some((orig) => orig.issue_id === issue.issue_id)
    );
    expect(segment_result[0].user_segments).toEqual(['segment_20s_male']);
    expect(segment_result[1].user_segments).toEqual(['segment_40s_female']);
    expect(segment_result[2].user_segments).toEqual(['segment_60plus']);

    // 検証3: 各改善課題に付与された食事制限タイプを検証
    const dietary_result = mergeResult.deduplicated_issues.filter(
      (issue) => issuesWithDietaryRestrictions.some((orig) => orig.issue_id === issue.issue_id)
    );
    expect(dietary_result[0].dietary_restriction_types).toEqual(['vegetarian']);
    expect(dietary_result[1].dietary_restriction_types).toEqual(['gluten_free']);
    expect(dietary_result[2].dietary_restriction_types).toEqual(['no_restriction']);

    // 検証4: 重複排除されたリストから元の9件のissue_idがすべて含まれているか確認
    const result_issue_ids = mergeResult.deduplicated_issues.map((issue) => issue.issue_id);
    const expected_issue_ids = all_issues.map((issue) => issue.issue_id);
    expected_issue_ids.forEach((id) => {
      expect(result_issue_ids).toContain(id);
    });

    // 検証5: 影響範囲の組み合わせパターンが正確に保持されているか確認
    const iss_007 = mergeResult.deduplicated_issues.find((issue) => issue.issue_id === 'ISS-007');
    expect(iss_007?.nutrient_items).toEqual(['protein', 'vitamin_b12']);
    expect(iss_007?.user_segments).toEqual(['segment_20s_male', 'segment_40s_female']);
    expect(iss_007?.dietary_restriction_types).toEqual(['vegetarian']);

    const iss_004 = mergeResult.deduplicated_issues.find((issue) => issue.issue_id === 'ISS-004');
    expect(iss_004?.nutrient_items).toEqual(['protein', 'fat']);
    expect(iss_004?.user_segments).toEqual(['segment_20s_male']);
    expect(iss_004?.dietary_restriction_types).toEqual(['no_restriction']);

    // 検証6: 影響度の指標が正確に保持されているか確認
    const iss_001 = mergeResult.deduplicated_issues.find((issue) => issue.issue_id === 'ISS-001');
    expect(iss_001?.impact_frequency).toBe(125);
    expect(iss_001?.impact_severity).toBe(8);

    // 検証7: 重複排除状態の詳細情報が正確に記録されているか確認
    expect(mergeResult.deduplication_summary).toBeDefined();
    expect(mergeResult.deduplication_summary.original_count).toBe(9);
    expect(mergeResult.deduplication_summary.deduplicated_count).toBe(9);
    expect(mergeResult.deduplication_summary.duplicate_count).toBe(0);

    // 検証8: すべての改善課題に対して誤った属性の割り当てがないか確認
    mergeResult.deduplicated_issues.forEach((issue) => {
      expect(issue.nutrient_items).toBeDefined();
      expect(Array.isArray(issue.nutrient_items)).toBe(true);
      expect(issue.nutrient_items.length).toBeGreaterThan(0);

      expect(issue.user_segments).toBeDefined();
      expect(Array.isArray(issue.user_segments)).toBe(true);
      expect(issue.user_segments.length).toBeGreaterThan(0);

      expect(issue.dietary_restriction_types).toBeDefined();
      expect(Array.isArray(issue.dietary_restriction_types)).toBe(true);
      expect(issue.dietary_restriction_types.length).toBeGreaterThan(0);
    });

    // 検証9: 影響範囲の欠落がないか確認
    const iss_006 = mergeResult.deduplicated_issues.find((issue) => issue.issue_id === 'ISS-006');
    expect(iss_006?.nutrient_items).not.toEqual([]);
    expect(iss_006?.user_segments).not.toEqual([]);
    expect(iss_006?.dietary_restriction_types).not.toEqual([]);
  });
});