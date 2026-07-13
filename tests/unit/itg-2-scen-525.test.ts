import { generateImprovementProposals } from '../../src/logic/it-1-br-2-1-2-1';

describe('改善提案書生成機能 - 複数提案の同一優先度スコアリング', () => {
  // SCEN-525
  test('複数改善提案が同一優先度スコアの場合、すべて提案書に含まれ登録順で表示される', () => {
    // Precondition: 栄養士が複数の改善提案候補を作成し、すべてに同一の優先度スコア（85）を設定
    const improvementCandidates = [
      {
        proposalId: 'prop_001',
        title: '朝食の鉄分摂取量を増加',
        description: '朝食献立に鉄分豊富な食材を優先',
        businessValue: 8,
        technicalDifficulty: 3,
        userImpact: 9,
        createdAt: '2024-01-15T10:00:00Z',
        createdBy: 'nutritionist_001',
        registrationOrder: 1,
      },
      {
        proposalId: 'prop_002',
        title: 'カルシウム摂取基準を月次で達成率100%',
        description: '乳製品含有献立の提案頻度を上昇',
        businessValue: 8,
        technicalDifficulty: 3,
        userImpact: 9,
        createdAt: '2024-01-15T10:15:00Z',
        createdBy: 'nutritionist_001',
        registrationOrder: 2,
      },
      {
        proposalId: 'prop_003',
        title: 'ビタミンDの推奨値達成率を向上',
        description: 'キノコ類・魚類を含む献立を増加',
        businessValue: 8,
        technicalDifficulty: 3,
        userImpact: 9,
        createdAt: '2024-01-15T10:30:00Z',
        createdBy: 'nutritionist_001',
        registrationOrder: 3,
      },
    ];

    // Trigger: 優先度スコアリング処理を実行（すべての提案に同一スコア85を算出）
    const result = generateImprovementProposals(improvementCandidates);

    // Expected Outcome:
    // 1. すべての提案が提案書に含まれる
    expect(result.proposalCount).toBe(3);
    expect(result.proposals.length).toBe(3);

    // 2. すべての提案が同一の優先度スコア85を持つ
    expect(result.proposals[0].priorityScore).toBe(85);
    expect(result.proposals[1].priorityScore).toBe(85);
    expect(result.proposals[2].priorityScore).toBe(85);

    // 3. 登録順に一貫性のある順序で表示される
    expect(result.proposals[0].proposalId).toBe('prop_001');
    expect(result.proposals[0].registrationOrder).toBe(1);

    expect(result.proposals[1].proposalId).toBe('prop_002');
    expect(result.proposals[1].registrationOrder).toBe(2);

    expect(result.proposals[2].proposalId).toBe('prop_003');
    expect(result.proposals[2].registrationOrder).toBe(3);

    // 4. 提案の削除や除外が行われない
    expect(result.excludedCount).toBe(0);
    expect(result.deletedCount).toBe(0);

    // 5. 提案書生成ステータスが成功
    expect(result.status).toBe('success');
    expect(result.generatedAt).toBeDefined();

    // 6. 各提案がすべてのメタデータを保持
    result.proposals.forEach((proposal) => {
      expect(proposal.proposalId).toBeDefined();
      expect(proposal.title).toBeDefined();
      expect(proposal.description).toBeDefined();
      expect(proposal.priorityScore).toBe(85);
      expect(proposal.displayOrder).toBeDefined();
      expect(proposal.createdAt).toBeDefined();
      expect(proposal.createdBy).toBeDefined();
    });

    // 7. 表示順序が登録順と一致
    expect(result.proposals[0].displayOrder).toBe(1);
    expect(result.proposals[1].displayOrder).toBe(2);
    expect(result.proposals[2].displayOrder).toBe(3);
  });
});