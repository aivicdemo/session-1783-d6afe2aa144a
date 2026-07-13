import { calculatePriorityScore } from '../../src/logic/it-1-br-2-1-2-1';

describe('栄養士からの改善提案を優先度付けして管理し、開発チームに定期通知する機能', () => {
  // SCEN-519: [normal] 改善課題の優先度スコアリング - ビジネス価値・技術難度・ユーザーインパクトの3軸で総合優先度スコアが算出され、課題が優先順位付けされる
  test('should calculate comprehensive priority score from business value, technical difficulty, and user impact scores, and sort improvement tasks by descending priority order', () => {
    // 複数の改善課題データ
    const improvementTasks = [
      {
        task_id: 'TASK-001',
        task_name: 'カルシウム摂取量推奨値の調整',
        business_value_score: 8,
        technical_difficulty_score: 3,
        user_impact_score: 9,
      },
      {
        task_id: 'TASK-002',
        task_name: '食物繊維摂取推奨値の最適化',
        business_value_score: 7,
        technical_difficulty_score: 4,
        user_impact_score: 8,
      },
      {
        task_id: 'TASK-003',
        task_name: 'タンパク質基準値の改善',
        business_value_score: 9,
        technical_difficulty_score: 5,
        user_impact_score: 7,
      },
      {
        task_id: 'TASK-004',
        task_name: 'ビタミンD摂取管理の強化',
        business_value_score: 6,
        technical_difficulty_score: 2,
        user_impact_score: 6,
      },
    ];

    // 優先度スコアリング実行
    const result = calculatePriorityScore(improvementTasks);

    // 総合優先度スコアの計算検証
    // 計算式: (ビジネス価値スコア × 0.4) + (10 - 技術難度スコア) × 0.3 + (ユーザーインパクトスコア × 0.3)
    // TASK-001: (8 × 0.4) + ((10 - 3) × 0.3) + (9 × 0.3) = 3.2 + 2.1 + 2.7 = 8.0
    // TASK-002: (7 × 0.4) + ((10 - 4) × 0.3) + (8 × 0.3) = 2.8 + 1.8 + 2.4 = 7.0
    // TASK-003: (9 × 0.4) + ((10 - 5) × 0.3) + (7 × 0.3) = 3.6 + 1.5 + 2.1 = 7.2
    // TASK-004: (6 × 0.4) + ((10 - 2) × 0.3) + (6 × 0.3) = 2.4 + 2.4 + 1.8 = 6.6

    expect(result).toEqual([
      {
        task_id: 'TASK-001',
        task_name: 'カルシウム摂取量推奨値の調整',
        business_value_score: 8,
        technical_difficulty_score: 3,
        user_impact_score: 9,
        comprehensive_priority_score: 8.0,
        priority_rank: 1,
      },
      {
        task_id: 'TASK-003',
        task_name: 'タンパク質基準値の改善',
        business_value_score: 9,
        technical_difficulty_score: 5,
        user_impact_score: 7,
        comprehensive_priority_score: 7.2,
        priority_rank: 2,
      },
      {
        task_id: 'TASK-002',
        task_name: '食物繊維摂取推奨値の最適化',
        business_value_score: 7,
        technical_difficulty_score: 4,
        user_impact_score: 8,
        comprehensive_priority_score: 7.0,
        priority_rank: 3,
      },
      {
        task_id: 'TASK-004',
        task_name: 'ビタミンD摂取管理の強化',
        business_value_score: 6,
        technical_difficulty_score: 2,
        user_impact_score: 6,
        comprehensive_priority_score: 6.6,
        priority_rank: 4,
      },
    ]);

    // 総合優先度スコアの降順ソート確認
    expect(result[0].comprehensive_priority_score).toBeGreaterThan(
      result[1].comprehensive_priority_score
    );
    expect(result[1].comprehensive_priority_score).toBeGreaterThan(
      result[2].comprehensive_priority_score
    );
    expect(result[2].comprehensive_priority_score).toBeGreaterThan(
      result[3].comprehensive_priority_score
    );

    // すべての課題に優先度ランクが付与されていることを確認
    result.forEach((task, index) => {
      expect(task.priority_rank).toBe(index + 1);
    });

    // 結果配列の長さが入力と同じであることを確認
    expect(result.length).toBe(improvementTasks.length);
  });
});