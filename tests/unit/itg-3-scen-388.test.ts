import { analyzeMenuGenerationFlowForPainFactors } from '../../src/logic/it-1';

describe('月次食費実績の超過要因分析機能', () => {
  // SCEN-388
  test('[error] ペイン要因自動分類機能 - 分類対象となる献立生成フロー履歴がない場合にエラーが返される', () => {
    const user_id = 'user_12345';
    const menu_generation_flow_history = [];

    expect(() => {
      analyzeMenuGenerationFlowForPainFactors({
        user_id,
        menu_generation_flow_history,
      });
    }).toThrow(/献立履歴/);
  });
});