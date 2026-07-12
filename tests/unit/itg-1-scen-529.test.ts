import { validateUserSegmentIdAndIssueDataCollectionInstruction } from '../../src/logic/it-2';

describe('家族成員の食事評価データの蓄積・管理機能', () => {
  // SCEN-529: [error] データ収集指示発行機能 - 無効なユーザーセグメントIDが指定された場合にエラーが返される
  test('無効なユーザーセグメントIDが指定された場合にエラーが返される', () => {
    // 無効なセグメントID: 文字列形式だが存在しないID
    expect(() =>
      validateUserSegmentIdAndIssueDataCollectionInstruction({
        userSegmentId: 'invalid_segment_id',
        collectionStartDate: '2024-01-15',
        collectionEndDate: '2024-01-22',
        targetMetrics: [
          'meal_generation_success_rate',
          'cooking_time_reduction_degree',
          'user_satisfaction_score',
        ],
      })
    ).toThrow(/ユーザーセグメント/);

    // 無効なセグメントID: 負の数
    expect(() =>
      validateUserSegmentIdAndIssueDataCollectionInstruction({
        userSegmentId: '-1',
        collectionStartDate: '2024-01-15',
        collectionEndDate: '2024-01-22',
        targetMetrics: [
          'meal_generation_success_rate',
          'cooking_time_reduction_degree',
          'user_satisfaction_score',
        ],
      })
    ).toThrow(/ユーザーセグメント/);

    // 無効なセグメントID: 空文字列
    expect(() =>
      validateUserSegmentIdAndIssueDataCollectionInstruction({
        userSegmentId: '',
        collectionStartDate: '2024-01-15',
        collectionEndDate: '2024-01-22',
        targetMetrics: [
          'meal_generation_success_rate',
          'cooking_time_reduction_degree',
          'user_satisfaction_score',
        ],
      })
    ).toThrow(/ユーザーセグメント/);

    // 無効なセグメントID: null
    expect(() =>
      validateUserSegmentIdAndIssueDataCollectionInstruction({
        userSegmentId: null as any,
        collectionStartDate: '2024-01-15',
        collectionEndDate: '2024-01-22',
        targetMetrics: [
          'meal_generation_success_rate',
          'cooking_time_reduction_degree',
          'user_satisfaction_score',
        ],
      })
    ).toThrow(/ユーザーセグメント/);

    // 無効なセグメントID: undefined
    expect(() =>
      validateUserSegmentIdAndIssueDataCollectionInstruction({
        userSegmentId: undefined as any,
        collectionStartDate: '2024-01-15',
        collectionEndDate: '2024-01-22',
        targetMetrics: [
          'meal_generation_success_rate',
          'cooking_time_reduction_degree',
          'user_satisfaction_score',
        ],
      })
    ).toThrow(/ユーザーセグメント/);

    // 無効なセグメントID: 存在しないID（数値形式）
    expect(() =>
      validateUserSegmentIdAndIssueDataCollectionInstruction({
        userSegmentId: '99999',
        collectionStartDate: '2024-01-15',
        collectionEndDate: '2024-01-22',
        targetMetrics: [
          'meal_generation_success_rate',
          'cooking_time_reduction_degree',
          'user_satisfaction_score',
        ],
      })
    ).toThrow(/ユーザーセグメント/);
  });
});