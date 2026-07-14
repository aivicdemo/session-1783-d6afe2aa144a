import { calculateWeightedPriorityScore, prioritizeImprovementProposals } from '../../src/logic/it-7-2-1';

describe('献立生成アルゴリズム改善提案の優先順位付け - 加重平均正規化', () => {
  // SCEN-915: [edge] 改善提案優先順位付け機能 - 評価値の加重平均計算時に極端に高い値と低い値が含まれても正規化されて算出される
  test('極端な評価値（1点と100点）が含まれた改善提案でも加重平均が0-100範囲内に正規化され、優先順位が正しく決定される', () => {
    // テストデータ：複数の改善提案（3件以上）を準備
    const proposals = [
      {
        proposal_id: 'IMP-001',
        proposal_name: '栄養バランスロジック改善',
        effectiveness_score: 100, // 極端に高い値
        feasibility_score: 50,
        cost_score: 40,
      },
      {
        proposal_id: 'IMP-002',
        proposal_name: '調理時間予測精度向上',
        effectiveness_score: 75,
        feasibility_score: 1, // 極端に低い値
        cost_score: 80,
      },
      {
        proposal_id: 'IMP-003',
        proposal_name: 'ユーザー好み学習エンジン',
        effectiveness_score: 1, // 極端に低い値
        feasibility_score: 100, // 極端に高い値
        cost_score: 50,
      },
      {
        proposal_id: 'IMP-004',
        proposal_name: 'アレルギー検出ロジック強化',
        effectiveness_score: 80,
        feasibility_score: 85,
        cost_score: 1, // 極端に低い値
      },
    ];

    // 評価項目ごとの加重係数を設定
    const weights = {
      effectiveness: 0.4, // 効果性
      feasibility: 0.3, // 実現性
      cost: 0.3, // コスト
    };

    // 加重平均計算ロジックを実行
    const scoredProposals = proposals.map((proposal) => {
      const weighted_score = calculateWeightedPriorityScore(
        proposal.effectiveness_score,
        proposal.feasibility_score,
        proposal.cost_score,
        weights.effectiveness,
        weights.feasibility,
        weights.cost
      );
      return {
        ...proposal,
        weighted_score,
      };
    });

    // 検証1：計算結果の評価値が0～100の範囲内に正規化されていることを確認
    scoredProposals.forEach((proposal) => {
      expect(proposal.weighted_score).toBeGreaterThanOrEqual(0);
      expect(proposal.weighted_score).toBeLessThanOrEqual(100);
    });

    // 検証2：IMP-001（effectiveness=100, feasibility=50, cost=40）の加重平均を計算
    // 期待値: 100 * 0.4 + 50 * 0.3 + 40 * 0.3 = 40 + 15 + 12 = 67
    const imp001_score = scoredProposals.find((p) => p.proposal_id === 'IMP-001')?.weighted_score;
    expect(imp001_score).toBe(67);

    // 検証3：IMP-002（effectiveness=75, feasibility=1, cost=80）の加重平均を計算
    // 期待値: 75 * 0.4 + 1 * 0.3 + 80 * 0.3 = 30 + 0.3 + 24 = 54.3
    const imp002_score = scoredProposals.find((p) => p.proposal_id === 'IMP-002')?.weighted_score;
    expect(imp002_score).toBe(54.3);

    // 検証4：IMP-003（effectiveness=1, feasibility=100, cost=50）の加重平均を計算
    // 期待値: 1 * 0.4 + 100 * 0.3 + 50 * 0.3 = 0.4 + 30 + 15 = 45.4
    const imp003_score = scoredProposals.find((p) => p.proposal_id === 'IMP-003')?.weighted_score;
    expect(imp003_score).toBe(45.4);

    // 検証5：IMP-004（effectiveness=80, feasibility=85, cost=1）の加重平均を計算
    // 期待値: 80 * 0.4 + 85 * 0.3 + 1 * 0.3 = 32 + 25.5 + 0.3 = 57.8
    const imp004_score = scoredProposals.find((p) => p.proposal_id === 'IMP-004')?.weighted_score;
    expect(imp004_score).toBe(57.8);

    // 検証6：優先順位付けの順序が、正規化された評価値に基づいて正しく並べ替えられていることを確認
    const prioritized = prioritizeImprovementProposals(scoredProposals);
    expect(prioritized[0].proposal_id).toBe('IMP-001'); // スコア 67 (最高)
    expect(prioritized[1].proposal_id).toBe('IMP-004'); // スコア 57.8
    expect(prioritized[2].proposal_id).toBe('IMP-002'); // スコア 54.3
    expect(prioritized[3].proposal_id).toBe('IMP-003'); // スコア 45.4 (最低)

    // 検証7：複数回の計算で結果の一貫性があることを検証
    const secondRun = prioritizeImprovementProposals(scoredProposals);
    expect(secondRun).toEqual(prioritized);

    // 検証8：外れ値による影響が適切に抑制されていることを確認
    // IMP-003のように極端な値が2つ含まれていても、計算結果は中間値（45.4）に収束していることを確認
    expect(imp003_score).toBeGreaterThan(1); // 最小値より大きい
    expect(imp003_score).toBeLessThan(100); // 最大値より小さい
    expect(imp003_score).toBeLessThan(imp001_score); // 相対的な優先順位が保持されている
  });
});