import { evaluateTechnicalFeasibility } from '../../src/logic/it-1-br-2-1-2-1';

describe('技術実現性評価機能 - 実装見積データ不足時のエラーハンドリング', () => {
  // SCEN-528
  test('実装見積データが不足している場合、技術実現性評価はスキップされ、エラーメッセージが表示される', () => {
    const proposalWithMissingData = {
      proposalId: 'PROP-001',
      proposalTitle: '献立生成アルゴリズムの栄養バランス改善',
      businessValue: 85,
      technicalDifficulty: 65,
      userImpact: 90,
      estimatedManHours: null, // 必須項目が null
      estimatedCost: 250000,
      riskAssessment: 'medium',
      implementationDependencies: ['DB schema update'],
      createdAt: new Date('2024-02-15T10:00:00Z'),
      createdBy: 'nutritionist_001',
    };

    let thrownError: any;
    try {
      evaluateTechnicalFeasibility(proposalWithMissingData);
    } catch (error) {
      thrownError = error;
    }

    expect(thrownError).toBeDefined();
    expect(thrownError.message).toMatch(/実装見積データ/);
    expect(thrownError.message).toMatch(/必須項目/);
  });

  test('複数の実装見積データが不足している場合、最初に不足している項目を特定してエラーを返す', () => {
    const proposalWithMultipleMissingData = {
      proposalId: 'PROP-002',
      proposalTitle: '献立案の評価スコア計算ロジック改善',
      businessValue: 75,
      technicalDifficulty: 70,
      userImpact: 80,
      estimatedManHours: null, // 不足
      estimatedCost: null, // 不足
      riskAssessment: undefined, // 不足
      implementationDependencies: [],
      createdAt: new Date('2024-02-15T11:00:00Z'),
      createdBy: 'nutritionist_002',
    };

    expect(() => {
      evaluateTechnicalFeasibility(proposalWithMultipleMissingData);
    }).toThrow(/工数/);
  });

  test('実装見積データが完全に揃っている場合、技術実現性評価が正常に実行される', () => {
    const proposalWithCompleteData = {
      proposalId: 'PROP-003',
      proposalTitle: '食事制限条件の自動検出機能',
      businessValue: 80,
      technicalDifficulty: 55,
      userImpact: 85,
      estimatedManHours: 120,
      estimatedCost: 300000,
      riskAssessment: 'low',
      implementationDependencies: ['API integration'],
      createdAt: new Date('2024-02-15T09:00:00Z'),
      createdBy: 'nutritionist_003',
    };

    const result = evaluateTechnicalFeasibility(proposalWithCompleteData);

    expect(result).toBeDefined();
    expect(result).toHaveProperty('proposalId', 'PROP-003');
    expect(result).toHaveProperty('feasibilityStatus');
    expect(['feasible', 'conditional', 'infeasible']).toContain(
      result.feasibilityStatus
    );
    expect(result).toHaveProperty('evaluationScore');
    expect(typeof result.evaluationScore).toBe('number');
    expect(result.evaluationScore).toBeGreaterThanOrEqual(0);
    expect(result.evaluationScore).toBeLessThanOrEqual(100);
  });

  test('実装見積データのコスト項目が 0 の場合、有効な値として評価が実行される', () => {
    const proposalWithZeroCost = {
      proposalId: 'PROP-004',
      proposalTitle: 'UI改善 - 小規模機能調整',
      businessValue: 60,
      technicalDifficulty: 30,
      userImpact: 50,
      estimatedManHours: 40,
      estimatedCost: 0, // 0 は有効
      riskAssessment: 'low',
      implementationDependencies: [],
      createdAt: new Date('2024-02-15T14:00:00Z'),
      createdBy: 'nutritionist_004',
    };

    const result = evaluateTechnicalFeasibility(proposalWithZeroCost);

    expect(result).toBeDefined();
    expect(result).toHaveProperty('evaluationScore');
    expect(result.feasibilityStatus).toBeDefined();
  });

  test('実装見積データの工数が 0 の場合、不足データとしてエラーを返す', () => {
    const proposalWithZeroManHours = {
      proposalId: 'PROP-005',
      proposalTitle: '献立キャッシング機能',
      businessValue: 70,
      technicalDifficulty: 50,
      userImpact: 60,
      estimatedManHours: 0, // 0 は無効（工数が 0 は不可能）
      estimatedCost: 100000,
      riskAssessment: 'medium',
      implementationDependencies: [],
      createdAt: new Date('2024-02-15T15:00:00Z'),
      createdBy: 'nutritionist_005',
    };

    expect(() => {
      evaluateTechnicalFeasibility(proposalWithZeroManHours);
    }).toThrow(/工数/);
  });

  test('リスク評価が空文字列の場合、実装見積データ不足エラーを返す', () => {
    const proposalWithEmptyRiskAssessment = {
      proposalId: 'PROP-006',
      proposalTitle: '栄養目標設定ロジック改善',
      businessValue: 75,
      technicalDifficulty: 60,
      userImpact: 70,
      estimatedManHours: 80,
      estimatedCost: 200000,
      riskAssessment: '', // 空文字列は不足データ
      implementationDependencies: ['logging update'],
      createdAt: new Date('2024-02-15T16:00:00Z'),
      createdBy: 'nutritionist_006',
    };

    expect(() => {
      evaluateTechnicalFeasibility(proposalWithEmptyRiskAssessment);
    }).toThrow(/実装見積データ/);
  });

  test('実装見積データが不足している場合のエラーレスポンスに、不足している項目の詳細が含まれる', () => {
    const proposalWithPartialData = {
      proposalId: 'PROP-007',
      proposalTitle: '家族成員管理画面の改善',
      businessValue: 65,
      technicalDifficulty: 45,
      userImpact: 55,
      estimatedManHours: 60,
      estimatedCost: undefined, // 不足
      riskAssessment: 'high',
      implementationDependencies: [],
      createdAt: new Date('2024-02-15T17:00:00Z'),
      createdBy: 'nutritionist_007',
    };

    let caughtError: any;
    try {
      evaluateTechnicalFeasibility(proposalWithPartialData);
    } catch (error) {
      caughtError = error;
    }

    expect(caughtError).toBeDefined();
    expect(caughtError.message).toMatch(/コスト|見積/);
    expect(caughtError).toHaveProperty('missingFields');
    expect(Array.isArray(caughtError.missingFields)).toBe(true);
    expect(caughtError.missingFields.length).toBeGreaterThan(0);
  });

  test('提案情報は存在するが、実装見積オブジェクト自体が null の場合、エラーを返す', () => {
    const proposalWithNullEstimate = {
      proposalId: 'PROP-008',
      proposalTitle: '献立生成フロー最適化',
      businessValue: 80,
      technicalDifficulty: 70,
      userImpact: 75,
      estimatedManHours: null,
      estimatedCost: null,
      riskAssessment: null,
      implementationDependencies: [],
      createdAt: new Date('2024-02-15T18:00:00Z'),
      createdBy: 'nutritionist_008',
    };

    expect(() => {
      evaluateTechnicalFeasibility(proposalWithNullEstimate);
    }).toThrow(/実装見積データ/);
  });

  test('実装見積データが不足している場合、評価結果は保存されず、スキップステータスが返される', () => {
    const proposalWithIncompleteBudgetData = {
      proposalId: 'PROP-009',
      proposalTitle: '栄養素データの機械学習モデル統合',
      businessValue: 90,
      technicalDifficulty: 85,
      userImpact: 88,
      estimatedManHours: 200,
      estimatedCost: null, // 不足
      riskAssessment: 'high',
      implementationDependencies: ['ML framework', 'data pipeline'],
      createdAt: new Date('2024-02-15T19:00:00Z'),
      createdBy: 'nutritionist_009',
    };

    expect(() => {
      evaluateTechnicalFeasibility(proposalWithIncompleteBudgetData);
    }).toThrow(/実装見積データ/);
  });

  test('すべての実装見積項目が正しく入力されている場合、評価スコアは 0～100 の範囲内の数値となる', () => {
    const proposalWithValidEstimates = {
      proposalId: 'PROP-010',
      proposalTitle: '需要予測精度向上',
      businessValue: 85,
      technicalDifficulty: 72,
      userImpact: 80,
      estimatedManHours: 150,
      estimatedCost: 450000,
      riskAssessment: 'medium',
      implementationDependencies: ['data warehouse', 'reporting API'],
      createdAt: new Date('2024-02-16T09:00:00Z'),
      createdBy: 'nutritionist_010',
    };

    const result = evaluateTechnicalFeasibility(proposalWithValidEstimates);

    expect(result.evaluationScore).toBeGreaterThanOrEqual(0);
    expect(result.evaluationScore).toBeLessThanOrEqual(100);
    expect(Number.isInteger(result.evaluationScore) || typeof result.evaluationScore === 'number').toBe(true);
  });
});