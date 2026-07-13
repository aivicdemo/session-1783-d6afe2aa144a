import { generateImprovementProposals } from '../../src/logic/it-1-br-3-2-1';

describe('Demand Forecast Accuracy Divergence Analysis and Improvement Proposal Generation', () => {
  // SCEN-372
  test('should generate improvement proposals when forecast accuracy is at threshold boundary', () => {
    // Setup: Test data with forecast accuracy at threshold (80%)
    const forecastAccuracyAtThreshold = 80.0;
    const predictionData = {
      product_id: 'P001',
      predicted_demand: 100,
      actual_demand: 100,
      forecast_date: new Date('2024-01-15T11:00:00Z'),
      category: 'vegetable',
    };
    const analysisAtThreshold = {
      forecast_accuracy: forecastAccuracyAtThreshold,
      divergence_percentage: 0.0,
      prediction_data: predictionData,
      external_factors: {
        weather: 'sunny',
        event: null,
        competitor_action: null,
      },
    };

    // Execute: Run improvement proposal generation at threshold (should NOT trigger)
    const proposalsAtThreshold = generateImprovementProposals(analysisAtThreshold);
    expect(proposalsAtThreshold).toHaveLength(0);

    // Adjust: Lower forecast accuracy to boundary below threshold (79.99%)
    const forecastAccuracyBelowThreshold = 79.99;
    const analysisBelowThreshold = {
      forecast_accuracy: forecastAccuracyBelowThreshold,
      divergence_percentage: 20.01,
      prediction_data: {
        product_id: 'P001',
        predicted_demand: 100,
        actual_demand: 120,
        forecast_date: new Date('2024-01-15T11:00:00Z'),
        category: 'vegetable',
      },
      external_factors: {
        weather: 'rainy',
        event: 'holiday_sale',
        competitor_action: 'price_cut',
      },
    };

    // Trigger: Generate improvement proposals when accuracy falls below threshold
    const proposalsBelowThreshold = generateImprovementProposals(analysisBelowThreshold);

    // Verify: Proposals are generated
    expect(proposalsBelowThreshold.length).toBeGreaterThan(0);

    // Verify: Each proposal contains required fields
    proposalsBelowThreshold.forEach((proposal: any) => {
      expect(proposal).toHaveProperty('proposal_id');
      expect(proposal).toHaveProperty('root_cause_analysis');
      expect(proposal).toHaveProperty('improvement_action');
      expect(proposal).toHaveProperty('priority_score');
      expect(proposal).toHaveProperty('implementation_difficulty');
      expect(proposal).toHaveProperty('estimated_impact');
    });

    // Verify: Root cause analysis is present and references external factors
    const firstProposal = proposalsBelowThreshold[0];
    expect(firstProposal.root_cause_analysis).toBeTruthy();
    expect(typeof firstProposal.root_cause_analysis).toBe('string');
    expect(firstProposal.root_cause_analysis.length).toBeGreaterThan(0);

    // Verify: Improvement action is specific and actionable
    expect(firstProposal.improvement_action).toBeTruthy();
    expect(typeof firstProposal.improvement_action).toBe('string');
    expect(firstProposal.improvement_action.length).toBeGreaterThan(0);

    // Verify: Priority score is based on divergence magnitude
    // Divergence: 20.01% → priority should reflect high impact (0-100 scale)
    expect(firstProposal.priority_score).toBeGreaterThanOrEqual(0);
    expect(firstProposal.priority_score).toBeLessThanOrEqual(100);
    expect(firstProposal.priority_score).toBeGreaterThanOrEqual(70); // High divergence = high priority

    // Verify: Implementation difficulty is rated
    expect(firstProposal.implementation_difficulty).toBeGreaterThanOrEqual(1);
    expect(firstProposal.implementation_difficulty).toBeLessThanOrEqual(5);

    // Verify: Estimated impact is numeric
    expect(typeof firstProposal.estimated_impact).toBe('number');
    expect(firstProposal.estimated_impact).toBeGreaterThanOrEqual(0);
    expect(firstProposal.estimated_impact).toBeLessThanOrEqual(100);

    // Verify: Proposals are sorted by priority in descending order
    for (let i = 0; i < proposalsBelowThreshold.length - 1; i++) {
      expect(proposalsBelowThreshold[i].priority_score).toBeGreaterThanOrEqual(
        proposalsBelowThreshold[i + 1].priority_score
      );
    }

    // Verify: Data accuracy - proposals reference original divergence analysis
    proposalsBelowThreshold.forEach((proposal: any) => {
      expect(proposal.analysis_reference).toBeDefined();
      expect(proposal.analysis_reference.divergence_percentage).toBe(20.01);
      expect(proposal.analysis_reference.forecast_accuracy).toBe(79.99);
    });

    // Verify: Multiple proposals exist when divergence is significant
    // Divergence 20.01% should generate at least 2 distinct proposals
    expect(proposalsBelowThreshold.length).toBeGreaterThanOrEqual(2);

    // Verify: Proposals include external factor consideration
    const externalFactorMentioned = proposalsBelowThreshold.some((p: any) =>
      /weather|event|competitor|external/.test(p.root_cause_analysis.toLowerCase())
    );
    expect(externalFactorMentioned).toBe(true);

    // Verify: Return format is executable for users
    expect(Array.isArray(proposalsBelowThreshold)).toBe(true);
    expect(proposalsBelowThreshold[0]).toHaveProperty('proposal_id');
    expect(typeof proposalsBelowThreshold[0].proposal_id).toBe('string');

    // Edge case: Verify exact boundary value (79.99%)
    const proposalsAtExactBoundary = generateImprovementProposals({
      forecast_accuracy: 79.99,
      divergence_percentage: 20.01,
      prediction_data: {
        product_id: 'P002',
        predicted_demand: 50,
        actual_demand: 60,
        forecast_date: new Date('2024-01-16T11:00:00Z'),
        category: 'dairy',
      },
      external_factors: {
        weather: 'cloudy',
        event: null,
        competitor_action: 'bundled_offer',
      },
    });
    expect(proposalsAtExactBoundary.length).toBeGreaterThan(0);

    // Edge case: Verify accuracy just above threshold still triggers (79.99% vs 80%)
    const proposalsSlightlyBelow = generateImprovementProposals({
      forecast_accuracy: 79.98,
      divergence_percentage: 20.02,
      prediction_data: {
        product_id: 'P003',
        predicted_demand: 75,
        actual_demand: 90,
        forecast_date: new Date('2024-01-17T11:00:00Z'),
        category: 'meat',
      },
      external_factors: {
        weather: 'snowy',
        event: 'new_year_promotion',
        competitor_action: 'discount',
      },
    });
    expect(proposalsSlightlyBelow.length).toBeGreaterThan(0);
    expect(proposalsSlightlyBelow[0].priority_score).toBeGreaterThanOrEqual(70);
  });
});