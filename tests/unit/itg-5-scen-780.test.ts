import { determineMonthlyVerificationTiming } from '../../src/logic/it-7-2-1';

describe('月次検証タイミング判定機能', () => {
  // SCEN-780
  test('当月6日以降に検証タイミング確認を開始した場合、検証待機状態を通知する', () => {
    // 入力: 当月6日以降の日付で検証タイミング確認を開始
    const currentDate = new Date('2024-01-15T10:30:00Z');
    const lastVerificationDate = new Date('2023-12-15T09:00:00Z');
    const verificationCycle = 'monthly';

    // 実行
    const result = determineMonthlyVerificationTiming({
      currentDate,
      lastVerificationDate,
      verificationCycle,
    });

    // 期待結果: 検証待機状態を示すオブジェクトが返される
    expect(result).toEqual({
      status: 'waiting',
      message: '検証待機',
      nextVerificationDate: new Date('2024-02-15T09:00:00Z'),
      daysUntilNextVerification: 31,
      isReadyForVerification: false,
      currentMonthDay: 15,
    });

    // ステータスが 'waiting' であることを確認
    expect(result.status).toBe('waiting');

    // メッセージが '検証待機' であることを確認
    expect(result.message).toBe('検証待機');

    // 検証準備フラグが false であることを確認
    expect(result.isReadyForVerification).toBe(false);

    // 次回検証予定日が正しく計算されていることを確認
    expect(result.nextVerificationDate).toEqual(new Date('2024-02-15T09:00:00Z'));

    // 次回検証までの日数が 31 日であることを確認
    expect(result.daysUntilNextVerification).toBe(31);

    // 当月の日付が 15 日であることを確認
    expect(result.currentMonthDay).toBe(15);
  });
});