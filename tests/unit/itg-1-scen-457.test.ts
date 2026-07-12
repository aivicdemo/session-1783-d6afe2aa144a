import { initializeMenuGenerationWithFeedback, addFoodRatingAndCheckPreferenceEngagement } from '../../src/logic/it-3';

describe('食事評価データを献立生成ロジックに反映させる機能', () => {
  // SCEN-457: [edge] 初期献立生成ロジック - 評価データが30件に到達すると嗜好学習が有効化される
  test('評価データが30件に到達したとき、嗜好学習機能が自動的に有効化される', () => {
    // ステップ1: テストアプリケーションを初期化し、嗜好学習機能が無効状態であることを確認
    const initialState = initializeMenuGenerationWithFeedback({
      userId: 'user_001',
      familyMemberId: 'fm_001',
      preferenceEngagementEnabled: false,
      foodRatingDataCount: 0,
    });
    expect(initialState.preferenceEngagementEnabled).toBe(false);
    expect(initialState.foodRatingDataCount).toBe(0);

    // ステップ2～3: 評価データを1件ずつ追加し、29件まで確認
    let currentState = { ...initialState };
    for (let i = 1; i <= 29; i++) {
      const ratingInput = {
        userId: 'user_001',
        familyMemberId: 'fm_001',
        menuId: `menu_${i}`,
        satisfactionScore: 4 + (i % 2),
        completionRate: 80 + (i % 20),
        requestComment: `好きな料理パターン${i}`,
        ratedAt: new Date(`2024-01-${String((i % 28) + 1).padStart(2, '0')}T12:00:00Z`).toISOString(),
      };

      const result = addFoodRatingAndCheckPreferenceEngagement({
        currentState: currentState,
        newRating: ratingInput,
      });

      expect(result.foodRatingDataCount).toBe(i);
      expect(result.preferenceEngagementEnabled).toBe(false);
      currentState = result;
    }

    // ステップ4: 評価データが29件の時点で嗜好学習が無効であることを確認
    expect(currentState.foodRatingDataCount).toBe(29);
    expect(currentState.preferenceEngagementEnabled).toBe(false);

    // ステップ5～6: 30件目の評価データを追加
    const finalRatingInput = {
      userId: 'user_001',
      familyMemberId: 'fm_001',
      menuId: 'menu_30',
      satisfactionScore: 5,
      completionRate: 95,
      requestComment: '家族全員が満足した献立',
      ratedAt: new Date('2024-01-30T12:00:00Z').toISOString(),
    };

    const finalResult = addFoodRatingAndCheckPreferenceEngagement({
      currentState: currentState,
      newRating: finalRatingInput,
    });

    // ステップ7: 評価データが30件に到達したことを確認
    expect(finalResult.foodRatingDataCount).toBe(30);

    // ステップ8: 嗜好学習機能の有効化フラグを検証
    expect(finalResult.preferenceEngagementEnabled).toBe(true);

    // ステップ9: 生成された献立が嗜好学習に基づいているか、またはアルゴリズムが変更されたことを確認
    expect(finalResult.generatedMenuAlgorithmType).toBe('preference_based');
    expect(finalResult.highRatedDishesIncluded).toBe(true);
    expect(finalResult.userPreferenceDataAvailable).toBe(true);
  });
});