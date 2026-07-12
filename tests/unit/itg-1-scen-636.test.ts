import { determineMarketAnalysisExecution } from '../../src/logic/it-1-br-4-2-1';

describe('食事制限条件の変更時に過去献立との抵触検出機能', () => {
  test('SCEN-636: 経営層から市場分析指示がある場合、実施判定が「実施」と決定される', () => {
    // Arrange
    const input = {
      managementDirectiveFlag: true,
      analysisScheduleReached: false,
      quarterStartDate: new Date('2024-01-01T00:00:00Z'),
    };

    // Act
    const result = determineMarketAnalysisExecution(input);

    // Assert
    expect(result).toEqual({
      shouldExecute: true,
      executionStatus: '実施',
      featureEnabled: true,
      reason: '経営層からの市場分析指示により実施を決定',
    });
    expect(result.shouldExecute).toBe(true);
    expect(result.executionStatus).toBe('実施');
    expect(result.featureEnabled).toBe(true);
  });
});