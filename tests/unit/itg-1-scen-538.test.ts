import { detectAndFilterAnomalies } from '../../src/logic/it-1-br-4-2-1';

describe('食事制限条件の変更時に過去献立との抵触検出機能', () => {
  // SCEN-538: [normal] 異常値・欠損値フィルタリング機能
  test('複数データソースから集約されたユーザー情報内の異常値が自動検出され隔離される', () => {
    // Arrange: 複数のデータソースから集約されたユーザー情報（異常値を含む）
    const aggregatedUserData = {
      userId: 'user-001',
      basicInfo: {
        age: 999, // 異常値: 物理的に不可能な年齢
        height: 500, // 異常値: 物理的に不可能な身長(cm)
        weight: -50, // 異常値: 負の体重
      },
      allergyInfo: {
        allergies: ['egg', 'milk'], // 正常値
      },
      dietaryRestrictions: {
        restrictions: ['gluten-free'], // 正常値
      },
      normalizedTimestamp: '2024-01-15T11:00:00Z',
    };

    const validationRules = {
      age: { min: 0, max: 150 },
      height: { min: 50, max: 300 }, // cm単位
      weight: { min: 2, max: 500 }, // kg単位
    };

    // Act: データフィルタリング機能を実行
    const result = detectAndFilterAnomalies(aggregatedUserData, validationRules);

    // Assert: 異常値が検出され、隔離されていることを確認
    // 期待値: 異常値が検出ログに記録
    expect(result.detectedAnomalies).toHaveLength(3);
    expect(result.detectedAnomalies).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fieldName: 'age',
          detectedValue: 999,
          validRange: { min: 0, max: 150 },
          status: 'anomaly_detected',
        }),
        expect.objectContaining({
          fieldName: 'height',
          detectedValue: 500,
          validRange: { min: 50, max: 300 },
          status: 'anomaly_detected',
        }),
        expect.objectContaining({
          fieldName: 'weight',
          detectedValue: -50,
          validRange: { min: 2, max: 500 },
          status: 'anomaly_detected',
        }),
      ])
    );

    // Assert: 異常値が隔離され、正常データのみが返却されることを確認
    expect(result.cleanedUserData).toEqual(
      expect.objectContaining({
        userId: 'user-001',
        allergyInfo: {
          allergies: ['egg', 'milk'],
        },
        dietaryRestrictions: {
          restrictions: ['gluten-free'],
        },
        normalizedTimestamp: '2024-01-15T11:00:00Z',
      })
    );

    // Assert: cleanedUserData内には異常値となったフィールドが存在しないことを確認
    expect(result.cleanedUserData.basicInfo).toBeUndefined();

    // Assert: 異常値が監査ログに記録されていることを確認
    expect(result.auditLog).toBeDefined();
    expect(result.auditLog.userId).toBe('user-001');
    expect(result.auditLog.anomalyCount).toBe(3);
    expect(result.auditLog.status).toBe('filtered');
    expect(result.auditLog.timestamp).toBeDefined();

    // Assert: 異常値レポートが生成されていることを確認
    expect(result.anomalyReport).toBeDefined();
    expect(result.anomalyReport.totalAnomalies).toBe(3);
    expect(result.anomalyReport.isolatedData).toHaveLength(3);
    expect(result.anomalyReport.displayStatus).toBe('ready_for_notification');

    // Assert: 献立生成ロジック用にフラグが設定されていることを確認
    expect(result.isReadyForMealGeneration).toBe(true);
    expect(result.dataQualityScore).toBe(60); // 3個の異常値が隔離され、正常データが3個（allergyInfo.allergies[0,1], dietaryRestrictions.restrictions[0]）
  });
});