import { createNutritionVerificationReport } from '../../src/logic/it-7-2-1';

describe('献立生成アルゴリズムの成功率・調理時間短縮度・ユーザー満足度スコアの週次自動集計ダッシュボード', () => {
  // SCEN-695: [error] 検証結果レポート作成・承認判定 - レポート作成に必要なデータが不足している場合、エラーを返す
  test('should return 400 Bad Request with error message when required fields are missing from verification report creation payload', async () => {
    // 必須項目が欠落したペイロードを準備（algorithmVersionId が欠落）
    const incompletePayload = {
      verificationDate: '2024-02-15T10:00:00Z',
      verificationResults: {
        generationSuccessRate: 87.5,
        cookingTimeReduction: 15.3,
        userSatisfactionScore: 4.2,
      },
      // algorithmVersionId は欠落
    };

    try {
      await createNutritionVerificationReport(incompletePayload);
      fail('Expected error to be thrown');
    } catch (error: any) {
      expect(error.statusCode).toBe(400);
      expect(error.message).toMatch(/algorithmVersionId/);
    }
  });

  test('should return 400 Bad Request when verificationDate is missing', async () => {
    const incompletePayload = {
      algorithmVersionId: 'algo-v2-001',
      // verificationDate は欠落
      verificationResults: {
        generationSuccessRate: 87.5,
        cookingTimeReduction: 15.3,
        userSatisfactionScore: 4.2,
      },
    };

    try {
      await createNutritionVerificationReport(incompletePayload);
      fail('Expected error to be thrown');
    } catch (error: any) {
      expect(error.statusCode).toBe(400);
      expect(error.message).toMatch(/verificationDate/);
    }
  });

  test('should return 400 Bad Request when verificationResults is missing', async () => {
    const incompletePayload = {
      algorithmVersionId: 'algo-v2-001',
      verificationDate: '2024-02-15T10:00:00Z',
      // verificationResults は欠落
    };

    try {
      await createNutritionVerificationReport(incompletePayload);
      fail('Expected error to be thrown');
    } catch (error: any) {
      expect(error.statusCode).toBe(400);
      expect(error.message).toMatch(/verificationResults/);
    }
  });

  test('should return 400 Bad Request when generationSuccessRate is missing from verificationResults', async () => {
    const incompletePayload = {
      algorithmVersionId: 'algo-v2-001',
      verificationDate: '2024-02-15T10:00:00Z',
      verificationResults: {
        // generationSuccessRate は欠落
        cookingTimeReduction: 15.3,
        userSatisfactionScore: 4.2,
      },
    };

    try {
      await createNutritionVerificationReport(incompletePayload);
      fail('Expected error to be thrown');
    } catch (error: any) {
      expect(error.statusCode).toBe(400);
      expect(error.message).toMatch(/generationSuccessRate/);
    }
  });

  test('should return 400 Bad Request when cookingTimeReduction is missing from verificationResults', async () => {
    const incompletePayload = {
      algorithmVersionId: 'algo-v2-001',
      verificationDate: '2024-02-15T10:00:00Z',
      verificationResults: {
        generationSuccessRate: 87.5,
        // cookingTimeReduction は欠落
        userSatisfactionScore: 4.2,
      },
    };

    try {
      await createNutritionVerificationReport(incompletePayload);
      fail('Expected error to be thrown');
    } catch (error: any) {
      expect(error.statusCode).toBe(400);
      expect(error.message).toMatch(/cookingTimeReduction/);
    }
  });

  test('should return 400 Bad Request when userSatisfactionScore is missing from verificationResults', async () => {
    const incompletePayload = {
      algorithmVersionId: 'algo-v2-001',
      verificationDate: '2024-02-15T10:00:00Z',
      verificationResults: {
        generationSuccessRate: 87.5,
        cookingTimeReduction: 15.3,
        // userSatisfactionScore は欠落
      },
    };

    try {
      await createNutritionVerificationReport(incompletePayload);
      fail('Expected error to be thrown');
    } catch (error: any) {
      expect(error.statusCode).toBe(400);
      expect(error.message).toMatch(/userSatisfactionScore/);
    }
  });

  test('should successfully create verification report when all required fields are provided', async () => {
    const completePayload = {
      algorithmVersionId: 'algo-v2-001',
      verificationDate: '2024-02-15T10:00:00Z',
      verificationResults: {
        generationSuccessRate: 87.5,
        cookingTimeReduction: 15.3,
        userSatisfactionScore: 4.2,
      },
      improvementMetrics: {
        priorWeekSuccessRate: 82.0,
        priorWeekCookingTimeReduction: 12.5,
        priorWeekUserSatisfactionScore: 3.8,
      },
    };

    const result = await createNutritionVerificationReport(completePayload);

    expect(result).toBeDefined();
    expect(result.reportId).toBeDefined();
    expect(result.algorithmVersionId).toBe('algo-v2-001');
    expect(result.verificationDate).toBe('2024-02-15T10:00:00Z');
    expect(result.verificationResults.generationSuccessRate).toBe(87.5);
    expect(result.verificationResults.cookingTimeReduction).toBe(15.3);
    expect(result.verificationResults.userSatisfactionScore).toBe(4.2);
    expect(result.improvementDelta.successRateImprovement).toBe(5.5);
    expect(result.improvementDelta.cookingTimeReductionImprovement).toBe(2.8);
    expect(result.improvementDelta.userSatisfactionScoreImprovement).toBe(0.4);
    expect(result.status).toBe('created');
  });
});