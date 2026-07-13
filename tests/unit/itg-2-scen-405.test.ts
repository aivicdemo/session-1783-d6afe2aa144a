import { detectConflictingMenuPatterns } from '../../src/logic/it-1-br-2-1-1-1';

describe('ユーザー食事記録と栄養摂取量の推移分析・栄養基準ロジック検証', () => {
  // SCEN-405
  test('過去献立抵触パターン自動検出機能 - データベースアクセス失敗時にエラーメッセージが返され検出処理が中断される', async () => {
    const fetchMock = require('jest-fetch-mock');
    fetchMock.enableMocks();
    fetchMock.resetMocks();

    const user_id = 'user_12345';
    const new_restriction_id = 'restriction_001';
    const new_restriction_name = 'gluten_free';
    const new_restriction_type = 'dietary';

    const detection_input = {
      user_id,
      new_restriction_id,
      new_restriction_name,
      new_restriction_type,
      timestamp: new Date('2024-01-15T14:30:00Z'),
    };

    // データベース接続エラーをシミュレート
    fetchMock.mockRejectOnce(new Error('Network error: Failed to connect to menu database'));

    let error_thrown = false;
    let error_message = '';

    try {
      await detectConflictingMenuPatterns(detection_input);
    } catch (err) {
      error_thrown = true;
      error_message = err instanceof Error ? err.message : String(err);
    }

    // エラーが発生したことを確認
    expect(error_thrown).toBe(true);

    // エラーメッセージが「データベース接続エラー」に関連することを確認
    expect(error_message).toMatch(/データベース|database|connection|connect/i);

    // 検出処理が中断された（部分的な結果が返されていない）ことを確認
    expect(error_message.length).toBeGreaterThan(0);

    fetchMock.disableMocks();
  });
});