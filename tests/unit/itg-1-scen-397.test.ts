import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';

const fetchMock = require('jest-fetch-mock');
fetchMock.enableMocks();

// Import the function under test
import { calculateDifferentiationEffectIndicators } from '../../src/logic/it-1-1-1';

describe('User Segment Analysis - Differentiation Effect Indicators with Zero User Count', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  afterEach(() => {
    fetchMock.resetMocks();
  });

  // SCEN-397
  test('should return null differentiation effect indicators when segment user count is zero', async () => {
    // Precondition: User logged into meal generation app with segment analysis feature accessible
    // Trigger: API to calculate differentiation effect indicators is executed for a segment with 0 matching users
    // Expected outcome: Differentiation effect indicators returned as null, status 200, no error thrown

    const segmentConditions = {
      ageGroup: '65-75',
      region: 'tokyo',
      foodRestrictionPresent: false,
    };

    const mockApiResponse = {
      segmentId: 'segment_zero_001',
      segmentConditions: segmentConditions,
      matchingUserCount: 0,
      differentiationEffectIndicators: null,
      mealGenerationSuccessRate: null,
      cookingTimeReductionDegree: null,
      userSatisfactionScore: null,
      status: 'empty_segment',
    };

    fetchMock.mockResponseOnce(JSON.stringify(mockApiResponse), { status: 200 });

    // Execute: Call the function to calculate differentiation effect indicators
    const result = await calculateDifferentiationEffectIndicators(segmentConditions);

    // Verify: Response status is 200
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const callUrl = fetchMock.mock.calls[0][0];
    expect(callUrl).toContain('/api/differentiation-effect');

    // Verify: Differentiation effect indicators are null (not undefined, not empty object)
    expect(result.differentiationEffectIndicators).toBeNull();

    // Verify: Matching user count is exactly 0
    expect(result.matchingUserCount).toBe(0);

    // Verify: Other indicator fields are also null (not causing calculation errors)
    expect(result.mealGenerationSuccessRate).toBeNull();
    expect(result.cookingTimeReductionDegree).toBeNull();
    expect(result.userSatisfactionScore).toBeNull();

    // Verify: Status field indicates empty segment (no error)
    expect(result.status).toBe('empty_segment');

    // Verify: Segment conditions are preserved in response
    expect(result.segmentConditions).toEqual(segmentConditions);

    // Verify: No exception is thrown - function completes successfully
    expect(result).toBeDefined();
  });
});