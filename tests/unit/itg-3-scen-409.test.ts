import { analyzeMonthlyFinancialCycle } from '../../src/logic/it-1-br-3-2-1';

describe('Purchase Record and Monthly Cost Reduction Analysis', () => {
  // SCEN-409
  test('should return error when monthly analysis is requested with uncollected data at month-end cutoff date', async () => {
    const monthlyClosingDay = 25;
    const currentDate = new Date('2024-01-25T10:00:00Z');
    const dataAggregationStatus = 'uncollected';
    const userId = 'user_001';
    const monthYear = '2024-01';

    const request = {
      userId,
      monthYear,
      monthlyClosingDay,
      currentDate,
      dataAggregationStatus,
      analysisRequestTimestamp: new Date('2024-01-25T10:30:00Z'),
    };

    let thrownError: any = null;
    let errorResponse: any = null;

    try {
      const result = await analyzeMonthlyFinancialCycle(request);
      errorResponse = result;
    } catch (error) {
      thrownError = error;
    }

    if (thrownError) {
      expect(thrownError.message).toMatch(/データ集計/);
      expect(thrownError.statusCode).toBe(400);
    } else if (errorResponse && errorResponse.statusCode && errorResponse.statusCode >= 400) {
      expect(errorResponse.statusCode).toBeGreaterThanOrEqual(400);
      expect(errorResponse.statusCode).toBeLessThan(500);
      expect(errorResponse.message).toMatch(/データ集計が完了していません/);
      expect(errorResponse.message).toMatch(/月次分析は集計完了後に実行してください/);
      expect(errorResponse.errorCode).toBeDefined();
      expect(typeof errorResponse.errorCode).toBe('string');
      expect(errorResponse.traceId).toBeDefined();
      expect(typeof errorResponse.traceId).toBe('string');
      expect(errorResponse.timestamp).toBeDefined();
    } else {
      fail('Expected error response or thrown error, but got success response');
    }
  });
});