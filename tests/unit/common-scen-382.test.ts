import { optimizeMenuScoringBySegmentPreference } from '../../src/logic/common';

describe('Menu Optimization Scoring by User Segment Preference', () => {
  // SCEN-382
  test('should rank menu proposals with identical priority scores by segment-specific preferences', () => {
    // Setup: Multiple menu proposals with identical priority score (100)
    const menuProposals = [
      {
        menuProposalId: 'menu_001',
        name: 'Traditional Japanese Set',
        priorityScore: 100,
        cuisineType: 'Japanese',
      },
      {
        menuProposalId: 'menu_002',
        name: 'Italian Pasta Platter',
        priorityScore: 100,
        cuisineType: 'Western',
      },
      {
        menuProposalId: 'menu_003',
        name: 'Thai Green Curry',
        priorityScore: 100,
        cuisineType: 'Asian',
      },
    ];

    // Setup: Multiple user segments with different preference profiles
    const userSegments = [
      {
        segmentId: 'seg_001',
        segmentName: 'Japanese Food Enthusiasts',
        preferredCuisineTypes: ['Japanese'],
        preferenceWeights: {
          Japanese: 0.9,
          Western: 0.3,
          Asian: 0.5,
        },
      },
      {
        segmentId: 'seg_002',
        segmentName: 'Western Cuisine Lovers',
        preferredCuisineTypes: ['Western'],
        preferenceWeights: {
          Japanese: 0.4,
          Western: 0.95,
          Asian: 0.6,
        },
      },
      {
        segmentId: 'seg_003',
        segmentName: 'Asian Cuisine Fans',
        preferredCuisineTypes: ['Asian'],
        preferenceWeights: {
          Japanese: 0.5,
          Western: 0.3,
          Asian: 0.85,
        },
      },
    ];

    // Execute: Run scoring algorithm for each segment
    const segmentAResult = optimizeMenuScoringBySegmentPreference(
      menuProposals,
      userSegments[0]
    );
    const segmentBResult = optimizeMenuScoringBySegmentPreference(
      menuProposals,
      userSegments[1]
    );
    const segmentCResult = optimizeMenuScoringBySegmentPreference(
      menuProposals,
      userSegments[2]
    );

    // Verify: Segment A (Japanese preference) ranks Japanese menu first
    expect(segmentAResult[0].menuProposalId).toBe('menu_001');
    expect(segmentAResult[0].adjustedScore).toBe(90); // 100 * 0.9
    expect(segmentAResult[1].menuProposalId).toBe('menu_003');
    expect(segmentAResult[1].adjustedScore).toBe(50); // 100 * 0.5
    expect(segmentAResult[2].menuProposalId).toBe('menu_002');
    expect(segmentAResult[2].adjustedScore).toBe(30); // 100 * 0.3

    // Verify: Segment B (Western preference) ranks Western menu first
    expect(segmentBResult[0].menuProposalId).toBe('menu_002');
    expect(segmentBResult[0].adjustedScore).toBe(95); // 100 * 0.95
    expect(segmentBResult[1].menuProposalId).toBe('menu_003');
    expect(segmentBResult[1].adjustedScore).toBe(60); // 100 * 0.6
    expect(segmentBResult[2].menuProposalId).toBe('menu_001');
    expect(segmentBResult[2].adjustedScore).toBe(40); // 100 * 0.4

    // Verify: Segment C (Asian preference) ranks Asian menu first
    expect(segmentCResult[0].menuProposalId).toBe('menu_003');
    expect(segmentCResult[0].adjustedScore).toBe(85); // 100 * 0.85
    expect(segmentCResult[1].menuProposalId).toBe('menu_001');
    expect(segmentCResult[1].adjustedScore).toBe(50); // 100 * 0.5
    expect(segmentCResult[2].menuProposalId).toBe('menu_002');
    expect(segmentCResult[2].adjustedScore).toBe(30); // 100 * 0.3

    // Verify: Consistency - each segment returns all 3 menus
    expect(segmentAResult.length).toBe(3);
    expect(segmentBResult.length).toBe(3);
    expect(segmentCResult.length).toBe(3);

    // Verify: Preference weights are correctly applied across all segments
    expect(segmentAResult[0].segmentId).toBe('seg_001');
    expect(segmentBResult[0].segmentId).toBe('seg_002');
    expect(segmentCResult[0].segmentId).toBe('seg_003');
  });
});