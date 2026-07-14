import { classifyPainFactorsAndGeneratePriorityMatrix } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-605: [error] ユーザーペイン要因自動分類・優先度マトリクス生成機能 - 離脱データまたは入力パターンが不足している場合、分類不可として適切に通知できる
  test('should throw error when defection data or input patterns are insufficient', () => {
    const insufficientDefectionData = {
      defectionRecords: [],
      inputPatterns: [
        {
          patternId: 'pattern_001',
          constraintType: 'cookingTime',
          constraintValue: 30,
          frequency: 2,
        },
      ],
      minimumRequiredRecords: 10,
    };

    expect(() => classifyPainFactorsAndGeneratePriorityMatrix(insufficientDefectionData))
      .toThrow(/離脱データ|入力パターン|不足/);
  });

  test('should throw error when input patterns have insufficient variety', () => {
    const defectionData = Array.from({ length: 15 }, (_, i) => ({
      recordId: `record_${i}`,
      userId: `user_${i}`,
      stepName: 'constraint_input',
      timestamp: new Date('2024-01-15T10:00:00Z').toISOString(),
    }));

    const insufficientInputPatterns = {
      defectionRecords: defectionData,
      inputPatterns: [],
      minimumRequiredRecords: 10,
    };

    expect(() => classifyPainFactorsAndGeneratePriorityMatrix(insufficientInputPatterns))
      .toThrow(/入力パターン|不足/);
  });

  test('should throw error when required fields in input patterns are empty', () => {
    const defectionData = Array.from({ length: 15 }, (_, i) => ({
      recordId: `record_${i}`,
      userId: `user_${i}`,
      stepName: 'constraint_input',
      timestamp: new Date('2024-01-15T10:00:00Z').toISOString(),
    }));

    const patternsWithEmptyFields = {
      defectionRecords: defectionData,
      inputPatterns: [
        {
          patternId: 'pattern_001',
          constraintType: '',
          constraintValue: null,
          frequency: 0,
        },
      ],
      minimumRequiredRecords: 10,
    };

    expect(() => classifyPainFactorsAndGeneratePriorityMatrix(patternsWithEmptyFields))
      .toThrow(/入力パターン|不足/);
  });

  test('should successfully classify pain factors and generate priority matrix with sufficient data', () => {
    const defectionData = Array.from({ length: 15 }, (_, i) => ({
      recordId: `record_${i}`,
      userId: `user_${i}`,
      stepName: 'constraint_input',
      timestamp: new Date('2024-01-15T10:00:00Z').toISOString(),
    }));

    const sufficientInputPatterns = {
      defectionRecords: defectionData,
      inputPatterns: [
        {
          patternId: 'pattern_001',
          constraintType: 'cookingTime',
          constraintValue: 30,
          frequency: 5,
        },
        {
          patternId: 'pattern_002',
          constraintType: 'budget',
          constraintValue: 2000,
          frequency: 4,
        },
        {
          patternId: 'pattern_003',
          constraintType: 'allergen',
          constraintValue: 'egg',
          frequency: 3,
        },
      ],
      minimumRequiredRecords: 10,
    };

    const result = classifyPainFactorsAndGeneratePriorityMatrix(sufficientInputPatterns);

    expect(result).toEqual({
      classificationStatus: 'success',
      painFactorCategories: [
        {
          categoryId: 'category_cooking_time',
          categoryName: 'adjustmentCookingTime',
          frequency: 5,
          impactScore: 33,
        },
        {
          categoryId: 'category_budget',
          categoryName: 'budgetConstraint',
          frequency: 4,
          impactScore: 27,
        },
        {
          categoryId: 'category_allergen',
          categoryName: 'allergenRestriction',
          frequency: 3,
          impactScore: 20,
        },
      ],
      priorityMatrix: {
        highPriority: [
          {
            painFactorId: 'pf_cooking_time',
            painFactorName: 'adjustmentCookingTime',
            businessValue: 8,
            implementationDifficulty: 5,
            userImpact: 7,
            totalScore: 73,
            priority: 'high',
          },
        ],
        mediumPriority: [
          {
            painFactorId: 'pf_budget',
            painFactorName: 'budgetConstraint',
            businessValue: 6,
            implementationDifficulty: 4,
            userImpact: 5,
            totalScore: 50,
            priority: 'medium',
          },
        ],
        lowPriority: [
          {
            painFactorId: 'pf_allergen',
            painFactorName: 'allergenRestriction',
            businessValue: 4,
            implementationDifficulty: 3,
            userImpact: 3,
            totalScore: 33,
            priority: 'low',
          },
        ],
      },
      totalProcessedRecords: 15,
      totalClassifiedPatterns: 3,
      generatedAt: expect.any(String),
    });
  });

  test('should include error details in response when classification fails due to data insufficiency', () => {
    const minimumDataCount = 10;
    const actualDataCount = 5;

    const insufficientData = {
      defectionRecords: Array.from({ length: actualDataCount }, (_, i) => ({
        recordId: `record_${i}`,
        userId: `user_${i}`,
        stepName: 'constraint_input',
        timestamp: new Date('2024-01-15T10:00:00Z').toISOString(),
      })),
      inputPatterns: [],
      minimumRequiredRecords: minimumDataCount,
    };

    expect(() => classifyPainFactorsAndGeneratePriorityMatrix(insufficientData))
      .toThrow(/離脱データ|入力パターン|不足/);
  });
});