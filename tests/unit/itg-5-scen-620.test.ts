import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { manageFoodEvaluationRetention } from '../../src/logic/it-7-2-1';

describe('Food Evaluation Data Retention Management', () => {
  // SCEN-620: [normal] 食事評価データの保持期間管理・自動削除機能
  test('should auto-delete or mask personal information from expired food evaluation data while preserving retention-period data and logging operations', () => {
    // Setup: Define retention period (3 days for testing)
    const retentionDaysSetting = 3;

    // Create test food evaluation data with personal information
    const testDataCreatedAt = new Date('2024-01-15T10:00:00Z');
    const testFoodEvaluationDatasets = [
      {
        evaluationId: 'eval_001',
        userId: 'user_12345',
        createdAt: testDataCreatedAt,
        mealContent: 'グリーンカレー',
        satisfactionScore: 85,
        completionRate: 90,
        userRequestData: 'もっと辛くしてほしい',
        retentionExpiryDate: new Date('2024-01-18T10:00:00Z'),
      },
      {
        evaluationId: 'eval_002',
        userId: 'user_12346',
        createdAt: testDataCreatedAt,
        mealContent: 'サーモンステーキ',
        satisfactionScore: 92,
        completionRate: 100,
        userRequestData: 'レモン汁を多めに',
        retentionExpiryDate: new Date('2024-01-18T10:00:00Z'),
      },
      {
        evaluationId: 'eval_003',
        userId: 'user_12347',
        createdAt: new Date('2024-01-14T10:00:00Z'),
        mealContent: 'ビーフシチュー',
        satisfactionScore: 78,
        completionRate: 85,
        userRequestData: 'じゃがいもを多めに',
        retentionExpiryDate: new Date('2024-01-17T10:00:00Z'),
      },
    ];

    // Simulate system clock advancement to 4 days after creation
    // This puts eval_001 and eval_002 beyond the 3-day retention period
    const simulatedCurrentDate = new Date('2024-01-19T10:00:00Z');

    // Execute retention management job
    const retentionResult = manageFoodEvaluationRetention({
      currentDate: simulatedCurrentDate,
      retentionDays: retentionDaysSetting,
      foodEvaluationRecords: testFoodEvaluationDatasets,
    });

    // Verify: Expired data records are deleted or masked
    expect(retentionResult.processedRecords).toBe(2);
    expect(retentionResult.deletedOrMaskedCount).toBe(2);

    // Verify: Personal information is removed from expired records
    const expiredDataProcessed = retentionResult.expiredRecordsHandled;
    expect(expiredDataProcessed.length).toBe(2);

    // Verify eval_001 (expired): Personal identifiers removed
    const expiredRecord1 = expiredDataProcessed.find((r) => r.evaluationId === 'eval_001');
    expect(expiredRecord1).toBeDefined();
    expect(expiredRecord1?.userId).toBeNull();
    expect(expiredRecord1?.mealContent).toBeNull();
    expect(expiredRecord1?.userRequestData).toBeNull();
    expect(expiredRecord1?.maskedAt).toBeDefined();
    expect(expiredRecord1?.maskReason).toBe('retention_period_exceeded');

    // Verify eval_002 (expired): Personal identifiers removed
    const expiredRecord2 = expiredDataProcessed.find((r) => r.evaluationId === 'eval_002');
    expect(expiredRecord2).toBeDefined();
    expect(expiredRecord2?.userId).toBeNull();
    expect(expiredRecord2?.mealContent).toBeNull();
    expect(expiredRecord2?.userRequestData).toBeNull();
    expect(expiredRecord2?.maskedAt).toBeDefined();

    // Verify: Retention-period data (eval_003) is NOT affected
    const retentionDataPreserved = retentionResult.retentionPeriodRecordsPreserved;
    expect(retentionDataPreserved.length).toBe(1);
    const preservedRecord = retentionDataPreserved[0];
    expect(preservedRecord.evaluationId).toBe('eval_003');
    expect(preservedRecord.userId).toBe('user_12347');
    expect(preservedRecord.mealContent).toBe('ビーフシチュー');
    expect(preservedRecord.userRequestData).toBe('じゃがいもを多めに');
    expect(preservedRecord.satisfactionScore).toBe(78);

    // Verify: Operation log is recorded correctly
    expect(retentionResult.operationLog).toBeDefined();
    expect(retentionResult.operationLog.executedAt).toEqual(simulatedCurrentDate);
    expect(retentionResult.operationLog.retentionDaysApplied).toBe(3);
    expect(retentionResult.operationLog.totalRecordsProcessed).toBe(3);
    expect(retentionResult.operationLog.recordsMaskedOrDeleted).toBe(2);
    expect(retentionResult.operationLog.recordsPreserved).toBe(1);
    expect(retentionResult.operationLog.status).toBe('completed');

    // Verify: Log contains audit trail for each expired record
    expect(retentionResult.operationLog.maskedRecordsAuditTrail.length).toBe(2);
    const auditTrail1 = retentionResult.operationLog.maskedRecordsAuditTrail.find(
      (trail) => trail.evaluationId === 'eval_001'
    );
    expect(auditTrail1).toBeDefined();
    expect(auditTrail1?.action).toBe('masked');
    expect(auditTrail1?.reason).toBe('retention_period_exceeded');
    expect(auditTrail1?.maskedFields).toContain('userId');
    expect(auditTrail1?.maskedFields).toContain('mealContent');
    expect(auditTrail1?.maskedFields).toContain('userRequestData');

    // Verify: No residual personal information in audit trail
    expect(auditTrail1?.originalUserId).toBeUndefined();
    expect(auditTrail1?.originalMealContent).toBeUndefined();

    // Verify: Processing metadata confirms all operations succeeded
    expect(retentionResult.processingMetadata).toBeDefined();
    expect(retentionResult.processingMetadata.allMaskingOperationsSuccessful).toBe(true);
    expect(retentionResult.processingMetadata.dataIntegrityCheckPassed).toBe(true);
    expect(retentionResult.processingMetadata.retentionPolicyAppliedCorrectly).toBe(true);
  });
});