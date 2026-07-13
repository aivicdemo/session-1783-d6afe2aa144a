import { generateNutritionImprovementProposal } from '../../src/logic/it-1-br-2-1-2-1';

describe('栄養士からの改善提案を優先度付けして管理し、開発チームに定期通知する機能', () => {
  // SCEN-526: [error] 改善提案書生成機能 - KPI寄与度が負数の場合、提案書生成がエラーで中止される
  test('KPI寄与度に負数を入力した場合、エラーメッセージが表示され提案書生成が中止される', () => {
    const input = {
      analysisStartDate: '2024-01-01',
      analysisEndDate: '2024-01-31',
      analysisScope: '全栄養項目',
      businessValue: 8,
      technicalDifficulty: 5,
      userImpactScore: 7,
      kpiContributionScore: -5.5,
      implementationEstimate: 40,
      expectedEffect: 'タンパク質摂取量向上により家族満足度が15%向上',
      submittedBy: 'nutritionist_001',
      submittedAt: '2024-01-31T15:30:00Z'
    };

    expect(() => generateNutritionImprovementProposal(input)).toThrow(/KPI寄与度/);
  });

  // 境界値テスト: KPI寄与度が0の場合は成功する
  test('KPI寄与度が0の場合、提案書が正常に生成される', () => {
    const input = {
      analysisStartDate: '2024-01-01',
      analysisEndDate: '2024-01-31',
      analysisScope: '全栄養項目',
      businessValue: 8,
      technicalDifficulty: 5,
      userImpactScore: 7,
      kpiContributionScore: 0,
      implementationEstimate: 40,
      expectedEffect: 'タンパク質摂取量向上により家族満足度が15%向上',
      submittedBy: 'nutritionist_001',
      submittedAt: '2024-01-31T15:30:00Z'
    };

    const result = generateNutritionImprovementProposal(input);
    
    expect(result).toBeDefined();
    expect(result.proposalId).toBeDefined();
    expect(result.kpiContributionScore).toBe(0);
    expect(result.status).toBe('completed');
  });

  // 境界値テスト: KPI寄与度が正の小数値の場合は成功する
  test('KPI寄与度が正の小数値の場合、提案書が正常に生成される', () => {
    const input = {
      analysisStartDate: '2024-02-01',
      analysisEndDate: '2024-02-29',
      analysisScope: '栄養バランス改善',
      businessValue: 9,
      technicalDifficulty: 4,
      userImpactScore: 8,
      kpiContributionScore: 12.5,
      implementationEstimate: 35,
      expectedEffect: 'ビタミンD摂取量が20%向上し骨健康スコアが改善',
      submittedBy: 'nutritionist_002',
      submittedAt: '2024-02-28T14:45:00Z'
    };

    const result = generateNutritionImprovementProposal(input);
    
    expect(result).toBeDefined();
    expect(result.proposalId).toBeDefined();
    expect(result.kpiContributionScore).toBe(12.5);
    expect(result.status).toBe('completed');
    expect(result.submittedAt).toBe('2024-02-28T14:45:00Z');
  });

  // 成공パス: 正常な提案書生成
  test('すべての必須項目が適切に入力された場合、提案書が正常に生成される', () => {
    const input = {
      analysisStartDate: '2024-01-01',
      analysisEndDate: '2024-01-31',
      analysisScope: '全栄養項目',
      businessValue: 8,
      technicalDifficulty: 5,
      userImpactScore: 7,
      kpiContributionScore: 10.0,
      implementationEstimate: 40,
      expectedEffect: 'タンパク質摂取量向上により家族満足度が15%向上',
      submittedBy: 'nutritionist_001',
      submittedAt: '2024-01-31T15:30:00Z'
    };

    const result = generateNutritionImprovementProposal(input);
    
    expect(result).toBeDefined();
    expect(result.proposalId).toBeDefined();
    expect(result.analysisStartDate).toBe('2024-01-01');
    expect(result.analysisEndDate).toBe('2024-01-31');
    expect(result.analysisScope).toBe('全栄養項目');
    expect(result.businessValue).toBe(8);
    expect(result.technicalDifficulty).toBe(5);
    expect(result.userImpactScore).toBe(7);
    expect(result.kpiContributionScore).toBe(10.0);
    expect(result.implementationEstimate).toBe(40);
    expect(result.expectedEffect).toBe('タンパク質摂取量向上により家族満足度が15%向上');
    expect(result.submittedBy).toBe('nutritionist_001');
    expect(result.submittedAt).toBe('2024-01-31T15:30:00Z');
    expect(result.status).toBe('completed');
  });

  // エラーテスト: 複数の負数値
  test('KPI寄与度が大きな負数の場合、エラーメッセージが表示される', () => {
    const input = {
      analysisStartDate: '2024-01-01',
      analysisEndDate: '2024-01-31',
      analysisScope: '全栄養項目',
      businessValue: 8,
      technicalDifficulty: 5,
      userImpactScore: 7,
      kpiContributionScore: -100.5,
      implementationEstimate: 40,
      expectedEffect: 'テスト',
      submittedBy: 'nutritionist_001',
      submittedAt: '2024-01-31T15:30:00Z'
    };

    expect(() => generateNutritionImprovementProposal(input)).toThrow(/KPI寄与度/);
  });

  // 成功パス: 大きな正の値
  test('KPI寄与度が大きな正の値の場合、提案書が正常に生成される', () => {
    const input = {
      analysisStartDate: '2024-03-01',
      analysisEndDate: '2024-03-31',
      analysisScope: 'カルシウム摂取量改善',
      businessValue: 10,
      technicalDifficulty: 3,
      userImpactScore: 9,
      kpiContributionScore: 95.8,
      implementationEstimate: 25,
      expectedEffect: 'カルシウム摂取量が30%向上',
      submittedBy: 'nutritionist_003',
      submittedAt: '2024-03-31T16:00:00Z'
    };

    const result = generateNutritionImprovementProposal(input);
    
    expect(result).toBeDefined();
    expect(result.kpiContributionScore).toBe(95.8);
    expect(result.status).toBe('completed');
  });
});