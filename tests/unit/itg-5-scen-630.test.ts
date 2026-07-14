import { validateAndIntegrateAlgorithm } from '../../src/logic/it-7-2-1';

describe('献立生成アルゴリズムの改善・統合デプロイ機能', () => {
  // SCEN-630: [error] アルゴリズム改善・統合デプロイ機能 - 改善アルゴリズムが検証未完了状態の場合、統合がスキップされる
  test('検証未完了状態のアルゴリズムに対して統合デプロイを実行した場合、処理はスキップされステータスは未デプロイのまま変わらず、スキップ理由を示すエラーメッセージが記録される', () => {
    const input_algorithm_id = 'algo-20250126-001';
    const input_verification_status = 'incomplete';
    const input_current_deployment_status = 'undeployed';
    const input_timestamp = new Date('2025-01-26T14:30:00Z');

    const result = validateAndIntegrateAlgorithm({
      algorithm_id: input_algorithm_id,
      verification_status: input_verification_status,
      current_deployment_status: input_current_deployment_status,
      requested_at: input_timestamp,
    });

    expect(result.integration_skipped).toBe(true);
    expect(result.final_deployment_status).toBe('undeployed');
    expect(result.error_message).toMatch(/検証未完了/);
    expect(result.skip_reason).toMatch(/検証/);
    expect(result.log_recorded).toBe(true);
    expect(result.status_changed).toBe(false);
  });
});