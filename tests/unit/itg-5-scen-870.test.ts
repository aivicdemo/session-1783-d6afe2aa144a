import { generateImprovementProposalReport } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-870: [error] 改善提案レポート生成機能 - 必須項目のいずれかが欠損している場合にレポート生成エラーが返却される
  test('should throw error when algorithm name is missing', () => {
    const input = {
      algorithmName: '',
      improvementContent: '栄養バランス評価ロジックの改善',
      effectMeasurementResult: {
        successRateBefore: 72.5,
        successRateAfter: 78.3,
        satisfactionScoreBefore: 3.8,
        satisfactionScoreAfter: 4.2,
        cookingTimeReductionDegree: 12.5
      },
      implementationDifficulty: 'medium',
      estimatedImplementationDays: 8,
      kpiContribution: 'high',
      userImpactLevel: 'high',
      proposalDate: '2024-01-15T10:00:00Z',
      proposedBy: 'nutritionist-001'
    };
    expect(() => generateImprovementProposalReport(input)).toThrow(/アルゴリズム名/);
  });

  test('should throw error when improvement content is missing', () => {
    const input = {
      algorithmName: 'Family Nutrition Balance Algorithm v2.1',
      improvementContent: '',
      effectMeasurementResult: {
        successRateBefore: 72.5,
        successRateAfter: 78.3,
        satisfactionScoreBefore: 3.8,
        satisfactionScoreAfter: 4.2,
        cookingTimeReductionDegree: 12.5
      },
      implementationDifficulty: 'medium',
      estimatedImplementationDays: 8,
      kpiContribution: 'high',
      userImpactLevel: 'high',
      proposalDate: '2024-01-15T10:00:00Z',
      proposedBy: 'nutritionist-001'
    };
    expect(() => generateImprovementProposalReport(input)).toThrow(/改善内容/);
  });

  test('should throw error when effect measurement result is missing', () => {
    const input = {
      algorithmName: 'Family Nutrition Balance Algorithm v2.1',
      improvementContent: '栄養バランス評価ロジックの改善',
      effectMeasurementResult: null,
      implementationDifficulty: 'medium',
      estimatedImplementationDays: 8,
      kpiContribution: 'high',
      userImpactLevel: 'high',
      proposalDate: '2024-01-15T10:00:00Z',
      proposedBy: 'nutritionist-001'
    };
    expect(() => generateImprovementProposalReport(input)).toThrow(/効果測定結果/);
  });

  test('should throw error when implementation difficulty is missing', () => {
    const input = {
      algorithmName: 'Family Nutrition Balance Algorithm v2.1',
      improvementContent: '栄養バランス評価ロジックの改善',
      effectMeasurementResult: {
        successRateBefore: 72.5,
        successRateAfter: 78.3,
        satisfactionScoreBefore: 3.8,
        satisfactionScoreAfter: 4.2,
        cookingTimeReductionDegree: 12.5
      },
      implementationDifficulty: '',
      estimatedImplementationDays: 8,
      kpiContribution: 'high',
      userImpactLevel: 'high',
      proposalDate: '2024-01-15T10:00:00Z',
      proposedBy: 'nutritionist-001'
    };
    expect(() => generateImprovementProposalReport(input)).toThrow(/実装難度/);
  });

  test('should throw error when proposed by is missing', () => {
    const input = {
      algorithmName: 'Family Nutrition Balance Algorithm v2.1',
      improvementContent: '栄養バランス評価ロジックの改善',
      effectMeasurementResult: {
        successRateBefore: 72.5,
        successRateAfter: 78.3,
        satisfactionScoreBefore: 3.8,
        satisfactionScoreAfter: 4.2,
        cookingTimeReductionDegree: 12.5
      },
      implementationDifficulty: 'medium',
      estimatedImplementationDays: 8,
      kpiContribution: 'high',
      userImpactLevel: 'high',
      proposalDate: '2024-01-15T10:00:00Z',
      proposedBy: ''
    };
    expect(() => generateImprovementProposalReport(input)).toThrow(/提案者/);
  });

  test('should generate report successfully when all required fields are present', () => {
    const input = {
      algorithmName: 'Family Nutrition Balance Algorithm v2.1',
      improvementContent: '栄養バランス評価ロジックの改善',
      effectMeasurementResult: {
        successRateBefore: 72.5,
        successRateAfter: 78.3,
        satisfactionScoreBefore: 3.8,
        satisfactionScoreAfter: 4.2,
        cookingTimeReductionDegree: 12.5
      },
      implementationDifficulty: 'medium',
      estimatedImplementationDays: 8,
      kpiContribution: 'high',
      userImpactLevel: 'high',
      proposalDate: '2024-01-15T10:00:00Z',
      proposedBy: 'nutritionist-001'
    };
    const result = generateImprovementProposalReport(input);
    expect(result).toHaveProperty('reportId');
    expect(result).toHaveProperty('generatedAt');
    expect(result.algorithmName).toBe('Family Nutrition Balance Algorithm v2.1');
    expect(result.improvementContent).toBe('栄養バランス評価ロジックの改善');
    expect(result.successRateImprovement).toBe(5.8);
    expect(result.satisfactionScoreImprovement).toBe(0.4);
    expect(result.effectMeasurementResult).toEqual({
      successRateBefore: 72.5,
      successRateAfter: 78.3,
      satisfactionScoreBefore: 3.8,
      satisfactionScoreAfter: 4.2,
      cookingTimeReductionDegree: 12.5
    });
    expect(result.implementationDifficulty).toBe('medium');
    expect(result.status).toBe('generated');
  });
});