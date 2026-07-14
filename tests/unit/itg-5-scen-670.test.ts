import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { compareAlgorithmVersionEffects } from '../../src/logic/it-7-2-1';

const fetchMock = require('jest-fetch-mock');

describe('アルゴリズム改善前後効果比較 - エラーハンドリング', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-670
  test('比較対象のアルゴリズムバージョンが存在しない場合、適切なエラーを返す', async () => {
    const nonExistentVersionId = 'v999';
    const baselineVersionId = 'v1';
    const comparisonParams = {
      baselineAlgorithmVersionId: baselineVersionId,
      targetAlgorithmVersionId: nonExistentVersionId,
      analysisStartDate: '2024-01-01',
      analysisEndDate: '2024-01-31',
    };

    fetchMock.mockResponseOnce(
      JSON.stringify({
        statusCode: 404,
        errorCode: 'ALGORITHM_VERSION_NOT_FOUND',
        errorMessage: '指定されたアルゴリズムバージョンが見つかりません',
        details: {
          notFoundVersionId: nonExistentVersionId,
          requestedAt: '2024-01-15T12:00:00Z',
        },
      }),
      { status: 404 }
    );

    const result = await compareAlgorithmVersionEffects(comparisonParams);

    expect(result.statusCode).toBe(404);
    expect(result.errorCode).toBe('ALGORITHM_VERSION_NOT_FOUND');
    expect(result.errorMessage).toMatch(/アルゴリズムバージョン/);
    expect(result.details.notFoundVersionId).toBe(nonExistentVersionId);
  });
});