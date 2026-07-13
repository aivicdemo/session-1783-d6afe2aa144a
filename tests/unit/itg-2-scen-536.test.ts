import { prioritizeImprovementProposals } from "../../src/logic/it-1-br-2-1-2-1";

describe("改善提案優先度通知機能", () => {
  // SCEN-536
  test("改善課題リストが優先度スコアリング後、5営業日以内に開発チームへ定期通知される", () => {
    const scoring_completed_at = new Date("2024-02-09T14:30:00Z");
    const improvement_proposals = [
      {
        proposal_id: "PROP-001",
        title: "栄養項目の推奨値改善",
        business_value_score: 8,
        technical_difficulty_score: 5,
        user_impact_score: 7,
      },
      {
        proposal_id: "PROP-002",
        title: "アレルギー検知の精度向上",
        business_value_score: 9,
        technical_difficulty_score: 6,
        user_impact_score: 9,
      },
      {
        proposal_id: "PROP-003",
        title: "調理時間見積もりロジック改善",
        business_value_score: 6,
        technical_difficulty_score: 4,
        user_impact_score: 5,
      },
    ];

    const notification_deadline_business_days = 5;
    const dev_team_emails = [
      "dev-lead@company.com",
      "dev-engineer1@company.com",
      "dev-engineer2@company.com",
    ];

    const result = prioritizeImprovementProposals({
      improvement_proposals,
      scoring_completed_at,
      notification_deadline_business_days,
      dev_team_emails,
    });

    expect(result.prioritized_proposals).toHaveLength(3);

    const sorted_proposals = result.prioritized_proposals;

    expect(sorted_proposals[0].proposal_id).toBe("PROP-002");
    expect(sorted_proposals[0].priority_score).toBe(24);
    expect(sorted_proposals[0].priority_rank).toBe(1);

    expect(sorted_proposals[1].proposal_id).toBe("PROP-001");
    expect(sorted_proposals[1].priority_score).toBe(20);
    expect(sorted_proposals[1].priority_rank).toBe(2);

    expect(sorted_proposals[2].proposal_id).toBe("PROP-003");
    expect(sorted_proposals[2].priority_score).toBe(15);
    expect(sorted_proposals[2].priority_rank).toBe(3);

    expect(result.notification_scheduled_at).toEqual(
      new Date("2024-02-16T09:00:00Z")
    );

    expect(result.notification_recipients).toEqual(dev_team_emails);
    expect(result.notification_recipients).toHaveLength(3);

    expect(result.notification_status).toBe("scheduled");

    expect(result.business_days_until_notification).toBe(5);

    expect(result.notification_content.includes("PROP-002")).toBe(true);
    expect(result.notification_content.includes("PROP-001")).toBe(true);
    expect(result.notification_content.includes("PROP-003")).toBe(true);

    const prop_002_index = result.notification_content.indexOf("PROP-002");
    const prop_001_index = result.notification_content.indexOf("PROP-001");
    const prop_003_index = result.notification_content.indexOf("PROP-003");

    expect(prop_002_index < prop_001_index).toBe(true);
    expect(prop_001_index < prop_003_index).toBe(true);

    expect(result.audit_log).toBeDefined();
    expect(result.audit_log.scored_at).toEqual(scoring_completed_at);
    expect(result.audit_log.notified_proposals_count).toBe(3);
    expect(result.audit_log.recipients_count).toBe(3);
  });
});