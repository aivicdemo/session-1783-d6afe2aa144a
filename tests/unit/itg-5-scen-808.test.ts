import { classifyMenuRejectReason } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-808
  test('定義済みカテゴリに該当しない理由テキストが入力された場合、未分類フラグが立てられて手動レビューキューに登録される', () => {
    // 入力: 定義済みカテゴリに該当しない理由テキスト
    const input_reason_text = 'システムエラーにより対応不可';
    const input_menu_id = 'menu_001';
    const input_user_id = 'user_123';
    const input_timestamp = new Date('2024-01-15T11:00:00Z');

    // 処理実行
    const result = classifyMenuRejectReason({
      reason_text: input_reason_text,
      menu_id: input_menu_id,
      user_id: input_user_id,
      timestamp: input_timestamp,
    });

    // 期待結果: 未分類フラグが true に設定される
    expect(result.is_unclassified).toBe(true);

    // 期待結果: カテゴリが null または 'unclassified' に設定される
    expect(result.category).toBeNull();

    // 期待結果: 手動レビューキューへの登録フラグが true
    expect(result.queued_for_manual_review).toBe(true);

    // 期待結果: 元の理由テキストが保持されている
    expect(result.original_reason_text).toBe(input_reason_text);

    // 期待結果: 手動レビューキューのレコードに理由テキストが保持されている
    expect(result.manual_review_queue_record.reason_text).toBe(input_reason_text);

    // 期待結果: 手動レビューキューのレコードに menu_id と user_id が記録されている
    expect(result.manual_review_queue_record.menu_id).toBe(input_menu_id);
    expect(result.manual_review_queue_record.user_id).toBe(input_user_id);

    // 期待結果: システムログに未分類として処理されたことが記録されている
    expect(result.system_log_entry.action).toBe('classify');
    expect(result.system_log_entry.status).toBe('unclassified');
    expect(result.system_log_entry.reason_text).toBe(input_reason_text);
    expect(result.system_log_entry.timestamp).toEqual(input_timestamp);

    // 期待結果: レスポンスに成功ステータスが含まれている
    expect(result.success).toBe(true);

    // 期待結果: confidence_score が低い値で設定される（未分類の信頼度が低い）
    expect(result.confidence_score).toBeLessThan(0.3);
  });
});