import { describe, test, expect, beforeEach } from '@jest/globals';
import { integrateMenuGenerationRules } from '../../src/logic/it-7-2-1';

describe('Season Pattern Discount Rate Sales Period Rule Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-817
  test('should reject rule integration when season pattern is missing', () => {
    const invalidRuleInput = {
      seasonPattern: '',
      discountRate: 15,
      salesPeriodStartDate: new Date('2024-01-15T00:00:00Z'),
      salesPeriodEndDate: new Date('2024-01-31T23:59:59Z'),
    };

    expect(() => integrateMenuGenerationRules(invalidRuleInput)).toThrow(/季節パターン|season pattern/i);
  });

  test('should reject rule integration when season pattern is null', () => {
    const invalidRuleInput = {
      seasonPattern: null,
      discountRate: 15,
      salesPeriodStartDate: new Date('2024-01-15T00:00:00Z'),
      salesPeriodEndDate: new Date('2024-01-31T23:59:59Z'),
    };

    expect(() => integrateMenuGenerationRules(invalidRuleInput)).toThrow(/季節パターン|season pattern/i);
  });

  test('should reject rule integration when season pattern is undefined', () => {
    const invalidRuleInput = {
      seasonPattern: undefined,
      discountRate: 15,
      salesPeriodStartDate: new Date('2024-01-15T00:00:00Z'),
      salesPeriodEndDate: new Date('2024-01-31T23:59:59Z'),
    };

    expect(() => integrateMenuGenerationRules(invalidRuleInput)).toThrow(/季節パターン|season pattern/i);
  });

  test('should successfully integrate rules when all required fields including season pattern are provided', () => {
    const validRuleInput = {
      seasonPattern: 'winter_vegetables',
      discountRate: 15,
      salesPeriodStartDate: new Date('2024-01-15T00:00:00Z'),
      salesPeriodEndDate: new Date('2024-01-31T23:59:59Z'),
      ruleVersion: 'v2.1',
      appliedAt: new Date('2024-01-10T09:00:00Z'),
    };

    const result = integrateMenuGenerationRules(validRuleInput);

    expect(result).toEqual({
      success: true,
      ruleId: expect.any(String),
      seasonPattern: 'winter_vegetables',
      discountRate: 15,
      salesPeriodStartDate: new Date('2024-01-15T00:00:00Z'),
      salesPeriodEndDate: new Date('2024-01-31T23:59:59Z'),
      ruleVersion: 'v2.1',
      appliedAt: new Date('2024-01-10T09:00:00Z'),
      integratedAt: expect.any(Date),
      status: 'integrated',
    });
  });

  test('should reject rule integration when discount rate is missing but season pattern is provided', () => {
    const invalidRuleInput = {
      seasonPattern: 'spring_vegetables',
      discountRate: undefined,
      salesPeriodStartDate: new Date('2024-03-15T00:00:00Z'),
      salesPeriodEndDate: new Date('2024-03-31T23:59:59Z'),
    };

    expect(() => integrateMenuGenerationRules(invalidRuleInput)).toThrow(/割引率|discount rate/i);
  });

  test('should reject rule integration when sales period end date is before start date', () => {
    const invalidRuleInput = {
      seasonPattern: 'summer_fruits',
      discountRate: 20,
      salesPeriodStartDate: new Date('2024-06-30T00:00:00Z'),
      salesPeriodEndDate: new Date('2024-06-01T23:59:59Z'),
    };

    expect(() => integrateMenuGenerationRules(invalidRuleInput)).toThrow(/販売期間|sales period/i);
  });

  test('should process rule integration with discount rate zero when all required fields are provided', () => {
    const validRuleInput = {
      seasonPattern: 'autumn_harvest',
      discountRate: 0,
      salesPeriodStartDate: new Date('2024-09-15T00:00:00Z'),
      salesPeriodEndDate: new Date('2024-09-30T23:59:59Z'),
    };

    const result = integrateMenuGenerationRules(validRuleInput);

    expect(result.success).toBe(true);
    expect(result.discountRate).toBe(0);
    expect(result.seasonPattern).toBe('autumn_harvest');
  });

  test('should reject rule integration when discount rate exceeds maximum allowed value', () => {
    const invalidRuleInput = {
      seasonPattern: 'peak_season',
      discountRate: 101,
      salesPeriodStartDate: new Date('2024-05-15T00:00:00Z'),
      salesPeriodEndDate: new Date('2024-05-31T23:59:59Z'),
    };

    expect(() => integrateMenuGenerationRules(invalidRuleInput)).toThrow(/割引率|discount rate/i);
  });
});