import { calculateCookingTimeReductionRate } from '../../src/logic/it-7-2-1';

describe('セグメント別調理時間短縮実現度分析', () => {
  // SCEN-932: [error] セグメント別調理時間短縮実現度分析 - 目標調理時間がゼロの場合、ゼロ除算エラーを適切に処理して例外をスロー
  test('目標調理時間がゼロの場合、目標調理時間がゼロです例外をスロー', () => {
    const targetCookingTimeMinutes = 0;
    const actualCookingTimeMinutes = 25;

    expect(() =>
      calculateCookingTimeReductionRate({
        targetCookingTimeMinutes,
        actualCookingTimeMinutes,
      })
    ).toThrow(/目標調理時間がゼロ/);
  });

  test('目標調理時間が正の値かつ実績調理時間が0の場合、短縮実現度は100%', () => {
    const targetCookingTimeMinutes = 30;
    const actualCookingTimeMinutes = 0;

    const result = calculateCookingTimeReductionRate({
      targetCookingTimeMinutes,
      actualCookingTimeMinutes,
    });

    expect(result).toBe(100);
  });

  test('目標調理時間が30分、実績調理時間が15分の場合、短縮実現度は50%', () => {
    const targetCookingTimeMinutes = 30;
    const actualCookingTimeMinutes = 15;

    const result = calculateCookingTimeReductionRate({
      targetCookingTimeMinutes,
      actualCookingTimeMinutes,
    });

    expect(result).toBe(50);
  });

  test('目標調理時間が30分、実績調理時間が30分の場合、短縮実現度は0%', () => {
    const targetCookingTimeMinutes = 30;
    const actualCookingTimeMinutes = 30;

    const result = calculateCookingTimeReductionRate({
      targetCookingTimeMinutes,
      actualCookingTimeMinutes,
    });

    expect(result).toBe(0);
  });

  test('目標調理時間が30分、実績調理時間が45分の場合、短縮実現度は-50%（オーバー）', () => {
    const targetCookingTimeMinutes = 30;
    const actualCookingTimeMinutes = 45;

    const result = calculateCookingTimeReductionRate({
      targetCookingTimeMinutes,
      actualCookingTimeMinutes,
    });

    expect(result).toBe(-50);
  });

  test('負の目標調理時間が渡された場合、無効な目標調理時間例外をスロー', () => {
    const targetCookingTimeMinutes = -10;
    const actualCookingTimeMinutes = 15;

    expect(() =>
      calculateCookingTimeReductionRate({
        targetCookingTimeMinutes,
        actualCookingTimeMinutes,
      })
    ).toThrow(/無効な目標調理時間/);
  });

  test('負の実績調理時間が渡された場合、無効な実績調理時間例外をスロー', () => {
    const targetCookingTimeMinutes = 30;
    const actualCookingTimeMinutes = -5;

    expect(() =>
      calculateCookingTimeReductionRate({
        targetCookingTimeMinutes,
        actualCookingTimeMinutes,
      })
    ).toThrow(/無効な実績調理時間/);
  });
});