import { evaluateMenuConstraintFulfillment } from '../../src/logic/it-7-2-1';

describe('献立生成アルゴリズムの成功・失敗パターン分析と改善提案 - 制約条件充足度評価機能', () => {
  // SCEN-542: [normal] 制約条件充足度評価機能 - 一部の制約のみ満たす献立案について部分的な充足度スコアを計算する
  test('SCEN-542: 一部の制約のみ満たす献立案について部分的な充足度スコアを正確に計算する', () => {
    // 複数の制約条件を定義
    const constraints = [
      {
        constraint_id: 'nutrition_balance',
        constraint_name: '栄養バランス',
        target_value: 100,
        weight: 0.25,
        constraint_type: 'nutrition'
      },
      {
        constraint_id: 'calorie_limit',
        constraint_name: 'カロリー上限',
        target_value: 2000,
        weight: 0.25,
        constraint_type: 'calorie'
      },
      {
        constraint_id: 'allergy_safe',
        constraint_name: 'アレルギー対応',
        target_value: 100,
        weight: 0.25,
        constraint_type: 'allergy'
      },
      {
        constraint_id: 'cost_optimization',
        constraint_name: 'コスト最適化',
        target_value: 5000,
        weight: 0.25,
        constraint_type: 'cost'
      }
    ];

    // 一部の制約のみを満たす献立案を作成
    // 栄養バランスとアレルギー対応を満たし、カロリー上限とコスト最適化は未充足
    const menu_proposal = {
      menu_proposal_id: 'proposal_001',
      family_id: 'family_001',
      proposal_date: '2024-01-15',
      dishes: [
        {
          dish_id: 'dish_001',
          dish_name: '鮭の塩焼き',
          calories: 1200,
          cost: 800,
          nutrition_score: 95,
          allergy_safe: true,
          contains_allergens: []
        },
        {
          dish_id: 'dish_002',
          dish_name: 'サラダ',
          calories: 300,
          cost: 400,
          nutrition_score: 90,
          allergy_safe: true,
          contains_allergens: []
        },
        {
          dish_id: 'dish_003',
          dish_name: 'デザート',
          calories: 600,
          cost: 2000,
          nutrition_score: 85,
          allergy_safe: true,
          contains_allergens: []
        }
      ]
    };

    // 献立案に対して制約条件充足度評価機能を実行
    const evaluation_result = evaluateMenuConstraintFulfillment(
      menu_proposal,
      constraints
    );

    // 期待値の計算
    // 栄養バランス: 満たす (スコア 95/100 = 95%)
    const nutrition_fulfillment_score = 95;
    const nutrition_satisfied = true;

    // カロリー上限: 未充足 (合計 2100 > 2000)
    const calorie_fulfillment_score = 0;
    const calorie_satisfied = false;

    // アレルギー対応: 満たす (すべて安全)
    const allergy_fulfillment_score = 100;
    const allergy_satisfied = true;

    // コスト最適化: 未充足 (合計 3200 > 5000の効率化目標)
    const cost_fulfillment_score = 64; // 3200/5000 = 0.64 → 64%

    // 満たした制約: 2/4 = 50%
    const satisfied_count = 2;
    const total_constraints = 4;
    const overall_satisfaction_percentage = (satisfied_count / total_constraints) * 100;

    // 加重平均スコアの計算
    // (95 * 0.25 + 0 * 0.25 + 100 * 0.25 + 64 * 0.25) = (23.75 + 0 + 25 + 16) = 64.75
    const expected_weighted_score = 64.75;

    // 全体充足度スコアの計算
    // 加重スコア: 64.75
    // 満足度比率: 50%
    // 総合スコア = 加重スコア × (満たした制約数 / 総制約数)
    // = 64.75 × 0.5 = 32.375 → 約32
    const expected_overall_score = 32;

    // 計算されたスコアが部分的な充足度を正確に反映しているか確認
    expect(evaluation_result.constraint_fulfillment_details).toBeDefined();
    expect(evaluation_result.constraint_fulfillment_details.length).toBe(4);

    // 各制約ごとの充足状態が明確に区別されているか確認
    const nutrition_detail = evaluation_result.constraint_fulfillment_details.find(
      d => d.constraint_id === 'nutrition_balance'
    );
    expect(nutrition_detail).toBeDefined();
    expect(nutrition_detail?.fulfillment_score).toBe(nutrition_fulfillment_score);
    expect(nutrition_detail?.is_satisfied).toBe(nutrition_satisfied);

    const calorie_detail = evaluation_result.constraint_fulfillment_details.find(
      d => d.constraint_id === 'calorie_limit'
    );
    expect(calorie_detail).toBeDefined();
    expect(calorie_detail?.fulfillment_score).toBe(calorie_fulfillment_score);
    expect(calorie_detail?.is_satisfied).toBe(calorie_satisfied);

    const allergy_detail = evaluation_result.constraint_fulfillment_details.find(
      d => d.constraint_id === 'allergy_safe'
    );
    expect(allergy_detail).toBeDefined();
    expect(allergy_detail?.fulfillment_score).toBe(allergy_fulfillment_score);
    expect(allergy_detail?.is_satisfied).toBe(allergy_satisfied);

    const cost_detail = evaluation_result.constraint_fulfillment_details.find(
      d => d.constraint_id === 'cost_optimization'
    );
    expect(cost_detail).toBeDefined();
    expect(cost_detail?.fulfillment_score).toBe(cost_fulfillment_score);
    expect(cost_detail?.is_satisfied).toBe(false);

    // 充足された制約ごとのスコア配分が正しく計算されているか確認
    expect(evaluation_result.satisfied_constraint_count).toBe(satisfied_count);
    expect(evaluation_result.total_constraint_count).toBe(total_constraints);

    // 全体充足度スコアが満たした制約数に対する割合で計算されているか検証
    expect(evaluation_result.satisfaction_percentage).toBe(overall_satisfaction_percentage);

    // 加重スコアが正確に計算されているか確認
    expect(evaluation_result.weighted_fulfillment_score).toBe(expected_weighted_score);

    // 総合充足度スコアが0～100の範囲内であることを確認
    expect(evaluation_result.overall_fulfillment_score).toBeGreaterThanOrEqual(0);
    expect(evaluation_result.overall_fulfillment_score).toBeLessThanOrEqual(100);

    // 総合充足度スコアが満たした制約数に相応した値として返されることを確認
    expect(evaluation_result.overall_fulfillment_score).toBe(expected_overall_score);

    // 未充足の制約がスコアに負の影響を与えているか確認
    // 満たした場合の期待スコア（100%充足と仮定）に対して、実際スコアが低いことを確認
    expect(evaluation_result.overall_fulfillment_score).toBeLessThan(100);
    expect(evaluation_result.overall_fulfillment_score).toBeCloseTo(expected_overall_score, 0);
  });
});