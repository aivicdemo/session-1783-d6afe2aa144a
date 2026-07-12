import { detectAndCorrectDataAnomalies } from '../../src/logic/it-3';

describe('ユーザーデータの欠損値・異常値検出と補正', () => {
  // SCEN-615
  test('ユーザーフィードバック・利用ログデータの欠損値と異常値が自動検出され補正される', () => {
    // 欠損値・異常値を含むテストデータ
    const raw_user_feedback_log = [
      {
        user_id: 'user_001',
        feedback_id: 'fb_001',
        satisfaction_score: 5,
        completion_rate: 1.0,
        request_text: 'もっと和食が良い',
        timestamp: '2024-01-15T10:30:00Z',
      },
      {
        user_id: 'user_002',
        feedback_id: 'fb_002',
        satisfaction_score: null, // 欠損値
        completion_rate: 0.8,
        request_text: '',
        timestamp: '2024-01-15T11:00:00Z',
      },
      {
        user_id: 'user_003',
        feedback_id: 'fb_003',
        satisfaction_score: 10, // 異常値（範囲外：1～5）
        completion_rate: -0.5, // 異常値（範囲外：0～1）
        request_text: 'リクエスト',
        timestamp: '2024-01-15T12:00:00Z',
      },
      {
        user_id: 'user_004',
        feedback_id: 'fb_004',
        satisfaction_score: 3,
        completion_rate: undefined, // 欠損値
        request_text: null,
        timestamp: 'invalid-date-format', // 異常値（不正な日時）
      },
      {
        user_id: 'user_005',
        feedback_id: 'fb_005',
        satisfaction_score: 4,
        completion_rate: 0.9,
        request_text: '野菜を増やしたい',
        timestamp: '2024-01-15T14:00:00Z',
      },
    ];

    const result = detectAndCorrectDataAnomalies(raw_user_feedback_log);

    // 検出結果の検証
    expect(result.detected_anomalies).toBeDefined();
    expect(result.detected_anomalies.length).toBe(4); // 欠損値・異常値4件検出

    // 欠損値検出の検証
    const missing_satisfaction = result.detected_anomalies.find(
      (a: any) => a.feedback_id === 'fb_002' && a.field === 'satisfaction_score'
    );
    expect(missing_satisfaction).toBeDefined();
    expect(missing_satisfaction.anomaly_type).toBe('missing_value');

    const missing_completion = result.detected_anomalies.find(
      (a: any) => a.feedback_id === 'fb_004' && a.field === 'completion_rate'
    );
    expect(missing_completion).toBeDefined();
    expect(missing_completion.anomaly_type).toBe('missing_value');

    const missing_request = result.detected_anomalies.find(
      (a: any) => a.feedback_id === 'fb_004' && a.field === 'request_text'
    );
    expect(missing_request).toBeDefined();

    // 異常値検出の検証
    const out_of_range_satisfaction = result.detected_anomalies.find(
      (a: any) => a.feedback_id === 'fb_003' && a.field === 'satisfaction_score'
    );
    expect(out_of_range_satisfaction).toBeDefined();
    expect(out_of_range_satisfaction.anomaly_type).toBe('out_of_range');
    expect(out_of_range_satisfaction.detected_value).toBe(10);

    const out_of_range_completion = result.detected_anomalies.find(
      (a: any) => a.feedback_id === 'fb_003' && a.field === 'completion_rate'
    );
    expect(out_of_range_completion).toBeDefined();
    expect(out_of_range_completion.anomaly_type).toBe('out_of_range');
    expect(out_of_range_completion.detected_value).toBe(-0.5);

    // 補正後データの検証
    expect(result.corrected_data).toBeDefined();
    expect(result.corrected_data.length).toBe(5);

    // fb_002: satisfaction_score が null → デフォルト値 3 に補正
    const corrected_fb_002 = result.corrected_data.find(
      (d: any) => d.feedback_id === 'fb_002'
    );
    expect(corrected_fb_002.satisfaction_score).toBe(3);
    expect(corrected_fb_002.request_text).toBe(''); // 空文字列は保持

    // fb_003: satisfaction_score 10 → 5 に補正、completion_rate -0.5 → 0 に補正
    const corrected_fb_003 = result.corrected_data.find(
      (d: any) => d.feedback_id === 'fb_003'
    );
    expect(corrected_fb_003.satisfaction_score).toBe(5);
    expect(corrected_fb_003.completion_rate).toBe(0);

    // fb_004: satisfaction_score 3（正常） / completion_rate undefined → 0.5 に補正
    //         request_text null → 空文字列に補正 / timestamp 不正 → ISO形式に補正
    const corrected_fb_004 = result.corrected_data.find(
      (d: any) => d.feedback_id === 'fb_004'
    );
    expect(corrected_fb_004.satisfaction_score).toBe(3);
    expect(corrected_fb_004.completion_rate).toBe(0.5);
    expect(corrected_fb_004.request_text).toBe('');
    expect(corrected_fb_004.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);

    // fb_001, fb_005: 正常データは変わらない
    const corrected_fb_001 = result.corrected_data.find(
      (d: any) => d.feedback_id === 'fb_001'
    );
    expect(corrected_fb_001.satisfaction_score).toBe(5);
    expect(corrected_fb_001.completion_rate).toBe(1.0);
    expect(corrected_fb_001.request_text).toBe('もっと和食が良い');

    const corrected_fb_005 = result.corrected_data.find(
      (d: any) => d.feedback_id === 'fb_005'
    );
    expect(corrected_fb_005.satisfaction_score).toBe(4);
    expect(corrected_fb_005.completion_rate).toBe(0.9);

    // 補正追跡ログの検証
    expect(result.correction_log).toBeDefined();
    expect(result.correction_log.length).toBeGreaterThan(0);

    // 各補正ログに補正前後のデータと理由が記録されていることを検証
    const fb_002_correction_log = result.correction_log.find(
      (log: any) => log.feedback_id === 'fb_002'
    );
    expect(fb_002_correction_log).toBeDefined();
    expect(fb_002_correction_log.corrections).toBeDefined();
    expect(fb_002_correction_log.corrections.length).toBeGreaterThan(0);

    const satisfaction_correction = fb_002_correction_log.corrections.find(
      (c: any) => c.field === 'satisfaction_score'
    );
    expect(satisfaction_correction.original_value).toBeNull();
    expect(satisfaction_correction.corrected_value).toBe(3);
    expect(satisfaction_correction.reason).toMatch(/missing|default/i);

    // 全体の品質スコア検証（0～100、高いほど良い）
    expect(result.data_quality_score).toBeGreaterThanOrEqual(0);
    expect(result.data_quality_score).toBeLessThanOrEqual(100);
    // 4件の異常値が補正されたため、スコアは 80% 程度（5件中1件のみ正常）
    expect(result.data_quality_score).toBeLessThan(90);

    // 補正サマリーの検証
    expect(result.summary).toBeDefined();
    expect(result.summary.total_records).toBe(5);
    expect(result.summary.anomaly_count).toBe(4);
    expect(result.summary.corrected_count).toBe(4);
    expect(result.summary.corrected_fields).toContain('satisfaction_score');
    expect(result.summary.corrected_fields).toContain('completion_rate');
    expect(result.summary.corrected_fields).toContain('request_text');
    expect(result.summary.corrected_fields).toContain('timestamp');
  });
});