import { describe, test, expect } from '@jest/globals';
import { validateSeasonalTrendApproval } from '../../src/logic/it-2-br-6-3-2';

describe('Seasonal Trend Approval Validation - Complete Weekly Data', () => {
  test('SCEN-241: Validates and approves complete 7-day weekly trend data with accurate analysis', () => {
    // Prepare complete 7-day weekly trend data (Monday through Sunday)
    const weeklyTrendData = [
      {
        dayOfWeek: 'Monday',
        purchaseQuantity: 120,
        averagePrice: 850,
        transactionCount: 45,
      },
      {
        dayOfWeek: 'Tuesday',
        purchaseQuantity: 135,
        averagePrice: 820,
        transactionCount: 52,
      },
      {
        dayOfWeek: 'Wednesday',
        purchaseQuantity: 110,
        averagePrice: 890,
        transactionCount: 38,
      },
      {
        dayOfWeek: 'Thursday',
        purchaseQuantity: 125,
        averagePrice: 860,
        transactionCount: 48,
      },
      {
        dayOfWeek: 'Friday',
        purchaseQuantity: 180,
        averagePrice: 780,
        transactionCount: 72,
      },
      {
        dayOfWeek: 'Saturday',
        purchaseQuantity: 220,
        averagePrice: 750,
        transactionCount: 95,
      },
      {
        dayOfWeek: 'Sunday',
        purchaseQuantity: 165,
        averagePrice: 810,
        transactionCount: 60,
      },
    ];

    // Calculate expected aggregate metrics
    const expectedTotalQuantity =
      120 + 135 + 110 + 125 + 180 + 220 + 165; // 1055
    const expectedAverageQuantityPerDay = Math.round(
      expectedTotalQuantity / 7
    ); // 151
    const expectedTotalTransactions = 45 + 52 + 38 + 48 + 72 + 95 + 60; // 410
    const expectedWeightedAveragePrice = Math.round(
      (120 * 850 +
        135 * 820 +
        110 * 890 +
        125 * 860 +
        180 * 780 +
        220 * 750 +
        165 * 810) /
        expectedTotalQuantity
    ); // 808

    // Call the validation function
    const validationResult = validateSeasonalTrendApproval({
      weeklyTrendData,
      validationDate: new Date('2024-02-19T09:00:00Z'),
      approvalThreshold: 0.85,
    });

    // Verify validation success status
    expect(validationResult.status).toBe('検証成功');
    expect(validationResult.isApproved).toBe(true);

    // Verify complete data integrity
    expect(validationResult.processedDaysCount).toBe(7);
    expect(validationResult.dataCompleteness).toBe(1.0); // 100% complete

    // Verify aggregated metrics accuracy
    expect(validationResult.aggregatedMetrics.totalPurchaseQuantity).toBe(
      expectedTotalQuantity
    );
    expect(validationResult.aggregatedMetrics.averageDailyQuantity).toBe(
      expectedAverageQuantityPerDay
    );
    expect(validationResult.aggregatedMetrics.totalTransactionCount).toBe(
      expectedTotalTransactions
    );
    expect(validationResult.aggregatedMetrics.weightedAveragePrice).toBe(
      expectedWeightedAveragePrice
    );

    // Verify daily trend analysis results
    expect(validationResult.dailyAnalysis).toHaveLength(7);
    expect(validationResult.dailyAnalysis[0]).toEqual({
      dayOfWeek: 'Monday',
      purchaseQuantity: 120,
      averagePrice: 850,
      transactionCount: 45,
      quantityRatioToWeeklyAvg: parseFloat((120 / expectedAverageQuantityPerDay).toFixed(2)),
      priceDeviation: parseFloat(
        ((850 - expectedWeightedAveragePrice) / expectedWeightedAveragePrice * 100).toFixed(2)
      ),
    });
    expect(validationResult.dailyAnalysis[4]).toEqual({
      dayOfWeek: 'Friday',
      purchaseQuantity: 180,
      averagePrice: 780,
      transactionCount: 72,
      quantityRatioToWeeklyAvg: parseFloat(
        (180 / expectedAverageQuantityPerDay).toFixed(2)
      ),
      priceDeviation: parseFloat(
        ((780 - expectedWeightedAveragePrice) / expectedWeightedAveragePrice * 100).toFixed(2)
      ),
    });

    // Verify seasonal pattern judgment
    expect(validationResult.seasonalPatternJudgment).toBeDefined();
    expect(validationResult.seasonalPatternJudgment.peakDay).toBe('Saturday');
    expect(validationResult.seasonalPatternJudgment.peakDayQuantity).toBe(220);
    expect(validationResult.seasonalPatternJudgment.lowDay).toBe('Wednesday');
    expect(validationResult.seasonalPatternJudgment.lowDayQuantity).toBe(110);
    expect(validationResult.seasonalPatternJudgment.weekendBoostPercentage).toBe(
      parseFloat(
        (((220 + 165) / 2 - expectedAverageQuantityPerDay) / expectedAverageQuantityPerDay * 100).toFixed(2)
      )
    );

    // Verify approval decision confidence
    expect(validationResult.approvalConfidenceScore).toBeGreaterThanOrEqual(
      validationResult.approvalThreshold
    );
    expect(validationResult.approvalConfidenceScore).toBeLessThanOrEqual(1.0);
    expect(validationResult.approvalConfidenceScore).toBeCloseTo(0.92, 2);

    // Verify timestamp and audit trail
    expect(validationResult.validatedAt).toEqual(
      new Date('2024-02-19T09:00:00Z')
    );
    expect(validationResult.auditTrail).toBeDefined();
    expect(validationResult.auditTrail.validationSteps).toContain(
      'データ完全性チェック'
    );
    expect(validationResult.auditTrail.validationSteps).toContain(
      '曜日別傾向分析'
    );
    expect(validationResult.auditTrail.validationSteps).toContain(
      '承認判定'
    );
  });
});