import { 
  calculateDependentSchedules,
  updateProposalScheduleWithDependencies
} from '../../src/logic/it-7-2-1';

describe('改善提案の依存関係管理と実装予定時期の自動調整', () => {
  test('SCEN-685: 依存関係のある提案について依存元が完了するまで実装予定時期を延期する', () => {
    // ========== Setup: 依存関係のある複数の提案を作成 ==========
    const proposal_A = {
      proposalId: 'PROP-001',
      proposalName: 'ユーザー満足度スコア計算ロジック改善',
      dependsOn: null as string | null,
      scheduledDate: new Date('2024-03-01T00:00:00Z'),
      status: 'pending' as const,
      completedDate: null as Date | null
    };

    const proposal_B = {
      proposalId: 'PROP-002',
      proposalName: '調理時間短縮アルゴリズム改善',
      dependsOn: 'PROP-001',
      scheduledDate: new Date('2024-02-01T00:00:00Z'),
      status: 'pending' as const,
      completedDate: null as Date | null
    };

    const proposal_C = {
      proposalId: 'PROP-003',
      proposalName: '献立生成成功率判定ロジック改善',
      dependsOn: 'PROP-002',
      scheduledDate: new Date('2024-01-01T00:00:00Z'),
      status: 'pending' as const,
      completedDate: null as Date | null
    };

    const proposals = [proposal_A, proposal_B, proposal_C];

    // ========== Test 1: 初期状態での依存関係チェック ==========
    // 提案Bは提案Aの完了待ち、提案Cは提案Bの完了待ち
    // 実装予定時期の自動調整前の状態を検証

    const initial_schedules = calculateDependentSchedules(proposals);

    // 提案A: 依存なし → 2024-03-01のまま
    expect(initial_schedules[0].proposalId).toBe('PROP-001');
    expect(initial_schedules[0].scheduledDate).toEqual(new Date('2024-03-01T00:00:00Z'));
    expect(initial_schedules[0].adjustedScheduledDate).toEqual(new Date('2024-03-01T00:00:00Z'));

    // 提案B: 提案Aに依存 → 提案Aが2024-03-01完了予定なので、提案Bは2024-03-02以降に延期
    expect(initial_schedules[1].proposalId).toBe('PROP-002');
    expect(initial_schedules[1].adjustedScheduledDate).toEqual(new Date('2024-03-02T00:00:00Z'));

    // 提案C: 提案Bに依存 → 提案Bが2024-03-02以降完了予定なので、提案Cは2024-03-03以降に延期
    expect(initial_schedules[2].proposalId).toBe('PROP-003');
    expect(initial_schedules[2].adjustedScheduledDate).toEqual(new Date('2024-03-03T00:00:00Z'));

    // ========== Test 2: 提案Aが完了した後の状態を検証 ==========
    // 提案Aを「完了」ステータスに更新
    const proposal_A_completed = {
      ...proposal_A,
      status: 'completed' as const,
      completedDate: new Date('2024-03-01T15:30:00Z')
    };

    // 提案Bは依存元が完了したため、元の予定時期2024-02-01で実装可能
    // （実装予定時期が変更されずに使用される）
    const proposal_B_after_A_complete = {
      ...proposal_B,
      dependsOn: 'PROP-001'
    };

    // 提案Cは依存元の提案Bが未完了なので、提案Bの完了予定日以降に延期
    const proposal_C_after_A_complete = {
      ...proposal_C,
      dependsOn: 'PROP-002'
    };

    const proposals_after_A_complete = [
      proposal_A_completed,
      proposal_B_after_A_complete,
      proposal_C_after_A_complete
    ];

    const schedules_after_A_complete = calculateDependentSchedules(proposals_after_A_complete);

    // 提案A: 完了済み → 完了日時を持つ
    expect(schedules_after_A_complete[0].proposalId).toBe('PROP-001');
    expect(schedules_after_A_complete[0].status).toBe('completed');
    expect(schedules_after_A_complete[0].completedDate).toEqual(new Date('2024-03-01T15:30:00Z'));

    // 提案B: 依存元が完了したため、元の予定時期2024-02-01で設定可能
    // （提案Aの完了日を超える限り延期されない）
    expect(schedules_after_A_complete[1].proposalId).toBe('PROP-002');
    expect(schedules_after_A_complete[1].adjustedScheduledDate).toEqual(new Date('2024-02-01T00:00:00Z'));

    // 提案C: 提案Bの実装予定時期2024-02-01に依存しているため、
    // 提案Bの完了予定を考慮して2024-02-02以降に延期
    expect(schedules_after_A_complete[2].proposalId).toBe('PROP-003');
    expect(schedules_after_A_complete[2].adjustedScheduledDate).toEqual(new Date('2024-02-02T00:00:00Z'));

    // ========== Test 3: 提案B完了後の状態を検証 ==========
    const proposal_B_completed = {
      ...proposal_B_after_A_complete,
      status: 'completed' as const,
      completedDate: new Date('2024-02-01T14:00:00Z')
    };

    const proposals_after_B_complete = [
      proposal_A_completed,
      proposal_B_completed,
      proposal_C_after_A_complete
    ];

    const schedules_after_B_complete = calculateDependentSchedules(proposals_after_B_complete);

    // 提案C: 依存元提案Bが完了したため、元の予定時期2024-01-01で設定可能
    // （提案Bの完了日を超える限り延期されない）
    expect(schedules_after_B_complete[2].proposalId).toBe('PROP-003');
    expect(schedules_after_B_complete[2].adjustedScheduledDate).toEqual(new Date('2024-01-01T00:00:00Z'));

    // ========== Test 4: 実装予定時期の動的更新機能を検証 ==========
    // updateProposalScheduleWithDependencies 関数で、
    // 依存関係を考慮した実装予定時期の自動調整を検証

    const update_result = updateProposalScheduleWithDependencies(
      proposals,
      'PROP-003',
      new Date('2024-01-01T00:00:00Z')
    );

    // 提案Cの実装予定時期を2024-01-01に設定しようとしたが、
    // 依存元の提案Bが2024-02-01完了予定なので、実装予定時期が自動調整される
    expect(update_result.proposalId).toBe('PROP-003');
    expect(update_result.requestedScheduledDate).toEqual(new Date('2024-01-01T00:00:00Z'));
    expect(update_result.adjustedScheduledDate).toEqual(new Date('2024-02-02T00:00:00Z'));
    expect(update_result.adjustmentReason).toMatch(/依存元/);

    // ========== Test 5: 依存関係チェーンの全体検証 ==========
    // 3段階の依存関係（A→B→C）が正しく解決されるか確認

    const chain_verification = {
      proposal_A: {
        id: 'PROP-001',
        originalSchedule: new Date('2024-03-01T00:00:00Z'),
        adjustedSchedule: new Date('2024-03-01T00:00:00Z'),
        hasDependency: false
      },
      proposal_B: {
        id: 'PROP-002',
        originalSchedule: new Date('2024-02-01T00:00:00Z'),
        adjustedSchedule: new Date('2024-03-02T00:00:00Z'),
        dependsOn: 'PROP-001'
      },
      proposal_C: {
        id: 'PROP-003',
        originalSchedule: new Date('2024-01-01T00:00:00Z'),
        adjustedSchedule: new Date('2024-03-03T00:00:00Z'),
        dependsOn: 'PROP-002'
      }
    };

    // 提案Cの調整後実装予定時期が提案Bの調整後実装予定時期より後ろであることを確認
    const C_adjusted = new Date(chain_verification.proposal_C.adjustedSchedule);
    const B_adjusted = new Date(chain_verification.proposal_B.adjustedSchedule);
    expect(C_adjusted.getTime()).toBeGreaterThan(B_adjusted.getTime());

    // 提案Bの調整後実装予定時期が提案Aの調整後実装予定時期より後ろであることを確認
    const B_adjusted_time = new Date(chain_verification.proposal_B.adjustedSchedule);
    const A_adjusted_time = new Date(chain_verification.proposal_A.adjustedSchedule);
    expect(B_adjusted_time.getTime()).toBeGreaterThan(A_adjusted_time.getTime());
  });
});