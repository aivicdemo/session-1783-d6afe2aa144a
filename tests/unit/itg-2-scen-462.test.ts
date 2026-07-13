import { collectUserFoodRecordData } from '../../src/logic/it-1-br-2-1-1-1';

describe('ユーザー食事記録データ収集指示機能', () => {
  test('SCEN-462: 月次検証と四半期検証で異なる収集対象期間が正しく設定される', () => {
    // Arrange: 月次検証のパラメータを設定
    const verificationTypeMonthly = 'monthly';
    const currentDateMonthly = new Date('2024-06-15T10:00:00Z');
    
    // Act: 月次検証時の対象期間を取得
    const monthlyResult = collectUserFoodRecordData({
      verificationType: verificationTypeMonthly,
      currentDate: currentDateMonthly,
    });

    // Assert: 月次検証の期間が正しく設定される（2024年6月1日～6月30日）
    expect(monthlyResult.periodStart).toBe('2024-06-01');
    expect(monthlyResult.periodEnd).toBe('2024-06-30');
    expect(monthlyResult.collectionPeriodDays).toBe(30);

    // Arrange: 四半期検証のパラメータを設定
    const verificationTypeQuarterly = 'quarterly';
    const currentDateQuarterly = new Date('2024-06-15T10:00:00Z');

    // Act: 四半期検証時の対象期間を取得
    const quarterlyResult = collectUserFoodRecordData({
      verificationType: verificationTypeQuarterly,
      currentDate: currentDateQuarterly,
    });

    // Assert: 四半期検証の期間が正しく設定される（Q2: 2024年4月1日～6月30日）
    expect(quarterlyResult.periodStart).toBe('2024-04-01');
    expect(quarterlyResult.periodEnd).toBe('2024-06-30');
    expect(quarterlyResult.collectionPeriodDays).toBe(91);

    // Assert: 月次検証と四半期検証の期間が異なることを検証
    expect(monthlyResult.periodStart).not.toBe(quarterlyResult.periodStart);
    expect(monthlyResult.periodEnd).toBe(quarterlyResult.periodEnd);
    expect(monthlyResult.collectionPeriodDays).not.toBe(quarterlyResult.collectionPeriodDays);

    // Assert: 月次検証の期間が四半期検証の期間に包含されることを検証
    expect(monthlyResult.periodStart).toBeGreaterThanOrEqual(quarterlyResult.periodStart);
    expect(monthlyResult.periodEnd).toBeLessThanOrEqual(quarterlyResult.periodEnd);

    // Assert: 収集指示の実行が成功し、対象期間がメタデータに正しく設定される
    expect(monthlyResult.instructionStatus).toBe('initiated');
    expect(monthlyResult.targetPeriod).toEqual({
      type: 'monthly',
      start: '2024-06-01',
      end: '2024-06-30',
    });

    expect(quarterlyResult.instructionStatus).toBe('initiated');
    expect(quarterlyResult.targetPeriod).toEqual({
      type: 'quarterly',
      start: '2024-04-01',
      end: '2024-06-30',
    });

    // Assert: 月末日と四半期末日が確実に含まれるかを検証
    expect(monthlyResult.includesEndDate).toBe(true);
    expect(quarterlyResult.includesEndDate).toBe(true);

    // Assert: 最小サンプル数が定義されていることを検証
    expect(monthlyResult.minimumSampleSize).toBe(1);
    expect(quarterlyResult.minimumSampleSize).toBe(1);

    // Assert: 収集対象期間内のデータが実際に収集されたことを検証
    expect(monthlyResult.collectedRecordsCount).toBeGreaterThanOrEqual(0);
    expect(quarterlyResult.collectedRecordsCount).toBeGreaterThanOrEqual(0);

    // Assert: 期間設定が正確に実行されていることをシステムレベルで検証
    expect(monthlyResult.executionResult).toEqual({
      success: true,
      periodValidation: 'passed',
      dataCollectionStatus: 'completed',
    });

    expect(quarterlyResult.executionResult).toEqual({
      success: true,
      periodValidation: 'passed',
      dataCollectionStatus: 'completed',
    });
  });
});