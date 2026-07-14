import { classifyMealRejectReason } from '../../src/logic/it-7-3-1';

describe('献立却下修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-809: 複数カテゴリに該当する曖昧な理由テキストに対して、信頼度スコアが最も高いカテゴリに分類される
  test('複数カテゴリ該当の曖昧なテキストで最高スコアカテゴリが選択される', () => {
    // テストケース1: 「栄養バランスと原価が高い」（栄養・予算の複数カテゴリ該当）
    const ambiguous_text_1 = '栄養バランスと原価が高い';
    const result_1 = classifyMealRejectReason({
      reason_text: ambiguous_text_1,
      timestamp: '2024-01-15T10:30:00Z',
      user_id: 'usr_001'
    });

    // 複数カテゴリに該当する場合、最高スコアのカテゴリが選択される
    expect(result_1.primary_category).toBeDefined();
    expect(typeof result_1.primary_category).toBe('string');
    
    // 分類結果にすべてのカテゴリスコアが含まれる
    expect(result_1.category_scores).toBeDefined();
    expect(typeof result_1.category_scores).toBe('object');
    
    // 栄養カテゴリスコア確認
    expect(result_1.category_scores.nutrition).toBeGreaterThanOrEqual(0);
    expect(result_1.category_scores.nutrition).toBeLessThanOrEqual(100);
    
    // 予算カテゴリスコア確認
    expect(result_1.category_scores.budget).toBeGreaterThanOrEqual(0);
    expect(result_1.category_scores.budget).toBeLessThanOrEqual(100);
    
    // 選択されたカテゴリが最高スコアであることを検証
    const all_scores = Object.values(result_1.category_scores) as number[];
    const max_score = Math.max(...all_scores);
    const primary_score = result_1.category_scores[result_1.primary_category as keyof typeof result_1.category_scores];
    expect(primary_score).toBe(max_score);
    
    // スコア差分が記録されていることを確認
    expect(result_1.score_difference).toBeGreaterThanOrEqual(0);
    expect(typeof result_1.score_difference).toBe('number');

    // テストケース2: 「調理時間が長くて好みでない」（調理時間・好みの複数カテゴリ該当）
    const ambiguous_text_2 = '調理時間が長くて好みでない';
    const result_2 = classifyMealRejectReason({
      reason_text: ambiguous_text_2,
      timestamp: '2024-01-15T11:00:00Z',
      user_id: 'usr_002'
    });

    expect(result_2.primary_category).toBeDefined();
    expect(result_2.category_scores.cooking_time).toBeGreaterThanOrEqual(0);
    expect(result_2.category_scores.cooking_time).toBeLessThanOrEqual(100);
    expect(result_2.category_scores.preference).toBeGreaterThanOrEqual(0);
    expect(result_2.category_scores.preference).toBeLessThanOrEqual(100);
    
    const all_scores_2 = Object.values(result_2.category_scores) as number[];
    const max_score_2 = Math.max(...all_scores_2);
    const primary_score_2 = result_2.category_scores[result_2.primary_category as keyof typeof result_2.category_scores];
    expect(primary_score_2).toBe(max_score_2);
    expect(result_2.score_difference).toBeGreaterThanOrEqual(0);

    // テストケース3: 「食材制限があるのに使われていて予算も考えるべき」（食材制限・予算の複数カテゴリ該当）
    const ambiguous_text_3 = '食材制限があるのに使われていて予算も考えるべき';
    const result_3 = classifyMealRejectReason({
      reason_text: ambiguous_text_3,
      timestamp: '2024-01-15T11:30:00Z',
      user_id: 'usr_003'
    });

    expect(result_3.primary_category).toBeDefined();
    expect(result_3.category_scores.ingredient_restriction).toBeGreaterThanOrEqual(0);
    expect(result_3.category_scores.ingredient_restriction).toBeLessThanOrEqual(100);
    expect(result_3.category_scores.budget).toBeGreaterThanOrEqual(0);
    expect(result_3.category_scores.budget).toBeLessThanOrEqual(100);
    
    const all_scores_3 = Object.values(result_3.category_scores) as number[];
    const max_score_3 = Math.max(...all_scores_3);
    const primary_score_3 = result_3.category_scores[result_3.primary_category as keyof typeof result_3.category_scores];
    expect(primary_score_3).toBe(max_score_3);
    expect(result_3.score_difference).toBeGreaterThanOrEqual(0);

    // 3つのテストケース間での一貫性確認
    // すべてのケースで最高スコアカテゴリが選択されていることを再確認
    expect(result_1.primary_category).toBeTruthy();
    expect(result_2.primary_category).toBeTruthy();
    expect(result_3.primary_category).toBeTruthy();

    // 分類根拠（追跡情報）が記録されていることを確認
    expect(result_1.trace_info).toBeDefined();
    expect(result_2.trace_info).toBeDefined();
    expect(result_3.trace_info).toBeDefined();
    expect(typeof result_1.trace_info).toBe('string');
    expect(typeof result_2.trace_info).toBe('string');
    expect(typeof result_3.trace_info).toBe('string');

    // 各結果のタイムスタンプが記録されていることを確認
    expect(result_1.classified_timestamp).toBeDefined();
    expect(result_2.classified_timestamp).toBeDefined();
    expect(result_3.classified_timestamp).toBeDefined();
  });
});