import { encryptAndAuditUserData } from '../../src/logic/it-3';

describe('食事評価データを献立生成ロジックに反映させる機能', () => {
  // SCEN-552: [normal] 機密データの暗号化と監査ログ記録機能
  test('購入履歴・栄養データ・予測モデルパラメータが暗号化され、監査ログに記録される', () => {
    const userId = 'user-12345';
    const timestamp = new Date('2024-01-15T11:00:00Z');
    
    const purchaseHistoryData = [
      { itemId: 'item-001', quantity: 2, unitPrice: 500, purchaseDate: '2024-01-10' },
      { itemId: 'item-002', quantity: 1, unitPrice: 1200, purchaseDate: '2024-01-12' },
    ];
    
    const nutritionData = {
      calories: 2150,
      protein: 85.5,
      fat: 62.3,
      carbohydrates: 280.4,
    };
    
    const forecastModelParameters = {
      demandForecastWeight: 0.35,
      seasonalityFactor: 1.15,
      priceElasticity: -0.82,
      weatherImpactFactor: 0.12,
    };
    
    const encryptionKey = 'test-encryption-key-32-chars-long';
    
    const result = encryptAndAuditUserData({
      userId,
      timestamp,
      purchaseHistory: purchaseHistoryData,
      nutritionData,
      forecastModelParameters,
      encryptionKey,
    });
    
    // 購入履歴が暗号化されているか検証
    expect(result.encryptedPurchaseHistory).toBeDefined();
    expect(typeof result.encryptedPurchaseHistory).toBe('string');
    expect(result.encryptedPurchaseHistory).toMatch(/^[a-f0-9]{64}:/);
    
    // 栄養データが暗号化されているか検証
    expect(result.encryptedNutritionData).toBeDefined();
    expect(typeof result.encryptedNutritionData).toBe('string');
    expect(result.encryptedNutritionData).toMatch(/^[a-f0-9]{64}:/);
    
    // 予測モデルパラメータが暗号化されているか検証
    expect(result.encryptedForecastModelParameters).toBeDefined();
    expect(typeof result.encryptedForecastModelParameters).toBe('string');
    expect(result.encryptedForecastModelParameters).toMatch(/^[a-f0-9]{64}:/);
    
    // 監査ログが記録されているか検証
    expect(result.auditLogEntries).toBeDefined();
    expect(Array.isArray(result.auditLogEntries)).toBe(true);
    expect(result.auditLogEntries.length).toBe(4);
    
    // 各監査ログレコードを検証
    const loginLog = result.auditLogEntries[0];
    expect(loginLog.timestamp).toEqual(new Date('2024-01-15T11:00:00Z'));
    expect(loginLog.operationType).toBe('LOGIN');
    expect(loginLog.userId).toBe('user-12345');
    expect(loginLog.operationDetail).toBeDefined();
    
    const purchaseLog = result.auditLogEntries[1];
    expect(purchaseLog.timestamp).toEqual(new Date('2024-01-15T11:00:00Z'));
    expect(purchaseLog.operationType).toBe('PURCHASE_DATA_INPUT');
    expect(purchaseLog.userId).toBe('user-12345');
    expect(purchaseLog.operationDetail).toContain('2 items');
    
    const nutritionLog = result.auditLogEntries[2];
    expect(nutritionLog.timestamp).toEqual(new Date('2024-01-15T11:00:00Z'));
    expect(nutritionLog.operationType).toBe('NUTRITION_DATA_INPUT');
    expect(nutritionLog.userId).toBe('user-12345');
    expect(nutritionLog.operationDetail).toContain('2150');
    
    const modelLog = result.auditLogEntries[3];
    expect(modelLog.timestamp).toEqual(new Date('2024-01-15T11:00:00Z'));
    expect(modelLog.operationType).toBe('MODEL_EXECUTION');
    expect(modelLog.userId).toBe('user-12345');
    expect(modelLog.operationDetail).toBeDefined();
    
    // 復号化検証 - 復号化されたデータが元データと一致するか確認
    expect(result.decryptedPurchaseHistory).toEqual(purchaseHistoryData);
    expect(result.decryptedNutritionData).toEqual(nutritionData);
    expect(result.decryptedForecastModelParameters).toEqual(forecastModelParameters);
    
    // 監査ログの共通フィールド検証
    result.auditLogEntries.forEach((logEntry) => {
      expect(logEntry.timestamp).toBeDefined();
      expect(logEntry.timestamp instanceof Date).toBe(true);
      expect(logEntry.operationType).toBeDefined();
      expect(typeof logEntry.operationType).toBe('string');
      expect(logEntry.userId).toBe('user-12345');
      expect(logEntry.operationDetail).toBeDefined();
      expect(typeof logEntry.operationDetail).toBe('string');
    });
    
    // 暗号化データが平文ではないことを確認
    expect(result.encryptedPurchaseHistory).not.toContain(JSON.stringify(purchaseHistoryData));
    expect(result.encryptedNutritionData).not.toContain('2150');
    expect(result.encryptedForecastModelParameters).not.toContain('0.35');
  });
});