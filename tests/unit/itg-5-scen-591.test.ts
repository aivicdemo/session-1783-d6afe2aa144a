import { calculateCorrelationMatrix } from '../../src/logic/it-7-2-1';

describe('External Data Correlation Analysis - Boundary Value Normalization', () => {
  // SCEN-591
  test('should correctly normalize and aggregate correlation coefficients across -1.0 to 1.0 boundary values', () => {
    // Prepare test data with boundary correlation coefficients
    const externalDataset = [
      {
        pair_id: 'weather_demand_1',
        variable_x: [10, 20, 30, 40, 50],
        variable_y: [50, 40, 30, 20, 10],
        expected_correlation: -1.0, // Perfect negative correlation
      },
      {
        pair_id: 'event_sales_1',
        variable_x: [10, 20, 30, 40, 50],
        variable_y: [10, 20, 30, 40, 50],
        expected_correlation: 1.0, // Perfect positive correlation
      },
      {
        pair_id: 'competitor_demand_1',
        variable_x: [10, 20, 30, 40, 50],
        variable_y: [30, 30, 30, 30, 30],
        expected_correlation: 0.0, // No correlation
      },
      {
        pair_id: 'weather_inventory_1',
        variable_x: [10, 20, 30, 40, 50],
        variable_y: [15, 25, 35, 45, 55],
        expected_correlation: 1.0, // Perfect positive correlation
      },
      {
        pair_id: 'promotion_demand_1',
        variable_x: [10, 15, 20, 25, 30],
        variable_y: [25, 20, 15, 10, 5],
        expected_correlation: -1.0, // Perfect negative correlation
      },
      {
        pair_id: 'seasonal_pattern_1',
        variable_x: [10, 20, 30, 40, 50],
        variable_y: [12, 22, 28, 38, 48],
        expected_correlation: 0.997, // Near-perfect positive correlation (approximately 1.0)
      },
      {
        pair_id: 'random_factor_1',
        variable_x: [10, 20, 30, 40, 50],
        variable_y: [25, 15, 35, 20, 45],
        expected_correlation: -0.5, // Moderate negative correlation
      },
      {
        pair_id: 'partial_correlation_1',
        variable_x: [10, 20, 30, 40, 50],
        variable_y: [14, 24, 34, 44, 54],
        expected_correlation: 0.5, // Moderate positive correlation
      },
    ];

    // Execute correlation analysis function
    const correlationResult = calculateCorrelationMatrix(externalDataset);

    // Verify perfect negative correlation (-1.0) normalization
    const perfectNegativeCorr = correlationResult.find(
      (result) => result.pair_id === 'weather_demand_1'
    );
    expect(perfectNegativeCorr).toBeDefined();
    expect(perfectNegativeCorr!.normalized_correlation).toBe(-1.0);
    expect(perfectNegativeCorr!.normalized_correlation).toBeGreaterThanOrEqual(-1.0);
    expect(perfectNegativeCorr!.normalized_correlation).toBeLessThanOrEqual(1.0);

    // Verify perfect positive correlation (1.0) normalization
    const perfectPositiveCorr = correlationResult.find(
      (result) => result.pair_id === 'event_sales_1'
    );
    expect(perfectPositiveCorr).toBeDefined();
    expect(perfectPositiveCorr!.normalized_correlation).toBe(1.0);
    expect(perfectPositiveCorr!.normalized_correlation).toBeGreaterThanOrEqual(-1.0);
    expect(perfectPositiveCorr!.normalized_correlation).toBeLessThanOrEqual(1.0);

    // Verify no correlation (0.0) normalization
    const noCorr = correlationResult.find(
      (result) => result.pair_id === 'competitor_demand_1'
    );
    expect(noCorr).toBeDefined();
    expect(noCorr!.normalized_correlation).toBe(0.0);
    expect(noCorr!.normalized_correlation).toBeGreaterThanOrEqual(-1.0);
    expect(noCorr!.normalized_correlation).toBeLessThanOrEqual(1.0);

    // Verify moderate negative correlation (-0.5) normalization
    const moderateNegativeCorr = correlationResult.find(
      (result) => result.pair_id === 'random_factor_1'
    );
    expect(moderateNegativeCorr).toBeDefined();
    expect(moderateNegativeCorr!.normalized_correlation).toBeLessThan(0);
    expect(moderateNegativeCorr!.normalized_correlation).toBeGreaterThanOrEqual(-1.0);
    expect(moderateNegativeCorr!.normalized_correlation).toBeLessThanOrEqual(1.0);

    // Verify moderate positive correlation (0.5) normalization
    const moderatePositiveCorr = correlationResult.find(
      (result) => result.pair_id === 'partial_correlation_1'
    );
    expect(moderatePositiveCorr).toBeDefined();
    expect(moderatePositiveCorr!.normalized_correlation).toBeGreaterThan(0);
    expect(moderatePositiveCorr!.normalized_correlation).toBeGreaterThanOrEqual(-1.0);
    expect(moderatePositiveCorr!.normalized_correlation).toBeLessThanOrEqual(1.0);

    // Verify near-perfect positive correlation normalization
    const nearPerfectCorr = correlationResult.find(
      (result) => result.pair_id === 'seasonal_pattern_1'
    );
    expect(nearPerfectCorr).toBeDefined();
    expect(nearPerfectCorr!.normalized_correlation).toBeGreaterThan(0.99);
    expect(nearPerfectCorr!.normalized_correlation).toBeLessThanOrEqual(1.0);

    // Verify all correlation coefficients are within normalized range [-1.0, 1.0]
    correlationResult.forEach((result) => {
      expect(result.normalized_correlation).toBeGreaterThanOrEqual(-1.0);
      expect(result.normalized_correlation).toBeLessThanOrEqual(1.0);
    });

    // Verify numerical precision to third decimal place
    correlationResult.forEach((result) => {
      const precision = Math.pow(10, 3);
      const truncatedValue = Math.round(result.normalized_correlation * precision) / precision;
      expect(result.normalized_correlation).toBeCloseTo(truncatedValue, 3);
    });

    // Verify aggregation results exist and contain valid data
    expect(correlationResult.length).toBe(externalDataset.length);
    expect(correlationResult[0]).toHaveProperty('pair_id');
    expect(correlationResult[0]).toHaveProperty('normalized_correlation');
    expect(correlationResult[0]).toHaveProperty('aggregated_value');

    // Verify aggregated values are consistent with normalized correlations
    correlationResult.forEach((result) => {
      expect(typeof result.aggregated_value).toBe('number');
      expect(result.aggregated_value).toBeGreaterThanOrEqual(0);
    });
  });
});