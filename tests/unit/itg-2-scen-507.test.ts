import { describePrioritizeAndScheduleNotificationForImprovementProposals } from "../../src/logic/it-1-br-2-1-2-1";

describe("栄養基準ロジック改善提案の優先度付けと通知スケジュール確定", () => {
  // SCEN-507: [normal] 改善提案の優先度付けと通知スケジュール確定 - 複数の改善提案を優先度順に一覧化し、実装予定時期と依存関係が正しく整理される
  test("複数の改善提案を優先度付けして、通知スケジュールを確定する", () => {
    // ========== Setup: 複数の改善提案データを準備 ==========
    const improvementProposals = [
      {
        proposal_id: "PROP-001",
        title: "タンパク質摂取基準値の精度向上",
        priority: "高",
        implementation_target_date: "2024-02-15",
        business_value_score: 9,
        technical_difficulty_score: 6,
        user_impact_score: 8,
        dependencies: [],
      },
      {
        proposal_id: "PROP-002",
        title: "鉄分吸収効率の計算ロジック改善",
        priority: "中",
        implementation_target_date: "2024-03-01",
        business_value_score: 6,
        technical_difficulty_score: 7,
        user_impact_score: 5,
        dependencies: ["PROP-001"],
      },
      {
        proposal_id: "PROP-003",
        title: "カルシウム摂取量の栄養目標値調整",
        priority: "低",
        implementation_target_date: "2024-03-15",
        business_value_score: 4,
        technical_difficulty_score: 4,
        user_impact_score: 3,
        dependencies: [],
      },
      {
        proposal_id: "PROP-004",
        title: "ビタミンB群複合計算ロジック",
        priority: "高",
        implementation_target_date: "2024-02-28",
        business_value_score: 8,
        technical_difficulty_score: 8,
        user_impact_score: 7,
        dependencies: ["PROP-001"],
      },
    ];

    // ========== Action: 優先度付けと通知スケジュール確定を実行 ==========
    const result = describePrioritizeAndScheduleNotificationForImprovementProposals(
      improvementProposals
    );

    // ========== Assertion: 優先度順のソート検証 ==========
    expect(result.sorted_proposals).toHaveLength(4);
    expect(result.sorted_proposals[0].proposal_id).toBe("PROP-001");
    expect(result.sorted_proposals[0].priority).toBe("高");
    expect(result.sorted_proposals[1].proposal_id).toBe("PROP-004");
    expect(result.sorted_proposals[1].priority).toBe("高");
    expect(result.sorted_proposals[2].proposal_id).toBe("PROP-002");
    expect(result.sorted_proposals[2].priority).toBe("中");
    expect(result.sorted_proposals[3].proposal_id).toBe("PROP-003");
    expect(result.sorted_proposals[3].priority).toBe("低");

    // ========== Assertion: 各提案の依存関係情報が正しく表示される ==========
    expect(result.sorted_proposals[0].dependencies).toEqual([]);
    expect(result.sorted_proposals[1].dependencies).toEqual(["PROP-001"]);
    expect(result.sorted_proposals[2].dependencies).toEqual(["PROP-001"]);
    expect(result.sorted_proposals[3].dependencies).toEqual([]);

    // ========== Assertion: 実装予定時期が正しく保持されている ==========
    expect(result.sorted_proposals[0].implementation_target_date).toBe(
      "2024-02-15"
    );
    expect(result.sorted_proposals[1].implementation_target_date).toBe(
      "2024-02-28"
    );
    expect(result.sorted_proposals[2].implementation_target_date).toBe(
      "2024-03-01"
    );
    expect(result.sorted_proposals[3].implementation_target_date).toBe(
      "2024-03-15"
    );

    // ========== Assertion: 通知スケジュール情報が生成される ==========
    expect(result.notification_schedule).toBeDefined();
    expect(result.notification_schedule.scheduled_notifications).toHaveLength(4);

    // ========== Assertion: 高優先度提案の通知が最初にスケジュールされる ==========
    const first_notification = result.notification_schedule.scheduled_notifications[0];
    expect(first_notification.proposal_id).toBe("PROP-001");
    expect(first_notification.notification_target_date).toBe("2024-02-08");
    expect(first_notification.priority).toBe("高");
    expect(first_notification.notification_type).toBe("development_team_request");

    // ========== Assertion: 依存関係のある提案（PROP-002）は依存先（PROP-001）の実装予定日を考慮 ==========
    const prop002_notification = result.notification_schedule.scheduled_notifications[2];
    expect(prop002_notification.proposal_id).toBe("PROP-002");
    expect(prop002_notification.dependencies).toContain("PROP-001");
    expect(prop002_notification.dependency_aware_date).toBe("2024-03-01");

    // ========== Assertion: 中優先度提案のスケジュール ==========
    const medium_notification = result.notification_schedule.scheduled_notifications[2];
    expect(medium_notification.priority).toBe("中");
    expect(medium_notification.notification_target_date).toBe("2024-02-22");

    // ========== Assertion: 低優先度提案のスケジュール ==========
    const low_notification = result.notification_schedule.scheduled_notifications[3];
    expect(low_notification.proposal_id).toBe("PROP-003");
    expect(low_notification.priority).toBe("低");
    expect(low_notification.notification_target_date).toBe("2024-03-08");
    expect(low_notification.dependencies).toEqual([]);

    // ========== Assertion: 通知スケジュール確定情報 ==========
    expect(result.notification_schedule.schedule_confirmation_status).toBe(
      "confirmed"
    );
    expect(result.notification_schedule.confirmed_at).toBeDefined();
    expect(result.notification_schedule.sla_days).toBe(5);

    // ========== Assertion: 優先度スコアリング計算値の検証 ==========
    expect(result.sorted_proposals[0].total_priority_score).toBe(23);
    expect(result.sorted_proposals[1].total_priority_score).toBe(23);
    expect(result.sorted_proposals[2].total_priority_score).toBe(18);
    expect(result.sorted_proposals[3].total_priority_score).toBe(11);

    // ========== Assertion: 依存関係チェーンの検証 ==========
    expect(result.dependency_chain).toBeDefined();
    expect(result.dependency_chain.chains).toHaveLength(2);
    expect(result.dependency_chain.chains[0]).toEqual({
      chain_id: "CHAIN-001",
      proposals: ["PROP-001", "PROP-002"],
      earliest_start_date: "2024-02-15",
      estimated_completion_date: "2024-03-01",
    });
    expect(result.dependency_chain.chains[1]).toEqual({
      chain_id: "CHAIN-002",
      proposals: ["PROP-001", "PROP-004"],
      earliest_start_date: "2024-02-15",
      estimated_completion_date: "2024-02-28",
    });

    // ========== Assertion: 実装予定時期の自動調整がないことを確認 ==========
    expect(result.schedule_adjustment_details).toBeDefined();
    expect(result.schedule_adjustment_details.has_adjustments).toBe(false);
    expect(result.schedule_adjustment_details.adjusted_proposals).toEqual([]);

    // ========== Assertion: 確定されたスケジュール詳細の構造検証 ==========
    expect(result.schedule_details).toBeDefined();
    expect(result.schedule_details.total_proposals).toBe(4);
    expect(result.schedule_details.high_priority_count).toBe(2);
    expect(result.schedule_details.medium_priority_count).toBe(1);
    expect(result.schedule_details.low_priority_count).toBe(1);
    expect(result.schedule_details.proposals_with_dependencies).toBe(2);

    // ========== Assertion: 通知リストが優先度順に正しく並んでいる ==========
    expect(
      result.notification_schedule.scheduled_notifications.every(
        (n, idx, arr) =>
          idx === 0 ||
          (arr[idx - 1].priority === "高" && n.priority === "高") ||
          (arr[idx - 1].priority === "高" && n.priority === "中") ||
          (arr[idx - 1].priority === "高" && n.priority === "低") ||
          (arr[idx - 1].priority === "中" && n.priority === "中") ||
          (arr[idx - 1].priority === "中" && n.priority === "低") ||
          (arr[idx - 1].priority === "低" && n.priority === "低")
      )
    ).toBe(true);

    // ========== Assertion: 通知日時が実装予定日の1週間前に設定されている ==========
    result.notification_schedule.scheduled_notifications.forEach((notification) => {
      const target_date = new Date(notification.implementation_target_date);
      const notification_date = new Date(notification.notification_target_date);
      const days_diff =
        (target_date.getTime() - notification_date.getTime()) / (1000 * 60 * 60 * 24);
      expect(days_diff).toBeCloseTo(7, 1);
    });

    // ========== Assertion: システム状態遷移の検証 ==========
    expect(result.system_status).toBe("notification_schedule_confirmed");
    expect(result.next_step_instruction).toBe(
      "development_team_notification_dispatch"
    );
  });
});