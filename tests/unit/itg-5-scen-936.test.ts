import { prioritizeSegmentsForMaxDifferentiation } from '../../src/logic/it-7-2-1';

describe('差別化効果最大セグメント優先度付け - セグメント別集計データが空の場合', () => {
  // SCEN-936
  test('セグメント別集計データが空配列の場合、空配列を返すか適切なエラーをスロー', () => {
    const emptySegmentData: Array<{
      segmentId: string;
      successRate: number;
      cookingTimeReduction: number;
      userSatisfactionScore: number;
      occurrenceFrequency: number;
      improvementEffect: number;
    }> = [];

    try {
      const result = prioritizeSegmentsForMaxDifferentiation(emptySegmentData);
      
      // パターン1: 空配列が返される場合
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
      expect(result).toEqual([]);
    } catch (error) {
      // パターン2: エラーがスローされる場合
      if (error instanceof Error) {
        // エラーメッセージに「空」または「存在しません」のキーワードが含まれていることを確認
        const errorMessage = error.message;
        const containsValidKeyword =
          /空/.test(errorMessage) ||
          /存在しません/.test(errorMessage) ||
          /入力データ/.test(errorMessage);
        
        expect(containsValidKeyword).toBe(true);
      } else {
        throw error;
      }
    }
  });
});