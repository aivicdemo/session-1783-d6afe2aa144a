import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import {
  generateWeeklyMenuWithEvaluationFiltering,
  type WeeklyMenuGenerationInput,
  type WeeklyMenuGenerationResult,
  type MealEvaluation,
} from '../../src/logic/it-7-2-1';

describe('週次献立生成の食事評価期限管理機能', () => {
  // SCEN-638: 期限超過データが翌週献立生成から正確に除外される

  let testFixtures: {
    expiredEvaluations: MealEvaluation[];
    validEvaluations: MealEvaluation[];
    referenceDate: Date;
  };

  beforeEach(() => {
    const referenceDate = new Date('2024-02-12T09:00:00Z');

    const expiredEvaluation1: MealEvaluation = {
      evaluationId: 'eval-expired-001',
      userId: 'user-001',
      familyMemberId: 'member-001',
      mealId: 'meal-001',
      satisfactionScore: 8,
      completionRate: 0.95,
      feedbackText: 'Good taste',
      createdAt: new Date('2024-02-03T10:00:00Z'),
      submittedAt: new Date('2024-02-03T11:00:00Z'),
    };

    const expiredEvaluation2: MealEvaluation = {
      evaluationId: 'eval-expired-002',
      userId: 'user-001',
      familyMemberId: 'member-002',
      mealId: 'meal-002',
      satisfactionScore: 6,
      completionRate: 0.80,
      feedbackText: 'Too salty',
      createdAt: new Date('2024-02-04T14:30:00Z'),
      submittedAt: new Date('2024-02-04T15:00:00Z'),
    };

    const validEvaluation1: MealEvaluation = {
      evaluationId: 'eval-valid-001',
      userId: 'user-001',
      familyMemberId: 'member-001',
      mealId: 'meal-003',
      satisfactionScore: 9,
      completionRate: 1.0,
      feedbackText: 'Excellent',
      createdAt: new Date('2024-02-10T12:00:00Z'),
      submittedAt: new Date('2024-02-10T12:30:00Z'),
    };

    const validEvaluation2: MealEvaluation = {
      evaluationId: 'eval-valid-002',
      userId: 'user-001',
      familyMemberId: 'member-002',
      mealId: 'meal-004',
      satisfactionScore: 7,
      completionRate: 0.90,
      feedbackText: 'Nice portion',
      createdAt: new Date('2024-02-11T18:00:00Z'),
      submittedAt: new Date('2024-02-11T18:45:00Z'),
    };

    testFixtures = {
      expiredEvaluations: [expiredEvaluation1, expiredEvaluation2],
      validEvaluations: [validEvaluation1, validEvaluation2],
      referenceDate,
    };
  });

  afterEach(() => {
    testFixtures = {
      expiredEvaluations: [],
      validEvaluations: [],
      referenceDate: new Date(),
    };
  });

  test('期限超過した食事評価データは翌週献立生成プロセスから完全に除外され、期限内のデータのみが翌週献立生成に反映される', () => {
    const input: WeeklyMenuGenerationInput = {
      userId: 'user-001',
      referenceDate: testFixtures.referenceDate,
      evaluationDeadlineHours: 24,
      mealEvaluations: [
        ...testFixtures.expiredEvaluations,
        ...testFixtures.validEvaluations,
      ],
      nutritionTargets: {
        protein: 60,
        carbohydrate: 300,
        fat: 65,
        fiber: 30,
      },
      preferences: {
        cuisineTypes: ['Japanese', 'Western'],
        excludedIngredients: ['shellfish', 'peanuts'],
        maxCookingMinutes: 45,
        maxBudgetPerMeal: 1500,
      },
    };

    const result: WeeklyMenuGenerationResult =
      generateWeeklyMenuWithEvaluationFiltering(input);

    expect(result.success).toBe(true);
    expect(result.filteredEvaluationCount).toBe(2);
    expect(result.retainedEvaluationIds).toEqual([
      'eval-valid-001',
      'eval-valid-002',
    ]);
    expect(result.excludedEvaluationIds).toEqual([
      'eval-expired-001',
      'eval-expired-002',
    ]);

    expect(result.generatedMenu).toBeDefined();
    expect(result.generatedMenu.weekStartDate).toEqual(
      new Date('2024-02-12T00:00:00Z')
    );
    expect(result.generatedMenu.weekEndDate).toEqual(
      new Date('2024-02-18T23:59:59Z')
    );

    expect(result.generatedMenu.dailyMenus).toHaveLength(7);

    const usedEvaluationIds = new Set<string>();
    result.generatedMenu.dailyMenus.forEach((dailyMenu) => {
      dailyMenu.meals.forEach((meal) => {
        if (meal.evaluationSource) {
          usedEvaluationIds.add(meal.evaluationSource);
        }
      });
    });

    const expiredIds = new Set(
      testFixtures.expiredEvaluations.map((e) => e.evaluationId)
    );
    expiredIds.forEach((expiredId) => {
      expect(usedEvaluationIds.has(expiredId)).toBe(false);
    });

    const validIds = new Set(
      testFixtures.validEvaluations.map((e) => e.evaluationId)
    );
    validIds.forEach((validId) => {
      expect(Array.from(usedEvaluationIds).includes(validId)).toBe(true);
    });

    expect(result.qualityMetrics.retentionRate).toBe(0.5);
    expect(result.qualityMetrics.dataIntegrityScore).toBe(95);
    expect(result.qualityMetrics.averageSatisfactionFromRetained).toBe(8);
    expect(result.qualityMetrics.averageCompletionFromRetained).toBe(0.95);

    expect(result.executionMetadata.startTime).toBeDefined();
    expect(result.executionMetadata.endTime).toBeDefined();
    expect(result.executionMetadata.processingDurationMs).toBeGreaterThan(0);
    expect(result.executionMetadata.processedEvaluationCount).toBe(4);
    expect(result.executionMetadata.excludedEvaluationCount).toBe(2);
    expect(result.executionMetadata.retainedEvaluationCount).toBe(2);
  });
});