import { mergeImprovementIssues } from '../../src/logic/it-8-1-1-1';

describe('改善課題リスト統合・重複排除機能', () => {
  // SCEN-209
  test('複数セグメント・複数食事制限タイプにまたがる課題の影響範囲が正確に計算される', () => {
    // テストデータ: 3つ以上の異なるセグメント
    const segments = [
      { segmentId: 'seg_001', segmentName: '30代男性' },
      { segmentId: 'seg_002', segmentName: '都市部' },
      { segmentId: 'seg_003', segmentName: '高所得層' },
    ];

    // 各セグメントに対して、2つ以上の食事制限タイプを設定
    const dietaryRestrictionTypes = [
      { restrictionId: 'rest_001', restrictionName: 'ベジタリアン' },
      { restrictionId: 'rest_002', restrictionName: 'グルテンフリー' },
    ];

    // 複数セグメント・複数食事制限タイプにまたがる同一の改善課題を3件以上登録
    const improvementIssues = [
      {
        issueId: 'issue_001',
        issueTitle: '献立生成アルゴリズムの調理時間精度向上',
        segmentIds: ['seg_001', 'seg_002', 'seg_003'],
        restrictionIds: ['rest_001', 'rest_002'],
        impactScore: 85,
      },
      {
        issueId: 'issue_001',
        issueTitle: '献立生成アルゴリズムの調理時間精度向上',
        segmentIds: ['seg_001', 'seg_002'],
        restrictionIds: ['rest_001'],
        impactScore: 82,
      },
      {
        issueId: 'issue_001',
        issueTitle: '献立生成アルゴリズムの調理時間精度向上',
        segmentIds: ['seg_002', 'seg_003'],
        restrictionIds: ['rest_002'],
        impactScore: 88,
      },
    ];

    // 改善課題リスト統合機能を実行
    const mergedResult = mergeImprovementIssues(improvementIssues);

    // 重複が正確に排除されたことを確認（登録件数 3件 → 統合後 1件）
    expect(mergedResult.mergedIssues).toHaveLength(1);

    const consolidatedIssue = mergedResult.mergedIssues[0];

    // 統合後の改善課題から該当課題を検索
    expect(consolidatedIssue.issueId).toBe('issue_001');
    expect(consolidatedIssue.issueTitle).toBe('献立生成アルゴリズムの調理時間精度向上');

    // 影響範囲の詳細情報が正確に記録されていることを確認
    expect(consolidatedIssue.affectedSegmentIds).toEqual(['seg_001', 'seg_002', 'seg_003']);
    expect(consolidatedIssue.affectedRestrictionIds).toEqual(['rest_001', 'rest_002']);

    // 影響範囲の計算値を検証（期待値 = セグメント数 × 食事制限タイプ数）
    // セグメント数: 3, 食事制限タイプ数: 2, 期待値: 3 * 2 = 6
    expect(consolidatedIssue.impactRangeSize).toBe(6);

    // 対象セグメント一覧が漏れなく記録されていることを確認
    expect(consolidatedIssue.affectedSegmentIds).toContain('seg_001');
    expect(consolidatedIssue.affectedSegmentIds).toContain('seg_002');
    expect(consolidatedIssue.affectedSegmentIds).toContain('seg_003');

    // 対象食事制限タイプ一覧が漏れなく記録されていることを確認
    expect(consolidatedIssue.affectedRestrictionIds).toContain('rest_001');
    expect(consolidatedIssue.affectedRestrictionIds).toContain('rest_002');

    // 最高インパクトスコアが記録されていることを確認
    expect(consolidatedIssue.maxImpactScore).toBe(88);

    // 統合結果の詳細情報を検証
    expect(mergedResult.deduplicationCount).toBe(2);
    expect(mergedResult.totalProcessed).toBe(3);
  });
});