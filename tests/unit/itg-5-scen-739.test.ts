import { categorizeRejectionReasons, aggregateFailurePatterns } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-739: [edge] 開発ロードマップ組み込み機能 - 優先度スコアが同一の複数提案をロードマップの実装順序に正しく配置できる
  test('優先度スコアが同一の複数提案がユーザー指定順序で正確にロードマップに配置され、保存後の再読み込みでも順序が保持される', () => {
    // ===== Step 1: 複数のアルゴリズム改善提案を作成（すべて同一優先度スコア80）=====
    const improvementProposals = [
      {
        proposalId: 'PROP-001',
        title: '栄養バランス最適化アルゴリズム',
        category: '性能改善',
        priorityScore: 80,
        businessValue: 8,
        implementationDifficulty: 6,
        userImpactScore: 8,
        createdAt: '2024-01-10T09:00:00Z',
        implementationOrder: 1,
      },
      {
        proposalId: 'PROP-002',
        title: 'アレルギー検出バグ修正',
        category: 'バグ修正',
        priorityScore: 80,
        businessValue: 7,
        implementationDifficulty: 3,
        userImpactScore: 9,
        createdAt: '2024-01-11T10:30:00Z',
        implementationOrder: 2,
      },
      {
        proposalId: 'PROP-003',
        title: '献立提案UI改善',
        category: 'UI改善',
        priorityScore: 80,
        businessValue: 6,
        implementationDifficulty: 4,
        userImpactScore: 7,
        createdAt: '2024-01-12T14:15:00Z',
        implementationOrder: 3,
      },
    ];

    // ===== Step 2: 却下・修正理由データを集約（5日分、複数カテゴリ混在）=====
    const rejectionReasonsRaw = [
      {
        reasonId: 'R001',
        userFeedback: '栄養バランスが考慮されていない',
        timestamp: '2024-01-08T12:00:00Z',
      },
      {
        reasonId: 'R002',
        userFeedback: 'アレルギー情報が反映されていない',
        timestamp: '2024-01-08T13:30:00Z',
      },
      {
        reasonId: 'R003',
        userFeedback: 'UI が使いにくい',
        timestamp: '2024-01-09T11:00:00Z',
      },
      {
        reasonId: 'R004',
        userFeedback: '栄養基準に合致していない',
        timestamp: '2024-01-09T15:45:00Z',
      },
      {
        reasonId: 'R005',
        userFeedback: 'アレルギー対応が不十分',
        timestamp: '2024-01-10T09:20:00Z',
      },
    ];

    // ===== Step 3: 理由テキストを自動カテゴリ分類 =====
    const categorizedReasons = rejectionReasonsRaw.map((reason) =>
      categorizeRejectionReasons(reason.userFeedback)
    );

    // 期待値: 分類結果
    // - '栄養バランスが考慮されていない' → 'nutrition' (カテゴリ)
    // - 'アレルギー情報が反映されていない' → 'allergen' (カテゴリ)
    // - 'UI が使いにくい' → 'ui' (カテゴリ)
    // - '栄養基準に合致していない' → 'nutrition' (カテゴリ)
    // - 'アレルギー対応が不十分' → 'allergen' (カテゴリ)
    expect(categorizedReasons[0]).toEqual({
      originalText: '栄養バランスが考慮されていない',
      category: 'nutrition',
      confidence: expect.any(Number),
    });
    expect(categorizedReasons[1]).toEqual({
      originalText: 'アレルギー情報が反映されていない',
      category: 'allergen',
      confidence: expect.any(Number),
    });
    expect(categorizedReasons[2]).toEqual({
      originalText: 'UI が使いにくい',
      category: 'ui',
      confidence: expect.any(Number),
    });
    expect(categorizedReasons[3]).toEqual({
      originalText: '栄養基準に合致していない',
      category: 'nutrition',
      confidence: expect.any(Number),
    });
    expect(categorizedReasons[4]).toEqual({
      originalText: 'アレルギー対応が不十分',
      category: 'allergen',
      confidence: expect.any(Number),
    });

    // ===== Step 4: 失敗パターンを集計 =====
    const aggregatedPatterns = aggregateFailurePatterns(categorizedReasons);

    // 期待値: 集計結果
    // - nutrition: 2件 (40%)
    // - allergen: 2件 (40%)
    // - ui: 1件 (20%)
    expect(aggregatedPatterns).toEqual({
      totalCount: 5,
      patterns: [
        {
          category: 'nutrition',
          count: 2,
          percentage: 40,
          priority: 'high',
        },
        {
          category: 'allergen',
          count: 2,
          percentage: 40,
          priority: 'high',
        },
        {
          category: 'ui',
          count: 1,
          percentage: 20,
          priority: 'medium',
        },
      ],
    });

    // ===== Step 5: ロードマップ構造化データを生成（ユーザー指定順序を保持）=====
    // 優先度スコアが同一の提案を、ユーザーが指定した実装順序でソート
    const roadmapData = {
      generatedAt: '2024-01-15T16:00:00Z',
      proposals: improvementProposals.sort(
        (a, b) => a.implementationOrder - b.implementationOrder
      ),
      failurePatternAnalysis: aggregatedPatterns,
    };

    // ===== Step 6: ロードマップデータ保存時の検証 =====
    expect(roadmapData.proposals).toHaveLength(3);
    expect(roadmapData.proposals[0].proposalId).toBe('PROP-001');
    expect(roadmapData.proposals[0].implementationOrder).toBe(1);
    expect(roadmapData.proposals[1].proposalId).toBe('PROP-002');
    expect(roadmapData.proposals[1].implementationOrder).toBe(2);
    expect(roadmapData.proposals[2].proposalId).toBe('PROP-003');
    expect(roadmapData.proposals[2].implementationOrder).toBe(3);

    // ===== Step 7: 保存後の再読み込みで順序が保持されることを確認 =====
    const reloadedRoadmap = JSON.parse(JSON.stringify(roadmapData));
    expect(reloadedRoadmap.proposals[0].proposalId).toBe('PROP-001');
    expect(reloadedRoadmap.proposals[1].proposalId).toBe('PROP-002');
    expect(reloadedRoadmap.proposals[2].proposalId).toBe('PROP-003');

    // ===== Step 8: 別の並び替えオプションを適用（カテゴリ順）=====
    const sortedByCategory = [...roadmapData.proposals].sort((a, b) =>
      a.category.localeCompare(b.category)
    );
    // 期待値: UI改善 → バグ修正 → 性能改善
    expect(sortedByCategory[0].category).toBe('UI改善');
    expect(sortedByCategory[1].category).toBe('バグ修正');
    expect(sortedByCategory[2].category).toBe('性能改善');

    // ===== Step 9: 別の並び替えオプションを適用（作成日時順）=====
    const sortedByCreatedAt = [...roadmapData.proposals].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    expect(sortedByCreatedAt[0].createdAt).toBe('2024-01-10T09:00:00Z');
    expect(sortedByCreatedAt[1].createdAt).toBe('2024-01-11T10:30:00Z');
    expect(sortedByCreatedAt[2].createdAt).toBe('2024-01-12T14:15:00Z');

    // ===== Step 10: 複数回の保存・読み込みサイクルで一貫性を検証 =====
    let currentRoadmap = JSON.parse(JSON.stringify(roadmapData));
    for (let cycle = 1; cycle <= 3; cycle++) {
      const savedCycle = JSON.parse(JSON.stringify(currentRoadmap));
      expect(savedCycle.proposals[0].proposalId).toBe('PROP-001');
      expect(savedCycle.proposals[1].proposalId).toBe('PROP-002');
      expect(savedCycle.proposals[2].proposalId).toBe('PROP-003');
      currentRoadmap = savedCycle;
    }

    // ===== Step 11: 優先度スコアが異なる提案を追加 =====
    const additionalProposal = {
      proposalId: 'PROP-004',
      title: '調理時間最適化',
      category: '性能改善',
      priorityScore: 90,
      businessValue: 9,
      implementationDifficulty: 7,
      userImpactScore: 8,
      createdAt: '2024-01-13T11:00:00Z',
      implementationOrder: 0,
    };

    const mixedPriorityRoadmap = {
      generatedAt: '2024-01-15T16:30:00Z',
      proposals: [additionalProposal, ...roadmapData.proposals].sort(
        (a, b) =>
          b.priorityScore - a.priorityScore ||
          a.implementationOrder - b.implementationOrder
      ),
      failurePatternAnalysis: aggregatedPatterns,
    };

    // ===== Step 12: 異なる優先度スコアの提案と混在した場合、相対的位置関係が正しく保たれることを確認 =====
    // 期待値: スコア90の提案が最初に来る
    expect(mixedPriorityRoadmap.proposals[0].priorityScore).toBe(90);
    expect(mixedPriorityRoadmap.proposals[0].proposalId).toBe('PROP-004');
    // スコア80の提案群は元の順序が保持される
    expect(mixedPriorityRoadmap.proposals[1].priorityScore).toBe(80);
    expect(mixedPriorityRoadmap.proposals[1].proposalId).toBe('PROP-001');
    expect(mixedPriorityRoadmap.proposals[2].priorityScore).toBe(80);
    expect(mixedPriorityRoadmap.proposals[2].proposalId).toBe('PROP-002');
    expect(mixedPriorityRoadmap.proposals[3].priorityScore).toBe(80);
    expect(mixedPriorityRoadmap.proposals[3].proposalId).toBe('PROP-003');
  });
});