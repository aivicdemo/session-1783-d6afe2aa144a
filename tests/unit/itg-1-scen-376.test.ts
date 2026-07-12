import { classifyRejectReasonAndAggregateFailurePatterns } from '../../src/logic/it-1-br-1783670064270-1-1-1';

describe('献立却下理由の自動カテゴリ分類と失敗パターン集計', () => {
  // SCEN-376: [normal] 献立却下理由の自動カテゴリ分類機能 - 分類されたテキストから失敗パターンが集計され改善優先度が可視化される
  test('過去30日間の却下献立10件以上から却下理由を自動分類し、失敗パターンを集計して改善優先度を可視化する', () => {
    const reject_reasons = [
      { reason_text: '塩辛すぎて子どもが食べられない', menu_id: 'menu_001', rejected_at: '2024-01-10T18:30:00Z' },
      { reason_text: '子どもが嫌いなトマトが入っていた', menu_id: 'menu_002', rejected_at: '2024-01-12T19:00:00Z' },
      { reason_text: '調理に1時間30分かかってしまった', menu_id: 'menu_003', rejected_at: '2024-01-14T17:45:00Z' },
      { reason_text: '栄養バランスが取れていない気がする', menu_id: 'menu_004', rejected_at: '2024-01-15T18:15:00Z' },
      { reason_text: '家族の好みに合わない献立だった', menu_id: 'menu_005', rejected_at: '2024-01-16T19:30:00Z' },
      { reason_text: '調理時間が長すぎてストレス', menu_id: 'menu_006', rejected_at: '2024-01-18T16:20:00Z' },
      { reason_text: '卵アレルギーのある娘が食べられない食材が入っていた', menu_id: 'menu_007', rejected_at: '2024-01-20T18:45:00Z' },
      { reason_text: '家族全員の好みが反映されていない', menu_id: 'menu_008', rejected_at: '2024-01-21T19:10:00Z' },
      { reason_text: '調理に90分もかかった', menu_id: 'menu_009', rejected_at: '2024-01-22T17:30:00Z' },
      { reason_text: 'タンパク質不足という栄養バランスの問題がある', menu_id: 'menu_010', rejected_at: '2024-01-23T18:00:00Z' },
      { reason_text: 'アレルギー対応が不完全だった', menu_id: 'menu_011', rejected_at: '2024-01-24T19:20:00Z' },
    ];

    const result = classifyRejectReasonAndAggregateFailurePatterns({
      reject_reasons_list: reject_reasons,
      analysis_start_date: '2024-01-01',
      analysis_end_date: '2024-01-30',
    });

    // 分類結果が正常に返却されることを確認
    expect(result).toBeDefined();
    expect(result.classified_categories).toBeDefined();
    expect(Array.isArray(result.classified_categories)).toBe(true);

    // 分類されたカテゴリが存在することを確認
    expect(result.classified_categories.length).toBeGreaterThanOrEqual(4);

    // カテゴリ名が事前定義されたものであることを確認
    const category_names = result.classified_categories.map((cat: any) => cat.category_name);
    const valid_categories = ['栄養バランス', '家族好み未反映', '調理時間超過', '食材制限漏れ'];
    category_names.forEach((name: string) => {
      expect(valid_categories).toContain(name);
    });

    // 集計結果に各カテゴリの発生頻度が含まれることを確認
    const aggregated_patterns = result.aggregated_failure_patterns;
    expect(aggregated_patterns).toBeDefined();
    expect(Array.isArray(aggregated_patterns)).toBe(true);
    expect(aggregated_patterns.length).toBeGreaterThanOrEqual(4);

    // 発生頻度が降順でソートされていることを確認
    for (let i = 0; i < aggregated_patterns.length - 1; i++) {
      expect(aggregated_patterns[i].occurrence_count).toBeGreaterThanOrEqual(
        aggregated_patterns[i + 1].occurrence_count
      );
    }

    // 優先度スコアが計算されていることを確認
    const priority_visualization = result.priority_visualization;
    expect(priority_visualization).toBeDefined();
    expect(priority_visualization.ranking_list).toBeDefined();
    expect(Array.isArray(priority_visualization.ranking_list)).toBe(true);

    // ランキングリストが優先度順に表示されていることを確認
    const ranking_list = priority_visualization.ranking_list;
    expect(ranking_list.length).toBeGreaterThanOrEqual(4);

    // 最も発生頻度が高いカテゴリが最優先（ランク1）として表示されていることを確認
    expect(ranking_list[0].priority_rank).toBe(1);
    expect(ranking_list[0].priority_score).toBeGreaterThan(0);

    // 各ランキング項目の優先度スコアが降順でソートされていることを確認
    for (let i = 0; i < ranking_list.length - 1; i++) {
      expect(ranking_list[i].priority_score).toBeGreaterThanOrEqual(ranking_list[i + 1].priority_score);
      expect(ranking_list[i].priority_rank).toBeLessThan(ranking_list[i + 1].priority_rank);
    }

    // グラフデータが生成されていることを確認
    expect(priority_visualization.graph_data).toBeDefined();
    expect(priority_visualization.graph_data.chart_type).toBe('bar');
    expect(Array.isArray(priority_visualization.graph_data.series_data)).toBe(true);
    expect(priority_visualization.graph_data.series_data.length).toBe(ranking_list.length);

    // 家族好み未反映カテゴリの発生頻度が検証される
    const family_preference_category = aggregated_patterns.find(
      (p: any) => p.category_name === '家族好み未反映'
    );
    expect(family_preference_category).toBeDefined();
    expect(family_preference_category.occurrence_count).toBeGreaterThanOrEqual(2);

    // 調理時間超過カテゴリの発生頻度が検証される
    const cooking_time_category = aggregated_patterns.find(
      (p: any) => p.category_name === '調理時間超過'
    );
    expect(cooking_time_category).toBeDefined();
    expect(cooking_time_category.occurrence_count).toBeGreaterThanOrEqual(2);

    // 食材制限漏れカテゴリの発生頻度が検証される
    const allergy_constraint_category = aggregated_patterns.find(
      (p: any) => p.category_name === '食材制限漏れ'
    );
    expect(allergy_constraint_category).toBeDefined();
    expect(allergy_constraint_category.occurrence_count).toBeGreaterThanOrEqual(2);

    // 栄養バランスカテゴリの発生頻度が検証される
    const nutrition_category = aggregated_patterns.find(
      (p: any) => p.category_name === '栄養バランス'
    );
    expect(nutrition_category).toBeDefined();
    expect(nutrition_category.occurrence_count).toBeGreaterThanOrEqual(2);

    // 集計対象件数が正確に記録されていることを確認
    const total_processed_count = aggregated_patterns.reduce(
      (sum: number, p: any) => sum + p.occurrence_count,
      0
    );
    expect(total_processed_count).toBe(11);

    // 優先度可視化に必須のメタデータが含まれることを確認
    expect(priority_visualization.analysis_date).toBeDefined();
    expect(priority_visualization.analysis_date).toBe('2024-01-30');
    expect(priority_visualization.total_analyzed_count).toBe(11);
    expect(priority_visualization.analysis_period_days).toBe(30);
  });
});