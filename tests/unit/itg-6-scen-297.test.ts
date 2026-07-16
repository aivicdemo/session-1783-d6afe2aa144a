import { calculateImprovementProposalPriorityScore } from '../../src/logic/it-1-br-8-2-1-1';

describe('改善提案優先度評価機能', () => {
  test('SCEN-297: 評価指標が0の場合や負数の場合のスコア算出がエラーとなる', () => {
    // 初期化フェーズ
    const validProposal = {
      proposalId: 'PROP-001',
      businessValue: 75,
      technicalDifficulty: 50,
      userImpact: 80,
    };

    // 正常系：すべて正の数
    const validResult = calculateImprovementProposalPriorityScore(validProposal);
    expect(validResult).toBeGreaterThan(0);
    expect(typeof validResult).toBe('number');

    // 境界値テスト: businessValue が 0
    const proposalWithZeroBusinessValue = {
      proposalId: 'PROP-002',
      businessValue: 0,
      technicalDifficulty: 50,
      userImpact: 80,
    };
    expect(() =>
      calculateImprovementProposalPriorityScore(proposalWithZeroBusinessValue)
    ).toThrow(/評価指標/);

    // 負数テスト: technicalDifficulty が負数
    const proposalWithNegativeTechnicalDifficulty = {
      proposalId: 'PROP-003',
      businessValue: 75,
      technicalDifficulty: -10,
      userImpact: 80,
    };
    expect(() =>
      calculateImprovementProposalPriorityScore(
        proposalWithNegativeTechnicalDifficulty
      )
    ).toThrow(/評価指標/);

    // 負数テスト: userImpact が負数
    const proposalWithNegativeUserImpact = {
      proposalId: 'PROP-004',
      businessValue: 75,
      technicalDifficulty: 50,
      userImpact: -15,
    };
    expect(() =>
      calculateImprovementProposalPriorityScore(proposalWithNegativeUserImpact)
    ).toThrow(/評価指標/);

    // 複数の指標が 0 または負数の場合
    const proposalWithMultipleInvalidMetrics = {
      proposalId: 'PROP-005',
      businessValue: 0,
      technicalDifficulty: -5,
      userImpact: 80,
    };
    expect(() =>
      calculateImprovementProposalPriorityScore(
        proposalWithMultipleInvalidMetrics
      )
    ).toThrow(/評価指標/);

    // エラーメッセージが適切であることを確認
    try {
      calculateImprovementProposalPriorityScore(proposalWithZeroBusinessValue);
      fail('エラーがスローされるべき');
    } catch (error: any) {
      expect(error.message).toMatch(/評価指標は正の数である必要があります/);
    }
  });
});