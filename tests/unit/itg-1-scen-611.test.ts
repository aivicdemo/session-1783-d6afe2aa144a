import { assignPriorityMatrixToImprovementProposal } from '../../src/logic/it-2';

describe('家族成員の食事評価データの蓄積・管理機能', () => {
  // SCEN-611: 改善提案の優先度マトリクス自動付与 - 影響度または実装難度の入力値が不正な場合にエラーハンドリングされる
  test('should validate impact and implementation difficulty and throw appropriate errors', () => {
    // ハッピーパス: 正常な入力値（影響度=50, 実装難度=75）
    const validInput = {
      proposalId: 'PROP-001',
      impactScore: 50,
      implementationDifficulty: 75,
      description: 'テスト改善提案'
    };
    
    const validResult = assignPriorityMatrixToImprovementProposal(validInput);
    expect(validResult.priorityRank).toBe('中');
    expect(validResult.impactScore).toBe(50);
    expect(validResult.implementationDifficulty).toBe(75);

    // ケース1: 影響度が-1（範囲外の負の値）
    const negativeImpactInput = {
      proposalId: 'PROP-002',
      impactScore: -1,
      implementationDifficulty: 50,
      description: 'テスト改善提案'
    };
    expect(() => assignPriorityMatrixToImprovementProposal(negativeImpactInput)).toThrow(/影響度/);

    // ケース2: 影響度が101（範囲外の値）
    const overMaxImpactInput = {
      proposalId: 'PROP-003',
      impactScore: 101,
      implementationDifficulty: 50,
      description: 'テスト改善提案'
    };
    expect(() => assignPriorityMatrixToImprovementProposal(overMaxImpactInput)).toThrow(/影響度/);

    // ケース3: 影響度が空文字列
    const emptyImpactInput = {
      proposalId: 'PROP-004',
      impactScore: '' as any,
      implementationDifficulty: 50,
      description: 'テスト改善提案'
    };
    expect(() => assignPriorityMatrixToImprovementProposal(emptyImpactInput)).toThrow(/影響度/);

    // ケース4: 影響度が特殊文字を含む文字列
    const specialCharImpactInput = {
      proposalId: 'PROP-005',
      impactScore: '@#$' as any,
      implementationDifficulty: 50,
      description: 'テスト改善提案'
    };
    expect(() => assignPriorityMatrixToImprovementProposal(specialCharImpactInput)).toThrow(/影響度/);

    // ケース5: 実装難度が'abc'（非数値文字列）
    const abcDifficultyInput = {
      proposalId: 'PROP-006',
      impactScore: 50,
      implementationDifficulty: 'abc' as any,
      description: 'テスト改善提案'
    };
    expect(() => assignPriorityMatrixToImprovementProposal(abcDifficultyInput)).toThrow(/実装難度/);

    // ケース6: 実装難度がnull
    const nullDifficultyInput = {
      proposalId: 'PROP-007',
      impactScore: 50,
      implementationDifficulty: null as any,
      description: 'テスト改善提案'
    };
    expect(() => assignPriorityMatrixToImprovementProposal(nullDifficultyInput)).toThrow(/実装難度/);

    // ケース7: 実装難度が999（範囲外の値）
    const overMaxDifficultyInput = {
      proposalId: 'PROP-008',
      impactScore: 50,
      implementationDifficulty: 999,
      description: 'テスト改善提案'
    };
    expect(() => assignPriorityMatrixToImprovementProposal(overMaxDifficultyInput)).toThrow(/実装難度/);

    // ケース8: 影響度が0（最小有効値）
    const minImpactInput = {
      proposalId: 'PROP-009',
      impactScore: 0,
      implementationDifficulty: 50,
      description: 'テスト改善提案'
    };
    const minImpactResult = assignPriorityMatrixToImprovementProposal(minImpactInput);
    expect(minImpactResult.impactScore).toBe(0);

    // ケース9: 影響度が100（最大有効値）
    const maxImpactInput = {
      proposalId: 'PROP-010',
      impactScore: 100,
      implementationDifficulty: 50,
      description: 'テスト改善提案'
    };
    const maxImpactResult = assignPriorityMatrixToImprovementProposal(maxImpactInput);
    expect(maxImpactResult.impactScore).toBe(100);

    // ケース10: 両方が不正な値を同時に入力（影響度=-1, 実装難度=999）
    const bothInvalidInput = {
      proposalId: 'PROP-011',
      impactScore: -1,
      implementationDifficulty: 999,
      description: 'テスト改善提案'
    };
    expect(() => assignPriorityMatrixToImprovementProposal(bothInvalidInput)).toThrow(/影響度|実装難度/);

    // ケース11: 影響度が大きく、実装難度が小さい場合（優先度は「高」）
    const highPriorityInput = {
      proposalId: 'PROP-012',
      impactScore: 90,
      implementationDifficulty: 20,
      description: 'テスト改善提案'
    };
    const highPriorityResult = assignPriorityMatrixToImprovementProposal(highPriorityInput);
    expect(highPriorityResult.priorityRank).toBe('高');

    // ケース12: 影響度が小さく、実装難度が大きい場合（優先度は「低」）
    const lowPriorityInput = {
      proposalId: 'PROP-013',
      impactScore: 20,
      implementationDifficulty: 90,
      description: 'テスト改善提案'
    };
    const lowPriorityResult = assignPriorityMatrixToImprovementProposal(lowPriorityInput);
    expect(lowPriorityResult.priorityRank).toBe('低');
  });
});