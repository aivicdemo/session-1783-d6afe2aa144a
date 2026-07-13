import { detectAndExcludeAnomalies } from '../../src/logic/it-1-br-2-1-1-1';

describe('ユーザーの食事記録と栄養摂取量の推移データ自動集計ダッシュボード機能', () => {
  // SCEN-606: [normal] ユーザーデータの欠損値・異常値の自動検出と除外
  test('ユーザーデータ内の欠損値と異常値が正しく自動検出される', () => {
    // 【準備】テストデータセット: 欠損値、異常値、正常値を含むユーザー栄養データ
    const test_user_nutrition_records = [
      {
        record_id: 'REC001',
        user_id: 'USR001',
        measurement_date: '2024-01-15',
        nutrition_item: 'カロリー',
        target_value: 2000,
        actual_value: 1850,
        unit: 'kcal',
        achievement_rate: 92.5,
      },
      {
        record_id: 'REC002',
        user_id: 'USR001',
        measurement_date: '2024-01-16',
        nutrition_item: 'タンパク質',
        target_value: 50,
        actual_value: null, // 欠損値: NULL
        unit: 'g',
        achievement_rate: null,
      },
      {
        record_id: 'REC003',
        user_id: 'USR001',
        measurement_date: '2024-01-17',
        nutrition_item: '脂質',
        target_value: 65,
        actual_value: '', // 欠損値: 空文字列
        unit: 'g',
        achievement_rate: 0,
      },
      {
        record_id: 'REC004',
        user_id: 'USR001',
        measurement_date: '2024-01-18',
        nutrition_item: '炭水化物',
        target_value: 300,
        actual_value: -150, // 異常値: 負の数値（物理的に不可能）
        unit: 'g',
        achievement_rate: -50,
      },
      {
        record_id: 'REC005',
        user_id: 'USR001',
        measurement_date: '2024-01-19',
        nutrition_item: 'ビタミンC',
        target_value: 100,
        actual_value: 99999, // 異常値: 極端に大きい値（範囲外）
        unit: 'mg',
        achievement_rate: 99999,
      },
      {
        record_id: 'REC006',
        user_id: 'USR001',
        measurement_date: '2024-01-20',
        nutrition_item: 'カルシウム',
        target_value: 800,
        actual_value: 'invalid_format', // 異常値: 不正な形式（数値ではない）
        unit: 'mg',
        achievement_rate: null,
      },
      {
        record_id: 'REC007',
        user_id: 'USR001',
        measurement_date: '2024-01-21',
        nutrition_item: '食物繊維',
        target_value: 25,
        actual_value: 23.5,
        unit: 'g',
        achievement_rate: 94,
      },
    ];

    // 【実行】自動検出機能の実行
    const result = detectAndExcludeAnomalies(test_user_nutrition_records);

    // 【検証】欠損値の検出
    const missing_value_records = result.detected_issues.filter(
      (issue) => issue.issue_type === 'missing_value'
    );
    expect(missing_value_records.length).toBe(2); // REC002, REC003
    expect(missing_value_records.some((r) => r.record_id === 'REC002')).toBe(true);
    expect(missing_value_records.some((r) => r.record_id === 'REC003')).toBe(true);
    expect(
      missing_value_records.some(
        (r) => r.affected_field === 'actual_value' && r.issue_detail === 'NULL値'
      )
    ).toBe(true);
    expect(
      missing_value_records.some(
        (r) => r.affected_field === 'actual_value' && r.issue_detail === '空文字列'
      )
    ).toBe(true);

    // 【検証】異常値の検出
    const anomaly_records = result.detected_issues.filter(
      (issue) => issue.issue_type === 'anomaly'
    );
    expect(anomaly_records.length).toBe(3); // REC004, REC005, REC006
    expect(anomaly_records.some((r) => r.record_id === 'REC004')).toBe(true);
    expect(anomaly_records.some((r) => r.record_id === 'REC005')).toBe(true);
    expect(anomaly_records.some((r) => r.record_id === 'REC006')).toBe(true);
    expect(
      anomaly_records.some(
        (r) => r.issue_detail === '負の数値（物理的に不可能）'
      )
    ).toBe(true);
    expect(
      anomaly_records.some(
        (r) => r.issue_detail === '範囲外の値（99999）'
      )
    ).toBe(true);
    expect(
      anomaly_records.some(
        (r) => r.issue_detail === '不正な形式（数値ではない）'
      )
    ).toBe(true);

    // 【検証】検出結果が別個のレコードとして記録されている
    expect(result.detected_issues.length).toBe(5);
    result.detected_issues.forEach((issue) => {
      expect(issue.record_id).toBeDefined();
      expect(issue.issue_type).toMatch(/missing_value|anomaly/);
      expect(issue.affected_field).toBeDefined();
      expect(issue.issue_detail).toBeDefined();
      expect(issue.detection_timestamp).toBeDefined();
    });

    // 【検証】除外対象として自動判定されたレコードを確認
    const excluded_record_ids = result.excluded_records.map((r) => r.record_id);
    expect(excluded_record_ids).toContain('REC002');
    expect(excluded_record_ids).toContain('REC003');
    expect(excluded_record_ids).toContain('REC004');
    expect(excluded_record_ids).toContain('REC005');
    expect(excluded_record_ids).toContain('REC006');
    expect(excluded_record_ids.length).toBe(5);

    // 【検証】ダッシュボード集計から除外されていることを確認
    const included_records_for_aggregation = result.valid_records;
    const included_record_ids = included_records_for_aggregation.map(
      (r) => r.record_id
    );
    expect(included_record_ids).toContain('REC001');
    expect(included_record_ids).toContain('REC007');
    expect(included_record_ids.length).toBe(2);
    expect(included_record_ids).not.toContain('REC002');
    expect(included_record_ids).not.toContain('REC003');
    expect(included_record_ids).not.toContain('REC004');
    expect(included_record_ids).not.toContain('REC005');
    expect(included_record_ids).not.toContain('REC006');

    // 【検証】検出結果レポートに欠損値・異常値の詳細が正確に記録されている
    expect(result.report.total_records_processed).toBe(7);
    expect(result.report.total_missing_values_detected).toBe(2);
    expect(result.report.total_anomalies_detected).toBe(3);
    expect(result.report.total_excluded).toBe(5);
    expect(result.report.total_valid).toBe(2);
    expect(result.report.exclusion_summary).toEqual({
      'REC002': {
        reason: 'missing_value',
        field: 'actual_value',
        detail: 'NULL値',
      },
      'REC003': {
        reason: 'missing_value',
        field: 'actual_value',
        detail: '空文字列',
      },
      'REC004': {
        reason: 'anomaly',
        field: 'actual_value',
        detail: '負の数値（物理的に不可能）',
      },
      'REC005': {
        reason: 'anomaly',
        field: 'actual_value',
        detail: '範囲外の値（99999）',
      },
      'REC006': {
        reason: 'anomaly',
        field: 'actual_value',
        detail: '不正な形式（数値ではない）',
      },
    });

    // 【検証】データ品質スコアが正しく算出されている
    // 計算式: (有効レコード数 / 処理総レコード数) × 100
    const expected_data_quality_score = (2 / 7) * 100; // 約28.57%
    expect(result.data_quality_score).toBeCloseTo(expected_data_quality_score, 2);
    expect(result.data_quality_score).toBe(28.57);

    // 【検証】ダッシュボード集計用の検証済みデータが利用可能な状態
    expect(result.valid_records.length).toBe(2);
    expect(result.valid_records[0].record_id).toBe('REC001');
    expect(result.valid_records[0].achievement_rate).toBe(92.5);
    expect(result.valid_records[1].record_id).toBe('REC007');
    expect(result.valid_records[1].achievement_rate).toBe(94);

    // 【検証】集計結果の信頼性メタデータ
    expect(result.aggregation_metadata.data_quality_level).toBe('low'); // 品質スコア 28.57% → 低
    expect(result.aggregation_metadata.records_excluded_count).toBe(5);
    expect(result.aggregation_metadata.is_safe_for_analysis).toBe(false); // 品質が低いため分析には注意
  });
});