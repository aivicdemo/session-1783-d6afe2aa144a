import { filterAnomaliesAndMissingValues } from '../../src/logic/it-7-2-1';

describe('献立生成アルゴリズムの成功・失敗パターン分析と改善提案 - 異常値・欠損値フィルタリング', () => {
  // SCEN-763
  test('異常値・欠損値フィルタリング機能 - フィルタリング後の正常データのみが次段階の分析ロジックに渡される', () => {
    // 準備: テスト用のモックデータセット（正常値、異常値、欠損値を含む）
    const mockDataset = [
      {
        user_id: 'user_001',
        week_id: 'week_2024_01',
        success_rate: 0.85,
        cooking_time_reduction: 45,
        satisfaction_score: 4.5,
        timestamp: '2024-01-08T23:59:59Z'
      },
      {
        user_id: 'user_002',
        week_id: 'week_2024_01',
        success_rate: 0.92,
        cooking_time_reduction: 60,
        satisfaction_score: 4.8,
        timestamp: '2024-01-08T23:59:59Z'
      },
      {
        user_id: 'user_003',
        week_id: 'week_2024_01',
        success_rate: -0.1,
        cooking_time_reduction: 30,
        satisfaction_score: 4.2,
        timestamp: '2024-01-08T23:59:59Z'
      },
      {
        user_id: 'user_004',
        week_id: 'week_2024_01',
        success_rate: null,
        cooking_time_reduction: 50,
        satisfaction_score: 4.6,
        timestamp: '2024-01-08T23:59:59Z'
      },
      {
        user_id: 'user_005',
        week_id: 'week_2024_01',
        success_rate: 1.5,
        cooking_time_reduction: 40,
        satisfaction_score: 4.3,
        timestamp: '2024-01-08T23:59:59Z'
      },
      {
        user_id: 'user_006',
        week_id: 'week_2024_01',
        success_rate: 0.78,
        cooking_time_reduction: undefined,
        satisfaction_score: 4.1,
        timestamp: '2024-01-08T23:59:59Z'
      },
      {
        user_id: 'user_007',
        week_id: 'week_2024_01',
        success_rate: 0.88,
        cooking_time_reduction: 55,
        satisfaction_score: 5.0,
        timestamp: '2024-01-08T23:59:59Z'
      },
      {
        user_id: 'user_008',
        week_id: 'week_2024_01',
        success_rate: 0.81,
        cooking_time_reduction: -10,
        satisfaction_score: 4.4,
        timestamp: '2024-01-08T23:59:59Z'
      },
      {
        user_id: 'user_009',
        week_id: 'week_2024_01',
        success_rate: 0.91,
        cooking_time_reduction: 48,
        satisfaction_score: 4.7,
        timestamp: '2024-01-08T23:59:59Z'
      }
    ];

    // フィルタリング処理を実行
    const filteredResult = filterAnomaliesAndMissingValues({
      data: mockDataset,
      success_rate_min: 0,
      success_rate_max: 1,
      cooking_time_reduction_min: 0,
      satisfaction_score_min: 1,
      satisfaction_score_max: 5
    });

    // フィルタリング後のデータセットを取得
    const filtered_data = filteredResult.filtered_data;
    const excluded_count = filteredResult.excluded_count;
    const is_valid = filteredResult.is_valid;

    // フィルタリング後のデータセットから異常値がないことを検証
    filtered_data.forEach((record: any) => {
      expect(record.success_rate).toBeGreaterThanOrEqual(0);
      expect(record.success_rate).toBeLessThanOrEqual(1);
      expect(record.cooking_time_reduction).toBeGreaterThanOrEqual(0);
      expect(record.satisfaction_score).toBeGreaterThanOrEqual(1);
      expect(record.satisfaction_score).toBeLessThanOrEqual(5);
    });

    // フィルタリング後のデータセットから欠損値がないことを検証
    filtered_data.forEach((record: any) => {
      expect(record.user_id).toBeDefined();
      expect(record.week_id).toBeDefined();
      expect(record.success_rate).toBeDefined();
      expect(record.cooking_time_reduction).toBeDefined();
      expect(record.satisfaction_score).toBeDefined();
      expect(record.timestamp).toBeDefined();
    });

    // 除外されたレコード数を検証（異常値4件 + 欠損値2件 = 6件）
    expect(excluded_count).toBe(6);

    // フィルタリング後のデータ数を検証（9件中3件が残る）
    expect(filtered_data.length).toBe(3);

    // 正常データが期待値と一致することを検証
    const expected_filtered_data = [
      {
        user_id: 'user_001',
        week_id: 'week_2024_01',
        success_rate: 0.85,
        cooking_time_reduction: 45,
        satisfaction_score: 4.5,
        timestamp: '2024-01-08T23:59:59Z'
      },
      {
        user_id: 'user_002',
        week_id: 'week_2024_01',
        success_rate: 0.92,
        cooking_time_reduction: 60,
        satisfaction_score: 4.8,
        timestamp: '2024-01-08T23:59:59Z'
      },
      {
        user_id: 'user_007',
        week_id: 'week_2024_01',
        success_rate: 0.88,
        cooking_time_reduction: 55,
        satisfaction_score: 5.0,
        timestamp: '2024-01-08T23:59:59Z'
      }
    ];

    expect(filtered_data).toEqual(expected_filtered_data);

    // 次段階の分析ロジックに渡される準備完了フラグを検証
    expect(is_valid).toBe(true);

    // 次段階の分析ロジックシミュレーション: 正常データから集計値を計算
    const avg_success_rate =
      filtered_data.reduce((sum: number, r: any) => sum + r.success_rate, 0) /
      filtered_data.length;
    const avg_cooking_time_reduction =
      filtered_data.reduce(
        (sum: number, r: any) => sum + r.cooking_time_reduction,
        0
      ) / filtered_data.length;
    const avg_satisfaction_score =
      filtered_data.reduce(
        (sum: number, r: any) => sum + r.satisfaction_score,
        0
      ) / filtered_data.length;

    // 集計値が正常に計算されたことを確認
    expect(avg_success_rate).toBeCloseTo(0.8833, 4);
    expect(avg_cooking_time_reduction).toBeCloseTo(53.3333, 4);
    expect(avg_satisfaction_score).toBeCloseTo(4.7667, 4);

    // 次段階の分析ロジックが処理可能な状態であることを確認
    expect(filtered_data.length).toBeGreaterThan(0);
    expect(is_valid).toBe(true);
  });
});