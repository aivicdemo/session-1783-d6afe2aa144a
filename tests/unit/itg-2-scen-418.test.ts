import { recordDietaryRestrictionAuditLog } from '../../src/logic/it-1-br-2-1-1-1';

describe('食事制限条件変更監査ログ記録機能', () => {
  // SCEN-418: [normal] 食事制限条件変更監査ログ記録機能 - 過去献立との抵触パターンが複数検出された場合、全パターンが監査ログに記録される
  test('複数の抵触パターンが検出された場合、すべてのパターンが監査ログに個別記録として残存すること', () => {
    const user_id = 'user-001';
    const timestamp = new Date('2024-02-15T10:30:00Z');
    const changed_restrictions = [
      { restriction_type: 'allergen', item_name: 'ナッツ', action: 'add' },
      { restriction_type: 'allergen', item_name: '乳製品', action: 'add' },
      { restriction_type: 'allergen', item_name: '卵', action: 'add' }
    ];

    const past_menus = [
      {
        menu_id: 'menu-001',
        menu_name: '献立A',
        ingredients: ['ナッツ', 'チキン', 'サラダ'],
        created_date: new Date('2024-01-10T12:00:00Z')
      },
      {
        menu_id: 'menu-002',
        menu_name: '献立B',
        ingredients: ['牛乳', 'チーズ', 'パン'],
        created_date: new Date('2024-01-08T12:00:00Z')
      },
      {
        menu_id: 'menu-003',
        menu_name: '献立C',
        ingredients: ['卵', 'ライス', '野菜'],
        created_date: new Date('2024-01-05T12:00:00Z')
      }
    ];

    const audit_log_result = recordDietaryRestrictionAuditLog({
      user_id,
      timestamp,
      changed_restrictions,
      past_menus
    });

    // 検出された抵触パターンが3件存在することを確認
    expect(audit_log_result.detected_conflicts.length).toBe(3);

    // 各抵触パターンに対して監査ログが記録されていることを確認
    expect(audit_log_result.audit_logs.length).toBe(3);

    // 第1個目の抵触パターン検証（献立Aとナッツ禁止の抵触）
    expect(audit_log_result.audit_logs[0]).toEqual({
      audit_log_id: expect.any(String),
      user_id: 'user-001',
      timestamp: timestamp,
      change_type: 'dietary_restriction_change',
      restriction_item: 'ナッツ',
      restriction_action: 'add',
      conflicted_menu_id: 'menu-001',
      conflicted_menu_name: '献立A',
      conflicted_ingredient: 'ナッツ',
      conflict_reason: 'allergen_mismatch',
      risk_level: 'high',
      severity_score: 10
    });

    // 第2個目の抵触パターン検証（献立Bと乳製品禁止の抵触）
    expect(audit_log_result.audit_logs[1]).toEqual({
      audit_log_id: expect.any(String),
      user_id: 'user-001',
      timestamp: timestamp,
      change_type: 'dietary_restriction_change',
      restriction_item: '乳製品',
      restriction_action: 'add',
      conflicted_menu_id: 'menu-002',
      conflicted_menu_name: '献立B',
      conflicted_ingredient: '牛乳',
      conflict_reason: 'allergen_mismatch',
      risk_level: 'high',
      severity_score: 10
    });

    // 第3個目の抵触パターン検証（献立Cと卵禁止の抵触）
    expect(audit_log_result.audit_logs[2]).toEqual({
      audit_log_id: expect.any(String),
      user_id: 'user-001',
      timestamp: timestamp,
      change_type: 'dietary_restriction_change',
      restriction_item: '卵',
      restriction_action: 'add',
      conflicted_menu_id: 'menu-003',
      conflicted_menu_name: '献立C',
      conflicted_ingredient: '卵',
      conflict_reason: 'allergen_mismatch',
      risk_level: 'high',
      severity_score: 10
    });

    // 記録された抵触パターン数と実際に検出されたパターン数が一致していることを確認
    expect(audit_log_result.audit_logs.length).toBe(
      audit_log_result.detected_conflicts.length
    );

    // 全ログレコードにタイムスタンプが記録されていることを確認
    audit_log_result.audit_logs.forEach((log: any) => {
      expect(log.timestamp).toEqual(timestamp);
    });

    // 全ログレコードにユーザーIDが記録されていることを確認
    audit_log_result.audit_logs.forEach((log: any) => {
      expect(log.user_id).toBe('user-001');
    });

    // 全ログレコードに変更内容が記録されていることを確認
    audit_log_result.audit_logs.forEach((log: any) => {
      expect(log.restriction_action).toBe('add');
      expect(log.change_type).toBe('dietary_restriction_change');
    });

    // 全ログレコードに抵触献立情報が記録されていることを確認
    audit_log_result.audit_logs.forEach((log: any) => {
      expect(log.conflicted_menu_id).toBeDefined();
      expect(log.conflicted_menu_name).toBeDefined();
      expect(log.conflicted_ingredient).toBeDefined();
    });

    // 全ログレコードに抵触理由が記録されていることを確認
    audit_log_result.audit_logs.forEach((log: any) => {
      expect(log.conflict_reason).toBeDefined();
    });

    // 記録成功フラグの確認
    expect(audit_log_result.is_recorded).toBe(true);
  });
});