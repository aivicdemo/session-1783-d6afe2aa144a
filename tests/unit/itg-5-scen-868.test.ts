import { categorizeRejectionReasons, type RejectionReasonInput, type CategorizedResult } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-868: [edge] 栄養士検証評価機能 - 複数の検証基準を満たす改善案が複数候補として列挙される
  test('複数の検証基準を満たす改善案が複数候補として正しく列挙される', () => {
    const input: RejectionReasonInput[] = [
      {
        userId: 'user_001',
        rejectionId: 'rej_001',
        rejectionText: 'カロリーが高すぎて栄養バランスが悪い。アレルギー対応も不十分',
        timestamp: new Date('2024-01-15T10:00:00Z'),
        familyMemberId: 'fm_001',
      },
      {
        userId: 'user_001',
        rejectionId: 'rej_002',
        rejectionText: '栄養バランスが不適切でカロリー管理ができていない',
        timestamp: new Date('2024-01-15T11:30:00Z'),
        familyMemberId: 'fm_002',
      },
      {
        userId: 'user_002',
        rejectionId: 'rej_003',
        rejectionText: 'アレルギー対応が足りず、栄養素の多様性もない',
        timestamp: new Date('2024-01-15T14:00:00Z'),
        familyMemberId: 'fm_003',
      },
      {
        userId: 'user_002',
        rejectionId: 'rej_004',
        rejectionText: 'カロリー管理が甘く、栄養バランスも悪い。アレルギー対応も要確認',
        timestamp: new Date('2024-01-15T15:45:00Z'),
        familyMemberId: 'fm_004',
      },
    ];

    const validationCriteria = [
      '栄養バランス',
      'カロリー管理',
      'アレルギー対応',
    ];

    const result: CategorizedResult = categorizeRejectionReasons(
      input,
      validationCriteria
    );

    // 複数の検証基準をすべて満たす改善案候補が正しく抽出される
    expect(result.improvementCandidates).toBeDefined();
    expect(Array.isArray(result.improvementCandidates)).toBe(true);

    // 複数件以上の改善案候補が存在する
    expect(result.improvementCandidates.length).toBeGreaterThanOrEqual(2);

    // 各改善案がすべての選択検証基準を満たしていることを確認
    result.improvementCandidates.forEach((candidate) => {
      expect(candidate.matchingCriteria).toBeDefined();
      expect(Array.isArray(candidate.matchingCriteria)).toBe(true);

      // すべての検証基準がマッチしているか確認
      validationCriteria.forEach((criterion) => {
        expect(candidate.matchingCriteria).toContain(criterion);
      });

      // 各候補の基本情報が正確に存在する
      expect(candidate.candidateId).toBeDefined();
      expect(typeof candidate.candidateId).toBe('string');
      expect(candidate.candidateId.length).toBeGreaterThan(0);

      expect(candidate.score).toBeDefined();
      expect(typeof candidate.score).toBe('number');
      expect(candidate.score).toBeGreaterThanOrEqual(0);
      expect(candidate.score).toBeLessThanOrEqual(100);

      expect(candidate.criteriaMatchCount).toBe(validationCriteria.length);
      expect(candidate.criteriaMatchCount).toBeGreaterThanOrEqual(3);
    });

    // 候補が基準マッチング状況でソートされている
    if (result.improvementCandidates.length > 1) {
      for (
        let i = 0;
        i < result.improvementCandidates.length - 1;
        i++
      ) {
        const current = result.improvementCandidates[i];
        const next = result.improvementCandidates[i + 1];

        // スコアが高い順に並んでいるか、または基準マッチ数が多い順に並んでいる
        expect(
          current.score >= next.score ||
            current.criteriaMatchCount >= next.criteriaMatchCount
        ).toBe(true);
      }
    }

    // 集計結果の詳細情報が正確に記録されている
    expect(result.aggregationSummary).toBeDefined();
    expect(result.aggregationSummary.totalRejectionCount).toBe(4);
    expect(result.aggregationSummary.categorizedCount).toBeGreaterThanOrEqual(
      3
    );
    expect(result.aggregationSummary.improvementCandidateCount).toBe(
      result.improvementCandidates.length
    );

    // カテゴリ別集計が正確に計算されている
    expect(result.categoryBreakdown).toBeDefined();
    expect(result.categoryBreakdown['栄養バランス']).toBeDefined();
    expect(result.categoryBreakdown['栄養バランス']).toBeGreaterThanOrEqual(
      2
    );
    expect(result.categoryBreakdown['カロリー管理']).toBeDefined();
    expect(result.categoryBreakdown['カロリー管理']).toBeGreaterThanOrEqual(2);
    expect(result.categoryBreakdown['アレルギー対応']).toBeDefined();
    expect(result.categoryBreakdown['アレルギー対応']).toBeGreaterThanOrEqual(
      2
    );

    // 各改善案が選択基準すべてを満たす同じマッチング数を持っている
    const criteriaMatchCounts = result.improvementCandidates.map(
      (c) => c.criteriaMatchCount
    );
    const uniqueMatchCounts = new Set(criteriaMatchCounts);
    expect(uniqueMatchCounts.size).toBe(1);
    expect(Array.from(uniqueMatchCounts)[0]).toBe(validationCriteria.length);

    // 改善案候補が 2 件以上存在することを最終検証
    expect(result.improvementCandidates.length).toBeGreaterThanOrEqual(2);
  });
});