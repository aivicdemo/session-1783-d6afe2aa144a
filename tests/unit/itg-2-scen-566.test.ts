import { detectShoppingListGenerationSLADelay } from '../../src/logic/it-1-br-2-1-1-1';

describe('ユーザー食事記録と栄養摂取量推移分析ダッシュボード - 買い物リスト生成SLA遅延検知', () => {
  // SCEN-566: [edge] 買い物リスト生成SLA遅延検知・代替処理機能 - 経過時間がSLA閾値と正確に一致する境界値で、遅延判定が正しく実行される
  test('経過時間がSLA閾値と完全に一致する境界値で遅延判定が実行される', () => {
    const SLA_THRESHOLD_MS = 5000;
    const START_TIMESTAMP = new Date('2024-01-15T09:00:00Z').getTime();
    const BOUNDARY_TIMESTAMP = START_TIMESTAMP + SLA_THRESHOLD_MS;

    const input = {
      processStartTime: START_TIMESTAMP,
      currentTime: BOUNDARY_TIMESTAMP,
      slaThresholdMs: SLA_THRESHOLD_MS,
      processId: 'proc-shopping-001',
    };

    const result = detectShoppingListGenerationSLADelay(input);

    // (1) 遅延判定ロジックが正常に機能すること
    expect(result).toHaveProperty('isDelayed');
    expect(typeof result.isDelayed).toBe('boolean');

    // (2) 代替処理が正しくトリガーされるか、または適切にスキップされること
    // 境界値（ちょうど5000ms）では遅延と判定されるべき（>= 比較）
    expect(result.isDelayed).toBe(true);
    expect(result).toHaveProperty('shouldExecuteFallback');
    expect(result.shouldExecuteFallback).toBe(true);

    // (3) システムが安定した状態を保ち、例外が発生しないこと
    expect(result).toHaveProperty('elapsedTimeMs');
    expect(result.elapsedTimeMs).toBe(SLA_THRESHOLD_MS);
    expect(result).toHaveProperty('status');
    expect(['stable', 'fallback_active']).toContain(result.status);

    // (4) ログ出力が正確に記録されること
    expect(result).toHaveProperty('logEntry');
    expect(result.logEntry).toHaveProperty('timestamp');
    expect(result.logEntry).toHaveProperty('processId');
    expect(result.logEntry.processId).toBe('proc-shopping-001');
    expect(result.logEntry).toHaveProperty('delayDetected');
    expect(result.logEntry.delayDetected).toBe(true);
    expect(result.logEntry).toHaveProperty('elapsedMs');
    expect(result.logEntry.elapsedMs).toBe(SLA_THRESHOLD_MS);
  });

  // 追加: SLA閾値未満（遅延なし）
  test('経過時間がSLA閾値未満の場合は遅延判定されない', () => {
    const SLA_THRESHOLD_MS = 5000;
    const START_TIMESTAMP = new Date('2024-01-15T09:00:00Z').getTime();
    const WITHIN_SLA_TIMESTAMP = START_TIMESTAMP + SLA_THRESHOLD_MS - 1;

    const input = {
      processStartTime: START_TIMESTAMP,
      currentTime: WITHIN_SLA_TIMESTAMP,
      slaThresholdMs: SLA_THRESHOLD_MS,
      processId: 'proc-shopping-002',
    };

    const result = detectShoppingListGenerationSLADelay(input);

    expect(result.isDelayed).toBe(false);
    expect(result.shouldExecuteFallback).toBe(false);
    expect(result.elapsedTimeMs).toBe(SLA_THRESHOLD_MS - 1);
    expect(result.logEntry.delayDetected).toBe(false);
  });

  // 追加: SLA閾値超過（明らかな遅延）
  test('経過時間がSLA閾値を超過した場合は遅延判定される', () => {
    const SLA_THRESHOLD_MS = 5000;
    const START_TIMESTAMP = new Date('2024-01-15T09:00:00Z').getTime();
    const EXCEEDED_TIMESTAMP = START_TIMESTAMP + SLA_THRESHOLD_MS + 500;

    const input = {
      processStartTime: START_TIMESTAMP,
      currentTime: EXCEEDED_TIMESTAMP,
      slaThresholdMs: SLA_THRESHOLD_MS,
      processId: 'proc-shopping-003',
    };

    const result = detectShoppingListGenerationSLADelay(input);

    expect(result.isDelayed).toBe(true);
    expect(result.shouldExecuteFallback).toBe(true);
    expect(result.elapsedTimeMs).toBe(SLA_THRESHOLD_MS + 500);
    expect(result.logEntry.delayDetected).toBe(true);
  });

  // 追加: ログ記録の整合性検証
  test('遅延検知時のログエントリに全必須フィールドが含まれる', () => {
    const SLA_THRESHOLD_MS = 5000;
    const START_TIMESTAMP = new Date('2024-01-15T09:00:00Z').getTime();
    const BOUNDARY_TIMESTAMP = START_TIMESTAMP + SLA_THRESHOLD_MS;

    const input = {
      processStartTime: START_TIMESTAMP,
      currentTime: BOUNDARY_TIMESTAMP,
      slaThresholdMs: SLA_THRESHOLD_MS,
      processId: 'proc-shopping-log-test',
    };

    const result = detectShoppingListGenerationSLADelay(input);

    const logEntry = result.logEntry;
    expect(logEntry).toBeDefined();
    expect(logEntry.timestamp).toBeDefined();
    expect(typeof logEntry.timestamp).toBe('number');
    expect(logEntry.processId).toBe('proc-shopping-log-test');
    expect(logEntry.delayDetected).toBe(true);
    expect(logEntry.elapsedMs).toBe(SLA_THRESHOLD_MS);
    expect(logEntry.slaThresholdMs).toBe(SLA_THRESHOLD_MS);
  });

  // 追加: 無効な入力でのエラーハンドリング
  test('無効な入力値が渡された場合、適切なエラーをスロー', () => {
    const invalidInput1 = {
      processStartTime: new Date('2024-01-15T09:00:00Z').getTime(),
      currentTime: new Date('2024-01-15T09:00:04Z').getTime(),
      slaThresholdMs: -1000, // 負の閾値は無効
      processId: 'proc-invalid-1',
    };

    expect(() => detectShoppingListGenerationSLADelay(invalidInput1)).toThrow(
      /閾値/
    );
  });

  // 追加: currentTime < processStartTime のケース
  test('現在時刻が開始時刻より前の場合、適切なエラーをスロー', () => {
    const START_TIMESTAMP = new Date('2024-01-15T09:00:00Z').getTime();
    const EARLIER_TIMESTAMP = START_TIMESTAMP - 1000;

    const invalidInput = {
      processStartTime: START_TIMESTAMP,
      currentTime: EARLIER_TIMESTAMP,
      slaThresholdMs: 5000,
      processId: 'proc-invalid-2',
    };

    expect(() => detectShoppingListGenerationSLADelay(invalidInput)).toThrow(
      /時刻/
    );
  });
});