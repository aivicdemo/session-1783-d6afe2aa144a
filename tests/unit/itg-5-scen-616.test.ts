import { compareMultipleImprovementProposals } from '../../src/logic/it-7-2-1';

describe('アルゴリズム改善案の定量比較・優先度付け機能', () => {
  // SCEN-616: [error] 複数改善案の定量比較・優先度付け機能 - 改善案の実装コストデータが存在しない場合、比較計算がエラーで中断される
  test('SCEN-616: 実装コストデータが存在しない改善案でエラーハンドリングが正常に実行される', () => {
    const improvementProposals = [
      {
        id: 'proposal-001',
        name: '栄養バランス検証ロジック改善',
        businessValue: 85,
        technicalDifficulty: 65,
        userImpact: 78,
        implementationCost: 120,
        expectedAccuracyImprovement: 8,
      },
      {
        id: 'proposal-002',
        name: '家族好み学習アルゴリズム強化',
        businessValue: 92,
        technicalDifficulty: 78,
        userImpact: 88,
        implementationCost: null,
        expectedAccuracyImprovement: 12,
      },
      {
        id: 'proposal-003',
        name: '調理時間予測モデル最適化',
        businessValue: 72,
        technicalDifficulty: 55,
        userImpact: 65,
        implementationCost: undefined,
        expectedAccuracyImprovement: 5,
      },
    ];

    expect(() => {
      compareMultipleImprovementProposals(improvementProposals);
    }).toThrow(/実装コスト/);
  });
});