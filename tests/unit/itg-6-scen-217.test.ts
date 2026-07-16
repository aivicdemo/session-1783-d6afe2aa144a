import { generateImprovementProposal } from '../../src/logic/it-8-1-1-1';

describe('ユーザーインタビュー記録と利用ログから食材制限・調理時間制限・予算制約の優先度マトリクスを生成', () => {
  // SCEN-217: [edge] 改善提案書生成機能 - KPI寄与度が複数メトリクスにまたがる場合、統合されたKPI寄与度が正確に算出される
  test('複数メトリクスにまたがるKPI寄与度が統合され、合計が100%となり、各メトリクスの寄与度が正確に算出・反映される', () => {
    // テストデータの準備：複数のメトリクスに関連するKPI
    const improvementTask = {
      taskId: 'TASK-2024-001',
      title: '食材制限対応ロジック改善',
      description: '専業主夫層の食材制限検出精度を向上',
      businessValue: 85,
      technicalDifficulty: 60,
      userImpactScore: 72,
      metricsContribution: [
        {
          metricName: 'conversionRate',
          metricLabel: 'コンバージョン率',
          contributionPercentage: 30,
        },
        {
          metricName: 'userSatisfaction',
          metricLabel: 'ユーザー満足度',
          contributionPercentage: 45,
        },
        {
          metricName: 'retentionRate',
          metricLabel: 'リテンション率',
          contributionPercentage: 25,
        },
      ],
      estimatedEffort: 40,
      expectedEffectDescription: '献立生成時の食材制限エラー率を5%削減',
      implementationTimelineWeeks: 3,
    };

    // 改善提案書生成機能を実行
    const proposal = generateImprovementProposal(improvementTask);

    // 各メトリクスの寄与度値が正確に抽出されているか確認
    expect(proposal.metricsContribution).toBeDefined();
    expect(proposal.metricsContribution).toHaveLength(3);
    expect(proposal.metricsContribution[0]).toEqual({
      metricName: 'conversionRate',
      metricLabel: 'コンバージョン率',
      contributionPercentage: 30,
    });
    expect(proposal.metricsContribution[1]).toEqual({
      metricName: 'userSatisfaction',
      metricLabel: 'ユーザー満足度',
      contributionPercentage: 45,
    });
    expect(proposal.metricsContribution[2]).toEqual({
      metricName: 'retentionRate',
      metricLabel: 'リテンション率',
      contributionPercentage: 25,
    });

    // 統合されたKPI寄与度の合計値を検証（期待値：100%）
    const totalKpiContribution = proposal.metricsContribution.reduce(
      (sum, metric) => sum + metric.contributionPercentage,
      0
    );
    expect(totalKpiContribution).toBe(100);

    // 統合KPI寄与度フィールドが正確に算出されているか確認
    expect(proposal.integratedKpiContribution).toBe(100);

    // 各メトリクスの寄与度が改善提案書に正確に反映されているか確認
    expect(proposal.proposalContent).toContain('コンバージョン率: 30%');
    expect(proposal.proposalContent).toContain('ユーザー満足度: 45%');
    expect(proposal.proposalContent).toContain('リテンション率: 25%');

    // 統合KPI寄与度が改善提案書に記載されているか確認
    expect(proposal.proposalContent).toContain('統合KPI寄与度: 100%');

    // 生成された改善提案書の構造を検証
    expect(proposal).toHaveProperty('taskId');
    expect(proposal).toHaveProperty('title');
    expect(proposal).toHaveProperty('priorityScore');
    expect(proposal).toHaveProperty('metricsContribution');
    expect(proposal).toHaveProperty('integratedKpiContribution');
    expect(proposal).toHaveProperty('proposalContent');
    expect(proposal).toHaveProperty('generatedAt');

    // 優先度スコアが正確に算出されているか検証
    const expectedPriorityScore = Math.round(
      (improvementTask.businessValue * 0.4 +
        (100 - improvementTask.technicalDifficulty) * 0.3 +
        improvementTask.userImpactScore * 0.3) /
        10
    );
    expect(proposal.priorityScore).toBe(expectedPriorityScore);

    // タイムスタンプが有効であるか確認
    const generatedDate = new Date(proposal.generatedAt);
    expect(generatedDate instanceof Date).toBe(true);
    expect(generatedDate.getTime()).toBeLessThanOrEqual(Date.now());
  });
});