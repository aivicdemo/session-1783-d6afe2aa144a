import { defineExtractionSpec } from '../../src/logic/it-8-1-2-1';

describe('献立生成フロー内の制約条件入力パターンと離脱ポイント自動抽出・可視化機能', () => {
  // SCEN-244: [edge] ユーザーフィードバック・利用ログ抽出仕様定義 - 集計期間が0日または負の値の場合、エラーで処理が中断される
  test('集計期間が0日または負の値の場合、適切なエラーメッセージが返され処理が中断される', () => {
    // ========== 入力: 集計期間 = 0日のケース ==========
    const spec_zero_days = {
      targetDataType: 'user_feedback_and_usage_log',
      aggregationPeriodDays: 0,
      filterConditions: {
        userSegment: 'stay_at_home_father',
        excludeIncompleteData: true,
      },
      outputFormat: 'json',
    };

    // ========== 検証: 集計期間0日でエラーが発生することを確認 ==========
    expect(() => defineExtractionSpec(spec_zero_days)).toThrow(/集計期間/);

    // ========== 入力: 集計期間 = -1日のケース ==========
    const spec_negative_days = {
      targetDataType: 'user_feedback_and_usage_log',
      aggregationPeriodDays: -1,
      filterConditions: {
        userSegment: 'stay_at_home_father',
        excludeIncompleteData: true,
      },
      outputFormat: 'json',
    };

    // ========== 検証: 集計期間-1日でエラーが発生することを確認 ==========
    expect(() => defineExtractionSpec(spec_negative_days)).toThrow(/集計期間/);

    // ========== 入力: 集計期間 = -7日のケース（複数の負値パターン） ==========
    const spec_large_negative_days = {
      targetDataType: 'user_feedback_and_usage_log',
      aggregationPeriodDays: -7,
      filterConditions: {
        userSegment: 'stay_at_home_father',
        excludeIncompleteData: true,
      },
      outputFormat: 'json',
    };

    // ========== 検証: 集計期間-7日でエラーが発生することを確認 ==========
    expect(() => defineExtractionSpec(spec_large_negative_days)).toThrow(/集計期間/);

    // ========== 入力: 集計期間 = 1日のケース（正常系境界値） ==========
    const spec_valid_one_day = {
      targetDataType: 'user_feedback_and_usage_log',
      aggregationPeriodDays: 1,
      filterConditions: {
        userSegment: 'stay_at_home_father',
        excludeIncompleteData: true,
      },
      outputFormat: 'json',
    };

    // ========== 検証: 集計期間1日は正常に処理される ==========
    const result_valid = defineExtractionSpec(spec_valid_one_day);
    expect(result_valid).toBeDefined();
    expect(result_valid.aggregationPeriodDays).toBe(1);
    expect(result_valid.status).toBe('initialized');

    // ========== 入力: 集計期間 = 30日のケース（通常系） ==========
    const spec_valid_thirty_days = {
      targetDataType: 'user_feedback_and_usage_log',
      aggregationPeriodDays: 30,
      filterConditions: {
        userSegment: 'stay_at_home_father',
        excludeIncompleteData: true,
      },
      outputFormat: 'json',
    };

    // ========== 検証: 集計期間30日は正常に処理される ==========
    const result_thirty = defineExtractionSpec(spec_valid_thirty_days);
    expect(result_thirty).toBeDefined();
    expect(result_thirty.aggregationPeriodDays).toBe(30);
    expect(result_thirty.status).toBe('initialized');
  });
});