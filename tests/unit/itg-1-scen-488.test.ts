import { detectConflictWithPastMenus } from '../../src/logic/it-1-br-4-2-1';

describe('食事制限条件の変更時に過去献立との抵触検出機能', () => {
  // SCEN-488: [edge] 食事制限条件変更の抵触検出と監査ログ記録 - 新しい食事制限条件が過去献立と抵触しない場合、抵触なしのステータスが監査ログに記録される
  test('新しい食事制限条件が過去献立と抵触しない場合、抵触なしのステータスが監査ログに記録される', () => {
    // 現在の食事制限条件
    const current_restriction = {
      user_id: 'user_001',
      allergies: ['egg'],
      religious_restrictions: [],
      timestamp: new Date('2024-01-15T10:00:00Z'),
    };

    // 過去30日分の献立データ（直近30日以内）
    const past_menus = [
      {
        menu_id: 'menu_001',
        user_id: 'user_001',
        date: new Date('2024-01-14T19:00:00Z'),
        ingredients: ['chicken', 'rice', 'carrot', 'onion'],
      },
      {
        menu_id: 'menu_002',
        user_id: 'user_001',
        date: new Date('2024-01-13T19:00:00Z'),
        ingredients: ['beef', 'pasta', 'tomato', 'garlic'],
      },
      {
        menu_id: 'menu_003',
        user_id: 'user_001',
        date: new Date('2024-01-12T19:00:00Z'),
        ingredients: ['fish', 'rice', 'spinach', 'mushroom'],
      },
    ];

    // 新しい食事制限条件（卵、乳製品、ハラール制限を追加）
    const new_restriction = {
      user_id: 'user_001',
      allergies: ['egg', 'dairy'],
      religious_restrictions: ['halal'],
      timestamp: new Date('2024-01-15T11:00:00Z'),
    };

    // 検出結果を取得
    const result = detectConflictWithPastMenus({
      user_id: 'user_001',
      current_restriction: current_restriction,
      new_restriction: new_restriction,
      past_menus: past_menus,
      execution_timestamp: new Date('2024-01-15T11:00:00Z'),
    });

    // 期待される戻り値の構造と値
    expect(result).toEqual({
      conflict_detected: false,
      conflict_count: 0,
      conflicting_menu_ids: [],
      status: 'no_conflict',
      conflict_explanation: '',
      audit_log_entry: {
        user_id: 'user_001',
        change_timestamp: new Date('2024-01-15T11:00:00Z'),
        previous_restriction: {
          allergies: ['egg'],
          religious_restrictions: [],
        },
        new_restriction: {
          allergies: ['egg', 'dairy'],
          religious_restrictions: ['halal'],
        },
        conflict_detection_result: 'no_conflict',
        conflicting_menus_count: 0,
        detection_executed_at: new Date('2024-01-15T11:00:00Z'),
        user_confirmation_status: 'pending',
        status_code: 'CHANGE_ACCEPTED_NO_CONFLICT',
        checksum: expect.any(String),
      },
    });

    // 具体的な検証項目
    expect(result.conflict_detected).toBe(false);
    expect(result.conflict_count).toBe(0);
    expect(result.conflicting_menu_ids.length).toBe(0);
    expect(result.status).toBe('no_conflict');

    // 監査ログエントリの検証
    const audit_log = result.audit_log_entry;
    expect(audit_log.user_id).toBe('user_001');
    expect(audit_log.change_timestamp).toEqual(new Date('2024-01-15T11:00:00Z'));
    expect(audit_log.previous_restriction.allergies).toEqual(['egg']);
    expect(audit_log.previous_restriction.religious_restrictions).toEqual([]);
    expect(audit_log.new_restriction.allergies).toEqual(['egg', 'dairy']);
    expect(audit_log.new_restriction.religious_restrictions).toEqual(['halal']);
    expect(audit_log.conflict_detection_result).toBe('no_conflict');
    expect(audit_log.conflicting_menus_count).toBe(0);
    expect(audit_log.detection_executed_at).toEqual(new Date('2024-01-15T11:00:00Z'));
    expect(audit_log.user_confirmation_status).toBe('pending');
    expect(audit_log.status_code).toBe('CHANGE_ACCEPTED_NO_CONFLICT');
    expect(typeof audit_log.checksum).toBe('string');
    expect(audit_log.checksum.length).toBeGreaterThan(0);
  });
});