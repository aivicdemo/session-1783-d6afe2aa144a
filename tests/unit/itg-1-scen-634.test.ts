import { calculateImprovementProposalPriorityScore } from '../../src/logic/it-1-br-4-2-1';

describe('食事制限条件の変更時に過去献立との抵触検出機能', () => {
  // SCEN-634: [edge] 改善提案の優先度スコア算出 - 優先度スコアの同点処理
  test('同一の優先度スコアを持つ複数の改善提案がタイブレーク・ルールに従って正確に順序付けられる', () => {
    // 複数の改善提案を準備し、同一の優先度スコア（50点）になるように設定
    const proposals = [
      {
        proposalId: 'PROP-003',
        proposalText: 'アレルギー検出ロジックの改善',
        category: 'アルゴリズム修正',
        kpiContributionScore: 50,
        implementationDifficulty: 60,
        userImpactScore: 40,
        proposalDate: new Date('2024-01-20T10:00:00Z'),
        proposer: 'nutritionist_b'
      },
      {
        proposalId: 'PROP-001',
        proposalText: '栄養バランス検出の強化',
        category: 'アルゴリズム修正',
        kpiContributionScore: 50,
        implementationDifficulty: 60,
        userImpactScore: 40,
        proposalDate: new Date('2024-01-15T09:00:00Z'),
        proposer: 'nutritionist_a'
      },
      {
        proposalId: 'PROP-002',
        proposalText: '調理時間予測の精度向上',
        category: 'パラメータ調整',
        kpiContributionScore: 50,
        implementationDifficulty: 60,
        userImpactScore: 40,
        proposalDate: new Date('2024-01-18T14:00:00Z'),
        proposer: 'nutritionist_c'
      }
    ];

    // 優先度スコア算出処理を実行
    const result = calculateImprovementProposalPriorityScore(proposals);

    // 同点の提案群がタイブレーク・ルール（提案ID昇順）に従って順序付けられているか検証
    expect(result).toHaveLength(3);
    expect(result[0].proposalId).toBe('PROP-001');
    expect(result[0].priorityScore).toBe(50);
    expect(result[1].proposalId).toBe('PROP-002');
    expect(result[1].priorityScore).toBe(50);
    expect(result[2].proposalId).toBe('PROP-003');
    expect(result[2].priorityScore).toBe(50);

    // 毎回同じ順序で返されることを確認（安定性テスト）
    const result2 = calculateImprovementProposalPriorityScore(proposals);
    expect(result2).toEqual(result);
  });

  // 異なる同点パターンでのタイブレーク処理の検証
  test('異なる同点パターンにおいてもタイブレーク・ルール（作成日時降順）が正確に適用される', () => {
    const proposals = [
      {
        proposalId: 'PROP-005',
        proposalText: '提案5',
        category: 'アルゴリズム修正',
        kpiContributionScore: 60,
        implementationDifficulty: 50,
        userImpactScore: 50,
        proposalDate: new Date('2024-01-25T10:00:00Z'),
        proposer: 'dev_team_a'
      },
      {
        proposalId: 'PROP-004',
        proposalText: '提案4',
        category: 'アルゴリズム修正',
        kpiContributionScore: 60,
        implementationDifficulty: 50,
        userImpactScore: 50,
        proposalDate: new Date('2024-01-22T15:00:00Z'),
        proposer: 'dev_team_b'
      },
      {
        proposalId: 'PROP-006',
        proposalText: '提案6',
        category: 'アルゴリズム修正',
        kpiContributionScore: 60,
        implementationDifficulty: 50,
        userImpactScore: 50,
        proposalDate: new Date('2024-01-28T09:00:00Z'),
        proposer: 'dev_team_c'
      }
    ];

    const result = calculateImprovementProposalPriorityScore(proposals);

    // 同点（優先度スコア60）の提案が作成日時降順でソートされていることを確認
    expect(result).toHaveLength(3);
    expect(result[0].proposalId).toBe('PROP-006');
    expect(result[0].proposalDate).toEqual(new Date('2024-01-28T09:00:00Z'));
    expect(result[1].proposalId).toBe('PROP-005');
    expect(result[1].proposalDate).toEqual(new Date('2024-01-25T10:00:00Z'));
    expect(result[2].proposalId).toBe('PROP-004');
    expect(result[2].proposalDate).toEqual(new Date('2024-01-22T15:00:00Z'));

    // すべての提案が同じ優先度スコアであることを確認
    expect(result.every(p => p.priorityScore === 60)).toBe(true);
  });

  // 複合的なタイブレーク条件での検証
  test('複数のタイブレーク条件が段階的に適用される場合、優先度ルールが正確に適用される', () => {
    const proposals = [
      {
        proposalId: 'PROP-010',
        proposalText: '提案10',
        category: 'カテゴリA',
        kpiContributionScore: 70,
        implementationDifficulty: 40,
        userImpactScore: 45,
        proposalDate: new Date('2024-02-01T12:00:00Z'),
        proposer: 'team_alpha'
      },
      {
        proposalId: 'PROP-008',
        proposalText: '提案8',
        category: 'カテゴリA',
        kpiContributionScore: 70,
        implementationDifficulty: 40,
        userImpactScore: 45,
        proposalDate: new Date('2024-02-05T11:00:00Z'),
        proposer: 'team_beta'
      },
      {
        proposalId: 'PROP-009',
        proposalText: '提案9',
        category: 'カテゴリA',
        kpiContributionScore: 70,
        implementationDifficulty: 40,
        userImpactScore: 45,
        proposalDate: new Date('2024-02-03T14:30:00Z'),
        proposer: 'team_gamma'
      }
    ];

    const result = calculateImprovementProposalPriorityScore(proposals);

    // 同点（優先度スコア70）の提案がID昇順でソートされていることを確認
    expect(result).toHaveLength(3);
    expect(result[0].proposalId).toBe('PROP-008');
    expect(result[1].proposalId).toBe('PROP-009');
    expect(result[2].proposalId).toBe('PROP-010');
    expect(result.every(p => p.priorityScore === 70)).toBe(true);
  });

  // 不安定な順序変動がないことを確認する繰り返しテスト
  test('同一入力で複数回実行した場合、常に同じ順序が保たれる（安定性確保）', () => {
    const proposals = [
      {
        proposalId: 'PROP-015',
        proposalText: '提案15',
        category: 'アルゴリズム修正',
        kpiContributionScore: 55,
        implementationDifficulty: 55,
        userImpactScore: 55,
        proposalDate: new Date('2024-02-10T08:00:00Z'),
        proposer: 'reviewer_01'
      },
      {
        proposalId: 'PROP-013',
        proposalText: '提案13',
        category: 'アルゴリズム修正',
        kpiContributionScore: 55,
        implementationDifficulty: 55,
        userImpactScore: 55,
        proposalDate: new Date('2024-02-08T13:00:00Z'),
        proposer: 'reviewer_02'
      },
      {
        proposalId: 'PROP-014',
        proposalText: '提案14',
        category: 'アルゴリズム修正',
        kpiContributionScore: 55,
        implementationDifficulty: 55,
        userImpactScore: 55,
        proposalDate: new Date('2024-02-09T10:00:00Z'),
        proposer: 'reviewer_03'
      }
    ];

    // 複数回実行して結果を比較
    const result1 = calculateImprovementProposalPriorityScore(proposals);
    const result2 = calculateImprovementProposalPriorityScore(proposals);
    const result3 = calculateImprovementProposalPriorityScore(proposals);

    // すべての実行結果が同一であることを確認
    expect(result1).toEqual(result2);
    expect(result2).toEqual(result3);

    // 具体的な順序を確認
    expect(result1[0].proposalId).toBe('PROP-013');
    expect(result1[1].proposalId).toBe('PROP-014');
    expect(result1[2].proposalId).toBe('PROP-015');
  });
});