import { shouldExecuteMarketAnalysis } from '../../src/logic/it-1-br-8-2-2-1';

describe('機能別使用頻度・離脱ポイント自動抽出・分析機能', () => {
  // SCEN-300
  test('[normal] 市場分析実施判定機能 - 経営層から市場分析指示があった場合に実施判定が true となる', () => {
    const managementDirective = true;
    const result = shouldExecuteMarketAnalysis(managementDirective);
    expect(result).toBe(true);
  });
});