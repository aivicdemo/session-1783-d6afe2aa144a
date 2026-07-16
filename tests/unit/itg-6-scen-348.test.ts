import { validateAnalysisTrustDegree } from '../../src/logic/it-8-1-1-1';

describe('分析結果信頼度判定機能', () => {
  // SCEN-348
  test('インタビュー記録とログデータが両方とも欠落しているとき、エラーが発生する', () => {
    const interview_records = null;
    const log_data = null;

    expect(() => validateAnalysisTrustDegree(interview_records, log_data)).toThrow(/必要なデータが不足しています|インタビュー記録とログデータの両方が必須です/);
  });
});