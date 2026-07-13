import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { filterAnomalousAndMissingData } from '../../src/logic/it-1-br-6-2-1';

const fetchMock = require('jest-fetch-mock');
fetchMock.enableMocks();

describe('Demand Forecast Accuracy Verification Dashboard: Anomalous and Missing Value Filtering', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  afterEach(() => {
    fetchMock.resetMocks();
  });

  // SCEN-245
  test('should filter anomalous and missing data in food expense records and output error logs on failure', async () => {
    // Precondition: System has food expense data with anomalous and missing values
    // Input data with corrupted/invalid schema
    const malformed_expense_data = {
      user_id: 'usr_001',
      expense_records: [
        {
          record_date: '2024-01-15',
          amount: 5000,
          category: 'vegetables'
        },
        {
          // Missing critical field: amount
          record_date: '2024-01-16',
          category: 'fruits'
        },
        {
          record_date: '2024-01-17',
          amount: -10000, // Anomalous: negative amount
          category: 'meat'
        },
        {
          record_date: 'invalid-date', // Anomalous: invalid date format
          amount: 3000,
          category: 'dairy'
        },
        {
          record_date: '2024-01-19',
          amount: 999999999, // Anomalous: unrealistic amount
          category: 'beverages'
        }
      ]
    };

    const expected_error_log = {
      error_code: 'DATA_VALIDATION_FAILED',
      error_level: 'ERROR',
      timestamp: '2024-01-15T10:30:00Z',
      message: 'Expense record validation failed: missing required field(s)',
      affected_records: [1, 2, 3, 4],
      processing_halted: true
    };

    fetchMock.mockResponseOnce(
      JSON.stringify(expected_error_log),
      { status: 400 }
    );

    const result = await filterAnomalousAndMissingData(malformed_expense_data);

    // Assertion (1): Error log contains specific error details
    expect(result.error_log.error_code).toBe('DATA_VALIDATION_FAILED');
    expect(result.error_log.message).toContain('validation failed');
    expect(result.error_log.timestamp).toBeDefined();

    // Assertion (2): Error log is at ERROR level
    expect(result.error_log.error_level).toBe('ERROR');

    // Assertion (3): Filtering process is immediately halted
    expect(result.processing_halted).toBe(true);

    // Assertion (4): Partial data processing results are not reflected
    expect(result.processed_records).toBeUndefined();
    expect(result.valid_records).toEqual([]);

    // Assertion (5): Anomalous record indices are identified
    expect(result.error_log.affected_records).toContain(1);
    expect(result.error_log.affected_records).toContain(2);
    expect(result.error_log.affected_records).toContain(3);
    expect(result.error_log.affected_records).toContain(4);

    // Assertion: System state is recoverable (no permanent corruption)
    expect(result.system_recoverable).toBe(true);

    // Assertion: User-facing error notification is generated
    expect(result.user_notification).toBeDefined();
    expect(result.user_notification.message).toContain('食費データの検証に失敗しました');
    expect(result.user_notification.severity).toBe('error');

    // Assertion: Fetch was called to log error
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});