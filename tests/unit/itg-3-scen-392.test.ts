import { calculateMonthlyCostReductionEffect } from '../../src/logic/it-1-br-3-2-1';

describe('Monthly Cost Reduction Effect Calculation', () => {
  // SCEN-392
  test('should correctly calculate 0% reduction rate when actual spending equals budget amount', () => {
    const budget_amount = 100000;
    const actual_amount = 100000;

    const result = calculateMonthlyCostReductionEffect({
      budget_amount,
      actual_amount,
    });

    expect(result.reduction_rate).toBe(0);
    expect(result.reduction_amount).toBe(0);
    expect(result.is_over_budget).toBe(false);
  });

  test('should calculate positive reduction rate when actual spending is less than budget', () => {
    const budget_amount = 100000;
    const actual_amount = 80000;

    const result = calculateMonthlyCostReductionEffect({
      budget_amount,
      actual_amount,
    });

    expect(result.reduction_rate).toBe(20);
    expect(result.reduction_amount).toBe(20000);
    expect(result.is_over_budget).toBe(false);
  });

  test('should calculate negative reduction rate when actual spending exceeds budget', () => {
    const budget_amount = 100000;
    const actual_amount = 120000;

    const result = calculateMonthlyCostReductionEffect({
      budget_amount,
      actual_amount,
    });

    expect(result.reduction_rate).toBe(-20);
    expect(result.reduction_amount).toBe(-20000);
    expect(result.is_over_budget).toBe(true);
  });

  test('should handle edge case with zero budget amount', () => {
    const budget_amount = 0;
    const actual_amount = 0;

    expect(() =>
      calculateMonthlyCostReductionEffect({
        budget_amount,
        actual_amount,
      })
    ).toThrow(/予算額/);
  });

  test('should handle negative actual amount', () => {
    const budget_amount = 100000;
    const actual_amount = -50000;

    expect(() =>
      calculateMonthlyCostReductionEffect({
        budget_amount,
        actual_amount,
      })
    ).toThrow(/実績額/);
  });

  test('should correctly calculate reduction rate with decimal precision', () => {
    const budget_amount = 100000;
    const actual_amount = 75000;

    const result = calculateMonthlyCostReductionEffect({
      budget_amount,
      actual_amount,
    });

    expect(result.reduction_rate).toBe(25);
    expect(result.reduction_amount).toBe(25000);
    expect(result.is_over_budget).toBe(false);
  });
});