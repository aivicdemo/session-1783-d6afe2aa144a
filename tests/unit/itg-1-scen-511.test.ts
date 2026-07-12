import { detectPriorityConflicts } from '../../src/logic/it-1-br-4-2-1';

describe('食事制限条件の変更時に過去献立との抵触検出機能', () => {
  // SCEN-511
  test('優先条件が1つのみ設定されている場合、競合検出なしで条件が承認される', () => {
    const inputPriority = {
      priorityConditions: [
        {
          conditionId: 'cond_001',
          conditionName: '塩分控えめ',
          priority: 1,
          conflictsWith: []
        }
      ],
      userId: 'user_123',
      timestamp: '2024-01-15T11:00:00Z'
    };

    const result = detectPriorityConflicts(inputPriority);

    expect(result.hasConflict).toBe(false);
    expect(result.conflictPairs).toEqual([]);
    expect(result.conflictWarnings).toEqual([]);
    expect(result.isApproved).toBe(true);
    expect(result.conditionCount).toBe(1);
  });
});