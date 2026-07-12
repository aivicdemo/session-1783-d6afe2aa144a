import { validateRuleUpdateAndDetectConflicts } from '../../src/logic/it-1-br-4-2-1';

describe('食事制限条件の変更時に過去献立との抵触検出機能', () => {
  // SCEN-581
  test('ルール変更の自動検証 - 更新されたルール仕様が献立生成ロジックに反映される際、過去献立との矛盾・栄養基準抵触・食事評価データとの整合性が自動検証される', () => {
    const currentRuleSet = {
      proteinMin: 20,
      proteinMax: 100,
      carbMin: 50,
      carbMax: 400,
      fatMin: 10,
      fatMax: 150,
      fiberMin: 15,
      fiberMax: 50,
      sodiumMax: 2400,
    };

    const updatedRuleSet = {
      proteinMin: 25,
      proteinMax: 100,
      carbMin: 50,
      carbMax: 400,
      fatMin: 10,
      fatMax: 150,
      fiberMin: 15,
      fiberMax: 50,
      sodiumMax: 2400,
    };

    const pastMealPlansData = [
      {
        mealPlanId: 'meal_001',
        date: '2024-12-15',
        nutritionData: {
          protein: 22,
          carbs: 300,
          fat: 80,
          fiber: 18,
          sodium: 1800,
        },
        mealEvaluations: [
          {
            familyMemberId: 'member_001',
            satisfactionScore: 4,
            completionRate: 0.9,
            requestComment: 'もう少し塩辛くしてほしい',
          },
        ],
      },
      {
        mealPlanId: 'meal_002',
        date: '2024-12-18',
        nutritionData: {
          protein: 18,
          carbs: 280,
          fat: 70,
          fiber: 16,
          sodium: 2200,
        },
        mealEvaluations: [
          {
            familyMemberId: 'member_001',
            satisfactionScore: 2,
            completionRate: 0.5,
            requestComment: 'タンパク質が足りない',
          },
        ],
      },
      {
        mealPlanId: 'meal_003',
        date: '2024-12-22',
        nutritionData: {
          protein: 28,
          carbs: 320,
          fat: 95,
          fiber: 22,
          sodium: 2100,
        },
        mealEvaluations: [
          {
            familyMemberId: 'member_001',
            satisfactionScore: 5,
            completionRate: 1.0,
            requestComment: 'とても満足',
          },
        ],
      },
    ];

    const result = validateRuleUpdateAndDetectConflicts(
      currentRuleSet,
      updatedRuleSet,
      pastMealPlansData
    );

    expect(result).toEqual({
      validationStatus: 'completed',
      conflictSummary: {
        totalMealPlansChecked: 3,
        conflictingMealPlans: 1,
        nutritionViolations: 1,
        evaluationInconsistencies: 1,
      },
      conflictDetails: [
        {
          mealPlanId: 'meal_002',
          conflictType: 'nutrition_violation',
          violatedNutrient: 'protein',
          currentValue: 18,
          newRuleMin: 25,
          newRuleMax: 100,
          severity: 'high',
          evaluationFeedback:
            'タンパク質が足りない',
        },
      ],
      inconsistencyDetails: [
        {
          mealPlanId: 'meal_002',
          inconsistencyType: 'evaluation_nutrition_mismatch',
          familyMemberId: 'member_001',
          satisfactionScore: 2,
          completionRate: 0.5,
          nutritionProblem: 'protein_below_minimum',
          message:
            '満足度が低く、フィードバックもタンパク質不足を指摘。新ルール適用で適切に検出される',
        },
      ],
      ruleChangeImpact: {
        affectedMealPlans: ['meal_002'],
        impactPercentage: 33.33,
        recommendation: 'apply_rule_update',
        reasoning:
          '新ルールはユーザーフィードバックと一致し、過去の評価データを説明できる',
      },
      validationLogId: 'val_log_2024_12_25_001',
      validationTimestamp: '2024-12-25T10:30:00Z',
    });

    expect(result.validationStatus).toBe('completed');
    expect(result.conflictSummary.totalMealPlansChecked).toBe(3);
    expect(result.conflictSummary.conflictingMealPlans).toBe(1);
    expect(result.conflictSummary.nutritionViolations).toBe(1);
    expect(result.conflictSummary.evaluationInconsistencies).toBe(1);
    expect(result.conflictDetails.length).toBe(1);
    expect(result.conflictDetails[0].mealPlanId).toBe('meal_002');
    expect(result.conflictDetails[0].conflictType).toBe('nutrition_violation');
    expect(result.conflictDetails[0].violatedNutrient).toBe('protein');
    expect(result.conflictDetails[0].currentValue).toBe(18);
    expect(result.conflictDetails[0].newRuleMin).toBe(25);
    expect(result.conflictDetails[0].severity).toBe('high');
    expect(result.inconsistencyDetails.length).toBe(1);
    expect(result.inconsistencyDetails[0].mealPlanId).toBe('meal_002');
    expect(
      result.inconsistencyDetails[0].inconsistencyType
    ).toBe('evaluation_nutrition_mismatch');
    expect(result.inconsistencyDetails[0].satisfactionScore).toBe(2);
    expect(result.inconsistencyDetails[0].completionRate).toBe(0.5);
    expect(result.ruleChangeImpact.affectedMealPlans.length).toBe(1);
    expect(result.ruleChangeImpact.affectedMealPlans[0]).toBe('meal_002');
    expect(result.ruleChangeImpact.impactPercentage).toBe(33.33);
    expect(result.ruleChangeImpact.recommendation).toBe('apply_rule_update');
    expect(result.validationLogId).toBe('val_log_2024_12_25_001');
  });
});