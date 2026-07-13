import { extractUnifiedDemandForecastData } from '../../src/logic/it-2-br-6-3-2';

describe('外部データと実績需要の相関分析・変数抽出機能', () => {
  // SCEN-262
  test('[error] 需要予測データ統一フォーマット抽出機能 - 抽出期間の指定が不正な場合にエラーを返す', () => {
    const start_date = new Date('2024-12-31T00:00:00Z');
    const end_date = new Date('2024-01-01T00:00:00Z');
    const user_id = 'user_001';

    expect(() =>
      extractUnifiedDemandForecastData({
        user_id,
        start_date,
        end_date,
      })
    ).toThrow(/抽出期間/);
  });
});