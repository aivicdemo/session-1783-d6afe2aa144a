import { determineMarketAnalysisExecutability } from '../../src/logic/it-1-br-4-2-1';

describe('食事制限条件の変更時に過去献立との抵触検出機能', () => {
  // SCEN-638: [normal] 市場分析実施可否判定 - 後続アクティビティの実行可否決定
  test('市場分析実施判定に基づき、ユーザーインタビュー計画策定の実行可否が正確に決定される', () => {
    // ケース1: 市場分析が完了した場合、後続アクティビティが実行可能状態
    const marketAnalysisCompleted = {
      quarterStartDate: new Date('2024-01-01T00:00:00Z'),
      requiredDataCollected: true,
      analysisTargetValid: true,
      previousAnalysisExists: true,
      dataQualityScore: 95,
    };
    const result1 = determineMarketAnalysisExecutability(marketAnalysisCompleted);
    expect(result1.canExecuteMarketAnalysis).toBe(true);
    expect(result1.interviewPlanningExecutable).toBe(true);
    expect(result1.blockedReason).toBe(null);

    // ケース2: 必要なデータが揃っていない場合、実行不可
    const missingDataAnalysis = {
      quarterStartDate: new Date('2024-01-01T00:00:00Z'),
      requiredDataCollected: false,
      analysisTargetValid: true,
      previousAnalysisExists: true,
      dataQualityScore: 85,
    };
    const result2 = determineMarketAnalysisExecutability(missingDataAnalysis);
    expect(result2.canExecuteMarketAnalysis).toBe(false);
    expect(result2.interviewPlanningExecutable).toBe(false);
    expect(result2.blockedReason).toMatch(/データ/);

    // ケース3: 分析対象が無効な場合、実行不可
    const invalidTargetAnalysis = {
      quarterStartDate: new Date('2024-01-01T00:00:00Z'),
      requiredDataCollected: true,
      analysisTargetValid: false,
      previousAnalysisExists: true,
      dataQualityScore: 80,
    };
    const result3 = determineMarketAnalysisExecutability(invalidTargetAnalysis);
    expect(result3.canExecuteMarketAnalysis).toBe(false);
    expect(result3.interviewPlanningExecutable).toBe(false);
    expect(result3.blockedReason).toMatch(/対象/);

    // ケース4: データ品質が閾値以下の場合、実行不可
    const lowQualityAnalysis = {
      quarterStartDate: new Date('2024-01-01T00:00:00Z'),
      requiredDataCollected: true,
      analysisTargetValid: true,
      previousAnalysisExists: true,
      dataQualityScore: 60,
    };
    const result4 = determineMarketAnalysisExecutability(lowQualityAnalysis);
    expect(result4.canExecuteMarketAnalysis).toBe(false);
    expect(result4.interviewPlanningExecutable).toBe(false);
    expect(result4.blockedReason).toMatch(/品質/);

    // ケース5: すべての条件を満たしているが、初回分析前の場合
    const firstAnalysisCondition = {
      quarterStartDate: new Date('2024-01-01T00:00:00Z'),
      requiredDataCollected: true,
      analysisTargetValid: true,
      previousAnalysisExists: false,
      dataQualityScore: 90,
    };
    const result5 = determineMarketAnalysisExecutability(firstAnalysisCondition);
    expect(result5.canExecuteMarketAnalysis).toBe(true);
    expect(result5.interviewPlanningExecutable).toBe(true);
    expect(result5.blockedReason).toBe(null);

    // ケース6: 複数条件が同時に不満たされた場合、最初に検出された理由を返す
    const multipleIssuesAnalysis = {
      quarterStartDate: new Date('2024-01-01T00:00:00Z'),
      requiredDataCollected: false,
      analysisTargetValid: false,
      previousAnalysisExists: true,
      dataQualityScore: 50,
    };
    const result6 = determineMarketAnalysisExecutability(multipleIssuesAnalysis);
    expect(result6.canExecuteMarketAnalysis).toBe(false);
    expect(result6.interviewPlanningExecutable).toBe(false);
    expect(result6.blockedReason).toBeDefined();
    expect(typeof result6.blockedReason).toBe('string');

    // ケース7: エラーケース - 無効な入力値
    expect(() => {
      determineMarketAnalysisExecutability({
        quarterStartDate: new Date('2024-01-01T00:00:00Z'),
        requiredDataCollected: true,
        analysisTargetValid: true,
        previousAnalysisExists: true,
        dataQualityScore: 101, // 範囲外
      });
    }).toThrow(/品質/);

    // ケース8: エラーケース - null/undefined チェック
    expect(() => {
      determineMarketAnalysisExecutability(null as any);
    }).toThrow(/入力/);
  });
});