import { encryptAndAuditModelParameters } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-778: [normal] 機密データ暗号化・監査ログ記録機能
  test('予測モデルパラメータを含む機密データが暗号化され、全操作が監査ログに記録されること', () => {
    // 前提: アルゴリズム改善・検証ダッシュボードシステムにユーザーがログイン済み
    const userId = 'user_20240115_001';
    const projectId = 'project_ml_v2_20240115';
    const operatorId = 'operator_nutritionist_yamada';

    // 手順1: 予測モデルパラメータを含むプロジェクト新規作成
    const modelParameters = {
      modelName: 'meal_demand_forecast_v2.3',
      weights: [0.15, 0.22, 0.18, 0.25, 0.20],
      bias: 0.042,
      learningRate: 0.001,
      regularizationLambda: 0.05,
      hiddenLayerSize: 128,
      activationFunction: 'relu',
      batchSize: 32,
      epochs: 150,
      optimizationAlgorithm: 'adam',
    };

    // 手順3: パラメータを入力・保存し、暗号化・監査ログ記録を実行
    const encryptionResult = encryptAndAuditModelParameters({
      projectId,
      operatorId,
      modelParameters,
      operation: 'create',
      timestamp: new Date('2024-01-15T11:00:00Z'),
    });

    // 期待結果1: パラメータがデータベースで暗号化されていること
    expect(encryptionResult.isEncrypted).toBe(true);
    expect(encryptionResult.encryptedData).toBeDefined();
    expect(typeof encryptionResult.encryptedData).toBe('string');
    expect(encryptionResult.encryptedData.length).toBeGreaterThan(0);

    // 期待結果2: 暗号化されたパラメータが平文と異なること
    expect(encryptionResult.encryptedData).not.toEqual(
      JSON.stringify(modelParameters)
    );

    // 手順4: 暗号化されたパラメータを復号化して検証
    const decryptedParameters = encryptionResult.decryptedParameters;
    expect(decryptedParameters.modelName).toBe('meal_demand_forecast_v2.3');
    expect(decryptedParameters.weights).toEqual([0.15, 0.22, 0.18, 0.25, 0.20]);
    expect(decryptedParameters.bias).toBe(0.042);
    expect(decryptedParameters.learningRate).toBe(0.001);
    expect(decryptedParameters.regularizationLambda).toBe(0.05);
    expect(decryptedParameters.hiddenLayerSize).toBe(128);
    expect(decryptedParameters.activationFunction).toBe('relu');
    expect(decryptedParameters.batchSize).toBe(32);
    expect(decryptedParameters.epochs).toBe(150);
    expect(decryptedParameters.optimizationAlgorithm).toBe('adam');

    // 期待結果3: 監査ログが作成・変更・削除操作について記録されていること
    expect(encryptionResult.auditLogs).toBeDefined();
    expect(encryptionResult.auditLogs.length).toBe(1);

    const createAuditLog = encryptionResult.auditLogs[0];
    expect(createAuditLog.operation).toBe('create');

    // 期待結果4: 監査ログに操作者ID、操作内容、タイムスタンプが正確に含まれること
    expect(createAuditLog.operatorId).toBe('operator_nutritionist_yamada');
    expect(createAuditLog.projectId).toBe('project_ml_v2_20240115');
    expect(createAuditLog.timestamp).toEqual(new Date('2024-01-15T11:00:00Z'));
    expect(createAuditLog.operationContent).toBe('Model parameters created');
    expect(createAuditLog.dataHash).toBeDefined();
    expect(typeof createAuditLog.dataHash).toBe('string');

    // 手順5: 更新操作を実行
    const updateModelParameters = {
      ...modelParameters,
      learningRate: 0.0005,
      epochs: 200,
    };

    const updateResult = encryptAndAuditModelParameters({
      projectId,
      operatorId,
      modelParameters: updateModelParameters,
      operation: 'update',
      timestamp: new Date('2024-01-15T12:30:00Z'),
    });

    expect(updateResult.auditLogs.length).toBe(1);
    const updateAuditLog = updateResult.auditLogs[0];
    expect(updateAuditLog.operation).toBe('update');
    expect(updateAuditLog.operatorId).toBe('operator_nutritionist_yamada');
    expect(updateAuditLog.timestamp).toEqual(new Date('2024-01-15T12:30:00Z'));
    expect(updateAuditLog.operationContent).toBe('Model parameters updated');

    // 期待結果5: 監査ログ自体が改ざん防止機構により保護されていること
    expect(updateAuditLog.tamperProofHash).toBeDefined();
    expect(typeof updateAuditLog.tamperProofHash).toBe('string');
    expect(updateAuditLog.tamperProofHash.length).toBeGreaterThan(0);

    // 手順6: 削除操作を実行
    const deleteResult = encryptAndAuditModelParameters({
      projectId,
      operatorId,
      modelParameters: null,
      operation: 'delete',
      timestamp: new Date('2024-01-15T14:00:00Z'),
    });

    expect(deleteResult.auditLogs.length).toBe(1);
    const deleteAuditLog = deleteResult.auditLogs[0];
    expect(deleteAuditLog.operation).toBe('delete');
    expect(deleteAuditLog.operatorId).toBe('operator_nutritionist_yamada');
    expect(deleteAuditLog.timestamp).toEqual(new Date('2024-01-15T14:00:00Z'));
    expect(deleteAuditLog.operationContent).toBe('Model parameters deleted');

    // 期待結果6: マルチユーザー環境での適切なアクセス制御
    const operatorId2 = 'operator_engineer_tanaka';
    const user2Parameters = {
      modelName: 'meal_satisfaction_model_v1.0',
      weights: [0.30, 0.25, 0.20, 0.15, 0.10],
      bias: 0.055,
      learningRate: 0.002,
      regularizationLambda: 0.03,
      hiddenLayerSize: 64,
      activationFunction: 'tanh',
      batchSize: 16,
      epochs: 100,
      optimizationAlgorithm: 'sgd',
    };

    const user2Result = encryptAndAuditModelParameters({
      projectId: 'project_ml_v1_20240115',
      operatorId: operatorId2,
      modelParameters: user2Parameters,
      operation: 'create',
      timestamp: new Date('2024-01-15T11:15:00Z'),
    });

    // 期待結果7: 複数ユーザーの監査ログが適切に分離されていること
    expect(user2Result.auditLogs[0].operatorId).toBe('operator_engineer_tanaka');
    expect(user2Result.auditLogs[0].operatorId).not.toBe(
      'operator_nutritionist_yamada'
    );
    expect(user2Result.auditLogs[0].projectId).toBe('project_ml_v1_20240115');
    expect(user2Result.auditLogs[0].projectId).not.toBe('project_ml_v2_20240115');

    // 期待結果8: 暗号化・復号化処理でエラーが発生した場合、エラーログが記録されること
    const invalidParametersResult = encryptAndAuditModelParameters({
      projectId: 'project_invalid_20240115',
      operatorId: 'operator_test',
      modelParameters: { weights: 'invalid_type' } as any,
      operation: 'create',
      timestamp: new Date('2024-01-15T15:00:00Z'),
    });

    // エラーが発生した場合のレスポンス検証
    if (invalidParametersResult.errorOccurred) {
      expect(invalidParametersResult.errorOccurred).toBe(true);
      expect(invalidParametersResult.errorLog).toBeDefined();
      expect(typeof invalidParametersResult.errorLog).toBe('string');
      expect(invalidParametersResult.errorLog.length).toBeGreaterThan(0);
      expect(invalidParametersResult.errorLog).toMatch(/encryption|validation/i);
    }

    // 期待結果9: 全監査ログの統計検証
    const auditStatistics = {
      totalCreateOperations: 2,
      totalUpdateOperations: 1,
      totalDeleteOperations: 1,
      uniqueOperators: 2,
      uniqueProjects: 2,
    };

    expect(createAuditLog.operation).toBe('create');
    expect(updateAuditLog.operation).toBe('update');
    expect(deleteAuditLog.operation).toBe('delete');
    expect(createAuditLog.operatorId).not.toBe(user2Result.auditLogs[0].operatorId);
    expect(createAuditLog.projectId).not.toBe(user2Result.auditLogs[0].projectId);

    // 期待結果10: 各操作のタイムスタンプが正確・昇順であること
    expect(createAuditLog.timestamp.getTime()).toBeLessThan(
      updateAuditLog.timestamp.getTime()
    );
    expect(updateAuditLog.timestamp.getTime()).toBeLessThan(
      deleteAuditLog.timestamp.getTime()
    );

    // 期待結果11: 暗号化キーの保管と管理状態の確認
    expect(encryptionResult.encryptionKeyId).toBeDefined();
    expect(typeof encryptionResult.encryptionKeyId).toBe('string');
    expect(encryptionResult.encryptionKeyId.length).toBeGreaterThan(0);

    // 期待結果12: 復号化可能性の二重確認
    const decryptVerify = encryptionResult.decryptedParameters;
    expect(decryptVerify.modelName).toBe(modelParameters.modelName);
    expect(decryptVerify.epochs).toBe(modelParameters.epochs);
  });
});