import { validateUserSatisfactionDataQuality } from '../../src/logic/it-1-br-8-2-2-1';

describe('アプリ内ログからの機能別使用頻度・離脱ポイント自動抽出・分析機能', () => {
  // SCEN-390
  test('ユーザー満足度スコアの標準偏差が極端に大きい場合、データ品質警告を発行し追加調査対象として標識する', () => {
    const satisfactionScores = [1, 2, 2, 3, 4, 5, 6, 7, 8, 9];
    const result = validateUserSatisfactionDataQuality(satisfactionScores);

    const meanScore = 5.0;
    const variance = ((1 - meanScore) ** 2 + (2 - meanScore) ** 2 + (2 - meanScore) ** 2 + (3 - meanScore) ** 2 + (4 - meanScore) ** 2 + (5 - meanScore) ** 2 + (6 - meanScore) ** 2 + (7 - meanScore) ** 2 + (8 - meanScore) ** 2 + (9 - meanScore) ** 2) / 10;
    const standardDeviation = Math.sqrt(variance);

    expect(result).toHaveProperty('warningFlag');
    expect(result.warningFlag).toBe(true);

    expect(result).toHaveProperty('standardDeviation');
    expect(result.standardDeviation).toBeCloseTo(standardDeviation, 2);

    expect(result).toHaveProperty('status');
    expect(result.status).toBe('要調査');

    expect(result).toHaveProperty('warningMessage');
    expect(result.warningMessage).toMatch(/標準偏差/);
    expect(result.warningMessage).toMatch(/3\.0/);

    expect(result).toHaveProperty('requiresAdditionalInvestigation');
    expect(result.requiresAdditionalInvestigation).toBe(true);

    expect(result).toHaveProperty('dataQualityReport');
    expect(result.dataQualityReport).toHaveProperty('meanScore');
    expect(result.dataQualityReport.meanScore).toBeCloseTo(meanScore, 2);
    expect(result.dataQualityReport).toHaveProperty('sampleSize');
    expect(result.dataQualityReport.sampleSize).toBe(10);
  });
});