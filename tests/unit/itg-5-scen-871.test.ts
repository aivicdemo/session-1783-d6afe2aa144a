import { generateImprovementProposalReport } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の分類と失敗パターン特定 - 改善提案レポート生成', () => {
  // SCEN-871: [edge] 改善提案レポート生成機能 - 改善効果が0である場合にレポートが生成され効果なし判定が記載される
  test('改善効果が0である場合、レポートが正常に生成され、効果なし判定が記載される', () => {
    const improvementProposalData = {
      proposalId: 'PROP-2024-001',
      title: 'アルゴリズム修正：栄養バランス計算式',
      description: 'タンパク質計算ロジックの修正',
      proposalType: 'アルゴリズム修正',
      kpiContributionScore: 45,
      implementationDifficulty: 30,
      userImpactScore: 50,
      improvementEffectScore: 0,
      preImprovementSuccessRate: 72.5,
      postImprovementSuccessRate: 72.5,
      improvementEffectPercentage: 0,
      preconditionSatisfied: true,
      createdAt: '2024-01-15T11:00:00Z'
    };

    const report = generateImprovementProposalReport(improvementProposalData);

    expect(report).toBeDefined();
    expect(report.reportId).toBeDefined();
    expect(typeof report.reportId).toBe('string');
    expect(report.proposalId).toBe('PROP-2024-001');
    expect(report.title).toBe('アルゴリズム修正：栄養バランス計算式');
    expect(report.improvementEffectScore).toBe(0);
    expect(report.improvementEffectPercentage).toBe(0);
    expect(report.judgmentStatus).toBe('効果なし');
    expect(report.generatedAt).toBeDefined();
    expect(typeof report.generatedAt).toBe('string');
    expect(report.isValid).toBe(true);
    expect(report.errorMessage).toBeNull();
  });
});