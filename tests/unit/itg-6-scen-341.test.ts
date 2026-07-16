import { extractMenuGenerationFlowDropoffPoints } from '../../src/logic/it-1-br-8-2-2-1';

describe('献立生成フロー離脱ポイント自動抽出・分析機能', () => {
  // SCEN-341: [normal] 献立生成フロー離脱ポイント抽出機能 - アプリログから制約条件入力ステップでの離脱ポイントが正確に抽出される
  test('SCEN-341: 制約条件入力ステップでの離脱ポイントが正確に抽出され、離脱率が正確に計算される', () => {
    const app_logs = [
      // ユーザーA: 制約条件入力ステップで離脱
      {
        user_id: 'user_001',
        timestamp: '2024-01-15T09:00:00Z',
        flow_step: 'menu_generation_start',
        action: 'flow_entered'
      },
      {
        user_id: 'user_001',
        timestamp: '2024-01-15T09:01:00Z',
        flow_step: 'constraint_input',
        action: 'step_reached'
      },
      {
        user_id: 'user_001',
        timestamp: '2024-01-15T09:02:00Z',
        flow_step: 'constraint_input',
        action: 'back_button_clicked'
      },
      // ユーザーB: 制約条件入力ステップで離脱（操作なし）
      {
        user_id: 'user_002',
        timestamp: '2024-01-15T09:10:00Z',
        flow_step: 'menu_generation_start',
        action: 'flow_entered'
      },
      {
        user_id: 'user_002',
        timestamp: '2024-01-15T09:11:00Z',
        flow_step: 'constraint_input',
        action: 'step_reached'
      },
      {
        user_id: 'user_002',
        timestamp: '2024-01-15T09:12:00Z',
        flow_step: 'menu_generation_start',
        action: 'flow_exited'
      },
      // ユーザーC: 制約条件入力ステップを完了（離脱なし）
      {
        user_id: 'user_003',
        timestamp: '2024-01-15T09:20:00Z',
        flow_step: 'menu_generation_start',
        action: 'flow_entered'
      },
      {
        user_id: 'user_003',
        timestamp: '2024-01-15T09:21:00Z',
        flow_step: 'constraint_input',
        action: 'step_reached'
      },
      {
        user_id: 'user_003',
        timestamp: '2024-01-15T09:22:00Z',
        flow_step: 'constraint_input',
        action: 'allergy_setting_completed'
      },
      {
        user_id: 'user_003',
        timestamp: '2024-01-15T09:23:00Z',
        flow_step: 'constraint_input',
        action: 'budget_setting_completed'
      },
      {
        user_id: 'user_003',
        timestamp: '2024-01-15T09:24:00Z',
        flow_step: 'constraint_input',
        action: 'cooking_time_setting_completed'
      },
      {
        user_id: 'user_003',
        timestamp: '2024-01-15T09:25:00Z',
        flow_step: 'menu_generation_preview',
        action: 'step_reached'
      },
      // ユーザーD: 制約条件入力ステップで離脱（アレルギー設定後に戻る）
      {
        user_id: 'user_004',
        timestamp: '2024-01-15T09:30:00Z',
        flow_step: 'menu_generation_start',
        action: 'flow_entered'
      },
      {
        user_id: 'user_004',
        timestamp: '2024-01-15T09:31:00Z',
        flow_step: 'constraint_input',
        action: 'step_reached'
      },
      {
        user_id: 'user_004',
        timestamp: '2024-01-15T09:32:00Z',
        flow_step: 'constraint_input',
        action: 'allergy_setting_completed'
      },
      {
        user_id: 'user_004',
        timestamp: '2024-01-15T09:33:00Z',
        flow_step: 'constraint_input',
        action: 'back_button_clicked'
      }
    ];

    const result = extractMenuGenerationFlowDropoffPoints(app_logs);

    // 離脱ポイント数の検証（ユーザーA、B、Dの3件）
    expect(result.dropoff_points).toHaveLength(3);

    // ユーザーAの離脱ポイント検証
    const user_001_dropoff = result.dropoff_points.find(
      (d: any) => d.user_id === 'user_001'
    );
    expect(user_001_dropoff).toEqual({
      user_id: 'user_001',
      flow_step: 'constraint_input',
      dropoff_timestamp: '2024-01-15T09:02:00Z',
      dropoff_reason: 'back_button_clicked',
      step_reached_timestamp: '2024-01-15T09:01:00Z'
    });

    // ユーザーBの離脱ポイント検証
    const user_002_dropoff = result.dropoff_points.find(
      (d: any) => d.user_id === 'user_002'
    );
    expect(user_002_dropoff).toEqual({
      user_id: 'user_002',
      flow_step: 'constraint_input',
      dropoff_timestamp: '2024-01-15T09:12:00Z',
      dropoff_reason: 'flow_exited_without_completion',
      step_reached_timestamp: '2024-01-15T09:11:00Z'
    });

    // ユーザーDの離脱ポイント検証
    const user_004_dropoff = result.dropoff_points.find(
      (d: any) => d.user_id === 'user_004'
    );
    expect(user_004_dropoff).toEqual({
      user_id: 'user_004',
      flow_step: 'constraint_input',
      dropoff_timestamp: '2024-01-15T09:33:00Z',
      dropoff_reason: 'back_button_clicked',
      step_reached_timestamp: '2024-01-15T09:31:00Z'
    });

    // 離脱率の計算検証
    // 制約条件入力ステップに到達したユーザー数：4（user_001, user_002, user_003, user_004）
    // 離脱したユーザー数：3（user_001, user_002, user_004）
    // 期待される離脱率：3 / 4 = 0.75
    expect(result.step_statistics).toBeDefined();
    const constraint_step_stats = result.step_statistics.find(
      (s: any) => s.flow_step === 'constraint_input'
    );
    expect(constraint_step_stats).toEqual({
      flow_step: 'constraint_input',
      total_reached: 4,
      total_dropoff: 3,
      dropoff_rate: 0.75
    });

    // ユーザーCが離脱ポイントに含まれていないことを検証
    const user_003_dropoff = result.dropoff_points.find(
      (d: any) => d.user_id === 'user_003'
    );
    expect(user_003_dropoff).toBeUndefined();

    // 重複する離脱イベントがないことを検証（各ユーザーが最大1回のみ出現）
    const user_ids_in_dropoff = result.dropoff_points.map((d: any) => d.user_id);
    const unique_user_ids = new Set(user_ids_in_dropoff);
    expect(unique_user_ids.size).toBe(user_ids_in_dropoff.length);

    // 全ユーザーの離脱イベントが個別に識別されていることを検証
    const dropoff_user_ids = result.dropoff_points.map((d: any) => d.user_id);
    expect(dropoff_user_ids).toContain('user_001');
    expect(dropoff_user_ids).toContain('user_002');
    expect(dropoff_user_ids).toContain('user_004');
    expect(dropoff_user_ids).not.toContain('user_003');
  });
});