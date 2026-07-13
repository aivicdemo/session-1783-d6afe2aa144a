import { determineMealAnalysisTimingWeekly } from '../../src/logic/it-1-br-2-1-2-1';

describe('栄養士からの改善提案を優先度付けして管理し、開発チームに定期通知する機能', () => {
  // SCEN-547: [error] 分析タイミング判定機能 - 月曜日以外の平日 09:00 では分析タイミングが判定されない
  test('月曜日以外の平日 09:00 では分析タイミングが判定されない', () => {
    // 木曜日 09:00 でテスト
    const thursdayDate = new Date('2024-01-18T09:00:00Z'); // 2024-01-18 は木曜日
    const thursdayResult = determineMealAnalysisTimingWeekly(thursdayDate);
    expect(thursdayResult).toBe(false);

    // 金曜日 09:00 でテスト
    const fridayDate = new Date('2024-01-19T09:00:00Z'); // 2024-01-19 は金曜日
    const fridayResult = determineMealAnalysisTimingWeekly(fridayDate);
    expect(fridayResult).toBe(false);

    // 水曜日 09:00 でテスト
    const wednesdayDate = new Date('2024-01-17T09:00:00Z'); // 2024-01-17 は水曜日
    const wednesdayResult = determineMealAnalysisTimingWeekly(wednesdayDate);
    expect(wednesdayResult).toBe(false);

    // 月曜日 09:00 では true であることを確認（正常系）
    const mondayDate = new Date('2024-01-15T09:00:00Z'); // 2024-01-15 は月曜日
    const mondayResult = determineMealAnalysisTimingWeekly(mondayDate);
    expect(mondayResult).toBe(true);

    // 火曜日 09:00 でテスト
    const tuesdayDate = new Date('2024-01-16T09:00:00Z'); // 2024-01-16 は火曜日
    const tuesdayResult = determineMealAnalysisTimingWeekly(tuesdayDate);
    expect(tuesdayResult).toBe(false);
  });
});