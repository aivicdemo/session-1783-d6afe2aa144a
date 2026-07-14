import { notifyDevelopmentTeamWithScoredProposals } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の分類と失敗パターン特定 - 改善提案優先度スコアリング通知機能', () => {
  // SCEN-735: [normal] 改善提案優先度スコアリング通知機能 - 優先度スコアリングが完了した複数提案を時系列順に開発チームへ通知できる
  test('should notify development team with scored proposals in chronological order of completion', async () => {
    const fetchMock = require('jest-fetch-mock');
    fetchMock.enableMocks();
    fetchMock.resetMocks();

    // テストデータ: 異なる完了時刻を持つ3件以上の改善提案を準備
    const proposal_1 = {
      proposal_id: 'PROP-001',
      title: 'ユーザー満足度スコア計算アルゴリズム改善',
      business_value_score: 85,
      technical_difficulty_score: 60,
      user_impact_score: 90,
      composite_priority_score: 78,
      scoring_completed_at: new Date('2024-01-15T09:00:00Z'),
      estimated_implementation_days: 5,
    };

    const proposal_2 = {
      proposal_id: 'PROP-002',
      title: '栄養バランス検証ロジック改善',
      business_value_score: 75,
      technical_difficulty_score: 55,
      user_impact_score: 80,
      composite_priority_score: 70,
      scoring_completed_at: new Date('2024-01-15T09:15:00Z'),
      estimated_implementation_days: 3,
    };

    const proposal_3 = {
      proposal_id: 'PROP-003',
      title: '食材制限漏れ検出アルゴリズム改善',
      business_value_score: 90,
      technical_difficulty_score: 70,
      user_impact_score: 85,
      composite_priority_score: 82,
      scoring_completed_at: new Date('2024-01-15T09:30:00Z'),
      estimated_implementation_days: 7,
    };

    const scored_proposals = [proposal_1, proposal_2, proposal_3];

    // Mock 通知ログを格納するための配列
    const notification_logs: {
      notification_id: string;
      proposal_id: string;
      sent_at: Date;
      payload: {
        proposal_id: string;
        title: string;
        composite_priority_score: number;
        scoring_completed_at: Date;
      };
      status: string;
    }[] = [];

    // Mock: 開発チーム通知 API レスポンス
    fetchMock.mockResponseOnce(
      JSON.stringify({
        notification_id: 'NOTIF-001',
        proposal_id: 'PROP-001',
        status: 'sent',
        sent_timestamp: '2024-01-15T10:00:00Z',
      }),
      { status: 200 }
    );

    fetchMock.mockResponseOnce(
      JSON.stringify({
        notification_id: 'NOTIF-002',
        proposal_id: 'PROP-002',
        status: 'sent',
        sent_timestamp: '2024-01-15T10:00:01Z',
      }),
      { status: 200 }
    );

    fetchMock.mockResponseOnce(
      JSON.stringify({
        notification_id: 'NOTIF-003',
        proposal_id: 'PROP-003',
        status: 'sent',
        sent_timestamp: '2024-01-15T10:00:02Z',
      }),
      { status: 200 }
    );

    // 通知機能を実行して、開発チームへの通知をモニタリング
    const notification_results = await notifyDevelopmentTeamWithScoredProposals(
      scored_proposals
    );

    // 送信された通知ログから通知順序を確認
    for (let i = 0; i < notification_results.length; i++) {
      notification_logs.push({
        notification_id: notification_results[i].notification_id,
        proposal_id: notification_results[i].proposal_id,
        sent_at: new Date(notification_results[i].sent_timestamp),
        payload: {
          proposal_id: notification_results[i].proposal_id,
          title: scored_proposals.find(
            (p) => p.proposal_id === notification_results[i].proposal_id
          )!.title,
          composite_priority_score: scored_proposals.find(
            (p) => p.proposal_id === notification_results[i].proposal_id
          )!.composite_priority_score,
          scoring_completed_at: scored_proposals.find(
            (p) => p.proposal_id === notification_results[i].proposal_id
          )!.scoring_completed_at,
        },
        status: notification_results[i].status,
      });
    }

    // 各通知ペイロードに対応する提案の完了時刻を検証
    expect(notification_logs[0].payload.proposal_id).toBe('PROP-001');
    expect(notification_logs[0].payload.scoring_completed_at).toEqual(
      new Date('2024-01-15T09:00:00Z')
    );
    expect(notification_logs[0].payload.composite_priority_score).toBe(78);

    expect(notification_logs[1].payload.proposal_id).toBe('PROP-002');
    expect(notification_logs[1].payload.scoring_completed_at).toEqual(
      new Date('2024-01-15T09:15:00Z')
    );
    expect(notification_logs[1].payload.composite_priority_score).toBe(70);

    expect(notification_logs[2].payload.proposal_id).toBe('PROP-003');
    expect(notification_logs[2].payload.scoring_completed_at).toEqual(
      new Date('2024-01-15T09:30:00Z')
    );
    expect(notification_logs[2].payload.composite_priority_score).toBe(82);

    // 通知が時系列順（昇順）に並んでいることをアサート
    for (let i = 0; i < notification_logs.length - 1; i++) {
      expect(
        notification_logs[i].payload.scoring_completed_at.getTime()
      ).toBeLessThanOrEqual(
        notification_logs[i + 1].payload.scoring_completed_at.getTime()
      );
    }

    // すべての提案に対して通知が送信されたことを確認
    expect(notification_logs.length).toBe(3);
    expect(notification_logs[0].status).toBe('sent');
    expect(notification_logs[1].status).toBe('sent');
    expect(notification_logs[2].status).toBe('sent');

    // 通知 API が正確に 3 回呼び出されたことを確認
    expect(fetchMock.mock.calls.length).toBe(3);

    // 各通知ペイロードのフィールド整合性を最終確認
    const expected_notification_order = [
      'PROP-001',
      'PROP-002',
      'PROP-003',
    ];
    const actual_notification_order = notification_logs.map(
      (log) => log.proposal_id
    );
    expect(actual_notification_order).toEqual(expected_notification_order);

    fetchMock.disableMocks();
  });
});