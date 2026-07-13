import { analyzeExternalDataCorrelationWithPartialFailure } from '../../src/logic/it-1-br-3-2-1';

describe('Purchase Records and Monthly Food Cost Reduction Analysis', () => {
  // SCEN-375
  test('should perform partial correlation analysis when external data source connection fails', () => {
    const externalDataSources = [
      {
        sourceId: 'weather_api',
        name: 'Weather API',
        endpoint: 'https://invalid-weather-api.example.com/data',
        status: 'failed',
      },
      {
        sourceId: 'price_index_api',
        name: 'Price Index API',
        endpoint: 'https://price-index-api.example.com/data',
        status: 'success',
      },
      {
        sourceId: 'event_info_api',
        name: 'Event Information API',
        endpoint: 'https://event-info-api.example.com/data',
        status: 'success',
      },
    ];

    const correlationAnalysisInput = {
      userId: 'user_12345',
      analysisMonth: '2024-11',
      externalDataSources: externalDataSources,
      targetMetric: 'demand_forecast_accuracy',
    };

    const result = analyzeExternalDataCorrelationWithPartialFailure(
      correlationAnalysisInput
    );

    // Verify that partial analysis was executed with available sources
    expect(result.analysisStatus).toBe('partial_success');
    expect(result.successfulSources).toEqual(2);
    expect(result.failedSources).toEqual(1);

    // Verify failed source is clearly identified
    expect(result.failedSourceDetails).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourceId: 'weather_api',
          name: 'Weather API',
          errorMessage: expect.stringMatching(/connection|endpoint|invalid/i),
        }),
      ])
    );

    // Verify successful sources are included in correlation analysis
    expect(result.successfulSourceIds).toEqual(
      expect.arrayContaining(['price_index_api', 'event_info_api'])
    );

    // Verify correlation analysis results are computed from available data
    expect(result.correlationResults).toBeDefined();
    expect(result.correlationResults.length).toBe(2);
    expect(result.correlationResults).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourceId: 'price_index_api',
          correlationCoefficient: expect.any(Number),
        }),
        expect.objectContaining({
          sourceId: 'event_info_api',
          correlationCoefficient: expect.any(Number),
        }),
      ])
    );

    // Verify forecast accuracy degradation factors are identified from partial analysis
    expect(result.forecastAccuracyDegradationFactors).toBeDefined();
    expect(result.forecastAccuracyDegradationFactors.length).toBeGreaterThan(0);

    // Verify error is logged with source information
    expect(result.errorLog).toBeDefined();
    expect(result.errorLog).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourceId: 'weather_api',
          timestamp: expect.any(String),
          errorReason: expect.stringMatching(/connection|endpoint|invalid/i),
        }),
      ])
    );

    // Verify user notification contains analysis scope and failure information
    expect(result.userNotification).toBeDefined();
    expect(result.userNotification.analysisScope).toEqual(2);
    expect(result.userNotification.failureCount).toEqual(1);
    expect(result.userNotification.message).toMatch(/partial|analysis|completed/i);
  });
});