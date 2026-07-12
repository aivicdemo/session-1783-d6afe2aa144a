import { detectAndFilterAnomalies } from '../../src/logic/it-1-br-4-2-1';

describe('異常値・欠損値フィルタリング機能', () => {
  // SCEN-541: [normal] 異常値・欠損値フィルタリング機能 - フィルタリング結果がログに記録され、PM・開発チームに通知される
  test('should detect and filter anomalies, log results, and send notifications', () => {
    const input_dataset = [
      {
        meal_id: 'meal_001',
        satisfaction_score: 4,
        completion_rate: 0.95,
        request_text: 'もっと塩辛くしてほしい',
        timestamp: '2024-01-15T19:00:00Z',
      },
      {
        meal_id: 'meal_002',
        satisfaction_score: -1,
        completion_rate: 0.85,
        request_text: 'good',
        timestamp: '2024-01-15T19:30:00Z',
      },
      {
        meal_id: 'meal_003',
        satisfaction_score: 3,
        completion_rate: null,
        request_text: 'リクエストなし',
        timestamp: '2024-01-15T20:00:00Z',
      },
      {
        meal_id: 'meal_004',
        satisfaction_score: 5,
        completion_rate: 1.5,
        request_text: 'もっと辛くしてほしい',
        timestamp: '2024-01-15T20:30:00Z',
      },
      {
        meal_id: 'meal_005',
        satisfaction_score: 2,
        completion_rate: 0.70,
        request_text: 'また食べたい',
        timestamp: '2024-01-15T21:00:00Z',
      },
    ];

    const timestamp_execution = '2024-01-15T21:15:00Z';

    const result = detectAndFilterAnomalies({
      dataset: input_dataset,
      execution_timestamp: timestamp_execution,
    });

    expect(result).toEqual({
      total_input_count: 5,
      anomaly_count: 3,
      valid_data_count: 2,
      filtered_dataset: [
        {
          meal_id: 'meal_001',
          satisfaction_score: 4,
          completion_rate: 0.95,
          request_text: 'もっと塩辛くしてほしい',
          timestamp: '2024-01-15T19:00:00Z',
        },
        {
          meal_id: 'meal_005',
          satisfaction_score: 2,
          completion_rate: 0.70,
          request_text: 'また食べたい',
          timestamp: '2024-01-15T21:00:00Z',
        },
      ],
      anomalies_detected: [
        {
          meal_id: 'meal_002',
          anomaly_reason: '満足度スコアが範囲外',
          invalid_field: 'satisfaction_score',
          invalid_value: -1,
        },
        {
          meal_id: 'meal_003',
          anomaly_reason: '完食度が欠損',
          invalid_field: 'completion_rate',
          invalid_value: null,
        },
        {
          meal_id: 'meal_004',
          anomaly_reason: '完食度が範囲外',
          invalid_field: 'completion_rate',
          invalid_value: 1.5,
        },
      ],
      log_entry: {
        timestamp: timestamp_execution,
        process_id: expect.any(String),
        total_records_processed: 5,
        anomaly_count: 3,
        null_missing_count: 1,
        format_invalid_count: 2,
        valid_records_count: 2,
        processing_status: 'completed',
        details:
          'データセット内から異常値・欠損値を検出しフィルタリングを実施。入力5件、異常値3件（うち欠損値1件、形式不正2件）、有効データ2件を確認。',
      },
      notification: {
        recipient_type: ['pm', 'dev_team'],
        notification_timestamp: timestamp_execution,
        subject: '献立生成データ異常値検出・フィルタリング完了通知',
        summary: {
          total_processed: 5,
          anomalies_found: 3,
          null_missing: 1,
          format_invalid: 2,
          valid_records: 2,
        },
        message:
          '献立生成・栄養分析パイプラインの異常値・欠損値フィルタリング処理が完了しました。処理対象5件中、異常値3件（欠損値1件、形式不正2件）を検出・隔離し、有効データ2件を次工程に引き渡します。詳細はシステムログを参照してください。',
        channel: ['email', 'slack', 'dashboard'],
      },
    });
  });
});