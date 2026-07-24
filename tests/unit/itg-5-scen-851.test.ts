import { classifyRejectReasonAndAggregate } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計', () => {
  test('SCEN-851: 却下修正理由カテゴリ分類と失敗パターン集計 - 献立却下・修正理由が自動カテゴリ分類され、週次の失敗パターン集計に反映される', () => {
    // 入力データ: 複数週のユーザー献立却下・修正理由
    const rejectReasonsWeek1 = [
      { id: '1', reason: '栄養バランスが不足している', timestamp: '2024-01-08T10:00:00Z', weekNumber: 1 },
      { id: '2', reason: 'タンパク質が少ない', timestamp: '2024-01-09T14:30:00Z', weekNumber: 1 },
      { id: '3', reason: '食材手配が困難', timestamp: '2024-01-10T09:15:00Z', weekNumber: 1 },
      { id: '4', reason: '調理工程が複雑すぎる', timestamp: '2024-01-11T16:45:00Z', weekNumber: 1 },
      { id: '5', reason: '調理時間が長すぎる', timestamp: '2024-01-12T11:20:00Z', weekNumber: 1 },
      { id: '6', reason: '子どもが好まない献立', timestamp: '2024-01-13T13:00:00Z', weekNumber: 1 },
      { id: '7', reason: 'カルシウムが不足している', timestamp: '2024-01-14T10:30:00Z', weekNumber: 1 },
      { id: '8', reason: '食材在庫がない', timestamp: '2024-01-15T12:00:00Z', weekNumber: 1 },
    ];

    const rejectReasonsWeek2 = [
      { id: '9', reason: '栄養価が十分でない', timestamp: '2024-01-22T10:00:00Z', weekNumber: 2 },
      { id: '10', reason: '食材購入できない', timestamp: '2024-01-23T14:30:00Z', weekNumber: 2 },
      { id: '11', reason: '工程が多すぎる', timestamp: '2024-01-24T09:15:00Z', weekNumber: 2 },
      { id: '12', reason: '妻が好まない', timestamp: '2024-01-25T16:45:00Z', weekNumber: 2 },
      { id: '13', reason: '調理に時間がかかる', timestamp: '2024-01-26T11:20:00Z', weekNumber: 2 },
      { id: '14', reason: 'ビタミンが不足', timestamp: '2024-01-27T13:00:00Z', weekNumber: 2 },
    ];

    const allRejectReasons = [...rejectReasonsWeek1, ...rejectReasonsWeek2];

    // 実行
    const result = classifyRejectReasonAndAggregate(allRejectReasons);

    // 期待値: カテゴリ別分類と集計結果
    // カテゴリ定義:
    // - 栄養: 「栄養バランス」「タンパク質」「カルシウム」「ビタミン」など栄養関連
    // - 食材: 「食材手配」「食材購入」「食材在庫」など食材調達関連
    // - 調理時間: 「調理工程」「調理時間」など調理プロセス関連
    // - 嗜好: 「好まない」「好み」など家族の嗜好関連

    expect(result).toEqual({
      totalReasons: 14,
      classificationAccuracy: 100.0,
      categoryBreakdown: [
        {
          categoryName: '栄養',
          count: 4,
          percentage: 28.57,
          examples: [
            { id: '1', originalReason: '栄養バランスが不足している', weekNumber: 1 },
            { id: '2', originalReason: 'タンパク質が少ない', weekNumber: 1 },
            { id: '7', originalReason: 'カルシウムが不足している', weekNumber: 1 },
            { id: '14', originalReason: 'ビタミンが不足', weekNumber: 2 },
          ],
        },
        {
          categoryName: '食材',
          count: 3,
          percentage: 21.43,
          examples: [
            { id: '3', originalReason: '食材手配が困難', weekNumber: 1 },
            { id: '8', originalReason: '食材在庫がない', weekNumber: 1 },
            { id: '10', originalReason: '食材購入できない', weekNumber: 2 },
          ],
        },
        {
          categoryName: '調理時間',
          count: 4,
          percentage: 28.57,
          examples: [
            { id: '4', originalReason: '調理工程が複雑すぎる', weekNumber: 1 },
            { id: '5', originalReason: '調理時間が長すぎる', weekNumber: 1 },
            { id: '11', originalReason: '工程が多すぎる', weekNumber: 2 },
            { id: '13', originalReason: '調理に時間がかかる', weekNumber: 2 },
          ],
        },
        {
          categoryName: '嗜好',
          count: 3,
          percentage: 21.43,
          examples: [
            { id: '6', originalReason: '子どもが好まない献立', weekNumber: 1 },
            { id: '9', originalReason: '栄養価が十分でない', weekNumber: 2 },
            { id: '12', originalReason: '妻が好まない', weekNumber: 2 },
          ],
        },
      ],
      weeklyTrends: [
        {
          weekNumber: 1,
          totalCount: 8,
          categoryDistribution: {
            栄養: 2,
            食材: 2,
            調理時間: 2,
            嗜好: 1,
          },
        },
        {
          weekNumber: 2,
          totalCount: 6,
          categoryDistribution: {
            栄養: 2,
            食材: 1,
            調理時間: 2,
            嗜好: 2,
          },
        },
      ],
      classificationDetails: [
        { reasonId: '1', originalText: '栄養バランスが不足している', classifiedCategory: '栄養', confidence: 0.98 },
        { reasonId: '2', originalText: 'タンパク質が少ない', classifiedCategory: '栄養', confidence: 0.99 },
        { reasonId: '3', originalText: '食材手配が困難', classifiedCategory: '食材', confidence: 0.97 },
        { reasonId: '4', originalText: '調理工程が複雑すぎる', classifiedCategory: '調理時間', confidence: 0.96 },
        { reasonId: '5', originalText: '調理時間が長すぎる', classifiedCategory: '調理時間', confidence: 0.99 },
        { reasonId: '6', originalText: '子どもが好まない献立', classifiedCategory: '嗜好', confidence: 0.95 },
        { reasonId: '7', originalText: 'カルシウムが不足している', classifiedCategory: '栄養', confidence: 0.98 },
        { reasonId: '8', originalText: '食材在庫がない', classifiedCategory: '食材', confidence: 0.99 },
        { reasonId: '9', originalText: '栄養価が十分でない', classifiedCategory: '嗜好', confidence: 0.92 },
        { reasonId: '10', originalText: '食材購入できない', classifiedCategory: '食材', confidence: 0.98 },
        { reasonId: '11', originalText: '工程が多すぎる', classifiedCategory: '調理時間', confidence: 0.95 },
        { reasonId: '12', originalText: '妻が好まない', classifiedCategory: '嗜好', confidence: 0.99 },
        { reasonId: '13', originalText: '調理に時間がかかる', classifiedCategory: '調理時間', confidence: 0.97 },
        { reasonId: '14', originalText: 'ビタミンが不足', classifiedCategory: '栄養', confidence: 0.99 },
      ],
    });

    // 追加検証: 分類精度が 95% 以上か確認
    expect(result.classificationAccuracy).toBeGreaterThanOrEqual(95.0);

    // 追加検証: カテゴリ別件数の合計が総件数と一致するか確認
    const sumCategoryCounts = result.categoryBreakdown.reduce(
      (sum, category) => sum + category.count,
      0,
    );
    expect(sumCategoryCounts).toBe(result.totalReasons);

    // 追加検証: 週次トレンドの総件数が入力データと一致するか確認
    const sumWeeklyCounts = result.weeklyTrends.reduce(
      (sum, week) => sum + week.totalCount,
      0,
    );
    expect(sumWeeklyCounts).toBe(result.totalReasons);

    // 追加検証: パーセンテージの合計が 100 に近いか確認（浮動小数点誤差許容）
    const percentageSum = result.categoryBreakdown.reduce(
      (sum, category) => sum + category.percentage,
      0,
    );
    expect(Math.abs(percentageSum - 100.0)).toBeLessThan(0.1);

    // 追加検証: 週別カテゴリ分布の合計が週別総件数と一致するか確認
    result.weeklyTrends.forEach((weekTrend) => {
      const categorySum = Object.values<any>(weekTrend.categoryDistribution).reduce(
        (sum, count) => sum + count,
        0,
      );
      expect(categorySum).toBe(weekTrend.totalCount);
    });

    // 追加検証: 信頼度スコアが 0.9 以上か確認（95% 以上の分類精度を示す）
    result.classificationDetails.forEach((detail) => {
      expect(detail.confidence).toBeGreaterThanOrEqual(0.9);
    });
  });
});