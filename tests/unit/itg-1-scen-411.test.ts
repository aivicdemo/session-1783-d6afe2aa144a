import { validateMealEvaluation } from '../../src/logic/it-1-br-1783670064270-1-1-1';

describe('食事評価入力バリデーション機能', () => {
  test('SCEN-411: 満足度が未入力で送信された場合、当該項目を指摘するエラーが表示される', () => {
    const mealEvaluationInput = {
      mealDateTime: new Date('2024-01-15T19:00:00Z'),
      menuName: 'グラタン',
      satisfactionScore: null,
      completionRate: 85,
      userRequest: '塩辛さを減らしてほしい',
    };

    expect(() => validateMealEvaluation(mealEvaluationInput)).toThrow(/満足度/);
  });
});