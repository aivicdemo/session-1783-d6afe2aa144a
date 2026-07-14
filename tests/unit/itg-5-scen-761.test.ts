import { detectAnomaliesAndMissingValues } from '../../src/logic/it-7-2-1';

describe('IT-7-2-1: 異常値・欠損値フィルタリング機能', () => {
  // SCEN-761: [normal] 異常値・欠損値フィルタリング機能 - 複数データソースから集約されたデータ内の異常値と欠損値が自動検出される
  test('複数データソースから集約されたデータ内の異常値と欠損値が自動検出される', () => {
    const aggregatedData = [
      {
        sourceId: 'A',
        recordId: 1,
        meritValue: 85,
        satisfactionScore: 4.5,
        cookingTimeMinutes: 30,
        completionRate: 0.95,
      },
      {
        sourceId: 'A',
        recordId: 2,
        meritValue: null,
        satisfactionScore: 4.2,
        cookingTimeMinutes: 25,
        completionRate: 0.88,
      },
      {
        sourceId: 'B',
        recordId: 3,
        meritValue: 92,
        satisfactionScore: undefined,
        cookingTimeMinutes: 35,
        completionRate: 0.92,
      },
      {
        sourceId: 'B',
        recordId: 4,
        meritValue: 1200,
        satisfactionScore: 4.8,
        cookingTimeMinutes: 15,
        completionRate: 1.5,
      },
      {
        sourceId: 'C',
        recordId: 5,
        meritValue: 78,
        satisfactionScore: 3.9,
        cookingTimeMinutes: '',
        completionRate: 0.85,
      },
      {
        sourceId: 'C',
        recordId: 6,
        meritValue: 88,
        satisfactionScore: 4.1,
        cookingTimeMinutes: 28,
        completionRate: 0.91,
      },
      {
        sourceId: 'A',
        recordId: 7,
        meritValue: -50,
        satisfactionScore: 4.3,
        cookingTimeMinutes: 32,
        completionRate: 0.89,
      },
      {
        sourceId: 'B',
        recordId: 8,
        meritValue: 95,
        satisfactionScore: 5.2,
        cookingTimeMinutes: 20,
        completionRate: 0.93,
      },
    ];

    const result = detectAnomaliesAndMissingValues(aggregatedData);

    expect(result).toEqual({
      totalRecords: 8,
      validRecords: 4,
      anomaliesDetected: [
        {
          recordId: 4,
          sourceId: 'B',
          anomalyType: 'outOfRange',
          field: 'meritValue',
          value: 1200,
          reason: 'exceeds maximum threshold',
          category: 'outlier',
        },
        {
          recordId: 4,
          sourceId: 'B',
          anomalyType: 'outOfRange',
          field: 'completionRate',
          value: 1.5,
          reason: 'exceeds maximum threshold',
          category: 'outlier',
        },
        {
          recordId: 8,
          sourceId: 'B',
          anomalyType: 'outOfRange',
          field: 'satisfactionScore',
          value: 5.2,
          reason: 'exceeds maximum threshold',
          category: 'outlier',
        },
        {
          recordId: 7,
          sourceId: 'A',
          anomalyType: 'negativeValue',
          field: 'meritValue',
          value: -50,
          reason: 'negative value detected',
          category: 'invalid',
        },
      ],
      missingValuesDetected: [
        {
          recordId: 2,
          sourceId: 'A',
          missingType: 'null',
          field: 'meritValue',
          value: null,
        },
        {
          recordId: 3,
          sourceId: 'B',
          missingType: 'undefined',
          field: 'satisfactionScore',
          value: undefined,
        },
        {
          recordId: 5,
          sourceId: 'C',
          missingType: 'emptyString',
          field: 'cookingTimeMinutes',
          value: '',
        },
      ],
      dataQualityScore: 50.0,
      sourceDistribution: {
        A: { total: 3, valid: 2, anomalies: 1, missing: 1 },
        B: { total: 3, valid: 1, anomalies: 2, missing: 0 },
        C: { total: 2, valid: 1, anomalies: 0, missing: 1 },
      },
      filteringStatus: 'completed',
      timestamp: '2024-02-15T10:30:00Z',
    });

    expect(result.validRecords).toBe(4);
    expect(result.anomaliesDetected.length).toBe(4);
    expect(result.missingValuesDetected.length).toBe(3);
    expect(result.dataQualityScore).toBe(50.0);
    expect(result.filteringStatus).toBe('completed');
  });
});