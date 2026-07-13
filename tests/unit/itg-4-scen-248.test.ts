import { detectSlaDelayAndExecuteFallback } from "../../src/logic/it-1-br-6-2-1";

describe("需要予測精度検証ダッシュボード：SLA遅延検知・代替処理機能", () => {
  // SCEN-248: [edge] SLA遅延検知・代替処理機能 - 経過時間がちょうど24時間の境界値で遅延判定の切り替わりを検証
  test("SCEN-248: 経過時間24時間の境界値でSLA遅延判定が切り替わり、代替処理がトリガーされること", () => {
    // テストシステムの初期化を実施
    const mockLogger: { logs: string[] } = { logs: [] };
    const mockFallbackExecutor = jest.fn();

    // 処理開始時刻を現在時刻として記録
    const processStartTime = new Date("2024-01-15T09:00:00Z");
    const slaThresholdMs = 24 * 60 * 60 * 1000; // 24時間をミリ秒に変換

    // ========== ハッピーパス: 経過時間 23時間59分59秒 ==========
    // 経過時間を23時間59分59秒に設定
    const elapsedTime23h59m59s = 23 * 60 * 60 * 1000 + 59 * 60 * 1000 + 59 * 1000;
    const checkTime23h59m59s = new Date(processStartTime.getTime() + elapsedTime23h59m59s);

    // SLA遅延判定ロジックを実行
    const result23h59m59s = detectSlaDelayAndExecuteFallback({
      processStartTime,
      currentCheckTime: checkTime23h59m59s,
      slaThresholdMs,
      logger: mockLogger,
      fallbackExecutor: mockFallbackExecutor,
    });

    // 23時間59分59秒時点での遅延判定結果が『遅延なし』であることを検証
    expect(result23h59m59s.isDelayed).toBe(false);
    expect(result23h59m59s.elapsedMs).toBe(elapsedTime23h59m59s);
    expect(result23h59m59s.message).toMatch(/遅延なし/);
    expect(mockFallbackExecutor).not.toHaveBeenCalled();

    // ========== 境界値テスト: 経過時間 24時間00分00秒 ==========
    // 経過時間を24時間00分00秒に設定
    const elapsedTime24h00m00s = 24 * 60 * 60 * 1000;
    const checkTime24h00m00s = new Date(processStartTime.getTime() + elapsedTime24h00m00s);

    // SLA遅延判定ロジックを再度実行
    const result24h00m00s = detectSlaDelayAndExecuteFallback({
      processStartTime,
      currentCheckTime: checkTime24h00m00s,
      slaThresholdMs,
      logger: mockLogger,
      fallbackExecutor: mockFallbackExecutor,
    });

    // 24時間00分00秒時点での遅延判定結果が『遅延あり』に切り替わることを検証
    expect(result24h00m00s.isDelayed).toBe(true);
    expect(result24h00m00s.elapsedMs).toBe(elapsedTime24h00m00s);
    expect(result24h00m00s.message).toMatch(/遅延あり/);

    // 遅延判定が『遅延あり』となった際に代替処理がトリガーされたことをモック検証
    expect(mockFallbackExecutor).toHaveBeenCalledTimes(1);
    expect(mockFallbackExecutor).toHaveBeenCalledWith({
      delayMs: elapsedTime24h00m00s - slaThresholdMs,
      triggeredAt: checkTime24h00m00s,
    });

    // 代替処理の実行ログが正しく記録されていることを確認
    const logEntries = mockLogger.logs;
    expect(logEntries.length).toBeGreaterThan(0);
    expect(logEntries.some((log) => log.includes("代替処理"))).toBe(true);
    expect(logEntries.some((log) => log.includes("実行"))).toBe(true);

    // テスト後のクリーンアップ処理を実施
    mockFallbackExecutor.mockClear();
    mockLogger.logs = [];

    // テストデータが削除されたことを確認
    expect(mockFallbackExecutor).not.toHaveBeenCalled();
    expect(mockLogger.logs.length).toBe(0);
  });
});