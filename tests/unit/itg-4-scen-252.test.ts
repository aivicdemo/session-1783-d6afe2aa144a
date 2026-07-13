import { encryptAndAuditSensitiveData } from '../../src/logic/it-3-br-6-3-3';

describe('予測精度低下要因の可視化ダッシュボード', () => {
  // SCEN-252
  test('機密データ暗号化・監査ログ記録機能 - 栄養データと予測モデルパラメータのアクセス・変更・削除を監査ログに記録できる', () => {
    const userId = 'user_001';
    const sessionId = 'session_abc123';
    const timestamp_access = new Date('2024-01-15T10:00:00Z');
    const timestamp_modify = new Date('2024-01-15T10:15:00Z');
    const timestamp_delete = new Date('2024-01-15T10:30:00Z');

    // 栄養データアクセス操作
    const nutritionAccessData = {
      userId,
      sessionId,
      operation: 'READ' as const,
      dataType: 'nutrition_data' as const,
      recordId: 'nutrition_rec_001',
      timestamp: timestamp_access,
      dataContent: {
        protein: 65.5,
        carbohydrate: 250.3,
        fat: 72.1,
        calories: 2150,
      },
    };

    const nutritionAccessResult = encryptAndAuditSensitiveData(nutritionAccessData);

    expect(nutritionAccessResult.auditLog.userId).toBe(userId);
    expect(nutritionAccessResult.auditLog.operation).toBe('READ');
    expect(nutritionAccessResult.auditLog.dataType).toBe('nutrition_data');
    expect(nutritionAccessResult.auditLog.recordId).toBe('nutrition_rec_001');
    expect(nutritionAccessResult.auditLog.timestamp).toEqual(timestamp_access);
    expect(nutritionAccessResult.auditLog.isEncrypted).toBe(true);
    expect(nutritionAccessResult.auditLog.changeHistory).toEqual([]);

    // 予測モデルパラメータアクセス操作
    const modelParamAccessData = {
      userId,
      sessionId,
      operation: 'READ' as const,
      dataType: 'forecast_model_params' as const,
      recordId: 'model_param_001',
      timestamp: timestamp_access,
      dataContent: {
        seasonalityWeight: 0.35,
        eventInfluenceCoeff: 0.22,
        competitorFactorWeight: 0.18,
        trendAlpha: 0.15,
      },
    };

    const modelParamAccessResult = encryptAndAuditSensitiveData(modelParamAccessData);

    expect(modelParamAccessResult.auditLog.userId).toBe(userId);
    expect(modelParamAccessResult.auditLog.operation).toBe('READ');
    expect(modelParamAccessResult.auditLog.dataType).toBe('forecast_model_params');
    expect(modelParamAccessResult.auditLog.recordId).toBe('model_param_001');
    expect(modelParamAccessResult.auditLog.isEncrypted).toBe(true);

    // 栄養データ変更操作
    const nutritionModifyData = {
      userId,
      sessionId,
      operation: 'UPDATE' as const,
      dataType: 'nutrition_data' as const,
      recordId: 'nutrition_rec_001',
      timestamp: timestamp_modify,
      dataContent: {
        protein: 70.2,
        carbohydrate: 245.8,
        fat: 68.5,
        calories: 2120,
      },
      previousValue: {
        protein: 65.5,
        carbohydrate: 250.3,
        fat: 72.1,
        calories: 2150,
      },
    };

    const nutritionModifyResult = encryptAndAuditSensitiveData(nutritionModifyData);

    expect(nutritionModifyResult.auditLog.userId).toBe(userId);
    expect(nutritionModifyResult.auditLog.operation).toBe('UPDATE');
    expect(nutritionModifyResult.auditLog.dataType).toBe('nutrition_data');
    expect(nutritionModifyResult.auditLog.timestamp).toEqual(timestamp_modify);
    expect(nutritionModifyResult.auditLog.isEncrypted).toBe(true);
    expect(nutritionModifyResult.auditLog.changeHistory).toHaveLength(1);
    expect(nutritionModifyResult.auditLog.changeHistory[0]).toEqual({
      field: 'protein',
      oldValue: 65.5,
      newValue: 70.2,
    });

    // 予測モデルパラメータ変更操作
    const modelParamModifyData = {
      userId,
      sessionId,
      operation: 'UPDATE' as const,
      dataType: 'forecast_model_params' as const,
      recordId: 'model_param_001',
      timestamp: timestamp_modify,
      dataContent: {
        seasonalityWeight: 0.38,
        eventInfluenceCoeff: 0.24,
        competitorFactorWeight: 0.20,
        trendAlpha: 0.18,
      },
      previousValue: {
        seasonalityWeight: 0.35,
        eventInfluenceCoeff: 0.22,
        competitorFactorWeight: 0.18,
        trendAlpha: 0.15,
      },
    };

    const modelParamModifyResult = encryptAndAuditSensitiveData(modelParamModifyData);

    expect(modelParamModifyResult.auditLog.userId).toBe(userId);
    expect(modelParamModifyResult.auditLog.operation).toBe('UPDATE');
    expect(modelParamModifyResult.auditLog.dataType).toBe('forecast_model_params');
    expect(modelParamModifyResult.auditLog.changeHistory).toHaveLength(4);
    expect(modelParamModifyResult.auditLog.changeHistory[0]).toEqual({
      field: 'seasonalityWeight',
      oldValue: 0.35,
      newValue: 0.38,
    });

    // 栄養データ削除操作
    const nutritionDeleteData = {
      userId,
      sessionId,
      operation: 'DELETE' as const,
      dataType: 'nutrition_data' as const,
      recordId: 'nutrition_rec_001',
      timestamp: timestamp_delete,
      dataContent: {
        protein: 70.2,
        carbohydrate: 245.8,
        fat: 68.5,
        calories: 2120,
      },
    };

    const nutritionDeleteResult = encryptAndAuditSensitiveData(nutritionDeleteData);

    expect(nutritionDeleteResult.auditLog.userId).toBe(userId);
    expect(nutritionDeleteResult.auditLog.operation).toBe('DELETE');
    expect(nutritionDeleteResult.auditLog.dataType).toBe('nutrition_data');
    expect(nutritionDeleteResult.auditLog.recordId).toBe('nutrition_rec_001');
    expect(nutritionDeleteResult.auditLog.timestamp).toEqual(timestamp_delete);
    expect(nutritionDeleteResult.auditLog.isEncrypted).toBe(true);
    expect(nutritionDeleteResult.auditLog.deletedAt).toEqual(timestamp_delete);

    // 予測モデルパラメータ削除操作
    const modelParamDeleteData = {
      userId,
      sessionId,
      operation: 'DELETE' as const,
      dataType: 'forecast_model_params' as const,
      recordId: 'model_param_001',
      timestamp: timestamp_delete,
      dataContent: {
        seasonalityWeight: 0.38,
        eventInfluenceCoeff: 0.24,
        competitorFactorWeight: 0.20,
        trendAlpha: 0.18,
      },
    };

    const modelParamDeleteResult = encryptAndAuditSensitiveData(modelParamDeleteData);

    expect(modelParamDeleteResult.auditLog.userId).toBe(userId);
    expect(modelParamDeleteResult.auditLog.operation).toBe('DELETE');
    expect(modelParamDeleteResult.auditLog.dataType).toBe('forecast_model_params');
    expect(modelParamDeleteResult.auditLog.recordId).toBe('model_param_001');
    expect(modelParamDeleteResult.auditLog.timestamp).toEqual(timestamp_delete);
    expect(modelParamDeleteResult.auditLog.isEncrypted).toBe(true);
    expect(modelParamDeleteResult.auditLog.deletedAt).toEqual(timestamp_delete);

    // 監査ログの完全性検証
    expect(nutritionAccessResult.encryptedData).toBeDefined();
    expect(nutritionAccessResult.encryptionKey).toBeDefined();
    expect(nutritionAccessResult.encryptionKey.length).toBeGreaterThan(0);

    expect(modelParamAccessResult.encryptedData).toBeDefined();
    expect(modelParamAccessResult.encryptionKey).toBeDefined();

    // すべての操作がトレーサビリティを持つ形で記録されている
    const allAuditLogs = [
      nutritionAccessResult.auditLog,
      modelParamAccessResult.auditLog,
      nutritionModifyResult.auditLog,
      modelParamModifyResult.auditLog,
      nutritionDeleteResult.auditLog,
      modelParamDeleteResult.auditLog,
    ];

    allAuditLogs.forEach((log) => {
      expect(log.userId).toBe(userId);
      expect(log.timestamp).toBeDefined();
      expect(log.operation).toMatch(/READ|UPDATE|DELETE/);
      expect(log.dataType).toMatch(/nutrition_data|forecast_model_params/);
      expect(log.recordId).toBeDefined();
      expect(log.isEncrypted).toBe(true);
    });

    // 変更操作のみ changeHistory を保持
    expect(nutritionModifyResult.auditLog.changeHistory.length).toBeGreaterThan(0);
    expect(modelParamModifyResult.auditLog.changeHistory.length).toBeGreaterThan(0);
    expect(nutritionAccessResult.auditLog.changeHistory.length).toBe(0);

    // 削除操作は deletedAt を保持
    expect(nutritionDeleteResult.auditLog.deletedAt).toBeDefined();
    expect(modelParamDeleteResult.auditLog.deletedAt).toBeDefined();
  });
});