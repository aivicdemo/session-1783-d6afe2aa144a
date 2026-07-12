import { integrateSeasonalRulePattern } from '../../src/logic/it-1-1-1';

describe('seasonal rule pattern integration', () => {
  test('SCEN-556: new seasonal patterns from conference are correctly integrated into rule specification', async () => {
    // Setup: prepare test data
    const existingRuleSpec = {
      id: 'rule-001',
      version: 1,
      seasonalPatterns: [
        {
          patternId: 'spring-2024',
          name: 'Spring Campaign',
          priority: 1,
          discountRate: 15,
          salesPeriodStart: '2024-03-01',
          salesPeriodEnd: '2024-05-31',
        },
        {
          patternId: 'summer-2024',
          name: 'Summer Sale',
          priority: 2,
          discountRate: 20,
          salesPeriodStart: '2024-06-01',
          salesPeriodEnd: '2024-08-31',
        },
      ],
      lastUpdated: '2024-01-15T10:00:00Z',
    };

    const newSeasonalPatterns = [
      {
        patternId: 'autumn-special-2024',
        name: 'Autumn Special Menu',
        priority: 3,
        discountRate: 18,
        salesPeriodStart: '2024-09-01',
        salesPeriodEnd: '2024-11-30',
      },
      {
        patternId: 'winter-hospitality-2024',
        name: 'Winter Hospitality',
        priority: 4,
        discountRate: 25,
        salesPeriodStart: '2024-12-01',
        salesPeriodEnd: '2024-12-31',
      },
    ];

    // Mock API responses
    const fetchMock = require('jest-fetch-mock');
    fetchMock.enableMocks();
    fetchMock.resetMocks();

    // First call: GET existing rule specification
    fetchMock.mockResponseOnce(JSON.stringify(existingRuleSpec), {
      status: 200,
    });

    // Second call: POST integration request
    const integrationResponse = {
      status: 200,
      message: 'Integration successful',
      integratedRuleSpec: {
        id: 'rule-001',
        version: 2,
        seasonalPatterns: [
          ...existingRuleSpec.seasonalPatterns,
          ...newSeasonalPatterns,
        ],
        lastUpdated: '2024-01-15T11:00:00Z',
      },
    };
    fetchMock.mockResponseOnce(JSON.stringify(integrationResponse), {
      status: 200,
    });

    // Third call: GET updated rule specification for verification
    fetchMock.mockResponseOnce(
      JSON.stringify(integrationResponse.integratedRuleSpec),
      { status: 200 }
    );

    // Execute: call integration function
    const result = await integrateSeasonalRulePattern({
      existingRuleSpecId: 'rule-001',
      newSeasonalPatterns: newSeasonalPatterns,
      conferenceDate: '2024-01-15',
    });

    // Verify: integration status is success
    expect(result.status).toBe(200);
    expect(result.message).toBe('Integration successful');

    // Verify: new seasonal patterns are correctly added
    expect(result.integratedRuleSpec.version).toBe(2);
    expect(result.integratedRuleSpec.seasonalPatterns.length).toBe(4);

    // Verify: new patterns exist in integrated spec
    const autumnPattern = result.integratedRuleSpec.seasonalPatterns.find(
      (p: any) => p.patternId === 'autumn-special-2024'
    );
    expect(autumnPattern).toBeDefined();
    expect(autumnPattern.name).toBe('Autumn Special Menu');
    expect(autumnPattern.priority).toBe(3);
    expect(autumnPattern.discountRate).toBe(18);
    expect(autumnPattern.salesPeriodStart).toBe('2024-09-01');
    expect(autumnPattern.salesPeriodEnd).toBe('2024-11-30');

    const winterPattern = result.integratedRuleSpec.seasonalPatterns.find(
      (p: any) => p.patternId === 'winter-hospitality-2024'
    );
    expect(winterPattern).toBeDefined();
    expect(winterPattern.name).toBe('Winter Hospitality');
    expect(winterPattern.priority).toBe(4);
    expect(winterPattern.discountRate).toBe(25);
    expect(winterPattern.salesPeriodStart).toBe('2024-12-01');
    expect(winterPattern.salesPeriodEnd).toBe('2024-12-31');

    // Verify: priority ordering is consistent (no conflicts)
    const priorities = result.integratedRuleSpec.seasonalPatterns.map(
      (p: any) => p.priority
    );
    const sortedPriorities = [...priorities].sort((a, b) => a - b);
    expect(priorities).toEqual(sortedPriorities);

    // Verify: existing patterns remain unchanged
    const existingSpringPattern = result.integratedRuleSpec.seasonalPatterns.find(
      (p: any) => p.patternId === 'spring-2024'
    );
    expect(existingSpringPattern.priority).toBe(1);
    expect(existingSpringPattern.discountRate).toBe(15);
    expect(existingSpringPattern.name).toBe('Spring Campaign');

    const existingSummerPattern = result.integratedRuleSpec.seasonalPatterns.find(
      (p: any) => p.patternId === 'summer-2024'
    );
    expect(existingSummerPattern.priority).toBe(2);
    expect(existingSummerPattern.discountRate).toBe(20);
    expect(existingSummerPattern.name).toBe('Summer Sale');

    // Verify: last updated timestamp is refreshed
    expect(result.integratedRuleSpec.lastUpdated).toBe('2024-01-15T11:00:00Z');

    // Verify: new patterns will be applied during meal generation
    const mealGenerationResult = await integrateSeasonalRulePattern({
      existingRuleSpecId: 'rule-001',
      newSeasonalPatterns: [],
      validateMealGeneration: true,
    });

    expect(mealGenerationResult.status).toBe(200);
    expect(mealGenerationResult.mealGenerationCompatible).toBe(true);
  });
});