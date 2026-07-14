import { detectCircularDependencies } from '../../src/logic/it-7-2-1';

describe('アルゴリズム改善提案の循環依存検出', () => {
  // SCEN-687
  test('改善提案間の循環依存関係（A→B→C→A）を検出してエラーとする', () => {
    const proposals = [
      {
        proposal_id: 'proposal_a',
        proposal_name: 'Algorithm Optimization A',
        depends_on: ['proposal_b']
      },
      {
        proposal_id: 'proposal_b',
        proposal_name: 'Algorithm Optimization B',
        depends_on: ['proposal_c']
      },
      {
        proposal_id: 'proposal_c',
        proposal_name: 'Algorithm Optimization C',
        depends_on: ['proposal_a']
      }
    ];

    expect(() => detectCircularDependencies(proposals)).toThrow(/循環依存/);
  });

  test('循環依存検出エラーメッセージに循環経路の詳細を含める', () => {
    const proposals = [
      {
        proposal_id: 'proposal_a',
        proposal_name: 'Algorithm Optimization A',
        depends_on: ['proposal_b']
      },
      {
        proposal_id: 'proposal_b',
        proposal_name: 'Algorithm Optimization B',
        depends_on: ['proposal_c']
      },
      {
        proposal_id: 'proposal_c',
        proposal_name: 'Algorithm Optimization C',
        depends_on: ['proposal_a']
      }
    ];

    let error_message = '';
    try {
      detectCircularDependencies(proposals);
    } catch (err: unknown) {
      if (err instanceof Error) {
        error_message = err.message;
      }
    }

    expect(error_message).toMatch(/proposal_a/);
    expect(error_message).toMatch(/proposal_b/);
    expect(error_message).toMatch(/proposal_c/);
  });

  test('循環依存なしの場合は正常に完了', () => {
    const proposals = [
      {
        proposal_id: 'proposal_a',
        proposal_name: 'Algorithm Optimization A',
        depends_on: ['proposal_b']
      },
      {
        proposal_id: 'proposal_b',
        proposal_name: 'Algorithm Optimization B',
        depends_on: []
      }
    ];

    const result = detectCircularDependencies(proposals);
    expect(result).toEqual({
      has_cycle: false,
      cycle_path: [],
      validated_at: expect.any(String)
    });
  });

  test('2提案間の直接循環依存（A→B→A）を検出', () => {
    const proposals = [
      {
        proposal_id: 'proposal_x',
        proposal_name: 'Feature X',
        depends_on: ['proposal_y']
      },
      {
        proposal_id: 'proposal_y',
        proposal_name: 'Feature Y',
        depends_on: ['proposal_x']
      }
    ];

    expect(() => detectCircularDependencies(proposals)).toThrow(/循環依存/);
  });

  test('自己参照（提案が自身に依存）を循環依存として検出', () => {
    const proposals = [
      {
        proposal_id: 'proposal_self',
        proposal_name: 'Self-referencing Proposal',
        depends_on: ['proposal_self']
      }
    ];

    expect(() => detectCircularDependencies(proposals)).toThrow(/循環依存/);
  });

  test('複雑な循環（A→B→C→D→B）を検出', () => {
    const proposals = [
      {
        proposal_id: 'proposal_a',
        proposal_name: 'Proposal A',
        depends_on: ['proposal_b']
      },
      {
        proposal_id: 'proposal_b',
        proposal_name: 'Proposal B',
        depends_on: ['proposal_c']
      },
      {
        proposal_id: 'proposal_c',
        proposal_name: 'Proposal C',
        depends_on: ['proposal_d']
      },
      {
        proposal_id: 'proposal_d',
        proposal_name: 'Proposal D',
        depends_on: ['proposal_b']
      }
    ];

    expect(() => detectCircularDependencies(proposals)).toThrow(/循環依存/);
  });

  test('循環依存エラーに循環経路の詳細配列が含まれる', () => {
    const proposals = [
      {
        proposal_id: 'proposal_p1',
        proposal_name: 'Proposal 1',
        depends_on: ['proposal_p2']
      },
      {
        proposal_id: 'proposal_p2',
        proposal_name: 'Proposal 2',
        depends_on: ['proposal_p1']
      }
    ];

    let caught_error: Error | null = null;
    try {
      detectCircularDependencies(proposals);
    } catch (err: unknown) {
      if (err instanceof Error) {
        caught_error = err;
      }
    }

    expect(caught_error).not.toBeNull();
    expect(caught_error?.message).toContain('proposal_p1');
    expect(caught_error?.message).toContain('proposal_p2');
  });

  test('複数の独立した循環依存パスがある場合、最初に検出された循環を報告', () => {
    const proposals = [
      {
        proposal_id: 'proposal_cycle1_a',
        proposal_name: 'Cycle1 A',
        depends_on: ['proposal_cycle1_b']
      },
      {
        proposal_id: 'proposal_cycle1_b',
        proposal_name: 'Cycle1 B',
        depends_on: ['proposal_cycle1_a']
      },
      {
        proposal_id: 'proposal_cycle2_a',
        proposal_name: 'Cycle2 A',
        depends_on: ['proposal_cycle2_b']
      },
      {
        proposal_id: 'proposal_cycle2_b',
        proposal_name: 'Cycle2 B',
        depends_on: ['proposal_cycle2_a']
      }
    ];

    expect(() => detectCircularDependencies(proposals)).toThrow(/循環依存/);
  });

  test('存在しない提案への依存参照がある場合の動作', () => {
    const proposals = [
      {
        proposal_id: 'proposal_valid',
        proposal_name: 'Valid Proposal',
        depends_on: ['proposal_non_existent']
      }
    ];

    expect(() => detectCircularDependencies(proposals)).toThrow(/提案/);
  });
});