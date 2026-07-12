import { generateWeeklyReport } from '../../src/logic/it-3';

describe('食事評価データを献立生成ロジックに反映させる機能', () => {
  // SCEN-392: [normal] 週次レポート生成機能 - 献立生成成功率・調理時間短縮度・満足度スコアが週単位で正確に集計される
  test('SCEN-392: 週次レポートが生成され、献立生成成功率・調理時間短縮度・満足度スコアが過去7日間のデータから正確に集計・表示される', () => {
    // 対象期間: 2024-01-08 ～ 2024-01-14 (7日間)
    const reportWeekStartDate = new Date('2024-01-08T00:00:00Z');
    const reportWeekEndDate = new Date('2024-01-14T23:59:59Z');

    // テスト用の献立生成実績データ（過去7日間分）
    const mealPlanningAttempts = [
      { date: '2024-01-08', success: true, plannedTime: 45, actualTime: 40 },
      { date: '2024-01-08', success: true, plannedTime: 45, actualTime: 38 },
      { date: '2024-01-09', success: true, plannedTime: 60, actualTime: 50 },
      { date: '2024-01-09', success: false, plannedTime: 45, actualTime: 0 },
      { date: '2024-01-10', success: true, plannedTime: 50, actualTime: 45 },
      { date: '2024-01-11', success: true, plannedTime: 55, actualTime: 48 },
      { date: '2024-01-12', success: false, plannedTime: 60, actualTime: 0 },
      { date: '2024-01-13', success: true, plannedTime: 40, actualTime: 35 },
      { date: '2024-01-14', success: true, plannedTime: 50, actualTime: 45 },
    ];

    // テスト用の家族成員食事評価データ（過去7日間分）
    const satisfactionRatings = [
      { date: '2024-01-08', familyMemberId: 'member_001', score: 5 },
      { date: '2024-01-08', familyMemberId: 'member_002', score: 4 },
      { date: '2024-01-09', familyMemberId: 'member_001', score: 5 },
      { date: '2024-01-09', familyMemberId: 'member_002', score: 3 },
      { date: '2024-01-10', familyMemberId: 'member_001', score: 4 },
      { date: '2024-01-10', familyMemberId: 'member_002', score: 5 },
      { date: '2024-01-11', familyMemberId: 'member_001', score: 5 },
      { date: '2024-01-11', familyMemberId: 'member_002', score: 4 },
      { date: '2024-01-12', familyMemberId: 'member_001', score: 3 },
      { date: '2024-01-12', familyMemberId: 'member_002', score: 4 },
      { date: '2024-01-13', familyMemberId: 'member_001', score: 5 },
      { date: '2024-01-13', familyMemberId: 'member_002', score: 5 },
      { date: '2024-01-14', familyMemberId: 'member_001', score: 4 },
      { date: '2024-01-14', familyMemberId: 'member_002', score: 5 },
    ];

    const result = generateWeeklyReport({
      userId: 'user_001',
      weekStartDate: reportWeekStartDate,
      weekEndDate: reportWeekEndDate,
      mealPlanningAttempts,
      satisfactionRatings,
    });

    // 献立生成成功率の検証
    // 成功数: 7件、総試行数: 9件
    // 計算式: 7 / 9 * 100 = 77.78%
    expect(result.mealPlanningSuccessRate).toBe(77.78);

    // 調理時間短縮度の検証
    // 成功した献立のみ対象
    // 2024-01-08: (45-40)/45*100 + (45-38)/45*100 = 11.11 + 15.56 = 26.67
    // 2024-01-09: (60-50)/60*100 = 16.67
    // 2024-01-10: (50-45)/50*100 = 10
    // 2024-01-11: (55-48)/55*100 = 12.73
    // 2024-01-13: (40-35)/40*100 = 12.50
    // 2024-01-14: (50-45)/50*100 = 10
    // 合計: 26.67 + 16.67 + 10 + 12.73 + 12.50 + 10 = 88.57 / 7成功件数 = 12.65%
    expect(result.cookingTimeReductionRate).toBe(12.65);

    // 満足度スコアの検証
    // 合計スコア: 5+4+5+3+4+5+5+4+3+4+5+5+4+5 = 61
    // 評価数: 14件
    // 計算式: 61 / 14 = 4.36
    expect(result.averageSatisfactionScore).toBe(4.36);

    // レポート生成日時が正確に記録されていることを検証
    expect(result.reportGeneratedAt).toEqual(new Date('2024-01-15T09:00:00Z'));

    // レポートが返された構造全体を検証
    expect(result).toEqual({
      userId: 'user_001',
      weekStartDate: reportWeekStartDate,
      weekEndDate: reportWeekEndDate,
      mealPlanningSuccessRate: 77.78,
      cookingTimeReductionRate: 12.65,
      averageSatisfactionScore: 4.36,
      reportGeneratedAt: new Date('2024-01-15T09:00:00Z'),
      totalMealPlanningAttempts: 9,
      successfulMealPlanningCount: 7,
      totalSatisfactionRatings: 14,
    });

    // 複数週のレポートが独立して正確に集計されることを検証
    const secondWeekStartDate = new Date('2024-01-15T00:00:00Z');
    const secondWeekEndDate = new Date('2024-01-21T23:59:59Z');

    const secondWeekAttempts = [
      { date: '2024-01-15', success: true, plannedTime: 50, actualTime: 42 },
      { date: '2024-01-16', success: true, plannedTime: 45, actualTime: 40 },
      { date: '2024-01-17', success: true, plannedTime: 55, actualTime: 52 },
    ];

    const secondWeekRatings = [
      { date: '2024-01-15', familyMemberId: 'member_001', score: 5 },
      { date: '2024-01-16', familyMemberId: 'member_001', score: 4 },
      { date: '2024-01-17', familyMemberId: 'member_001', score: 5 },
    ];

    const secondWeekResult = generateWeeklyReport({
      userId: 'user_001',
      weekStartDate: secondWeekStartDate,
      weekEndDate: secondWeekEndDate,
      mealPlanningAttempts: secondWeekAttempts,
      satisfactionRatings: secondWeekRatings,
    });

    // 第2週のデータが正確に計算されていることを検証
    // 成功率: 3/3 * 100 = 100%
    expect(secondWeekResult.mealPlanningSuccessRate).toBe(100);

    // 調理時間短縮度
    // 2024-01-15: (50-42)/50*100 = 16
    // 2024-01-16: (45-40)/45*100 = 11.11
    // 2024-01-17: (55-52)/55*100 = 5.45
    // 平均: (16 + 11.11 + 5.45) / 3 = 32.56 / 3 = 10.85
    expect(secondWeekResult.cookingTimeReductionRate).toBe(10.85);

    // 満足度スコア: (5+4+5) / 3 = 14/3 = 4.67
    expect(secondWeekResult.averageSatisfactionScore).toBe(4.67);

    // 第1週と第2週のデータが独立していることを確認
    expect(result.mealPlanningSuccessRate).not.toEqual(secondWeekResult.mealPlanningSuccessRate);
    expect(result.totalMealPlanningAttempts).not.toEqual(secondWeekResult.totalMealPlanningAttempts);
  });
});