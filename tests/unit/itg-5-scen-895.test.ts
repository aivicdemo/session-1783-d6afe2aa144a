import { aggregateWeeklyMetrics } from "../../src/logic/it-7-2-1";

describe("献立生成アルゴリズム改善前後の効果差定量比較 - 週次集計", () => {
  // SCEN-895: [error] 改善提案の優先度付けと開発チーム通知 - 優先度が未設定のまま送信された改善提案は通知対象から除外される
  test("優先度が未設定の改善提案は通知対象から除外される", () => {
    const proposalWithoutPriority = {
      proposal_id: "PROP-001",
      title: "栄養基準ロジック改善",
      description: "タンパク質推奨値の見直し",
      priority: null as unknown as number,
      business_value_score: 85,
      implementation_difficulty_score: 60,
      user_impact_score: 75,
      submitted_at: "2024-01-15T10:30:00Z",
      submitted_by: "nutritionist_001",
    };

    const proposalWithPriority = {
      proposal_id: "PROP-002",
      title: "調理時間最適化",
      description: "献立生成時の時間制約処理を改善",
      priority: 1,
      business_value_score: 90,
      implementation_difficulty_score: 50,
      user_impact_score: 88,
      submitted_at: "2024-01-15T10:45:00Z",
      submitted_by: "developer_001",
    };

    const proposals = [proposalWithoutPriority, proposalWithPriority];

    const result = aggregateWeeklyMetrics({
      proposals,
      metrics_week_start: "2024-01-08",
      metrics_week_end: "2024-01-14",
      success_rate_baseline: 0.72,
      cooking_time_reduction_baseline: 0.15,
      user_satisfaction_baseline: 3.4,
    });

    expect(result.notification_target_proposals).toHaveLength(1);
    expect(result.notification_target_proposals[0].proposal_id).toBe("PROP-002");
    expect(result.notification_target_proposals[0].priority).toBe(1);

    expect(result.skipped_proposals).toHaveLength(1);
    expect(result.skipped_proposals[0].proposal_id).toBe("PROP-001");
    expect(result.skipped_proposals[0].skip_reason).toBe("優先度未設定");

    expect(result.skip_logs).toContain(
      expect.stringMatching(/PROP-001.*優先度/)
    );

    expect(result.notification_queue).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          proposal_id: "PROP-002",
          target_team: "development",
          queued_at: expect.any(String),
        }),
      ])
    );

    expect(
      result.notification_queue.some(
        (item) => item.proposal_id === "PROP-001"
      )
    ).toBe(false);
  });
});