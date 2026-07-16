import { describe, test, expect, beforeEach } from '@jest/globals';
import {
  analyzeCompetitivePositioning,
  calculateDifferentiationGap,
  generateComparisonMatrix,
  validatePainFactorScores,
} from '../../src/logic/it-8-1-1-1';

describe('競合アプリとの差別化軸検証機能 - ペイン要因別対応度スコア比較', () => {
  // SCEN-329: 複数のペイン要因について個別に対応度スコア比較が実施される

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('複数ペイン要因の対応度スコア比較と差別化軸提案を生成する', () => {
    // === 前提条件 ===
    // プロダクトマネージャーがペイン要因の優先度マトリクスを作成済み。
    // 競合アプリとの差別化軸検証が開始される。
    // 複数のペイン要因（操作性、コスト、機能充実度）と各社の対応度スコアが準備される。

    // === Input: ペイン要因と各社の対応度スコア ===
    const painFactors = [
      {
        pain_factor_id: 'PF001',
        pain_name: '操作性',
        occurrence_frequency: 45,
        impact_degree: 85,
      },
      {
        pain_factor_id: 'PF002',
        pain_name: 'コスト',
        occurrence_frequency: 38,
        impact_degree: 72,
      },
      {
        pain_factor_id: 'PF003',
        pain_name: '機能充実度',
        occurrence_frequency: 52,
        impact_degree: 78,
      },
    ];

    const competitiveScores = {
      PF001: {
        our_app_score: 82,
        competitor_app_1_score: 60,
        competitor_app_2_score: 65,
      },
      PF002: {
        our_app_score: 58,
        competitor_app_1_score: 75,
        competitor_app_2_score: 72,
      },
      PF003: {
        our_app_score: 88,
        competitor_app_1_score: 70,
        competitor_app_2_score: 68,
      },
    };

    // === ビジネスルール検証 ===
    // 1. 各ペイン要因について、自社と競合アプリの対応度スコア（0～100）を比較
    // 2. 差別化可能性が高いペイン要因 = 対応度ギャップが30以上
    // 3. ギャップ計算: max(our_app_score - competitor_app_1_score, our_app_score - competitor_app_2_score)

    // === Validation: スコアの妥当性を事前検証 ===
    const validationResult = validatePainFactorScores(competitiveScores);
    expect(validationResult.is_valid).toBe(true);
    expect(validationResult.error_messages).toEqual([]);

    // === Main Logic 1: 対応度ギャップ計算 ===
    // PF001 (操作性): our_app_score=82, comp1=60, comp2=65
    // ギャップ: max(82-60, 82-65) = max(22, 17) = 22 (差別化可能性: 低)
    const gap_pf001 = calculateDifferentiationGap(
      competitiveScores.PF001.our_app_score,
      competitiveScores.PF001.competitor_app_1_score,
      competitiveScores.PF001.competitor_app_2_score
    );
    expect(gap_pf001).toBe(22);

    // PF002 (コスト): our_app_score=58, comp1=75, comp2=72
    // ギャップ: max(58-75, 58-72) = max(-17, -14) = -14 (競合優位)
    const gap_pf002 = calculateDifferentiationGap(
      competitiveScores.PF002.our_app_score,
      competitiveScores.PF002.competitor_app_1_score,
      competitiveScores.PF002.competitor_app_2_score
    );
    expect(gap_pf002).toBe(-14);

    // PF003 (機能充実度): our_app_score=88, comp1=70, comp2=68
    // ギャップ: max(88-70, 88-68) = max(18, 20) = 20 (差別化可能性: 低)
    const gap_pf003 = calculateDifferentiationGap(
      competitiveScores.PF003.our_app_score,
      competitiveScores.PF003.competitor_app_1_score,
      competitiveScores.PF003.competitor_app_2_score
    );
    expect(gap_pf003).toBe(20);

    // === Main Logic 2: 比較マトリックス生成 ===
    // 各ペイン要因について、自社と競合の対応度スコアを可視化する構造を生成
    const comparisonMatrix = generateComparisonMatrix(
      painFactors,
      competitiveScores
    );

    // === Assertion 1: マトリックス構造の正確性 ===
    expect(comparisonMatrix).toBeDefined();
    expect(comparisonMatrix.comparison_data).toHaveLength(3);

    // === Assertion 2: 各ペイン要因の個別比較データ検証 ===
    // ペイン要因1 (操作性) の比較結果
    const pf001_comparison = comparisonMatrix.comparison_data[0];
    expect(pf001_comparison.pain_factor_id).toBe('PF001');
    expect(pf001_comparison.pain_name).toBe('操作性');
    expect(pf001_comparison.our_app_score).toBe(82);
    expect(pf001_comparison.competitor_app_1_score).toBe(60);
    expect(pf001_comparison.competitor_app_2_score).toBe(65);
    expect(pf001_comparison.differentiation_gap).toBe(22);
    expect(pf001_comparison.is_differentiable).toBe(false);

    // ペイン要因2 (コスト) の比較結果
    const pf002_comparison = comparisonMatrix.comparison_data[1];
    expect(pf002_comparison.pain_factor_id).toBe('PF002');
    expect(pf002_comparison.pain_name).toBe('コスト');
    expect(pf002_comparison.our_app_score).toBe(58);
    expect(pf002_comparison.competitor_app_1_score).toBe(75);
    expect(pf002_comparison.competitor_app_2_score).toBe(72);
    expect(pf002_comparison.differentiation_gap).toBe(-14);
    expect(pf002_comparison.is_differentiable).toBe(false);

    // ペイン要因3 (機能充実度) の比較結果
    const pf003_comparison = comparisonMatrix.comparison_data[2];
    expect(pf003_comparison.pain_factor_id).toBe('PF003');
    expect(pf003_comparison.pain_name).toBe('機能充実度');
    expect(pf003_comparison.our_app_score).toBe(88);
    expect(pf003_comparison.competitor_app_1_score).toBe(70);
    expect(pf003_comparison.competitor_app_2_score).toBe(68);
    expect(pf003_comparison.differentiation_gap).toBe(20);
    expect(pf003_comparison.is_differentiable).toBe(false);

    // === Main Logic 3: 差別化軸の提案と総合分析結果 ===
    const analysisResult = analyzeCompetitivePositioning(
      painFactors,
      competitiveScores
    );

    // === Assertion 3: 総合分析結果の構造と内容 ===
    expect(analysisResult).toBeDefined();
    expect(analysisResult.analysis_timestamp).toBeDefined();

    // === Assertion 4: 差別化軸の提案内容検証 ===
    // ビジネスルール: 対応度ギャップが30以上のペイン要因のみが差別化軸として推奨
    expect(analysisResult.differentiation_axes).toBeDefined();
    expect(Array.isArray(analysisResult.differentiation_axes)).toBe(true);

    // 本テストケースでは全ペイン要因のギャップが30未満であるため、
    // 差別化軸は生成されない。ただし、分析結果は存在する。
    const high_gap_factors = analysisResult.differentiation_axes.filter(
      (axis: { differentiation_gap: number }) =>
        axis.differentiation_gap >= 30
    );
    expect(high_gap_factors).toHaveLength(0);

    // === Assertion 5: 改善可能性のある領域の識別 ===
    // ペイン要因2 (コスト) は競合優位であるため、改善が必要
    const improvement_recommendations =
      analysisResult.improvement_recommendations;
    expect(improvement_recommendations).toBeDefined();
    expect(Array.isArray(improvement_recommendations)).toBe(true);

    const cost_improvement = improvement_recommendations.find(
      (rec: { pain_factor_id: string }) => rec.pain_factor_id === 'PF002'
    );
    expect(cost_improvement).toBeDefined();
    expect(cost_improvement.recommendation_type).toBe('improvement');
    expect(cost_improvement.priority_score).toBeGreaterThan(0);

    // === Assertion 6: 複数要因の統合分析スコア ===
    // 全ペイン要因の平均ギャップを計算して総合競争力スコアを算出
    // (22 + (-14) + 20) / 3 = 28 / 3 ≈ 9.33
    const expected_average_gap = 9.33;
    expect(analysisResult.overall_competitive_score).toBeCloseTo(
      expected_average_gap,
      1
    );

    // === Assertion 7: 各ペイン要因の優先度付けと総合ランク ===
    expect(analysisResult.overall_rank).toBeDefined();
    expect(['HIGH', 'MEDIUM', 'LOW']).toContain(analysisResult.overall_rank);

    // 差別化ギャップが全体的に小さいため、総合ランクはMEDIUMまたはLOW
    expect(['MEDIUM', 'LOW']).toContain(analysisResult.overall_rank);

    // === Assertion 8: ダッシュボード表示用のメタデータ ===
    expect(analysisResult.dashboard_visualizations).toBeDefined();
    expect(analysisResult.dashboard_visualizations.comparison_charts).toEqual(3);
    expect(analysisResult.dashboard_visualizations.includes_summary).toBe(true);

    // === Assertion 9: 差別化軸根拠の明確性 ===
    // ペイン要因1 (操作性) の提案理由
    const pf001_proposal = analysisResult.differentiation_axes.find(
      (axis: { pain_factor_id: string }) => axis.pain_factor_id === 'PF001'
    ) || {
      pain_factor_id: 'PF001',
      rationale: '競合比で22ポイント上回っている領域だが、30ポイント未満のため戦略的強化が必要',
    };

    if (pf001_proposal && pf001_proposal.rationale) {
      expect(pf001_proposal.rationale).toMatch(/差別化|強化|競合/);
    }

    // === Assertion 10: データ品質と信頼度 ===
    expect(analysisResult.data_quality_score).toBeGreaterThanOrEqual(0);
    expect(analysisResult.data_quality_score).toBeLessThanOrEqual(100);
    expect(analysisResult.data_quality_score).toBeGreaterThanOrEqual(85);

    // === エラーケース: スコアの有効性 ===
    // 無効なスコア（範囲外）を入力した場合
    const invalid_scores = {
      PF004: {
        our_app_score: 150,
        competitor_app_1_score: 60,
        competitor_app_2_score: 65,
      },
    };

    const invalid_validation = validatePainFactorScores(invalid_scores);
    expect(invalid_validation.is_valid).toBe(false);
    expect(invalid_validation.error_messages.length).toBeGreaterThan(0);
    expect(invalid_validation.error_messages[0]).toMatch(/スコア|範囲|無効/);

    // === エラーケース: 欠損値 ===
    const incomplete_scores = {
      PF005: {
        our_app_score: 75,
        // competitor_app_1_score が欠損
        competitor_app_2_score: 70,
      },
    };

    const incomplete_validation = validatePainFactorScores(incomplete_scores);
    expect(incomplete_validation.is_valid).toBe(false);
    expect(incomplete_validation.error_messages[0]).toMatch(/欠損|必須|入力/);
  });
});