import { recordImprovementProposalRejectionReason } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の分類と失敗パターン特定 - 改善提案却下・保留理由記録機能', () => {
  // SCEN-741: [normal] 改善提案却下・保留理由記録機能 - 却下または保留に分類された提案の理由を構造化データとして正しく記録できる
  test('改善提案の却下および保留理由を構造化データとして正しく記録できる', () => {
    const rejection_proposal_id = 'proposal-001';
    const rejection_category = '技術実現性';
    const rejection_detailed_reason = '既存アルゴリズムとの依存関係が強すぎて実装コストが過大になる';
    const rejection_technical_constraint = '栄養基準ロジックのリファクタリング必須';
    const rejection_recorded_by = 'user-dev-001';
    const rejection_recorded_at = new Date('2024-02-15T14:30:00Z');

    const rejection_result = recordImprovementProposalRejectionReason({
      proposal_id: rejection_proposal_id,
      status: 'rejected',
      category: rejection_category,
      detailed_reason: rejection_detailed_reason,
      technical_constraint: rejection_technical_constraint,
      recorded_by: rejection_recorded_by,
      recorded_at: rejection_recorded_at,
    });

    expect(rejection_result).toEqual({
      proposal_id: rejection_proposal_id,
      status: 'rejected',
      category: rejection_category,
      detailed_reason: rejection_detailed_reason,
      technical_constraint: rejection_technical_constraint,
      recorded_by: rejection_recorded_by,
      recorded_at: rejection_recorded_at,
      structured_data: {
        proposal_id: rejection_proposal_id,
        status: 'rejected',
        category: rejection_category,
        detailed_reason: rejection_detailed_reason,
        technical_constraint: rejection_technical_constraint,
        recorded_by: rejection_recorded_by,
        recorded_at: rejection_recorded_at.toISOString(),
      },
      is_valid: true,
    });

    const hold_proposal_id = 'proposal-002';
    const hold_category = '依存関係解決待ち';
    const hold_scheduled_review_date = new Date('2024-03-15T09:00:00Z');
    const hold_condition = '栄養基準ロジックの検証完了後に再検討予定';
    const hold_recorded_by = 'user-pm-001';
    const hold_recorded_at = new Date('2024-02-15T15:45:00Z');

    const hold_result = recordImprovementProposalRejectionReason({
      proposal_id: hold_proposal_id,
      status: 'held',
      category: hold_category,
      scheduled_review_date: hold_scheduled_review_date,
      condition: hold_condition,
      recorded_by: hold_recorded_by,
      recorded_at: hold_recorded_at,
    });

    expect(hold_result).toEqual({
      proposal_id: hold_proposal_id,
      status: 'held',
      category: hold_category,
      scheduled_review_date: hold_scheduled_review_date,
      condition: hold_condition,
      recorded_by: hold_recorded_by,
      recorded_at: hold_recorded_at,
      structured_data: {
        proposal_id: hold_proposal_id,
        status: 'held',
        category: hold_category,
        scheduled_review_date: hold_scheduled_review_date.toISOString(),
        condition: hold_condition,
        recorded_by: hold_recorded_by,
        recorded_at: hold_recorded_at.toISOString(),
      },
      is_valid: true,
    });

    expect(rejection_result.structured_data.proposal_id).toBe(rejection_proposal_id);
    expect(rejection_result.structured_data.status).toBe('rejected');
    expect(rejection_result.structured_data.category).toBe(rejection_category);
    expect(rejection_result.structured_data.recorded_by).toBe(rejection_recorded_by);
    expect(hold_result.structured_data.proposal_id).toBe(hold_proposal_id);
    expect(hold_result.structured_data.status).toBe('held');
    expect(hold_result.structured_data.category).toBe(hold_category);
    expect(hold_result.structured_data.scheduled_review_date).toBe(
      hold_scheduled_review_date.toISOString()
    );
    expect(rejection_result.is_valid).toBe(true);
    expect(hold_result.is_valid).toBe(true);
  });
});