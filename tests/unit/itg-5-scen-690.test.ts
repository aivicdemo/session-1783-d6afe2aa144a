import { decideNextVerificationTiming } from '../../src/logic/it-7-2-1';

describe('検証実行タイミング自動決定 - 検証頻度が最高値に達した場合の維持確認', () => {
  test('SCEN-690: 検証頻度が最高値（1日1回）に達した後、次回タイミング決定でも最高値を維持し、タイミング間隔が1日で一定に保たれること', () => {
    // 初期状態：検証実行回数0、検証頻度0回/日
    const initialState = {
      lastVerificationDate: new Date('2024-01-01T09:00:00Z'),
      verificationCount: 0,
      currentFrequencyPerDay: 0,
      maxFrequencyPerDay: 1,
      minIntervalDays: 1,
      maxIntervalDays: 90,
    };

    // ステップ1: 検証頻度を段階的に増加させ、最高値（1日1回）に到達させるシナリオを実行
    const step1_result = decideNextVerificationTiming({
      ...initialState,
      verificationCount: 10,
      currentFrequencyPerDay: 0.5,
    });

    expect(step1_result.nextVerificationDate).toBeDefined();
    expect(typeof step1_result.nextVerificationDate).toBe('string');

    // ステップ2: 検証頻度が最高値（1日1回）に到達
    const step2_result = decideNextVerificationTiming({
      ...initialState,
      lastVerificationDate: new Date('2024-01-10T09:00:00Z'),
      verificationCount: 100,
      currentFrequencyPerDay: 1,
    });

    expect(step2_result.decidedFrequencyPerDay).toBe(1);
    expect(step2_result.decidedIntervalDays).toBe(1);

    // ステップ3: 最高値に達した状態で次回タイミング決定を実行
    const step3_result = decideNextVerificationTiming({
      ...initialState,
      lastVerificationDate: new Date('2024-01-10T09:00:00Z'),
      verificationCount: 100,
      currentFrequencyPerDay: 1,
    });

    expect(step3_result.decidedFrequencyPerDay).toBe(1);
    expect(step3_result.decidedIntervalDays).toBe(1);
    const step3_nextDate = new Date(step3_result.nextVerificationDate);
    const step3_lastDate = new Date('2024-01-10T09:00:00Z');
    const step3_diffMs = step3_nextDate.getTime() - step3_lastDate.getTime();
    const step3_diffDays = step3_diffMs / (1000 * 60 * 60 * 24);
    expect(step3_diffDays).toBe(1);

    // ステップ4: 複数回のタイミング決定を繰り返し実行（1回目）
    const iteration1_result = decideNextVerificationTiming({
      ...initialState,
      lastVerificationDate: new Date('2024-01-11T09:00:00Z'),
      verificationCount: 100,
      currentFrequencyPerDay: 1,
    });

    expect(iteration1_result.decidedFrequencyPerDay).toBe(1);
    expect(iteration1_result.decidedIntervalDays).toBe(1);
    const iter1_nextDate = new Date(iteration1_result.nextVerificationDate);
    const iter1_lastDate = new Date('2024-01-11T09:00:00Z');
    const iter1_diffMs = iter1_nextDate.getTime() - iter1_lastDate.getTime();
    const iter1_diffDays = iter1_diffMs / (1000 * 60 * 60 * 24);
    expect(iter1_diffDays).toBe(1);

    // ステップ5: 複数回のタイミング決定を繰り返し実行（2回目）
    const iteration2_result = decideNextVerificationTiming({
      ...initialState,
      lastVerificationDate: new Date('2024-01-12T09:00:00Z'),
      verificationCount: 100,
      currentFrequencyPerDay: 1,
    });

    expect(iteration2_result.decidedFrequencyPerDay).toBe(1);
    expect(iteration2_result.decidedIntervalDays).toBe(1);
    const iter2_nextDate = new Date(iteration2_result.nextVerificationDate);
    const iter2_lastDate = new Date('2024-01-12T09:00:00Z');
    const iter2_diffMs = iter2_nextDate.getTime() - iter2_lastDate.getTime();
    const iter2_diffDays = iter2_diffMs / (1000 * 60 * 60 * 24);
    expect(iter2_diffDays).toBe(1);

    // ステップ6: 複数回のタイミング決定を繰り返し実行（3回目）
    const iteration3_result = decideNextVerificationTiming({
      ...initialState,
      lastVerificationDate: new Date('2024-01-13T09:00:00Z'),
      verificationCount: 100,
      currentFrequencyPerDay: 1,
    });

    expect(iteration3_result.decidedFrequencyPerDay).toBe(1);
    expect(iteration3_result.decidedIntervalDays).toBe(1);
    const iter3_nextDate = new Date(iteration3_result.nextVerificationDate);
    const iter3_lastDate = new Date('2024-01-13T09:00:00Z');
    const iter3_diffMs = iter3_nextDate.getTime() - iter3_lastDate.getTime();
    const iter3_diffDays = iter3_diffMs / (1000 * 60 * 60 * 24);
    expect(iter3_diffDays).toBe(1);

    // 最終検証: すべてのイテレーションで検証頻度が最高値を超えず、タイミング間隔が1日で一定に保たれていることを確認
    expect(step2_result.decidedFrequencyPerDay).toBeLessThanOrEqual(
      step2_result.maxFrequencyPerDay
    );
    expect(step3_result.decidedFrequencyPerDay).toBeLessThanOrEqual(
      step3_result.maxFrequencyPerDay
    );
    expect(iteration1_result.decidedFrequencyPerDay).toBeLessThanOrEqual(
      iteration1_result.maxFrequencyPerDay
    );
    expect(iteration2_result.decidedFrequencyPerDay).toBeLessThanOrEqual(
      iteration2_result.maxFrequencyPerDay
    );
    expect(iteration3_result.decidedFrequencyPerDay).toBeLessThanOrEqual(
      iteration3_result.maxFrequencyPerDay
    );

    expect(step3_diffDays).toBe(1);
    expect(iter1_diffDays).toBe(1);
    expect(iter2_diffDays).toBe(1);
    expect(iter3_diffDays).toBe(1);
  });
});