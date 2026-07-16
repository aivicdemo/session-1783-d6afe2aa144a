import { recordRejectionOrHoldProposal } from '../../src/logic/it-8-1-2-1';

describe('SCEN-233: Edge case - Boundary value handling for rejection/hold reason categories', () => {
  test('should correctly process and record rejection/hold proposals with undefined, null, and empty string reason categories', () => {
    // Test Case 1: Undefined reason category
    const proposal_undefined = {
      proposal_id: 'PROP-20240115-001',
      proposal_type: 'algorithm_modification',
      user_segment: 'stay_at_home_fathers',
      reason_category: undefined,
      reason_text: 'Category not provided',
      status: 'rejected',
      recorded_at: new Date('2024-01-15T11:00:00Z'),
    };

    const result_undefined = recordRejectionOrHoldProposal(proposal_undefined);

    expect(result_undefined).toEqual({
      proposal_id: 'PROP-20240115-001',
      proposal_type: 'algorithm_modification',
      user_segment: 'stay_at_home_fathers',
      reason_category: null,
      reason_category_normalized: 'unspecified',
      reason_text: 'Category not provided',
      status: 'rejected',
      recorded_at: new Date('2024-01-15T11:00:00Z'),
      validation_note: 'reason_category was undefined; normalized to unspecified',
      is_valid: true,
    });

    // Test Case 2: Null reason category
    const proposal_null = {
      proposal_id: 'PROP-20240115-002',
      proposal_type: 'parameter_adjustment',
      user_segment: 'stay_at_home_fathers',
      reason_category: null,
      reason_text: 'Technical feasibility constraint',
      status: 'hold',
      recorded_at: new Date('2024-01-15T12:00:00Z'),
    };

    const result_null = recordRejectionOrHoldProposal(proposal_null);

    expect(result_null).toEqual({
      proposal_id: 'PROP-20240115-002',
      proposal_type: 'parameter_adjustment',
      user_segment: 'stay_at_home_fathers',
      reason_category: null,
      reason_category_normalized: 'unspecified',
      reason_text: 'Technical feasibility constraint',
      status: 'hold',
      recorded_at: new Date('2024-01-15T12:00:00Z'),
      validation_note: 'reason_category was null; normalized to unspecified',
      is_valid: true,
    });

    // Test Case 3: Empty string reason category
    const proposal_empty_string = {
      proposal_id: 'PROP-20240115-003',
      proposal_type: 'new_feature',
      user_segment: 'stay_at_home_fathers',
      reason_category: '',
      reason_text: 'Requires additional market research',
      status: 'rejected',
      recorded_at: new Date('2024-01-15T13:00:00Z'),
    };

    const result_empty_string = recordRejectionOrHoldProposal(proposal_empty_string);

    expect(result_empty_string).toEqual({
      proposal_id: 'PROP-20240115-003',
      proposal_type: 'new_feature',
      user_segment: 'stay_at_home_fathers',
      reason_category: '',
      reason_category_normalized: 'unspecified',
      reason_text: 'Requires additional market research',
      status: 'rejected',
      recorded_at: new Date('2024-01-15T13:00:00Z'),
      validation_note: 'reason_category was empty string; normalized to unspecified',
      is_valid: true,
    });

    // Verify all three records have consistent normalization
    expect(result_undefined.reason_category_normalized).toBe('unspecified');
    expect(result_null.reason_category_normalized).toBe('unspecified');
    expect(result_empty_string.reason_category_normalized).toBe('unspecified');

    // Verify all records are valid despite boundary values
    expect(result_undefined.is_valid).toBe(true);
    expect(result_null.is_valid).toBe(true);
    expect(result_empty_string.is_valid).toBe(true);

    // Verify appropriate validation notes are recorded
    expect(result_undefined.validation_note).toContain('undefined');
    expect(result_null.validation_note).toContain('null');
    expect(result_empty_string.validation_note).toContain('empty string');
  });
});