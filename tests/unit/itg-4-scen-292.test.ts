import { generateImprovementProposalWithFactorScoring } from '../../src/logic/it-3-br-6-3-3';

describe('予測精度低下要因の可視化ダッシュボード', () => {
  // SCEN-292
  test('改善提案書生成時の要因別スコアリング - 複数の予測精度低下要因がある場合に全要因が優先度順に整列される', () => {
    const input_factors = [
      {
        factor_id: 'seasonality_001',
        factor_name: '季節性の変動',
        impact_score: 85,
        implementation_difficulty: 40,
        data_quality_score: 92
      },
      {
        factor_id: 'external_001',
        factor_name: '外部要因の影響',
        impact_score: 72,
        implementation_difficulty: 65,
        data_quality_score: 78
      },
      {
        factor_id: 'data_quality_001',
        factor_name: 'データ品質の問題',
        impact_score: 65,
        implementation_difficulty: 35,
        data_quality_score: 55
      },
      {
        factor_id: 'pattern_change_001',
        factor_name: '需要パターンの変化',
        impact_score: 78,
        implementation_difficulty: 58,
        data_quality_score: 81
      }
    ];

    const proposal_id = 'proposal_2024_001';
    const generated_date = new Date('2024-12-15T10:30:00Z');

    const result = generateImprovementProposalWithFactorScoring({
      proposal_id: proposal_id,
      factors: input_factors,
      generated_date: generated_date
    });

    // 優先度スコア計算: (impact_score * 0.5) + (100 - implementation_difficulty) * 0.3 + (data_quality_score * 0.2)
    // 季節性: (85 * 0.5) + (60 * 0.3) + (92 * 0.2) = 42.5 + 18 + 18.4 = 78.9
    // 外部要因: (72 * 0.5) + (35 * 0.3) + (78 * 0.2) = 36 + 10.5 + 15.6 = 62.1
    // データ品質: (65 * 0.5) + (65 * 0.3) + (55 * 0.2) = 32.5 + 19.5 + 11 = 63
    // パターン変化: (78 * 0.5) + (42 * 0.3) + (81 * 0.2) = 39 + 12.6 + 16.2 = 67.8

    expect(result).toHaveProperty('proposal_id', proposal_id);
    expect(result).toHaveProperty('generated_date', generated_date);
    expect(result.scored_factors).toHaveLength(4);

    // 優先度スコア降順確認
    expect(result.scored_factors[0]).toMatchObject({
      factor_id: 'seasonality_001',
      factor_name: '季節性の変動',
      priority_score: 78.9
    });
    expect(result.scored_factors[1]).toMatchObject({
      factor_id: 'pattern_change_001',
      factor_name: '需要パターンの変化',
      priority_score: 67.8
    });
    expect(result.scored_factors[2]).toMatchObject({
      factor_id: 'data_quality_001',
      factor_name: 'データ品質の問題',
      priority_score: 63
    });
    expect(result.scored_factors[3]).toMatchObject({
      factor_id: 'external_001',
      factor_name: '外部要因の影響',
      priority_score: 62.1
    });

    // スコア値が降順であることを検証
    for (let i = 0; i < result.scored_factors.length - 1; i++) {
      expect(result.scored_factors[i].priority_score).toBeGreaterThanOrEqual(
        result.scored_factors[i + 1].priority_score
      );
    }

    // 全要因が漏れなく含まれていることを確認
    const returned_factor_ids = result.scored_factors.map((f) => f.factor_id);
    const input_factor_ids = input_factors.map((f) => f.factor_id);
    expect(returned_factor_ids.sort()).toEqual(input_factor_ids.sort());

    // 提案書ステータスが正常であることを確認
    expect(result).toHaveProperty('status', 'generated');
  });
});