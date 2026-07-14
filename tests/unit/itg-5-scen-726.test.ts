import { evaluateTechnicalFeasibility } from '../../src/logic/it-7-2-1';

describe('技術実現性評価機能 - 改善提案が空のリスト', () => {
  // SCEN-726
  test('分類対象の改善提案リストが空である場合、適切にエラーハンドリングされる', () => {
    const emptyProposalList: any[] = [];

    const result = evaluateTechnicalFeasibility(emptyProposalList);

    expect(result).toBeDefined();
    expect(result.success).toBe(false);
    expect(result.errorMessage).toMatch(/改善提案リスト/);
    expect(result.evaluationResults).toEqual([]);
    expect(result.systemStable).toBe(true);
    expect(Array.isArray(result.logEntries)).toBe(true);
    expect(result.logEntries.length).toBeGreaterThan(0);
    expect(result.logEntries[0]).toMatch(/改善提案リスト/);
  });
});