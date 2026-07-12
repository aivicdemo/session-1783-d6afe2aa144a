import { assignPriorityMatrixToImprovementProposals } from '../../src/logic/it-2';

describe('Family meal evaluation data accumulation and management - Priority matrix auto-assignment', () => {
  // SCEN-610
  test('should automatically assign priority ranks (high/medium/low) based on impact and implementation difficulty 2-axis matrix', () => {
    const input_proposals = [
      {
        proposal_id: 'IMP-001',
        title: 'Improve nutritional balance algorithm',
        description: 'Adjust macro nutrient calculation logic',
        impact_level: 'high',
        implementation_difficulty: 'low',
      },
      {
        proposal_id: 'IMP-002',
        title: 'Add real-time inventory sync',
        description: 'Connect to supermarket API for live stock updates',
        impact_level: 'medium',
        implementation_difficulty: 'medium',
      },
      {
        proposal_id: 'IMP-003',
        title: 'Implement ML-based meal recommendation',
        description: 'Deploy machine learning model for personalized suggestions',
        impact_level: 'low',
        implementation_difficulty: 'high',
      },
    ];

    const result = assignPriorityMatrixToImprovementProposals(input_proposals);

    expect(result).toHaveLength(3);

    const proposal_1 = result.find((p: { proposal_id: string }) => p.proposal_id === 'IMP-001');
    expect(proposal_1).toBeDefined();
    expect(proposal_1.priority_rank).toBe('high');
    expect(proposal_1.matrix_score).toBe(90);

    const proposal_2 = result.find((p: { proposal_id: string }) => p.proposal_id === 'IMP-002');
    expect(proposal_2).toBeDefined();
    expect(proposal_2.priority_rank).toBe('medium');
    expect(proposal_2.matrix_score).toBe(50);

    const proposal_3 = result.find((p: { proposal_id: string }) => p.proposal_id === 'IMP-003');
    expect(proposal_3).toBeDefined();
    expect(proposal_3.priority_rank).toBe('low');
    expect(proposal_3.matrix_score).toBe(20);

    expect(result[0].assigned_at).toBeDefined();
    expect(typeof result[0].assigned_at).toBe('string');
  });
});