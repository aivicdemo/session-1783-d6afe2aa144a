import { calculateConflictPatternPriority } from '../../src/logic/it-1-br-2-1-1-1';

describe('ユーザー食事記録と栄養摂取量の推移分析・栄養基準ロジック検証', () => {
  // SCEN-407: [normal] 抵触パターン重要度スコア自動算出機能 - 重要度スコアに基づいて優先対応順が昇順で正しく並び替えられる
  test('should calculate and sort conflict pattern priority scores in ascending order', () => {
    // Arrange: 複数の抵触パターンを準備（異なる重要度スコアを持つ）
    const conflict_patterns = [
      {
        conflict_pattern_id: 'cp_001',
        restriction_name: 'アレルギー：卵',
        affected_menu_count: 15,
        family_member_count: 2,
        nutrition_gap_percentage: 25,
        risk_level: 'high' as const,
        last_occurrence_days_ago: 5,
      },
      {
        conflict_pattern_id: 'cp_002',
        restriction_name: 'アレルギー：乳製品',
        affected_menu_count: 8,
        family_member_count: 1,
        nutrition_gap_percentage: 10,
        risk_level: 'low' as const,
        last_occurrence_days_ago: 30,
      },
      {
        conflict_pattern_id: 'cp_003',
        restriction_name: '調理時間30分以下',
        affected_menu_count: 20,
        family_member_count: 4,
        nutrition_gap_percentage: 35,
        risk_level: 'high' as const,
        last_occurrence_days_ago: 2,
      },
      {
        conflict_pattern_id: 'cp_004',
        restriction_name: 'アレルギー：小麦',
        affected_menu_count: 12,
        family_member_count: 1,
        nutrition_gap_percentage: 18,
        risk_level: 'medium' as const,
        last_occurrence_days_ago: 10,
      },
    ];

    // Act: 抵触パターン重要度スコアを計算し、昇順でソート
    const result = calculateConflictPatternPriority(conflict_patterns);

    // Assert: 結果が昇順で正しく並んでいることを検証
    // 期待値（structured.formula より計算）:
    // cp_002: score = 1 * 10 + 30 * 0.5 = 10 + 15 = 25
    // cp_004: score = 2 * 10 + 10 * 0.5 + 18 = 20 + 5 + 18 = 43
    // cp_001: score = 3 * 10 + 5 * 0.5 + 25 = 30 + 2.5 + 25 = 57.5
    // cp_003: score = 3 * 10 + 2 * 0.5 + 35 = 30 + 1 + 35 = 66

    expect(result).toHaveLength(4);

    // 昇順で並んでいることを確認
    expect(result[0]).toEqual({
      conflict_pattern_id: 'cp_002',
      restriction_name: 'アレルギー：乳製品',
      priority_score: 25,
      priority_rank: 1,
    });

    expect(result[1]).toEqual({
      conflict_pattern_id: 'cp_004',
      restriction_name: '調理時間30分以下',
      priority_score: 43,
      priority_rank: 2,
    });

    expect(result[2]).toEqual({
      conflict_pattern_id: 'cp_001',
      restriction_name: 'アレルギー：卵',
      priority_score: 57.5,
      priority_rank: 3,
    });

    expect(result[3]).toEqual({
      conflict_pattern_id: 'cp_003',
      restriction_name: '調理時間30分以下',
      priority_score: 66,
      priority_rank: 4,
    });

    // スコアが昇順（最小から最大）であることを検証
    expect(result[0].priority_score).toBeLessThan(result[1].priority_score);
    expect(result[1].priority_score).toBeLessThan(result[2].priority_score);
    expect(result[2].priority_score).toBeLessThan(result[3].priority_score);

    // 最小スコアと最大スコアの範囲を検証
    expect(result[0].priority_score).toBe(25);
    expect(result[3].priority_score).toBe(66);
  });
});