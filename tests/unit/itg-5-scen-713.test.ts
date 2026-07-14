import { prioritizeImprovementProposals } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-713
  test('同一の総合スコア値を持つ複数の改善課題が決定論的に順序付けされ、表示順序が処理内部の順序と一致すること', () => {
    const improvementProposals = [
      {
        proposalId: 'PROP-003',
        title: '栄養バランス最適化ロジック修正',
        businessValue: 80,
        technicalDifficulty: 70,
        userImpact: 85,
        createdAt: new Date('2024-01-20T10:00:00Z'),
      },
      {
        proposalId: 'PROP-001',
        title: 'アレルギー検出精度向上',
        businessValue: 85,
        technicalDifficulty: 65,
        userImpact: 90,
        createdAt: new Date('2024-01-15T09:30:00Z'),
      },
      {
        proposalId: 'PROP-002',
        title: '調理時間予測アルゴリズム改善',
        businessValue: 80,
        technicalDifficulty: 70,
        userImpact: 85,
        createdAt: new Date('2024-01-18T14:20:00Z'),
      },
    ];

    const result = prioritizeImprovementProposals(improvementProposals);

    // 総合スコアの計算検証：(businessValue + technicalDifficulty + userImpact) / 3
    // PROP-001: (85 + 65 + 90) / 3 = 80.0
    // PROP-002: (80 + 70 + 85) / 3 = 78.33...
    // PROP-003: (80 + 70 + 85) / 3 = 78.33...
    
    expect(result).toHaveLength(3);
    
    // 総合スコア値の検証
    expect(result[0].totalScore).toBe(80);
    expect(result[1].totalScore).toBeCloseTo(78.33, 1);
    expect(result[2].totalScore).toBeCloseTo(78.33, 1);

    // スコア同率課題（PROP-002とPROP-003）がセカンダリソート条件で決定論的に順序付けされることを確認
    expect(result[0].proposalId).toBe('PROP-001');
    
    // 同一スコア課題（78.33）同士はセカンダリソート条件に従う
    // セカンダリソート条件：作成日時の昇順
    const sameScoreProposals = result.slice(1);
    expect(sameScoreProposals[0].proposalId).toBe('PROP-002');
    expect(sameScoreProposals[0].createdAt).toEqual(new Date('2024-01-18T14:20:00Z'));
    expect(sameScoreProposals[1].proposalId).toBe('PROP-003');
    expect(sameScoreProposals[1].createdAt).toEqual(new Date('2024-01-20T10:00:00Z'));

    // ダッシュボード表示順序と内部処理順序の一致を検証
    const displayOrder = result.map(p => p.proposalId);
    expect(displayOrder).toEqual(['PROP-001', 'PROP-002', 'PROP-003']);

    // 同一スコア課題の詳細情報が正確に保持されていることを検証
    const equalsScoreGroup = result.filter(p => p.totalScore === 78.33 || p.totalScore.toFixed(2) === '78.33');
    expect(equalsScoreGroup).toHaveLength(2);
    expect(equalsScoreGroup.every(p => p.title !== undefined)).toBe(true);
    expect(equalsScoreGroup.every(p => p.businessValue !== undefined)).toBe(true);
    expect(equalsScoreGroup.every(p => p.technicalDifficulty !== undefined)).toBe(true);
    expect(equalsScoreGroup.every(p => p.userImpact !== undefined)).toBe(true);

    // グループ化操作時に同一スコア課題が重複または脱落なく処理されることを検証
    const groupedByScore = result.reduce(
      (acc, proposal) => {
        const scoreKey = proposal.totalScore.toFixed(2);
        if (!acc[scoreKey]) {
          acc[scoreKey] = [];
        }
        acc[scoreKey].push(proposal.proposalId);
        return acc;
      },
      {} as Record<string, string[]>
    );
    
    expect(Object.keys(groupedByScore)).toContain('80.00');
    expect(Object.keys(groupedByScore)).toContain('78.33');
    expect(groupedByScore['80.00']).toEqual(['PROP-001']);
    expect(groupedByScore['78.33']).toEqual(['PROP-002', 'PROP-003']);
    expect(groupedByScore['78.33']).toHaveLength(2);

    // フィルタリング操作でスコアが80以上の課題を抽出し、重複・脱落がないことを確認
    const filtered = result.filter(p => p.totalScore >= 80);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].proposalId).toBe('PROP-001');

    // 優先度ランク付与の検証
    expect(result[0].priorityRank).toBe('HIGH');
    expect(result[1].priorityRank).toBe('MEDIUM');
    expect(result[2].priorityRank).toBe('MEDIUM');

    // 同一スコア課題の相対的な順序付けルールが一貫性を持つことを検証
    const secondCallResult = prioritizeImprovementProposals(improvementProposals);
    const secondDisplayOrder = secondCallResult.map(p => p.proposalId);
    expect(secondDisplayOrder).toEqual(displayOrder);
  });
});