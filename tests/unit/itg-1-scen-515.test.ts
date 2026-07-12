import { analyzeMonthlyMealCycle } from '../../src/logic/it-2';

describe('家族成員の食事評価データの蓄積・管理機能', () => {
  // SCEN-515
  test('月次分析サイクル自動実行機能 - 分析対象期間にデータが存在しない場合、エラーハンドリングが適切に実行される', () => {
    const analysisPeriodStart = new Date('2020-01-01T00:00:00Z');
    const analysisPeriodEnd = new Date('2020-01-31T23:59:59Z');
    const mealRecords: Array<{
      userId: string;
      mealDate: Date;
      evaluationScore: number;
    }> = [];
    const nutritionRecords: Array<{
      userId: string;
      recordDate: Date;
      nutrientId: string;
      actualValue: number;
    }> = [];
    const purchaseRecords: Array<{
      userId: string;
      purchaseDate: Date;
      amount: number;
    }> = [];

    const result = analyzeMonthlyMealCycle({
      analysisPeriodStart,
      analysisPeriodEnd,
      mealRecords,
      nutritionRecords,
      purchaseRecords,
    });

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('DATA_NOT_FOUND');
    expect(result.errorMessage).toMatch(/指定期間内に分析対象データが見つかりません/);
    expect(result.applicationStateStable).toBe(true);
    expect(result.errorLogRecorded).toBe(true);
  });
});