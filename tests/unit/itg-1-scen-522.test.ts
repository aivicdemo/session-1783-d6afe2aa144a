import { judgeAnalysisTimingWeekly } from '../../src/logic/it-2';

describe('家族成員の食事評価データの蓄積・管理機能', () => {
  // SCEN-522: [normal] 分析タイミング判定機能 - 毎週月曜日09:00に週次分析タイミングが正しく判定される
  test('毎週月曜日09:00ちょうどのときのみ週次分析タイミングとして判定される', () => {
    // 月曜日 08:59 - 判定されない
    const mondayBefore = new Date('2024-01-08T08:59:00Z');
    const resultBefore = judgeAnalysisTimingWeekly(mondayBefore);
    expect(resultBefore).toBe(false);

    // 月曜日 09:00 - 判定される
    const mondayExact = new Date('2024-01-08T09:00:00Z');
    const resultExact = judgeAnalysisTimingWeekly(mondayExact);
    expect(resultExact).toBe(true);

    // 月曜日 09:01 - 判定されない
    const mondayAfter = new Date('2024-01-08T09:01:00Z');
    const resultAfter = judgeAnalysisTimingWeekly(mondayAfter);
    expect(resultAfter).toBe(false);

    // 火曜日 09:00 - 判定されない
    const tuesdayExact = new Date('2024-01-09T09:00:00Z');
    const resultTuesday = judgeAnalysisTimingWeekly(tuesdayExact);
    expect(resultTuesday).toBe(false);
  });
});