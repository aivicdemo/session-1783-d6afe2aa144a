import { calculateImprovementPriorityScore } from '../../src/logic/it-1-br-4-2-1';

describe('食事制限条件の変更時に過去献立との抵触検出機能', () => {
  test('SCEN-632: 改善提案の優先度スコア算出 - 優先度スコアの開発ロードマップ反映', () => {
    // 準備: 複数の改善提案データを作成（最低3件以上）
    const improvementProposal1 = {
      proposalId: 'imp-001',
      title: 'UI改善',
      kpiContribution: 8,
      implementationDifficulty: 3,
      userImpactDegree: 9,
    };

    const improvementProposal2 = {
      proposalId: 'imp-002',
      title: '機能追加',
      kpiContribution: 6,
      implementationDifficulty: 7,
      userImpactDegree: 7,
    };

    const improvementProposal3 = {
      proposalId: 'imp-003',
      title: 'パフォーマンス最適化',
      kpiContribution: 7,
      implementationDifficulty: 5,
      userImpactDegree: 6,
    };

    // 各改善提案に対して優先度スコア算出
    const score1 = calculateImprovementPriorityScore({
      kpiContribution: improvementProposal1.kpiContribution,
      implementationDifficulty: improvementProposal1.implementationDifficulty,
      userImpactDegree: improvementProposal1.userImpactDegree,
    });

    const score2 = calculateImprovementPriorityScore({
      kpiContribution: improvementProposal2.kpiContribution,
      implementationDifficulty: improvementProposal2.implementationDifficulty,
      userImpactDegree: improvementProposal2.userImpactDegree,
    });

    const score3 = calculateImprovementPriorityScore({
      kpiContribution: improvementProposal3.kpiContribution,
      implementationDifficulty: improvementProposal3.implementationDifficulty,
      userImpactDegree: improvementProposal3.userImpactDegree,
    });

    // 優先度スコアが正確に算出される
    expect(score1).toBe(72);
    expect(score2).toBe(42);
    expect(score3).toBe(56);

    // 開発ロードマップに表示される提案が高スコア順に並ぶことを検証
    const roadmapProposals = [
      { proposalId: improvementProposal1.proposalId, score: score1 },
      { proposalId: improvementProposal2.proposalId, score: score2 },
      { proposalId: improvementProposal3.proposalId, score: score3 },
    ].sort((a, b) => b.score - a.score);

    expect(roadmapProposals[0].proposalId).toBe('imp-001');
    expect(roadmapProposals[0].score).toBe(72);
    expect(roadmapProposals[1].proposalId).toBe('imp-003');
    expect(roadmapProposals[1].score).toBe(56);
    expect(roadmapProposals[2].proposalId).toBe('imp-002');
    expect(roadmapProposals[2].score).toBe(42);

    // スコアが同一の提案が存在する場合の安定性を確認
    const improvementProposal4 = {
      proposalId: 'imp-004',
      title: 'UI改善追加',
      kpiContribution: 8,
      implementationDifficulty: 3,
      userImpactDegree: 9,
    };

    const score4 = calculateImprovementPriorityScore({
      kpiContribution: improvementProposal4.kpiContribution,
      implementationDifficulty: improvementProposal4.implementationDifficulty,
      userImpactDegree: improvementProposal4.userImpactDegree,
    });

    expect(score4).toBe(72);

    // 同一スコアの提案が並んだ場合の安定性
    const allProposals = [
      { proposalId: improvementProposal1.proposalId, score: score1 },
      { proposalId: improvementProposal2.proposalId, score: score2 },
      { proposalId: improvementProposal3.proposalId, score: score3 },
      { proposalId: improvementProposal4.proposalId, score: score4 },
    ];

    const sortedProposals = allProposals.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.proposalId.localeCompare(b.proposalId);
    });

    // 最上位がスコア72で、その中でも proposalId でソート
    expect(sortedProposals[0].score).toBe(72);
    expect(sortedProposals[1].score).toBe(72);
    expect(sortedProposals[0].proposalId).toBe('imp-001');
    expect(sortedProposals[1].proposalId).toBe('imp-004');
    expect(sortedProposals[2].score).toBe(56);
    expect(sortedProposals[3].score).toBe(42);

    // 新規提案追加後、ロードマップが自動的に再ソートされる
    const improvementProposal5 = {
      proposalId: 'imp-005',
      title: 'セキュリティ強化',
      kpiContribution: 9,
      implementationDifficulty: 8,
      userImpactDegree: 8,
    };

    const score5 = calculateImprovementPriorityScore({
      kpiContribution: improvementProposal5.kpiContribution,
      implementationDifficulty: improvementProposal5.implementationDifficulty,
      userImpactDegree: improvementProposal5.userImpactDegree,
    });

    expect(score5).toBe(72);

    // 新規提案を含むロードマップの再ソート
    const updatedProposals = [
      ...allProposals,
      { proposalId: improvementProposal5.proposalId, score: score5 },
    ].sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.proposalId.localeCompare(b.proposalId);
    });

    // スコア72の提案が3件並ぶ
    expect(updatedProposals[0].score).toBe(72);
    expect(updatedProposals[1].score).toBe(72);
    expect(updatedProposals[2].score).toBe(72);
    expect(updatedProposals[3].score).toBe(56);
    expect(updatedProposals[4].score).toBe(42);

    // proposalId の安定ソート順序確認
    expect(updatedProposals[0].proposalId).toBe('imp-001');
    expect(updatedProposals[1].proposalId).toBe('imp-004');
    expect(updatedProposals[2].proposalId).toBe('imp-005');
  });
});