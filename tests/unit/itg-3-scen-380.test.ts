import { generateWeeklyMealReport } from '../../src/logic/it-1-br-3-2-1';

describe('購入実績の記録と月次食費削減効果の自動集計・分析機能', () => {
  // SCEN-380: [edge] 週次献立生成レポート集計機能 - 前週比が 0%（前週データなし）の場合に境界値として正しく計算される
  test('前週データが存在しない場合、前週比は0%として正しく計算・集計される', () => {
    // テスト用データを準備（当週のみ）
    const currentWeekStartDate = new Date('2024-01-15T00:00:00Z');
    const currentWeekEndDate = new Date('2024-01-21T23:59:59Z');
    
    const mealGenerationData = {
      userId: 'user_001',
      weekStartDate: currentWeekStartDate,
      weekEndDate: currentWeekEndDate,
      mealsGenerated: 7,
      mealsAccepted: 6,
      mealRejections: 1,
      averageCookingTimeMinutes: 35.5,
      satisfactionScore: 82,
      previousWeekData: null, // 前週データなし
    };

    // 当週の献立生成レポート集計機能を実行
    const report = generateWeeklyMealReport(mealGenerationData);

    // 前週比の計算値を取得・検証
    // 前週データなし → 前週比は0%（基準値として0を使用）
    expect(report.weeklySuccessRate).toBe(85.71); // (6/7)*100 = 85.71%
    expect(report.previousWeekComparisonRate).toBe(0); // 前週データなし → 0%
    
    // レポート表示形式が正しくフォーマットされていることを確認
    expect(report.reportFormat).toEqual({
      weekStartDate: '2024-01-15',
      weekEndDate: '2024-01-21',
      successRate: '85.71%',
      previousWeekComparison: '0%', // 前週比0%が正常にフォーマット
      averageCookingTime: '35.5 min',
      satisfactionScore: '82 / 100',
      rejectionCount: 1,
      acceptanceCount: 6,
    });

    // 前週比0%の場合のレポート状態を確認
    expect(report.isPreviousWeekDataAvailable).toBe(false);
    expect(report.isNormalComparison).toBe(false); // 前週比較不可状態

    // エラーログが出力されていないことを確認
    expect(report.hasErrors).toBe(false);
    expect(report.errorMessages).toEqual([]);
    expect(report.warningMessages).toEqual([]);

    // システムが正常に処理完了したことを検証
    expect(report.processStatus).toBe('completed');
    expect(report.generatedAt).toBeDefined();
  });
});