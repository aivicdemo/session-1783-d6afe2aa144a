import { determineInterviewCriteria } from '../../src/logic/it-1-1-1';

describe('Interview Candidate Selection Criteria Determination', () => {
  // SCEN-640
  test('should correctly determine selection criteria and minimum sample size for househusband segment with specified demographics', () => {
    const input = {
      targetSegment: 'househusband',
      ageRange: '30s',
      familyComposition: 'spouse_and_2children',
      dietaryRestrictionPattern: 'allergy_egg_dairy'
    };

    const result = determineInterviewCriteria(input);

    expect(result).toEqual({
      segmentName: 'househusband',
      ageRangeMin: 30,
      ageRangeMax: 39,
      familyCompositionCriteria: {
        spouse: true,
        childrenCount: 2,
        totalHouseholdMembers: 4
      },
      dietaryRestrictionCriteria: {
        allergyEgg: true,
        allergyDairy: true,
        totalRestrictionTypes: 2
      },
      minimumSampleSize: 30,
      recommendedSampleSize: 45,
      selectionCriteriaDetails: {
        criteria1_ageRange: '30-39 years old',
        criteria2_familyStructure: 'Married with 2 children',
        criteria3_dietaryRestrictions: 'Egg allergy AND dairy allergy',
        criteria4_householdMembers: '4 household members'
      },
      exportFormats: ['csv', 'json'],
      exportCsvContent: 'Segment,Age Range Min,Age Range Max,Spouse,Children Count,Total Household Members,Allergy Egg,Allergy Dairy,Minimum Sample Size,Recommended Sample Size\nhousehusband,30,39,true,2,4,true,true,30,45',
      exportJsonContent: {
        segment: 'househusband',
        ageRangeMin: 30,
        ageRangeMax: 39,
        familyComposition: 'spouse_and_2children',
        dietaryRestrictions: ['egg', 'dairy'],
        minimumSampleSize: 30,
        recommendedSampleSize: 45
      },
      calculationTimestamp: '2024-01-15T11:00:00Z',
      isExportable: true,
      statisticalValidity: true,
      validationMessage: 'Selection criteria determined successfully. Minimum sample size n=30 meets statistical validity threshold.'
    });

    expect(result.minimumSampleSize).toBeGreaterThanOrEqual(30);
    expect(result.recommendedSampleSize).toBeGreaterThan(result.minimumSampleSize);
    expect(result.statisticalValidity).toBe(true);
    expect(result.isExportable).toBe(true);
    expect(result.exportFormats).toContain('csv');
    expect(result.exportFormats).toContain('json');
    expect(result.selectionCriteriaDetails.criteria1_ageRange).toMatch(/30-39/);
    expect(result.selectionCriteriaDetails.criteria2_familyStructure).toMatch(/2 children/);
    expect(result.selectionCriteriaDetails.criteria3_dietaryRestrictions).toMatch(/Egg allergy.*dairy allergy/i);
  });
});