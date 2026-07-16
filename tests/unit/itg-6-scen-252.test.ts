import { determineConferenceProceedingAndAssignAlternatives } from '../../src/logic/it-1-br-8-2-1-1';

describe('Weekly/Monthly Algorithm Improvement Review Conference Proceeding Determination', () => {
  // SCEN-252
  test('should determine conference postponement and invoke alternative assignment flow when all participants are absent', () => {
    // Arrange
    const conference_id = 'CONF-2024-W01';
    const conference_type = 'weekly'; // 'weekly' or 'monthly'
    const scheduled_date = new Date('2024-02-05T09:00:00Z'); // Monday 09:00
    const participants = [
      {
        participant_id: 'USR-001',
        name: 'Alice',
        role: 'Product Manager',
        status: 'absent', // All participants are absent
        attendance_confirmed: false,
        assigned_alternative_id: null,
      },
      {
        participant_id: 'USR-002',
        name: 'Bob',
        role: 'Development Lead',
        status: 'absent',
        attendance_confirmed: false,
        assigned_alternative_id: null,
      },
      {
        participant_id: 'USR-003',
        name: 'Carol',
        role: 'Nutritionist',
        status: 'absent',
        attendance_confirmed: false,
        assigned_alternative_id: null,
      },
    ];
    const available_alternatives = [
      {
        alternative_id: 'ALT-001',
        name: 'David',
        role: 'Senior Product Manager',
        availability: true,
      },
      {
        alternative_id: 'ALT-002',
        name: 'Eve',
        role: 'Development Manager',
        availability: true,
      },
      {
        alternative_id: 'ALT-003',
        name: 'Frank',
        role: 'Senior Nutritionist',
        availability: true,
      },
    ];

    // Act
    const result = determineConferenceProceedingAndAssignAlternatives({
      conference_id,
      conference_type,
      scheduled_date,
      participants,
      available_alternatives,
    });

    // Assert - Conference Proceeding Determination
    expect(result.proceeding_status).toBe('postponed');
    expect(result.reason).toMatch(/absent/);

    // Assert - Alternative Assignment Flow Invoked
    expect(result.alternative_assignment_invoked).toBe(true);

    // Assert - Alternatives Assigned Correctly
    expect(result.assigned_alternatives).toBeDefined();
    expect(result.assigned_alternatives.length).toBe(3);

    // Validate each assignment
    result.assigned_alternatives.forEach((assignment: any) => {
      expect(assignment.original_participant_id).toBeDefined();
      expect(assignment.assigned_alternative_id).toBeDefined();
      expect(assignment.assignment_status).toBe('assigned');
      expect(assignment.confirmation_required).toBe(true);

      // Ensure alternative is from available list
      const alternative = available_alternatives.find(
        (a) => a.alternative_id === assignment.assigned_alternative_id,
      );
      expect(alternative).toBeDefined();
      expect(alternative.availability).toBe(true);
    });

    // Assert - Notification Records Created
    expect(result.notifications_created).toBe(true);
    expect(result.notification_count).toBe(3); // One per participant

    // Assert - New Conference Date Proposed
    expect(result.proposed_reschedule_date).toBeDefined();
    expect(result.proposed_reschedule_date.getTime()).toBeGreaterThan(
      scheduled_date.getTime(),
    );

    // Assert - Audit Trail Entry
    expect(result.audit_trail_recorded).toBe(true);
    expect(result.audit_entry.action_type).toBe('CONFERENCE_POSTPONED');
    expect(result.audit_entry.reason_code).toBe('ALL_PARTICIPANTS_ABSENT');
    expect(result.audit_entry.timestamp).toBeDefined();
  });
});