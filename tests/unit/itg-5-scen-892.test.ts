import { assignPriorityToImprovementProposal } from '../../src/logic/it-7-2-1';

describe('献立生成アルゴリズム改善提案の2軸優先度自動付与', () => {
  // SCEN-892: 改善提案の2軸優先度自動付与 - 影響度と実装難度のいずれかが無効値の場合にエラーが返される
  test('影響度または実装難度が無効値の場合にエラーが返される', () => {
    // ケース1: 影響度が有効、実装難度がnull
    expect(() =>
      assignPriorityToImprovementProposal({
        proposalId: 'proposal-001',
        businessValue: 5,
        technicalDifficulty: null,
        userImpact: 4,
      })
    ).toThrow(/実装難度/);

    // ケース2: 影響度が有効、実装難度がundefined
    expect(() =>
      assignPriorityToImprovementProposal({
        proposalId: 'proposal-002',
        businessValue: 5,
        technicalDifficulty: undefined,
        userImpact: 4,
      })
    ).toThrow(/実装難度/);

    // ケース3: 影響度が有効、実装難度が空文字列
    expect(() =>
      assignPriorityToImprovementProposal({
        proposalId: 'proposal-003',
        businessValue: 5,
        technicalDifficulty: '' as any,
        userImpact: 4,
      })
    ).toThrow(/実装難度/);

    // ケース4: 影響度が有効、実装難度が文字列型
    expect(() =>
      assignPriorityToImprovementProposal({
        proposalId: 'proposal-004',
        businessValue: 5,
        technicalDifficulty: 'high' as any,
        userImpact: 4,
      })
    ).toThrow(/実装難度/);

    // ケース5: 影響度がnull、実装難度が有効
    expect(() =>
      assignPriorityToImprovementProposal({
        proposalId: 'proposal-005',
        businessValue: null,
        technicalDifficulty: 3,
        userImpact: 4,
      })
    ).toThrow(/影響度/);

    // ケース6: 影響度がundefined、実装難度が有効
    expect(() =>
      assignPriorityToImprovementProposal({
        proposalId: 'proposal-006',
        businessValue: undefined,
        technicalDifficulty: 3,
        userImpact: 4,
      })
    ).toThrow(/影響度/);

    // ケース7: 影響度が空文字列、実装難度が有効
    expect(() =>
      assignPriorityToImprovementProposal({
        proposalId: 'proposal-007',
        businessValue: '' as any,
        technicalDifficulty: 3,
        userImpact: 4,
      })
    ).toThrow(/影響度/);

    // ケース8: 影響度が文字列型、実装難度が有効
    expect(() =>
      assignPriorityToImprovementProposal({
        proposalId: 'proposal-008',
        businessValue: 'medium' as any,
        technicalDifficulty: 3,
        userImpact: 4,
      })
    ).toThrow(/影響度/);

    // ケース9: 影響度と実装難度の両方がnull
    expect(() =>
      assignPriorityToImprovementProposal({
        proposalId: 'proposal-009',
        businessValue: null,
        technicalDifficulty: null,
        userImpact: 4,
      })
    ).toThrow(/影響度|実装難度/);

    // ケース10: 影響度と実装難度の両方がundefined
    expect(() =>
      assignPriorityToImprovementProposal({
        proposalId: 'proposal-010',
        businessValue: undefined,
        technicalDifficulty: undefined,
        userImpact: 4,
      })
    ).toThrow(/影響度|実装難度/);

    // ケース11: 影響度がnull、実装難度が空文字列
    expect(() =>
      assignPriorityToImprovementProposal({
        proposalId: 'proposal-011',
        businessValue: null,
        technicalDifficulty: '' as any,
        userImpact: 4,
      })
    ).toThrow(/影響度|実装難度/);

    // ケース12: 影響度がundefined、実装難度が文字列型
    expect(() =>
      assignPriorityToImprovementProposal({
        proposalId: 'proposal-012',
        businessValue: undefined,
        technicalDifficulty: 'low' as any,
        userImpact: 4,
      })
    ).toThrow(/影響度|実装難度/);
  });
});