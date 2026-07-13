import { notifyDevelopmentTeamWithPrioritizedProposals } from '../../src/logic/it-1-br-2-1-2-1';

describe('改善提案管理機能 - 優先度付けされた改善提案が開発チームに定期通知される', () => {
  test('SCEN-475: 優先度付けされた改善提案が優先度順に開発チームへ定期通知される', () => {
    // Arrange: 複数の改善提案を作成し、異なる優先度を設定
    const proposals = [
      {
        proposal_id: 'PROP-001',
        title: '栄養バランス計算ロジック改善',
        description: 'カルシウム摂取量の推奨値計算ロジックを改善',
        business_value_score: 9,
        technical_difficulty_score: 6,
        user_impact_score: 8,
        priority_rank: '高',
        submitted_at: new Date('2024-01-15T10:00:00Z'),
        submitted_by_nutritionist_id: 'NUT-001'
      },
      {
        proposal_id: 'PROP-002',
        title: '家族好み学習アルゴリズム改善',
        description: '家族成員の過去評価データを反映したアルゴリズム強化',
        business_value_score: 6,
        technical_difficulty_score: 7,
        user_impact_score: 5,
        priority_rank: '中',
        submitted_at: new Date('2024-01-14T14:30:00Z'),
        submitted_by_nutritionist_id: 'NUT-002'
      },
      {
        proposal_id: 'PROP-003',
        title: 'UI改善提案',
        description: '献立生成フロー内の表示順序を最適化',
        business_value_score: 3,
        technical_difficulty_score: 2,
        user_impact_score: 2,
        priority_rank: '低',
        submitted_at: new Date('2024-01-13T09:15:00Z'),
        submitted_by_nutritionist_id: 'NUT-003'
      }
    ];

    const notification_settings = {
      notification_enabled: true,
      dev_team_email_addresses: ['dev-team@example.com', 'lead-dev@example.com'],
      notification_schedule_cron: '0 9 * * 1',
      notification_schedule_description: '毎週月曜日 09:00',
      last_notification_sent_at: new Date('2024-01-08T09:00:00Z')
    };

    const current_datetime = new Date('2024-01-15T09:05:00Z');

    // Act: 優先度付けされた改善提案を開発チームに通知する
    const result = notifyDevelopmentTeamWithPrioritizedProposals(
      proposals,
      notification_settings,
      current_datetime
    );

    // Assert: 通知が正常に送信されたことを検証
    expect(result.notification_sent).toBe(true);

    // Assert: 通知内容に含まれる改善提案が優先度順（高→中→低）にソートされていることを検証
    expect(result.proposals_in_notification).toHaveLength(3);
    expect(result.proposals_in_notification[0].priority_rank).toBe('高');
    expect(result.proposals_in_notification[0].proposal_id).toBe('PROP-001');
    expect(result.proposals_in_notification[1].priority_rank).toBe('中');
    expect(result.proposals_in_notification[1].proposal_id).toBe('PROP-002');
    expect(result.proposals_in_notification[2].priority_rank).toBe('低');
    expect(result.proposals_in_notification[2].proposal_id).toBe('PROP-003');

    // Assert: 通知先メールアドレスが正確に記録されていることを検証
    expect(result.notification_recipients).toEqual([
      'dev-team@example.com',
      'lead-dev@example.com'
    ]);

    // Assert: 通知タイムスタンプが現在時刻と一致していることを検証
    expect(result.notification_timestamp.toISOString()).toBe(
      '2024-01-15T09:05:00.000Z'
    );

    // Assert: 高優先度提案が通知の上部に位置していることを検証（インデックス 0）
    expect(result.proposals_in_notification[0].priority_rank).toBe('高');
    expect(result.proposals_in_notification[0].business_value_score).toBe(9);

    // Assert: 通知メール本体に正確なタイトル・説明・優先度が含まれていることを検証
    expect(result.email_body).toContain('栄養バランス計算ロジック改善');
    expect(result.email_body).toContain(
      'カルシウム摂取量の推奨値計算ロジックを改善'
    );
    expect(result.email_body).toContain('優先度: 高');
    expect(result.email_body).toContain('家族好み学習アルゴリズム改善');
    expect(result.email_body).toContain('優先度: 中');
    expect(result.email_body).toContain('UI改善提案');
    expect(result.email_body).toContain('優先度: 低');

    // Assert: 通知メールのサブジェクトが正確に設定されていることを検証
    expect(result.email_subject).toContain('改善提案');
    expect(result.email_subject).toContain('3件');

    // Assert: 通知スケジュール設定が確認されていることを検証
    expect(result.schedule_confirmed).toBe(true);
    expect(result.schedule_cron).toBe('0 9 * * 1');
    expect(result.schedule_description).toBe('毎週月曜日 09:00');

    // Assert: 最後の通知送信時刻が更新されていることを検証
    expect(result.last_notification_sent_at.toISOString()).toBe(
      '2024-01-15T09:05:00.000Z'
    );

    // Assert: 通知設定が有効であることを検証
    expect(result.notification_settings_enabled).toBe(true);

    // Assert: 通知内容の総提案数が元の提案数と一致していることを検証
    expect(result.total_proposals_count).toBe(3);

    // Assert: 各優先度ランクの提案数が正確に集計されていることを検証
    expect(result.priority_breakdown.high).toBe(1);
    expect(result.priority_breakdown.medium).toBe(1);
    expect(result.priority_breakdown.low).toBe(1);
  });
});