import { prioritizeImprovementProposalAndNotifyDevelopmentTeam } from "../../src/logic/it-1-br-2-1-2-1";

describe("Nutritionist improvement proposal prioritization and development team notification", () => {
  // SCEN-357
  test("should not send notification to development team when improvement proposal priority is not set", () => {
    const input_improvement_proposal = {
      proposal_id: "PROP-20240115-001",
      title: "Enhanced allergy detection algorithm",
      description: "Improve accuracy of family member allergy detection in meal generation logic",
      category: "nutrition_constraint",
      priority: null,
      created_timestamp: new Date("2024-01-15T10:00:00Z"),
      created_by_nutritionist_id: "NUT-2024-001",
      status: "pending_priority",
    };

    const result = prioritizeImprovementProposalAndNotifyDevelopmentTeam(
      input_improvement_proposal
    );

    expect(result.notification_sent).toBe(false);
    expect(result.notification_log_entry).toBeNull();
    expect(result.status).toBe("pending_priority");
    expect(result.priority).toBeNull();
  });
});