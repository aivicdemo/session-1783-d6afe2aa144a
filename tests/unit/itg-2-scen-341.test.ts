import { describe, test, expect, beforeEach } from '@jest/globals';
import { prioritizeHighRatedDishesForMenuGeneration } from '../../src/logic/it-1-br-2-1-1-1';

describe('Evaluation Data-Driven Menu Generation - High-Rated Dishes Prioritization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-341: [normal] 評価データ蓄積に基づく高評価料理の優先度付けと献立反映
  test('should prioritize high-rated dishes based on accumulated evaluation data and reflect them in next-week menu generation parameters', () => {
    // Arrange: 3ヶ月以上蓄積された評価データを準備
    const accumulatedEvaluationData = [
      {
        dishId: 'dish_001',
        dishName: 'グリルチキン',
        evaluationScore: 4.5,
        evaluationCount: 12,
        evaluationDate: '2024-01-15',
      },
      {
        dishId: 'dish_002',
        dishName: 'パスタ',
        evaluationScore: 3.8,
        evaluationCount: 8,
        evaluationDate: '2024-01-10',
      },
      {
        dishId: 'dish_003',
        dishName: 'サラダ',
        evaluationScore: 4.2,
        evaluationCount: 15,
        evaluationDate: '2024-01-20',
      },
      {
        dishId: 'dish_004',
        dishName: 'スープ',
        evaluationScore: 3.5,
        evaluationCount: 5,
        evaluationDate: '2024-01-05',
      },
      {
        dishId: 'dish_005',
        dishName: 'ステーキ',
        evaluationScore: 4.7,
        evaluationCount: 10,
        evaluationDate: '2024-01-18',
      },
    ];

    // ユーザーリクエスト履歴（同じ期間内）
    const userRequestHistory = [
      {
        requestId: 'req_001',
        dishId: 'dish_001',
        requestCount: 5,
        dishName: 'グリルチキン',
      },
      {
        requestId: 'req_002',
        dishId: 'dish_003',
        requestCount: 8,
        dishName: 'サラダ',
      },
      {
        requestId: 'req_003',
        dishId: 'dish_005',
        requestCount: 6,
        dishName: 'ステーキ',
      },
      {
        requestId: 'req_004',
        dishId: 'dish_004',
        requestCount: 2,
        dishName: 'スープ',
      },
    ];

    const prioritizationInput = {
      evaluationData: accumulatedEvaluationData,
      userRequests: userRequestHistory,
      evaluationThreshold: 4.0,
      analysisStartDate: '2023-10-15',
      analysisEndDate: '2024-01-31',
    };

    // Act: 優先度付けエンジンを実行
    const prioritizationResult = prioritizeHighRatedDishesForMenuGeneration(
      prioritizationInput
    );

    // Assert: 高評価料理（評価スコア4.0以上）が正しくフィルタリングされていることを確認
    expect(prioritizationResult.highRatedDishes).toBeDefined();
    expect(prioritizationResult.highRatedDishes.length).toBe(3); // dish_001, dish_003, dish_005
    expect(prioritizationResult.highRatedDishes[0].dishId).toBe('dish_005'); // ステーキ（スコア4.7が最高）
    expect(prioritizationResult.highRatedDishes[1].dishId).toBe('dish_001'); // グリルチキン（スコア4.5）
    expect(prioritizationResult.highRatedDishes[2].dishId).toBe('dish_003'); // サラダ（スコア4.2）

    // 優先度スコアが正しく計算されていることを確認
    // 優先度スコア = (評価スコア * 0.6) + (リクエスト頻度の正規化値 * 0.4)
    // dish_005: (4.7 * 0.6) + (6/8 * 0.4) = 2.82 + 0.3 = 3.12
    // dish_001: (4.5 * 0.6) + (5/8 * 0.4) = 2.7 + 0.25 = 2.95
    // dish_003: (4.2 * 0.6) + (8/8 * 0.4) = 2.52 + 0.4 = 2.92
    expect(prioritizationResult.priorityScores[0]).toBeCloseTo(3.12, 2);
    expect(prioritizationResult.priorityScores[1]).toBeCloseTo(2.95, 2);
    expect(prioritizationResult.priorityScores[2]).toBeCloseTo(2.92, 2);

    // 推奨料理リストが優先度順に並んでいることを確認
    expect(prioritizationResult.recommendedDishesForNextWeek.length).toBe(3);
    expect(prioritizationResult.recommendedDishesForNextWeek[0]).toEqual({
      dishId: 'dish_005',
      dishName: 'ステーキ',
      evaluationScore: 4.7,
      requestCount: 6,
      priorityScore: expect.closeTo(3.12, 2),
      priority: 1,
    });
    expect(prioritizationResult.recommendedDishesForNextWeek[1]).toEqual({
      dishId: 'dish_001',
      dishName: 'グリルチキン',
      evaluationScore: 4.5,
      requestCount: 5,
      priorityScore: expect.closeTo(2.95, 2),
      priority: 2,
    });
    expect(prioritizationResult.recommendedDishesForNextWeek[2]).toEqual({
      dishId: 'dish_003',
      dishName: 'サラダ',
      evaluationScore: 4.2,
      requestCount: 8,
      priorityScore: expect.closeTo(2.92, 2),
      priority: 3,
    });

    // 献立生成パラメータが自動反映されていることを確認
    expect(prioritizationResult.menuGenerationParameters).toBeDefined();
    expect(
      prioritizationResult.menuGenerationParameters.recommendedDishList
    ).toEqual(['dish_005', 'dish_001', 'dish_003']);
    expect(
      prioritizationResult.menuGenerationParameters.priorityWeights
    ).toEqual({
      evaluationScoreWeight: 0.6,
      requestFrequencyWeight: 0.4,
    });

    // 反映が成功したことを示すステータスを確認
    expect(prioritizationResult.reflectionStatus).toBe('reflected');
    expect(prioritizationResult.reflectionTimestamp).toBeDefined();

    // 評価データ集計の統計情報を確認
    expect(prioritizationResult.statistics).toBeDefined();
    expect(prioritizationResult.statistics.totalEvaluationRecords).toBe(5);
    expect(prioritizationResult.statistics.highRatedDishesCount).toBe(3);
    expect(prioritizationResult.statistics.analysisDateRange).toEqual({
      start: '2023-10-15',
      end: '2024-01-31',
    });
  });
});