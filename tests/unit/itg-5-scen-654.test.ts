import { processMultipleRestrictionsWithPriority } from '../../src/logic/it-7-2-1';

describe('複数制限条件の優先度処理機能', () => {
  // SCEN-654
  test('同一タイムスタンプで複数制限条件が入力された場合に優先度順に処理される', () => {
    const timestamp = '2024-01-15T11:00:00Z';
    const multipleRestrictions = [
      {
        id: 'restriction_1',
        timestamp: timestamp,
        priority: 1,
        type: 'allergen',
        content: 'Eliminate peanuts',
        userId: 'user_001',
      },
      {
        id: 'restriction_2',
        timestamp: timestamp,
        priority: 2,
        type: 'dietary',
        content: 'Low sodium diet',
        userId: 'user_001',
      },
      {
        id: 'restriction_3',
        timestamp: timestamp,
        priority: 3,
        type: 'cooking_time',
        content: 'Max 30 minutes',
        userId: 'user_001',
      },
    ];

    const result = processMultipleRestrictionsWithPriority(multipleRestrictions);

    expect(result).toBeDefined();
    expect(result.processedRestrictions).toHaveLength(3);

    expect(result.processedRestrictions[0]).toEqual({
      id: 'restriction_1',
      timestamp: timestamp,
      priority: 1,
      type: 'allergen',
      content: 'Eliminate peanuts',
      userId: 'user_001',
      executionOrder: 1,
      status: 'completed',
    });

    expect(result.processedRestrictions[1]).toEqual({
      id: 'restriction_2',
      timestamp: timestamp,
      priority: 2,
      type: 'dietary',
      content: 'Low sodium diet',
      userId: 'user_001',
      executionOrder: 2,
      status: 'completed',
    });

    expect(result.processedRestrictions[2]).toEqual({
      id: 'restriction_3',
      timestamp: timestamp,
      priority: 3,
      type: 'cooking_time',
      content: 'Max 30 minutes',
      userId: 'user_001',
      executionOrder: 3,
      status: 'completed',
    });

    expect(result.processingLog).toBeDefined();
    expect(result.processingLog).toHaveLength(3);

    expect(result.processingLog[0]).toEqual({
      restrictionId: 'restriction_1',
      priority: 1,
      executionSequence: 1,
      timestamp: expect.any(String),
      message: 'Priority 1 restriction processed: Eliminate peanuts',
    });

    expect(result.processingLog[1]).toEqual({
      restrictionId: 'restriction_2',
      priority: 2,
      executionSequence: 2,
      timestamp: expect.any(String),
      message: 'Priority 2 restriction processed: Low sodium diet',
    });

    expect(result.processingLog[2]).toEqual({
      restrictionId: 'restriction_3',
      priority: 3,
      executionSequence: 3,
      timestamp: expect.any(String),
      message: 'Priority 3 restriction processed: Max 30 minutes',
    });

    expect(result.dashboardSummary).toEqual({
      totalProcessed: 3,
      allSuccessful: true,
      processingOrderCorrect: true,
      executionSequence: [1, 2, 3],
    });
  });
});