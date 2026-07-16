import { classifyImprovementProposals } from '../../src/logic/it-8-1-1-1';

describe('改善提案分類機能 - 失敗パターンデータ紐付け', () => {
  // SCEN-288
  test('各改善提案に根拠となる失敗パターンデータが紐付けられる', () => {
    // 失敗パターンデータセットを準備
    const failurePatterns = [
      {
        pattern_id: 'FP-001',
        category: '栄養バランス不適切',
        occurrence_count: 45,
        impact_score: 8.5,
      },
      {
        pattern_id: 'FP-002',
        category: '家族好み未反映',
        occurrence_count: 32,
        impact_score: 7.2,
      },
      {
        pattern_id: 'FP-003',
        category: '調理時間超過',
        occurrence_count: 28,
        impact_score: 6.8,
      },
      {
        pattern_id: 'FP-004',
        category: '食材制限漏れ',
        occurrence_count: 18,
        impact_score: 8.1,
      },
    ];

    // 改善提案データを準備
    const improvementProposals = [
      {
        proposal_id: 'PROP-001',
        title: 'アルゴリズム修正：栄養バランス計算ロジック',
        type: 'algorithm_modification',
        description: '栄養バランス評価関数を改善',
        related_pattern_ids: ['FP-001', 'FP-002'],
      },
      {
        proposal_id: 'PROP-002',
        title: 'パラメータ調整：調理時間閾値',
        type: 'parameter_adjustment',
        description: '調理時間の上限設定を動的調整',
        related_pattern_ids: ['FP-003'],
      },
      {
        proposal_id: 'PROP-003',
        title: '新機能：食材制限チェックリスト',
        type: 'new_feature',
        description: 'ユーザー入力時に食材制限をバリデーション',
        related_pattern_ids: ['FP-004'],
      },
    ];

    // 分類機能を実行
    const result = classifyImprovementProposals({
      proposals: improvementProposals,
      failure_patterns: failurePatterns,
      metadata_timestamp: '2024-02-15T10:30:00Z',
    });

    // 検証1: すべての改善提案が処理されている
    expect(result.classified_proposals.length).toBe(3);

    // 検証2: 各改善提案に1件以上の根拠パターンが紐付けられている
    result.classified_proposals.forEach((proposal) => {
      expect(proposal.linked_failure_patterns.length).toBeGreaterThanOrEqual(1);
    });

    // 検証3: PROP-001の紐付けを詳細検証
    const prop001 = result.classified_proposals.find(
      (p) => p.proposal_id === 'PROP-001'
    );
    expect(prop001).toBeDefined();
    expect(prop001!.linked_failure_patterns).toEqual([
      {
        pattern_id: 'FP-001',
        category: '栄養バランス不適切',
        occurrence_count: 45,
        impact_score: 8.5,
        linkage_confidence: 0.95,
      },
      {
        pattern_id: 'FP-002',
        category: '家族好み未反映',
        occurrence_count: 32,
        impact_score: 7.2,
        linkage_confidence: 0.78,
      },
    ]);

    // 検証4: PROP-002の紐付けを詳細検証
    const prop002 = result.classified_proposals.find(
      (p) => p.proposal_id === 'PROP-002'
    );
    expect(prop002).toBeDefined();
    expect(prop002!.linked_failure_patterns).toEqual([
      {
        pattern_id: 'FP-003',
        category: '調理時間超過',
        occurrence_count: 28,
        impact_score: 6.8,
        linkage_confidence: 0.92,
      },
    ]);

    // 検証5: PROP-003の紐付けを詳細検証
    const prop003 = result.classified_proposals.find(
      (p) => p.proposal_id === 'PROP-003'
    );
    expect(prop003).toBeDefined();
    expect(prop003!.linked_failure_patterns).toEqual([
      {
        pattern_id: 'FP-004',
        category: '食材制限漏れ',
        occurrence_count: 18,
        impact_score: 8.1,
        linkage_confidence: 0.88,
      },
    ]);

    // 検証6: パターンIDが一意に管理されている
    const allPatternIds = result.classified_proposals.flatMap((p) =>
      p.linked_failure_patterns.map((fp) => fp.pattern_id)
    );
    const uniquePatternIds = new Set(allPatternIds);
    expect(uniquePatternIds.size).toBe(allPatternIds.length);

    // 検証7: メタデータが正しく記録されている
    result.classified_proposals.forEach((proposal) => {
      expect(proposal.metadata).toBeDefined();
      expect(proposal.metadata.linkage_timestamp).toBe('2024-02-15T10:30:00Z');
      expect(proposal.metadata.linkage_method).toBe('automated');
      expect(proposal.metadata.total_linked_patterns).toBe(
        proposal.linked_failure_patterns.length
      );
    });

    // 検証8: 提案タイプ別の分類が正しい
    expect(result.classified_proposals[0].proposal_type).toBe(
      'algorithm_modification'
    );
    expect(result.classified_proposals[1].proposal_type).toBe(
      'parameter_adjustment'
    );
    expect(result.classified_proposals[2].proposal_type).toBe('new_feature');

    // 検証9: 全体の統計情報が正しく計算されている
    expect(result.summary.total_proposals_classified).toBe(3);
    expect(result.summary.total_pattern_linkages).toBe(4);
    expect(result.summary.average_patterns_per_proposal).toBe(4 / 3);
    expect(
      result.summary.average_patterns_per_proposal
    ).toBeCloseTo(1.3333, 3);

    // 検証10: 影響度ベースのランキングが正しく生成されている
    const ranked_patterns = result.summary.ranked_patterns_by_impact;
    expect(ranked_patterns.length).toBe(4);
    expect(ranked_patterns[0].pattern_id).toBe('FP-001');
    expect(ranked_patterns[0].impact_score).toBe(8.5);
    expect(ranked_patterns[1].pattern_id).toBe('FP-004');
    expect(ranked_patterns[1].impact_score).toBe(8.1);
    expect(ranked_patterns[2].pattern_id).toBe('FP-002');
    expect(ranked_patterns[2].impact_score).toBe(7.2);
    expect(ranked_patterns[3].pattern_id).toBe('FP-003');
    expect(ranked_patterns[3].impact_score).toBe(6.8);

    // 検証11: 紐付けマッピングが双方向に正しく管理されている
    expect(result.linkage_mapping).toBeDefined();
    expect(result.linkage_mapping['FP-001']).toContain('PROP-001');
    expect(result.linkage_mapping['FP-002']).toContain('PROP-001');
    expect(result.linkage_mapping['FP-003']).toContain('PROP-002');
    expect(result.linkage_mapping['FP-004']).toContain('PROP-003');

    // 検証12: パターンが複数提案に紐付けられた場合の処理確認
    expect(Object.keys(result.linkage_mapping).length).toBe(4);
  });
});