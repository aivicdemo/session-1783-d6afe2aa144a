import { recordDietaryRestrictionAuditLog } from '../../src/logic/it-1-br-2-1-1-1';

describe('食事制限条件変更監査ログ記録機能', () => {
  // SCEN-417
  test('食事制限条件の変更内容・検出パターン・タイムスタンプ・変更者情報が監査ログに正しく記録される', () => {
    const userId = 'user_12345';
    const userName = '田中太郎';
    const department = '企画部';
    const restrictionId = 'rest_001';
    
    const previousState = {
      allergens: ['卵', 'エビ'],
      calorieLimit: 2000,
      restrictedNutrients: ['ナトリウム'],
    };
    
    const newState = {
      allergens: ['卵', 'エビ', 'ピーナッツ'],
      calorieLimit: 1800,
      restrictedNutrients: ['ナトリウム', 'コレステロール'],
    };
    
    const changeTimestamp = new Date('2024-12-15T14:30:45Z');
    const detectionPattern = 'multi_constraint_modification';
    
    const auditLog = recordDietaryRestrictionAuditLog({
      userId,
      userName,
      department,
      restrictionId,
      previousState,
      newState,
      changeTimestamp,
      detectionPattern,
    });
    
    // (1) 変更内容の検証：変更前後の詳細な差分が記録されている
    expect(auditLog.changeDetails).toEqual({
      allergenAdded: ['ピーナッツ'],
      allergenRemoved: [],
      calorieLimitChanged: { from: 2000, to: 1800 },
      restrictedNutrientAdded: ['コレステロール'],
      restrictedNutrientRemoved: [],
    });
    
    // (2) 検出パターンの検証：変更が検出されたパターン分類が正確に記録されている
    expect(auditLog.detectionPattern).toBe('multi_constraint_modification');
    
    // (3) タイムスタンプの検証：変更時刻が秒単位の精度で正確に記録されている
    expect(auditLog.recordedAt).toBe('2024-12-15T14:30:45Z');
    expect(auditLog.recordedAtEpochMs).toBe(1734271845000);
    
    // (4) 変更者情報の検証：ログインユーザーのID・名前・所属部門が正確に記録されている
    expect(auditLog.changeInitiator).toEqual({
      userId: 'user_12345',
      userName: '田中太郎',
      department: '企画部',
    });
    
    // すべての項目が完全かつ改ざんなく記録されていることを確認
    expect(auditLog.integrityChecksum).toMatch(/^[a-f0-9]{64}$/);
    expect(auditLog.auditLogId).toMatch(/^audit_[0-9a-f]{8}$/);
    expect(auditLog.isIntegrityVerified).toBe(true);
    expect(auditLog.previousStateHash).toBeDefined();
    expect(auditLog.newStateHash).toBeDefined();
    expect(auditLog.previousStateHash).not.toBe(auditLog.newStateHash);
  });
});