import { jest } from '@jest/globals';
import { detectScheduleDelayAndAlert } from '../../src/logic/it-2';

describe('家族成員の食事評価データの蓄積・管理機能', () => {
  // SCEN-702: [edge] 分析フェーズスケジュール管理機能 - 納期が現在時刻を越える場合に自動的に遅延アラートが発生する
  test('分析フェーズスケジュール管理で納期超過時に遅延アラートが自動発生', () => {
    // 現在時刻を固定値で設定（2024-01-15 12:00:00 UTC）
    const mockCurrentTime = new Date('2024-01-15T12:00:00Z');
    jest.useFakeTimers();
    jest.setSystemTime(mockCurrentTime);

    // 納期を現在時刻の1時間前に設定（2024-01-15 11:00:00 UTC）
    const scheduleDeadline = new Date('2024-01-15T11:00:00Z');
    const analysisPhaseId = 'phase-001';
    const analysisPhaseLabel = 'セグメント別利用パターン分析';

    // スケジュール設定を保存する段階で、納期チェックと遅延アラート検出を実行
    const alertResult = detectScheduleDelayAndAlert({
      phaseId: analysisPhaseId,
      phaseLabel: analysisPhaseLabel,
      deadline: scheduleDeadline,
      currentTime: mockCurrentTime,
    });

    // 遅延アラートが正しく検出されたことを確認
    expect(alertResult.isDelayed).toBe(true);
    expect(alertResult.delayMinutes).toBe(60);
    expect(alertResult.alertTriggered).toBe(true);
    expect(alertResult.alertMessage).toContain(analysisPhaseLabel);
    expect(alertResult.alertLevel).toBe('WARNING');

    // ユーザー行動ログに遅延検出イベントが記録されていることを確認
    expect(alertResult.eventLogged).toBe(true);
    expect(alertResult.logEntry.eventType).toBe('SCHEDULE_DELAY_DETECTED');
    expect(alertResult.logEntry.phaseId).toBe(analysisPhaseId);
    expect(alertResult.logEntry.deadline.toISOString()).toBe(scheduleDeadline.toISOString());
    expect(alertResult.logEntry.detectedAt.toISOString()).toBe(mockCurrentTime.toISOString());

    // 遅延時間の計算値が正確であることを確認（タイムスタンプ差分）
    const delayMilliseconds = mockCurrentTime.getTime() - scheduleDeadline.getTime();
    expect(alertResult.delayMilliseconds).toBe(delayMilliseconds);

    // システムの定期チェック間隔内（例：5分以内）に遅延検出が実行されたことを確認
    expect(alertResult.checkExecutedWithinSLA).toBe(true);
    expect(alertResult.checkExecutionTimeMs).toBeLessThanOrEqual(300000); // 5分

    jest.useRealTimers();
  });
});