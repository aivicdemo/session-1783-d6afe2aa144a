import { aggregateWeeklyMealGenerationReport } from '../../src/logic/it-1-br-3-2-1';

describe('購入実績の記録と月次食費削減効果の自動集計・分析機能', () => {
  // SCEN-379
  test('集計対象週のデータが存在しない場合にエラーハンドリングが機能する', () => {
    const nonexistentWeek = '2024-W99';
    const userId = 'user_001';

    const result = aggregateWeeklyMealGenerationReport({
      userId,
      weekIdentifier: nonexistentWeek,
    });

    expect(result).toHaveProperty('error');
    expect(result).toHaveProperty('errorCode');
    expect(result).toHaveProperty('errorMessage');
    expect(result).toHaveProperty('errorLog');

    expect(result.error).toBe(true);
    expect(result.errorCode).toMatch(/^[4]\d{2}$/);
    expect(result.errorMessage).toMatch(/データが見つかりません|週のデータが見つかりません/);
    expect(result.errorLog).toBeDefined();
    expect(typeof result.errorLog).toBe('string');

    expect(result).not.toHaveProperty('weeklyData');
    expect(result).not.toHaveProperty('mealGenerationSuccessRate');
    expect(result).not.toHaveProperty('cookingTimeReductionRate');
    expect(result).not.toHaveProperty('satisfactionScore');
  });
});