import { generateImprovementProposals } from '../../src/logic/it-7-2-1';

describe('失敗パターンから改善提案への分類と紐付け', () => {
  test('SCEN-908: 失敗パターン集計結果から改善提案が作成される際、提案が3タイプに分類される', () => {
    // テストデータ: 複数の失敗パターン集計結果を準備
    const failurePatternAggregation = [
      {
        pattern_id: 'fp_001',
        failure_category: '栄養バランス不適切',
        occurrence_count: 15,
        affected_segments: ['young_single_parent', 'elderly_couple'],
        severity_score: 8.5
      },
      {
        pattern_id: 'fp_002',
        failure_category: '家族好み未反映',
        occurrence_count: 22,
        affected_segments: ['young_family_with_kids'],
        severity_score: 7.2
      },
      {
        pattern_id: 'fp_003',
        failure_category: '調理時間超過',
        occurrence_count: 18,
        affected_segments: ['busy_professional', 'single_parent'],
        severity_score: 6.8
      },
      {
        pattern_id: 'fp_004',
        failure_category: '食材制限漏れ',
        occurrence_count: 9,
        affected_segments: ['allergy_aware_family'],
        severity_score: 9.1
      },
      {
        pattern_id: 'fp_005',
        failure_category: '予算制約超過',
        occurrence_count: 12,
        affected_segments: ['budget_conscious'],
        severity_score: 6.5
      }
    ];

    // 失敗パターン集計結果に基づいて改善提案生成処理を実行
    const proposals = generateImprovementProposals(failurePatternAggregation);

    // 生成された改善提案の一覧を取得 - 検証開始
    expect(proposals).toBeDefined();
    expect(Array.isArray(proposals)).toBe(true);
    expect(proposals.length).toBeGreaterThan(0);

    // 改善提案のタイプを確認し、『アルゴリズム修正』に分類されるものを検証
    const algorithmModificationProposals = proposals.filter(
      (p) => p.proposal_type === 'アルゴリズム修正'
    );
    expect(algorithmModificationProposals.length).toBeGreaterThan(0);
    algorithmModificationProposals.forEach((proposal) => {
      expect(proposal.proposal_type).toBe('アルゴリズム修正');
      expect(proposal.linked_failure_patterns).toBeDefined();
      expect(Array.isArray(proposal.linked_failure_patterns)).toBe(true);
      proposal.linked_failure_patterns.forEach((pattern_id) => {
        const linkedPattern = failurePatternAggregation.find(
          (fp) => fp.pattern_id === pattern_id
        );
        expect(linkedPattern).toBeDefined();
      });
    });

    // 改善提案のタイプを確認し、『パラメータ調整』に分類されるものを検証
    const parameterAdjustmentProposals = proposals.filter(
      (p) => p.proposal_type === 'パラメータ調整'
    );
    expect(parameterAdjustmentProposals.length).toBeGreaterThan(0);
    parameterAdjustmentProposals.forEach((proposal) => {
      expect(proposal.proposal_type).toBe('パラメータ調整');
      expect(proposal.linked_failure_patterns).toBeDefined();
      expect(Array.isArray(proposal.linked_failure_patterns)).toBe(true);
      proposal.linked_failure_patterns.forEach((pattern_id) => {
        const linkedPattern = failurePatternAggregation.find(
          (fp) => fp.pattern_id === pattern_id
        );
        expect(linkedPattern).toBeDefined();
      });
    });

    // 改善提案のタイプを確認し、『新機能』に分類されるものを検証
    const newFeatureProposals = proposals.filter(
      (p) => p.proposal_type === '新機能'
    );
    expect(newFeatureProposals.length).toBeGreaterThan(0);
    newFeatureProposals.forEach((proposal) => {
      expect(proposal.proposal_type).toBe('新機能');
      expect(proposal.linked_failure_patterns).toBeDefined();
      expect(Array.isArray(proposal.linked_failure_patterns)).toBe(true);
      proposal.linked_failure_patterns.forEach((pattern_id) => {
        const linkedPattern = failurePatternAggregation.find(
          (fp) => fp.pattern_id === pattern_id
        );
        expect(linkedPattern).toBeDefined();
      });
    });

    // すべての改善提案が上記3つのタイプのいずれかに分類されていることを確認
    const validTypes = ['アルゴリズム修正', 'パラメータ調整', '新機能'];
    proposals.forEach((proposal) => {
      expect(validTypes).toContain(proposal.proposal_type);
    });

    // 各改善提案が対応する失敗パターンと正しく紐付けられていることを確認
    proposals.forEach((proposal) => {
      expect(proposal.linked_failure_patterns.length).toBeGreaterThan(0);
      proposal.linked_failure_patterns.forEach((pattern_id) => {
        // 紐付けられた失敗パターンが実際に存在するか確認
        const foundPattern = failurePatternAggregation.find(
          (fp) => fp.pattern_id === pattern_id
        );
        expect(foundPattern).toBeDefined();
      });
    });

    // 期待される分類タイプの配分検証
    const totalProposals = proposals.length;
    expect(totalProposals).toBe(
      algorithmModificationProposals.length +
        parameterAdjustmentProposals.length +
        newFeatureProposals.length
    );

    // 各提案が一意のID を持つことを確認
    const proposalIds = proposals.map((p) => p.proposal_id);
    const uniqueProposalIds = new Set(proposalIds);
    expect(uniqueProposalIds.size).toBe(proposalIds.length);
  });
});