import { recalculatePriorityMatrix } from '../../src/logic/it-8-1-1-1';

describe('ユーザーインタビュー記録と利用ログから食材制限・調理時間制限・予算制約の優先度マトリクス生成', () => {
  // SCEN-353
  test('競合分析データが存在しない状態で再計算が要求されたとき、エラーが発生する', () => {
    const inputData = {
      painFactors: [
        {
          painFactorId: 'pf_001',
          categoryName: '食材制限',
          occurrenceFrequency: 45,
          impactDegree: 8,
          affectedSegments: ['segment_001', 'segment_002'],
        },
        {
          painFactorId: 'pf_002',
          categoryName: '調理時間制限',
          occurrenceFrequency: 62,
          impactDegree: 9,
          affectedSegments: ['segment_001', 'segment_003'],
        },
        {
          painFactorId: 'pf_003',
          categoryName: '予算制約',
          occurrenceFrequency: 38,
          impactDegree: 7,
          affectedSegments: ['segment_002'],
        },
      ],
      competitiveAnalysisData: [],
      analysisTimestamp: new Date('2024-12-01T10:00:00Z'),
      quarterPeriod: '2024Q4',
    };

    expect(() => {
      recalculatePriorityMatrix(inputData);
    }).toThrow(/競合分析/);
  });
});