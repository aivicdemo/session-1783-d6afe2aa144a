import { generateAlgorithmImprovementNotification } from '../../src/logic/it-7-2-1';

describe('Weekly Algorithm Improvement Metrics Aggregation and Dashboard', () => {
  // SCEN-894: [normal] 改善提案の優先度付けと開発チーム通知 - 栄養士が優先度付けした改善提案を送信すると、開発チームに定期通知が生成される
  test('should generate and send prioritized improvement proposal notifications to development team members', () => {
    // Precondition: 栄養士が改善提案を優先度付けして入力済み、開発チームが前月の改善実装を完了している状態
    // Trigger: 栄養士が優先度付けした改善提案を送信ボタンをクリック
    // Outcome: 開発チームに改善提案の内容と優先度が自動通知され、次回のスプリント計画に組み込まれる

    const improvement_proposal_id = 'IMP-20240115-001';
    const nutritionist_user_id = 'NUTRI-USR-789';
    const proposal_title = '献立生成成功率向上のためのアルゴリズム改善';
    const proposal_description = '家族の嗜好パターンをより細かく学習するための機械学習モデル改良';
    const target_algorithm = 'menu_generation_v2_3';
    const priority_level = 'HIGH';
    const priority_score = 85;
    const business_value_score = 90;
    const technical_difficulty_score = 70;
    const user_impact_score = 88;
    const expected_success_rate_improvement = 8.5;
    const expected_satisfaction_score_improvement = 0.7;
    const submission_timestamp = '2024-01-15T14:30:00Z';
    const development_team_members = [
      { member_id: 'DEV-001', name: 'Alice Engineer', email: 'alice@dev.example.com' },
      { member_id: 'DEV-002', name: 'Bob Developer', email: 'bob@dev.example.com' },
      { member_id: 'DEV-003', name: 'Carol Coder', email: 'carol@dev.example.com' }
    ];

    const input_proposal_data = {
      proposal_id: improvement_proposal_id,
      submitted_by_user_id: nutritionist_user_id,
      title: proposal_title,
      description: proposal_description,
      target_algorithm: target_algorithm,
      priority_level: priority_level,
      priority_score: priority_score,
      business_value: business_value_score,
      technical_difficulty: technical_difficulty_score,
      user_impact: user_impact_score,
      expected_success_rate_improvement_percent: expected_success_rate_improvement,
      expected_satisfaction_score_improvement: expected_satisfaction_score_improvement,
      submitted_at: submission_timestamp,
      development_team_recipient_list: development_team_members
    };

    const notification_result = generateAlgorithmImprovementNotification(input_proposal_data);

    // Assertion 1: 通知が正常に生成されたことを確認
    expect(notification_result).toBeDefined();
    expect(notification_result.notification_status).toBe('SENT');

    // Assertion 2: 通知が複数の開発チームメンバーに配信されたことを確認
    expect(notification_result.recipients_count).toBe(3);
    expect(notification_result.delivered_to_members).toEqual([
      { member_id: 'DEV-001', delivery_status: 'DELIVERED' },
      { member_id: 'DEV-002', delivery_status: 'DELIVERED' },
      { member_id: 'DEV-003', delivery_status: 'DELIVERED' }
    ]);

    // Assertion 3: 通知内容に改善提案の詳細情報が含まれていることを確認
    expect(notification_result.notification_content).toEqual({
      proposal_id: improvement_proposal_id,
      title: proposal_title,
      description: proposal_description,
      target_algorithm: target_algorithm,
      priority_level: priority_level,
      priority_score: priority_score,
      business_value: business_value_score,
      technical_difficulty: technical_difficulty_score,
      user_impact: user_impact_score,
      expected_success_rate_improvement_percent: expected_success_rate_improvement,
      expected_satisfaction_score_improvement: expected_satisfaction_score_improvement,
      submitted_by_user_id: nutritionist_user_id
    });

    // Assertion 4: 通知が正しいタイミングで送信されたことを確認（送信タイムスタンプが提出時刻以降）
    const submission_time = new Date(submission_timestamp).getTime();
    const notification_sent_time = new Date(notification_result.notification_sent_at).getTime();
    expect(notification_sent_time).toBeGreaterThanOrEqual(submission_time);

    // Assertion 5: 通知にスプリント計画への反映指示が含まれていることを確認
    expect(notification_result.action_required).toBe('INCLUDE_IN_SPRINT_PLANNING');
    expect(notification_result.sprint_planning_deadline).toBe('2024-01-22T18:00:00Z');

    // Assertion 6: 優先度レベルが明記されていることを確認
    expect(notification_result.notification_content.priority_level).toBe('HIGH');

    // Assertion 7: 提案ID と通知ID が一致していることを確認
    expect(notification_result.related_proposal_id).toBe(improvement_proposal_id);

    // Assertion 8: 各チームメンバーへの配信は非同期ジョブとして記録されていることを確認
    expect(notification_result.delivery_job_id).toBeDefined();
    expect(notification_result.delivery_job_id).toMatch(/^NOTIF-JOB-/);

    // Assertion 9: 通知の有効期限が設定されていることを確認
    expect(notification_result.notification_expiry_at).toBe('2024-02-15T14:30:00Z');

    // Assertion 10: 合計スコア（ビジネス価値・技術難度・ユーザーインパクトの加重平均）が正しく計算されていることを確認
    // 加重平均: (90 * 0.35 + 70 * 0.25 + 88 * 0.40) = 31.5 + 17.5 + 35.2 = 84.2
    expect(notification_result.notification_content.composite_priority_score).toBe(84);

    // Assertion 11: 複数チームメンバーが通知を受け取った時刻が記録されていることを確認
    notification_result.delivered_to_members.forEach(delivery => {
      expect(delivery.delivered_at).toBeDefined();
      expect(delivery.delivered_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
    });

    // Assertion 12: 提案の要約テキストが通知に含まれていることを確認
    expect(notification_result.notification_content.summary).toContain('献立生成成功率');
    expect(notification_result.notification_content.summary).toContain('8.5%');
  });
});