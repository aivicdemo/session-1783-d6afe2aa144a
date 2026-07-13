import { recordShoppingListRejectionReason } from '../../src/logic/it-1-br-6-2-1';

describe('需要予測精度検証ダッシュボード：予測値と実績値の照合・乖離分析機能', () => {
  // SCEN-227: [normal] 買い物リスト承認却下判定機能 - 買い物リストが却下された場合、修正理由が正しく記録される
  test('買い物リストが却下された際に修正理由が正確なタイムスタンプ・承認者情報・買い物リストIDとともに記録される', () => {
    const shopping_list_id = 'SL-20240115-001';
    const approver_user_id = 'USR-approver-001';
    const approver_name = '承認者太郎';
    const rejection_reason = '塩分が多すぎるため、減塩食材への変更を求めます';
    const recorded_timestamp = new Date('2024-01-15T14:30:00Z');

    const result = recordShoppingListRejectionReason({
      shopping_list_id,
      approver_user_id,
      approver_name,
      rejection_reason,
      recorded_timestamp,
    });

    // 修正理由が正確に記録されていることを確認
    expect(result.recorded_rejection_reason).toBe(rejection_reason);

    // 買い物リストIDが正しく紐付けられていることを確認
    expect(result.shopping_list_id).toBe(shopping_list_id);

    // 承認者情報が正しく記録されていることを確認
    expect(result.approver_user_id).toBe(approver_user_id);
    expect(result.approver_name).toBe(approver_name);

    // タイムスタンプが正確に記録されていることを確認
    expect(result.rejection_recorded_at).toEqual(recorded_timestamp);

    // 却下ステータスが正しく設定されていることを確認
    expect(result.shopping_list_status).toBe('rejected');

    // 記録ID（audit trail用）が生成されていることを確認
    expect(result.rejection_record_id).toBeDefined();
    expect(typeof result.rejection_record_id).toBe('string');
    expect(result.rejection_record_id.length).toBeGreaterThan(0);

    // 修正理由の記録順序が正しいことを確認（タイムスタンプと一致）
    expect(result.rejection_recorded_at.getTime()).toBe(
      recorded_timestamp.getTime()
    );
  });
});