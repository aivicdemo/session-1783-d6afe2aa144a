import { calculateConflictPatternRiskScore } from '../../src/logic/it-1-br-2-1-1-1';

describe('栄養管理・分析ダッシュボード - 抵触パターン重要度スコア自動算出', () => {
  // SCEN-408
  test('抵触パターンが1件のみの場合、リスク度が正確に判定される', () => {
    // 前提: 栄養管理・分析ダッシュボードシステムにログイン済み
    // 発生条件: 抵触パターンが1件のみ登録され、重要度スコア自動算出処理を実行
    
    const conflictPattern = {
      pattern_id: 'conflict_001',
      conflict_type: 'nutrition_unbalance',
      affected_menu_count: 3,
      family_member_count: 2,
      severity_level: 'high',
      last_occurrence_date: new Date('2024-01-15T10:00:00Z'),
    };

    const result = calculateConflictPatternRiskScore({
      conflict_patterns: [conflictPattern],
      total_menus: 20,
      reference_date: new Date('2024-01-20T10:00:00Z'),
    });

    // 期待結果: リスク度が正確に計算される
    // 計算式：重要度スコア = (抵触メニュー数 / 全メニュー数) * 100 * 重大度係数 + 家族人数加重
    // = (3 / 20) * 100 * 1.5 + 2 = 22.5 + 2 = 24.5 → リスク度 'high' と判定
    expect(result).toEqual({
      pattern_id: 'conflict_001',
      importance_score: 24.5,
      risk_level: 'high',
      is_critical: true,
      recommendation_priority: 1,
      calculation_status: 'success',
    });

    // 追加検証: リスク度判定ロジックが正確に実装されていることを確認
    expect(result.importance_score).toBeGreaterThanOrEqual(0);
    expect(result.importance_score).toBeLessThanOrEqual(100);
    expect(['low', 'medium', 'high']).toContain(result.risk_level);
    expect(typeof result.is_critical).toBe('boolean');
    expect(result.recommendation_priority).toBeGreaterThanOrEqual(1);
    expect(result.recommendation_priority).toBeLessThanOrEqual(10);

    // 計算誤差がないことを確認（小数点第1位まで許容）
    expect(Math.abs(result.importance_score - 24.5)).toBeLessThan(0.1);
  });

  test('抵触パターンが1件のみで重大度が低い場合、リスク度が低く判定される', () => {
    // 境界値テスト: 重大度が最小の場合
    const conflictPattern = {
      pattern_id: 'conflict_002',
      conflict_type: 'minor_restriction',
      affected_menu_count: 1,
      family_member_count: 1,
      severity_level: 'low',
      last_occurrence_date: new Date('2024-01-18T09:00:00Z'),
    };

    const result = calculateConflictPatternRiskScore({
      conflict_patterns: [conflictPattern],
      total_menus: 50,
      reference_date: new Date('2024-01-20T10:00:00Z'),
    });

    // 計算式：(1 / 50) * 100 * 0.5 + 1 = 1 + 1 = 2
    expect(result.importance_score).toBe(2);
    expect(result.risk_level).toBe('low');
    expect(result.is_critical).toBe(false);
  });

  test('抵触パターンが1件で入力がnullの場合、エラーが発生する', () => {
    expect(() => {
      calculateConflictPatternRiskScore({
        conflict_patterns: null as any,
        total_menus: 20,
        reference_date: new Date('2024-01-20T10:00:00Z'),
      });
    }).toThrow(/抵触パターン/);
  });

  test('抵触パターンが1件で全メニュー数が0の場合、エラーが発生する', () => {
    const conflictPattern = {
      pattern_id: 'conflict_003',
      conflict_type: 'nutrition_unbalance',
      affected_menu_count: 1,
      family_member_count: 1,
      severity_level: 'high',
      last_occurrence_date: new Date('2024-01-15T10:00:00Z'),
    };

    expect(() => {
      calculateConflictPatternRiskScore({
        conflict_patterns: [conflictPattern],
        total_menus: 0,
        reference_date: new Date('2024-01-20T10:00:00Z'),
      });
    }).toThrow(/全メニュー数/);
  });

  test('抵触パターンが1件で参照日時が不正な場合、エラーが発生する', () => {
    const conflictPattern = {
      pattern_id: 'conflict_004',
      conflict_type: 'nutrition_unbalance',
      affected_menu_count: 1,
      family_member_count: 1,
      severity_level: 'high',
      last_occurrence_date: new Date('2024-01-15T10:00:00Z'),
    };

    expect(() => {
      calculateConflictPatternRiskScore({
        conflict_patterns: [conflictPattern],
        total_menus: 20,
        reference_date: new Date('invalid-date'),
      });
    }).toThrow(/参照日時/);
  });
});