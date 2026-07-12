import { validateSeasonalTrendApproval } from '../../src/logic/it-3';

describe('食事評価データを献立生成ロジックに反映させる機能', () => {
  // SCEN-535
  test('購買傾向承認判定機能 - 季節変動・曜日別購買傾向データが承認される場合、次期献立ロジックへの反映が決定される', () => {
    // テストデータ準備: 季節変動・曜日別購買傾向データ
    const seasonalTrendData = {
      season: 'spring',
      trends: [
        {
          dayOfWeek: 'Monday',
          purchasePattern: {
            vegetablesRatio: 0.35,
            meatRatio: 0.28,
            fishRatio: 0.22,
            grainRatio: 0.15,
          },
          averagePurchaseAmount: 5200,
          purchaseFrequency: 0.87,
          dataQualityScore: 0.92,
        },
        {
          dayOfWeek: 'Sunday',
          purchasePattern: {
            vegetablesRatio: 0.32,
            meatRatio: 0.31,
            fishRatio: 0.25,
            grainRatio: 0.12,
          },
          averagePurchaseAmount: 6800,
          purchaseFrequency: 0.89,
          dataQualityScore: 0.94,
        },
      ],
      validationScore: 0.93,
      sampleSize: 156,
      dataCollectionPeriodDays: 90,
    };

    // 承認判定ロジック実行
    const approvalResult = validateSeasonalTrendApproval(seasonalTrendData);

    // 承認判定結果が「承認」であることを検証
    expect(approvalResult.approvalStatus).toBe('approved');

    // データ品質スコアが閾値(0.90)以上であることを検証
    expect(approvalResult.qualityScore).toBeGreaterThanOrEqual(0.90);

    // サンプルサイズが最小要件(100件)以上であることを検証
    expect(approvalResult.sampleSize).toBeGreaterThanOrEqual(100);

    // データ収集期間が最小要件(60日)以上であることを検証
    expect(approvalResult.dataCollectionDays).toBeGreaterThanOrEqual(60);

    // 次期献立ロジックへの反映決定フラグが「true」に設定されていることを検証
    expect(approvalResult.reflectionDecisionFlag).toBe(true);

    // 承認日時が現在時刻の前後30分以内であることを検証（固定値で比較）
    const approvalTimestamp = new Date(approvalResult.approvalTimestamp);
    const referenceTime = new Date('2024-01-15T11:00:00Z');
    const timeDifferenceMs = Math.abs(approvalTimestamp.getTime() - referenceTime.getTime());
    expect(timeDifferenceMs).toBeLessThanOrEqual(1800000); // 30分 = 1800000ms

    // 反映対象フィールドの明確化
    expect(approvalResult.reflectionDetails).toEqual({
      seasonalPattern: 'spring',
      weekdayPatterns: expect.arrayContaining([
        expect.objectContaining({
          dayOfWeek: 'Monday',
          approved: true,
        }),
        expect.objectContaining({
          dayOfWeek: 'Sunday',
          approved: true,
        }),
      ]),
      menuGenerationPriorityLevel: 'high',
    });

    // 承認されたデータが反映対象として明記されていることを検証
    expect(approvalResult.reflectionDecisionFlag).toBe(true);
    expect(approvalResult.approvalStatus).toBe('approved');
    expect(approvalResult.readyForImplementation).toBe(true);
  });
});