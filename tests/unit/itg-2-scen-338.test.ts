import { accumulateMealEvaluationData } from '../../src/logic/it-1-br-2-1-1-1';

describe('食事評価データの時系列蓄積と嗜好学習可能状態の準備', () => {
  // SCEN-338
  test('複数の家族成員ごと・料理ごとの食事評価データが時系列で蓄積され、学習用データセット形式で保持される', () => {
    // 入力: 家族成員ごと・料理ごとの食事評価データ
    const evaluationRecords = [
      {
        family_member_id: 'FM001',
        dish_id: 'D001',
        evaluation_date: '2024-01-01',
        satisfaction_score: 85,
        completion_rate: 0.95,
        preference_info: 'likes_vegetables',
      },
      {
        family_member_id: 'FM001',
        dish_id: 'D002',
        evaluation_date: '2024-01-02',
        satisfaction_score: 72,
        completion_rate: 0.80,
        preference_info: 'dislikes_spicy',
      },
      {
        family_member_id: 'FM002',
        dish_id: 'D001',
        evaluation_date: '2024-01-01',
        satisfaction_score: 90,
        completion_rate: 1.0,
        preference_info: 'likes_seafood',
      },
      {
        family_member_id: 'FM002',
        dish_id: 'D003',
        evaluation_date: '2024-01-03',
        satisfaction_score: 78,
        completion_rate: 0.85,
        preference_info: 'neutral_grains',
      },
    ];

    // 実行: 学習用データセット形式への変換
    const learningDataset = accumulateMealEvaluationData(evaluationRecords);

    // 検証1: データセット構造が正しく変換されていることを確認
    expect(learningDataset).toEqual({
      dataset_version: '1.0',
      total_records: 4,
      family_members: {
        FM001: {
          member_id: 'FM001',
          records_count: 2,
          records: [
            {
              family_member_id: 'FM001',
              dish_id: 'D001',
              evaluation_date: '2024-01-01',
              satisfaction_score: 85,
              completion_rate: 0.95,
              preference_info: 'likes_vegetables',
              sequence_order: 1,
            },
            {
              family_member_id: 'FM001',
              dish_id: 'D002',
              evaluation_date: '2024-01-02',
              satisfaction_score: 72,
              completion_rate: 0.80,
              preference_info: 'dislikes_spicy',
              sequence_order: 2,
            },
          ],
        },
        FM002: {
          member_id: 'FM002',
          records_count: 2,
          records: [
            {
              family_member_id: 'FM002',
              dish_id: 'D001',
              evaluation_date: '2024-01-01',
              satisfaction_score: 90,
              completion_rate: 1.0,
              preference_info: 'likes_seafood',
              sequence_order: 1,
            },
            {
              family_member_id: 'FM002',
              dish_id: 'D003',
              evaluation_date: '2024-01-03',
              satisfaction_score: 78,
              completion_rate: 0.85,
              preference_info: 'neutral_grains',
              sequence_order: 2,
            },
          ],
        },
      },
      aggregation_timestamp: expect.any(String),
      data_quality_score: 100,
    });

    // 検証2: 各家族成員のデータが時系列（日付昇順）に整列していることを確認
    const fm001RecordDates = learningDataset.family_members.FM001.records.map(
      (r: any) => r.evaluation_date
    );
    expect(fm001RecordDates).toEqual(['2024-01-01', '2024-01-02']);

    const fm002RecordDates = learningDataset.family_members.FM002.records.map(
      (r: any) => r.evaluation_date
    );
    expect(fm002RecordDates).toEqual(['2024-01-01', '2024-01-03']);

    // 検証3: 学習用データセットに必要なすべての情報が完全に構造化されていることを確認
    learningDataset.family_members.FM001.records.forEach(
      (record: any, index: number) => {
        expect(record).toHaveProperty('family_member_id');
        expect(record).toHaveProperty('dish_id');
        expect(record).toHaveProperty('evaluation_date');
        expect(record).toHaveProperty('satisfaction_score');
        expect(record).toHaveProperty('completion_rate');
        expect(record).toHaveProperty('preference_info');
        expect(record).toHaveProperty('sequence_order');
        expect(record.sequence_order).toBe(index + 1);
        expect(typeof record.family_member_id).toBe('string');
        expect(typeof record.dish_id).toBe('string');
        expect(typeof record.evaluation_date).toBe('string');
        expect(typeof record.satisfaction_score).toBe('number');
        expect(typeof record.completion_rate).toBe('number');
        expect(typeof record.preference_info).toBe('string');
      }
    );

    // 検証4: 総レコード数が正確に計算されていることを確認
    expect(learningDataset.total_records).toBe(4);

    // 検証5: 家族成員ごとのレコード数が正確に計算されていることを確認
    expect(learningDataset.family_members.FM001.records_count).toBe(2);
    expect(learningDataset.family_members.FM002.records_count).toBe(2);

    // 検証6: データ品質スコアが100である（完全なデータセット）ことを確認
    expect(learningDataset.data_quality_score).toBe(100);

    // 検証7: aggregation_timestamp が ISO 8601 形式で記録されていることを確認
    expect(typeof learningDataset.aggregation_timestamp).toBe('string');
    expect(learningDataset.aggregation_timestamp).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
    );
  });
});