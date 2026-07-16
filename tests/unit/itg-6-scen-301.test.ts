import { analyzeMarketReadiness } from '../../src/logic/it-1-br-8-2-2-1';

describe('機能別使用頻度・離脱ポイント自動抽出・分析機能', () => {
  test('SCEN-301: 市場分析実施判定機能 - 四半期開始前の判定リクエストが延期判定を返す', () => {
    // 現在日時を四半期開始日（2024-04-01）の30日前に設定
    const currentDate = new Date('2024-03-02T09:00:00Z');
    const nextQuarterStartDate = new Date('2024-04-01T00:00:00Z');

    // 市場分析実施判定機能に対して分析リクエストを送信
    const result = analyzeMarketReadiness({
      currentDate,
      targetQuarterStart: nextQuarterStartDate,
    });

    // レスポンスのステータスコードが200であることを確認
    expect(result.statusCode).toBe(200);

    // 判定結果フィールドを取得
    const judgmentResult = result.body;

    // 判定結果に含まれる'status'フィールドの値を確認
    expect(judgmentResult.status).toBe('POSTPONED');

    // 判定結果に含まれる'reason'フィールドを確認
    expect(judgmentResult.reason).toMatch(/四半期開始前/);
    expect(judgmentResult.reason).toMatch(/延期/);

    // 判定結果に含まれる'nextScheduledDate'フィールドが次の四半期開始日であることを確認
    expect(judgmentResult.nextScheduledDate).toEqual(nextQuarterStartDate);

    // 追加検証: 判定結果のフィールド構造
    expect(judgmentResult).toHaveProperty('status');
    expect(judgmentResult).toHaveProperty('reason');
    expect(judgmentResult).toHaveProperty('nextScheduledDate');
  });
});