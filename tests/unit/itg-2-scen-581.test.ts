import { evaluateNutritionImprovementProposal } from '../../src/logic/it-1-br-2-1-2-1';

describe('Nutrition Improvement Proposal Evaluation', () => {
  test('SCEN-581: Nutritionist validates improvement proposal against verification criteria and renders approval judgment', () => {
    // Arrange: Improvement proposal with proposed changes
    const improvement_proposal_input = {
      proposal_id: 'PROP-2024-001',
      nutritionist_id: 'NUT-001',
      proposal_type: 'nutritional_balance_adjustment',
      proposed_nutrient_changes: [
        {
          nutrient_name: 'protein',
          current_daily_intake_g: 45,
          recommended_daily_intake_g: 55,
          gap_percentage: 18.2
        },
        {
          nutrient_name: 'calcium',
          current_daily_intake_mg: 600,
          recommended_daily_intake_mg: 800,
          gap_percentage: 25.0
        }
      ],
      implementation_feasibility_score: 8.5,
      affected_user_segment_count: 342,
      affected_meal_pattern_count: 12,
      expected_effectiveness_score: 8.8,
      supporting_evidence_data: {
        sample_size: 156,
        statistical_confidence_level: 0.95,
        is_clinically_significant: true
      }
    };

    const verification_criteria = {
      nutritional_balance_weight: 0.35,
      safety_weight: 0.30,
      feasibility_weight: 0.20,
      effectiveness_prediction_weight: 0.15,
      minimum_passing_score: 7.0,
      safety_threshold_min: 6.5,
      feasibility_threshold_min: 6.0,
      effectiveness_threshold_min: 6.5
    };

    const nutritionist_evaluation_input = {
      proposal_id: improvement_proposal_input.proposal_id,
      nutritionist_id: improvement_proposal_input.nutritionist_id,
      nutritional_balance_score: 8.5,
      nutritional_balance_comment: 'Addresses critical protein and calcium gaps with realistic dietary adjustments.',
      safety_score: 8.0,
      safety_comment: 'No contraindications detected. Proposed changes align with medical and dietary guidelines.',
      feasibility_score: 8.2,
      feasibility_comment: 'Implementation is straightforward through menu substitutions.',
      effectiveness_prediction_score: 8.6,
      effectiveness_prediction_comment: 'Evidence-based approach with high confidence of achieving target intake levels.',
      evaluation_timestamp: new Date('2024-02-15T14:30:00Z'),
      evaluation_notes: 'High-quality proposal with strong clinical support.'
    };

    // Act: Call the evaluation function
    const evaluation_result = evaluateNutritionImprovementProposal(
      improvement_proposal_input,
      verification_criteria,
      nutritionist_evaluation_input
    );

    // Assert: Verify evaluation output structure
    expect(evaluation_result).toBeDefined();
    expect(evaluation_result.proposal_id).toBe('PROP-2024-001');
    expect(evaluation_result.nutritionist_id).toBe('NUT-001');
    expect(evaluation_result.evaluation_timestamp).toEqual(new Date('2024-02-15T14:30:00Z'));

    // Assert: Verify component scores are recorded
    expect(evaluation_result.nutritional_balance_score).toBe(8.5);
    expect(evaluation_result.safety_score).toBe(8.0);
    expect(evaluation_result.feasibility_score).toBe(8.2);
    expect(evaluation_result.effectiveness_prediction_score).toBe(8.6);

    // Assert: Verify weighted aggregate calculation
    // Formula: (8.5 * 0.35) + (8.0 * 0.30) + (8.2 * 0.20) + (8.6 * 0.15)
    // = 2.975 + 2.4 + 1.64 + 1.29 = 8.305
    expect(evaluation_result.weighted_aggregate_score).toBe(8.305);

    // Assert: Verify all component scores meet individual thresholds
    expect(evaluation_result.nutritional_balance_score).toBeGreaterThanOrEqual(verification_criteria.nutritional_balance_weight * 10);
    expect(evaluation_result.safety_score).toBeGreaterThanOrEqual(verification_criteria.safety_threshold_min);
    expect(evaluation_result.feasibility_score).toBeGreaterThanOrEqual(verification_criteria.feasibility_threshold_min);
    expect(evaluation_result.effectiveness_prediction_score).toBeGreaterThanOrEqual(verification_criteria.effectiveness_threshold_min);

    // Assert: Verify approval judgment against minimum passing score
    expect(evaluation_result.weighted_aggregate_score).toBeGreaterThanOrEqual(verification_criteria.minimum_passing_score);
    expect(evaluation_result.approval_judgment).toBe('approved');
    expect(evaluation_result.approval_justification).toBe('All verification criteria thresholds met; weighted aggregate score 8.305 exceeds minimum 7.0');

    // Assert: Verify evaluation comments are preserved
    expect(evaluation_result.nutritional_balance_comment).toBe('Addresses critical protein and calcium gaps with realistic dietary adjustments.');
    expect(evaluation_result.safety_comment).toBe('No contraindications detected. Proposed changes align with medical and dietary guidelines.');
    expect(evaluation_result.feasibility_comment).toBe('Implementation is straightforward through menu substitutions.');
    expect(evaluation_result.effectiveness_prediction_comment).toBe('Evidence-based approach with high confidence of achieving target intake levels.');
    expect(evaluation_result.evaluation_notes).toBe('High-quality proposal with strong clinical support.');

    // Assert: Verify status transition audit fields
    expect(evaluation_result.previous_status).toBe('pending_review');
    expect(evaluation_result.new_status).toBe('approved');
    expect(evaluation_result.status_change_reason).toBe('Nutritionist evaluation completed with approval judgment');
    expect(evaluation_result.status_changed_by).toBe('NUT-001');
    expect(evaluation_result.status_change_timestamp).toEqual(new Date('2024-02-15T14:30:00Z'));

    // Assert: Verify affected impact metrics are preserved
    expect(evaluation_result.affected_user_segment_count).toBe(342);
    expect(evaluation_result.affected_meal_pattern_count).toBe(12);
    expect(evaluation_result.expected_effectiveness_score).toBe(8.8);

    // Assert: Verify proposal impact data for next stage
    expect(evaluation_result.implementation_feasibility_score).toBe(8.5);
    expect(evaluation_result.proposal_type).toBe('nutritional_balance_adjustment');

    // Assert: Verify the proposal is now ready for development team intake
    expect(evaluation_result.ready_for_dev_team_intake).toBe(true);

    // Assert: Verify audit trail completeness
    expect(evaluation_result.audit_trail).toBeDefined();
    expect(evaluation_result.audit_trail.length).toBeGreaterThan(0);
    const approval_audit_entry = evaluation_result.audit_trail.find(
      (entry: any) => entry.action === 'approval_judgment_rendered'
    );
    expect(approval_audit_entry).toBeDefined();
    expect(approval_audit_entry.actor).toBe('NUT-001');
    expect(approval_audit_entry.timestamp).toEqual(new Date('2024-02-15T14:30:00Z'));
    expect(approval_audit_entry.judgment).toBe('approved');
    expect(approval_audit_entry.aggregate_score).toBe(8.305);
  });
});