import { generateQuarterlyMeetingPreparation } from '../../src/logic/it-1-br-6-2-1-1';

describe('Quarterly Meeting Preparation Auto-Generation - 90-Day Interval', () => {
  test('SCEN-496: Should auto-generate meeting preparation when exactly 90 days have passed since last meeting', () => {
    // Setup: Previous meeting date is January 1, 2024
    const previous_meeting_date = new Date('2024-01-01T09:00:00Z');
    
    // Setup: Current system time is exactly 90 days later (April 1, 2024)
    const current_system_date = new Date('2024-04-01T09:00:00Z');
    
    // Setup: Meeting interval configured as 90 days
    const meeting_interval_days = 90;
    
    // Calculate days elapsed
    const time_diff_ms = current_system_date.getTime() - previous_meeting_date.getTime();
    const days_elapsed = Math.floor(time_diff_ms / (1000 * 60 * 60 * 24));
    
    // Verify precondition: exactly 90 days have elapsed
    expect(days_elapsed).toBe(90);
    
    // Execute: Trigger auto-generation with current date context
    const preparation_result = generateQuarterlyMeetingPreparation({
      previous_meeting_date: previous_meeting_date,
      current_date: current_system_date,
      meeting_interval_days: meeting_interval_days,
      participants: ['product_manager', 'distributor_manager', 'supply_chain_lead'],
      agenda_template_id: 'AGENDA_Q1_2024',
      expected_deliverables: ['seasonal_patterns', 'discount_thresholds', 'sales_period_rules']
    });
    
    // Verify: Auto-generation was triggered
    expect(preparation_result.was_triggered).toBe(true);
    
    // Verify: Trigger reason is correct
    expect(preparation_result.trigger_reason).toBe('90_day_interval_reached');
    
    // Verify: Generation timestamp is recorded accurately
    expect(preparation_result.generated_at).toEqual(new Date('2024-04-01T09:00:00Z'));
    
    // Verify: All preparation materials were generated
    expect(preparation_result.prepared_items).toHaveLength(3);
    expect(preparation_result.prepared_items).toContain('seasonal_patterns');
    expect(preparation_result.prepared_items).toContain('discount_thresholds');
    expect(preparation_result.prepared_items).toContain('sales_period_rules');
    
    // Verify: Participant list is correctly populated
    expect(preparation_result.meeting_participants).toEqual([
      'product_manager',
      'distributor_manager',
      'supply_chain_lead'
    ]);
    
    // Verify: Preparation completeness status is success
    expect(preparation_result.preparation_status).toBe('complete');
    
    // Verify: All deliverables show completion
    expect(preparation_result.deliverable_completion_rate).toBe(100);
    
    // Verify: System log records accurate execution timestamp
    expect(preparation_result.system_log_entry).toMatchObject({
      event_type: 'quarterly_meeting_preparation_auto_generated',
      execution_timestamp: new Date('2024-04-01T09:00:00Z'),
      status: 'success',
      days_since_last_meeting: 90
    });
    
    // Verify: No errors occurred during generation
    expect(preparation_result.errors).toHaveLength(0);
    
    // Verify: Data integrity requirements are met
    expect(preparation_result.data_completeness_check).toBe(true);
    expect(preparation_result.data_accuracy_check).toBe(true);
  });

  test('SCEN-496-boundary: Should NOT trigger auto-generation when 89 days have passed', () => {
    const previous_meeting_date = new Date('2024-01-01T09:00:00Z');
    const current_system_date = new Date('2024-03-31T09:00:00Z');
    const meeting_interval_days = 90;

    const preparation_result = generateQuarterlyMeetingPreparation({
      previous_meeting_date: previous_meeting_date,
      current_date: current_system_date,
      meeting_interval_days: meeting_interval_days,
      participants: ['product_manager', 'distributor_manager', 'supply_chain_lead'],
      agenda_template_id: 'AGENDA_Q1_2024',
      expected_deliverables: ['seasonal_patterns', 'discount_thresholds', 'sales_period_rules']
    });

    expect(preparation_result.was_triggered).toBe(false);
  });

  test('SCEN-496-boundary: Should NOT trigger auto-generation when 91 days have passed', () => {
    const previous_meeting_date = new Date('2024-01-01T09:00:00Z');
    const current_system_date = new Date('2024-04-02T09:00:00Z');
    const meeting_interval_days = 90;

    const preparation_result = generateQuarterlyMeetingPreparation({
      previous_meeting_date: previous_meeting_date,
      current_date: current_system_date,
      meeting_interval_days: meeting_interval_days,
      participants: ['product_manager', 'distributor_manager', 'supply_chain_lead'],
      agenda_template_id: 'AGENDA_Q1_2024',
      expected_deliverables: ['seasonal_patterns', 'discount_thresholds', 'sales_period_rules']
    });

    expect(preparation_result.was_triggered).toBe(false);
  });

  test('SCEN-496-error: Should throw when previous_meeting_date is in future', () => {
    const previous_meeting_date = new Date('2025-01-01T09:00:00Z');
    const current_system_date = new Date('2024-04-01T09:00:00Z');
    const meeting_interval_days = 90;

    expect(() => {
      generateQuarterlyMeetingPreparation({
        previous_meeting_date: previous_meeting_date,
        current_date: current_system_date,
        meeting_interval_days: meeting_interval_days,
        participants: ['product_manager'],
        agenda_template_id: 'AGENDA_Q1_2024',
        expected_deliverables: ['seasonal_patterns']
      });
    }).toThrow(/previous_meeting_date/);
  });

  test('SCEN-496-error: Should throw when meeting_interval_days is invalid', () => {
    const previous_meeting_date = new Date('2024-01-01T09:00:00Z');
    const current_system_date = new Date('2024-04-01T09:00:00Z');

    expect(() => {
      generateQuarterlyMeetingPreparation({
        previous_meeting_date: previous_meeting_date,
        current_date: current_system_date,
        meeting_interval_days: -90,
        participants: ['product_manager'],
        agenda_template_id: 'AGENDA_Q1_2024',
        expected_deliverables: ['seasonal_patterns']
      });
    }).toThrow(/meeting_interval_days/);
  });
});