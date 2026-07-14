import { distributeRuleSpecification } from '../../src/logic/it-7-2-1';

describe('献立生成アルゴリズム改善前後の効果差を定量比較するダッシュボード機能', () => {
  // SCEN-823: [error] ルール仕様書配布・確認追跡機能 - 対象者リストが空である場合、配布が実行されずエラーが返却される
  test('対象者リストが空の場合、ルール仕様書配布がエラーを返す', () => {
    const ruleSpecificationId = 'rule-spec-001';
    const ruleSpecContent = {
      versionNumber: '2024-Q1-v1',
      seasonalPatterns: ['spring_vegetables', 'fresh_fish'],
      discountRateThreshold: 15,
      salePeriodDays: 7,
      createdAt: '2024-01-15T09:00:00Z',
      updatedAt: '2024-01-15T09:00:00Z',
    };
    const distributionTargetList = [];

    expect(() =>
      distributeRuleSpecification({
        ruleSpecificationId,
        ruleSpecContent,
        distributionTargetList,
      })
    ).toThrow(/対象者リスト/);
  });
});