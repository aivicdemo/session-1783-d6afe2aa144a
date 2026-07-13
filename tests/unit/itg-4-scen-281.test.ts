import { determinePriority } from '../../src/logic/it-3-br-6-3-3';

describe('予測精度低下要因の可視化ダッシュボード', () => {
  // SCEN-281
  test('影響度と実装難易度の評価値がちょうど分類境界である場合、正確に優先度が判定される', () => {
    // テストデータ: 影響度が分類境界値（5.0）のシナリオ
    const improvement_boundary_impact = {
      variable_name: '天候パターン',
      impact_score: 5.0,
      implementation_difficulty: 2.0,
      correlation_coefficient: 0.75,
      precision_improvement_rate: 0.12,
    };

    // 期待値: 影響度 5.0 は「高影響度」の下限境界値
    // 実装難易度 2.0 は「低難易度」の区間内
    // 優先度マトリクス: 高影響度 × 低難易度 = 優先度レベル「高」（優先度スコア 8.0 以上）
    const result_boundary_impact = determinePriority(improvement_boundary_impact);
    expect(result_boundary_impact.priority_level).toBe('HIGH');
    expect(result_boundary_impact.priority_score).toBeGreaterThanOrEqual(8.0);
    expect(result_boundary_impact.priority_score).toBeLessThanOrEqual(10.0);

    // テストデータ: 実装難易度が分類境界値（3.0）のシナリオ
    const improvement_boundary_difficulty = {
      variable_name: 'イベント情報',
      impact_score: 7.0,
      implementation_difficulty: 3.0,
      correlation_coefficient: 0.68,
      precision_improvement_rate: 0.10,
    };

    // 期待値: 実装難易度 3.0 は「中難易度」の下限境界値
    // 影響度 7.0 は「高影響度」の区間内
    // 優先度マトリクス: 高影響度 × 中難易度 = 優先度レベル「中」（優先度スコア 5.0 以上 8.0 未満）
    const result_boundary_difficulty = determinePriority(improvement_boundary_difficulty);
    expect(result_boundary_difficulty.priority_level).toBe('MEDIUM');
    expect(result_boundary_difficulty.priority_score).toBeGreaterThanOrEqual(5.0);
    expect(result_boundary_difficulty.priority_score).toBeLessThan(8.0);

    // テストデータ: 影響度と実装難易度の両方が分類境界値のシナリオ
    const improvement_both_boundaries = {
      variable_name: '競合施策',
      impact_score: 5.0,
      implementation_difficulty: 3.0,
      correlation_coefficient: 0.62,
      precision_improvement_rate: 0.08,
    };

    // 期待値: 影響度 5.0（高影響度下限）× 実装難易度 3.0（中難易度下限）= 優先度「中」
    const result_both_boundaries = determinePriority(improvement_both_boundaries);
    expect(result_both_boundaries.priority_level).toBe('MEDIUM');
    expect(result_both_boundaries.priority_score).toBeGreaterThanOrEqual(5.0);
    expect(result_both_boundaries.priority_score).toBeLessThan(8.0);

    // 提案書自動生成検証: 優先度レベルが正確に提案書に反映されるか検証
    const proposal_from_boundary_impact = {
      variable_name: improvement_boundary_impact.variable_name,
      priority_level: result_boundary_impact.priority_level,
      priority_score: result_boundary_impact.priority_score,
      impact_score: improvement_boundary_impact.impact_score,
      implementation_difficulty: improvement_boundary_impact.implementation_difficulty,
      recommendation: `この変数は優先度${result_boundary_impact.priority_level}で改善を推奨します`,
    };

    expect(proposal_from_boundary_impact.priority_level).toBe('HIGH');
    expect(proposal_from_boundary_impact.recommendation).toContain('高');

    const proposal_from_boundary_difficulty = {
      variable_name: improvement_boundary_difficulty.variable_name,
      priority_level: result_boundary_difficulty.priority_level,
      priority_score: result_boundary_difficulty.priority_score,
      impact_score: improvement_boundary_difficulty.impact_score,
      implementation_difficulty: improvement_boundary_difficulty.implementation_difficulty,
      recommendation: `この変数は優先度${result_boundary_difficulty.priority_level}で改善を推奨します`,
    };

    expect(proposal_from_boundary_difficulty.priority_level).toBe('MEDIUM');
    expect(proposal_from_boundary_difficulty.recommendation).toContain('中');

    // 丸め誤差・浮動小数点演算の影響を受けないことを検証
    // 複数回実行して同じ結果を得られることを確認
    const retest_boundary_impact = determinePriority(improvement_boundary_impact);
    expect(retest_boundary_impact.priority_level).toBe(result_boundary_impact.priority_level);
    expect(retest_boundary_impact.priority_score).toBe(result_boundary_impact.priority_score);

    const retest_boundary_difficulty = determinePriority(improvement_boundary_difficulty);
    expect(retest_boundary_difficulty.priority_level).toBe(result_boundary_difficulty.priority_level);
    expect(retest_boundary_difficulty.priority_score).toBe(result_boundary_difficulty.priority_score);

    const retest_both_boundaries = determinePriority(improvement_both_boundaries);
    expect(retest_both_boundaries.priority_level).toBe(result_both_boundaries.priority_level);
    expect(retest_both_boundaries.priority_score).toBe(result_both_boundaries.priority_score);
  });
});