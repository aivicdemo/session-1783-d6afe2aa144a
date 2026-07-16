import { validateSegmentAnalysisSignificance } from '../../src/logic/it-1-br-8-2-1-1';

describe('ユーザーセグメント別の利用パターン分析ダッシュボード', () => {
  // SCEN-385
  test('p値0.05ちょうどの境界値の場合、統計的有意と判定する', () => {
    const analysisData = {
      segmentId: 'segment_001',
      segmentName: '専業主夫層_30代_子2人',
      satisfactionScoreData: {
        sampleSize: 150,
        meanScore: 7.8,
        standardDeviation: 1.2,
        pValue: 0.05,
      },
      significanceThreshold: 0.05,
    };

    const result = validateSegmentAnalysisSignificance(analysisData);

    expect(result.isSignificant).toBe(true);
    expect(result.pValue).toBe(0.05);
    expect(result.meetsThreshold).toBe(true);
    expect(result.statusFlag).toEqual('significant');
  });
});