import { calculateImprovementProposalPriorityScore } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-734: [normal] 改善提案優先度スコアリング通知機能
  test('栄養士の検証結果とユーザーフィードバックから優先度スコアを算出し、5営業日以内に開発チームへ通知できる', () => {
    // テストデータ準備：栄養士の検証結果とユーザーフィードバック
    const nutritionistVerificationResult = {
      proposal_id: 'PROP-001',
      status: 'approved',
      nutritionist_id: 'NUTRI-001',
      verification_date: '2024-01-15T10:00:00Z',
      comment: '栄養バランスの改善案として適切です。カルシウム摂取量の向上に貢献します。',
      weight: 0.6,
    };

    const userFeedbackData = {
      proposal_id: 'PROP-001',
      satisfaction_score: 85,
      feedback_summary: '調理時間が短縮され、満足度が高い',
      feedback_count: 24,
      average_satisfaction: 85,
    };

    // 改善提案優先度スコアリング機能を初期化・実行
    const priorityScore = calculateImprovementProposalPriorityScore({
      nutritionist_verification: nutritionistVerificationResult,
      user_feedback: userFeedbackData,
      verification_weight: 0.6,
      feedback_weight: 0.4,
    });

    // スコアリングアルゴリズムが正しく実行され、優先度スコア（0-100）が算出されることを確認
    expect(typeof priorityScore.score).toBe('number');
    expect(priorityScore.score).toBeGreaterThanOrEqual(0);
    expect(priorityScore.score).toBeLessThanOrEqual(100);

    // 算出された優先度スコアが、栄養士の検証結果の重み付けとユーザーフィードバックを適切に反映していることを検証
    // 計算式: verification_component = 100 * 0.6 (approved status) * 0.6 (verification_weight) = 36
    // feedback_component = 85 * 0.4 (feedback_weight) = 34
    // total_score = 36 + 34 = 70
    const expected_verification_component = 100 * 0.6 * 0.6;
    const expected_feedback_component = 85 * 0.4;
    const expected_total_score = expected_verification_component + expected_feedback_component;

    expect(priorityScore.score).toBe(expected_total_score);
    expect(priorityScore.verification_component).toBe(expected_verification_component);
    expect(priorityScore.feedback_component).toBe(expected_feedback_component);

    // 通知機能が有効になっていることを確認
    expect(priorityScore.notification_enabled).toBe(true);

    // 通知が5営業日以内のスケジュールで送信キューに追加されたことを確認
    const notification_scheduled_date = new Date(priorityScore.notification_scheduled_date);
    const current_date = new Date('2024-01-15T10:00:00Z');
    const business_days_until_notification = Math.ceil(
      (notification_scheduled_date.getTime() - current_date.getTime()) / (1000 * 60 * 60 * 24)
    );

    expect(business_days_until_notification).toBeGreaterThanOrEqual(0);
    expect(business_days_until_notification).toBeLessThanOrEqual(5);

    // 通知内容に優先度スコア、検証結果、ユーザーフィードバックサマリーが含まれていることを検証
    expect(priorityScore.notification_content).toBeDefined();
    expect(priorityScore.notification_content.priority_score).toBe(expected_total_score);
    expect(priorityScore.notification_content.verification_status).toBe('approved');
    expect(priorityScore.notification_content.verification_comment).toBe(
      '栄養バランスの改善案として適切です。カルシウム摂取量の向上に貢献します。'
    );
    expect(priorityScore.notification_content.user_satisfaction_score).toBe(85);
    expect(priorityScore.notification_content.feedback_summary).toBe(
      '調理時間が短縮され、満足度が高い'
    );

    // 開発チームが通知を受け取ったことをログまたはメッセージング履歴で確認
    expect(priorityScore.notification_log).toBeDefined();
    expect(priorityScore.notification_log.recipient_team).toBe('development_team');
    expect(priorityScore.notification_log.recipient_count).toBeGreaterThan(0);
    expect(priorityScore.notification_log.delivery_status).toBe('queued');

    // 複数の改善提案に対して同様のプロセスが並行して正常に動作することを確認
    const proposal_list = [
      {
        proposal_id: 'PROP-002',
        nutritionist_verification: {
          proposal_id: 'PROP-002',
          status: 'modification_required',
          nutritionist_id: 'NUTRI-001',
          verification_date: '2024-01-15T10:30:00Z',
          comment: '栄養基準の修正が必要です。',
          weight: 0.4,
        },
        user_feedback: {
          proposal_id: 'PROP-002',
          satisfaction_score: 72,
          feedback_summary: 'コスト削減効果があるが、調理時間が増加した',
          feedback_count: 18,
          average_satisfaction: 72,
        },
      },
      {
        proposal_id: 'PROP-003',
        nutritionist_verification: {
          proposal_id: 'PROP-003',
          status: 'rejected',
          nutritionist_id: 'NUTRI-002',
          verification_date: '2024-01-15T11:00:00Z',
          comment: '栄養基準を満たさないため却下',
          weight: 0.2,
        },
        user_feedback: {
          proposal_id: 'PROP-003',
          satisfaction_score: 45,
          feedback_summary: 'ユーザー満足度が低い',
          feedback_count: 12,
          average_satisfaction: 45,
        },
      },
    ];

    const parallel_scores = proposal_list.map((proposal) =>
      calculateImprovementProposalPriorityScore({
        nutritionist_verification: proposal.nutritionist_verification,
        user_feedback: proposal.user_feedback,
        verification_weight: 0.6,
        feedback_weight: 0.4,
      })
    );

    // すべての改善提案に対してスコアが正常に計算されたことを確認
    expect(parallel_scores.length).toBe(2);
    parallel_scores.forEach((score, index) => {
      expect(score.score).toBeGreaterThanOrEqual(0);
      expect(score.score).toBeLessThanOrEqual(100);
      expect(score.notification_enabled).toBe(true);
      expect(score.notification_content).toBeDefined();
      expect(score.notification_log).toBeDefined();
    });

    // PROP-002の期待値: modification_required status = 50点 * 0.6 * 0.6 = 18, feedback = 72 * 0.4 = 28.8, total = 46.8
    const expected_prop2_score = 50 * 0.6 * 0.6 + 72 * 0.4;
    expect(parallel_scores[0].score).toBe(expected_prop2_score);

    // PROP-003の期待値: rejected status = 0点 * 0.6 * 0.6 = 0, feedback = 45 * 0.4 = 18, total = 18
    const expected_prop3_score = 0 * 0.6 * 0.6 + 45 * 0.4;
    expect(parallel_scores[1].score).toBe(expected_prop3_score);

    // 複数提案の通知が並行して正常に配信キューに追加されたことを確認
    parallel_scores.forEach((score) => {
      expect(score.notification_log.delivery_status).toBe('queued');
    });
  });
});