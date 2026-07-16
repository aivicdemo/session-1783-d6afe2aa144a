import { recalculatePriorityMatrix } from '../../src/logic/it-8-1-1-1';

describe('ユーザーインタビュー記録と利用ログからペイン要因を自動抽出・分類し優先度マトリクスを生成', () => {
  // SCEN-351
  test('優先度マトリクス再計算機能 - ユーザーセグメント構成が変動したとき、各ペイン要因の重要度スコアが自動再評価される', () => {
    // 初期ユーザーセグメント構成
    const initial_segment_composition = {
      segment_a_ratio: 0.40,
      segment_b_ratio: 0.35,
      segment_c_ratio: 0.25,
    };

    // 各ペイン要因に対する初期重要度スコア（セグメント別）
    const initial_pain_factor_weights = {
      price: {
        segment_a_weight: 30,
        segment_b_weight: 45,
        segment_c_weight: 25,
      },
      quality: {
        segment_a_weight: 50,
        segment_b_weight: 40,
        segment_c_weight: 35,
      },
      convenience: {
        segment_a_weight: 35,
        segment_b_weight: 30,
        segment_c_weight: 50,
      },
      support: {
        segment_a_weight: 20,
        segment_b_weight: 25,
        segment_c_weight: 40,
      },
    };

    // 初期マトリクス計算（加重平均）
    const initial_price_score =
      initial_pain_factor_weights.price.segment_a_weight * initial_segment_composition.segment_a_ratio +
      initial_pain_factor_weights.price.segment_b_weight * initial_segment_composition.segment_b_ratio +
      initial_pain_factor_weights.price.segment_c_weight * initial_segment_composition.segment_c_ratio;
    // = 30 * 0.40 + 45 * 0.35 + 25 * 0.25 = 12 + 15.75 + 6.25 = 34

    const initial_quality_score =
      initial_pain_factor_weights.quality.segment_a_weight * initial_segment_composition.segment_a_ratio +
      initial_pain_factor_weights.quality.segment_b_weight * initial_segment_composition.segment_b_ratio +
      initial_pain_factor_weights.quality.segment_c_weight * initial_segment_composition.segment_c_ratio;
    // = 50 * 0.40 + 40 * 0.35 + 35 * 0.25 = 20 + 14 + 8.75 = 42.75

    const initial_convenience_score =
      initial_pain_factor_weights.convenience.segment_a_weight * initial_segment_composition.segment_a_ratio +
      initial_pain_factor_weights.convenience.segment_b_weight * initial_segment_composition.segment_b_ratio +
      initial_pain_factor_weights.convenience.segment_c_weight * initial_segment_composition.segment_c_ratio;
    // = 35 * 0.40 + 30 * 0.35 + 50 * 0.25 = 14 + 10.5 + 12.5 = 37

    const initial_support_score =
      initial_pain_factor_weights.support.segment_a_weight * initial_segment_composition.segment_a_ratio +
      initial_pain_factor_weights.support.segment_b_weight * initial_segment_composition.segment_b_ratio +
      initial_pain_factor_weights.support.segment_c_weight * initial_segment_composition.segment_c_ratio;
    // = 20 * 0.40 + 25 * 0.35 + 40 * 0.25 = 8 + 8.75 + 10 = 26.75

    // 変動後のセグメント構成
    const updated_segment_composition = {
      segment_a_ratio: 0.25,
      segment_b_ratio: 0.50,
      segment_c_ratio: 0.25,
    };

    // 再計算後のマトリクス計算
    const recalculated_price_score =
      initial_pain_factor_weights.price.segment_a_weight * updated_segment_composition.segment_a_ratio +
      initial_pain_factor_weights.price.segment_b_weight * updated_segment_composition.segment_b_ratio +
      initial_pain_factor_weights.price.segment_c_weight * updated_segment_composition.segment_c_ratio;
    // = 30 * 0.25 + 45 * 0.50 + 25 * 0.25 = 7.5 + 22.5 + 6.25 = 36.25

    const recalculated_quality_score =
      initial_pain_factor_weights.quality.segment_a_weight * updated_segment_composition.segment_a_ratio +
      initial_pain_factor_weights.quality.segment_b_weight * updated_segment_composition.segment_b_ratio +
      initial_pain_factor_weights.quality.segment_c_weight * updated_segment_composition.segment_c_ratio;
    // = 50 * 0.25 + 40 * 0.50 + 35 * 0.25 = 12.5 + 20 + 8.75 = 41.25

    const recalculated_convenience_score =
      initial_pain_factor_weights.convenience.segment_a_weight * updated_segment_composition.segment_a_ratio +
      initial_pain_factor_weights.convenience.segment_b_weight * updated_segment_composition.segment_b_ratio +
      initial_pain_factor_weights.convenience.segment_c_weight * updated_segment_composition.segment_c_ratio;
    // = 35 * 0.25 + 30 * 0.50 + 50 * 0.25 = 8.75 + 15 + 12.5 = 36.25

    const recalculated_support_score =
      initial_pain_factor_weights.support.segment_a_weight * updated_segment_composition.segment_a_ratio +
      initial_pain_factor_weights.support.segment_b_weight * updated_segment_composition.segment_b_ratio +
      initial_pain_factor_weights.support.segment_c_weight * updated_segment_composition.segment_c_ratio;
    // = 20 * 0.25 + 25 * 0.50 + 40 * 0.25 = 5 + 12.5 + 10 = 27.5

    // 優先度マトリクス再計算機能を実行
    const result = recalculatePriorityMatrix({
      segment_composition: updated_segment_composition,
      pain_factor_weights: initial_pain_factor_weights,
      initial_priority_matrix: {
        price: initial_price_score,
        quality: initial_quality_score,
        convenience: initial_convenience_score,
        support: initial_support_score,
      },
    });

    // 再計算後のスコアを検証
    expect(result.updated_priority_matrix.price).toBeCloseTo(recalculated_price_score, 2);
    expect(result.updated_priority_matrix.quality).toBeCloseTo(recalculated_quality_score, 2);
    expect(result.updated_priority_matrix.convenience).toBeCloseTo(recalculated_convenience_score, 2);
    expect(result.updated_priority_matrix.support).toBeCloseTo(recalculated_support_score, 2);

    // スコア変動の検証
    const price_change = recalculated_price_score - initial_price_score;
    const quality_change = recalculated_quality_score - initial_quality_score;
    const convenience_change = recalculated_convenience_score - initial_convenience_score;
    const support_change = recalculated_support_score - initial_support_score;

    // セグメントB（重要度45で価格に重点）のウェイト上昇により、価格スコアが上昇
    expect(price_change).toBeGreaterThan(0);
    expect(price_change).toBeCloseTo(2.25, 2); // 36.25 - 34 = 2.25

    // セグメントA（重要度50で品質に重点）のウェイト低下により、品質スコアが低下
    expect(quality_change).toBeLessThan(0);
    expect(quality_change).toBeCloseTo(-1.5, 2); // 41.25 - 42.75 = -1.5

    // セグメントA（重要度35で利便性に中程度）から低下、セグメントB（重要度30で利便性に低い）へ上昇
    expect(convenience_change).toBeCloseTo(-0.75, 2); // 36.25 - 37 = -0.75

    // サポートスコアは微増
    expect(support_change).toBeCloseTo(0.75, 2); // 27.5 - 26.75 = 0.75

    // 更新タイムスタンプが記録されていることを確認
    expect(result.recalculation_timestamp).toBeDefined();
    expect(typeof result.recalculation_timestamp).toBe('string');

    // セグメント構成が正しく反映されていることを確認
    expect(result.current_segment_composition).toEqual(updated_segment_composition);

    // 初期マトリクスから更新マトリクスへの遷移が記録されていることを確認
    expect(result.initial_priority_matrix).toEqual({
      price: initial_price_score,
      quality: initial_quality_score,
      convenience: initial_convenience_score,
      support: initial_support_score,
    });

    // 再評価フラグが立っていることを確認
    expect(result.is_recalculated).toBe(true);
  });
});