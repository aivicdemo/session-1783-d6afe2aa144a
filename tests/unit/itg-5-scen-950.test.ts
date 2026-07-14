import { describe, test, expect } from '@jest/globals';
import { detectAndExcludeAnomalies } from '../../src/logic/it-7-2-1';

describe('献立生成の行動指標集計と改善効果比較 - 異常値検出', () => {
  // SCEN-950: [error] 外れ値・異常値検出・除外機能 - 欠損値・null値を含むデータセットに対してエラーを返す
  test('欠損値を含むデータセットを入力時、適切なエラーメッセージを返す', () => {
    const datasetWithMissingValue = [
      {
        user_id: 'user_001',
        week: '2024-W01',
        generation_success_rate: 85.5,
        cooking_time_reduction_degree: 20.3,
        user_satisfaction_score: 4.2,
      },
      {
        user_id: 'user_002',
        week: '2024-W01',
        generation_success_rate: undefined, // 欠損値
        cooking_time_reduction_degree: 15.8,
        user_satisfaction_score: 3.9,
      },
      {
        user_id: 'user_003',
        week: '2024-W01',
        generation_success_rate: 78.2,
        cooking_time_reduction_degree: 18.5,
        user_satisfaction_score: 4.1,
      },
    ];

    expect(() => {
      detectAndExcludeAnomalies(datasetWithMissingValue);
    }).toThrow(/欠損値/);
  });

  test('null値を含むデータセットを入力時、適切なエラーメッセージを返す', () => {
    const datasetWithNullValue = [
      {
        user_id: 'user_001',
        week: '2024-W01',
        generation_success_rate: 85.5,
        cooking_time_reduction_degree: 20.3,
        user_satisfaction_score: 4.2,
      },
      {
        user_id: 'user_002',
        week: '2024-W01',
        generation_success_rate: 82.1,
        cooking_time_reduction_degree: null, // null値
        user_satisfaction_score: 3.9,
      },
      {
        user_id: 'user_003',
        week: '2024-W01',
        generation_success_rate: 78.2,
        cooking_time_reduction_degree: 18.5,
        user_satisfaction_score: 4.1,
      },
    ];

    expect(() => {
      detectAndExcludeAnomalies(datasetWithNullValue);
    }).toThrow(/null値/);
  });

  test('複数フィールドで欠損値・null値が混在するデータセットを入力時、エラーを返す', () => {
    const datasetWithMultipleAnomalies = [
      {
        user_id: 'user_001',
        week: '2024-W01',
        generation_success_rate: 85.5,
        cooking_time_reduction_degree: 20.3,
        user_satisfaction_score: 4.2,
      },
      {
        user_id: 'user_002',
        week: '2024-W01',
        generation_success_rate: undefined,
        cooking_time_reduction_degree: 15.8,
        user_satisfaction_score: null,
      },
    ];

    expect(() => {
      detectAndExcludeAnomalies(datasetWithMultipleAnomalies);
    }).toThrow(/欠損値|null値/);
  });

  test('正常なデータセットのみを入力時、処理が正常に完了し、品質検証済みデータを返す', () => {
    const validDataset = [
      {
        user_id: 'user_001',
        week: '2024-W01',
        generation_success_rate: 85.5,
        cooking_time_reduction_degree: 20.3,
        user_satisfaction_score: 4.2,
      },
      {
        user_id: 'user_002',
        week: '2024-W01',
        generation_success_rate: 82.1,
        cooking_time_reduction_degree: 18.7,
        user_satisfaction_score: 3.9,
      },
      {
        user_id: 'user_003',
        week: '2024-W01',
        generation_success_rate: 78.2,
        cooking_time_reduction_degree: 18.5,
        user_satisfaction_score: 4.1,
      },
    ];

    const result = detectAndExcludeAnomalies(validDataset);

    expect(result).toEqual({
      valid_records: validDataset,
      anomaly_count: 0,
      quality_verified: true,
    });
  });

  test('異常値（外れ値）を含むが欠損値・null値を含まないデータセットを入力時、異常値を除外して返す', () => {
    const datasetWithOutlier = [
      {
        user_id: 'user_001',
        week: '2024-W01',
        generation_success_rate: 85.5,
        cooking_time_reduction_degree: 20.3,
        user_satisfaction_score: 4.2,
      },
      {
        user_id: 'user_002',
        week: '2024-W01',
        generation_success_rate: 999.9, // 外れ値（100を超える成功率）
        cooking_time_reduction_degree: 18.7,
        user_satisfaction_score: 3.9,
      },
      {
        user_id: 'user_003',
        week: '2024-W01',
        generation_success_rate: 78.2,
        cooking_time_reduction_degree: 18.5,
        user_satisfaction_score: 4.1,
      },
    ];

    const result = detectAndExcludeAnomalies(datasetWithOutlier);

    expect(result.anomaly_count).toBe(1);
    expect(result.quality_verified).toBe(true);
    expect(result.valid_records.length).toBe(2);
    expect(
      result.valid_records.every((r) => r.generation_success_rate <= 100)
    ).toBe(true);
  });
});