import { determineVariablePriority } from '../../src/logic/it-1-br-3-2-1';

describe('Purchase Records and Monthly Food Cost Reduction Analysis', () => {
  // SCEN-464
  test('should assign medium priority when both impact and implementation difficulty are zero', () => {
    const impact_degree = 0;
    const implementation_difficulty = 0;

    const priority_level = determineVariablePriority({
      impact_degree,
      implementation_difficulty,
    });

    expect(priority_level).toBe('MEDIUM');
  });
});