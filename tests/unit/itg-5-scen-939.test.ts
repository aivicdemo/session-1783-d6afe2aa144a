import { describe, test, expect, beforeEach } from '@jest/globals';
import { quantifyUserPainAndGenerateDifferentiationAxis } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-939
  test('利用ログデータが存在しない場合、空リストを返すか適切なエラーメッセージをスロー', () => {
    const emptyUtilizationLogs: any[] = [];

    const result = quantifyUserPainAndGenerateDifferentiationAxis({
      utilizationLogs: emptyUtilizationLogs,
      segmentId: 'segment_househusband_001',
      analysisStartDate: new Date('2024-01-01T00:00:00Z'),
      analysisEndDate: new Date('2024-03-31T23:59:59Z'),
    });

    expect(result).toEqual([]);
  });
});