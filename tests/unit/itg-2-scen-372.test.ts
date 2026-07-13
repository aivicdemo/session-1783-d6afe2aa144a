import { analyzeExternalDataCorrelation } from '../../src/logic/it-1-br-2-1-1-1';

describe('External Data Correlation Analysis for Prediction Accuracy Degradation Factor Identification', () => {
  // SCEN-372
  test('should correctly identify prediction accuracy degradation factors when external factor correlation is high', () => {
    // Prepare test data: nutrition intake data and external factor data
    const nutritionIntakeData = [
      { date: '2024-01-01', calorieIntake: 2000, proteinIntake: 75, timestamp: new Date('2024-01-01T12:00:00Z').getTime() },
      { date: '2024-01-02', calorieIntake: 2050, proteinIntake: 78, timestamp: new Date('2024-01-02T12:00:00Z').getTime() },
      { date: '2024-01-03', calorieIntake: 1950, proteinIntake: 72, timestamp: new Date('2024-01-03T12:00:00Z').getTime() },
      { date: '2024-01-04', calorieIntake: 2100, proteinIntake: 80, timestamp: new Date('2024-01-04T12:00:00Z').getTime() },
      { date: '2024-01-05', calorieIntake: 2000, proteinIntake: 75, timestamp: new Date('2024-01-05T12:00:00Z').getTime() },
      { date: '2024-01-06', calorieIntake: 2150, proteinIntake: 82, timestamp: new Date('2024-01-06T12:00:00Z').getTime() },
      { date: '2024-01-07', calorieIntake: 1900, proteinIntake: 70, timestamp: new Date('2024-01-07T12:00:00Z').getTime() },
      { date: '2024-01-08', calorieIntake: 2080, proteinIntake: 79, timestamp: new Date('2024-01-08T12:00:00Z').getTime() },
      { date: '2024-01-09', calorieIntake: 2000, proteinIntake: 75, timestamp: new Date('2024-01-09T12:00:00Z').getTime() },
      { date: '2024-01-10', calorieIntake: 2120, proteinIntake: 81, timestamp: new Date('2024-01-10T12:00:00Z').getTime() },
    ];

    const externalFactorData = [
      { date: '2024-01-01', temperature: 5, humidity: 60, pollenIndex: 200, timestamp: new Date('2024-01-01T12:00:00Z').getTime() },
      { date: '2024-01-02', temperature: 6, humidity: 62, pollenIndex: 210, timestamp: new Date('2024-01-02T12:00:00Z').getTime() },
      { date: '2024-01-03', temperature: 4, humidity: 58, pollenIndex: 190, timestamp: new Date('2024-01-03T12:00:00Z').getTime() },
      { date: '2024-01-04', temperature: 7, humidity: 65, pollenIndex: 220, timestamp: new Date('2024-01-04T12:00:00Z').getTime() },
      { date: '2024-01-05', temperature: 5, humidity: 60, pollenIndex: 200, timestamp: new Date('2024-01-05T12:00:00Z').getTime() },
      { date: '2024-01-06', temperature: 8, humidity: 68, pollenIndex: 230, timestamp: new Date('2024-01-06T12:00:00Z').getTime() },
      { date: '2024-01-07', temperature: 3, humidity: 55, pollenIndex: 180, timestamp: new Date('2024-01-07T12:00:00Z').getTime() },
      { date: '2024-01-08', temperature: 7, humidity: 64, pollenIndex: 215, timestamp: new Date('2024-01-08T12:00:00Z').getTime() },
      { date: '2024-01-09', temperature: 5, humidity: 60, pollenIndex: 200, timestamp: new Date('2024-01-09T12:00:00Z').getTime() },
      { date: '2024-01-10', temperature: 8, humidity: 67, pollenIndex: 225, timestamp: new Date('2024-01-10T12:00:00Z').getTime() },
    ];

    const input = {
      nutritionIntakeDataset: nutritionIntakeData,
      externalFactorDataset: externalFactorData,
      correlationThreshold: 0.7,
      analysisStartDate: new Date('2024-01-01'),
      analysisEndDate: new Date('2024-01-10'),
    };

    // Execute correlation analysis
    const result = analyzeExternalDataCorrelation(input);

    // Verify analysis result structure
    expect(result).toBeDefined();
    expect(result.correlationResults).toBeDefined();
    expect(Array.isArray(result.correlationResults)).toBe(true);

    // Verify high correlation factors are identified (correlation >= 0.7)
    const highCorrelationFactors = result.correlationResults.filter(
      (factor: any) => factor.correlationScore >= 0.7
    );
    expect(highCorrelationFactors.length).toBeGreaterThan(0);

    // Verify each high correlation factor has required properties
    highCorrelationFactors.forEach((factor: any) => {
      expect(factor.factorName).toBeDefined();
      expect(typeof factor.factorName).toBe('string');
      expect(factor.correlationScore).toBeDefined();
      expect(typeof factor.correlationScore).toBe('number');
      expect(factor.correlationScore).toBeGreaterThanOrEqual(0.7);
      expect(factor.correlationScore).toBeLessThanOrEqual(1);
    });

    // Verify accuracy degradation factors are identified
    expect(result.predictedAccuracyDegradationFactors).toBeDefined();
    expect(Array.isArray(result.predictedAccuracyDegradationFactors)).toBe(true);

    // Verify degradation factors match high correlation factors
    const degradationFactorNames = result.predictedAccuracyDegradationFactors.map(
      (f: any) => f.factorName
    );
    const highCorrFactorNames = highCorrelationFactors.map((f: any) => f.factorName);

    degradationFactorNames.forEach((name: string) => {
      expect(highCorrFactorNames).toContain(name);
    });

    // Verify each degradation factor has required analysis properties
    result.predictedAccuracyDegradationFactors.forEach((factor: any) => {
      expect(factor.factorName).toBeDefined();
      expect(typeof factor.factorName).toBe('string');
      expect(factor.correlationScore).toBeDefined();
      expect(typeof factor.correlationScore).toBe('number');
      expect(factor.impactLevel).toBeDefined();
      expect(['LOW', 'MEDIUM', 'HIGH']).toContain(factor.impactLevel);
      expect(factor.priority).toBeDefined();
      expect(typeof factor.priority).toBe('number');
      expect(factor.priority).toBeGreaterThanOrEqual(1);
      expect(factor.priority).toBeLessThanOrEqual(highCorrelationFactors.length);
    });

    // Verify analysis completion timestamp
    expect(result.analysisCompletedAt).toBeDefined();
    expect(result.analysisCompletedAt).toBeGreaterThan(0);

    // Verify high correlation factors are prioritized by correlation strength
    if (result.predictedAccuracyDegradationFactors.length > 1) {
      for (let i = 0; i < result.predictedAccuracyDegradationFactors.length - 1; i++) {
        expect(
          result.predictedAccuracyDegradationFactors[i].correlationScore
        ).toBeGreaterThanOrEqual(
          result.predictedAccuracyDegradationFactors[i + 1].correlationScore
        );
      }
    }

    // Verify that factors with correlation >= 0.7 have HIGH or MEDIUM impact
    result.predictedAccuracyDegradationFactors.forEach((factor: any) => {
      if (factor.correlationScore >= 0.7) {
        expect(['HIGH', 'MEDIUM']).toContain(factor.impactLevel);
      }
    });

    // Verify analysis metadata
    expect(result.totalFactorsAnalyzed).toBeDefined();
    expect(typeof result.totalFactorsAnalyzed).toBe('number');
    expect(result.totalFactorsAnalyzed).toBeGreaterThan(0);
    expect(result.highCorrelationFactorCount).toBeDefined();
    expect(typeof result.highCorrelationFactorCount).toBe('number');
    expect(result.highCorrelationFactorCount).toBe(highCorrelationFactors.length);

    // Verify analysis status
    expect(result.analysisStatus).toBe('completed');
  });
});