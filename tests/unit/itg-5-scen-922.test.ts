import { evaluateImprovementProposals } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の分類と失敗パターン特定 - 改善提案のKPI評価機能', () => {
  // SCEN-922: [normal] 改善提案のKPI評価機能 - 失敗パターンに基づいてKPI寄与度・実装難度・ユーザー影響度が正しく評価される
  test('複数の失敗パターンに対して、KPI寄与度・実装難度・ユーザー影響度が正確に評価されることを確認', () => {
    // テストデータ: 複数の失敗パターンに対応した改善提案オブジェクト
    const failurePatterns = [
      {
        pattern_id: 'FP001',
        pattern_name: 'タイムアウト',
        occurrence_count: 45,
        affected_users: 120,
        severity: 'high',
      },
      {
        pattern_id: 'FP002',
        pattern_name: 'メモリ不足',
        occurrence_count: 12,
        affected_users: 30,
        severity: 'medium',
      },
      {
        pattern_id: 'FP003',
        pattern_name: 'データ不整合',
        occurrence_count: 8,
        affected_users: 20,
        severity: 'low',
      },
    ];

    const improvementProposals = [
      {
        proposal_id: 'IP001',
        failure_pattern_id: 'FP001',
        description: 'タイムアウト対策：キャッシング機構の実装',
        kpi_contribution_factor: 0.85,
        implementation_complexity: 0.65,
        user_impact_factor: 0.90,
      },
      {
        proposal_id: 'IP002',
        failure_pattern_id: 'FP002',
        description: 'メモリ最適化：バッチ処理の導入',
        kpi_contribution_factor: 0.60,
        implementation_complexity: 0.75,
        user_impact_factor: 0.55,
      },
      {
        proposal_id: 'IP003',
        failure_pattern_id: 'FP003',
        description: 'データ検証強化：整合性チェック追加',
        kpi_contribution_factor: 0.45,
        implementation_complexity: 0.40,
        user_impact_factor: 0.35,
      },
    ];

    // KPI評価機能を実行
    const evaluation_results = evaluateImprovementProposals(
      failurePatterns,
      improvementProposals
    );

    // 評価結果が配列であることを確認
    expect(Array.isArray(evaluation_results)).toBe(true);
    expect(evaluation_results.length).toBe(3);

    // 各改善提案のKPI寄与度を検証（失敗パターンの特性に基づく計算）
    // タイムアウト対策：occurrence_count=45, affected_users=120, severity=high → 高い寄与度
    const kpi_contribution_timeout = evaluation_results[0].kpi_contribution_score;
    expect(kpi_contribution_timeout).toBeGreaterThanOrEqual(75);
    expect(kpi_contribution_timeout).toBeLessThanOrEqual(100);
    expect(Math.round(kpi_contribution_timeout)).toBe(85);

    // メモリ最適化：occurrence_count=12, affected_users=30, severity=medium → 中程度の寄与度
    const kpi_contribution_memory = evaluation_results[1].kpi_contribution_score;
    expect(kpi_contribution_memory).toBeGreaterThanOrEqual(50);
    expect(kpi_contribution_memory).toBeLessThanOrEqual(75);
    expect(Math.round(kpi_contribution_memory)).toBe(60);

    // データ検証強化：occurrence_count=8, affected_users=20, severity=low → 低い寄与度
    const kpi_contribution_data = evaluation_results[2].kpi_contribution_score;
    expect(kpi_contribution_data).toBeGreaterThanOrEqual(35);
    expect(kpi_contribution_data).toBeLessThanOrEqual(55);
    expect(Math.round(kpi_contribution_data)).toBe(45);

    // 各改善提案の実装難度を検証（提案の技術的複雑性に基づく計算）
    const implementation_difficulty_timeout = evaluation_results[0].implementation_difficulty_score;
    expect(implementation_difficulty_timeout).toBeGreaterThanOrEqual(60);
    expect(implementation_difficulty_timeout).toBeLessThanOrEqual(75);
    expect(Math.round(implementation_difficulty_timeout)).toBe(65);

    const implementation_difficulty_memory = evaluation_results[1].implementation_difficulty_score;
    expect(implementation_difficulty_memory).toBeGreaterThanOrEqual(70);
    expect(implementation_difficulty_memory).toBeLessThanOrEqual(85);
    expect(Math.round(implementation_difficulty_memory)).toBe(75);

    const implementation_difficulty_data = evaluation_results[2].implementation_difficulty_score;
    expect(implementation_difficulty_data).toBeGreaterThanOrEqual(35);
    expect(implementation_difficulty_data).toBeLessThanOrEqual(50);
    expect(Math.round(implementation_difficulty_data)).toBe(40);

    // 各改善提案のユーザー影響度を検証（ユーザーへの効果に基づく計算）
    const user_impact_timeout = evaluation_results[0].user_impact_score;
    expect(user_impact_timeout).toBeGreaterThanOrEqual(85);
    expect(user_impact_timeout).toBeLessThanOrEqual(100);
    expect(Math.round(user_impact_timeout)).toBe(90);

    const user_impact_memory = evaluation_results[1].user_impact_score;
    expect(user_impact_memory).toBeGreaterThanOrEqual(50);
    expect(user_impact_memory).toBeLessThanOrEqual(65);
    expect(Math.round(user_impact_memory)).toBe(55);

    const user_impact_data = evaluation_results[2].user_impact_score;
    expect(user_impact_data).toBeGreaterThanOrEqual(30);
    expect(user_impact_data).toBeLessThanOrEqual(45);
    expect(Math.round(user_impact_data)).toBe(35);

    // 総合優先度スコア（KPI寄与度 × ユーザー影響度 / 実装難度）を検証
    // タイムアウト対策: (85 × 90) / 65 ≈ 117.69 → 上限100にクリップ = 100
    const total_score_timeout = evaluation_results[0].total_priority_score;
    expect(total_score_timeout).toBeGreaterThanOrEqual(95);
    expect(total_score_timeout).toBeLessThanOrEqual(100);
    expect(Math.round(total_score_timeout)).toBe(100);

    // メモリ最適化: (60 × 55) / 75 = 44
    const total_score_memory = evaluation_results[1].total_priority_score;
    expect(total_score_memory).toBeGreaterThanOrEqual(40);
    expect(total_score_memory).toBeLessThanOrEqual(50);
    expect(Math.round(total_score_memory)).toBe(44);

    // データ検証強化: (45 × 35) / 40 ≈ 39.375 = 39
    const total_score_data = evaluation_results[2].total_priority_score;
    expect(total_score_data).toBeGreaterThanOrEqual(35);
    expect(total_score_data).toBeLessThanOrEqual(45);
    expect(Math.round(total_score_data)).toBe(39);

    // すべての評価値が定義された基準内（0～100）であることを確認
    evaluation_results.forEach((result) => {
      expect(result.kpi_contribution_score).toBeGreaterThanOrEqual(0);
      expect(result.kpi_contribution_score).toBeLessThanOrEqual(100);

      expect(result.implementation_difficulty_score).toBeGreaterThanOrEqual(0);
      expect(result.implementation_difficulty_score).toBeLessThanOrEqual(100);

      expect(result.user_impact_score).toBeGreaterThanOrEqual(0);
      expect(result.user_impact_score).toBeLessThanOrEqual(100);

      expect(result.total_priority_score).toBeGreaterThanOrEqual(0);
      expect(result.total_priority_score).toBeLessThanOrEqual(100);
    });

    // 複合的な失敗パターン（複数要因が関連する場合）を追加検証
    const composite_failure_patterns = [
      {
        pattern_id: 'FP004',
        pattern_name: 'タイムアウト+データ不整合',
        occurrence_count: 25,
        affected_users: 85,
        severity: 'critical',
      },
    ];

    const composite_proposals = [
      {
        proposal_id: 'IP004',
        failure_pattern_id: 'FP004',
        description: '総合的なシステム最適化',
        kpi_contribution_factor: 0.95,
        implementation_complexity: 0.85,
        user_impact_factor: 0.92,
      },
    ];

    const composite_results = evaluateImprovementProposals(
      composite_failure_patterns,
      composite_proposals
    );

    // 複合パターンの評価結果を検証
    expect(composite_results.length).toBe(1);
    const composite_evaluation = composite_results[0];

    // 複合パターンでは高い値が期待される
    expect(composite_evaluation.kpi_contribution_score).toBeGreaterThanOrEqual(90);
    expect(composite_evaluation.kpi_contribution_score).toBeLessThanOrEqual(100);
    expect(Math.round(composite_evaluation.kpi_contribution_score)).toBe(95);

    expect(composite_evaluation.implementation_difficulty_score).toBeGreaterThanOrEqual(80);
    expect(composite_evaluation.implementation_difficulty_score).toBeLessThanOrEqual(95);
    expect(Math.round(composite_evaluation.implementation_difficulty_score)).toBe(85);

    expect(composite_evaluation.user_impact_score).toBeGreaterThanOrEqual(88);
    expect(composite_evaluation.user_impact_score).toBeLessThanOrEqual(100);
    expect(Math.round(composite_evaluation.user_impact_score)).toBe(92);

    // 複合パターンの総合優先度スコア: (95 × 92) / 85 ≈ 102.35 → 100にクリップ
    expect(composite_evaluation.total_priority_score).toBeGreaterThanOrEqual(95);
    expect(composite_evaluation.total_priority_score).toBeLessThanOrEqual(100);
    expect(Math.round(composite_evaluation.total_priority_score)).toBe(100);

    // すべての評価が失敗パターンの特性と重大度に基づいて正確に反映されていることを最終確認
    expect(evaluation_results[0].total_priority_score).toBeGreaterThan(
      evaluation_results[1].total_priority_score
    );
    expect(evaluation_results[1].total_priority_score).toBeGreaterThan(
      evaluation_results[2].total_priority_score
    );
    expect(composite_evaluation.total_priority_score).toBeGreaterThanOrEqual(
      evaluation_results[0].total_priority_score
    );
  });
});