import { extractSuccessFailurePatternsWithValidation } from '../../src/logic/it-7-2-1';

describe('献立生成成功・失敗パターン抽出と欠損値検出', () => {
  // SCEN-897: ユーザーデータの欠損値・異常値検出と除外処理
  test('should detect and exclude records with missing values, and correctly calculate success/failure patterns from valid data only', () => {
    // Arrange: テストデータセット（欠損値混在）
    const userBehaviorDataset = [
      {
        user_id: 'user_001',
        week_date: '2024-01-15',
        menu_generation_success: true,
        cooking_time_minutes: 45,
        satisfaction_score: 4.5,
      },
      {
        user_id: 'user_002',
        week_date: '2024-01-15',
        menu_generation_success: false,
        cooking_time_minutes: null, // 欠損値
        satisfaction_score: 3.0,
      },
      {
        user_id: 'user_003',
        week_date: '2024-01-15',
        menu_generation_success: true,
        cooking_time_minutes: 50,
        satisfaction_score: undefined, // 欠損値
      },
      {
        user_id: 'user_004',
        week_date: '2024-01-15',
        menu_generation_success: true,
        cooking_time_minutes: 40,
        satisfaction_score: 4.8,
      },
      {
        user_id: 'user_005',
        week_date: '2024-01-15',
        menu_generation_success: false,
        cooking_time_minutes: 35,
        satisfaction_score: '', // 空文字列は欠損値扱い
      },
      {
        user_id: 'user_006',
        week_date: '2024-01-15',
        menu_generation_success: true,
        cooking_time_minutes: 55,
        satisfaction_score: 4.2,
      },
    ];

    // Act: 成功・失敗パターン抽出実行（欠損値検出ロジック付き）
    const result = extractSuccessFailurePatternsWithValidation(userBehaviorDataset);

    // Assert: 欠損値検出と除外の検証
    // 入力: 6 レコード、欠損値含むレコード: 3 件（user_002, user_003, user_005）
    // 有効レコード: 3 件（user_001, user_004, user_006）
    expect(result.total_input_records).toBe(6);
    expect(result.excluded_records_count).toBe(3);
    expect(result.valid_records_count).toBe(3);

    // 除外されたレコードの詳細
    expect(result.excluded_record_details).toEqual([
      {
        user_id: 'user_002',
        reason: 'cooking_time_minutes',
      },
      {
        user_id: 'user_003',
        reason: 'satisfaction_score',
      },
      {
        user_id: 'user_005',
        reason: 'satisfaction_score',
      },
    ]);

    // 有効レコードのみを基に計算された成功・失敗パターン
    // 有効レコード 3 件: user_001 (成功), user_004 (成功), user_006 (成功)
    // 成功率 = 3 / 3 = 100%
    expect(result.success_rate_percent).toBe(100.0);

    // 平均調理時間（有効レコードのみ）
    // (45 + 40 + 55) / 3 = 46.67 分
    expect(result.average_cooking_time_minutes).toBeCloseTo(46.67, 2);

    // 平均満足度スコア（有効レコードのみ）
    // (4.5 + 4.8 + 4.2) / 3 = 4.5
    expect(result.average_satisfaction_score).toBeCloseTo(4.5, 1);

    // 失敗パターン集計（有効レコード内での失敗: 0 件）
    expect(result.failure_pattern_count).toBe(0);

    // 除外処理ログ記録の確認
    expect(result.validation_log).toBeDefined();
    expect(result.validation_log.length).toBe(3);
    expect(result.validation_log[0]).toEqual({
      timestamp: expect.any(String),
      record_user_id: 'user_002',
      exclusion_reason: 'Missing value in field: cooking_time_minutes',
      severity: 'EXCLUDED',
    });
  });
});