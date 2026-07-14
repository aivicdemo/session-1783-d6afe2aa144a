import { evaluateTechnicalFeasibility } from '../../src/logic/it-7-2-1';

describe('技術実現性評価機能', () => {
  // SCEN-722
  test('改善提案書に対して技術実現性を評価し、「実装可能」「条件付き実装」「実装不可」のいずれかに正確に分類される', () => {
    // 低複雑度の改善提案書
    const lowComplexityProposal = {
      proposalId: 'PROP-001',
      title: 'ユーザーインターフェース配色変更',
      description: '献立画面の背景色を白からクリーム色に変更',
      technicalComplexity: 1,
      estimatedWorkHours: 4,
      requiredResources: ['フロントエンド'],
      dependenciesCount: 0,
      existingCompatibilityImpact: 'none',
      estimatedRiskLevel: 1,
    };

    // 中複雑度の改善提案書
    const mediumComplexityProposal = {
      proposalId: 'PROP-002',
      title: '献立生成アルゴリズムに気象要因を追加',
      description: '天候データと需要予測モデルを統合',
      technicalComplexity: 5,
      estimatedWorkHours: 80,
      requiredResources: ['バックエンド', 'データ分析'],
      dependenciesCount: 2,
      existingCompatibilityImpact: 'partial',
      estimatedRiskLevel: 5,
    };

    // 高複雑度の改善提案書
    const highComplexityProposal = {
      proposalId: 'PROP-003',
      title: '栄養管理システムの完全リアーキテクチャ',
      description: 'モノリシックから完全マイクロサービス化へ移行',
      technicalComplexity: 10,
      estimatedWorkHours: 480,
      requiredResources: ['バックエンド', 'インフラ', 'QA', 'DevOps'],
      dependenciesCount: 8,
      existingCompatibilityImpact: 'critical',
      estimatedRiskLevel: 9,
    };

    // 低複雑度提案書の技術実現性評価
    const lowComplexityResult = evaluateTechnicalFeasibility(lowComplexityProposal);
    expect(['実装可能', '条件付き実装', '実装不可']).toContain(lowComplexityResult.feasibilityStatus);
    expect(lowComplexityResult.technicalFeasibilityScore).toBe(92);
    expect(lowComplexityResult.implementationRecommendation).toBe('実装可能');
    expect(lowComplexityResult.estimatedImplementationDaysFromWorkHours).toBe(1);
    expect(lowComplexityResult.resourceAvailabilityRating).toBe('十分');
    expect(lowComplexityResult.compatibilityRiskRating).toBe('低');

    // 中複雑度提案書の技術実現性評価
    const mediumComplexityResult = evaluateTechnicalFeasibility(mediumComplexityProposal);
    expect(['実装可能', '条件付き実装', '実装不可']).toContain(mediumComplexityResult.feasibilityStatus);
    expect(mediumComplexityResult.technicalFeasibilityScore).toBe(62);
    expect(mediumComplexityResult.implementationRecommendation).toBe('条件付き実装');
    expect(mediumComplexityResult.estimatedImplementationDaysFromWorkHours).toBe(10);
    expect(mediumComplexityResult.resourceAvailabilityRating).toBe('制限あり');
    expect(mediumComplexityResult.compatibilityRiskRating).toBe('中');

    // 高複雑度提案書の技術実現性評価
    const highComplexityResult = evaluateTechnicalFeasibility(highComplexityProposal);
    expect(['実装可能', '条件付き実装', '実装不可']).toContain(highComplexityResult.feasibilityStatus);
    expect(highComplexityResult.technicalFeasibilityScore).toBe(28);
    expect(highComplexityResult.implementationRecommendation).toBe('実装不可');
    expect(highComplexityResult.estimatedImplementationDaysFromWorkHours).toBe(60);
    expect(highComplexityResult.resourceAvailabilityRating).toBe('不足');
    expect(highComplexityResult.compatibilityRiskRating).toBe('高');

    // 分類結果の一貫性検証
    expect(lowComplexityResult.feasibilityStatus).toBe('実装可能');
    expect(mediumComplexityResult.feasibilityStatus).toBe('条件付き実装');
    expect(highComplexityResult.feasibilityStatus).toBe('実装不可');

    // 技術的複雑度とスコアの逆相関を検証
    expect(lowComplexityResult.technicalFeasibilityScore).toBeGreaterThan(mediumComplexityResult.technicalFeasibilityScore);
    expect(mediumComplexityResult.technicalFeasibilityScore).toBeGreaterThan(highComplexityResult.technicalFeasibilityScore);

    // リソース必要度とリソース利用可能性の逆相関を検証
    expect(lowComplexityResult.resourceAvailabilityRating).toBe('十分');
    expect(mediumComplexityResult.resourceAvailabilityRating).toBe('制限あり');
    expect(highComplexityResult.resourceAvailabilityRating).toBe('不足');

    // 既存システムとの互換性への影響が評価結果に反映されていることを検証
    expect(lowComplexityResult.compatibilityRiskRating).toBe('低');
    expect(mediumComplexityResult.compatibilityRiskRating).toBe('中');
    expect(highComplexityResult.compatibilityRiskRating).toBe('高');
  });
});