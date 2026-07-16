import { detectDiscrepancyBetweenInterviewAndLog } from '../../src/logic/it-8-1-2-1';

describe('献立生成フロー内の制約条件入力パターンと離脱ポイント自動抽出・可視化機能', () => {
  // SCEN-333: [normal] インタビュー記録とログデータの矛盾検出機能 - インタビュー記録とログデータで同一ペイン要因の発生頻度が乖離している場合に矛盾が特定される
  test('should detect discrepancy between interview records and log data for the same pain factor with divergent frequencies', () => {
    const interview_records = [
      {
        interview_id: 'int_001',
        user_id: 'user_001',
        pain_factor: 'ページ読込遅延',
        recorded_frequency: '高頻度',
        frequency_count: 12, // 週3回以上 = 月12回以上
        interview_date: '2024-01-15',
        description: 'アプリのページ読込が遅く、毎週3回以上は待たされる'
      }
    ];

    const log_data = [
      {
        log_id: 'log_001',
        user_id: 'user_001',
        event_type: 'page_load_delay',
        pain_factor: 'ページ読込遅延',
        event_count: 1, // 月1回程度
        observation_period_start: '2024-01-01',
        observation_period_end: '2024-01-31',
        observation_days: 30
      }
    ];

    const result = detectDiscrepancyBetweenInterviewAndLog({
      interview_records,
      log_data,
      matching_key: 'pain_factor'
    });

    // 矛盾が検出される
    expect(result.has_discrepancy).toBe(true);
    expect(result.discrepancies).toHaveLength(1);

    const discrepancy = result.discrepancies[0];
    expect(discrepancy.pain_factor).toBe('ページ読込遅延');
    expect(discrepancy.interview_frequency_count).toBe(12);
    expect(discrepancy.log_frequency_count).toBe(1);
    
    // 乖離度合い = |インタビュー頻度 - ログ頻度| / max(インタビュー頻度, ログ頻度) * 100
    // = |12 - 1| / 12 * 100 = 11/12 * 100 = 91.67%
    expect(discrepancy.discrepancy_magnitude).toBeCloseTo(91.67, 1);
    
    expect(discrepancy.discrepancy_flag).toBe(true);
    expect(discrepancy.interview_record_id).toBe('int_001');
    expect(discrepancy.log_record_id).toBe('log_001');
    expect(discrepancy.interview_observation_period).toBe('2024-01-15');
    expect(discrepancy.log_observation_period).toEqual({
      start: '2024-01-01',
      end: '2024-01-31'
    });
    expect(discrepancy.trustworthiness_score).toBeLessThan(50); // 乖離大 → 信頼度低
  });
});