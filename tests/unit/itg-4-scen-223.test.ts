import { determineDemandAnalysisTiming } from '../../src/logic/it-1-br-6-2-1';

describe('需要予測精度検証ダッシュボード：予測値と実績値の照合・乖離分析機能', () => {
  // SCEN-223
  test('分析タイミング判定機能 - 毎月初日09:00に月次分析タイミングが正しく判定される', () => {
    // 毎月1日の09:00ちょうど
    const analysisTimeOnFirstDayAt0900 = determineDemandAnalysisTiming(
      new Date('2024-01-01T09:00:00Z')
    );
    expect(analysisTimeOnFirstDayAt0900.isMonthlyAnalysisTime).toBe(true);
    expect(analysisTimeOnFirstDayAt0900.isPendingMonthlyAnalysis).toBe(true);
    expect(analysisTimeOnFirstDayAt0900.analysisType).toBe('monthly');

    // 毎月1日の08:59（1分前）
    const analysisTimeOnFirstDayAt0859 = determineDemandAnalysisTiming(
      new Date('2024-01-01T08:59:00Z')
    );
    expect(analysisTimeOnFirstDayAt0859.isMonthlyAnalysisTime).toBe(false);
    expect(analysisTimeOnFirstDayAt0859.isPendingMonthlyAnalysis).toBe(false);
    expect(analysisTimeOnFirstDayAt0859.analysisType).toBeNull();

    // 毎月1日の09:01（1分後）
    const analysisTimeOnFirstDayAt0901 = determineDemandAnalysisTiming(
      new Date('2024-01-01T09:01:00Z')
    );
    expect(analysisTimeOnFirstDayAt0901.isMonthlyAnalysisTime).toBe(true);
    expect(analysisTimeOnFirstDayAt0901.isPendingMonthlyAnalysis).toBe(true);
    expect(analysisTimeOnFirstDayAt0901.analysisType).toBe('monthly');

    // 毎月2日の09:00（翌日同時刻）
    const analysisTimeOnSecondDayAt0900 = determineDemandAnalysisTiming(
      new Date('2024-01-02T09:00:00Z')
    );
    expect(analysisTimeOnSecondDayAt0900.isMonthlyAnalysisTime).toBe(false);
    expect(analysisTimeOnSecondDayAt0900.isPendingMonthlyAnalysis).toBe(false);
    expect(analysisTimeOnSecondDayAt0900.analysisType).toBeNull();

    // 別月の1日09:00でも月次分析タイミングが判定されること（月が異なる場合）
    const analysisTimeOnFebFirstAt0900 = determineDemandAnalysisTiming(
      new Date('2024-02-01T09:00:00Z')
    );
    expect(analysisTimeOnFebFirstAt0900.isMonthlyAnalysisTime).toBe(true);
    expect(analysisTimeOnFebFirstAt0900.isPendingMonthlyAnalysis).toBe(true);
    expect(analysisTimeOnFebFirstAt0900.analysisType).toBe('monthly');
  });
});