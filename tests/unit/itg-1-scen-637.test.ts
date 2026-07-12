import { determineMarketAnalysisExecution } from '../../src/logic/it-1-br-4-2-1';

describe('食事制限条件の変更時に過去献立との抵触検出機能', () => {
  // SCEN-637: [error] 市場分析実施可否判定 - 市場分析実施判定: 実施リソースが不足している場合、実施判定が『延期』と決定される
  test('should defer market analysis execution when system resources are insufficient', () => {
    const systemResources = {
      availableCpuPercent: 5,
      availableMemoryMb: 128,
      availableStorageMb: 256,
    };

    const analysisRequirements = {
      requiredCpuPercent: 20,
      requiredMemoryMb: 512,
      requiredStorageMb: 1024,
    };

    const result = determineMarketAnalysisExecution(
      systemResources,
      analysisRequirements
    );

    expect(result.executionDecision).toBe('延期');
    expect(result.reason).toMatch(/リソース不足/);
    expect(result.isAnalysisExecuted).toBe(false);
    expect(result.retryGuidance).toBeDefined();
  });
});