import { determineVerificationCycleAndSchedule } from '../../src/logic/it-1-br-2-1-2-1';

describe('栄養士からの改善提案を優先度付けして管理し、開発チームに定期通知する機能', () => {
  // SCEN-511: [error] 検証サイクルの自動決定とスケジュール設定 - 改善提案がない状態で検証サイクルが空集合となり、エラーが発生する
  test('改善提案がない状態で検証サイクルが空集合となり、適切なエラーメッセージが表示される', () => {
    const improvement_proposals = [];
    const verification_cycle_frequency = 'monthly';
    const current_date = new Date('2024-01-15T09:00:00Z');

    expect(() =>
      determineVerificationCycleAndSchedule({
        improvement_proposals,
        verification_cycle_frequency,
        current_date,
      })
    ).toThrow(/改善提案/);
  });
});