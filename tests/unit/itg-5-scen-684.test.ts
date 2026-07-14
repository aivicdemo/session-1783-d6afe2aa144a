import {
  aggregateImprovementProposals,
  sortProposalsByPriority,
  sortProposalsByImplementationDate,
  validateDependencyChain,
  reflectProposalUpdate,
} from "../../src/logic/it-7-2-1";

describe("Weekly Algorithm Improvement Metrics Aggregation and Comparison Dashboard", () => {
  // SCEN-684: [normal] 改善提案一覧化・スケジュール通知 - 改善提案の優先度・実装予定時期・依存関係を正しく一覧化する
  test("should aggregate and display improvement proposals with priority, implementation date, and dependencies correctly", () => {
    const input_proposals = [
      {
        proposal_id: "PROP-001",
        proposal_name: "Nutritional balance algorithm enhancement",
        priority_score: 85,
        implementation_date: new Date("2024-02-15T09:00:00Z"),
        dependencies: ["PROP-002"],
        status: "approved",
      },
      {
        proposal_id: "PROP-002",
        proposal_name: "Family preference learning module",
        priority_score: 92,
        implementation_date: new Date("2024-02-01T09:00:00Z"),
        dependencies: [],
        status: "approved",
      },
      {
        proposal_id: "PROP-003",
        proposal_name: "Real-time inventory integration",
        priority_score: 78,
        implementation_date: new Date("2024-02-22T09:00:00Z"),
        dependencies: ["PROP-002", "PROP-004"],
        status: "approved",
      },
      {
        proposal_id: "PROP-004",
        proposal_name: "Budget constraint optimizer",
        priority_score: 88,
        implementation_date: new Date("2024-02-08T09:00:00Z"),
        dependencies: [],
        status: "approved",
      },
    ];

    // Test 1: Aggregate proposals correctly
    const aggregated_result = aggregateImprovementProposals(input_proposals);

    expect(aggregated_result).toEqual(
      expect.objectContaining({
        total_proposals: 4,
        proposals: expect.arrayContaining([
          expect.objectContaining({
            proposal_id: "PROP-001",
            priority_score: 85,
            implementation_date: new Date("2024-02-15T09:00:00Z"),
          }),
          expect.objectContaining({
            proposal_id: "PROP-002",
            priority_score: 92,
            implementation_date: new Date("2024-02-01T09:00:00Z"),
          }),
          expect.objectContaining({
            proposal_id: "PROP-003",
            priority_score: 78,
            implementation_date: new Date("2024-02-22T09:00:00Z"),
          }),
          expect.objectContaining({
            proposal_id: "PROP-004",
            priority_score: 88,
            implementation_date: new Date("2024-02-08T09:00:00Z"),
          }),
        ]),
      })
    );

    // Test 2: Sort by priority in descending order
    const sorted_by_priority = sortProposalsByPriority(
      aggregated_result.proposals,
      "descending"
    );

    expect(sorted_by_priority[0].priority_score).toBe(92); // PROP-002
    expect(sorted_by_priority[1].priority_score).toBe(88); // PROP-004
    expect(sorted_by_priority[2].priority_score).toBe(85); // PROP-001
    expect(sorted_by_priority[3].priority_score).toBe(78); // PROP-003

    expect(sorted_by_priority[0].proposal_id).toBe("PROP-002");
    expect(sorted_by_priority[1].proposal_id).toBe("PROP-004");
    expect(sorted_by_priority[2].proposal_id).toBe("PROP-001");
    expect(sorted_by_priority[3].proposal_id).toBe("PROP-003");

    // Test 3: Sort by implementation date in ascending order
    const sorted_by_date = sortProposalsByImplementationDate(
      aggregated_result.proposals,
      "ascending"
    );

    expect(sorted_by_date[0].implementation_date).toEqual(
      new Date("2024-02-01T09:00:00Z")
    ); // PROP-002
    expect(sorted_by_date[1].implementation_date).toEqual(
      new Date("2024-02-08T09:00:00Z")
    ); // PROP-004
    expect(sorted_by_date[2].implementation_date).toEqual(
      new Date("2024-02-15T09:00:00Z")
    ); // PROP-001
    expect(sorted_by_date[3].implementation_date).toEqual(
      new Date("2024-02-22T09:00:00Z")
    ); // PROP-003

    expect(sorted_by_date[0].proposal_id).toBe("PROP-002");
    expect(sorted_by_date[1].proposal_id).toBe("PROP-004");
    expect(sorted_by_date[2].proposal_id).toBe("PROP-001");
    expect(sorted_by_date[3].proposal_id).toBe("PROP-003");

    // Test 4: Validate all dependencies are displayed
    const dependency_validation = {
      proposal_id_with_single_dependency: "PROP-001",
      expected_dependencies: ["PROP-002"],
      proposal_id_with_multiple_dependencies: "PROP-003",
      expected_dependencies_multiple: ["PROP-002", "PROP-004"],
    };

    const proposal_001 = aggregated_result.proposals.find(
      (p) => p.proposal_id === "PROP-001"
    );
    expect(proposal_001.dependencies).toEqual(["PROP-002"]);

    const proposal_003 = aggregated_result.proposals.find(
      (p) => p.proposal_id === "PROP-003"
    );
    expect(proposal_003.dependencies).toEqual(["PROP-002", "PROP-004"]);
    expect(proposal_003.dependencies.length).toBe(2);

    // Test 5: Validate dependency chain is correct
    const dependency_chain_valid = validateDependencyChain(
      aggregated_result.proposals
    );
    expect(dependency_chain_valid.is_valid).toBe(true);
    expect(dependency_chain_valid.circular_dependency_detected).toBe(false);

    // Test 6: Reflect proposal update immediately
    const updated_proposal = {
      proposal_id: "PROP-001",
      priority_score: 95,
      implementation_date: new Date("2024-02-20T09:00:00Z"),
      dependencies: ["PROP-002", "PROP-004"],
      proposal_name: "Nutritional balance algorithm enhancement (updated)",
      status: "approved",
    };

    const updated_proposals_list = reflectProposalUpdate(
      aggregated_result.proposals,
      updated_proposal
    );

    const updated_prop_001 = updated_proposals_list.find(
      (p) => p.proposal_id === "PROP-001"
    );
    expect(updated_prop_001.priority_score).toBe(95);
    expect(updated_prop_001.implementation_date).toEqual(
      new Date("2024-02-20T09:00:00Z")
    );
    expect(updated_prop_001.dependencies).toEqual(["PROP-002", "PROP-004"]);
    expect(updated_prop_001.dependencies.length).toBe(2);

    // Test 7: Re-sort after update
    const resorted_after_update = sortProposalsByPriority(
      updated_proposals_list,
      "descending"
    );

    expect(resorted_after_update[0].proposal_id).toBe("PROP-001"); // PROP-001 now has priority 95, highest
    expect(resorted_after_update[0].priority_score).toBe(95);
    expect(resorted_after_update[1].proposal_id).toBe("PROP-002");
    expect(resorted_after_update[1].priority_score).toBe(92);

    // Test 8: Verify all proposals still present after update
    expect(updated_proposals_list.length).toBe(4);
    expect(updated_proposals_list.map((p) => p.proposal_id)).toEqual(
      expect.arrayContaining(["PROP-001", "PROP-002", "PROP-003", "PROP-004"])
    );

    // Test 9: Validate proposal with no dependencies
    const proposal_002 = aggregated_result.proposals.find(
      (p) => p.proposal_id === "PROP-002"
    );
    expect(proposal_002.dependencies).toEqual([]);
    expect(proposal_002.dependencies.length).toBe(0);

    // Test 10: Confirm date-sorted order maintains all dependency info
    const final_date_sorted = sortProposalsByImplementationDate(
      updated_proposals_list,
      "ascending"
    );
    expect(final_date_sorted[0].proposal_id).toBe("PROP-002");
    expect(final_date_sorted[0].implementation_date).toEqual(
      new Date("2024-02-01T09:00:00Z")
    );
    expect(final_date_sorted[1].proposal_id).toBe("PROP-004");
    expect(final_date_sorted[2].proposal_id).toBe("PROP-001");
    expect(final_date_sorted[2].implementation_date).toEqual(
      new Date("2024-02-20T09:00:00Z")
    );
    expect(final_date_sorted[3].proposal_id).toBe("PROP-003");
  });
});