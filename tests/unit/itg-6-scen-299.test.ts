import { determineMarketAnalysisExecution } from '../../src/logic/it-1-br-8-2-2-1';

describe('市場分析実施判定機能', () => {
  // SCEN-299
  test('四半期開始日到来時に市場分析実施が正しく判定される', () => {
    // Arrange: 四半期開始日のテストケース（1月1日、4月1日、7月1日、10月1日）
    const q1StartDate = new Date('2024-01-01T00:00:00Z');
    const q2StartDate = new Date('2024-04-01T00:00:00Z');
    const q3StartDate = new Date('2024-07-01T00:00:00Z');
    const q4StartDate = new Date('2024-10-01T00:00:00Z');
    const lastAnalysisDate = new Date('2023-10-01T09:30:00Z');

    // Act & Assert: 各四半期開始日で実施判定を確認
    const q1Result = determineMarketAnalysisExecution({
      currentDate: q1StartDate,
      lastExecutionDate: lastAnalysisDate,
    });

    expect(q1Result.shouldExecute).toBe(true);
    expect(q1Result.analysisTypes).toEqual([
      'user_pain_analysis',
      'differentiation_axis_verification',
      'competitor_analysis',
    ]);
    expect(q1Result.executionStatus).toBe('ready');
    expect(q1Result.lastExecutedAt).toEqual(lastAnalysisDate);
    expect(q1Result.quarterCode).toBe('Q1_2024');

    const q2Result = determineMarketAnalysisExecution({
      currentDate: q2StartDate,
      lastExecutionDate: lastAnalysisDate,
    });

    expect(q2Result.shouldExecute).toBe(true);
    expect(q2Result.analysisTypes).toEqual([
      'user_pain_analysis',
      'differentiation_axis_verification',
      'competitor_analysis',
    ]);
    expect(q2Result.executionStatus).toBe('ready');
    expect(q2Result.quarterCode).toBe('Q2_2024');

    const q3Result = determineMarketAnalysisExecution({
      currentDate: q3StartDate,
      lastExecutionDate: lastAnalysisDate,
    });

    expect(q3Result.shouldExecute).toBe(true);
    expect(q3Result.analysisTypes).toEqual([
      'user_pain_analysis',
      'differentiation_axis_verification',
      'competitor_analysis',
    ]);
    expect(q3Result.executionStatus).toBe('ready');
    expect(q3Result.quarterCode).toBe('Q3_2024');

    const q4Result = determineMarketAnalysisExecution({
      currentDate: q4StartDate,
      lastExecutionDate: lastAnalysisDate,
    });

    expect(q4Result.shouldExecute).toBe(true);
    expect(q4Result.analysisTypes).toEqual([
      'user_pain_analysis',
      'differentiation_axis_verification',
      'competitor_analysis',
    ]);
    expect(q4Result.executionStatus).toBe('ready');
    expect(q4Result.quarterCode).toBe('Q4_2024');

    // 四半期以外の日付では実施しない
    const nonQuarterDate = new Date('2024-02-15T10:00:00Z');
    const nonQuarterResult = determineMarketAnalysisExecution({
      currentDate: nonQuarterDate,
      lastExecutionDate: lastAnalysisDate,
    });

    expect(nonQuarterResult.shouldExecute).toBe(false);
    expect(nonQuarterResult.executionStatus).toBe('waiting');

    // 前回実行日が同じ四半期の場合は実施しない
    const samePeriodLastExecution = new Date('2024-01-15T14:00:00Z');
    const sameQuarterResult = determineMarketAnalysisExecution({
      currentDate: q1StartDate,
      lastExecutionDate: samePeriodLastExecution,
    });

    expect(sameQuarterResult.shouldExecute).toBe(false);
    expect(sameQuarterResult.executionStatus).toBe('already_executed');
  });
});