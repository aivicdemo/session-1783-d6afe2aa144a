import { verifyAlgorithmImprovementEffect } from '../../src/logic/it-7-2-1';

describe('献立生成アルゴリズムの改善効果検証ダッシュボード', () => {
  test('SCEN-733: 献立提案と食事記録の日付不一致で効果検証エラーが発生する', () => {
    // Arrange
    const menu_proposal_date = '2024-01-15';
    const meal_record_date = '2024-01-16';
    const menu_proposal_id = 'MENU_001';
    const meal_record_id = 'MEAL_001';
    const satisfaction_score = 85;
    const cooking_time_minutes = 45;
    const completion_rate = 95;

    const input = {
      menu_proposal_id,
      menu_proposal_date,
      meal_record_id,
      meal_record_date,
      satisfaction_score,
      cooking_time_minutes,
      completion_rate,
    };

    // Act & Assert
    expect(() => verifyAlgorithmImprovementEffect(input)).toThrow(
      /献立提案と食事記録の日付が一致しません/
    );
  });
});