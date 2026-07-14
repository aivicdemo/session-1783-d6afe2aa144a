import { calculateNextVerificationTiming } from '../../src/logic/it-7-2-1';

describe('献立生成の週次集計と改善効果定量比較', () => {
  // SCEN-691: [error] 検証実行タイミング自動決定 - 前回検証からの経過時間が不正な場合、デフォルト検証頻度で計算する
  test('前回検証時刻が不正な値の場合、デフォルト検証頻度で次回実行タイミングを再計算する', () => {
    const currentTime = new Date('2024-01-15T10:00:00Z');
    const defaultVerificationFrequencyDays = 30;

    // テストケース1: lastVerificationTime が null の場合
    const resultWithNull = calculateNextVerificationTiming({
      lastVerificationTime: null,
      currentTime: currentTime,
      defaultVerificationFrequencyDays: defaultVerificationFrequencyDays,
    });

    const expectedNextTimingWithNull = new Date('2024-02-14T10:00:00Z');
    expect(resultWithNull.nextVerificationTiming).toEqual(expectedNextTimingWithNull);
    expect(resultWithNull.usedDefaultFrequency).toBe(true);
    expect(resultWithNull.reason).toMatch(/デフォルト/);

    // テストケース2: lastVerificationTime が undefined の場合
    const resultWithUndefined = calculateNextVerificationTiming({
      lastVerificationTime: undefined,
      currentTime: currentTime,
      defaultVerificationFrequencyDays: defaultVerificationFrequencyDays,
    });

    expect(resultWithUndefined.nextVerificationTiming).toEqual(expectedNextTimingWithNull);
    expect(resultWithUndefined.usedDefaultFrequency).toBe(true);

    // テストケース3: lastVerificationTime が無効な日付文字列の場合
    const resultWithInvalidDate = calculateNextVerificationTiming({
      lastVerificationTime: 'invalid-date' as any,
      currentTime: currentTime,
      defaultVerificationFrequencyDays: defaultVerificationFrequencyDays,
    });

    expect(resultWithInvalidDate.nextVerificationTiming).toEqual(expectedNextTimingWithNull);
    expect(resultWithInvalidDate.usedDefaultFrequency).toBe(true);
    expect(resultWithInvalidDate.reason).toMatch(/不正な時刻/);

    // テストケース4: lastVerificationTime が負の値の場合
    const resultWithNegativeValue = calculateNextVerificationTiming({
      lastVerificationTime: new Date('1970-01-01T00:00:00Z'),
      currentTime: currentTime,
      defaultVerificationFrequencyDays: defaultVerificationFrequencyDays,
    });

    expect(resultWithNegativeValue.nextVerificationTiming).toEqual(expectedNextTimingWithNull);
    expect(resultWithNegativeValue.usedDefaultFrequency).toBe(true);

    // テストケース5: lastVerificationTime が未来の値の場合
    const futureTime = new Date('2025-01-15T10:00:00Z');
    const resultWithFutureTime = calculateNextVerificationTiming({
      lastVerificationTime: futureTime,
      currentTime: currentTime,
      defaultVerificationFrequencyDays: defaultVerificationFrequencyDays,
    });

    expect(resultWithFutureTime.nextVerificationTiming).toEqual(expectedNextTimingWithNull);
    expect(resultWithFutureTime.usedDefaultFrequency).toBe(true);
    expect(resultWithFutureTime.reason).toMatch(/経過時間/);

    // テストケース6: デフォルト検証頻度の値が不正な場合
    const resultWithInvalidFrequency = calculateNextVerificationTiming({
      lastVerificationTime: new Date('2023-12-15T10:00:00Z'),
      currentTime: currentTime,
      defaultVerificationFrequencyDays: -5,
    });

    expect(resultWithInvalidFrequency.usedDefaultFrequency).toBe(true);
    expect(resultWithInvalidFrequency.fallbackFrequencyDays).toBe(30); // フォールバック値
    const expectedFallback = new Date('2024-02-14T10:00:00Z');
    expect(resultWithInvalidFrequency.nextVerificationTiming).toEqual(expectedFallback);
  });
});