import { assignTrustScoreToPredictorInput } from "../../src/logic/it-1-br-6-2-1-1";

describe("External Factor Data Trust Score Assignment and Adoption Judgment", () => {
  test("SCEN-470: External factor data with trust score 45 should be excluded from predictor model input when adoption threshold is 80", () => {
    const competitor_tactic_id = "comp_tactic_001";
    const competitor_tactic_name = "competitor_weekend_sale";
    const trust_score_assigned = 45;
    const adoption_threshold = 80;
    const data_source_timestamp = new Date("2024-01-15T10:30:00Z");
    const system_log_entries: Array<{
      event_type: string;
      data_id: string;
      trust_score: number;
      threshold: number;
      decision: string;
      reason: string;
      recorded_at: Date;
    }> = [];

    const external_factor_input = {
      competitor_tactic_id,
      competitor_tactic_name,
      trust_score: trust_score_assigned,
      adoption_threshold,
      data_source_timestamp,
      system_log: system_log_entries,
    };

    const result = assignTrustScoreToPredictorInput(external_factor_input);

    expect(result.is_adopted).toBe(false);
    expect(result.trust_score).toBe(45);
    expect(result.adoption_threshold).toBe(80);
    expect(result.adoption_decision_reason).toMatch(/信頼度スコア|trust.*score/i);
    expect(result.adoption_decision_reason).toMatch(/除外|exclude/i);
    expect(result.log_entry).toBeDefined();
    expect(result.log_entry.event_type).toBe("adoption_judgment");
    expect(result.log_entry.data_id).toBe("comp_tactic_001");
    expect(result.log_entry.trust_score).toBe(45);
    expect(result.log_entry.threshold).toBe(80);
    expect(result.log_entry.decision).toBe("excluded");
    expect(result.log_entry.reason).toMatch(/基準|threshold/i);
    expect(result.predictor_model_input_candidates).toEqual([]);
    expect(result.is_included_in_model_input).toBe(false);
  });
});