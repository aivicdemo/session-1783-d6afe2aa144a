import { updateDiscountThresholdRule } from '../../src/logic/it-1-1-1';

describe('Season Pattern and Discount Rate Threshold Rule Integration', () => {
  // SCEN-557: [normal] 季節パターン・割引率・販売期間の優先度ルール統合機能 - 割引率閾値がルール仕様書に正しく更新される
  test('should correctly update discount rate threshold in rule specification document and persist across restarts', () => {
    // Initial rule specification with discount rate threshold at 20%
    const initialRuleSpec = {
      ruleId: 'rule-001',
      seasonPattern: 'spring',
      discountRateThreshold: 20,
      salePeriodStart: '2024-03-01',
      salePeriodEnd: '2024-05-31',
      lastUpdated: new Date('2024-01-15T10:00:00Z').toISOString(),
      version: 1,
    };

    // Update 1: Change discount rate from 20% to 25%
    const updateInput1 = {
      ruleId: 'rule-001',
      seasonPattern: 'spring',
      discountRateThreshold: 25,
      salePeriodStart: '2024-03-01',
      salePeriodEnd: '2024-05-31',
      version: 1,
    };

    const result1 = updateDiscountThresholdRule(updateInput1);

    expect(result1).toEqual({
      ruleId: 'rule-001',
      seasonPattern: 'spring',
      discountRateThreshold: 25,
      salePeriodStart: '2024-03-01',
      salePeriodEnd: '2024-05-31',
      lastUpdated: expect.any(String),
      version: 2,
      isPersisted: true,
    });
    expect(result1.discountRateThreshold).toBe(25);

    // Update 2: Change discount rate from 25% to 30%
    const updateInput2 = {
      ruleId: 'rule-001',
      seasonPattern: 'spring',
      discountRateThreshold: 30,
      salePeriodStart: '2024-03-01',
      salePeriodEnd: '2024-05-31',
      version: 2,
    };

    const result2 = updateDiscountThresholdRule(updateInput2);

    expect(result2).toEqual({
      ruleId: 'rule-001',
      seasonPattern: 'spring',
      discountRateThreshold: 30,
      salePeriodStart: '2024-03-01',
      salePeriodEnd: '2024-05-31',
      lastUpdated: expect.any(String),
      version: 3,
      isPersisted: true,
    });
    expect(result2.discountRateThreshold).toBe(30);
    expect(result2.version).toBe(3);

    // Update 3: Change discount rate from 30% to 15%
    const updateInput3 = {
      ruleId: 'rule-001',
      seasonPattern: 'spring',
      discountRateThreshold: 15,
      salePeriodStart: '2024-03-01',
      salePeriodEnd: '2024-05-31',
      version: 3,
    };

    const result3 = updateDiscountThresholdRule(updateInput3);

    expect(result3).toEqual({
      ruleId: 'rule-001',
      seasonPattern: 'spring',
      discountRateThreshold: 15,
      salePeriodStart: '2024-03-01',
      salePeriodEnd: '2024-05-31',
      lastUpdated: expect.any(String),
      version: 4,
      isPersisted: true,
    });
    expect(result3.discountRateThreshold).toBe(15);
    expect(result3.version).toBe(4);

    // Verify persistence: simulate retrieving after app restart
    const retrievedAfterRestart = updateDiscountThresholdRule({
      ruleId: 'rule-001',
      action: 'retrieve',
    });

    expect(retrievedAfterRestart).toEqual({
      ruleId: 'rule-001',
      seasonPattern: 'spring',
      discountRateThreshold: 15,
      salePeriodStart: '2024-03-01',
      salePeriodEnd: '2024-05-31',
      lastUpdated: expect.any(String),
      version: 4,
      isPersisted: true,
    });
    expect(retrievedAfterRestart.discountRateThreshold).toBe(15);
  });
});