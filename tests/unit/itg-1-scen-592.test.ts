import { evaluateNutritionImprovementProposal } from '../../src/logic/it-3';

describe('食事評価データを献立生成ロジックに反映させる機能', () => {
  // SCEN-592
  test('栄養基準ロジック評価検証機能 - 栄養士が提示した改善案が検証基準に基づいて評価され、承認可否判定が正確に返される', () => {
    const nutritionStandards = {
      protein: { min: 50, max: 70, unit: 'g' },
      fat: { min: 40, max: 65, unit: 'g' },
      carbohydrates: { min: 200, max: 300, unit: 'g' },
      vitaminA: { min: 700, max: 900, unit: 'mcg' },
      vitaminC: { min: 80, max: 100, unit: 'mg' },
      calcium: { min: 800, max: 1000, unit: 'mg' },
      iron: { min: 8, max: 12, unit: 'mg' },
    };

    const currentMeal = {
      protein: 45,
      fat: 35,
      carbohydrates: 180,
      vitaminA: 600,
      vitaminC: 60,
      calcium: 700,
      iron: 7,
    };

    const proposedImprovement = {
      protein: 65,
      fat: 55,
      carbohydrates: 280,
      vitaminA: 820,
      vitaminC: 95,
      calcium: 950,
      iron: 11,
    };

    const result = evaluateNutritionImprovementProposal({
      standards: nutritionStandards,
      currentValues: currentMeal,
      proposedValues: proposedImprovement,
    });

    expect(result.overallApprovalStatus).toBe('APPROVED');

    expect(result.itemEvaluations).toEqual(
      expect.objectContaining({
        protein: {
          meetsStandard: true,
          withinRange: true,
          score: 92.85,
        },
        fat: {
          meetsStandard: true,
          withinRange: true,
          score: 90.0,
        },
        carbohydrates: {
          meetsStandard: true,
          withinRange: true,
          score: 93.33,
        },
        vitaminA: {
          meetsStandard: true,
          withinRange: true,
          score: 91.11,
        },
        vitaminC: {
          meetsStandard: true,
          withinRange: true,
          score: 95.0,
        },
        calcium: {
          meetsStandard: true,
          withinRange: true,
          score: 95.0,
        },
        iron: {
          meetsStandard: true,
          withinRange: true,
          score: 91.66,
        },
      })
    );

    expect(result.overallScore).toBe(92.70);

    expect(result.itemEvaluations.protein.withinRange).toBe(true);
    expect(result.itemEvaluations.fat.withinRange).toBe(true);
    expect(result.itemEvaluations.carbohydrates.withinRange).toBe(true);
    expect(result.itemEvaluations.vitaminA.withinRange).toBe(true);
    expect(result.itemEvaluations.vitaminC.withinRange).toBe(true);
    expect(result.itemEvaluations.calcium.withinRange).toBe(true);
    expect(result.itemEvaluations.iron.withinRange).toBe(true);

    expect(result.improvementMetrics).toEqual(
      expect.objectContaining({
        proteinImprovement: 20,
        fatImprovement: 20,
        carbohydratesImprovement: 100,
        vitaminAImprovement: 220,
        vitaminCImprovement: 35,
        calciumImprovement: 250,
        ironImprovement: 4,
      })
    );

    expect(result.approvalDecision).toBe('APPROVE');
    expect(result.rejectionReasons).toEqual([]);
    expect(result.modificationRequired).toBe(false);

    const itemsPassingStandard = Object.values(result.itemEvaluations).filter(
      (item) => item.meetsStandard === true
    ).length;
    expect(itemsPassingStandard).toBe(7);

    expect(result.isConsistent).toBe(true);
    expect(result.evaluationTimestamp).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
    );
  });

  test('栄養基準ロジック評価検証機能 - 栄養士が提示した改善案が基準を満たさない場合は「却下」と判定される', () => {
    const nutritionStandards = {
      protein: { min: 50, max: 70, unit: 'g' },
      fat: { min: 40, max: 65, unit: 'g' },
      carbohydrates: { min: 200, max: 300, unit: 'g' },
      vitaminA: { min: 700, max: 900, unit: 'mcg' },
      vitaminC: { min: 80, max: 100, unit: 'mg' },
      calcium: { min: 800, max: 1000, unit: 'mg' },
      iron: { min: 8, max: 12, unit: 'mg' },
    };

    const currentMeal = {
      protein: 45,
      fat: 35,
      carbohydrates: 180,
      vitaminA: 600,
      vitaminC: 60,
      calcium: 700,
      iron: 7,
    };

    const proposedImprovement = {
      protein: 35,
      fat: 25,
      carbohydrates: 150,
      vitaminA: 500,
      vitaminC: 50,
      calcium: 600,
      iron: 5,
    };

    const result = evaluateNutritionImprovementProposal({
      standards: nutritionStandards,
      currentValues: currentMeal,
      proposedValues: proposedImprovement,
    });

    expect(result.overallApprovalStatus).toBe('REJECTED');
    expect(result.approvalDecision).toBe('REJECT');

    expect(result.itemEvaluations.protein.meetsStandard).toBe(false);
    expect(result.itemEvaluations.fat.meetsStandard).toBe(false);
    expect(result.itemEvaluations.carbohydrates.meetsStandard).toBe(false);
    expect(result.itemEvaluations.vitaminA.meetsStandard).toBe(false);
    expect(result.itemEvaluations.vitaminC.meetsStandard).toBe(false);
    expect(result.itemEvaluations.calcium.meetsStandard).toBe(false);
    expect(result.itemEvaluations.iron.meetsStandard).toBe(false);

    const failingItems = Object.entries(result.itemEvaluations)
      .filter(([, eval_item]) => eval_item.meetsStandard === false)
      .map(([name]) => name);

    expect(failingItems.length).toBeGreaterThan(0);
    expect(result.rejectionReasons.length).toBeGreaterThan(0);
  });

  test('栄養基準ロジック評価検証機能 - 一部の栄養素が基準外の場合は「修正要求」と判定される', () => {
    const nutritionStandards = {
      protein: { min: 50, max: 70, unit: 'g' },
      fat: { min: 40, max: 65, unit: 'g' },
      carbohydrates: { min: 200, max: 300, unit: 'g' },
      vitaminA: { min: 700, max: 900, unit: 'mcg' },
      vitaminC: { min: 80, max: 100, unit: 'mg' },
      calcium: { min: 800, max: 1000, unit: 'mg' },
      iron: { min: 8, max: 12, unit: 'mg' },
    };

    const currentMeal = {
      protein: 45,
      fat: 35,
      carbohydrates: 180,
      vitaminA: 600,
      vitaminC: 60,
      calcium: 700,
      iron: 7,
    };

    const proposedImprovement = {
      protein: 65,
      fat: 55,
      carbohydrates: 280,
      vitaminA: 820,
      vitaminC: 45,
      calcium: 950,
      iron: 11,
    };

    const result = evaluateNutritionImprovementProposal({
      standards: nutritionStandards,
      currentValues: currentMeal,
      proposedValues: proposedImprovement,
    });

    expect(result.overallApprovalStatus).toBe('MODIFICATION_REQUIRED');
    expect(result.modificationRequired).toBe(true);
    expect(result.approvalDecision).toBe('MODIFY');

    expect(result.itemEvaluations.vitaminC.meetsStandard).toBe(false);
    expect(result.itemEvaluations.vitaminC.withinRange).toBe(false);

    const itemsFailingStandard = Object.values(result.itemEvaluations).filter(
      (item) => item.meetsStandard === false
    ).length;
    expect(itemsFailingStandard).toBe(1);

    expect(result.rejectionReasons.length).toBeGreaterThan(0);
  });

  test('栄養基準ロジック評価検証機能 - 無効な入力値に対してエラーがスローされる', () => {
    const invalidStandards = {
      protein: { min: 70, max: 50, unit: 'g' },
    };

    const meal = { protein: 60 };

    expect(() =>
      evaluateNutritionImprovementProposal({
        standards: invalidStandards,
        currentValues: meal,
        proposedValues: meal,
      })
    ).toThrow(/基準値/);
  });

  test('栄養基準ロジック評価検証機能 - 欠落した栄養素フィールドに対してエラーがスローされる', () => {
    const standards = {
      protein: { min: 50, max: 70, unit: 'g' },
      fat: { min: 40, max: 65, unit: 'g' },
    };

    const incompleteMeal = {
      protein: 60,
    };

    expect(() =>
      evaluateNutritionImprovementProposal({
        standards: standards,
        currentValues: incompleteMeal,
        proposedValues: incompleteMeal,
      })
    ).toThrow(/栄養素/);
  });

  test('栄養基準ロジック評価検証機能 - 提案値が数値型でない場合エラーがスローされる', () => {
    const standards = {
      protein: { min: 50, max: 70, unit: 'g' },
    };

    const meal = { protein: 60 };
    const invalidProposal = { protein: 'invalid' };

    expect(() =>
      evaluateNutritionImprovementProposal({
        standards: standards,
        currentValues: meal,
        proposedValues: invalidProposal,
      })
    ).toThrow(/数値/);
  });

  test('栄養基準ロジック評価検証機能 - 評価スコアが0～100の範囲内で計算される', () => {
    const nutritionStandards = {
      protein: { min: 50, max: 70, unit: 'g' },
      fat: { min: 40, max: 65, unit: 'g' },
      carbohydrates: { min: 200, max: 300, unit: 'g' },
      vitaminA: { min: 700, max: 900, unit: 'mcg' },
      vitaminC: { min: 80, max: 100, unit: 'mg' },
      calcium: { min: 800, max: 1000, unit: 'mg' },
      iron: { min: 8, max: 12, unit: 'mg' },
    };

    const currentMeal = {
      protein: 60,
      fat: 50,
      carbohydrates: 250,
      vitaminA: 800,
      vitaminC: 90,
      calcium: 900,
      iron: 10,
    };

    const proposedImprovement = {
      protein: 65,
      fat: 55,
      carbohydrates: 280,
      vitaminA: 820,
      vitaminC: 95,
      calcium: 950,
      iron: 11,
    };

    const result = evaluateNutritionImprovementProposal({
      standards: nutritionStandards,
      currentValues: currentMeal,
      proposedValues: proposedImprovement,
    });

    Object.values(result.itemEvaluations).forEach((item) => {
      expect(item.score).toBeGreaterThanOrEqual(0);
      expect(item.score).toBeLessThanOrEqual(100);
    });

    expect(result.overallScore).toBeGreaterThanOrEqual(0);
    expect(result.overallScore).toBeLessThanOrEqual(100);
  });

  test('栄養基準ロジック評価検証機能 - 複数改善案の相対的評価で順位付けが正確に行われる', () => {
    const nutritionStandards = {
      protein: { min: 50, max: 70, unit: 'g' },
      fat: { min: 40, max: 65, unit: 'g' },
      carbohydrates: { min: 200, max: 300, unit: 'g' },
      vitaminA: { min: 700, max: 900, unit: 'mcg' },
      vitaminC: { min: 80, max: 100, unit: 'mg' },
      calcium: { min: 800, max: 1000, unit: 'mg' },
      iron: { min: 8, max: 12, unit: 'mg' },
    };

    const currentMeal = {
      protein: 45,
      fat: 35,
      carbohydrates: 180,
      vitaminA: 600,
      vitaminC: 60,
      calcium: 700,
      iron: 7,
    };

    const proposal1 = {
      protein: 55,
      fat: 45,
      carbohydrates: 220,
      vitaminA: 750,
      vitaminC: 80,
      calcium: 850,
      iron: 9,
    };

    const proposal2 = {
      protein: 65,
      fat: 55,
      carbohydrates: 280,
      vitaminA: 820,
      vitaminC: 95,
      calcium: 950,
      iron: 11,
    };

    const result1 = evaluateNutritionImprovementProposal({
      standards: nutritionStandards,
      currentValues: currentMeal,
      proposedValues: proposal1,
    });

    const result2 = evaluateNutritionImprovementProposal({
      standards: nutritionStandards,
      currentValues: currentMeal,
      proposedValues: proposal2,
    });

    expect(result2.overallScore).toBeGreaterThan(result1.overallScore);
  });
});