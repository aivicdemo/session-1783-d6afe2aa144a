import { generateStructuredImprovementProposal } from '../../src/logic/it-1-br-2-1-2-1';

describe('Nutritionist Improvement Proposal Structured Format Generation', () => {
  // SCEN-492: [error] 改善提案構造化フォーマット生成 - 空文字列の改善提案テキストをバリデーションして拒否する
  test('should reject empty improvement proposal text and throw validation error', () => {
    const emptyProposalText = '';
    const nutritionistId = 'NUT-001';
    const priorityBasisCriteria = {
      businessValue: 8,
      technicalDifficulty: 5,
      userImpact: 9,
    };

    expect(() =>
      generateStructuredImprovementProposal({
        proposalText: emptyProposalText,
        nutritionistId: nutritionistId,
        priorityBasis: priorityBasisCriteria,
        proposalTimestamp: new Date('2024-01-15T14:30:00Z'),
      })
    ).toThrow(/提案テキスト/);
  });

  test('should generate structured format with valid improvement proposal text', () => {
    const validProposalText =
      '朝食の栄養バランスを改善するため、たんぱく質摂取量の目標値を15%上げることを提案します';
    const nutritionistId = 'NUT-001';
    const priorityBasisCriteria = {
      businessValue: 8,
      technicalDifficulty: 5,
      userImpact: 9,
    };
    const proposalTimestamp = new Date('2024-01-15T14:30:00Z');

    const result = generateStructuredImprovementProposal({
      proposalText: validProposalText,
      nutritionistId: nutritionistId,
      priorityBasis: priorityBasisCriteria,
      proposalTimestamp: proposalTimestamp,
    });

    expect(result).toEqual({
      proposalId: expect.any(String),
      proposalText: validProposalText,
      nutritionistId: nutritionistId,
      priorityScore: 7.33,
      businessValue: 8,
      technicalDifficulty: 5,
      userImpact: 9,
      proposalTimestamp: proposalTimestamp,
      structuredCategory: expect.any(String),
      status: 'pending_prioritization',
    });
  });

  test('should reject whitespace-only improvement proposal text', () => {
    const whitespaceOnlyText = '   ';
    const nutritionistId = 'NUT-002';
    const priorityBasisCriteria = {
      businessValue: 6,
      technicalDifficulty: 7,
      userImpact: 8,
    };

    expect(() =>
      generateStructuredImprovementProposal({
        proposalText: whitespaceOnlyText,
        nutritionistId: nutritionistId,
        priorityBasis: priorityBasisCriteria,
        proposalTimestamp: new Date('2024-01-16T10:00:00Z'),
      })
    ).toThrow(/提案テキスト/);
  });

  test('should calculate priority score correctly from basis criteria', () => {
    const validProposalText = 'カルシウム摂取量の基準値を見直す必要があります';
    const nutritionistId = 'NUT-003';
    const priorityBasisCriteria = {
      businessValue: 9,
      technicalDifficulty: 3,
      userImpact: 10,
    };
    const proposalTimestamp = new Date('2024-01-17T09:15:00Z');

    const result = generateStructuredImprovementProposal({
      proposalText: validProposalText,
      nutritionistId: nutritionistId,
      priorityBasis: priorityBasisCriteria,
      proposalTimestamp: proposalTimestamp,
    });

    const expectedPriorityScore = (9 + 3 + 10) / 3;
    expect(result.priorityScore).toBe(7.33);
    expect(result.status).toBe('pending_prioritization');
  });

  test('should assign correct structured category from proposal content', () => {
    const proposalText =
      'ビタミンD摂取不足を解決するため、献立への推奨食材追加ロジックを改善します';
    const nutritionistId = 'NUT-004';
    const priorityBasisCriteria = {
      businessValue: 7,
      technicalDifficulty: 6,
      userImpact: 8,
    };
    const proposalTimestamp = new Date('2024-01-18T11:45:00Z');

    const result = generateStructuredImprovementProposal({
      proposalText: proposalText,
      nutritionistId: nutritionistId,
      priorityBasis: priorityBasisCriteria,
      proposalTimestamp: proposalTimestamp,
    });

    expect(result.structuredCategory).toMatch(/栄養基準|献立生成/);
    expect(result.proposalId).toBeTruthy();
    expect(typeof result.proposalId).toBe('string');
  });
});