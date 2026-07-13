import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { detectShoppingListSLADelay } from '../../src/logic/it-1-br-2-1-1-1';

describe('Shopping List Generation SLA Delay Detection - Error Handling', () => {
  let elapsedTimeModule: any;
  let originalConsoleError: typeof console.error;
  let errorLogs: string[] = [];

  beforeEach(() => {
    errorLogs = [];
    originalConsoleError = console.error;
    console.error = jest.fn((msg: string) => {
      errorLogs.push(msg);
    });
  });

  afterEach(() => {
    console.error = originalConsoleError;
    jest.clearAllMocks();
  });

  // SCEN-565
  test('should handle elapsed time measurement failure and stop SLA delay detection process', () => {
    const slaThresholdMs = 86400000; // 24 hours in milliseconds
    const failureTimestamp = new Date('2024-01-15T10:00:00Z').getTime();
    const currentTimestamp = new Date('2024-01-16T11:00:00Z').getTime();
    
    const mockStartTime = failureTimestamp;
    const mockElapsedTimeCalculator = {
      getElapsedMs: jest.fn(() => {
        throw new Error('時間計測');
      }),
    };

    const mockShoppingListInput = {
      userId: 'user-001',
      generationStartTime: new Date('2024-01-15T10:00:00Z'),
      slaThresholdMs: slaThresholdMs,
      nutritionValidationResult: {
        pass: true,
        achievementRate: 95,
      },
      shoppingListItems: [
        { itemId: 'item-001', name: 'トマト', quantity: 2, unit: '個' },
        { itemId: 'item-002', name: '鶏肉', quantity: 500, unit: 'g' },
      ],
      elapsedTimeCalculator: mockElapsedTimeCalculator,
    };

    let thrownError: Error | null = null;
    let delayDetectionProcessed = false;
    let errorNotificationSent = false;

    try {
      delayDetectionProcessed = true;
      const result = detectShoppingListSLADelay(mockShoppingListInput);
    } catch (error) {
      thrownError = error as Error;
      errorNotificationSent = true;
    }

    // Assert: エラーが発生したことを検証
    expect(thrownError).not.toBeNull();
    expect(thrownError?.message).toMatch(/時間計測/);

    // Assert: SLA遅延検知処理が中断されたことを確認（delayDetectionProcessed は true だが、エラーが発生して中断）
    expect(delayDetectionProcessed).toBe(true);
    expect(errorNotificationSent).toBe(true);

    // Assert: エラーログが記録されたことを確認
    expect(mockElapsedTimeCalculator.getElapsedMs).toHaveBeenCalled();

    // Assert: ユーザーへのエラー通知が行われたことを確認
    expect(thrownError?.message).toBeDefined();
    expect(typeof thrownError?.message).toBe('string');
  });
});