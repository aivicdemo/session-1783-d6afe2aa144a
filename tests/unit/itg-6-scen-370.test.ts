import { analyzeFeatureUsageAndDropoffPoints } from '../../src/logic/it-1-br-8-2-2-1';

describe('機能別使用頻度・離脱ポイント自動抽出・分析機能', () => {
  // SCEN-370
  test('集計済みログデータが存在しない場合、エラーハンドリングが実行される', () => {
    const empty_aggregated_logs: object[] = [];

    expect(() => {
      analyzeFeatureUsageAndDropoffPoints(empty_aggregated_logs);
    }).toThrow(/集計済みログ/);
  });
});