import { calculateSegmentEffectiveMetrics } from '../../src/logic/it-1-br-2-1-1-1';

describe('ユーザー食事記録と栄養摂取量の推移分析・栄養基準ロジック検証', () => {
  // SCEN-379: セグメント別効果分析機能 - 専業主夫層セグメントの献立生成成功率・調理時間短縮度・満足度スコアが正確に計算される
  test('SCEN-379: 専業主夫層セグメントの献立生成成功率・調理時間短縮度・満足度スコアを正確に計算する', () => {
    // 準備: 専業主夫層セグメントの献立データセット
    const segment_type = 'househusband';
    const analysis_start_date = new Date('2024-01-01T00:00:00Z');
    const analysis_end_date = new Date('2024-03-31T23:59:59Z');

    // 献立生成リクエスト: 10件
    // 成功: 8件、失敗: 2件
    const menu_generation_requests = [
      { request_id: 'req_001', status: 'success', generated_at: new Date('2024-01-05T10:00:00Z') },
      { request_id: 'req_002', status: 'success', generated_at: new Date('2024-01-12T10:00:00Z') },
      { request_id: 'req_003', status: 'success', generated_at: new Date('2024-01-19T10:00:00Z') },
      { request_id: 'req_004', status: 'success', generated_at: new Date('2024-02-02T10:00:00Z') },
      { request_id: 'req_005', status: 'success', generated_at: new Date('2024-02-09T10:00:00Z') },
      { request_id: 'req_006', status: 'success', generated_at: new Date('2024-02-16T10:00:00Z') },
      { request_id: 'req_007', status: 'success', generated_at: new Date('2024-02-23T10:00:00Z') },
      { request_id: 'req_008', status: 'success', generated_at: new Date('2024-03-01T10:00:00Z') },
      { request_id: 'req_009', status: 'failed', generated_at: new Date('2024-03-08T10:00:00Z') },
      { request_id: 'req_010', status: 'failed', generated_at: new Date('2024-03-22T10:00:00Z') },
    ];

    // 調理時間データ: 基準調理時間と実際調理時間
    // 期待計算式: (基準 - 実績) / 基準 × 100
    const cooking_time_records = [
      { request_id: 'req_001', standard_cooking_minutes: 60, actual_cooking_minutes: 48 },  // (60-48)/60*100 = 20%
      { request_id: 'req_002', standard_cooking_minutes: 45, actual_cooking_minutes: 36 },  // (45-36)/45*100 = 20%
      { request_id: 'req_003', standard_cooking_minutes: 90, actual_cooking_minutes: 72 },  // (90-72)/90*100 = 20%
      { request_id: 'req_004', standard_cooking_minutes: 75, actual_cooking_minutes: 60 },  // (75-60)/75*100 = 20%
      { request_id: 'req_005', standard_cooking_minutes: 50, actual_cooking_minutes: 40 },  // (50-40)/50*100 = 20%
      { request_id: 'req_006', standard_cooking_minutes: 55, actual_cooking_minutes: 44 },  // (55-44)/55*100 = 20%
      { request_id: 'req_007', standard_cooking_minutes: 80, actual_cooking_minutes: 64 },  // (80-64)/80*100 = 20%
      { request_id: 'req_008', standard_cooking_minutes: 70, actual_cooking_minutes: 56 },  // (70-56)/70*100 = 20%
    ];

    // 満足度スコアデータ: ユーザーからの評価（0-100）
    // 期待計算式: 平均値
    const satisfaction_ratings = [
      { request_id: 'req_001', satisfaction_score: 90 },
      { request_id: 'req_002', satisfaction_score: 85 },
      { request_id: 'req_003', satisfaction_score: 92 },
      { request_id: 'req_004', satisfaction_score: 88 },
      { request_id: 'req_005', satisfaction_score: 87 },
      { request_id: 'req_006', satisfaction_score: 91 },
      { request_id: 'req_007', satisfaction_score: 89 },
      { request_id: 'req_008', satisfaction_score: 86 },
    ];

    // 実行
    const result = calculateSegmentEffectiveMetrics({
      segment_type,
      analysis_start_date,
      analysis_end_date,
      menu_generation_requests,
      cooking_time_records,
      satisfaction_ratings,
    });

    // 検証1: 献立生成成功率の計算
    // 成功8件 / 総10件 = 0.8 = 80%
    expect(result.success_rate).toBe(80);

    // 検証2: 調理時間短縮度の計算
    // すべての成功献立で20%の短縮
    // 合計: (20 + 20 + 20 + 20 + 20 + 20 + 20 + 20) / 8 = 160 / 8 = 20%
    expect(result.cooking_time_reduction_degree).toBe(20);

    // 検証3: 満足度スコアの計算（平均値）
    // (90 + 85 + 92 + 88 + 87 + 91 + 89 + 86) / 8 = 708 / 8 = 88.5
    expect(result.satisfaction_score).toBe(88.5);

    // 検証4: 小数点以下の丸め処理確認（到達丸め）
    // 満足度は小数第1位まで保持される想定
    expect(typeof result.satisfaction_score).toBe('number');
    expect(Number.isFinite(result.satisfaction_score)).toBe(true);

    // 検証5: 成功率と短縮度は整数値として返される
    expect(Number.isInteger(result.success_rate)).toBe(true);
    expect(Number.isInteger(result.cooking_time_reduction_degree)).toBe(true);

    // 検証6: すべてのメトリクスが計算された
    expect(result).toHaveProperty('success_rate');
    expect(result).toHaveProperty('cooking_time_reduction_degree');
    expect(result).toHaveProperty('satisfaction_score');

    // 検証7: メトリクス値の範囲確認（0-100）
    expect(result.success_rate).toBeGreaterThanOrEqual(0);
    expect(result.success_rate).toBeLessThanOrEqual(100);
    expect(result.cooking_time_reduction_degree).toBeGreaterThanOrEqual(0);
    expect(result.cooking_time_reduction_degree).toBeLessThanOrEqual(100);
    expect(result.satisfaction_score).toBeGreaterThanOrEqual(0);
    expect(result.satisfaction_score).toBeLessThanOrEqual(100);

    // 検証8: セグメント識別子が結果に含まれる
    expect(result.segment_type).toBe('househusband');

    // 検証9: 分析期間が結果に含まれる
    expect(result.analysis_start_date).toEqual(analysis_start_date);
    expect(result.analysis_end_date).toEqual(analysis_end_date);

    // 検証10: 複数データセットでの計算精度確認用の追加検証
    // 調理時間短縮度の詳細: 各献立の短縮率を正確に計算
    const expected_reduction_rates = [20, 20, 20, 20, 20, 20, 20, 20];
    const actual_sum = cooking_time_records.reduce((sum, record) => {
      const reduction = ((record.standard_cooking_minutes - record.actual_cooking_minutes) / record.standard_cooking_minutes) * 100;
      return sum + reduction;
    }, 0);
    const expected_average = actual_sum / cooking_time_records.length;
    expect(result.cooking_time_reduction_degree).toBe(expected_average);

    // 検証11: 満足度スコアの詳細確認
    const satisfaction_sum = satisfaction_ratings.reduce((sum, rating) => sum + rating.satisfaction_score, 0);
    const expected_satisfaction = satisfaction_sum / satisfaction_ratings.length;
    expect(result.satisfaction_score).toBe(expected_satisfaction);

    // 検証12: 期待値が画面表示値と一致
    // 成功率80%、短縮度20%、満足度88.5のデータセットで検証
    expect(result).toMatchObject({
      segment_type: 'househusband',
      success_rate: 80,
      cooking_time_reduction_degree: 20,
      satisfaction_score: 88.5,
    });
  });
});