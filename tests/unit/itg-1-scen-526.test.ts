import { issueDataCollectionInstruction } from "../../src/logic/it-2";

describe("データ収集指示発行機能 - 週次分析タイミング判定と対象期間・セグメント定義", () => {
  test("SCEN-526: 週次分析タイミング判定後に対象期間と収集対象ユーザーセグメントが正しく定義される", () => {
    // 現在時刻を固定: 2024-01-15T09:00:00Z（月曜日 09:00）
    const current_time = new Date("2024-01-15T09:00:00Z");
    
    // 過去1週間分の対象期間を計算
    // 現在が2024-01-15（月曜）であるため、過去1週間は2024-01-08（月曜）〜2024-01-14（日曜）
    const expected_period_start = new Date("2024-01-08T00:00:00Z");
    const expected_period_end = new Date("2024-01-14T23:59:59Z");
    
    // 収集対象ユーザーセグメント条件を定義
    const segment_conditions = {
      age_min: 30,
      age_max: 60,
      family_size_min: 2,
      family_size_max: 5,
      dietary_restrictions_required: false
    };
    
    // データ収集指示発行処理を実行
    const result = issueDataCollectionInstruction({
      current_timestamp: current_time,
      analysis_timing: "weekly",
      segment_filter: segment_conditions
    });
    
    // 対象期間の検証
    expect(result.collection_period.start_date).toEqual(expected_period_start);
    expect(result.collection_period.end_date).toEqual(expected_period_end);
    
    // 対象期間が正確に過去1週間分であることを確認（期間の日数）
    const period_duration_ms = result.collection_period.end_date.getTime() - result.collection_period.start_date.getTime();
    const expected_duration_ms = 7 * 24 * 60 * 60 * 1000 - 1; // 7日 - 1ms（23:59:59まで）
    expect(period_duration_ms).toBeGreaterThanOrEqual(expected_duration_ms - 1000);
    expect(period_duration_ms).toBeLessThanOrEqual(expected_duration_ms + 1000);
    
    // 収集対象ユーザーセグメントの定義検証
    expect(result.target_segment.age_min).toBe(30);
    expect(result.target_segment.age_max).toBe(60);
    expect(result.target_segment.family_size_min).toBe(2);
    expect(result.target_segment.family_size_max).toBe(5);
    expect(result.target_segment.dietary_restrictions_required).toBe(false);
    
    // データ収集指示に含まれる対象期間情報の一致性確認
    expect(result.instruction.collection_period.start_date).toEqual(expected_period_start);
    expect(result.instruction.collection_period.end_date).toEqual(expected_period_end);
    
    // データ収集指示に含まれるセグメント情報の一致性確認
    expect(result.instruction.target_segment.age_min).toBe(segment_conditions.age_min);
    expect(result.instruction.target_segment.age_max).toBe(segment_conditions.age_max);
    expect(result.instruction.target_segment.family_size_min).toBe(segment_conditions.family_size_min);
    expect(result.instruction.target_segment.family_size_max).toBe(segment_conditions.family_size_max);
    expect(result.instruction.target_segment.dietary_restrictions_required).toBe(segment_conditions.dietary_restrictions_required);
    
    // 指示の発行状態を確認
    expect(result.instruction.status).toBe("issued");
    expect(result.instruction.issued_timestamp).toEqual(current_time);
    
    // 分析タイミングが正しく記録されていることを確認
    expect(result.instruction.analysis_timing).toBe("weekly");
  });
});