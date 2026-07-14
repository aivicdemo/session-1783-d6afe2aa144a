import { calculateNutritionAchievementRate } from '../../src/logic/it-7-2-1';

describe('栄養達成度可視化機能 - 実績データ不足エラーハンドリング', () => {
  // SCEN-563
  test('実績データが不足している場合、計算不可エラーが返される', async () => {
    const fetchMock = require('jest-fetch-mock');
    fetchMock.enableMocks();
    fetchMock.resetMocks();

    // 実績データが0件の状態をシミュレート
    const emptyPerformanceData = [];
    const targetNutritionItems = [
      { nutrientId: 'protein', targetValue: 50, unit: 'g' },
      { nutrientId: 'calcium', targetValue: 600, unit: 'mg' },
      { nutrientId: 'iron', targetValue: 8, unit: 'mg' },
    ];

    // API呼び出しで実績データが0件であることを返す
    fetchMock.mockResponseOnce(
      JSON.stringify({
        performanceRecords: emptyPerformanceData,
        targetItems: targetNutritionItems,
      }),
      { status: 200 }
    );

    // 計算APIを呼び出し
    let errorResponse;
    try {
      await calculateNutritionAchievementRate({
        userId: 'user-001',
        startDate: '2024-01-01',
        endDate: '2024-01-07',
        nutritionItems: targetNutritionItems,
      });
    } catch (error) {
      errorResponse = error;
    }

    // ステータスコード422（計算不可エラー）が返されることを確認
    expect(errorResponse.statusCode).toBe(422);

    // エラーメッセージに『データ不足』を含むことを確認
    expect(errorResponse.message).toMatch(/データ不足/);

    // エラーオブジェクトに適切なエラーコードが含まれていることを確認
    expect(errorResponse.errorCode).toBe('INSUFFICIENT_PERFORMANCE_DATA');

    // エラー詳細情報（availableRecordsCount）が含まれていることを確認
    expect(errorResponse.details).toBeDefined();
    expect(errorResponse.details.availableRecordsCount).toBe(0);
    expect(errorResponse.details.requiredRecordCount).toBeGreaterThan(0);

    fetchMock.disableMocks();
  });
});