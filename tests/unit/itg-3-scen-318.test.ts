import { generateMealPlan } from '../../src/logic/it-1-br-3-2-1';

describe('購入実績の記録と月次食費削減効果の自動集計・分析機能', () => {
  // SCEN-318: [error] 献立生成トリガー処理 - ユーザーがログアウト状態で献立生成ボタンが押された時にエラーが発生する
  test('ログアウト状態で献立生成ボタンが押された場合、認証エラーが発生する', () => {
    const user_id = null;
    const family_member_id = 'FM001';
    const constraints = {
      allergy_ids: ['AL001'],
      dietary_restriction_ids: ['DR001'],
      budget_limit: 5000,
      cooking_time_limit: 30,
    };

    expect(() =>
      generateMealPlan({
        user_id,
        family_member_id,
        constraints,
      })
    ).toThrow(/認証/);
  });

  test('ユーザーセッションが無効な状態で献立生成を要求すると、セッション無効エラーが発生する', () => {
    const user_id = 'USR001';
    const family_member_id = 'FM001';
    const constraints = {
      allergy_ids: ['AL001'],
      dietary_restriction_ids: ['DR001'],
      budget_limit: 5000,
      cooking_time_limit: 30,
    };
    const session_token = undefined;

    expect(() =>
      generateMealPlan({
        user_id,
        family_member_id,
        constraints,
        session_token,
      })
    ).toThrow(/セッション/);
  });

  test('有効なセッションでログアウト状態の献立生成要求を処理すると、ログインページリダイレクト指示を返す', () => {
    const user_id = 'USR002';
    const family_member_id = 'FM002';
    const constraints = {
      allergy_ids: [],
      dietary_restriction_ids: [],
      budget_limit: 6000,
      cooking_time_limit: 45,
    };
    const session_token = 'EXPIRED_TOKEN_12345';

    expect(() =>
      generateMealPlan({
        user_id,
        family_member_id,
        constraints,
        session_token,
      })
    ).toThrow(/ログイン/);
  });

  test('有効なユーザーIDとセッショントークンで献立生成を実行すると、献立案が生成される', () => {
    const user_id = 'USR003';
    const family_member_id = 'FM003';
    const constraints = {
      allergy_ids: ['AL002'],
      dietary_restriction_ids: ['DR002'],
      budget_limit: 7000,
      cooking_time_limit: 60,
    };
    const session_token = 'VALID_TOKEN_67890';

    const result = generateMealPlan({
      user_id,
      family_member_id,
      constraints,
      session_token,
    });

    expect(result).toHaveProperty('meal_plan_id');
    expect(result).toHaveProperty('user_id', 'USR003');
    expect(result).toHaveProperty('status', 'generated');
    expect(typeof result.meal_plan_id).toBe('string');
    expect(result.meal_plan_id.length).toBeGreaterThan(0);
  });

  test('複数の献立案候補が生成される場合、ユーザー満足度スコア順にランキングされて返される', () => {
    const user_id = 'USR004';
    const family_member_id = 'FM004';
    const constraints = {
      allergy_ids: [],
      dietary_restriction_ids: [],
      budget_limit: 5500,
      cooking_time_limit: 40,
    };
    const session_token = 'VALID_TOKEN_11111';

    const result = generateMealPlan({
      user_id,
      family_member_id,
      constraints,
      session_token,
    });

    expect(result).toHaveProperty('candidates');
    expect(Array.isArray(result.candidates)).toBe(true);
    expect(result.candidates.length).toBeGreaterThanOrEqual(1);

    if (result.candidates.length > 1) {
      for (let i = 0; i < result.candidates.length - 1; i++) {
        expect(result.candidates[i].satisfaction_score).toBeGreaterThanOrEqual(
          result.candidates[i + 1].satisfaction_score
        );
      }
    }
  });

  test('制約条件を満たさない献立案は候補リストから除外される', () => {
    const user_id = 'USR005';
    const family_member_id = 'FM005';
    const constraints = {
      allergy_ids: ['AL003'],
      dietary_restriction_ids: ['DR003'],
      budget_limit: 4000,
      cooking_time_limit: 20,
    };
    const session_token = 'VALID_TOKEN_22222';

    const result = generateMealPlan({
      user_id,
      family_member_id,
      constraints,
      session_token,
    });

    expect(result.candidates).toBeDefined();
    result.candidates.forEach((candidate) => {
      expect(candidate.allergy_safe).toBe(true);
      expect(candidate.total_budget).toBeLessThanOrEqual(constraints.budget_limit);
      expect(candidate.cooking_time).toBeLessThanOrEqual(
        constraints.cooking_time_limit
      );
    });
  });
});