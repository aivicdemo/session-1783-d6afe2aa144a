import { recordImprovementProposalRejectionReason } from '../../src/logic/it-1-br-2-1-2-1';

describe('改善提案却下・保留理由の構造化記録機能', () => {
  test('SCEN-544: 理由テキストが空文字列のときはデフォルト理由が自動入力される', () => {
    // Arrange: 改善提案却下・保留理由記録の入力データを準備
    const improvement_proposal_id = 'PROP-20240515-001';
    const user_id = 'user-nutrition-staff-001';
    const status = 'rejected';
    const reason_text = ''; // 空文字列：業務ルール検証対象
    const recorded_at = new Date('2024-05-15T14:30:00Z');

    const input_payload = {
      improvement_proposal_id,
      user_id,
      status,
      reason_text,
      recorded_at
    };

    // Act: 空文字列理由で改善提案却下理由を記録
    const result = recordImprovementProposalRejectionReason(input_payload);

    // Assert 1: レスポンス基本構造を検証
    expect(result).toBeDefined();
    expect(result).toHaveProperty('improvement_proposal_id');
    expect(result).toHaveProperty('recorded_reason_text');
    expect(result).toHaveProperty('is_default_reason');
    expect(result).toHaveProperty('recorded_at_timestamp');

    // Assert 2: 空文字列がデフォルト理由に置き換わることを検証
    expect(result.recorded_reason_text).toBe('理由未記載');
    expect(result.is_default_reason).toBe(true);

    // Assert 3: 改善提案IDと記録者が正しく記録されていることを検証
    expect(result.improvement_proposal_id).toBe(improvement_proposal_id);
    expect(result.recorded_by_user_id).toBe(user_id);

    // Assert 4: 却下ステータスが正しく記録されていることを検証
    expect(result.rejection_status).toBe('rejected');

    // Assert 5: タイムスタンプが ISO 8601 形式で記録されていることを検証
    expect(result.recorded_at_timestamp).toBe('2024-05-15T14:30:00Z');

    // Assert 6: 構造化記録として categorized_reason フィールドが存在し、
    //           事前定義カテゴリに分類されていることを検証
    expect(result).toHaveProperty('categorized_reason');
    expect(result.categorized_reason).toBe('UNKNOWN');

    // Assert 7: 監査ログ用メタデータが含まれていることを検証
    expect(result).toHaveProperty('audit_log_entry_id');
    expect(typeof result.audit_log_entry_id).toBe('string');
    expect(result.audit_log_entry_id.length).toBeGreaterThan(0);
  });
});