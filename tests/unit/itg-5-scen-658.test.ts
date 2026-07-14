import { recordDietaryRestrictionAuditLog } from '../../src/logic/it-7-2-1';

describe('Weekly Algorithm Improvement Dashboard - Audit Log Recording', () => {
  // SCEN-658: [edge] Food restriction change audit log recording - empty detection patterns
  test('should record audit log correctly when detection patterns are empty', () => {
    const userId = 'user-12345';
    const changedBy = 'spouse-user-67890';
    const changeTimestamp = new Date('2024-01-15T10:30:00Z');
    const detectedPatterns: string[] = [];
    const newRestrictionCondition = {
      type: 'lactose_intolerance',
      severity: 'high',
      detectedPatterns: detectedPatterns,
    };

    const auditLogEntry = recordDietaryRestrictionAuditLog({
      userId,
      changedBy,
      changeTimestamp,
      restrictionType: newRestrictionCondition.type,
      restrictionSeverity: newRestrictionCondition.severity,
      detectedPatterns: newRestrictionCondition.detectedPatterns,
    });

    expect(auditLogEntry).toBeDefined();
    expect(auditLogEntry.userId).toBe(userId);
    expect(auditLogEntry.changedBy).toBe(changedBy);
    expect(auditLogEntry.changeTimestamp).toEqual(changeTimestamp);
    expect(auditLogEntry.restrictionType).toBe('lactose_intolerance');
    expect(auditLogEntry.restrictionSeverity).toBe('high');
    expect(auditLogEntry.detectedPatterns).toEqual([]);
    expect(auditLogEntry.detectedPatterns.length).toBe(0);
    expect(auditLogEntry.logLevel).toBe('INFO');
    expect(auditLogEntry.recordedAt).toBeDefined();
    expect(typeof auditLogEntry.recordedAt).toBe('string');
    expect(auditLogEntry.status).toBe('recorded');
  });
});