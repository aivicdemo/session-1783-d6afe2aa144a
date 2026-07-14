import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { calculateNextVerificationDate } from '../../src/logic/it-7-2-1';

describe('栄養基準ロジック検証タイミング確認機能', () => {
  // SCEN-664
  it('前回検証日が本日ちょうどの場合に次回検証予定日が正しく計算される', () => {
    // Arrange: 前回検証日を本日に設定
    const today = new Date('2024-01-15T00:00:00Z');
    const lastVerificationDate = today;
    const verificationInterval = 30; // デフォルト検証間隔: 30日

    // Act: 検証タイミング計算ロジックを実行
    const result = calculateNextVerificationDate({
      lastVerificationDate,
      verificationInterval,
    });

    // Assert: 次回検証予定日が前回検証日 + 検証間隔（30日）と一致することを検証
    const expectedNextVerificationDate = new Date('2024-02-14T00:00:00Z');
    expect(result.nextVerificationDate).toEqual(expectedNextVerificationDate);

    // Assert: 次回検証予定日が「本日から30日後」として正確に計算されていることを確認
    const expectedDaysDifference = 30;
    const actualDaysDifference = Math.floor(
      (result.nextVerificationDate.getTime() - lastVerificationDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );
    expect(actualDaysDifference).toBe(expectedDaysDifference);

    // Assert: タイムゾーンの影響がないことを確認（同じ日付で計算される）
    const resultUtcDate = result.nextVerificationDate.toISOString().split('T')[0];
    const expectedUtcDate = '2024-02-14';
    expect(resultUtcDate).toBe(expectedUtcDate);

    // Assert: 検証結果がダッシュボードに正しく反映されることを確認
    expect(result.isVerificationDue).toBe(false);
    expect(result.daysUntilNextVerification).toBe(30);
    expect(result.verificationCycle).toBe('monthly');
    expect(result.lastVerificationDateFormatted).toBe('2024-01-15');
    expect(result.nextVerificationDateFormatted).toBe('2024-02-14');
  });
});