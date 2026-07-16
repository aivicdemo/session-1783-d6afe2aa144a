import { generateUserSegmentPriorityMatrix } from '../../src/logic/it-1-br-8-2-1-1';

describe('ユーザーセグメント別利用パターン分析ダッシュボード', () => {
  // SCEN-313: [error] ペイン要因定量化・優先度マトリクス生成機能 - ログデータが存在しない、または収集期間が不足している場合、統計的信頼性に関するエラーが返される
  test('should return statistical reliability error when log data is missing or collection period is insufficient', async () => {
    // ===== Test Case 1: ログデータが存在しない状態 =====
    const emptyLogInput = {
      userId: 'user_001',
      segmentId: 'segment_househusband_001',
      logData: [],
      collectionStartDate: '2024-01-01T00:00:00Z',
      collectionEndDate: '2024-01-31T23:59:59Z',
    };

    // ログデータが存在しない場合のエラー検証
    try {
      await generateUserSegmentPriorityMatrix(emptyLogInput);
      fail('Expected error to be thrown for missing log data');
    } catch (error: any) {
      expect(error.message).toMatch(/統計的信頼性|信頼性/);
      expect(error.statusCode).toBeOneOf([400, 422]);
      expect(error.message).toMatch(/データ不足|サンプルサイズ不足|ログデータが存在しない/);
    }

    // ===== Test Case 2: 収集期間が不足している状態（1日未満）=====
    const insufficientPeriodInput = {
      userId: 'user_002',
      segmentId: 'segment_househusband_002',
      logData: [
        {
          timestamp: '2024-01-15T09:00:00Z',
          eventType: 'menu_generation',
          successFlag: true,
          cookingTimeMinutes: 28,
          userSatisfactionScore: 4.2,
        },
        {
          timestamp: '2024-01-15T12:30:00Z',
          eventType: 'menu_generation',
          successFlag: true,
          cookingTimeMinutes: 25,
          userSatisfactionScore: 4.5,
        },
      ],
      collectionStartDate: '2024-01-15T00:00:00Z',
      collectionEndDate: '2024-01-15T18:00:00Z',
    };

    // 収集期間が不足している場合のエラー検証
    try {
      await generateUserSegmentPriorityMatrix(insufficientPeriodInput);
      fail('Expected error to be thrown for insufficient collection period');
    } catch (error: any) {
      expect(error.message).toMatch(/統計的信頼性|信頼性/);
      expect(error.statusCode).toBeOneOf([400, 422]);
      expect(error.message).toMatch(/サンプルサイズ不足|収集期間が不足|1日以上の/);
    }

    // ===== Test Case 3: エラーレスポンス構造の検証 =====
    const invalidInputWithMinimalData = {
      userId: 'user_003',
      segmentId: 'segment_househusband_003',
      logData: [
        {
          timestamp: '2024-01-15T09:00:00Z',
          eventType: 'menu_generation',
          successFlag: false,
          cookingTimeMinutes: 45,
          userSatisfactionScore: 2.1,
        },
      ],
      collectionStartDate: '2024-01-15T08:00:00Z',
      collectionEndDate: '2024-01-15T10:00:00Z',
    };

    try {
      await generateUserSegmentPriorityMatrix(invalidInputWithMinimalData);
      fail('Expected error to be thrown for minimal insufficient data');
    } catch (error: any) {
      expect(error).toHaveProperty('statusCode');
      expect(error).toHaveProperty('message');
      expect([400, 422]).toContain(error.statusCode);
      expect(error.message).not.toBe('');
      expect(error.message.length).toBeGreaterThan(0);
    }
  });
});

// Helper function to extend toBeOneOf matcher
expect.extend({
  toBeOneOf(received: any, expected: any[]) {
    const pass = expected.includes(received);
    return {
      pass,
      message: () =>
        pass
          ? `expected ${received} not to be one of ${expected}`
          : `expected ${received} to be one of ${expected}`,
    };
  },
});

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeOneOf(expected: any[]): R;
    }
  }
}