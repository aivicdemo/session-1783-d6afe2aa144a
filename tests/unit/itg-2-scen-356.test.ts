import { prioritizeAndNotifyImprovementProposals } from '../../src/logic/it-1-br-2-1-2-1';

describe('栄養士からの改善提案を優先度付けして管理し、開発チームに定期通知する機能', () => {
  // SCEN-356: [edge] 改善提案の優先度付けと開発チーム自動通知 - 優先度が最高レベルの改善提案と通常優先度の提案が正しく区別されて通知される
  test('最高レベルと通常優先度の改善提案が正しく区別され、異なる優先度フラグを持つ通知が開発チームに自動送信される', () => {
    const fetchMock = require('jest-fetch-mock');
    fetchMock.enableMocks();
    fetchMock.resetMocks();

    // テスト入力: 改善提案データ
    const highest_priority_proposal = {
      proposal_id: 'PROP-001-HIGHEST',
      title: '栄養基準ロジック: タンパク質推奨値の即時引き上げ',
      description: '高齢者層の筋肉減少対策として、タンパク質推奨値を現在の1.0g/kg/日から1.2g/kg/日に引き上げる提案',
      priority_level: 'CRITICAL',
      business_value_score: 95,
      technical_difficulty_score: 35,
      user_impact_score: 88,
      total_priority_score: 72.67,
      estimated_implementation_days: 5,
      expected_effect_description: '高齢者ユーザーセグメントの満足度向上と栄養基準達成率20%改善',
      affected_user_segments: ['senior_homemaker', 'health_conscious'],
      submitted_by_nutritionist_id: 'NUT-001',
      submission_timestamp: '2024-01-15T08:30:00Z',
      status: 'PRIORITY_ASSIGNED',
    };

    const normal_priority_proposal = {
      proposal_id: 'PROP-002-NORMAL',
      title: '献立バリエーション: 和食レシピの追加',
      description: '家族の嗜好データを反映した和食献立を20パターン追加',
      priority_level: 'NORMAL',
      business_value_score: 65,
      technical_difficulty_score: 45,
      user_impact_score: 60,
      total_priority_score: 56.67,
      estimated_implementation_days: 12,
      expected_effect_description: '献立多様性向上と繰り返し献立抵触率5%削減',
      affected_user_segments: ['traditional_family'],
      submitted_by_nutritionist_id: 'NUT-001',
      submission_timestamp: '2024-01-15T09:00:00Z',
      status: 'PRIORITY_ASSIGNED',
    };

    // 開発チーム通知API応答をモック
    fetchMock.mockResponseOnce(
      JSON.stringify({
        notification_id: 'NOTIF-001-HIGHEST',
        sent_timestamp: '2024-01-15T08:31:00Z',
        recipient_team: 'development_team',
        priority_flag: 'CRITICAL',
        urgency_marker: '🔴 URGENT',
        proposal_reference_id: 'PROP-001-HIGHEST',
        status: 'sent',
      }),
      { status: 200 }
    );

    fetchMock.mockResponseOnce(
      JSON.stringify({
        notification_id: 'NOTIF-002-NORMAL',
        sent_timestamp: '2024-01-15T09:01:00Z',
        recipient_team: 'development_team',
        priority_flag: 'NORMAL',
        urgency_marker: '📋 STANDARD',
        proposal_reference_id: 'PROP-002-NORMAL',
        status: 'sent',
      }),
      { status: 200 }
    );

    // ロジック実行: 改善提案の優先度付けと開発チーム通知
    const result = prioritizeAndNotifyImprovementProposals({
      highest_priority_proposal: highest_priority_proposal,
      normal_priority_proposal: normal_priority_proposal,
    });

    // 検証1: 最高レベル優先度の提案が正しく特定される
    expect(result.highest_priority_notification.priority_flag).toBe('CRITICAL');
    expect(result.highest_priority_notification.urgency_marker).toBe('🔴 URGENT');
    expect(result.highest_priority_notification.proposal_reference_id).toBe('PROP-001-HIGHEST');

    // 検証2: 通常優先度の提案が正しく特定される
    expect(result.normal_priority_notification.priority_flag).toBe('NORMAL');
    expect(result.normal_priority_notification.urgency_marker).toBe('📋 STANDARD');
    expect(result.normal_priority_notification.proposal_reference_id).toBe('PROP-002-NORMAL');

    // 検証3: 両提案の通知が正しく分類されている
    expect(result.notifications_sent_count).toBe(2);
    expect(result.highest_priority_notification.recipient_team).toBe('development_team');
    expect(result.normal_priority_notification.recipient_team).toBe('development_team');

    // 検証4: 通知のタイムスタンプが正確に記録されている
    expect(result.highest_priority_notification.sent_timestamp).toBe('2024-01-15T08:31:00Z');
    expect(result.normal_priority_notification.sent_timestamp).toBe('2024-01-15T09:01:00Z');

    // 検証5: 通知ステータスが送信完了を示している
    expect(result.highest_priority_notification.status).toBe('sent');
    expect(result.normal_priority_notification.status).toBe('sent');

    // 検証6: 優先度スコアが正しく計算されている（ビジネス価値60% + 技術難度25% + ユーザーインパクト15%）
    expect(result.highest_priority_proposal_calculated_priority_score).toBe(72.67);
    expect(result.normal_priority_proposal_calculated_priority_score).toBe(56.67);

    // 検証7: 最高レベル優先度と通常優先度の区別が明確である
    expect(result.highest_priority_notification.priority_flag).not.toBe(result.normal_priority_notification.priority_flag);
    expect(result.highest_priority_notification.urgency_marker).not.toBe(result.normal_priority_notification.urgency_marker);

    // 検証8: 通知管理画面での分類表示が正しく設定されている
    expect(result.notification_classification.highest_priority_count).toBe(1);
    expect(result.notification_classification.normal_priority_count).toBe(1);
    expect(result.notification_classification.highest_priority_ids).toEqual(['NOTIF-001-HIGHEST']);
    expect(result.notification_classification.normal_priority_ids).toEqual(['NOTIF-002-NORMAL']);

    // 検証9: 提案情報が通知に正しく組み込まれている
    expect(result.highest_priority_notification.estimated_implementation_days).toBe(5);
    expect(result.normal_priority_notification.estimated_implementation_days).toBe(12);

    // 検証10: 優先度付け完了フラグが立てられている
    expect(result.prioritization_complete).toBe(true);
    expect(result.all_notifications_delivered_successfully).toBe(true);
  });
});