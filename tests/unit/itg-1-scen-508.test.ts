import { analyzeMonthlyNutritionAndDecideMenuPriority } from '../../src/logic/it-3';

describe('月次分析ダッシュボード・献立優先条件決定機能 - 栄養素別実績データ存在チェック', () => {
  test('SCEN-508: 栄養素別実績データが存在しない場合、適切なエラーハンドリングが動作する', () => {
    // Precondition: ユーザーが月次分析ダッシュボードにアクセス
    // Input: 栄養素別実績データが空の状態
    const userId = 'user_001';
    const monthKey = '2024-01';
    const nutritionActualData: Record<string, number> = {}; // 栄養素別実績データが存在しない
    const nutritionTargetData = {
      protein: 60,
      carbohydrate: 300,
      fat: 65,
      fiber: 20,
      calcium: 600,
      iron: 8,
    };
    const mealHistory: Array<{
      mealId: string;
      mealName: string;
      satisfactionScore: number;
      completionRate: number;
      evaluationCount: number;
    }> = [
      {
        mealId: 'meal_101',
        mealName: 'チキンカレー',
        satisfactionScore: 4.2,
        completionRate: 0.95,
        evaluationCount: 5,
      },
    ];

    // Trigger: 献立優先条件決定機能を実行
    // Expected: エラーハンドリング処理が発動し、適切なエラーメッセージが返される
    expect(() =>
      analyzeMonthlyNutritionAndDecideMenuPriority({
        userId,
        monthKey,
        nutritionActualData,
        nutritionTargetData,
        mealHistory,
      })
    ).toThrow(/栄養素別実績データ/);

    // Outcome: エラーメッセージがユーザーに通知され、アプリケーションは異常終了しない
    // ログにエラー内容が記録されていることを別途検証可能な状態が維持される
  });
});