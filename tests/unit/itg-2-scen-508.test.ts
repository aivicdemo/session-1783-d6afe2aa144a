import { detectCyclicDependencies } from '../../src/logic/it-1-br-2-1-2-1';

describe('改善提案の優先度付けと通知スケジュール確定', () => {
  // SCEN-508
  test('循環依存する改善提案が検出され、エラーが発生する', () => {
    const proposals = [
      {
        id: 'proposal-a',
        title: '提案A',
        description: '栄養基準ロジック改善案A',
        businessValue: 8,
        technicalDifficulty: 5,
        userImpact: 7,
        dependsOnProposalIds: ['proposal-c'],
        priority: 0,
        createdAt: new Date('2024-01-15T10:00:00Z'),
        createdBy: 'nutritionist-001',
        status: 'pending_prioritization',
      },
      {
        id: 'proposal-b',
        title: '提案B',
        description: '栄養基準ロジック改善案B',
        businessValue: 7,
        technicalDifficulty: 4,
        userImpact: 6,
        dependsOnProposalIds: ['proposal-a'],
        priority: 0,
        createdAt: new Date('2024-01-15T11:00:00Z'),
        createdBy: 'nutritionist-001',
        status: 'pending_prioritization',
      },
      {
        id: 'proposal-c',
        title: '提案C',
        description: '栄養基準ロジック改善案C',
        businessValue: 6,
        technicalDifficulty: 3,
        userImpact: 5,
        dependsOnProposalIds: ['proposal-b'],
        priority: 0,
        createdAt: new Date('2024-01-15T12:00:00Z'),
        createdBy: 'nutritionist-001',
        status: 'pending_prioritization',
      },
    ];

    expect(() => {
      detectCyclicDependencies(proposals);
    }).toThrow(/循環依存/);
  });
});