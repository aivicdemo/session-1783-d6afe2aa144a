import { generateMenuCandidates } from '../../src/logic/it-1-1-1';

describe('複数制約条件付き献立生成機能', () => {
  // SCEN-354
  test('複数の制約条件を優先度付けして、ユーザー満足度スコア順にランキングされた献立候補を返却する', () => {
    const constraints = {
      calorieLimit: 2000,
      cookingTimeLimit: 30,
      allergyExclusions: ['えび', 'かに', '卵', 'そば', 'ピーナッツ'],
      budgetLimit: 3000,
    };

    const priorityOrder = {
      calorie: 1,
      budget: 2,
      cookingTime: 3,
      allergy: 4,
    };

    const menuCandidates = [
      {
        id: 'menu_001',
        name: '鶏のから揚げ定食',
        calories: 1850,
        cookingTime: 25,
        budget: 2800,
        allergyRisks: [],
        satisfactionScore: 92,
      },
      {
        id: 'menu_002',
        name: 'サーモン塩焼き定食',
        calories: 1950,
        cookingTime: 20,
        budget: 2900,
        allergyRisks: [],
        satisfactionScore: 88,
      },
      {
        id: 'menu_003',
        name: '豚肉生姜焼き定食',
        calories: 1900,
        cookingTime: 28,
        budget: 2750,
        allergyRisks: [],
        satisfactionScore: 92,
      },
      {
        id: 'menu_004',
        name: 'ビーフステーキ定食',
        calories: 2100,
        cookingTime: 32,
        budget: 3500,
        allergyRisks: [],
        satisfactionScore: 85,
      },
      {
        id: 'menu_005',
        name: '野菜カレー',
        calories: 1800,
        cookingTime: 22,
        budget: 2600,
        allergyRisks: [],
        satisfactionScore: 80,
      },
    ];

    const result = generateMenuCandidates({
      constraints,
      priorityOrder,
      candidateMenus: menuCandidates,
    });

    // 結果の基本的な構造を検証
    expect(Array.isArray(result.rankedCandidates)).toBe(true);
    expect(result.rankedCandidates.length).toBeGreaterThan(0);

    // すべての候補が制約条件を満たしているか検証
    result.rankedCandidates.forEach((candidate) => {
      expect(candidate.calories).toBeLessThanOrEqual(constraints.calorieLimit);
      expect(candidate.cookingTime).toBeLessThanOrEqual(
        constraints.cookingTimeLimit
      );
      expect(candidate.budget).toBeLessThanOrEqual(constraints.budgetLimit);

      const hasExcludedAllergy = candidate.allergyRisks.some((allergy) =>
        constraints.allergyExclusions.includes(allergy)
      );
      expect(hasExcludedAllergy).toBe(false);
    });

    // スコアが高い順にソートされているか検証
    for (let i = 0; i < result.rankedCandidates.length - 1; i++) {
      expect(result.rankedCandidates[i].satisfactionScore).toBeGreaterThanOrEqual(
        result.rankedCandidates[i + 1].satisfactionScore
      );
    }

    // 上位3件が正しくランキングされているか検証
    const top3 = result.rankedCandidates.slice(0, 3);
    expect(top3.length).toBe(3);

    // 最高スコアが92であることを確認
    expect(top3[0].satisfactionScore).toBe(92);

    // 同スコア（92）の献立がある場合、優先度順に二次ソートされているか検証
    const satisfactionScore92Items = top3.filter((m) => m.satisfactionScore === 92);
    if (satisfactionScore92Items.length > 1) {
      // 同スコアの献立の優先度順が正しいことを確認
      for (let i = 0; i < satisfactionScore92Items.length - 1; i++) {
        const currentBudgetDiff = Math.abs(
          satisfactionScore92Items[i].budget - constraints.budgetLimit
        );
        const nextBudgetDiff = Math.abs(
          satisfactionScore92Items[i + 1].budget - constraints.budgetLimit
        );
        expect(currentBudgetDiff).toBeLessThanOrEqual(nextBudgetDiff);
      }
    }

    // 制約条件を満たさない献立は除外されているか検証
    const excludedMenuIds = result.excludedCandidates.map((m) => m.id);
    expect(excludedMenuIds).toContain('menu_004'); // カロリーと予算と調理時間超過

    // ランキング結果に含まれる献立IDが期待通りか検証
    const rankedIds = result.rankedCandidates.map((m) => m.id);
    expect(rankedIds).toEqual(['menu_001', 'menu_003', 'menu_002', 'menu_005']);

    // 各候補の満足度スコアが計算・保持されているか検証
    result.rankedCandidates.forEach((candidate) => {
      expect(typeof candidate.satisfactionScore).toBe('number');
      expect(candidate.satisfactionScore).toBeGreaterThanOrEqual(0);
      expect(candidate.satisfactionScore).toBeLessThanOrEqual(100);
    });

    // 制約条件との充足度スコアが計算されているか検証
    expect(result.constraintFulfillmentScores).toBeDefined();
    expect(result.constraintFulfillmentScores.calorie).toBeGreaterThanOrEqual(0);
    expect(result.constraintFulfillmentScores.calorie).toBeLessThanOrEqual(100);
    expect(result.constraintFulfillmentScores.budget).toBeGreaterThanOrEqual(0);
    expect(result.constraintFulfillmentScores.budget).toBeLessThanOrEqual(100);
    expect(result.constraintFulfillmentScores.cookingTime).toBeGreaterThanOrEqual(0);
    expect(result.constraintFulfillmentScores.cookingTime).toBeLessThanOrEqual(100);
    expect(result.constraintFulfillmentScores.allergy).toBeGreaterThanOrEqual(0);
    expect(result.constraintFulfillmentScores.allergy).toBeLessThanOrEqual(100);

    // 総合評価スコアが計算されているか検証
    expect(typeof result.totalEvaluationScore).toBe('number');
    expect(result.totalEvaluationScore).toBeGreaterThanOrEqual(0);
    expect(result.totalEvaluationScore).toBeLessThanOrEqual(100);
  });
});