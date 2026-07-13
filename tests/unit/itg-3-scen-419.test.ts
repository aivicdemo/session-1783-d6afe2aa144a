import { checkAnalysisTimingAndIssueDataCollection } from '../../src/logic/it-1-br-3-2-1';

describe('購入実績の記録と月次食費削減効果の自動集計・分析機能', () => {
  // SCEN-419: [error] 分析タイミング判定機能 - 指定時刻以外の時間帯ではデータ収集指示が発行されない
  test('指定時刻以外の時間帯ではデータ収集指示が発行されない', () => {
    const scheduled_hour = 9;
    const scheduled_minute = 0;

    // ケース1: 指定時刻より1分前（08:59）
    const before_time = new Date('2024-01-15T08:59:00Z');
    const result_before = checkAnalysisTimingAndIssueDataCollection({
      current_time: before_time,
      scheduled_hour: scheduled_hour,
      scheduled_minute: scheduled_minute,
    });
    expect(result_before.is_issued).toBe(false);
    expect(result_before.collection_instruction_id).toBeNull();
    expect(result_before.error_message).toBeNull();

    // ケース2: 指定時刻より後（09:30）
    const after_time = new Date('2024-01-15T09:30:00Z');
    const result_after = checkAnalysisTimingAndIssueDataCollection({
      current_time: after_time,
      scheduled_hour: scheduled_hour,
      scheduled_minute: scheduled_minute,
    });
    expect(result_after.is_issued).toBe(false);
    expect(result_after.collection_instruction_id).toBeNull();
    expect(result_after.error_message).toBeNull();

    // ケース3: 指定時刻ちょうど（09:00）- 発行される確認
    const exact_time = new Date('2024-01-15T09:00:00Z');
    const result_exact = checkAnalysisTimingAndIssueDataCollection({
      current_time: exact_time,
      scheduled_hour: scheduled_hour,
      scheduled_minute: scheduled_minute,
    });
    expect(result_exact.is_issued).toBe(true);
    expect(result_exact.collection_instruction_id).toMatch(/^INSTR_/);
    expect(result_exact.error_message).toBeNull();

    // ケース4: 別の指定時刻以外（08:00）
    const different_hour_time = new Date('2024-01-15T08:00:00Z');
    const result_different = checkAnalysisTimingAndIssueDataCollection({
      current_time: different_hour_time,
      scheduled_hour: scheduled_hour,
      scheduled_minute: scheduled_minute,
    });
    expect(result_different.is_issued).toBe(false);
    expect(result_different.collection_instruction_id).toBeNull();
    expect(result_different.error_message).toBeNull();

    // ケース5: 月初の指定時刻（例：毎月1日09:00）
    const month_start_time = new Date('2024-01-01T09:00:00Z');
    const result_month_start = checkAnalysisTimingAndIssueDataCollection({
      current_time: month_start_time,
      scheduled_hour: scheduled_hour,
      scheduled_minute: scheduled_minute,
    });
    expect(result_month_start.is_issued).toBe(true);
    expect(result_month_start.collection_instruction_id).toMatch(/^INSTR_/);

    // ケース6: 月初の指定時刻以外（例：毎月1日09:01）
    const month_start_after_time = new Date('2024-01-01T09:01:00Z');
    const result_month_start_after = checkAnalysisTimingAndIssueDataCollection({
      current_time: month_start_after_time,
      scheduled_hour: scheduled_hour,
      scheduled_minute: scheduled_minute,
    });
    expect(result_month_start_after.is_issued).toBe(false);
    expect(result_month_start_after.collection_instruction_id).toBeNull();

    // ケース7: 複数分構成の指定時刻（例：09時15分）
    const result_with_minute = checkAnalysisTimingAndIssueDataCollection({
      current_time: new Date('2024-01-15T09:15:00Z'),
      scheduled_hour: 9,
      scheduled_minute: 15,
    });
    expect(result_with_minute.is_issued).toBe(true);
    expect(result_with_minute.collection_instruction_id).toMatch(/^INSTR_/);

    // ケース8: 複数分構成の指定時刻より前（09時14分）
    const result_with_minute_before = checkAnalysisTimingAndIssueDataCollection({
      current_time: new Date('2024-01-15T09:14:00Z'),
      scheduled_hour: 9,
      scheduled_minute: 15,
    });
    expect(result_with_minute_before.is_issued).toBe(false);

    // ケース9: 複数分構成の指定時刻より後（09時16分）
    const result_with_minute_after = checkAnalysisTimingAndIssueDataCollection({
      current_time: new Date('2024-01-15T09:16:00Z'),
      scheduled_hour: 9,
      scheduled_minute: 15,
    });
    expect(result_with_minute_after.is_issued).toBe(false);
  });
});