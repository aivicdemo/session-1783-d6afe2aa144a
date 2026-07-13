import { prioritizeImprovementProposals } from '../../src/logic/it-1-br-2-1-2-1';

describe('栄養士からの改善提案を優先度付けして管理し、開発チームに定期通知する機能', () => {
  // SCEN-479
  test('改善提案管理機能 - 無効な優先度値の提案に対してエラーが適切に発生する', () => {
    const validTitle = '栄養基準ロジックの改善';
    const validContent = 'ユーザーの食事記録に基づいた栄養基準値の精度向上';

    // パターン1: 優先度が -1（負数）
    expect(() =>
      prioritizeImprovementProposals({
        title: validTitle,
        content: validContent,
        priority: -1,
      })
    ).toThrow(/優先度/);

    // パターン2: 優先度が 999（範囲外）
    expect(() =>
      prioritizeImprovementProposals({
        title: validTitle,
        content: validContent,
        priority: 999,
      })
    ).toThrow(/優先度/);

    // パターン3: 優先度が null
    expect(() =>
      prioritizeImprovementProposals({
        title: validTitle,
        content: validContent,
        priority: null as any,
      })
    ).toThrow(/優先度/);

    // パターン4: 優先度が undefined
    expect(() =>
      prioritizeImprovementProposals({
        title: validTitle,
        content: validContent,
        priority: undefined as any,
      })
    ).toThrow(/優先度/);

    // パターン5: 優先度が空文字列
    expect(() =>
      prioritizeImprovementProposals({
        title: validTitle,
        content: validContent,
        priority: '' as any,
      })
    ).toThrow(/優先度/);

    // パターン6: 優先度が特殊文字
    expect(() =>
      prioritizeImprovementProposals({
        title: validTitle,
        content: validContent,
        priority: '@#$%' as any,
      })
    ).toThrow(/優先度/);

    // パターン7: 優先度が0（範囲外の最小値）
    expect(() =>
      prioritizeImprovementProposals({
        title: validTitle,
        content: validContent,
        priority: 0,
      })
    ).toThrow(/優先度/);

    // パターン8: 優先度が6（範囲外の最大値を超える）
    expect(() =>
      prioritizeImprovementProposals({
        title: validTitle,
        content: validContent,
        priority: 6,
      })
    ).toThrow(/優先度/);

    // パターン9: 有効な優先度1～5は成功する
    const result1 = prioritizeImprovementProposals({
      title: validTitle,
      content: validContent,
      priority: 1,
    });
    expect(result1).toHaveProperty('proposalId');
    expect(result1.priority).toBe(1);

    const result2 = prioritizeImprovementProposals({
      title: validTitle,
      content: validContent,
      priority: 3,
    });
    expect(result2).toHaveProperty('proposalId');
    expect(result2.priority).toBe(3);

    const result5 = prioritizeImprovementProposals({
      title: validTitle,
      content: validContent,
      priority: 5,
    });
    expect(result5).toHaveProperty('proposalId');
    expect(result5.priority).toBe(5);

    // パターン10: 優先度が文字列の数字
    expect(() =>
      prioritizeImprovementProposals({
        title: validTitle,
        content: validContent,
        priority: '3' as any,
      })
    ).toThrow(/優先度/);

    // パターン11: 優先度が小数点
    expect(() =>
      prioritizeImprovementProposals({
        title: validTitle,
        content: validContent,
        priority: 2.5,
      })
    ).toThrow(/優先度/);
  });
});