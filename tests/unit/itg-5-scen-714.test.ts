import { calculateImprovementTaskScore, sortImprovementTasksByScore } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-714: [normal] 総合スコア算出・課題順位付け機能 - 各改善課題に対して0～100点の総合スコアが正確に算出される
  test('should calculate composite score accurately and sort improvement tasks correctly', () => {
    // Setup: 複数の改善課題（最低3件以上）を作成
    const task1 = {
      task_id: 'TASK001',
      task_name: '家族好み学習ロジック強化',
      execution_efficiency_score: 70,
      quality_score: 80,
      risk_reduction_score: 60,
      cost_effectiveness_score: 90,
    };

    const task2 = {
      task_id: 'TASK002',
      task_name: '栄養バランス検証アルゴリズム改善',
      execution_efficiency_score: 85,
      quality_score: 90,
      risk_reduction_score: 75,
      cost_effectiveness_score: 70,
    };

    const task3 = {
      task_id: 'TASK003',
      task_name: '調理時間予測精度向上',
      execution_efficiency_score: 60,
      quality_score: 65,
      risk_reduction_score: 55,
      cost_effectiveness_score: 80,
    };

    // 境界値テスト用タスク：全スコアが0点
    const task4 = {
      task_id: 'TASK004',
      task_name: '低優先度タスク',
      execution_efficiency_score: 0,
      quality_score: 0,
      risk_reduction_score: 0,
      cost_effectiveness_score: 0,
    };

    // 境界値テスト用タスク：全スコアが100点
    const task5 = {
      task_id: 'TASK005',
      task_name: '最優先度タスク',
      execution_efficiency_score: 100,
      quality_score: 100,
      risk_reduction_score: 100,
      cost_effectiveness_score: 100,
    };

    // 総合スコアの算出（加重平均: 各要素を25%で均等配分）
    // task1: (70 + 80 + 60 + 90) / 4 = 75.0
    const task1_expected_composite_score = 75.0;
    const task1_with_score = calculateImprovementTaskScore(task1);
    expect(task1_with_score.composite_score).toBe(task1_expected_composite_score);

    // task2: (85 + 90 + 75 + 70) / 4 = 80.0
    const task2_expected_composite_score = 80.0;
    const task2_with_score = calculateImprovementTaskScore(task2);
    expect(task2_with_score.composite_score).toBe(task2_expected_composite_score);

    // task3: (60 + 65 + 55 + 80) / 4 = 65.0
    const task3_expected_composite_score = 65.0;
    const task3_with_score = calculateImprovementTaskScore(task3);
    expect(task3_with_score.composite_score).toBe(task3_expected_composite_score);

    // 境界値: task4（全て0点）: (0 + 0 + 0 + 0) / 4 = 0.0
    const task4_expected_composite_score = 0.0;
    const task4_with_score = calculateImprovementTaskScore(task4);
    expect(task4_with_score.composite_score).toBe(task4_expected_composite_score);

    // 境界値: task5（全て100点）: (100 + 100 + 100 + 100) / 4 = 100.0
    const task5_expected_composite_score = 100.0;
    const task5_with_score = calculateImprovementTaskScore(task5);
    expect(task5_with_score.composite_score).toBe(task5_expected_composite_score);

    // 総合スコアが0～100点の範囲内に収まっていることを検証
    expect(task1_with_score.composite_score).toBeGreaterThanOrEqual(0);
    expect(task1_with_score.composite_score).toBeLessThanOrEqual(100);
    expect(task2_with_score.composite_score).toBeGreaterThanOrEqual(0);
    expect(task2_with_score.composite_score).toBeLessThanOrEqual(100);
    expect(task3_with_score.composite_score).toBeGreaterThanOrEqual(0);
    expect(task3_with_score.composite_score).toBeLessThanOrEqual(100);
    expect(task4_with_score.composite_score).toBeGreaterThanOrEqual(0);
    expect(task4_with_score.composite_score).toBeLessThanOrEqual(100);
    expect(task5_with_score.composite_score).toBeGreaterThanOrEqual(0);
    expect(task5_with_score.composite_score).toBeLessThanOrEqual(100);

    // 複数課題を総合スコアの降順でソートし、課題順位付けが正確に行われていることを確認
    const all_tasks = [task1, task2, task3, task4, task5];
    const scored_tasks = all_tasks.map(t => calculateImprovementTaskScore(t));
    const sorted_tasks = sortImprovementTasksByScore(scored_tasks);

    // 期待される降順: task5(100.0) > task2(80.0) > task1(75.0) > task3(65.0) > task4(0.0)
    expect(sorted_tasks[0].task_id).toBe('TASK005');
    expect(sorted_tasks[0].composite_score).toBe(100.0);
    expect(sorted_tasks[1].task_id).toBe('TASK002');
    expect(sorted_tasks[1].composite_score).toBe(80.0);
    expect(sorted_tasks[2].task_id).toBe('TASK001');
    expect(sorted_tasks[2].composite_score).toBe(75.0);
    expect(sorted_tasks[3].task_id).toBe('TASK003');
    expect(sorted_tasks[3].composite_score).toBe(65.0);
    expect(sorted_tasks[4].task_id).toBe('TASK004');
    expect(sorted_tasks[4].composite_score).toBe(0.0);

    // 個別スコア値を変更し、総合スコアと順位が即座に更新されることを検証
    const task1_modified = {
      ...task1,
      execution_efficiency_score: 95,
      quality_score: 95,
      risk_reduction_score: 95,
      cost_effectiveness_score: 95,
    };

    // 修正後のtask1: (95 + 95 + 95 + 95) / 4 = 95.0
    const task1_modified_with_score = calculateImprovementTaskScore(task1_modified);
    expect(task1_modified_with_score.composite_score).toBe(95.0);

    // 修正後のリスト内での順位を確認
    const modified_tasks = [task1_modified, task2, task3, task4, task5];
    const modified_scored_tasks = modified_tasks.map(t => calculateImprovementTaskScore(t));
    const modified_sorted_tasks = sortImprovementTasksByScore(modified_scored_tasks);

    // 修正後の期待される降順: task5(100.0) > task1_modified(95.0) > task2(80.0) > task3(65.0) > task4(0.0)
    expect(modified_sorted_tasks[0].task_id).toBe('TASK005');
    expect(modified_sorted_tasks[1].task_id).toBe('TASK001');
    expect(modified_sorted_tasks[1].composite_score).toBe(95.0);
    expect(modified_sorted_tasks[2].task_id).toBe('TASK002');
  });
});