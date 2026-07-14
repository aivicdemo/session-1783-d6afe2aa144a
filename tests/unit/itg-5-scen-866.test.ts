import { evaluateNutritionImprovementProposal } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-866: [normal] 栄養士検証評価機能 - 栄養基準ロジック改善案が評価基準に基づいて承認可否と改善優先度を正常に生成される
  test('栄養基準ロジック改善案が評価基準に基づいて承認可否と改善優先度を正常に生成される', () => {
    // 前提: 栄養士が改善案に対して評価基準（精度向上率、実装複雑度、運用負荷）を設定済み
    const improvementProposal = {
      proposal_id: 'NUTR-IMP-001',
      title: 'カルシウム摂取基準の動的調整',
      description: 'ユーザーの年代別にカルシウム推奨量を段階化',
      target_nutrients: ['カルシウム', 'ビタミンD'],
      expected_accuracy_improvement_rate: 12, // 精度向上率 12%
      implementation_complexity_score: 35, // 実装複雑度スコア 0-100 (低いほど簡単)
      operational_load_score: 28, // 運用負荷スコア 0-100 (低いほど軽い)
      expected_user_impact_score: 78, // ユーザー影響度 0-100 (高いほど影響大)
      business_value_score: 82, // ビジネス価値 0-100
    };

    const evaluationCriteria = {
      min_accuracy_improvement_rate: 5, // 精度向上率の最小閾値 5%
      max_implementation_complexity_score: 50, // 実装複雑度の最大許容値 50
      max_operational_load_score: 40, // 運用負荷の最大許容値 40
      approval_threshold_score: 60, // 承認判定の総合スコア最小値
    };

    // 実行: 評価ロジックを実行
    const result = evaluateNutritionImprovementProposal(
      improvementProposal,
      evaluationCriteria
    );

    // 検証1: 承認可否が評価基準ルールに従い正確に判定される
    // 精度向上率12% >= 最小値5% → OK
    // 実装複雑度35 <= 最大値50 → OK
    // 運用負荷28 <= 最大値40 → OK
    // → 承認判定は true となる
    expect(result.is_approved).toBe(true);

    // 検証2: 改善優先度スコアが0～100の数値範囲で算出される
    // 期待スコア計算式: (精度向上率 / 最小値 * 25) + (100 - 実装複雑度 / 2) + (100 - 運用負荷 / 2) のような加重計算
    // 具体値: (12/5*25) + (100 - 35/2) + (100 - 28/2) + (78*0.3 + 82*0.2) / 2
    // = 60 + 82.5 + 86 + (23.4 + 16.4) / 2 = 228.5 + 19.9 = 248.4 を正規化
    // 正規化結果: 74 (0-100範囲内)
    expect(result.priority_score).toBeGreaterThanOrEqual(0);
    expect(result.priority_score).toBeLessThanOrEqual(100);
    expect(result.priority_score).toBe(74);

    // 検証3: 複数案の評価結果が定量的に比較可能な形式で表示される
    expect(result).toHaveProperty('evaluation_basis');
    expect(result.evaluation_basis).toEqual({
      accuracy_improvement_rate_check: 'PASS', // 12 >= 5
      implementation_complexity_check: 'PASS', // 35 <= 50
      operational_load_check: 'PASS', // 28 <= 40
      total_score_check: 'PASS', // 74 >= 60
    });

    // 検証4: 評価ロジックの透明性を保つため、各判定根拠が表示される
    expect(result).toHaveProperty('rationale');
    expect(result.rationale).toContain('accuracy_improvement_rate:12');
    expect(result.rationale).toContain('implementation_complexity:35');
    expect(result.rationale).toContain('operational_load:28');

    // 検証5: 同一条件での再実行で同じ結果が得られる（確定性）
    const result_2 = evaluateNutritionImprovementProposal(
      improvementProposal,
      evaluationCriteria
    );
    expect(result_2.is_approved).toBe(result.is_approved);
    expect(result_2.priority_score).toBe(result.priority_score);
    expect(result_2.evaluation_basis).toEqual(result.evaluation_basis);
  });

  // 追加テスト: 異なるパターンの改善案で評価一貫性を確認
  test('複数の異なる改善案パターンで評価結果が定量的に比較可能である', () => {
    const evaluationCriteria = {
      min_accuracy_improvement_rate: 5,
      max_implementation_complexity_score: 50,
      max_operational_load_score: 40,
      approval_threshold_score: 60,
    };

    // パターン1: 高精度向上、低実装複雑度
    const pattern1 = {
      proposal_id: 'NUTR-IMP-P1',
      title: 'パターン1',
      description: 'High improvement, low complexity',
      target_nutrients: ['カルシウム'],
      expected_accuracy_improvement_rate: 20,
      implementation_complexity_score: 20,
      operational_load_score: 15,
      expected_user_impact_score: 85,
      business_value_score: 90,
    };

    // パターン2: 中程度精度向上、中程度実装複雑度
    const pattern2 = {
      proposal_id: 'NUTR-IMP-P2',
      title: 'パターン2',
      description: 'Medium improvement, medium complexity',
      target_nutrients: ['ビタミンD'],
      expected_accuracy_improvement_rate: 8,
      implementation_complexity_score: 40,
      operational_load_score: 30,
      expected_user_impact_score: 60,
      business_value_score: 65,
    };

    // パターン3: 低精度向上、高実装複雑度（承認されないケース）
    const pattern3 = {
      proposal_id: 'NUTR-IMP-P3',
      title: 'パターン3',
      description: 'Low improvement, high complexity',
      target_nutrients: ['鉄分'],
      expected_accuracy_improvement_rate: 3,
      implementation_complexity_score: 60,
      operational_load_score: 50,
      expected_user_impact_score: 40,
      business_value_score: 35,
    };

    const result1 = evaluateNutritionImprovementProposal(pattern1, evaluationCriteria);
    const result2 = evaluateNutritionImprovementProposal(pattern2, evaluationCriteria);
    const result3 = evaluateNutritionImprovementProposal(pattern3, evaluationCriteria);

    // パターン1: 高評価で承認される
    expect(result1.is_approved).toBe(true);
    expect(result1.priority_score).toBe(88);

    // パターン2: 中程度評価で承認される
    expect(result2.is_approved).toBe(true);
    expect(result2.priority_score).toBe(65);

    // パターン3: 低評価で承認されない（精度向上率3% < 最小値5%、実装複雑度60 > 最大値50）
    expect(result3.is_approved).toBe(false);
    expect(result3.priority_score).toBe(42);

    // 複数案の比較可能性を確認：スコア比較
    expect(result1.priority_score).toBeGreaterThan(result2.priority_score);
    expect(result2.priority_score).toBeGreaterThan(result3.priority_score);

    // 承認可否の一貫性を確認
    expect([true, true, false]).toEqual([
      result1.is_approved,
      result2.is_approved,
      result3.is_approved,
    ]);
  });

  // 追加テスト: 承認基準を厳格にした場合の評価挙動
  test('評価基準の厳格化に応じて承認可否が正確に変更される', () => {
    const improvementProposal = {
      proposal_id: 'NUTR-IMP-002',
      title: 'タンパク質摂取基準の個別化',
      description: 'ユーザーの体重別にタンパク質推奨量を調整',
      target_nutrients: ['タンパク質'],
      expected_accuracy_improvement_rate: 6,
      implementation_complexity_score: 45,
      operational_load_score: 38,
      expected_user_impact_score: 70,
      business_value_score: 75,
    };

    // 基準1: 通常の評価基準
    const criteria_normal = {
      min_accuracy_improvement_rate: 5,
      max_implementation_complexity_score: 50,
      max_operational_load_score: 40,
      approval_threshold_score: 60,
    };

    // 基準2: 厳格な評価基準
    const criteria_strict = {
      min_accuracy_improvement_rate: 8,
      max_implementation_complexity_score: 40,
      max_operational_load_score: 35,
      approval_threshold_score: 70,
    };

    const result_normal = evaluateNutritionImprovementProposal(
      improvementProposal,
      criteria_normal
    );
    const result_strict = evaluateNutritionImprovementProposal(
      improvementProposal,
      criteria_strict
    );

    // 通常基準では承認（精度向上率6 >= 5、実装複雑度45 <= 50、運用負荷38 <= 40）
    expect(result_normal.is_approved).toBe(true);
    expect(result_normal.priority_score).toBe(68);

    // 厳格基準では却下（精度向上率6 < 8 が条件に合致しない、運用負荷38 > 35、スコア68 < 70）
    expect(result_strict.is_approved).toBe(false);
    expect(result_strict.priority_score).toBe(58);

    // 評価基準の厳格化で優先度スコアが低下
    expect(result_normal.priority_score).toBeGreaterThan(result_strict.priority_score);
  });

  // 追加テスト: エッジケース - 評価基準の境界値での判定
  test('評価基準の境界値で承認可否が正確に判定される', () => {
    // パターン: ちょうど基準値を満たすケース
    const improvementProposal = {
      proposal_id: 'NUTR-IMP-EDGE',
      title: 'エッジケーステスト',
      description: 'Boundary value test',
      target_nutrients: ['ナトリウム'],
      expected_accuracy_improvement_rate: 5, // ちょうど最小値
      implementation_complexity_score: 50, // ちょうど最大値
      operational_load_score: 40, // ちょうど最大値
      expected_user_impact_score: 50,
      business_value_score: 60,
    };

    const criteria = {
      min_accuracy_improvement_rate: 5,
      max_implementation_complexity_score: 50,
      max_operational_load_score: 40,
      approval_threshold_score: 60,
    };

    const result = evaluateNutritionImprovementProposal(improvementProposal, criteria);

    // 精度向上率5 == 最小値5 → PASS
    // 実装複雑度50 == 最大値50 → PASS
    // 運用負荷40 == 最大値40 → PASS
    expect(result.evaluation_basis.accuracy_improvement_rate_check).toBe('PASS');
    expect(result.evaluation_basis.implementation_complexity_check).toBe('PASS');
    expect(result.evaluation_basis.operational_load_check).toBe('PASS');

    // スコアが閾値以上であれば承認
    expect(result.priority_score).toBeGreaterThanOrEqual(60);
    expect(result.is_approved).toBe(true);
  });
});