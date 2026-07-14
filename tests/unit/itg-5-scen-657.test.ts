import { recordDietaryRestrictionChangeAuditLog } from '../../src/logic/it-7-2-1';

describe('食事制限条件変更の監査ログ記録機能', () => {
  // SCEN-657: [normal] 食事制限条件変更の監査ログ記録機能 - 食事制限条件変更確定時に変更内容・検出パターン・タイムスタンプ・変更者情報が正確に記録される
  test('食事制限条件変更確定時に監査ログにすべての必須情報が正確に記録される', () => {
    const change_timestamp = new Date('2024-01-15T14:30:00Z');
    const user_id = 'user_789';
    const user_name = '田中太郎';
    const user_permission_level = 'admin';

    const previous_restriction = {
      ingredient_id: 'ing_001',
      restriction_name: '乳製品',
      restriction_level: 2,
    };

    const new_restriction = {
      ingredient_id: 'ing_001',
      restriction_name: '乳製品',
      restriction_level: 3,
    };

    const detected_algorithm_rule = 'rule_nutritional_constraint_v2';

    const audit_log_entry = recordDietaryRestrictionChangeAuditLog({
      change_timestamp,
      user_id,
      user_name,
      user_permission_level,
      previous_restriction,
      new_restriction,
      detected_algorithm_rule,
    });

    // 変更内容が正確に記録されているか検証
    expect(audit_log_entry.previous_restriction).toEqual({
      ingredient_id: 'ing_001',
      restriction_name: '乳製品',
      restriction_level: 2,
    });

    expect(audit_log_entry.new_restriction).toEqual({
      ingredient_id: 'ing_001',
      restriction_name: '乳製品',
      restriction_level: 3,
    });

    // 検出パターン（適用されたアルゴリズムルール）が記録されているか検証
    expect(audit_log_entry.detected_algorithm_rule).toBe(
      'rule_nutritional_constraint_v2'
    );

    // タイムスタンプが正確に記録されているか検証
    expect(audit_log_entry.recorded_timestamp).toEqual(
      new Date('2024-01-15T14:30:00Z')
    );

    // 変更者情報（ユーザーID）が記録されているか検証
    expect(audit_log_entry.changed_by_user_id).toBe('user_789');

    // 変更者情報（ユーザー名）が記録されているか検証
    expect(audit_log_entry.changed_by_user_name).toBe('田中太郎');

    // 変更者情報（権限レベル）が記録されているか検証
    expect(audit_log_entry.changed_by_permission_level).toBe('admin');

    // 監査ログエントリ全体の構造と一貫性を検証
    expect(audit_log_entry).toEqual({
      audit_log_id: expect.any(String),
      previous_restriction: {
        ingredient_id: 'ing_001',
        restriction_name: '乳製品',
        restriction_level: 2,
      },
      new_restriction: {
        ingredient_id: 'ing_001',
        restriction_name: '乳製品',
        restriction_level: 3,
      },
      detected_algorithm_rule: 'rule_nutritional_constraint_v2',
      recorded_timestamp: new Date('2024-01-15T14:30:00Z'),
      changed_by_user_id: 'user_789',
      changed_by_user_name: '田中太郎',
      changed_by_permission_level: 'admin',
      is_traceable: true,
    });

    // 記録されたタイムスタンプが実際の変更確定時刻と一致することを確認
    expect(audit_log_entry.recorded_timestamp.getTime()).toBe(
      change_timestamp.getTime()
    );

    // 記録されたユーザー情報がログインユーザーと一致することを確認
    expect(audit_log_entry.changed_by_user_id).toBe(user_id);
    expect(audit_log_entry.changed_by_user_name).toBe(user_name);
    expect(audit_log_entry.changed_by_permission_level).toBe(
      user_permission_level
    );

    // 監査ログが追跡可能な状態で記録されていることを確認
    expect(audit_log_entry.is_traceable).toBe(true);
  });
});